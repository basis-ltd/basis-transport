import {
  serviceRunsOnDate,
  serviceDateAt,
  serviceDayStart,
} from './service-calendar';
import type {
  Journey,
  NetworkPattern,
  NetworkSnapshot,
  RideLeg,
} from './network.types';

export const MIN_TRANSFER_SECONDS = 120;
// A departure search considers the next 24 hours, not arbitrary future service.
export const PLANNING_HORIZON_SECONDS = 86400;
const unknownTiming: NonNullable<RideLeg['timing']> = {
  status: 'unknown',
  departureAt: null,
  arrivalAt: null,
  waitSeconds: null,
  serviceDate: null,
  timezone: null,
  sourceUrl: null,
};

/** Each ride uses its OWN verified service-day departures. Relative durations
 * and frequency observations alone cannot establish a scheduled connection. */
export function scheduleRide(
  pattern: NetworkPattern,
  ride: RideLeg,
  readyAt: number | null,
  horizon: number,
  minimumTransferSeconds = 0,
  allowScheduled = true
): { ride: RideLeg; arrivalMs: number | null } | null {
  const service = pattern.service;
  const timetable = service.timetable;
  const boardOffset =
    ride.board.departureElapsedSeconds ?? ride.board.elapsedSeconds;
  const alightOffset = ride.alight.elapsedSeconds;
  if (
    !allowScheduled ||
    !timetable?.verified ||
    !service.timezone ||
    readyAt === null ||
    boardOffset === null ||
    alightOffset === null
  ) {
    return { ride: { ...ride, timing: { ...unknownTiming } }, arrivalMs: null };
  }
  if (alightOffset < boardOffset) return null;
  const earliest = readyAt + minimumTransferSeconds * 1000;
  const localDate = serviceDateAt(earliest, service.timezone);
  let chosen: { departure: number; arrival: number; date: string } | undefined;
  // Service times may extend past midnight (up to 48 h in the validated model).
  for (let offset = -2; offset <= 1; offset++) {
    const date = new Date(
      Date.parse(localDate + 'T12:00:00Z') + offset * 86400000
    )
      .toISOString()
      .slice(0, 10);
    if (!serviceRunsOnDate(service, date)) continue;
    const start = serviceDayStart(date, service.timezone);
    for (const seconds of timetable.departures) {
      const departure = start + (seconds + boardOffset) * 1000;
      if (
        departure < earliest ||
        departure > horizon ||
        (chosen && chosen.departure <= departure)
      )
        continue;
      chosen = {
        departure,
        arrival: start + (seconds + alightOffset) * 1000,
        date,
      };
    }
  }
  if (!chosen) return null;
  return {
    arrivalMs: chosen.arrival,
    ride: {
      ...ride,
      durationSeconds: (chosen.arrival - chosen.departure) / 1000,
      timing: {
        status: 'scheduled',
        departureAt: new Date(chosen.departure).toISOString(),
        arrivalAt: new Date(chosen.arrival).toISOString(),
        waitSeconds: (chosen.departure - readyAt) / 1000,
        serviceDate: chosen.date,
        timezone: service.timezone,
        sourceUrl: timetable.sourceUrl,
      },
    },
  };
}

export function applyDepartureTiming(
  journey: Journey,
  patterns: Map<string, NetworkPattern>,
  departureAt: Date
): Journey | null {
  const start = departureAt.getTime();
  let cursor: number | null = start;
  let rides = 0;
  const legs: Journey['legs'] = [];
  for (const leg of journey.legs) {
    if (leg.kind === 'walk') {
      if (cursor !== null) cursor += leg.durationSeconds * 1000;
      legs.push(leg);
      continue;
    }
    const pattern = patterns.get(leg.patternId);
    const timed: ReturnType<typeof scheduleRide> = pattern
      ? scheduleRide(
          pattern,
          leg,
          cursor,
          start + PLANNING_HORIZON_SECONDS * 1000,
          rides ? MIN_TRANSFER_SECONDS : 0
        )
      : { ride: { ...leg, timing: { ...unknownTiming } }, arrivalMs: null };
    if (!timed) return null;
    legs.push(timed.ride);
    cursor = timed.arrivalMs;
    rides++;
  }
  return {
    ...journey,
    legs,
    durationSeconds: cursor === null ? null : (cursor - start) / 1000,
    timingStatus:
      cursor === null ? 'unknown' : rides ? 'scheduled' : 'estimated',
    arrivalAt: cursor === null ? null : new Date(cursor).toISOString(),
  };
}

// Kept for internal callers; production routing evaluates time before pruning.
export function filterJourneysByDeparture(
  journeys: Journey[],
  snapshot: NetworkSnapshot,
  departureAt: Date
): { journeys: Journey[]; timingKnown: boolean } {
  const patterns = new Map(snapshot.patterns.map((p) => [p.id, p]));
  const filtered = journeys
    .map((j) => applyDepartureTiming(j, patterns, departureAt))
    .filter((j): j is Journey => j !== null);
  return {
    journeys: filtered,
    timingKnown: filtered.every((j) => j.timingStatus !== 'unknown'),
  };
}
