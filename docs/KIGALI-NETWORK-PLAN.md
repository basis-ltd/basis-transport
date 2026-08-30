# Kigali network layer — implementation plan for Cursor

Hand this file plus `api/data/kigali-network-seed.json` to a local Cursor agent. Do **not** call Ecofleet's live API. Do **not** open a cloud agent. Implement in `/Users/nishimweprince/Documents/Basis/Apps/basis-transport`.

Generated 30 Aug 2026. Goal: a job-ready demo that models Kigali buses better than a clone. GTFS-shaped network, attributed public data, existing operational trips left intact.

## 0. What we already learned (do not re-research)

### Ecofleet Remera to Downtown (live planner, 30 Aug 2026 ~01:06 CDT)

Public undocumented API (QA only, not a seed source):

- Base: `https://api.ecofleet.rw/api/v1`
- Stop search: `GET /journey-planner/stops/search?search={q}&limit=10`
- Plan: `GET /journey-planner/plan?originLatitude=&originLongitude=&destinationLatitude=&destinationLongitude=`
- `GET /routes` returns 404
- Planner GETs return 200 with no token. `/auth/*` needs Bearer. Socket.IO at `https://api.ecofleet.rw/journey-planner` is live GPS, out of scope.

Autocomplete: Remera = `BP_27` bus park (-1.9586, 30.1190). Downtown = `BP_23`.

Three itineraries, no transfer, fares ~460 RWF:

- **104F** KABUGA BUS PARK - KIBAYA - DOWNTOWN (VIA RWANDEX). Board `ST_796` SP_REMERA_OUTSIDE (~300 m). 16 stops, 9.2 km, 463 RWF.
- **124R** KABUGA BUS PARK - MURINDI - DOWNTOWN - KIYOVU (VIA RWANDEX). Same board. 16 stops, 9.23 km, 465 RWF.
- **302F** KIMIRONKO BUS PARK - DOWNTOWN - CBD. Board `ST_1218` STADE (~900 m walk). 14 stops, 9.14 km, 461 RWF.

Live IDs use F/R suffixes. 2019 GTFS uses plain `104` / `302`. Do not merge IDs.

Network map is client-side JS, not an XHR dump: https://ecofleet.rw/network-map-2/

### Public data to seed

- DT4A / GoMetro / World Bank-GFDRR dry GTFS 2019 (mdb-1961 inactive): 3 agencies, 55 routes, 220 trips, 457 named stops (2607 raw rows; 1749 named Unknown, skip those). Frequencies not clock-face. Expired calendar 20190225-20210225. Do not import fares.
- Zip already parsed into `kigali-network-seed.json`. Original: https://gitlab.com/digitaltransport/data/africa/kigali/-/raw/main/GTFS%20Datasets/Kigali_GTFS.zip
- Ecofleet 7 corridors: marketing labels A-G, hub names, colors. Geometry is illustrative, not surveyed GIS.
- Ecofleet airport shuttle: only public clock-face timetable. KIA to Serena, June 2026, 5000 RWF, about every 2h 05:00-01:00. https://ecofleet.rw/airport-shuttle/
- New Times 13 Jan 2026: 41 scheduled routes; peak 06:00-09:00 and 17:00-20:00 often 10 min on Downtown / Kimironko / Nyabugogo / Remera / Kacyiru; off-peak 20-45 min. Notes only, do not invent stop lists.
- KT Press 12 Mar 2024: City of Kigali 7 corridors, 18 operators.

Do not seed from api.ecofleet.rw vehicle arrays, Tap and Go, busmaps.com, or HanoBus data/.

Counts disagree on purpose: Tap and Go "7 lines" = corridors. New Times "41 routes" = operational lines. GTFS 55 routes / RFTC 28 = 2019 feed. Keep all three with source + asOf.

### Current app (read-only inspect 30 Aug 2026)

Stack: NestJS 10 + TypeORM 0.3 + Postgres + PostGIS. synchronize true. No migrations. API port 8080, prefix `/api`. Client Vite 5173. DB `basis_transport` localhost:5432.

Entities: AbstractEntity (uuid, created_at, updated_at, created_by_id, last_updated_by_id), Location, Trip, UserTrip, TransportCard, User, Role, Permission, UserRole, RolePermission, AuditLog, HttpAuditLog, Log.

locations: name, optional description, optional address geometry Point. Trip OD pin, not a GTFS stop.

trips: reference_id (TRIP-xxxxx), start_time, end_time, location_from_id required, location_to_id optional, status PENDING | IN_PROGRESS | COMPLETED | CANCELLED, total_capacity, current_location geometry. Ad-hoc vehicle journey. Do not rename this table.

