import { normalizeRouteQuery } from './route-filters';
import type { Coordinates, NetworkSnapshot } from './network.types';

export interface NetworkMapQuery {
  q?: string;
  agency?: string;
  headsign?: string;
  routeId?: string;
}

// Public overview budgets, independent of the passenger's routing preferences.
export const MAP_LIMITS = {
  patterns: 100,
  points: 128,
  stops: 200,
  totalStops: 2000,
  routes: 500,
};

function overview(points: Coordinates[]): Coordinates[] {
  if (points.length <= MAP_LIMITS.points) return points;
  return Array.from(
    { length: MAP_LIMITS.points },
    (_, i) =>
      points[Math.round((i * (points.length - 1)) / (MAP_LIMITS.points - 1))]
  );
}

/** A bounded display projection only; never use generalized lines for routing. */
export function projectNetworkMap(
  snapshot: NetworkSnapshot,
  query: NetworkMapQuery
) {
  const enabled = snapshot.patterns.filter((p) => p.enabled);
  const routeMap = new Map<
    string,
    { id: string; number: string; name: string }
  >();
  for (const p of enabled)
    routeMap.set(p.routeId, {
      id: p.routeId,
      number: p.routeNumber,
      name: p.routeName,
    });
  const routes = [...routeMap.values()].sort(
    (a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true }) ||
      a.id.localeCompare(b.id)
  );
  const q = normalizeRouteQuery(query.q || '');
  const agency = normalizeRouteQuery(query.agency || '');
  const headsign = normalizeRouteQuery(query.headsign || '');
  const matching = enabled
    .filter(
      (p) =>
        (!query.routeId || p.routeId === query.routeId) &&
        (!q ||
          normalizeRouteQuery(
            `${p.routeNumber} ${p.routeName} ${p.agency} ${p.headsign}`
          ).includes(q)) &&
        (!agency || normalizeRouteQuery(p.agency) === agency) &&
        (!headsign || normalizeRouteQuery(p.headsign).includes(headsign))
    )
    .sort(
      (a, b) =>
        a.routeNumber.localeCompare(b.routeNumber, undefined, {
          numeric: true,
        }) ||
        a.headsign.localeCompare(b.headsign) ||
        a.id.localeCompare(b.id)
    );
  let remainingStops = MAP_LIMITS.totalStops;
  const patterns = matching.slice(0, MAP_LIMITS.patterns).map((p) => {
    const sourceShape = Boolean(p.geometry && p.geometry.length >= 2);
    const points = sourceShape
      ? p.geometry!
      : p.stops.map((s) => s.coordinates);
    const stops = p.stops
      .slice(0, Math.min(MAP_LIMITS.stops, remainingStops))
      .map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        coordinates: s.coordinates,
        sequence: s.sequence,
      }));
    remainingStops -= stops.length;
    return {
      id: p.id,
      routeId: p.routeId,
      routeNumber: p.routeNumber,
      routeName: p.routeName,
      agency: p.agency,
      direction: p.direction,
      headsign: p.headsign,
      geometry: overview(points),
      geometryQuality: sourceShape
        ? ('source-shape' as const)
        : ('schematic' as const),
      generalized: points.length > MAP_LIMITS.points,
      stops,
      stopCount: p.stops.length,
      stopsTruncated: stops.length < p.stops.length,
    };
  });
  return {
    patterns,
    totalPatterns: matching.length,
    totalRoutes: new Set(matching.map((p) => p.routeId)).size,
    truncated:
      patterns.length < matching.length ||
      patterns.some((p) => p.stopsTruncated),
    limits: MAP_LIMITS,
    filters: {
      routes: routes.slice(0, MAP_LIMITS.routes),
      routesTruncated: routes.length > MAP_LIMITS.routes,
      agencies: [...new Set(enabled.map((p) => p.agency))]
        .sort()
        .slice(0, MAP_LIMITS.routes),
      headsigns: [...new Set(enabled.map((p) => p.headsign).filter(Boolean))]
        .sort()
        .slice(0, MAP_LIMITS.routes),
    },
  };
}
