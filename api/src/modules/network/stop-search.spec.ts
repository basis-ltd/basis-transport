import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { NetworkDataset } from '../../entities/networkDataset.entity';
import { NetworkQueryDto, PlanJourneyDto } from './network.dto';
import { pattern } from './network.fixtures';
import { NetworkService } from './network.service';
import { describeSearchStops, nearbyStopConnections } from './stop-search';
import { WalkingService } from './walking.service';
import type { NetworkSnapshot, ResolvedLocation } from './network.types';

// Synthetic regression: distinct inbound/outbound platforms with similar names.
function fixture() {
  const outbound = pattern('101', ['R-out', 'D-in']);
  outbound.stops[0].name = 'Remera park';
  outbound.stops[0].coordinates = [30.119324, -1.958855];
  outbound.stops[1].name = 'Downtown';
  outbound.stops[1].coordinates = [30.057247, -1.94375];
  outbound.headsign = 'Downtown';
  const inbound = pattern('105', ['Y', 'R-in']);
  inbound.stops[0].coordinates = [30.02, -1.98];
  inbound.stops[1].name = 'Remera';
  inbound.stops[1].coordinates = [30.118961, -1.958687];
  const data: NetworkSnapshot = {
    patterns: [inbound, outbound],
    transfers: [],
  };
  const all = data.patterns.flatMap((p) => p.stops);
  const location = (id: string): ResolvedLocation => {
    const s = all.find((s) => s.id === id)!;
    return { stopId: s.id, name: s.name, coordinates: s.coordinates };
  };
  return { data, all, location, outbound };
}

describe('Directional stop search and explicit recovery', () => {
  it('excludes arrival-only origins and departure-only destinations without merging platforms', () => {
    const { data, all } = fixture();
    expect(describeSearchStops(data, all, 'origin').map((s) => s.id)).toEqual([
      'Y',
      'R-out',
    ]);
    expect(
      describeSearchStops(data, all, 'destination').map((s) => s.id)
    ).toEqual(['R-in', 'D-in']);
    expect(describeSearchStops(data, all)).toHaveLength(4);
    expect(
      describeSearchStops(data, all, 'origin', 'D-in').find(
        (s) => s.id === 'R-out'
      )
    ).toMatchObject({
      services: [{ routeNumber: '101', headsign: 'Downtown' }],
      directConnection: true,
    });
  });
  it('handles repeated occurrences and terminal membership but never infers membership by name', () => {
    const p = pattern('loop', ['A', 'B', 'A', 'C']);
    const data: NetworkSnapshot = {
      patterns: [p],
      transfers: [],
      stopAreas: [
        {
          id: 'terminal',
          name: 'Terminal',
          aliases: [],
          coordinates: p.stops[0].coordinates,
          boardingPointIds: ['C'],
        },
      ],
    };
    expect(
      describeSearchStops(data, p.stops, 'destination', 'B')
        .filter((s) => s.id === 'A')
        .every((s) => s.directConnection)
    ).toBe(true);
    expect(
      describeSearchStops(data, p.stops, 'origin', 'terminal')[0]
        .directConnection
    ).toBe(true);
    expect(
      describeSearchStops(data, p.stops, 'origin', 'unknown')[0]
        .directConnection
    ).toBe(false);
  });
  it('offers the outbound platform as a separate choice, not an invented journey', () => {
    const { data, location } = fixture();
    const options = nearbyStopConnections(
      data,
      location('R-in'),
      location('D-in'),
      800
    );
    expect(options).toHaveLength(1);
    expect(options[0]).toMatchObject({
      origin: { stopId: 'R-out' },
      destination: { stopId: 'D-in' },
      routeNumber: '101',
    });
    expect(options[0].originDistanceMeters).toBeGreaterThan(0);
    expect(options[0].destinationDistanceMeters).toBe(0);
  });
  it('never reverses a pattern, exceeds the radius, or suggests the unchanged pair', () => {
    const { data, location } = fixture();
    expect(
      nearbyStopConnections(data, location('D-in'), location('R-in'), 800)
    ).toEqual([]);
    expect(
      nearbyStopConnections(data, location('R-in'), location('D-in'), 1)
    ).toEqual([]);
    expect(
      nearbyStopConnections(data, location('R-out'), location('D-in'), 800)
    ).toEqual([]);
    data.patterns.forEach((p) => {
      p.enabled = false;
    });
    expect(
      nearbyStopConnections(data, location('R-in'), location('D-in'), 800)
    ).toEqual([]);
  });
  it('bounds and deduplicates alternatives across patterns', () => {
    const { data, location, outbound } = fixture();
    data.patterns.push({ ...outbound, id: 'duplicate' });
    for (let i = 0; i < 10; i++)
      data.patterns.push({
        ...outbound,
        id: `p-${i}`,
        stops: outbound.stops.map((s) => ({ ...s, id: `${s.id}-${i}` })),
      });
    const options = nearbyStopConnections(
      data,
      location('R-in'),
      location('D-in'),
      800
    );
    expect(options).toHaveLength(3);
    expect(
      new Set(options.map((c) => `${c.origin.stopId}-${c.destination.stopId}`))
        .size
    ).toBe(3);
  });
  it('filters and ranks before pagination; planning preserves the selected stops until the user switches', async () => {
    const { data } = fixture();
    const service = new NetworkService(
      {} as DataSource,
      {
        route: async (from: ResolvedLocation, to: ResolvedLocation) => ({
          kind: 'walk',
          from,
          to,
          distanceMeters: 0,
          durationSeconds: 0,
          geometry: [],
          instructions: [],
          quality: 'pedestrian-route',
        }),
      } as unknown as WalkingService
    );
    jest
      .spyOn(service, 'dataset')
      .mockResolvedValue({
        id: 'test',
        version: 'test',
        verification: 'historic',
        sourceUrl: 'https://example.org/synthetic',
        snapshot: data,
      } as NetworkDataset);
    const stops = await service.listStops(
      Object.assign(new NetworkQueryDto(), {
        q: 'Remera',
        endpoint: 'origin',
        otherStopId: 'D-in',
        size: 1,
      })
    );
    expect(stops.totalCount).toBe(1);
    expect(stops.rows[0].id).toBe('R-out');
    const input = Object.assign(new PlanJourneyDto(), {
      origin: { stopId: 'R-in' },
      destination: { stopId: 'D-in' },
    });
    const failed = await service.plan(input);
    expect(failed.status).toBe('no_connection');
    expect(failed.journeys).toEqual([]);
    expect(failed.origin.stopId).toBe('R-in');
    expect(failed.nearbyConnections?.[0].origin.stopId).toBe('R-out');
    const recovered = await service.plan({
      ...input,
      origin: { stopId: failed.nearbyConnections![0].origin.stopId },
    });
    expect(recovered.status).toBe('ok');
    expect(
      recovered.journeys[0].legs.find((l) => l.kind === 'ride')
    ).toMatchObject({
      routeNumber: '101',
      board: { id: 'R-out' },
      alight: { id: 'D-in' },
    });
  });
});
