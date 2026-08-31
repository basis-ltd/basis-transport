import { createHash, randomUUID } from 'crypto';
import JSZip from 'jszip';
import { parse } from 'csv-parse/sync';
import { distance, validCoordinates } from './geo';
import type {
  Coordinates,
  FareRule,
  NetworkPattern,
  NetworkSnapshot,
  QualityIssue,
} from './network.types';
import { importStops, sourceRecord, languageCode } from './gtfs-stops';
import { httpsUrl } from './snapshot-schema';

type Row = Record<string, string>;
export function serviceSeconds(value: string): number {
  if (!/^\d{1,3}:[0-5]\d:[0-5]\d$/.test(value))
    throw new Error(`Invalid service time: ${value}`);
  const [h, m, s] = value.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}
const date = (s: string) =>
  /^\d{8}$/.test(s || '')
    ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
    : '';

export async function importGtfs(
  bytes: Buffer,
  source = 'dt4a-2019',
  sourceUrl = 'https://gtfs.example/import',
  retrievedAt: string | null = null
) {
  if (!/^[a-z0-9-]{3,40}$/.test(source) || !httpsUrl(sourceUrl))
    throw new Error(
      'Provide a canonical source namespace and HTTPS source URL'
    );
  if (
    retrievedAt !== null &&
    (!/^\d{4}-\d{2}-\d{2}T/.test(retrievedAt) ||
      !Number.isFinite(Date.parse(retrievedAt)) ||
      Date.parse(retrievedAt) > Date.now())
  )
    throw new Error('Retrieval timestamp must be a valid past ISO timestamp');
  const importedAt = new Date().toISOString();
  const checksum = createHash('sha256').update(bytes).digest('hex');
  if (bytes.length > 30_000_000) throw new Error('GTFS archive exceeds 30 MB');
  const zip = await JSZip.loadAsync(bytes);
  const issues: QualityIssue[] = [];
  let expandedBytes = 0;
  async function rows(name: string, required = true): Promise<Row[]> {
    const file = zip.file(name);
    if (!file) {
      if (required) throw new Error(`Missing ${name}`);
      return [];
    }
    const text = await file.async('string');
    expandedBytes += Buffer.byteLength(text);
    if (expandedBytes > 100_000_000)
      throw new Error('Expanded GTFS exceeds 100 MB');
    return parse(text, {
      columns: true,
      bom: true,
      skip_empty_lines: true,
      trim: true,
    }) as Row[];
  }
  const agencyRows = await rows('agency.txt');
  const agencies = new Map(agencyRows.map((r) => [r.agency_id, r.agency_name]));
  const routes = new Map(
    (await rows('routes.txt')).map((r) => [r.route_id, r])
  );
  const translations = await rows('translations.txt', false);
  const feedInfo = await rows('feed_info.txt', false);
  if (feedInfo.length > 1)
    throw new Error('Expected at most one feed_info record');
  if (translations.length && !feedInfo.length)
    throw new Error('translations.txt requires feed_info.txt');
  if (feedInfo[0]?.feed_lang && !languageCode(feedInfo[0].feed_lang))
    throw new Error('Invalid feed language');
  const importedStops = importStops(
    await rows('stops.txt'),
    translations,
    source,
    issues
  );
  const { stops, invalidStops, samples } = importedStops;
  const calendars = new Map(
    (await rows('calendar.txt')).map((r) => [r.service_id, r])
  );
  const exceptions = await rows('calendar_dates.txt', false);
  const times = new Map<string, Row[]>();
  for (const r of await rows('stop_times.txt'))
    times.set(r.trip_id, [...(times.get(r.trip_id) || []), r]);
  const frequencies = new Map<string, Row[]>();
  for (const r of await rows('frequencies.txt', false))
    frequencies.set(r.trip_id, [...(frequencies.get(r.trip_id) || []), r]);
  const shapeRows = new Map<string, Row[]>();
  for (const r of await rows('shapes.txt', false))
    shapeRows.set(r.shape_id, [...(shapeRows.get(r.shape_id) || []), r]);
  const shapes = new Map<string, Coordinates[]>();
  for (const [id, values] of shapeRows) {
    const points = values
      .sort((a, b) => +a.shape_pt_sequence - +b.shape_pt_sequence)
      .map(
        (r) => [Number(r.shape_pt_lon), Number(r.shape_pt_lat)] as Coordinates
      );
    if (points.length >= 2 && points.every(validCoordinates))
      shapes.set(id, points);
  }
  const patterns: NetworkPattern[] = [];
  for (const trip of await rows('trips.txt')) {
    try {
      const route = routes.get(trip.route_id);
      const calendar = calendars.get(trip.service_id);
      if (!route || !calendar) throw new Error('Missing route or calendar');
      const sequence = (times.get(trip.trip_id) || []).sort(
        (a, b) => +a.stop_sequence - +b.stop_sequence
      );
      if (
        sequence.some(
          (s) =>
            invalidStops.has(s.stop_id) ||
            (!stops.has(s.stop_id) && !samples.has(s.stop_id)) ||
            !Number.isInteger(Number(s.stop_sequence)) ||
            Number(s.stop_sequence) < 0
        )
      )
        throw new Error('Invalid source stop or sequence');
      if (
        new Set(sequence.map((s) => +s.stop_sequence)).size !== sequence.length
      )
        throw new Error('Duplicate stop sequence');
      const named = sequence.filter((s) => stops.has(s.stop_id));
      if (named.length < 2) throw new Error('Fewer than two valid named stops');
      const firstTime = serviceSeconds(sequence[0].arrival_time);
      let previousElapsed = -1;
      const occurrences = named.map((s, i) => {
        const elapsedSeconds = serviceSeconds(s.arrival_time) - firstTime;
        const departureElapsedSeconds =
          serviceSeconds(s.departure_time || s.arrival_time) - firstTime;
        if (departureElapsedSeconds < elapsedSeconds)
          throw new Error('Departure precedes arrival');
        if (elapsedSeconds < previousElapsed || elapsedSeconds < 0)
          throw new Error('Non-monotonic observed times');
        previousElapsed = elapsedSeconds;
        return {
          ...stops.get(s.stop_id)!,
          stopTimeRecord: sourceRecord(
            source,
            'stop_times.txt',
            trip.trip_id,
            s.stop_sequence
          ),
          sequence: i,
          sourceSequence: +s.stop_sequence,
          elapsedSeconds,
          departureElapsedSeconds,
          shapeIndex: null as number | null,
        };
      });
      let geometry = shapes.get(trip.shape_id) || null;
      if (geometry) {
        // Constrain matching forward along the actual shape; never reverse or concatenate variants.
        let start = 0;
        for (const occurrence of occurrences) {
          let best = Infinity,
            index = start;
          for (let i = start; i < geometry.length; i++) {
            const metres = distance(occurrence.coordinates, geometry[i]);
            if (metres < best) {
              best = metres;
              index = i;
            }
          }
          if (best > 250) {
            geometry = null;
            break;
          }
          occurrence.shapeIndex = index;
          start = index;
        }
      }
      if (!geometry) {
        occurrences.forEach((s) => (s.shapeIndex = null));
        issues.push({
          reference: trip.trip_id,
          severity: 'warning',
          message: 'Shape missing or misaligned; display a schematic only',
        });
      }
      const windows = (frequencies.get(trip.trip_id) || []).map((f) => {
        const startSeconds = serviceSeconds(f.start_time);
        let endSeconds = serviceSeconds(f.end_time);
        if (endSeconds <= startSeconds) endSeconds += 86400;
        const headwaySeconds = Number(f.headway_secs);
        if (!Number.isInteger(headwaySeconds) || headwaySeconds <= 0)
          throw new Error('Invalid headway');
        return { startSeconds, endSeconds, headwaySeconds };
      });
      patterns.push({
        id: randomUUID(),
        sourceRecord: sourceRecord(source, 'trips.txt', trip.trip_id),
        routeSourceRecord: sourceRecord(source, 'routes.txt', trip.route_id),
        routeId: `${source}:${trip.route_id}`,
        routeNumber: route.route_short_name || trip.route_id,
        routeName: route.route_desc || route.route_long_name || trip.route_id,
        agency:
          agencies.get(route.agency_id) ||
          route.agency_id ||
          'Operator unknown',
        sourceTripId: trip.trip_id,
        sourceShapeId: trip.shape_id || null,
        direction: trip.direction_id || '',
        headsign:
          trip.trip_headsign || occurrences[occurrences.length - 1].name,
        stops: occurrences,
        geometry,
        enabled: true,
        fare: null,
        service: {
          sourceId: trip.service_id,
          timezone:
            (
              agencyRows.find((a) => a.agency_id === route.agency_id) ||
              (agencyRows.length === 1 ? agencyRows[0] : undefined)
            )?.agency_timezone || undefined,
          // Frequency-based stop times are templates, not exact departures.
          ...(!windows.length
            ? {
                timetable: {
                  departures: [firstTime],
                  verified: false,
                  sourceUrl,
                },
              }
            : {}),
          validFrom: date(calendar.start_date),
          validTo: date(calendar.end_date),
          weekdays: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ].map((day) => calendar[day] === '1'),
          exceptions: exceptions
            .filter((e) => e.service_id === trip.service_id)
            .map((e) => ({
              date: date(e.date),
              added: e.exception_type === '1',
            })),
          windows,
        },
      });
    } catch (e) {
      issues.push({
        reference: trip.trip_id,
        severity: 'warning',
        message: `Pattern quarantined: ${(e as Error).message}`,
      });
    }
  }
  if (!patterns.length)
    throw new Error('No routable directional patterns in this feed');

  const fareAttributes = new Map(
    (await rows('fare_attributes.txt', false)).map((r) => [r.fare_id, r])
  );
  const fareRuleRows = await rows('fare_rules.txt', false);
  if (fareRuleRows.length)
    applyGtfsFares(
      patterns,
      source,
      sourceUrl,
      fareAttributes,
      fareRuleRows,
      issues
    );

  return {
    checksum,
    snapshot: {
      patterns,
      transfers: [],
      stopAreas: importedStops.areasForPatterns(patterns),
      importProvenance: {
        namespace: source,
        sourceUrl,
        checksum,
        importedAt,
        retrievedAt,
        ...(feedInfo[0]?.feed_version
          ? { feedVersion: feedInfo[0].feed_version }
          : {}),
        ...(feedInfo[0]?.feed_lang
          ? { feedLanguage: languageCode(feedInfo[0].feed_lang)! }
          : {}),
      },
    } as NetworkSnapshot,
    issues,
    validFrom: patterns.map((p) => p.service.validFrom).sort()[0],
    validTo: patterns.map((p) => p.service.validTo).sort()[0],
  };
}

