import { searchJourneys, rideLeg } from './journey-engine';
import { snapshot, pattern, access } from './network.fixtures';
import { validateSnapshot } from './network.validation';

const options = { maxTransfers: 2, preference: 'fewest_transfers' as const };
describe('Directional network planner', () => {
  it('plans a direct connection with exact occurrences, unknown total and fare', () => {
    const [journey] = searchJourneys(
      snapshot(),
      access('A'),
      access('C'),
      options
    );
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
      searchJourneys(snapshot(), access('C'), access('A'), options)
    ).toEqual([]);
    expect(
      searchJourneys(snapshot(), access('A'), access('Z'), options)
    ).toEqual([]);
  });
  it('supports one and two transfers, bounded by preference', () => {
    expect(
      searchJourneys(snapshot(), access('A'), access('E'), options)[0].transfers
    ).toBe(1);
    expect(
      searchJourneys(snapshot(), access('A'), access('F'), options)[0].transfers
    ).toBe(2);
    expect(
      searchJourneys(snapshot(), access('A'), access('F'), {
        ...options,
        maxTransfers: 1,
      })
    ).toEqual([]);
  });
  it('never connects distinct nearby platforms without a reviewed transfer', () => {
    const data = {
      patterns: [pattern('101', ['A', 'B']), pattern('202', ['C', 'D'])],
      transfers: [],
    };
    expect(searchJourneys(data, access('A'), access('D'), options)).toEqual([]);
    const transfer = {
      id: 't',
      fromStopId: 'B',
      toStopId: 'C',
      distanceMeters: 100,
      durationSeconds: 90,
      geometry: [],
      source: 'field inspection',
      reviewed: false,
    };
    expect(
      searchJourneys(
        { ...data, transfers: [transfer] },
        access('A'),
        access('D'),
        options
      )
    ).toEqual([]);
    expect(
      searchJourneys(
        { ...data, transfers: [{ ...transfer, reviewed: true }] },
        access('A'),
        access('D'),
        options
      )[0].walkingMeters
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
      )
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
      searchJourneys(data, origins, access('F'), options)[0].transfers
    ).toBe(0);
    expect(
      searchJourneys(data, origins, access('F'), {
        ...options,
        preference: 'least_walking',
      })[0].walkingMeters
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
