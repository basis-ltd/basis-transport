# Ecofleet / Bisi public API notes

Inspected 30 Aug 2026 (CDT) from public HTML/JS only. No login, no password guessing, no authenticated scrape.

## Sites

| URL | What it is |
|---|---|
| https://bisi.ecofleet.rw/ | Passenger trip planner (Next.js, “no sign-up needed”). Canonical/OG URL in HTML is `https://pis.rmsoft.rw`. Built by RMSoft Ltd. |
| https://pis.rmsoft.rw | Same app (schema.org + canonical). |
| https://ecofleet.rw/ | Marketing / WordPress (Hello Elementor). |
| https://ecofleet.rw/network-map-2/ | Official “All Networks Map” (Leaflet). **Client-side JS data, not an XHR API.** |
| https://ecofleet.rw/airport-shuttle/ | Public HTML timetable (KIA ↔ Serena). |
| https://api.ecofleet.rw | Backend used by Bisi. |

## Auth model (from JS)

Client: `/_next/static/chunks/3t_fpt-wtl8km.js`

```
axios.create({ baseURL: "https://api.ecofleet.rw/api/v1" })
request interceptor: if localStorage.accessToken → Authorization: Bearer <token>
401 → POST /auth/refresh then retry
```

Account endpoints (auth required; **do not call except to confirm 401**):

- `POST /auth/login`
- `POST /auth/sign-up`
- `GET  /auth/me`
- `POST /auth/logout` (body `{ refreshToken }`)
- `POST /auth/forgot-password`
- `POST /auth/verify-otp`
- `POST /auth/reset-password`
- `POST /auth/refresh`

The landing copy says planning needs no sign-up. Journey-planner **GET**s work without a token (200 samples below). Stop if any call returns 401.

## REST base

`https://api.ecofleet.rw/api/v1`

Unauthenticated probe of the host (this session):

| Path | Status | Notes |
|---|---|---|
| `GET /` | 404 | Nest-style `Cannot GET /` JSON envelope |
| `GET /api/v1` | **200** | `{"status":"success","data":"Hello World!"}` — **no auth** |
| `GET /api/v1/routes` | 404 | JS still calls `GET /routes` (`fetchScheduledRoutes`). Path not mounted (or renamed). **Not 401.** |

Envelope used by live endpoints:

```json
{"status":"success","statusCode":200,"message":"Request was successful","data": { ... }}
```

## Journey-planner endpoints (from public JS)

Client: `/_next/static/chunks/1br2h4nl-84h2.js`  
Exports: `fetchScheduledRoutes`, `fetchNearbyRoutes`, `searchRoutesByCoordinates`, `fetchRouteStops`, `searchStops`.

All relative to `https://api.ecofleet.rw/api/v1`:

### 1. Autocomplete / stop search — **public GET**

```
GET /journey-planner/stops/search?search={q}&limit={n}
```

UI function: `searchStops(q, limit=10)`.

Sample (saved `remera.json`):

```json
{
  "status": "success",
  "statusCode": 200,
  "data": {
    "results": [
      {"id":"BP_27","entityType":"bus_park","name":"Remera","latitude":-1.9586370701624993,"longitude":30.118995113046545},
      {"id":"ST_840","entityType":"stop","name":"Remera Station","latitude":-1.9591863550767485,"longitude":30.119858085641415},
      {"id":"ST_796","entityType":"stop","name":"SP_REMERA_OUTSIDE","latitude":-1.96061,"longitude":30.11989}
    ],
    "total": 3,
    "defaultEntityId": "BP_27"
  }
}
```

Downtown sample (`downtown.json`): `BP_23` / `bus_park` / “Downtown”.

Entity types seen: `bus_park`, `stop`. IDs: `BP_*`, `ST_*`.

The web UI **also** calls Google Places Autocomplete (`includedRegionCodes: ["rw"]`) when stop search returns fewer than 3 hits. Maps key is `NEXT_PUBLIC_GOOGLE_MAPS_KEY` (client-side; do not reuse).

### 2. Trip planning — **public GET**

```
GET /journey-planner/plan
  ?originLatitude=
  &originLongitude=
  &destinationLatitude=
  &destinationLongitude=
  &maxRoutes=   (optional)
```

UI function: `searchRoutesByCoordinates`.

Sample truncated from `plan.json` (Remera park → Downtown, 30 Aug 2026 ~01:06 CDT). Live vehicle plates omitted here; schema is:

```json
{
  "status": "success",
  "data": {
    "routes": [
      {
        "routeId": 120,
        "routeName": "104F",
        "routeCode": "104",
        "routeLongName": "KABUGA BUS PARK -KIBAYA- DOWNTOWN  (VIA RWANDEX)",
        "boardingStops": [{"stopId":"ST_796","name":"SP_REMERA_OUTSIDE","sequence":15, "latitude":-1.96061,"longitude":30.11989}],
        "destinationStops": [{"stopId":"BP_23","name":"Downtown","sequence":30,"fare":463}],
        "numberOfStops": 16,
        "vehicleCount": 3,
        "activeVehicles": [{"vehicleId":"…","currentLatitude":0,"currentLongitude":0,"speed":0,"etaToBoardingMinutes":0,"motionStatus":"moving|parked|stop","currentStopName":"…"}],
        "routeDistance": 9.2,
        "fare": 463,
        "isConnecting": false
      }
    ],
    "totalRoutes": 3,
    "origin": {"latitude": -1.9586, "longitude": 30.1189},
    "destination": {"latitude": -1.9436, "longitude": 30.0572}
  }
}
```

