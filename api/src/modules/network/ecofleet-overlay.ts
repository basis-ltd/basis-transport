import { createHash } from 'crypto';
import { NetworkSource } from '../../constants/network.constants';
import { normalizeName } from './geo';
import type {
  Coordinates,
  NetworkPattern,
  NetworkSnapshot,
  PatternStop,
} from './network.types';

/** Public Ecofleet map and route-card pages. Identity overlay only — not live GPS. */
export const ECOFLEET_NETWORK_MAP_URL = 'https://ecofleet.rw/network-map-2/';
export const ECOFLEET_BUS_ROUTES_URL = 'https://ecofleet.rw/bus-routes/';

export interface EcofleetPublishedStop {
  name: string;
  /** GeoJSON [longitude, latitude]. Illustrative published map positions, not surveyed GIS. */
  coordinates: Coordinates;
}

export interface EcofleetPublishedCorridor {
  code: string;
  name: string;
  route: string;
  color: string;
  sourceUrl: string;
  stops: EcofleetPublishedStop[];
}

const leaflet = (lat: number, lng: number): Coordinates => [lng, lat];

/**
 * Corridor identities currently published on network-map-2 (A–G) plus the
 * Nyamirambo — Downtown Kigali route card on /bus-routes/. Geometry is the
 * operator's illustrative map, cited as Ecofleet public map.
 */
