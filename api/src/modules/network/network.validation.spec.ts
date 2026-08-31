import { validateSnapshot } from './network.validation';
import {
  snapshot,
  reviewedFixtureTransfer,
  pattern,
  access,
} from './network.fixtures';
import { searchJourneys } from './journey-engine';
import type { FareRule, NetworkSnapshot, TransferLink } from './network.types';

const rule: FareRule = {
  id: 'fare',
  kind: 'transfer_charge',
  fromRouteId: '101',
  toRouteId: '202',
  amount: 50,
  currency: 'RWF',
  paymentTiming: 'boarding',
  sourceUrl: 'https://example.org/fixture',
  validFrom: '2026-01-01',
  validTo: '2026-12-31',
  confidence: 'verified',
  verified: true,
};
describe('Snapshot boundary validation', () => {
  it('accepts existing well-formed snapshots without mutating them', () => {
    const data = snapshot(),
      before = JSON.stringify(data);
    expect(validateSnapshot(data)).toEqual([]);
    expect(JSON.stringify(data)).toBe(before);
  });
  it.each([
    null,
    [],
    false,
    {},
    { patterns: [null], transfers: [] },
    { ...snapshot(), fareRules: [null] },
    { ...snapshot(), stopAreas: [null] },
    { ...snapshot(), transfers: [3] },
  ])('rejects malformed nested JSON without throwing (%#)', (value) => {
    expect(validateSnapshot(value).length).toBeGreaterThan(0);
  });
  it('validates global fares, rejects ignored eligibility fields and checks actual section occurrences', () => {
    const data = snapshot();
    data.fareRules = [rule];
    expect(validateSnapshot(data)).toEqual([]);
    data.fareRules = [{ ...rule, fromRouteId: undefined }];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    data.fareRules = [{ ...rule, fromRouteId: 'missing' }];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    data.fareRules = [{ ...rule, passengerCategory: 'child' } as FareRule];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    data.fareRules = [{ ...rule, validFrom: '2026-02-30' }];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    delete data.fareRules;
    data.patterns[0].fareRules = [
      {
        ...rule,
        kind: 'section',
        fromRouteId: undefined,
        toRouteId: undefined,
        fromSequence: 2,
        toSequence: 1,
      },
    ];
    expect(
      validateSnapshot(data).some((e) => e.message.includes('before alighting'))
    ).toBe(true);
  });
  it('validates actual dates, optional fields, integer offsets and bounded error responses', () => {
    for (const change of [
      (d: NetworkSnapshot) => {
        d.patterns[0].service.validFrom = '2026-02-30';
      },
      (d: NetworkSnapshot) => {
        d.patterns[0].stops[0].aliases = [null as never];
      },
      (d: NetworkSnapshot) => {
        d.patterns[0].stops[0].displayNames = [] as never;
      },
      (d: NetworkSnapshot) => {
        d.patterns[0].stops[0].elapsedSeconds = -1;
      },
      (d: NetworkSnapshot) => {
        d.patterns[0].stops[1].sourceSequence = 0;
      },
      (d: NetworkSnapshot) => {
        d.patterns[0].fare = { amount: 200, verified: 'yes' } as never;
      },
    ]) {
      const d = snapshot();
      change(d);
      expect(validateSnapshot(d).length).toBeGreaterThan(0);
    }
    expect(
      validateSnapshot({ patterns: Array(5001).fill(null), transfers: [] })
        .length
    ).toBeLessThanOrEqual(100);
  });
  it('rejects conflicting terminal membership, aliases and stop metadata rather than merging platforms', () => {
    const data = snapshot();
    const area = {
      id: 'terminal',
      name: 'Terminal',
      aliases: [],
      coordinates: [30, -1.95] as [number, number],
      boardingPointIds: ['A'],
    };
    data.stopAreas = [area];
    expect(validateSnapshot(data)).toEqual([]);
    data.stopAreas = [area, { ...area, id: 'other' }];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    data.stopAreas = [{ ...area, aliases: null as never }];
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    data.stopAreas = [area];
    data.patterns[0].stops[0].stopAreaId = 'other';
    expect(validateSnapshot(data).length).toBeGreaterThan(0);
    delete data.patterns[0].stops[0].stopAreaId;
    data.patterns[1].stops[0].zoneId = 'conflicting-zone';
    expect(
      validateSnapshot(data).some((e) =>
        e.message.includes('conflicting metadata')
      )
    ).toBe(true);
  });
});

describe('Evidence-bound transfer safety', () => {
  const data = (): NetworkSnapshot => ({
    patterns: [pattern('101', ['A', 'B']), pattern('202', ['C', 'D'])],
    transfers: [],
  });
  const link = (d: NetworkSnapshot): TransferLink => ({
    id: 'path',
    fromStopId: 'B',
    toStopId: 'C',
    distanceMeters: 50,
    durationSeconds: 60,
    geometry: [
      d.patterns[0].stops[1].coordinates,
      d.patterns[1].stops[0].coordinates,
    ],
    source: '',
    reviewed: false,
  });
  const options = { maxTransfers: 2, preference: 'fewest_transfers' as const };
  it('accepts an incomplete draft but never routes over a checkbox-only approval', () => {
    const d = data();
    d.transfers = [
      { ...link(d), geometry: [], distanceMeters: null, durationSeconds: null },
    ];
    expect(validateSnapshot(d)).toEqual([]);
    d.transfers[0].reviewed = true;
    expect(validateSnapshot(d).length).toBeGreaterThan(0);
    expect(
      searchJourneys(d, access('A'), access('D'), options).journeys
    ).toEqual([]);
  });
  it('routes only the approved direction and invalidates changed path, metrics or boarding coordinates', () => {
    const d = data();
    d.transfers = [reviewedFixtureTransfer(d, link(d))];
    expect(validateSnapshot(d)).toEqual([]);
    expect(
      searchJourneys(d, access('A'), access('D'), options).journeys
    ).toHaveLength(1);
    for (const change of [
      (x: NetworkSnapshot) => {
        x.transfers[0].distanceMeters = 75;
      },
      (x: NetworkSnapshot) => {
        x.transfers[0].instructions = ['Different path'];
      },
      (x: NetworkSnapshot) => {
        x.patterns[1].stops[0].coordinates = [30.0068, -1.95];
      },
      (x: NetworkSnapshot) => {
        x.transfers[0].fromStopId = 'C';
        x.transfers[0].toStopId = 'B';
      },
    ]) {
      const next = structuredClone(d);
      change(next);
      expect(validateSnapshot(next).length).toBeGreaterThan(0);
      expect(
        searchJourneys(next, access('A'), access('D'), options).journeys
      ).toEqual([]);
    }
  });
});
