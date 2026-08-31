import { searchJourneys, rideLeg } from './journey-engine';
import {
  snapshot,
  pattern,
  access,
  reviewedFixtureTransfer,
} from './network.fixtures';
import { validateSnapshot } from './network.validation';

const options = { maxTransfers: 2, preference: 'fewest_transfers' as const };
describe('Directional network planner', () => {
  it('prefers checked pedestrian access over a shorter unverified handoff', () => {
    const data = { patterns: [pattern('101', ['A', 'B', 'C'])], transfers: [] };
    const unverified = access('A', 20);
    unverified.get('A')!.quality = 'unverified-access';
    unverified.get('A')!.durationSeconds = null;
    const result = searchJourneys(
      data,
      new Map([...unverified, ...access('B', 200)]),
      access('C'),
      options
    );
    expect(result.journeys[0].walkingMeters).toBe(200);
    expect(
      result.journeys[0].legs.some(
        (leg) => leg.kind === 'walk' && leg.quality === 'unverified-access'
      )
    ).toBe(false);
  });
  it('reports search exhaustion without misclassifying it as no connection', () => {
    const result = searchJourneys(snapshot(), access('A'), access('F'), {
      ...options,
      limits: { expansions: 1 },
    });
    expect(result.searchLimitReached).toBe(true);
    expect(result.journeys).toEqual([]);
    const frontier = searchJourneys(snapshot(), access('A'), access('F'), {
      ...options,
      limits: { frontier: 1 },
    });
    expect(frontier.searchLimitReached).toBe(true);
  });
  it('plans a direct connection with exact occurrences, unknown total and fare', () => {
    const {
      journeys: [journey],
    } = searchJourneys(snapshot(), access('A'), access('C'), options);
    expect(journey).toMatchObject({
      transfers: 0,
      walkingMeters: 0,
      durationSeconds: null,
      fareRwf: null,
    });
    expect(journey.legs[0]).toMatchObject({
      kind: 'ride',
      board: { id: 'A', sequence: 0 },
      alight: { id: 'C', sequence: 2 },
      geometryQuality: 'schematic',
    });
  });
  it('rejects reverse direction and disconnected endpoints', () => {
    expect(
      searchJourneys(snapshot(), access('C'), access('A'), options).journeys
    ).toEqual([]);
    expect(
      searchJourneys(snapshot(), access('A'), access('Z'), options).journeys
    ).toEqual([]);
  });
  it('supports one and two transfers, bounded by preference', () => {
    expect(
      searchJourneys(snapshot(), access('A'), access('E'), options).journeys[0]
        .transfers
    ).toBe(1);
    expect(
      searchJourneys(snapshot(), access('A'), access('F'), options).journeys[0]
        .transfers
    ).toBe(2);
    expect(
      searchJourneys(snapshot(), access('A'), access('F'), {
        ...options,
        maxTransfers: 1,
      }).journeys
    ).toEqual([]);
  });
  it('never connects distinct nearby platforms without a reviewed transfer', () => {
    const data = {
      patterns: [pattern('101', ['A', 'B']), pattern('202', ['C', 'D'])],
      transfers: [],
    };
    expect(
      searchJourneys(data, access('A'), access('D'), options).journeys
    ).toEqual([]);
    const transfer = {
      id: 't',
      fromStopId: 'B',
      toStopId: 'C',
      distanceMeters: 100,
      durationSeconds: 90,
      geometry: [
        data.patterns[0].stops[1].coordinates,
        data.patterns[1].stops[0].coordinates,
      ],
      source: 'field inspection',
      reviewed: false,
    };
    expect(
      searchJourneys(
        { ...data, transfers: [transfer] },
        access('A'),
        access('D'),
        options
      ).journeys
    ).toEqual([]);
    expect(
      searchJourneys(
        { ...data, transfers: [reviewedFixtureTransfer(data, transfer)] },
        access('A'),
        access('D'),
        options
      ).journeys[0].walkingMeters
    ).toBe(100);
    expect(
      searchJourneys(
        {
          ...data,
          transfers: [{ ...transfer, reviewed: true, distanceMeters: 401 }],
        },
        access('A'),
        access('D'),
        options
      ).journeys
    ).toEqual([]);
  });
  it('preserves repeated visits, reports missing times, and ignores expired fares', () => {
    const p = pattern('loop', ['A', 'B', 'A', 'C']);
    p.stops[3].elapsedSeconds = null;
    p.fare = {
      amount: 200,
      currency: 'RWF',
      sourceUrl: 'https://example.org/fare',
      validFrom: '2019-01-01',
      validTo: '2020-01-01',
      verified: true,
    };
    expect(rideLeg(p, 2, 3)).toMatchObject({
      board: { sequence: 2 },
      alight: { sequence: 3 },
      fare: null,
      durationSeconds: null,
    });
    expect(validateSnapshot({ patterns: [p], transfers: [] })).toEqual([]);
  });
  it('ranks fewest transfers before walking and returns distinct alternatives', () => {
    const data = snapshot();
    data.patterns.push(pattern('direct', ['X', 'F']));
    const origins = new Map([...access('A'), ...access('X', 600)]);
    expect(
      searchJourneys(data, origins, access('F'), options).journeys[0].transfers
    ).toBe(0);
    expect(
      searchJourneys(data, origins, access('F'), {
        ...options,
        preference: 'least_walking',
      }).journeys[0].walkingMeters
    ).toBe(0);
  });
  it('rejects malformed nested snapshots without writing anything', () => {
    const data = snapshot();
    data.patterns[0].service.windows = [null as never];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    expect(
      validateSnapshot({ patterns: [null], transfers: [null] }).length
    ).toBeGreaterThan(0);
  });
});