function applyGtfsFares(
  patterns: NetworkPattern[],
  source: string,
  sourceUrl: string,
  fareAttributes: Map<string, Row>,
  fareRuleRows: Row[],
  issues: QualityIssue[]
) {
  const rulesByRoute = new Map<string, Row[]>();
  for (const rule of fareRuleRows) {
    if (!rule.route_id) continue;
    const key = `${source}:${rule.route_id}`;
    rulesByRoute.set(key, [...(rulesByRoute.get(key) || []), rule]);
  }

  for (const pattern of patterns) {
    const rules = rulesByRoute.get(pattern.routeId) || [];
    const fareRules: FareRule[] = [];
    for (const rule of rules) {
      const attr = fareAttributes.get(rule.fare_id);
      if (!attr) continue;
      const amount = Number(attr.price);
      if (!Number.isFinite(amount) || amount < 0) continue;
      if (attr.currency_type !== 'RWF') {
        issues.push({
          reference: rule.fare_id,
          severity: 'warning',
          message: `Fare quarantined: unsupported or missing currency ${attr.currency_type || '(missing)'}. No conversion inferred.`,
        });
        continue;
      }
      const zone = Boolean(
        rule.origin_id || rule.destination_id || rule.contains_id
      );
      fareRules.push({
        id: `${rule.fare_id}:${rule.origin_id || 'all'}:${rule.destination_id || 'all'}`,
        kind: zone ? 'zone' : 'fixed',
        amount,
        currency: 'RWF',
        fromZoneId: rule.origin_id ? `${source}:${rule.origin_id}` : undefined,
        toZoneId: rule.destination_id
          ? `${source}:${rule.destination_id}`
          : undefined,
        ...(rule.contains_id
          ? { containsZoneIds: [`${source}:${rule.contains_id}`] }
          : {}),
        paymentTiming: attr.payment_method === '1' ? 'other' : 'boarding',
        ...(attr.payment_method === '1'
          ? { instructions: 'Purchase the fare before boarding.' }
          : {}),
        sourceUrl,
        validFrom: pattern.service.validFrom,
        validTo: pattern.service.validTo,
        verified: false,
        confidence: 'unknown',
      });
    }
    if (fareRules.length) {
      pattern.fareRules = fareRules;
      issues.push({
        reference: pattern.sourceTripId,
        severity: 'warning',
        message:
          'GTFS fare rules imported as unverified. Review amounts and validity before publication.',
      });
    }
  }
}
