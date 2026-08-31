import { validCoordinates } from './geo';
import { isUUID } from 'class-validator';
import type { NetworkSnapshot, QualityIssue } from './network.types';
import { snapshotShapeIssues } from './snapshot-schema';
import { isReviewedTransfer } from './transfer-review';

// Used for CLI imports AND staff edits, before any projection or publication.
export function validateSnapshot(input: unknown): QualityIssue[] {
  const shapeIssues = snapshotShapeIssues(input);
  if (shapeIssues.length) return shapeIssues;
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
    let previous = -1,
      previousSourceSequence = -1;
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
      if (
        s.displayNames &&
        (typeof s.displayNames !== 'object' ||
          Object.entries(s.displayNames).some(
            ([k, v]) =>
              typeof k !== 'string' ||
              k.length > 35 ||
              typeof v !== 'string' ||
              v.length > 255
          ))
      )
        fail(p.id, 'Invalid multilingual display names');
      if (s.stopAreaId && typeof s.stopAreaId !== 'string')
        fail(p.id, 'Invalid stop area reference');
      if (s.sourceSequence <= previousSourceSequence)
        fail(p.id, 'Source stop sequences must be strictly increasing');
      previousSourceSequence = s.sourceSequence;
      const signature = JSON.stringify([
        s.name,
        s.code,
        s.coordinates,
        [...s.aliases].sort(),
        s.stopAreaId,
        s.zoneId,
        s.platformCode,
        s.sourceRecord
          ? [
              s.sourceRecord.namespace,
              s.sourceRecord.file,
              s.sourceRecord.recordId,
            ]
          : null,
        Object.entries(s.displayNames ?? {}).sort(),
      ]);
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
        s.departureElapsedSeconds !== undefined &&
        s.departureElapsedSeconds !== null &&
        (!Number.isInteger(s.departureElapsedSeconds) ||
          s.elapsedSeconds === null ||
          s.departureElapsedSeconds < s.elapsedSeconds ||
          (p.stops[i + 1]?.elapsedSeconds != null &&
            s.departureElapsedSeconds > p.stops[i + 1].elapsedSeconds!))
      )
        fail(p.id, 'Invalid stop departure offset');
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
      if (service.timezone !== undefined) {
        try {
          new Intl.DateTimeFormat('en', {
            timeZone: service.timezone,
          }).format();
        } catch {
          fail(p.id, 'Invalid service timezone');
        }
      }
      if (service.timetable !== undefined) {
        const timetable = service.timetable;
        if (
          !timetable ||
          typeof timetable.verified !== 'boolean' ||
          !/^https:\/\//.test(timetable.sourceUrl) ||
          !Array.isArray(timetable.departures) ||
          !timetable.departures.length ||
          timetable.departures.length > 10000 ||
          timetable.departures.some(
            (t) => !Number.isInteger(t) || t < 0 || t >= 172800
          ) ||
          (timetable.verified && !service.timezone)
        )
          fail(p.id, 'Invalid sourced timetable');
      }
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
    if (p.fareRules) {
      if (!Array.isArray(p.fareRules) || p.fareRules.length > 500)
        fail(p.id, 'Invalid fare rules');
      for (const rule of Array.isArray(p.fareRules) ? p.fareRules : []) {
        if (rule.kind === 'section') {
          const from = p.stops.filter(
            (s) =>
              (rule.fromStopId === undefined || s.id === rule.fromStopId) &&
              (rule.fromSequence === undefined ||
                s.sequence === rule.fromSequence)
          );
          const to = p.stops.filter(
            (s) =>
              (rule.toStopId === undefined || s.id === rule.toStopId) &&
              (rule.toSequence === undefined || s.sequence === rule.toSequence)
          );
          if (!from.some((a) => to.some((b) => b.sequence > a.sequence)))
            fail(
              p.id,
              'Section fare must reference boarding before alighting on this pattern'
            );
        }
        if (
          !rule ||
          typeof rule.id !== 'string' ||
          ![
            'fixed',
            'section',
            'zone',
            'transfer_discount',
            'transfer_charge',
          ].includes(rule.kind) ||
          !Number.isFinite(rule.amount) ||
          rule.amount < 0 ||
          rule.currency !== 'RWF' ||
          !/^https:\/\//.test(rule.sourceUrl) ||
          !rule.validFrom ||
          !rule.validTo ||
          rule.validFrom > rule.validTo ||
          !['boarding', 'alighting', 'other'].includes(rule.paymentTiming) ||
          !['verified', 'estimated', 'unknown'].includes(rule.confidence) ||
          typeof rule.verified !== 'boolean' ||
          (rule.containsZoneIds !== undefined &&
            (!Array.isArray(rule.containsZoneIds) ||
              rule.containsZoneIds.some(
                (id) => typeof id !== 'string' || id.length > 100
              )))
        )
          fail(p.id, 'Invalid fare rule');
      }
    }
  }
  const transferIds = new Set<string>();
  const stopMap = new Map(
    [...coordinates].map(([id, point]) => [id, { id, coordinates: point }])
  );
  for (const t of data.transfers) {
    if (
      transferIds.has(t.id) ||
      !stops.has(t.fromStopId) ||
      !stops.has(t.toStopId) ||
      t.fromStopId === t.toStopId
    )
      fail('transfer', 'Invalid transfer link');
    transferIds.add(t.id);
    if (t.reviewed && !isReviewedTransfer(t, stopMap))
      fail(
        t.id,
        'Transfer approval is missing, stale, or does not match the pedestrian path and boarding points'
      );
    if (!t.reviewed && t.review)
      fail(t.id, 'Unreviewed transfers must not retain an approval');
  }
  const routes = new Set(data.patterns.map((p) => p.routeId));
  for (const rule of data.fareRules ?? []) {
    if (!routes.has(rule.fromRouteId!) || !routes.has(rule.toRouteId!))
      fail(rule.id, 'Transfer fare references an unknown route');
    if (
      (rule.fromStopId &&
        !data.patterns.some(
          (p) =>
            p.routeId === rule.fromRouteId &&
            p.stops.some((s) => s.id === rule.fromStopId)
        )) ||
      (rule.toStopId &&
        !data.patterns.some(
          (p) =>
            p.routeId === rule.toRouteId &&
            p.stops.some((s) => s.id === rule.toStopId)
        ))
    )
      fail(
        rule.id,
        'Transfer fare stop restriction does not belong to its route'
      );
  }
  if (data.stopAreas) {
    if (!Array.isArray(data.stopAreas) || data.stopAreas.length > 500)
      fail('stopAreas', 'Invalid stop area list');
    const areaIds = new Set<string>();
    const membership = new Map<string, string>();
    for (const area of Array.isArray(data.stopAreas) ? data.stopAreas : []) {
      if (
        !area ||
        typeof area.id !== 'string' ||
        areaIds.has(area.id) ||
        typeof area.name !== 'string' ||
        !area.name.trim() ||
        !validCoordinates(area.coordinates) ||
        !Array.isArray(area.boardingPointIds) ||
        area.boardingPointIds.length < 1 ||
        area.boardingPointIds.length > 50 ||
        !area.boardingPointIds.every(
          (id) => typeof id === 'string' && stops.has(id)
        )
      )
        fail('stopAreas', 'Invalid stop area');
      if (area) areaIds.add(area.id);
      if (stops.has(area.id))
        fail(
          area.id,
          'Terminal and boarding-point identities must remain distinct'
        );
      for (const id of area.boardingPointIds) {
        if (membership.has(id))
          fail(id, 'A boarding point cannot belong to multiple terminals');
        membership.set(id, area.id);
      }
    }
    for (const p of data.patterns)
      for (const s of p.stops)
        if (s.stopAreaId && membership.get(s.id) !== s.stopAreaId)
          fail(s.id, 'Stop area reference and terminal membership disagree');
  } else if (data.patterns.some((p) => p.stops.some((s) => s.stopAreaId))) {
    fail('stopAreas', 'Stop area references require matching terminal records');
  }
  return errors.slice(0, 100);
}
