import { DataSource } from 'typeorm';
import { NetworkService } from './network.service';
import { WalkingProviderUnavailable, WalkingService } from './walking.service';
import { NetworkDataset } from '../../entities/networkDataset.entity';
import { PlanJourneyDto } from './network.dto';
import { pattern, snapshot } from './network.fixtures';
import { distance } from './geo';
import type {
  NetworkSnapshot,
  ResolvedLocation,
  WalkLeg,
} from './network.types';

function walk(
  from: ResolvedLocation,
  to: ResolvedLocation,
  metres = 200
): WalkLeg {
  return {
    kind: 'walk',
    from,
    to,
    distanceMeters: metres,
    durationSeconds: metres,
    geometry: [from.coordinates, to.coordinates],
    instructions: ['Follow the footpath.'],
    quality: 'pedestrian-route',
  };
}
function harness(
  data: NetworkSnapshot = snapshot(),
  verification = 'historic'
) {
  const query = jest.fn().mockResolvedValue([]);
  const route = jest.fn(async (from: ResolvedLocation, to: ResolvedLocation) =>
    distance(from.coordinates, to.coordinates) < 1 ? walk(from, to, 0) : null
  );
  const service = new NetworkService(
    { query } as unknown as DataSource,
    { route } as unknown as WalkingService
  );
  jest.spyOn(service, 'dataset').mockResolvedValue({
    id: 'test',
    version: 'test-v1',
    verification,
    sourceUrl: 'https://example.org/fixture',
    snapshot: data,
    validFrom: '2019-01-01',
    validTo: '2021-01-01',
  } as NetworkDataset);
  const plan = (input: Partial<PlanJourneyDto>) =>
    service.plan(Object.assign(new PlanJourneyDto(), input));
  return { plan, route, query };
}

describe('Door-to-door service orchestration', () => {
  it('returns a pedestrian journey outside transit coverage', async () => {
    const h = harness();
    h.route.mockImplementation(async (from, to) => walk(from, to));
    const result = await h.plan({
      origin: { latitude: -1, longitude: 30 },
      destination: { latitude: -1, longitude: 30.002 },
    });
    expect(result.status).toBe('walking_only');
    expect(result.journeys[0].legs).toHaveLength(1);
    expect(result.journeys[0].steps?.map((s) => s.kind)).toEqual([
      'walk',
      'arrive',
    ]);
    expect(result.journeys[0].fareRwf).toBe(0);
    expect(result.journeys[0].legs[0]).toMatchObject({
      from: { coordinates: [30, -1] },
      to: { coordinates: [30.002, -1] },
    });
  });
  it('also evaluates walking between named stops when the buses are disconnected', async () => {
    const h = harness({
      patterns: [pattern('a', ['A', 'B']), pattern('z', ['Y', 'Z'])],
      transfers: [],
    });
    h.route.mockImplementation(async (from, to) =>
      walk(from, to, from.stopId === to.stopId ? 0 : 300)
    );
    const result = await h.plan({
      origin: { stopId: 'A' },
      destination: { stopId: 'Z' },
    });
    expect(result.status).toBe('walking_only');
    expect(result.journeys[0].legs[0]).toMatchObject({
      from: { stopId: 'A' },
      to: { stopId: 'Z' },
    });
  });
  it('does not let failed boarding walks hide a successful direct pedestrian route', async () => {
    const h = harness();
    h.query.mockResolvedValue([{ stop_id: 'A' }, { stop_id: 'C' }]);
    h.route.mockImplementation(async (from, to) => {
      if (from.stopId || to.stopId) throw new WalkingProviderUnavailable();
      return walk(from, to);
    });
    const result = await h.plan({
      origin: { latitude: -1.95, longitude: 30.005 },
      destination: { latitude: -1.95, longitude: 30.007 },
    });
    expect(result.status).toBe('walking_only');
  });
  it('resolves a terminal selection to real boarding points and preserves walking continuity', async () => {
    const data = snapshot();
    data.stopAreas = [
      {
        id: 'area',
        name: 'Terminal',
        aliases: [],
        coordinates: [30.005, -1.95],
        boardingPointIds: ['A'],
      },
    ];
    const h = harness(data);
    h.route.mockImplementation(async (from, to) =>
      walk(from, to, from.stopId === to.stopId ? 0 : 100)
    );
    const result = await h.plan({
      origin: { stopId: 'area' },
      destination: { stopId: 'C' },
    });
    expect(result.status).toBe('ok');
    expect(result.journeys[0].legs[0]).toMatchObject({
      kind: 'walk',
      from: { stopId: 'area' },
      to: { stopId: 'A' },
    });
    expect(result.journeys[0].legs[1]).toMatchObject({
      kind: 'ride',
      board: { id: 'A' },
    });
  });
  it('preserves no-service-at-time instead of overwriting it with no-connection', async () => {
    const p = pattern('a', ['A', 'C']);
    p.service = {
      ...p.service,
      validFrom: '2026-08-30',
      validTo: '2026-08-30',
      timezone: 'Africa/Kigali',
      timetable: {
        departures: [7 * 3600],
        verified: true,
        sourceUrl: 'https://example.org/times',
      },
    };
    const h = harness({ patterns: [p], transfers: [] }, 'verified');
    const result = await h.plan({
      origin: { stopId: 'A' },
      destination: { stopId: 'C' },
      departureAt: '2026-08-30T08:00:00+02:00',
    });
    expect(result.status).toBe('no_service_at_time');
    expect(result.journeys).toEqual([]);
  });
  it('reports unknown service timing for the historic network', async () => {
    const result = await harness().plan({
      origin: { stopId: 'A' },
      destination: { stopId: 'C' },
      departureAt: '2026-08-30T08:00:00+02:00',
    });
    expect(result.status).toBe('service_timing_unknown');
    expect(result.journeys[0].durationSeconds).toBeNull();
  });
  it('distinguishes provider failure, no walking route, and being already there', async () => {
    const h = harness();
    h.route.mockRejectedValue(new WalkingProviderUnavailable());
    const input = {
      origin: { latitude: -1, longitude: 30 },
      destination: { latitude: -1, longitude: 30.002 },
    };
    expect((await h.plan(input)).status).toBe('provider_unavailable');
    h.route.mockResolvedValue(null);
    expect((await h.plan(input)).status).toBe('outside_coverage');
    expect((await h.plan({ ...input, destination: input.origin })).status).toBe(
      'already_at_destination'
    );
  });
});

