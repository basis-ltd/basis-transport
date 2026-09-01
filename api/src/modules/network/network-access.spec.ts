import { DataSource } from 'typeorm';
import { NetworkService } from './network.service';
import { WalkingProviderUnavailable, WalkingService } from './walking.service';
import { NetworkDataset } from '../../entities/networkDataset.entity';
import { NetworkQueryDto, PlanJourneyDto } from './network.dto';
import { snapshot } from './network.fixtures';
import { distance } from './geo';
import {
  ECOFLEET_PUBLISHED_ROUTE_LABELS,
  ecofleetHubId,
} from './ecofleet-overlay';
import type { ResolvedLocation } from './network.types';

function publishedHistoric(): NetworkDataset {
  return {
    id: 'published-historic',
    version: 'dt4a-test',
    source: 'dt4a-2019',
    sourceUrl: 'https://example.org/gtfs',
    checksum: 'test',
    status: 'published',
    verification: 'historic',
    rightsStatus: 'unclear',
    rightsEvidence: '',
    verificationEvidence: '',
    validFrom: '2019-02-25',
    validTo: '2021-02-25',
    importedAt: new Date('2026-08-30T00:00:00Z'),
    publishedAt: new Date('2026-08-30T00:00:00Z'),
    snapshot: snapshot(),
    issues: [],
  } as NetworkDataset;
}

function serviceFor(dataset: NetworkDataset) {
  const repo = {
    findOne: jest.fn().mockResolvedValue({ id: dataset.id }),
    findOneByOrFail: jest.fn().mockResolvedValue(dataset),
  };
  const db = {
    getRepository: jest.fn().mockReturnValue(repo),
    query: jest.fn().mockResolvedValue([]),
  };
  return new NetworkService(
    db as unknown as DataSource,
    {
      route: jest.fn(async (from: ResolvedLocation, to: ResolvedLocation) => {
        if (distance(from.coordinates, to.coordinates) < 1)
          return {
            kind: 'walk' as const,
            from,
            to,
            distanceMeters: 0,
            durationSeconds: 0,
            geometry: [from.coordinates, to.coordinates],
            instructions: [],
            quality: 'pedestrian-route' as const,
          };
        throw new WalkingProviderUnavailable();
      }),
      health: () => 'unconfigured',
      metrics: () => ({}),
    } as unknown as WalkingService
  );
}

describe('Published network access', () => {
  const previous = process.env.NETWORK_ACCESS;
  afterEach(() => {
    if (previous === undefined) delete process.env.NETWORK_ACCESS;
    else process.env.NETWORK_ACCESS = previous;
  });

  it('serves a published snapshot when NETWORK_ACCESS is not internal', async () => {
    delete process.env.NETWORK_ACCESS;
    const dataset = publishedHistoric();
    const network = serviceFor(dataset);
    const served = await network.dataset();
    expect(served.id).toBe(dataset.id);
    expect(served.verification).toBe('historic');
    const status = await network.status();
    expect(status.ready).toBe(true);
    expect(JSON.stringify(status)).not.toMatch(/restricted to local testing/i);
    expect(JSON.stringify(status)).not.toMatch(
      /restricted to internal testing/i
    );
    const map = await network.map({});
    const names = [
      ...map.filters.routes.map((r) => r.name),
      ...map.patterns.map((p) => p.routeName ?? ''),
    ].join('\n');
    for (const label of ECOFLEET_PUBLISHED_ROUTE_LABELS) {
      expect(names).toContain(label);
    }
    expect(
      map.patterns.some((p) => p.routeId.startsWith('ecofleet-corridor-'))
    ).toBe(true);
    expect(served.snapshot.patterns.some((p) => p.routeId === '101')).toBe(
      true
    );

    const query = Object.assign(new NetworkQueryDto(), { size: 100 });
    const routes = await network.listRoutes(query);
    const stops = await network.listStops(
      Object.assign(new NetworkQueryDto(), { q: 'Remera Terminal', size: 20 })
    );
    expect(JSON.stringify(routes)).not.toMatch(/restricted to local testing/i);
    expect(JSON.stringify(stops)).not.toMatch(
      /restricted to internal testing/i
    );
    expect(routes.rows.map((r) => r.longName)).toEqual(
      expect.arrayContaining(ECOFLEET_PUBLISHED_ROUTE_LABELS)
    );
    expect(
      stops.rows.some((s) => s.id === ecofleetHubId('Remera Terminal'))
    ).toBe(true);

    const downtown = ecofleetHubId('Downtown Terminal');
    const remera = served.snapshot.patterns
      .flatMap((p) => p.stops)
      .find((s) => s.id === ecofleetHubId('Remera Terminal'))!;
    const input = Object.assign(new PlanJourneyDto(), {
      origin: {
        latitude: remera.coordinates[1] - 0.0002,
        longitude: remera.coordinates[0] - 0.0002,
      },
      destination: { stopId: downtown },
    });
    const first = await network.plan(input);
    const second = await network.plan(input);
    const connecting = served.snapshot.patterns.find(
      (p) =>
        p.routeName === 'Remera ↔ Downtown' &&
        p.stops[0].id === ecofleetHubId('Remera Terminal')
    )!;
    for (const result of [first, second]) {
      expect(['ok', 'service_timing_unknown']).toContain(result.status);
      expect(JSON.stringify(result)).not.toMatch(
        /restricted to local testing/i
      );
      expect(JSON.stringify(result)).not.toMatch(
        /restricted to internal testing/i
      );
      const ride = result.journeys
        .flatMap((journey) => journey.legs)
        .find((leg) => leg.kind === 'ride');
      expect(ride).toMatchObject({
        kind: 'ride',
        routeNumber: connecting.routeNumber,
        headsign: connecting.headsign,
      });
    }
  });
});
