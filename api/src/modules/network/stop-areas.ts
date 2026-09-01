import { distance } from './geo';
import type {
  Coordinates,
  NetworkSnapshot,
  NetworkStop,
  StopArea,
} from './network.types';

export function stopAreas(snapshot: NetworkSnapshot): StopArea[] {
  return snapshot.stopAreas ?? [];
}

export function boardingPointsForArea(
  snapshot: NetworkSnapshot,
  areaId: string,
  stops: NetworkStop[]
): NetworkStop[] {
  const area = stopAreas(snapshot).find((a) => a.id === areaId);
  if (!area) return [];
  const byId = new Map(stops.map((s) => [s.id, s]));
  return area.boardingPointIds
    .map((id) => byId.get(id))
    .filter((s): s is NetworkStop => Boolean(s));
}

/** Expand a terminal or area selection into concrete boarding-point stop IDs. */
export function expandStopSelection(
  snapshot: NetworkSnapshot,
  stopId: string | undefined,
  stops: NetworkStop[]
): string[] {
  if (!stopId) return [];
  const area = stopAreas(snapshot).find((a) => a.id === stopId);
  if (area) return area.boardingPointIds;
  // A specific platform remains specific. Only a terminal selection expands;
  // sharing a parent does not establish a safe pedestrian crossing.
  return [stopId];
}

/** Remove duplicate source stops so one platform does not crowd out useful candidates. */
export function dedupeCandidateStops(stopIds: string[]): string[] {
  return [...new Set(stopIds)];
}

/** Snapshot stops within walking distance of a coordinate endpoint (GeoJSON order). */
export function nearbyStopIds(
  stops: NetworkStop[],
  coordinates: Coordinates,
  maxWalkMeters: number
): string[] {
  return stops
    .filter((stop) => distance(stop.coordinates, coordinates) <= maxWalkMeters)
    .sort(
      (a, b) =>
        distance(a.coordinates, coordinates) -
          distance(b.coordinates, coordinates) || a.id.localeCompare(b.id)
    )
    .map((stop) => stop.id);
}

/**
 * Put nearby stops with a direct, correctly directed link to an explicitly
 * selected endpoint first. Distance ordering is retained within both groups.
 */
export function prioritizeDirectCandidates(
  ids: string[],
  snapshot: NetworkSnapshot,
  endpointIds: string[],
  reversed: boolean
): string[] {
  const candidates = dedupeCandidateStops(ids);
  if (!endpointIds.length) return candidates;

  const endpoints = new Set(endpointIds),
    connected = new Set<string>();
  for (const pattern of snapshot.patterns.filter((p) => p.enabled)) {
    for (const [index, stop] of pattern.stops.entries()) {
      if (!endpoints.has(stop.id)) continue;
      const reachable = reversed
        ? pattern.stops.slice(index + 1)
        : pattern.stops.slice(0, index);
      reachable.forEach((candidate) => connected.add(candidate.id));
    }
  }
  return [
    ...candidates.filter((id) => connected.has(id)),
    ...candidates.filter((id) => !connected.has(id)),
  ];
}

/** Retain service diversity without merging source platforms by name/proximity. */
export function selectBoardingCandidates(
  ids: string[],
  snapshot: NetworkSnapshot,
  limit: number,
  reversed: boolean
): string[] {
  const services = new Map<string, Set<string>>();
  for (const pattern of snapshot.patterns.filter((p) => p.enabled)) {
    const occurrences = reversed
      ? pattern.stops.slice(1)
      : pattern.stops.slice(0, -1);
    for (const stop of occurrences) {
      const value = services.get(stop.id) || new Set<string>();
      value.add(pattern.id);
      services.set(stop.id, value);
    }
  }
  const candidates = dedupeCandidateStops(ids).filter((id) => services.has(id));
  const selected: string[] = [],
    covered = new Set<string>();
  for (const id of candidates) {
    if (selected.length === limit) break;
    if ([...services.get(id)!].some((service) => !covered.has(service))) {
      selected.push(id);
      services.get(id)!.forEach((service) => covered.add(service));
    }
  }
  for (const id of candidates) {
    if (selected.length === limit) break;
    if (!selected.includes(id)) selected.push(id);
  }
  return selected;
}

export function terminalSearchResults(
  snapshot: NetworkSnapshot,
  query: string,
  normalize: (value: string) => string
): NetworkStop[] {
  const q = normalize(query);
  if (!q) return [];
  return stopAreas(snapshot)
    .filter(
      (area) =>
        normalize(area.name).includes(q) ||
        [...area.aliases, ...Object.values(area.displayNames ?? {})].some(
          (alias) => normalize(alias).includes(q)
        )
    )
    .map((area) => ({
      id: area.id,
      code: area.id,
      name: area.name,
      aliases: area.aliases,
      coordinates: area.coordinates,
      displayNames: area.displayNames,
      sourceRecord: area.sourceRecord,
    }));
}