user_trips: passenger board/alight geo. Not stop_times.

transport_cards: AC_GROUP | CENTRIKA. Not fare rules.

Seeds: seed:permissions, seed:roles, seed:super-admin, seed (those three). Super admin info@basis.rw.

Live when inspected: GET /api/dashboard/public/landing-stats commutes 0 users 1. GET /api/trips/nearby public, PostGIS distance to origin location, was empty. GET /api/trips and /api/locations JWT 401. GET /api/routes, /api/stops, /api/vehicles, /api/health are 404.

Nearby ranks by locationFrom.address, not trips.current_location. Hunch (verify): trip writes may be SUPER_ADMIN-only.

Client: VITE_API_URL or http://localhost:8080/api.

## 1. Product outcome

A passenger can list Kigali corridors, routes, and stops, open a route with ordered stops and headways, and still use the existing create/join trip A to B flow.

v1 is not a full Ecofleet clone (no live GPS, no Tap and Go). Differentiator: historic numbered routes plus stop sequences from GTFS, labeled 2026 corridors, real airport timetable, all attributed.

## 2. Schema (new tables)

Keep trips / user_trips / locations. Add GTFS-inspired tables. Follow AbstractEntity. Register in api/src/database/database.module.ts.

Agency: name unique, timezone default Africa/Kigali, source, as_of date nullable. Seed KBS, Royal Express, RFTC, Ecofleet.

Corridor: code unique A-G, name, from_hub, to_hub, color optional, source.

Stop (new entity, do not overload Location): code unique, name, location geometry Point SRID 4326 nullable, stop_type hub or stop, source.

Route: agency_id FK, corridor_id FK nullable, short_name, long_name, description, direction nullable, route_type default 3, source, as_of. Unique (short_name, source) so historic 104 and a future 104F can coexist. Optional later: trips.route_id nullable FK. Skip vehicles.

RouteStop: route_id, stop_id, sequence. Unique (route_id, sequence).

RouteFrequency: route_id, start_time, end_time as HH:MM:SS, headway_secs, service weekday or weekend or daily, source, notes nullable.

Skip fare tables, shapes v1, calendar_dates, GTFS-RT, vehicle plates.

Keep synchronize true. Boot API once so new tables exist, then seed.

Naming landmine: Nest/Express Route. Use entity class TransitRoute, table transit_routes, HTTP still /api/routes. Stop file can be network-stop.entity.ts.
## 3. Public HTTP API

No JWT. Envelope { message, data }.

- GET /api/agencies
- GET /api/corridors
- GET /api/routes (q, corridor, agency, source)
- GET /api/routes/:id (ordered stops and frequencies)
- GET /api/stops (q, optional lat lng nearby)
- GET /api/health

Do not break trips, trips/nearby, locations, or auth.
## 4. Seed

## 5. Corridors to seed
A Remera-Downtown #1a7c3e: Remera Terminal, Remera Taxi Park, UTC, Sonatubes, Nyabugogo, CBD East, Downtown Terminal
B Kicukiro-Nyabugogo #1e4fa0: Kicukiro Centre, Gikondo, Rwandex, Nyanza, Kimisagara, Gitega, Biryogo, Nyabugogo Market, Nyabugogo Terminal
C Gisozi-CBD #1a9e7a: Gisozi Terminal, Batsinda, Vision 2020, Kimihurura, Kacyiru, Gasabo, Kigali City, CBD Terminal
D Gikondo-Downtown #e05a1e: Gikondo Terminal, Sonatubes, Rwandex, Nyabugogo, Gitega, Biryogo, Muhima, Downtown Terminal
E Kimironko-Nyabugogo #8b3cb8: Kimironko Terminal, Kibagabaga, Gahanga, Gisimenti, UTC, Sonatubes, Nyabugogo, Gitega, Muhima, Nyabugogo Terminal
F Kanombe-City Centre #c98a00: Kanombe Airport, Busanza, Gisimenti, Remera, UTC, Sonatubes, City Centre
G Nyamata-Downtown #c0272d: Nyamata Terminal, Rilima, Ruhuha, Gashora, Birembo, Rebero, Muhima, Nyabugogo, Downtown
Cite Ecofleet network map. Corridor E Gahanga listing is marketing geometry. Hubs: Remera -1.9583,30.1188 Downtown -1.9436,30.0572 Kimironko -1.9499,30.1253 Nyabugogo -1.9408,30.0445
## 6. Files to add
