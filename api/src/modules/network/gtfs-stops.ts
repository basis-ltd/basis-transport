import { validCoordinates } from './geo';
import { textValue } from './snapshot-schema';
import type {
  Coordinates,
  NetworkPattern,
  NetworkStop,
  QualityIssue,
  SourceRecord,
  StopArea,
} from './network.types';

export type GtfsRow = Record<string, string>;
export function sourceRecord(
  namespace: string,
  file: SourceRecord['file'],
  recordId: string,
  recordSubId?: string
): SourceRecord {
  return {
    namespace,
    file,
    recordId,
    ...(recordSubId !== undefined ? { recordSubId } : {}),
  };
}
export function languageCode(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 35 || !value) return null;
  try {
    return Intl.getCanonicalLocales(value)[0] || null;
  } catch {
    return null;
  }
}

/** Station hierarchy is explicit source data, never a coordinate/name clustering rule. */
export function importStops(
  rows: GtfsRow[],
  translations: GtfsRow[],
  namespace: string,
  issues: QualityIssue[]
) {
  if (rows.length > 100000 || translations.length > 100000)
    throw new Error('Stop or translation table exceeds 100000 rows');
  const warn = (reference: string, message: string) =>
    issues.push({ reference, message, severity: 'warning' as const });
  const byId = new Map<string, GtfsRow>(),
    invalid = new Set<string>(),
    samples = new Set<string>();
  const qualify = (id: string) =>
    `${namespace === 'dt4a-2019' ? 'DT4A' : namespace.toUpperCase()}_${id}`;
  for (const row of rows) {
    if (!textValue(row.stop_id, 100) || qualify(row.stop_id).length > 100)
      throw new Error('Missing or oversized GTFS stop identity');
    if (byId.has(row.stop_id)) {
      invalid.add(row.stop_id);
      warn(
        row.stop_id,
        'Stop quarantined: duplicate source identity; neither row takes precedence'
      );
    } else byId.set(row.stop_id, row);
  }
  const stations = new Map<string, StopArea>(),
    stops = new Map<string, NetworkStop>();
  for (const [id, row] of byId) {
    if (invalid.has(id)) continue;
    const kind = row.location_type || '0';
    // This explicit historic source profile contains GPS observations named Unknown.
    if (
      namespace === 'dt4a-2019' &&
      kind === '0' &&
      (!row.stop_name || /^unknown$/i.test(row.stop_name))
    ) {
      samples.add(id);
      continue;
    }
    if (!['0', '1'].includes(kind)) {
      invalid.add(id);
      warn(
        id,
        'Non-platform location excluded from boarding; entrance/node/boarding-area pathway import requires review'
      );
      continue;
    }
    const coordinates: Coordinates = [
      Number(row.stop_lon),
      Number(row.stop_lat),
    ];
    if (
      !textValue(row.stop_name, 255) ||
      !/[\p{L}\p{N}]/u.test(row.stop_name) ||
      !row.stop_lon ||
      !row.stop_lat ||
      !validCoordinates(coordinates) ||
      (kind === '1' && row.parent_station)
    ) {
      invalid.add(id);
      warn(
        id,
        'Stop quarantined: invalid name, coordinates or station hierarchy'
      );
      continue;
    }
    const base = {
      id: qualify(id),
      name: row.stop_name,
      coordinates,
      aliases: [],
      sourceRecord: sourceRecord(namespace, 'stops.txt', id),
    };
    if (kind === '1') stations.set(id, { ...base, boardingPointIds: [] });
    else
      stops.set(id, {
        ...base,
        code: textValue(row.stop_code, 255) ? row.stop_code : qualify(id),
        ...(row.platform_code ? { platformCode: row.platform_code } : {}),
        ...(row.zone_id ? { zoneId: `${namespace}:${row.zone_id}` } : {}),
      });
  }
  for (const [id, stop] of stops) {
    const parent = byId.get(id)!.parent_station;
    if (!parent) continue;
    const station = stations.get(parent);
    if (!station || invalid.has(parent)) {
      invalid.add(id);
      stops.delete(id);
      warn(
        id,
        'Stop quarantined: parent_station must identify a valid station, not a platform, missing record or cycle'
      );
      continue;
    }
    stop.stopAreaId = station.id;
    station.boardingPointIds.push(stop.id);
  }

  // Resolve translations by exact record ID or full source field value. Specific
  // records override field-value translations; conflicts never depend on row order.
  const recordTranslations = new Map<string, Map<string, Set<string>>>();
  const valueTranslations = new Map<string, Map<string, Set<string>>>();
  const unsupported = new Set<string>();
  for (const [index, row] of translations.entries()) {
    if (row.table_name !== 'stops' || row.field_name !== 'stop_name') {
      unsupported.add(`${row.table_name}.${row.field_name}`);
      continue;
    }
    const lang = languageCode(row.language);
    if (
      !lang ||
      !textValue(row.translation, 255) ||
      Boolean(row.record_id) === Boolean(row.field_value) ||
      row.record_sub_id ||
      (row.record_id && !byId.has(row.record_id))
    ) {
      warn(
        `translations:${index + 2}`,
        'Translation quarantined: invalid language, value or source reference'
      );
      continue;
    }
    const target = row.record_id ? recordTranslations : valueTranslations;
    const key = row.record_id || row.field_value;
    const languages = target.get(key) || new Map<string, Set<string>>();
    const values = languages.get(lang) || new Set<string>();
    values.add(row.translation);
    languages.set(lang, values);
    target.set(key, languages);
  }
  for (const field of unsupported)
    warn(
      field,
      'Translation field not supported by this stop-name import profile; review before publication'
    );
  for (const [id, stop] of [...stops.entries(), ...stations.entries()]) {
    const specific = recordTranslations.get(id),
      generic = valueTranslations.get(stop.name);
    const languages = new Set([
      ...(specific?.keys() || []),
      ...(generic?.keys() || []),
    ]);
    const displayNames: Record<string, string> = {};
    for (const lang of languages) {
      const values = specific?.get(lang) || generic!.get(lang)!;
      if (values.size !== 1)
        warn(id, `Translation quarantined: conflicting ${lang} stop names`);
      else displayNames[lang] = [...values][0];
    }
    if (Object.keys(displayNames).length > 30)
      throw new Error('More than 30 stop-name languages');
    if (Object.keys(displayNames).length) stop.displayNames = displayNames;
  }
  return {
    stops,
    invalidStops: invalid,
    samples,
    areasForPatterns(patterns: NetworkPattern[]): StopArea[] {
      const used = new Set(patterns.flatMap((p) => p.stops.map((s) => s.id)));
      return [...stations.values()]
        .map((area) => ({
          ...area,
          boardingPointIds: area.boardingPointIds.filter((id) => used.has(id)),
        }))
        .filter((area) => area.boardingPointIds.length > 0);
    },
  };
}
