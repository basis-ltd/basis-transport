import { createHash, randomUUID } from 'crypto';
import JSZip from 'jszip';
import { parse } from 'csv-parse/sync';
import { distance, validCoordinates } from './geo';
import type {
  Coordinates,
  NetworkPattern,
  NetworkSnapshot,
  NetworkStop,
  QualityIssue,
} from './network.types';

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

export async function importGtfs(bytes: Buffer, source = 'dt4a-2019') {
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
  const agencies = new Map(
    (await rows('agency.txt')).map((r) => [r.agency_id, r.agency_name])
  );
  const routes = new Map(
    (await rows('routes.txt')).map((r) => [r.route_id, r])
  );
  const stops = new Map<string, NetworkStop>();
  const invalidStops = new Set<string>();
  for (const s of await rows('stops.txt')) {
    const coordinates: Coordinates = [Number(s.stop_lon), Number(s.stop_lat)];
    if (!s.stop_name || /^unknown$/i.test(s.stop_name)) continue; // GPS samples, not signed stops
    if (
      !/[\p{L}\p{N}]{2}/u.test(s.stop_name) ||
      !s.stop_lat ||
      !s.stop_lon ||
      !validCoordinates(coordinates)
    ) {
      invalidStops.add(s.stop_id);
      issues.push({
        reference: s.stop_id,
        severity: 'warning',
        message: 'Stop quarantined: invalid name or coordinates',
      });
      continue;
    }
    const id = `${source === 'dt4a-2019' ? 'DT4A' : source.toUpperCase()}_${s.stop_id}`;
    stops.set(s.stop_id, {
      id,
      code: id,
      name: s.stop_name,
      aliases: [],
      coordinates,
    });
  }
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
        if (elapsedSeconds < previousElapsed || elapsedSeconds < 0)
          throw new Error('Non-monotonic observed times');
        previousElapsed = elapsedSeconds;
        return {
          ...stops.get(s.stop_id)!,
          sequence: i,
          sourceSequence: +s.stop_sequence,
          elapsedSeconds,
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
  return {
    checksum: createHash('sha256').update(bytes).digest('hex'),
    snapshot: { patterns, transfers: [] } as NetworkSnapshot,
    issues,
    validFrom: patterns.map((p) => p.service.validFrom).sort()[0],
    validTo: patterns.map((p) => p.service.validTo).sort()[0],
  };
}
