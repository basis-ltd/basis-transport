import { buildPassengerSteps } from './passenger-steps';
import type { Coordinates } from './network.types';
import {
  snapshot,
  access,
  pattern,
  reviewedFixtureTransfer,
} from './network.fixtures';
import { searchJourneys } from './journey-engine';

const options = { maxTransfers: 2, preference: 'fewest_transfers' as const };

describe('Passenger steps', () => {
  it('associates boarding fares with physical ride legs after walking', () => {
    const p = pattern('101', ['A', 'B']);
    p.fare = {
      amount: 350,
      currency: 'RWF',
      sourceUrl: 'https://example.org/fare',
      validFrom: '2020-01-01',
      validTo: '2099-01-01',
      verified: true,
    };
    const journey = searchJourneys(
      { patterns: [p], transfers: [] },
      access('A', 100),
      access('B'),
      options
    ).journeys[0];
    expect(journey.fareQuote?.legFares[0].legIndex).toBe(1);
    expect(journey.steps?.find((s) => s.kind === 'board')).toMatchObject({
      fareAmount: 350,
    });
    expect(journey.steps?.filter((s) => s.fareAmount !== null)).toHaveLength(1);
  });
  it('generates wait, board, ride, alight, and arrive steps for a direct journey', () => {
    const { journeys } = searchJourneys(
      snapshot(),
      access('A'),
      access('C'),
      options
    );
    const steps = journeys[0].steps ?? buildPassengerSteps(journeys[0]);
    const kinds = steps.map((s) => s.kind);
    expect(kinds).toEqual(['wait', 'board', 'ride', 'alight', 'arrive']);
    expect(steps.find((s) => s.kind === 'wait')?.text).toMatch(
      /Service timing is unknown/
    );
    expect(steps.find((s) => s.kind === 'board')?.text).toMatch(
      /Board route 101/
    );
    expect(steps.find((s) => s.kind === 'alight')?.text).toMatch(
      /Get off at C/
    );
  });

  it('includes transfer steps between rides', () => {
    const data = {
      patterns: [
        pattern('101', ['A', 'B']),
        pattern('202', ['C', 'D', 'E']),
        pattern('303', ['E', 'F']),
      ],
      transfers: [
        {
          id: 't-b-c',
          fromStopId: 'B',
          toStopId: 'C',
          distanceMeters: 80,
          durationSeconds: 120,
          geometry: [
            [30.0066, -1.95],
            [30.0067, -1.95],
          ] as Coordinates[],
          reviewed: true,
          source: 'field inspection',
        },
      ],
    };
    data.transfers = data.transfers.map((t) =>
      reviewedFixtureTransfer(data, t)
    ) as typeof data.transfers;
    const { journeys } = searchJourneys(
      data,
      access('A'),
      access('F'),
      options
    );
    const kinds = (journeys[0].steps ?? []).map((s) => s.kind);
    expect(kinds).toContain('transfer');
    expect(kinds.filter((k) => k === 'wait').length).toBeGreaterThanOrEqual(2);
  });

  it('assigns stable step identities', () => {
    const { journeys } = searchJourneys(
      snapshot(),
      access('A'),
      access('C'),
      options
    );
    const ids = (journeys[0].steps ?? []).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toHaveLength(12));
  });
});