export const ECOFLEET_PUBLISHED_CORRIDORS: EcofleetPublishedCorridor[] = [
  {
    code: 'A',
    name: 'Corridor A',
    route: 'Remera ↔ Downtown',
    color: '#1a7c3e',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Remera Terminal', coordinates: leaflet(-1.9441, 30.1127) },
      { name: 'Remera Taxi Park', coordinates: leaflet(-1.948, 30.108) },
      { name: 'UTC', coordinates: leaflet(-1.953, 30.104) },
      { name: 'Sonatubes', coordinates: leaflet(-1.9568, 30.0985) },
      { name: 'Nyabugogo', coordinates: leaflet(-1.9595, 30.093) },
      { name: 'CBD East', coordinates: leaflet(-1.962, 30.088) },
      { name: 'Downtown Terminal', coordinates: leaflet(-1.9641, 30.0606) },
    ],
  },
  {
    code: 'B',
    name: 'Corridor B',
    route: 'Kicukiro ↔ Nyabugogo',
    color: '#1e4fa0',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Kicukiro Centre', coordinates: leaflet(-1.999, 30.103) },
      { name: 'Gikondo', coordinates: leaflet(-1.992, 30.099) },
      { name: 'Rwandex', coordinates: leaflet(-1.985, 30.095) },
      { name: 'Nyanza', coordinates: leaflet(-1.978, 30.092) },
      { name: 'Kimisagara', coordinates: leaflet(-1.972, 30.088) },
      { name: 'Gitega', coordinates: leaflet(-1.966, 30.084) },
      { name: 'Biryogo', coordinates: leaflet(-1.96, 30.08) },
      { name: 'Nyabugogo Market', coordinates: leaflet(-1.957, 30.072) },
      { name: 'Nyabugogo Terminal', coordinates: leaflet(-1.9541, 30.0606) },
    ],
  },
  {
    code: 'C',
    name: 'Corridor C',
    route: 'Gisozi ↔ CBD',
    color: '#1a9e7a',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Gisozi Terminal', coordinates: leaflet(-1.9215, 30.065) },
      { name: 'Batsinda', coordinates: leaflet(-1.928, 30.068) },
      { name: 'Vision 2020', coordinates: leaflet(-1.935, 30.071) },
      { name: 'Kimihurura', coordinates: leaflet(-1.942, 30.074) },
      { name: 'Kacyiru', coordinates: leaflet(-1.949, 30.075) },
      { name: 'Gasabo', coordinates: leaflet(-1.952, 30.073) },
      { name: 'Kigali City', coordinates: leaflet(-1.9565, 30.07) },
      { name: 'CBD Terminal', coordinates: leaflet(-1.9595, 30.0606) },
    ],
  },
  {
    code: 'D',
    name: 'Corridor D',
    route: 'Gikondo ↔ Downtown',
    color: '#e05a1e',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Gikondo Terminal', coordinates: leaflet(-1.987, 30.095) },
      { name: 'Sonatubes', coordinates: leaflet(-1.981, 30.09) },
      { name: 'Rwandex', coordinates: leaflet(-1.975, 30.085) },
      { name: 'Nyabugogo', coordinates: leaflet(-1.97, 30.08) },
      { name: 'Gitega', coordinates: leaflet(-1.966, 30.077) },
      { name: 'Biryogo', coordinates: leaflet(-1.963, 30.072) },
      { name: 'Muhima', coordinates: leaflet(-1.961, 30.067) },
      { name: 'Downtown Terminal', coordinates: leaflet(-1.96, 30.0606) },
    ],
  },
  {
    code: 'E',
    name: 'Corridor E',
    route: 'Kimironko ↔ Nyabugogo',
    color: '#8b3cb8',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Kimironko Terminal', coordinates: leaflet(-1.9325, 30.117) },
      { name: 'Kibagabaga', coordinates: leaflet(-1.938, 30.112) },
      { name: 'Gahanga', coordinates: leaflet(-1.943, 30.106) },
      { name: 'Gisimenti', coordinates: leaflet(-1.948, 30.101) },
      { name: 'UTC', coordinates: leaflet(-1.953, 30.096) },
      { name: 'Sonatubes', coordinates: leaflet(-1.957, 30.09) },
      { name: 'Nyabugogo', coordinates: leaflet(-1.958, 30.084) },
      { name: 'Gitega', coordinates: leaflet(-1.957, 30.077) },
      { name: 'Muhima', coordinates: leaflet(-1.9555, 30.07) },
      { name: 'Nyabugogo Terminal', coordinates: leaflet(-1.9541, 30.0606) },
    ],
  },
  {
    code: 'F',
    name: 'Corridor F',
    route: 'Kanombe ↔ City Centre',
    color: '#c98a00',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Kanombe Airport', coordinates: leaflet(-1.968, 30.139) },
      { name: 'Busanza', coordinates: leaflet(-1.966, 30.13) },
      { name: 'Gisimenti', coordinates: leaflet(-1.964, 30.12) },
      { name: 'Remera', coordinates: leaflet(-1.963, 30.11) },
      { name: 'UTC', coordinates: leaflet(-1.962, 30.099) },
      { name: 'Sonatubes', coordinates: leaflet(-1.961, 30.08) },
      { name: 'City Centre', coordinates: leaflet(-1.96, 30.0606) },
    ],
  },
  {
    code: 'G',
    name: 'Corridor G',
    route: 'Nyamata ↔ Downtown',
    color: '#c0272d',
    sourceUrl: ECOFLEET_NETWORK_MAP_URL,
    stops: [
      { name: 'Nyamata Terminal', coordinates: leaflet(-2.025, 30.065) },
      { name: 'Rilima', coordinates: leaflet(-2.01, 30.064) },
      { name: 'Ruhuha', coordinates: leaflet(-1.996, 30.063) },
      { name: 'Gashora', coordinates: leaflet(-1.985, 30.063) },
      { name: 'Birembo', coordinates: leaflet(-1.976, 30.062) },
      { name: 'Rebero', coordinates: leaflet(-1.97, 30.0615) },
      { name: 'Muhima', coordinates: leaflet(-1.965, 30.061) },
      { name: 'Nyabugogo', coordinates: leaflet(-1.962, 30.0608) },
      { name: 'Downtown', coordinates: leaflet(-1.96, 30.0606) },
    ],
  },
  {
    code: 'NYA',
    name: 'Nyamirambo — Downtown Kigali',
    route: 'Nyamirambo — Downtown Kigali',
    color: '#0f6b4c',
    sourceUrl: 'https://ecofleet.rw/bus-route/nyamirambo-downtown-kigali/',
    stops: [
      { name: 'Nyamirambo Taxi Park', coordinates: [30.042113, -1.980059] },
      { name: 'Downtown Terminal', coordinates: leaflet(-1.9641, 30.0606) },
    ],
  },
];

