/**
 * Vocabulary for the Kigali network layer (agencies, corridors, stops, transit
 * routes). Everything here describes PUBLIC, attributed data - see ATTRIBUTION.md.
 */

/**
 * Where a network record came from. Kept as free-form strings on the entities so
 * a future feed can be added without a migration, but every value we seed today
 * is listed here.
 */
export enum NetworkSource {
  // GoMetro / Digital Transport for Africa / World Bank-GFDRR dry-season GTFS (2019).
  DT4A_2019 = 'dt4a-2019',
  // Ecofleet published corridor map (labels and hub names only, illustrative geometry).
  ECOFLEET_NETWORK_MAP_2026 = 'ecofleet-network-map-2026',
  // Ecofleet published airport shuttle timetable.
  ECOFLEET_AIRPORT_SHUTTLE_2026 = 'ecofleet-airport-shuttle-2026',
  // The New Times, 13 Jan 2026 - headway context only, no stop lists.
  NEW_TIMES_2026 = 'new-times-2026',
}

/**
 * A signed terminal / park (hub) versus an ordinary roadside stop.
 */
export enum StopType {
  HUB = 'hub',
  STOP = 'stop',
}

/**
 * Which days a headway window applies to. GTFS calendars are not imported; the
 * 2019 feed only distinguishes weekday from weekend service.
 */
export enum RouteServiceType {
  WEEKDAY = 'weekday',
  WEEKEND = 'weekend',
  DAILY = 'daily',
}

/**
 * GTFS route_type. The whole Kigali feed is bus (3).
 */
export const ROUTE_TYPE_BUS = 3;
