import { isUUID } from 'class-validator';
import { validCoordinates } from './geo';
import type { QualityIssue } from './network.types';

export const record = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v);
export const textValue = (v: unknown, max = 500): v is string =>
  typeof v === 'string' && Boolean(v.trim()) && v.length <= max;
export const dayValue = (v: unknown): v is string =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v + 'T00:00:00Z')) &&
  new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v;
export function httpsUrl(v: unknown): v is string {
  if (!textValue(v, 2000)) return false;
  try {
    const url = new URL(v);
    return (
      url.protocol === 'https:' &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
const number = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const integer = (v: unknown, min: number, max: number) =>
  number(v, min, max) && Number.isInteger(v);
const list = (v: unknown, max: number, min = 0): v is unknown[] =>
  Array.isArray(v) && v.length >= min && v.length <= max;
const strings = (v: unknown, max = 100, length = 255) =>
  list(v, max) && v.every((s) => textValue(s, length));
const optional = (v: unknown, check: (v: unknown) => boolean) =>
  v === undefined || check(v);

/** Total, bounded structural validation before any typed traversal, import or staff save. */
export function snapshotShapeIssues(input: unknown): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const fail = (reference: string, message: string) => {
    if (issues.length < 100)
      issues.push({ reference, message, severity: 'error' });
  };
  if (
    !record(input) ||
    !list(input.patterns, 5000, 1) ||
    !list(input.transfers, 10000)
  ) {
    fail(
      'dataset',
      'Expected 1–5000 patterns and at most 10000 transfer links'
    );
    return issues;
  }
  const provenance = input.importProvenance;
  const timestamp = (v: unknown) =>
    typeof v === 'string' &&
    /^\d{4}-\d{2}-\d{2}T/.test(v) &&
    Number.isFinite(Date.parse(v));
  if (
    provenance !== undefined &&
    (!record(provenance) ||
      !textValue(provenance.namespace, 40) ||
      !/^[a-z0-9-]{3,40}$/.test(provenance.namespace) ||
      !httpsUrl(provenance.sourceUrl) ||
      typeof provenance.checksum !== 'string' ||
      !/^[a-f0-9]{64}$/.test(provenance.checksum) ||
      !timestamp(provenance.importedAt) ||
      !(
        provenance.retrievedAt === null ||
        (timestamp(provenance.retrievedAt) &&
          Date.parse(String(provenance.retrievedAt)) <=
            Date.parse(String(provenance.importedAt)))
      ) ||
      !optional(provenance.feedVersion, (v) => textValue(v, 255)) ||
      !optional(provenance.feedLanguage, (v) => textValue(v, 35)))
  )
    fail(
      'importProvenance',
      'Invalid source namespace, archive checksum, URL or import/retrieval metadata'
    );
  const sourceRef = (v: unknown, file: string, ref: string) => {
    if (v === undefined) return;
    if (
      !record(v) ||
      !record(provenance) ||
      v.namespace !== provenance.namespace ||
      v.file !== file ||
      !textValue(v.recordId, 100) ||
      !optional(v.recordSubId, (x) => textValue(x, 100)) ||
      (file !== 'stop_times.txt' && v.recordSubId !== undefined)
    )
      fail(ref, 'Invalid original source record reference');
  };
  const displayNames = (v: unknown, ref: string) => {
    if (v === undefined) return;
    if (
      !record(v) ||
      Object.keys(v).length > 30 ||
      Object.entries(v).some(([key, value]) => {
        if (!textValue(value, 255) || key.length > 35) return true;
        try {
          return Intl.getCanonicalLocales(key)[0] !== key;
        } catch {
          return true;
        }
      })
    )
      fail(ref, 'Invalid multilingual display names');
  };
  const fare = (v: unknown, ref: string, rule: boolean, global = false) => {
    if (!record(v)) {
      fail(ref, 'Fare must be an object');
      return;
    }
    if (
      !number(v.amount, 0, 1000000) ||
      v.currency !== 'RWF' ||
      !httpsUrl(v.sourceUrl) ||
      !dayValue(v.validFrom) ||
      !dayValue(v.validTo) ||
      v.validFrom > v.validTo ||
      typeof v.verified !== 'boolean'
    )
      fail(
        ref,
        'Invalid fare amount, currency, source, verification or validity dates'
      );
    if (!rule) return;
    const allowed = new Set([
      'id',
      'kind',
      'amount',
      'currency',
      'sourceUrl',
      'validFrom',
      'validTo',
      'verified',
      'confidence',
      'fromStopId',
      'toStopId',
      'fromSequence',
      'toSequence',
      'fromZoneId',
      'toZoneId',
      'containsZoneIds',
      'paymentTiming',
      'paymentMethods',
      'instructions',
      'fromRouteId',
      'toRouteId',
    ]);
    if (Object.keys(v).some((key) => !allowed.has(key)))
      fail(
        ref,
        'Unsupported fare-rule field; do not silently discard eligibility restrictions'
      );
    if (
      !textValue(v.id, 100) ||
      !(
        global
          ? ['transfer_charge', 'transfer_discount']
          : ['fixed', 'section', 'zone']
      ).includes(String(v.kind)) ||
      !['boarding', 'alighting', 'other'].includes(String(v.paymentTiming)) ||
      !['verified', 'estimated', 'unknown'].includes(String(v.confidence)) ||
      (v.confidence === 'verified' && v.verified !== true)
    )
      fail(
        ref,
        'Invalid fare-rule identity, kind, payment timing or confidence'
      );
    for (const key of [
      'fromStopId',
      'toStopId',
      'fromZoneId',
      'toZoneId',
      'fromRouteId',
      'toRouteId',
    ])
      if (!optional(v[key], (x) => textValue(x, 100)))
        fail(ref, `Invalid ${key}`);
    for (const key of ['fromSequence', 'toSequence'])
      if (!optional(v[key], (x) => integer(x, 0, 999)))
        fail(ref, `Invalid ${key}`);
    if (
      !optional(v.containsZoneIds, (x) => strings(x, 100, 100)) ||
      !optional(v.paymentMethods, (x) => strings(x, 20, 100)) ||
      !optional(v.instructions, (x) => textValue(x, 2000))
    )
      fail(ref, 'Invalid fare zones, payment methods or instructions');
    if (
      global &&
      (!textValue(v.fromRouteId, 100) || !textValue(v.toRouteId, 100))
    )
      fail(
        ref,
        'Transfer fare rules require explicit fromRouteId and toRouteId'
      );
    if (!global && (v.fromRouteId !== undefined || v.toRouteId !== undefined))
      fail(ref, 'Transfer eligibility belongs in dataset-level fare rules');
    if (
      v.kind === 'section' &&
      (!(v.fromStopId !== undefined || v.fromSequence !== undefined) ||
        !(v.toStopId !== undefined || v.toSequence !== undefined))
    )
      fail(ref, 'Section fare requires boarding and alighting restrictions');
    if (
      v.kind === 'zone' &&
      v.fromZoneId === undefined &&
      v.toZoneId === undefined &&
      !(Array.isArray(v.containsZoneIds) && v.containsZoneIds.length)
    )
      fail(ref, 'Zone fare requires a zone restriction');
    const stopKeys = ['fromStopId', 'toStopId', 'fromSequence', 'toSequence'];
    const zoneKeys = ['fromZoneId', 'toZoneId', 'containsZoneIds'];
    if (
      (v.kind === 'fixed' &&
        [...stopKeys, ...zoneKeys].some((k) => v[k] !== undefined)) ||
      (v.kind === 'section' && zoneKeys.some((k) => v[k] !== undefined)) ||
      (v.kind === 'zone' && stopKeys.some((k) => v[k] !== undefined)) ||
      (global &&
        ['fromSequence', 'toSequence', ...zoneKeys].some(
          (k) => v[k] !== undefined
        ))
    )
      fail(ref, 'Fare restrictions do not match this rule kind');
  };
  const fareList = (v: unknown, ref: string, global: boolean) => {
    if (v === undefined) return;
    if (!list(v, 500)) {
      fail(ref, 'Expected at most 500 fare rules');
      return;
    }
    const ids = new Set<unknown>();
    for (const r of v) {
      fare(r, ref, true, global);
      if (record(r)) {
        if (ids.has(r.id)) fail(ref, 'Duplicate fare rule ID');
        ids.add(r.id);
      }
    }
  };
  let totalStops = 0,
    totalPoints = 0;
  for (const [index, p] of input.patterns.entries()) {
    if (issues.length >= 100) break;
    const ref = `patterns[${index}]`;
    if (!record(p)) {
      fail(ref, 'Pattern must be an object');
      continue;
    }
    sourceRef(p.sourceRecord, 'trips.txt', ref);
    sourceRef(p.routeSourceRecord, 'routes.txt', ref);
    if (
      (record(p.sourceRecord) && p.sourceRecord.recordId !== p.sourceTripId) ||
      (record(p.routeSourceRecord) &&
        p.routeId !==
          `${p.routeSourceRecord.namespace}:${p.routeSourceRecord.recordId}`)
    )
      fail(ref, 'Route or trip identity conflicts with its source reference');
    if (!list(p.stops, 1000, 2)) {
      fail(ref, 'Expected 2–1000 stop occurrences');
      continue;
    }
    totalStops += p.stops.length;
    if (totalStops > 100000) {
      fail('dataset', 'Too many stop occurrences');
      break;
    }
    if (!(
      p.geometry === null ||
      (list(p.geometry, 100000, 2) && p.geometry.every(validCoordinates))
    ))
      fail(ref, 'Invalid shape geometry');
    if (Array.isArray(p.geometry)) totalPoints += p.geometry.length;
    if (totalPoints > 2000000) {
      fail('dataset', 'Too many shape coordinates');
      break;
    }
    if (!(p.sourceShapeId === null || textValue(p.sourceShapeId)))
      fail(ref, 'Invalid source shape identity');
    if (!textValue(p.routeId, 100))
      fail(ref, 'Route identity must fit public API limits');
    for (const s of p.stops) {
      if (!record(s)) {
        fail(ref, 'Stop occurrence must be an object');
        continue;
      }
      sourceRef(s.sourceRecord, 'stops.txt', ref);
      sourceRef(s.stopTimeRecord, 'stop_times.txt', ref);
      if (
        record(s.stopTimeRecord) &&
        (s.stopTimeRecord.recordId !== p.sourceTripId ||
          typeof s.stopTimeRecord.recordSubId !== 'string' ||
          !/^\d+$/.test(s.stopTimeRecord.recordSubId) ||
          Number(s.stopTimeRecord.recordSubId) !== s.sourceSequence)
      )
        fail(
          ref,
          'Stop-time reference does not match its source trip and sequence'
        );
      if (!optional(s.platformCode, (v) => textValue(v, 100)))
        fail(ref, 'Invalid platform code');
      if (
        !textValue(s.id, 100) ||
        !textValue(s.code, 255) ||
        !textValue(s.name, 255) ||
        !strings(s.aliases) ||
        !validCoordinates(s.coordinates) ||
        !integer(s.sequence, 0, 999) ||
        !integer(s.sourceSequence, 0, 1000000000)
      )
        fail(ref, 'Invalid stop identity, labels, coordinates or occurrence');
      if (
        !(s.elapsedSeconds === null || integer(s.elapsedSeconds, 0, 172800)) ||
        !optional(
          s.departureElapsedSeconds,
          (v) => v === null || integer(v, 0, 172800)
        ) ||
        !(s.shapeIndex === null || integer(s.shapeIndex, 0, 99999))
      )
        fail(ref, 'Invalid stop time or shape index');
      if (
        !optional(s.stopAreaId, (v) => textValue(v, 100)) ||
        !optional(s.zoneId, (v) => textValue(v, 100))
      )
        fail(ref, 'Invalid area or zone identity');
      displayNames(s.displayNames, ref);
    }
    const s = p.service;
    if (
      !record(s) ||
      !textValue(s.sourceId) ||
      !dayValue(s.validFrom) ||
      !dayValue(s.validTo) ||
      s.validFrom > s.validTo ||
      !list(s.weekdays, 7, 7) ||
      !s.weekdays.every((v) => typeof v === 'boolean') ||
      !list(s.exceptions, 10000) ||
      !list(s.windows, 1000)
    )
      fail(ref, 'Invalid service calendar');
    else {
      if (s.timezone !== undefined && !textValue(s.timezone, 100))
        fail(ref, 'Invalid timezone');
      const dates = new Set<unknown>();
      for (const e of s.exceptions) {
        if (
          !record(e) ||
          !dayValue(e.date) ||
          typeof e.added !== 'boolean' ||
          dates.has(e.date)
        )
          fail(ref, 'Invalid or duplicate calendar exception');
        if (record(e)) dates.add(e.date);
      }
      for (const w of s.windows)
        if (
          !record(w) ||
          !integer(w.startSeconds, 0, 172799) ||
          !integer(w.endSeconds, 1, 172800) ||
          !integer(w.headwaySeconds, 1, 172800) ||
          Number(w.startSeconds) >= Number(w.endSeconds)
        )
          fail(ref, 'Invalid frequency window');
      if (s.timetable !== undefined) {
        const t = s.timetable;
        if (
          !record(t) ||
          typeof t.verified !== 'boolean' ||
          !httpsUrl(t.sourceUrl) ||
          !list(t.departures, 10000, 1) ||
          !t.departures.every((v) => integer(v, 0, 172799)) ||
          (t.verified && !textValue(s.timezone, 100))
        )
          fail(ref, 'Invalid sourced timetable');
      }
    }
    if (p.fare !== null) fare(p.fare, ref, false);
    fareList(p.fareRules, ref, false);
  }
  fareList(input.fareRules, 'fareRules', true);
  for (const [index, t] of input.transfers.entries()) {
    if (issues.length >= 100) break;
    const ref = `transfers[${index}]`;
    if (!record(t)) {
      fail(ref, 'Transfer must be an object');
      continue;
    }
    if (
      !textValue(t.id, 100) ||
      !textValue(t.fromStopId, 100) ||
      !textValue(t.toStopId, 100) ||
      typeof t.reviewed !== 'boolean' ||
      typeof t.source !== 'string' ||
      t.source.length > 2000 ||
      !list(t.geometry, 1000) ||
      !t.geometry.every(validCoordinates)
    )
      fail(ref, 'Invalid transfer identity, source or geometry');
    if (
      !(t.distanceMeters === null || number(t.distanceMeters, 0, 400)) ||
      !(t.durationSeconds === null || integer(t.durationSeconds, 0, 14400))
    )
      fail(ref, 'Invalid transfer distance or duration');
    if (
      !optional(t.pathKind, (v) =>
        ['surveyed', 'pedestrian-provider', 'unknown'].includes(String(v))
      )
    )
      fail(ref, 'Invalid pedestrian path source');
    if (!optional(t.instructions, (v) => strings(v, 50, 500)))
      fail(ref, 'Invalid transfer instructions');
    if (t.review !== undefined) {
      const r = t.review;
      if (
        !record(r) ||
        !textValue(r.reviewerId) ||
        !isUUID(r.reviewerId) ||
        !textValue(r.reviewedAt, 40) ||
        !Number.isFinite(Date.parse(r.reviewedAt)) ||
        !httpsUrl(r.evidenceUrl) ||
        !textValue(r.notes, 2000) ||
        !textValue(r.contentHash, 64) ||
        !/^[a-f0-9]{64}$/.test(r.contentHash)
      )
        fail(ref, 'Invalid transfer review evidence');
    }
  }
  if (input.stopAreas !== undefined) {
    if (!list(input.stopAreas, 500))
      fail('stopAreas', 'Expected at most 500 stop areas');
    else
      for (const a of input.stopAreas) {
        if (record(a)) {
          sourceRef(a.sourceRecord, 'stops.txt', 'stopAreas');
          displayNames(a.displayNames, 'stopAreas');
        }
        if (
          !record(a) ||
          !textValue(a.id, 100) ||
          !textValue(a.name, 255) ||
          !strings(a.aliases) ||
          !validCoordinates(a.coordinates) ||
          !list(a.boardingPointIds, 50, 1) ||
          !a.boardingPointIds.every((v) => textValue(v, 100)) ||
          new Set(a.boardingPointIds).size !== a.boardingPointIds.length
        )
          fail(
            'stopAreas',
            'Invalid terminal identity, aliases, coordinates or boarding points'
          );
      }
  }
  return issues;
}