Observed live route codes (Aug 2026), **not** the 2019 GTFS numbering: `104F`, `124R`, `302F`. Fares ~460 RWF Remera→Downtown. Direction suffixes `F`/`R`.

Full sample on disk: `/workspace/ecofleet/plan.json`. Treat as a **snapshot of a live operator API**, not a dump to republish.

### 3. Nearby routes

```
GET /journey-planner/nearby-routes?latitude=&longitude=&limit=3
```

UI: `fetchNearbyRoutes`. Same envelope expected. Not re-probed after `/routes` 404.

### 4. Route stops between two stops

```
GET /journey-planner/route-stops?routeId=&originStopId=&destinationStopId=
```

UI: `fetchRouteStops`. Not re-probed.

### 5. Scheduled routes list

```
GET /routes   → fetchScheduledRoutes()
```

**404** on 30 Aug 2026. Do not scan sibling paths.

## Realtime (Socket.IO)

Client: `/_next/static/chunks/37zfozvj56pvo.js`

```
const t_ = "https://api.ecofleet.rw"
io(`${t_}/journey-planner`, { transports: ["websocket","polling"], reconnection: true })
```

Events observed in JS (subscribe only if building against a documented public API; this is operator realtime):

- client emit `subscribe:route-tracking` `{ routeId, boardingStopId, destinationStopId }`
- client emit `unsubscribe:route-tracking`
- server `tracking:subscribed` `{ vehicleCount }`
- server messages `type: "VEHICLE_UPDATE"` / `"VEHICLE_PASSED_BOARDING"`

localStorage key `ptis:continue-tracking` (18e5 ms TTL).

**Did not open a Socket.IO session.** Realtime is operator-owned; do not scrape vehicle GPS as a seed dataset.

## Network map — no API

https://ecofleet.rw/network-map-2/ embeds `const CORRIDORS = [ A…G ]` and `const HUBS` in an inline script. Leaflet + OSM tiles. WP REST `/wp-json/wp/v2/pages/452` is page HTML only.

Corridors (simplified marketing geometry; **not** the 41 operational lines):

| ID | Published name | Stops (count) | Fare chip | Time |
|---|---|---|---|---|
| A | Remera ↔ Downtown | 7 | 250 Rwf | 22 min |
| B | Kicukiro ↔ Nyabugogo | 9 | 300 | 35 |
| C | Gisozi ↔ CBD | 8 | 250 | 30 |
| D | Gikondo ↔ Downtown | 8 | 250 | 28 |
| E | Kimironko ↔ Nyabugogo | 10 | 300 | 40 |
| F | Kanombe ↔ City Centre | 7 | 300 | 38 |
| G | Nyamata ↔ Downtown | 9 | 300 | 45 |

Hubs: Nyabugogo Interchange (−1.9541, 30.0606), CBD Interchange, Sonatubes Hub.

Snippet: `/workspace/ecofleet/network-map-corridors.js.txt`

Coordinates look **rounded / illustrative** (Corridor E lists “Gahanga” on a Kimironko–Nyabugogo line). Use as a corridor **label set**, not as stop geometry.

## Airport shuttle — public HTML, no API

https://ecofleet.rw/airport-shuttle/

- Route: KIA ↔ Serena Hotel via Chez Lando, Gishushu, KABC, Park Inn, Urban Blue, BPR
- Hours: daily 05:00–01:00
- Fare: 5,000 RWF (staff 1,500 with ID)
- Payment: Tap & Go, Visa/MC, MTN/Airtel MoMo
- Table titled **“Airport Shuttle — June 2026”** with per-weekday KIA/SER departure times (first KIA ~00:23–01:03; SER first ~05:01–05:41; then ~2h cadence)

This is the only **clock-face public timetable** Ecofleet publishes in HTML.

## What is *not* a public API

- No OpenAPI/Swagger at `/docs` (not fetched after root 404; do not brute-force).
- No official Ecofleet Bisi developer docs found.
- ITS tender (Sep 2025) *requires a future supplier* to publish GTFS static + GTFS-RT via authenticated, rate-limited REST. That is a procurement spec, not a live feed. Source: Ecofleet ITS ToR, proposals due 15 Sep 2025, ops target 1 Oct 2025. [greatrwandajobs.com listing]
- Tap & Go / AC Mobility (acgroup.rw) is fare collection. **No public route GTFS.** Do not scrape the Tap&Go app.
- busmaps.com and HanoBus (`Gacaca6/hanobusappdev`) republish or reinvent network data. **Do not dump those datasets.**

## Verdict

Ecofleet **does** expose a usable **unauthenticated JSON API** for stop autocomplete and OD trip planning (plus live vehicles/fares on `/plan`). It is an **operator passenger API**, not an open GTFS dump, not documented, and `/routes` currently 404s. Fine for verifying names/IDs and for product research; **not** a citable open-data seed. Prefer the DT4A GTFS + Ecofleet’s own HTML (corridors, airport timetable, New Times 41-route schedules) for seeding.
