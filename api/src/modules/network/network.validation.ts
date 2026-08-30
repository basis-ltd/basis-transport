import { distance, validCoordinates } from './geo';
import { isUUID } from 'class-validator';
import type { NetworkSnapshot, QualityIssue } from './network.types';

// Used for CLI imports AND staff edits, before any projection or publication.
export function validateSnapshot(input: unknown): QualityIssue[] {
  const errors: QualityIssue[] = [];
  const fail = (reference: string, message: string) =>
    errors.push({ reference, message, severity: 'error' });
  const data = input as NetworkSnapshot;
  if (!data || !Array.isArray(data.patterns) || !Array.isArray(data.transfers))
    return [
      {
        reference: 'dataset',
        message: 'Expected patterns and transfers',
        severity: 'error',
      },
    ];
  if (
    !data.patterns.length ||
    data.patterns.length > 5000 ||
    data.transfers.length > 10000
  )
    fail('dataset', 'Invalid network size');
  const ids = new Set<string>(),
    trips = new Set<string>(),
    stops = new Map<string, string>();
  const coordinates = new Map<string, [number, number]>();
  for (const p of data.patterns) {
    if (
      !p ||
      typeof p.id !== 'string' ||
      !isUUID(p.id) ||
      ids.has(p.id) ||
      trips.has(p.sourceTripId)
    ) {
      fail('pattern', 'Invalid or duplicate pattern identity');
      continue;
    }
    ids.add(p.id);
    trips.add(p.sourceTripId);
    if (typeof p.enabled !== 'boolean' || !['0', '1', ''].includes(p.direction))
      fail(p.id, 'Invalid direction or enabled flag');
    if (
      ![
        p.routeId,
        p.routeNumber,
        p.routeName,
        p.agency,
        p.sourceTripId,
        p.headsign,
      ].every((v) => typeof v === 'string' && v.length > 0 && v.length <= 500)
    )
      fail(p.id, 'Missing or oversized route labels');
    if (
      !Array.isArray(p.stops) ||
      p.stops.length < 2 ||
      p.stops.length > 1000
    ) {
      fail(p.id, 'A pattern needs 2–1000 stops');
      continue;
    }
    let previous = -1;
    for (const [i, s] of p.stops.entries()) {
      if (
        !s ||
        typeof s.id !== 'string' ||
        !s.id ||
        typeof s.name !== 'string' ||
        !s.name.trim() ||
        s.name.length > 255 ||
        !validCoordinates(s.coordinates) ||
        s.sequence !== i ||
        !Number.isInteger(s.sourceSequence)
      ) {
        fail(p.id, 'Invalid stop occurrence');
        continue;
      }
      if (
        !Array.isArray(s.aliases) ||
        s.aliases.some((a) => typeof a !== 'string' || a.length > 255)
      )
        fail(p.id, 'Invalid stop aliases');
      const signature = JSON.stringify([s.name, s.coordinates, s.aliases]);
      if (stops.has(s.id) && stops.get(s.id) !== signature)
        fail(s.id, 'Stop identity has conflicting metadata within the dataset');
      stops.set(s.id, signature);
      coordinates.set(s.id, s.coordinates);
      if (
        s.elapsedSeconds !== null &&
        (!Number.isFinite(s.elapsedSeconds) || s.elapsedSeconds < previous)
      )
        fail(p.id, 'Non-monotonic elapsed seconds');
      previous = s.elapsedSeconds ?? previous;
      if (
        s.shapeIndex !== null &&
        (!Number.isInteger(s.shapeIndex) ||
          s.shapeIndex < 0 ||
          !p.geometry ||
          s.shapeIndex >= p.geometry.length ||
          (i > 0 && s.shapeIndex < (p.stops[i - 1]?.shapeIndex ?? 0)))
      )
        fail(p.id, 'Invalid shape index');
    }
    if (
      p.geometry !== null &&
      (!Array.isArray(p.geometry) ||
        p.geometry.length < 2 ||
        p.geometry.length > 100000 ||
        !p.geometry.every(validCoordinates))
    )
      fail(p.id, 'Invalid shape geometry');
    const service = p.service;
    if (
      !service ||
      !/^\d{4}-\d{2}-\d{2}$/.test(service.validFrom) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(service.validTo) ||
      service.validFrom > service.validTo ||
      !Array.isArray(service.weekdays) ||
      service.weekdays.length !== 7 ||
      !Array.isArray(service.windows) ||
      !Array.isArray(service.exceptions)
    )
      fail(p.id, 'Invalid service calendar');
    else {
      if (
        service.weekdays.some((day) => typeof day !== 'boolean') ||
        service.exceptions.some(
          (e) =>
            !e ||
            !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
            typeof e.added !== 'boolean'
        )
      )
        fail(p.id, 'Invalid calendar values');
      for (const w of service.windows)
        if (
          !w ||
          ![w.startSeconds, w.endSeconds, w.headwaySeconds].every(
            Number.isInteger
          ) ||
          w.startSeconds < 0 ||
          w.endSeconds <= w.startSeconds ||
          w.endSeconds > 172800 ||
          w.headwaySeconds <= 0
        )
          fail(p.id, 'Invalid frequency window');
    }
    if (
      p.fare &&
      (!Number.isFinite(p.fare.amount) ||
        p.fare.amount < 0 ||
        p.fare.currency !== 'RWF' ||
        !/^https:\/\//.test(p.fare.sourceUrl) ||
        !p.fare.validFrom ||
        !p.fare.validTo ||
        p.fare.validFrom > p.fare.validTo)
    )
      fail(p.id, 'Invalid sourced fare');
  }
  const transferIds = new Set<string>();
  for (const t of data.transfers) {
    if (
      !t ||
      transferIds.has(t.id) ||
      !stops.has(t.fromStopId) ||
      !stops.has(t.toStopId) ||
      t.fromStopId === t.toStopId ||
      !Number.isFinite(t.distanceMeters) ||
      t.distanceMeters < 0 ||
      t.distanceMeters > 400 ||
      !Number.isFinite(t.durationSeconds) ||
      t.durationSeconds < 0 ||
      !Array.isArray(t.geometry) ||
      t.geometry.length < 2 ||
      !t.geometry.every(validCoordinates) ||
      typeof t.source !== 'string' ||
      !t.source.trim() ||
      typeof t.reviewed !== 'boolean'
    )
      fail('transfer', 'Invalid transfer link');
    if (t) {
      transferIds.add(t.id);
      const from = coordinates.get(t.fromStopId),
        to = coordinates.get(t.toStopId);
      if (
        from &&
        to &&
        Array.isArray(t.geometry) &&
        t.geometry.length >= 2 &&
        t.geometry.every(validCoordinates) &&
        (distance(from, t.geometry[0]) > 30 ||
          distance(to, t.geometry[t.geometry.length - 1]) > 30 ||
          distance(from, to) > t.distanceMeters + 10)
      )
        fail(t.id, 'Transfer geometry does not connect the selected stops');
    }
  }
  return errors;
}