describe('Arbitrary endpoints and nearest boarding access', () => {
  const network = () => {
    const p = pattern('101', ['A', 'B', 'C']);
    p.stops[0].coordinates = [30.06, -1.95];
    p.stops[1].coordinates = [30.08, -1.95];
    p.stops[2].coordinates = [30.1, -1.95];
    return { patterns: [p], transfers: [] };
  };
  const nearA = { latitude: -1.951, longitude: 30.06 };
  const nearC = { latitude: -1.951, longitude: 30.1 };
  const cases = [
    { origin: nearA, destination: { stopId: 'C' }, kinds: ['walk', 'ride'] },
    { origin: { stopId: 'A' }, destination: nearC, kinds: ['ride', 'walk'] },
    { origin: nearA, destination: nearC, kinds: ['walk', 'ride', 'walk'] },
  ];
  for (const [i, example] of cases.entries()) {
    it(`preserves endpoint coordinates and real walking instructions (case ${i + 1})`, async () => {
      const h = harness(network());
      h.query.mockImplementation(async (_sql, args) => [
        { stop_id: args[1] < 30.08 ? 'A' : 'C' },
      ]);
      h.route.mockImplementation(async (from, to) =>
        walk(from, to, distance(from.coordinates, to.coordinates) < 1 ? 0 : 130)
      );
      const result = await h.plan(example);
      expect(result.journeys[0].legs.map((l) => l.kind)).toEqual(example.kinds);
      const walks = result.journeys[0].legs.filter((l) => l.kind === 'walk');
      expect(
        walks.every(
          (l) =>
            l.quality === 'pedestrian-route' &&
            l.instructions[0] === 'Follow the footpath.'
        )
      ).toBe(true);
      if (!('stopId' in example.origin))
        expect(walks[0].from.coordinates).toEqual([
          nearA.longitude,
          nearA.latitude,
        ]);
      if (!('stopId' in example.destination))
        expect(walks[walks.length - 1].to.coordinates).toEqual([
          nearC.longitude,
          nearC.latitude,
        ]);
    });
    it(`keeps a navigation handoff when walking service is unavailable (case ${i + 1})`, async () => {
      const h = harness(network());
      h.query.mockImplementation(async (_sql, args) => [
        { stop_id: args[1] < 30.08 ? 'A' : 'C' },
      ]);
      h.route.mockImplementation(async (from, to) => {
        if (distance(from.coordinates, to.coordinates) < 1)
          return walk(from, to, 0);
        throw new WalkingProviderUnavailable();
      });
      const result = await h.plan(example);
      expect(result.status).toBe('ok');
      expect(result.journeys[0].legs.map((l) => l.kind)).toEqual(example.kinds);
      const walks = result.journeys[0].legs.filter((l) => l.kind === 'walk');
      for (const leg of walks) {
        expect(leg.quality).toBe('unverified-access');
        expect(leg.geometry).toEqual([]);
        expect(leg.durationSeconds).toBeNull();
        expect(leg.instructions.join(' ')).toContain('Open walking navigation');
      }
      expect(
        result.journeys[0].steps
          ?.filter((s) => s.kind === 'walk')
          .every((s) => s.confidence === 'unknown' && s.timing.seconds === null)
      ).toBe(true);
    });
  }
  it('expands default access to a farther stop, but honors an explicit walking cap', async () => {
    const h = harness(network());
    h.query.mockResolvedValue([{ stop_id: 'A' }]);
    h.route.mockImplementation(async (from, to) =>
      walk(from, to, distance(from.coordinates, to.coordinates) < 1 ? 0 : 1300)
    );
    const input = {
      origin: { latitude: -1.96, longitude: 30.06 },
      destination: { stopId: 'C' },
    };
    const automatic = await h.plan(input);
    expect(automatic.journeys[0].legs[0]).toMatchObject({
      kind: 'walk',
      distanceMeters: 1300,
    });
    expect(automatic.warnings.join(' ')).toContain('more than 800 m');
    expect(
      h.route.mock.calls.filter(
        ([from, to]) => !from.stopId && to.stopId === 'A'
      )
    ).toHaveLength(1);
    h.query.mockClear();
    expect((await h.plan({ ...input, maxWalkMeters: 800 })).journeys).toEqual(
      []
    );
    expect(h.query).toHaveBeenCalledTimes(1);
  });
  it('offers an explicitly unverified handoff when the provider has no mapped footpath', async () => {
    const h = harness(network());
    h.query.mockResolvedValue([{ stop_id: 'A' }]);
    const result = await h.plan({
      origin: nearA,
      destination: { stopId: 'C' },
      maxWalkMeters: 800,
    });
    expect(result.journeys[0].legs[0]).toMatchObject({
      kind: 'walk',
      quality: 'unverified-access',
      geometry: [],
      durationSeconds: null,
    });
    expect(result.warnings.join(' ')).toContain('straight-line minimums');
  });

  it('keeps a directly connected mixed-endpoint stop inside the candidate cap', async () => {
    const decoys = Array.from({ length: 16 }, (_, index) =>
      pattern(`decoy-${index}`, [`D${index}`, `Q${index}`])
    );
    const h = harness({
      patterns: [...decoys, pattern('direct', ['GOOD', 'TARGET'])],
      transfers: [],
    });
    h.query.mockResolvedValue([
      ...decoys.map((p) => ({ stop_id: p.stops[0].id })),
      { stop_id: 'GOOD' },
    ]);
    h.route.mockImplementation(async (from, to) =>
      walk(from, to, distance(from.coordinates, to.coordinates) < 1 ? 0 : 100)
    );

    const result = await h.plan({
      origin: { latitude: -1.951, longitude: 30.06 },
      destination: { stopId: 'TARGET' },
      maxWalkMeters: 800,
    });

    expect(result.journeys[0].legs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'ride', routeNumber: 'direct' }),
      ])
    );
  });

  it('widens a truncated candidate set within the same request', async () => {
    const decoys = Array.from({ length: 16 }, (_, index) =>
      pattern(`decoy-${index}`, [`D${index}`, `Q${index}`])
    );
    const h = harness({
      patterns: [...decoys, pattern('recovered', ['GOOD', 'TARGET'])],
      transfers: [],
    });
    h.query.mockImplementation(async (_sql, args) =>
      args[1] < 30.5
        ? [
            ...decoys.map((p) => ({ stop_id: p.stops[0].id })),
            { stop_id: 'GOOD' },
          ]
        : [{ stop_id: 'TARGET' }]
    );
    h.route.mockImplementation(async (from, to) =>
      walk(from, to, distance(from.coordinates, to.coordinates) < 1 ? 0 : 100)
    );

    const result = await h.plan({
      origin: { latitude: -1.951, longitude: 30.06 },
      destination: { latitude: -1.951, longitude: 30.8 },
      maxWalkMeters: 800,
    });

    expect(result.journeys[0].legs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'ride', routeNumber: 'recovered' }),
      ])
    );
    expect(h.query).toHaveBeenCalledTimes(4);
  });
});