export const ECOFLEET_PUBLISHED_ROUTE_LABELS = [
  ...new Set(ECOFLEET_PUBLISHED_CORRIDORS.map((c) => c.route)),
];

const overlayUuid = (key: string): string => {
  const h = createHash('sha256')
    .update(`ecofleet-overlay:${key}`)
    .digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

export const ecofleetHubId = (name: string): string =>
  `ecofleet:${normalizeName(name).replace(/ /g, '-')}`;

function hubs(): Map<string, EcofleetPublishedStop & { id: string }> {
  const byId = new Map<string, EcofleetPublishedStop & { id: string }>();
  for (const corridor of ECOFLEET_PUBLISHED_CORRIDORS) {
    for (const stop of corridor.stops) {
      const id = ecofleetHubId(stop.name);
      if (!byId.has(id)) byId.set(id, { ...stop, id });
    }
  }
  return byId;
}

function patternStops(names: string[]): PatternStop[] {
  const catalog = hubs();
  return names.map((name, sequence) => {
    const hub = catalog.get(ecofleetHubId(name))!;
    return {
      id: hub.id,
      code: hub.id,
      name: hub.name,
      aliases: [name].filter((alias) => alias !== hub.name),
      coordinates: hub.coordinates,
      sequence,
      sourceSequence: sequence + 1,
      elapsedSeconds: sequence * 180,
      shapeIndex: sequence,
    };
  });
}

function overlayPattern(
  corridor: EcofleetPublishedCorridor,
  direction: '0' | '1'
): NetworkPattern {
  const names =
    direction === '0'
      ? corridor.stops.map((s) => s.name)
      : [...corridor.stops].reverse().map((s) => s.name);
  const stops = patternStops(names);
  const headsign = stops[stops.length - 1].name;
  const key = `${corridor.code}:${direction}`;
  return {
    id: overlayUuid(`pattern:${key}`),
    routeId: `ecofleet-corridor-${corridor.code}`,
    routeNumber: corridor.code,
    routeName: corridor.route,
    agency: 'Ecofleet',
    sourceTripId: `ecofleet-${key}`,
    sourceShapeId: `ecofleet-shape-${key}`,
    direction,
    headsign,
    stops,
    geometry: stops.map((s) => s.coordinates),
    service: {
      sourceId: `ecofleet-${corridor.code}`,
      validFrom: '2026-01-01',
      validTo: '2027-12-31',
      weekdays: [true, true, true, true, true, true, true],
      exceptions: [],
      windows: [],
      timezone: 'Africa/Kigali',
    },
    fare: null,
    enabled: true,
  };
}

/** Enabled connecting patterns for every published Ecofleet corridor/route card, both directions. */
export function ecofleetOverlayPatterns(): NetworkPattern[] {
  return ECOFLEET_PUBLISHED_CORRIDORS.flatMap((corridor) => [
    overlayPattern(corridor, '0'),
    overlayPattern(corridor, '1'),
  ]);
}

export function ecofleetOverlaySnapshot(): NetworkSnapshot {
  return { patterns: ecofleetOverlayPatterns(), transfers: [] };
}

export function overlayRouteIds(): Set<string> {
  return new Set(
    ECOFLEET_PUBLISHED_CORRIDORS.map((c) => `ecofleet-corridor-${c.code}`)
  );
}

/**
 * Merge Ecofleet published connecting corridors into a snapshot without
 * duplicating overlay route IDs or mutating the input.
 */
export function withEcofleetOverlay(
  snapshot: NetworkSnapshot
): NetworkSnapshot {
  const existing = new Set(
    snapshot.patterns
      .map((p) => p.routeId)
      .filter((id) => overlayRouteIds().has(id))
  );
  const added = ecofleetOverlayPatterns().filter(
    (p) => !existing.has(p.routeId)
  );
  if (!added.length) return snapshot;
  return {
    ...snapshot,
    patterns: [...snapshot.patterns, ...added],
  };
}

export const ECOFLEET_OVERLAY_SOURCE = NetworkSource.ECOFLEET_NETWORK_MAP_2026;
