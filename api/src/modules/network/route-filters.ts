import type { NetworkPattern, NetworkSnapshot } from './network.types';

export interface RouteSummary {
  id: string;
  shortName: string;
  longName: string;
  agency: string;
  patterns: number;
}

export interface RouteListQuery {
  q?: string;
  agency?: string;
  headsign?: string;
}

export function normalizeRouteQuery(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function filterRouteSummaries(
  routes: RouteSummary[],
  snapshot: NetworkSnapshot,
  query: RouteListQuery
): RouteSummary[] {
  const q = normalizeRouteQuery(query.q || '');
  const agency = normalizeRouteQuery(query.agency || '');
  const headsign = normalizeRouteQuery(query.headsign || '');
  const patternsByRoute = new Map<string, NetworkPattern[]>();

  for (const pattern of snapshot.patterns) {
    if (!pattern.enabled) continue;
    const list = patternsByRoute.get(pattern.routeId) ?? [];
    list.push(pattern);
    patternsByRoute.set(pattern.routeId, list);
  }

  return routes.filter((route) => {
    const haystack = normalizeRouteQuery(
      `${route.shortName} ${route.longName} ${route.agency}`
    );
    if (q && !haystack.includes(q)) return false;
    if (agency && normalizeRouteQuery(route.agency) !== agency) return false;
    if (headsign) {
      const matches = (patternsByRoute.get(route.id) ?? []).some((p) =>
        normalizeRouteQuery(p.headsign).includes(headsign)
      );
      if (!matches) return false;
    }
    return true;
  });
}

export function routeAgencies(routes: RouteSummary[]): string[] {
  return [...new Set(routes.map((r) => r.agency))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function routeHeadsigns(snapshot: NetworkSnapshot): string[] {
  return [
    ...new Set(
      snapshot.patterns
        .filter((p) => p.enabled)
        .map((p) => p.headsign.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}
