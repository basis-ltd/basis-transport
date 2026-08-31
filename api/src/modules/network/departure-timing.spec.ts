import { applyDepartureTiming, MIN_TRANSFER_SECONDS } from './departure-timing';
import { snapshot, access, pattern } from './network.fixtures';
import { searchJourneys, rideLeg } from './journey-engine';
import type { Journey, NetworkPattern } from './network.types';
import { serviceDayStart } from './service-calendar';

const options = {
  maxTransfers: 2,
  preference: 'fewest_transfers' as const,
  departureAt: '2026-08-30T08:00:00+02:00',
};
function scheduled(p: NetworkPattern, departures: number[]): NetworkPattern {
  p.service = {
    ...p.service,
    validFrom: '2026-08-30',
    validTo: '2026-08-30',
    timezone: 'Africa/Kigali',
    timetable: {
      departures,
      verified: true,
      sourceUrl: 'https://example.org/timetable',
    },
  };
  return p;
}
const hours = (h: number, m = 0) => h * 3600 + m * 60;

describe('Verified departure planning', () => {
  it.each(['access', 'egress'])(
    'keeps total arrival unknown when %s walking time is unchecked',
    (end) => {
      const p = scheduled(pattern('101', ['A', 'B']), [hours(8, 5)]);
      const origin = access('A', 60),
        destination = access('B', 60);
      const unchecked =
        end === 'access' ? origin.get('A')! : destination.get('B')!;
      unchecked.durationSeconds = null;
      unchecked.quality = 'unverified-access';
      const data = { patterns: [p], transfers: [] };
      const result = searchJourneys(data, origin, destination, options)
        .journeys[0];
      expect(result).toMatchObject({
        durationSeconds: null,
        arrivalAt: null,
        timingStatus: 'unknown',
      });
      const timed = applyDepartureTiming(
        result,
        new Map([[p.id, p]]),
        new Date(options.departureAt)
      );
      expect(timed).toMatchObject({
        durationSeconds: null,
        arrivalAt: null,
        timingStatus: 'unknown',
      });
    }
  );
  it('never promotes historical relative times or headways into a schedule or total', () => {
    const data = snapshot();
    data.patterns.forEach(
      (p) =>
        (p.service.windows = [
          { startSeconds: 0, endSeconds: 86400, headwaySeconds: 600 },
        ])
    );
    const journey = searchJourneys(data, access('A'), access('F'), options)
      .journeys[0];
    expect(journey).toMatchObject({
      timingStatus: 'unknown',
      durationSeconds: null,
      arrivalAt: null,
    });
    expect(
      journey
        .steps!.filter((s) => s.kind === 'wait')
        .every(
          (s) => s.timing.status === 'unknown' && s.timing.seconds === null
        )
    ).toBe(true);
  });

  it('includes endpoint walks, actual waits and rides in the complete total', () => {
    const p = scheduled(pattern('101', ['A', 'B']), [hours(8, 5)]);
    const result = searchJourneys(
      { patterns: [p], transfers: [] },
      access('A', 60),
      access('B', 60),
      options
    ).journeys[0];
    expect(result.durationSeconds).toBe(480);
    expect(result.arrivalAt).toBe('2026-08-30T06:08:00.000Z');
    const wait = result.steps!.find((s) => s.kind === 'wait')!;
    expect(wait.timing).toMatchObject({ status: 'scheduled', seconds: 240 });
    expect(wait.text).not.toMatch(/timing is unknown/);
  });

  it('uses independent trip starts and selects the next departure after a missed transfer', () => {
    const first = scheduled(pattern('101', ['A', 'B']), [hours(8)]);
    const second = scheduled(pattern('202', ['B', 'C']), [
      hours(8, 3),
      hours(8, 10),
    ]);
    const result = searchJourneys(
      { patterns: [first, second], transfers: [] },
      access('A'),
      access('C'),
      options
    ).journeys[0];
    const rides = result.legs.filter((l) => l.kind === 'ride');
    expect(rides[1].timing?.departureAt).toBe('2026-08-30T06:10:00.000Z');
    expect(result.durationSeconds).toBe(720);
    expect(MIN_TRANSFER_SECONDS).toBe(120);
    second.service.timetable!.departures = [hours(8, 3)];
    expect(
      searchJourneys(
        { patterns: [first, second], transfers: [] },
        access('A'),
        access('C'),
        options
      ).journeys
    ).toEqual([]);
  });

  it('checks service when each boarding happens, including previous service-day overnight trips', () => {
    const p = scheduled(pattern('night', ['A', 'B']), [hours(25)]);
    const result = searchJourneys(
      { patterns: [p], transfers: [] },
      access('A'),
      access('B'),
      { ...options, departureAt: '2026-08-31T00:55:00+02:00' }
    ).journeys[0];
    expect(result.durationSeconds).toBe(420);
    expect(result.legs[0]).toMatchObject({
      timing: {
        serviceDate: '2026-08-30',
        departureAt: '2026-08-30T23:00:00.000Z',
      },
    });
    p.service.exceptions = [{ date: '2026-08-30', added: false }];
    expect(
      searchJourneys(
        { patterns: [p], transfers: [] },
        access('A'),
        access('B'),
        { ...options, departureAt: '2026-08-31T00:55:00+02:00' }
      ).journeys
    ).toEqual([]);
  });

  it('does not lose a usable fourth route to top-three filtering before schedule evaluation', () => {
    const patterns = [1, 2, 3, 4].map((n) =>
      scheduled(pattern(String(n), ['A', 'B']), [hours(n === 4 ? 9 : 7)])
    );
    const result = searchJourneys(
      { patterns, transfers: [] },
      access('A'),
      access('B'),
      options
    );
    expect(result.journeys).toHaveLength(1);
    expect(result.journeys[0].legs[0]).toMatchObject({ routeId: '4' });
  });

  it('does not use verified schedules when the dataset is historical', () => {
    const p = scheduled(pattern('101', ['A', 'B']), [hours(7)]);
    const result = searchJourneys(
      { patterns: [p], transfers: [] },
      access('A'),
      access('B'),
      { ...options, allowScheduled: false }
    );
    expect(result.journeys[0]).toMatchObject({
      durationSeconds: null,
      timingStatus: 'unknown',
    });
  });

  it('propagates unknown waits downstream instead of asserting a feasible timed connection', () => {
    const first = pattern('101', ['A', 'B']);
    const second = scheduled(pattern('202', ['B', 'C']), [hours(8)]);
    const result = searchJourneys(
      { patterns: [first, second], transfers: [] },
      access('A'),
      access('C'),
      options
    ).journeys[0];
    expect(result.durationSeconds).toBeNull();
    expect(
      result.legs
        .filter((l) => l.kind === 'ride')
        .every((l) => l.timing?.status === 'unknown')
    ).toBe(true);
  });

  it('computes a service day using its own timezone including DST', () => {
    expect(
      new Date(serviceDayStart('2026-08-30', 'Africa/Kigali')).toISOString()
    ).toBe('2026-08-29T22:00:00.000Z');
    expect(
      new Date(serviceDayStart('2026-03-08', 'America/New_York')).toISOString()
    ).toBe('2026-03-08T04:00:00.000Z');
  });

  it('does not double count timetable dwell at the boarding stop', () => {
    const p = scheduled(pattern('101', ['A', 'B']), [hours(8)]);
    p.stops[0].departureElapsedSeconds = 60;
    const journey: Journey = {
      id: 'dwell',
      legs: [rideLeg(p, 0, 1)],
      transfers: 0,
      walkingMeters: 0,
      ridingMeters: 10,
      durationSeconds: null,
      fareRwf: null,
    };
    const timed = applyDepartureTiming(
      journey,
      new Map([[p.id, p]]),
      new Date(options.departureAt)
    )!;
    expect(timed.durationSeconds).toBe(120);
    expect(timed.legs[0]).toMatchObject({
      durationSeconds: 60,
      timing: { waitSeconds: 60 },
    });
  });
});
