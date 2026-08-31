import { compareSnapshots } from './network-comparison';
import { pattern, snapshot } from './network.fixtures';
import type { Coordinates } from './network.types';

describe('Import comparison report', () => {
  it('preserves parallel pedestrian path identities and reports changed endpoints', () => {
    const before = snapshot();
    const path = {
      id: 'crossing',
      fromStopId: 'A',
      toStopId: 'B',
      distanceMeters: null,
      durationSeconds: null,
      geometry: [],
      reviewed: false,
      source: '',
    };
    before.transfers = [path, { ...path, id: 'footbridge' }];
    const next = structuredClone(before);
    next.transfers[0].toStopId = 'C';
    const report = compareSnapshots(before, next);
    expect(report.summary.modifiedTransfers).toBe(1);
    expect(report.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'transfer_modified',
          reference: 'crossing',
        }),
      ])
    );
    next.transfers = [next.transfers[1]];
    expect(compareSnapshots(before, next).summary.withdrawnTransfers).toBe(1);
    const added = compareSnapshots(null, before);
    expect(added.summary.addedTransfers).toBe(2);
    expect(
      added.entries.find((e) => e.category === 'transfer_added')?.message
    ).toContain('distance unknown');
  });
  it('includes terminal membership, label and dataset-level fare changes', () => {
    const before = snapshot(),
      next = structuredClone(before);
    next.stopAreas = [
      {
        id: 'terminal',
        name: 'Terminal',
        aliases: ['Alias'],
        coordinates: [30, -1.95],
        boardingPointIds: ['A'],
      },
    ];
    next.patterns[0].stops[0].aliases = ['New alias'];
    next.fareRules = [
      {
        id: 'transfer',
        kind: 'transfer_charge',
        fromRouteId: '101',
        toRouteId: '202',
        amount: 50,
        currency: 'RWF',
        paymentTiming: 'boarding',
        sourceUrl: 'https://example.org/fixture',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        verified: true,
        confidence: 'verified',
      },
    ];
    expect(
      compareSnapshots(before, next).entries.map((e) => e.category)
    ).toEqual(
      expect.arrayContaining([
        'stop_area_added',
        'stop_metadata_changed',
        'fare_changed',
      ])
    );
    const revised = structuredClone(next);
    revised.stopAreas![0].boardingPointIds = ['B'];
    expect(
      compareSnapshots(next, revised).entries.some(
        (e) => e.category === 'stop_area_modified'
      )
    ).toBe(true);
    expect(
      compareSnapshots(next, before).entries.some(
        (e) => e.category === 'stop_area_withdrawn'
      )
    ).toBe(true);
  });
  it('detects moved stops without sequence changes, interior geometry and departure changes', () => {
    const prev = snapshot();
    prev.patterns[0].geometry = [
      [30, -1],
      [30.01, -1],
      [30.02, -1],
    ];
    const next = JSON.parse(JSON.stringify(prev)) as typeof prev;
    next.patterns[0].geometry![1] = [30.01, -1.01];
    next.patterns[0].stops[0].coordinates[0] += 0.001;
    next.patterns[0].service.timezone = 'Africa/Kigali';
    const categories = compareSnapshots(prev, next).entries.map(
      (e) => e.category
    );
    expect(categories).toEqual(
      expect.arrayContaining([
        'boarding_point_moved',
        'geometry_changed',
        'service_changed',
      ])
    );
  });
  it('does not collapse same-direction variants while comparing imports', () => {
    const prev = snapshot();
    const variant = JSON.parse(JSON.stringify(prev.patterns[0]));
    variant.sourceTripId = 'variant';
    prev.patterns.push(variant);
    const next = JSON.parse(JSON.stringify(prev)) as typeof prev;
    next.patterns[0].service.validTo = '2030-01-01';
    expect(
      compareSnapshots(prev, next).entries.some(
        (e) => e.category === 'service_changed'
      )
    ).toBe(true);
  });
  it('detects added and withdrawn routes', () => {
    const prev = snapshot();
    const next = snapshot();
    next.patterns.push(pattern('999', ['X', 'Y']));
    next.patterns = next.patterns.filter((p) => p.routeId !== '303');

    const report = compareSnapshots(prev, next);
    expect(report.routesAdded).toContain('999');
    expect(report.routesWithdrawn).toContain('303');
    expect(report.entries.some((e) => e.category === 'coverage_gained')).toBe(
      true
    );
    expect(report.entries.some((e) => e.category === 'coverage_lost')).toBe(
      true
    );
  });

  it('detects stop sequence, fare, and service changes', () => {
    const prev = snapshot();
    const next = snapshot();
    const p = next.patterns.find((x) => x.routeId === '101')!;
    p.stops = [
      ...p.stops,
      {
        ...p.stops[p.stops.length - 1],
        id: 'D',
        sequence: 3,
        sourceSequence: 4,
        name: 'D',
      },
    ];
    p.fare = {
      amount: 300,
      currency: 'RWF',
      sourceUrl: 'https://example.org/fares',
      validFrom: '2019-01-01',
      validTo: '2030-12-31',
      verified: true,
    };
    p.service.validTo = '2030-12-31';

    const report = compareSnapshots(prev, next);
    expect(
      report.entries.some((e) => e.category === 'stop_sequence_changed')
    ).toBe(true);
    expect(report.entries.some((e) => e.category === 'fare_changed')).toBe(
      true
    );
    expect(report.entries.some((e) => e.category === 'service_changed')).toBe(
      true
    );
  });

  it('detects transfer additions and withdrawals', () => {
    const prev = snapshot();
    const next = {
      ...snapshot(),
      transfers: [
        {
          id: 't1',
          fromStopId: 'B',
          toStopId: 'C',
          distanceMeters: 100,
          durationSeconds: 90,
          geometry: [
            [30, -1.95],
            [30.001, -1.95],
          ] as Coordinates[],
          reviewed: true,
          source: 'field',
        },
      ],
    };
    const report = compareSnapshots(prev, next);
    expect(report.summary.addedTransfers).toBe(1);
    expect(report.entries.some((e) => e.category === 'transfer_added')).toBe(
      true
    );

    const reverse = compareSnapshots(next, prev);
    expect(reverse.summary.withdrawnTransfers).toBe(1);
  });
});
