# Data attribution

## Journey planner update — August 2026

The active planner no longer uses the flattened seed described below. It imports
the original GTFS archive into immutable, directional dataset versions, retaining
source stop IDs and repeated occurrences. The local import has 195 patterns,
55 routes and 828 source-qualified named stop IDs. A read-only validation with the
latest importer reports 27 stop/pattern notices and 191 unverified-fare notices;
the older stored import had 28 notices. Shapes,
calendars, calendar exceptions, overnight frequency windows and relative observed
times are imported. Historic fares are not treated as current fares.

New imports retain archive checksum/URL, separate import and known retrieval
timestamps, and original route/trip/stop/stop-time references. GTFS parent stations
and translated stop names are supported where supplied. The historic archive has
no terminal groups; synthetic terminal/translation test fixtures are invented
test data, not additional Kigali coverage or evidence of current service.

The feed remains historic (service calendar 2019-02-25–2021-02-25), with unresolved
usage rights. It is restricted to local/internal testing. Public publication
requires current verification and rights evidence. The older corridor/shuttle
records remain preserved but are not guessed into routable directional patterns.

The following sections document the **legacy seed's provenance**, not the active
planner's coverage. See [the current runbook](docs/JOURNEY-PLANNER-RUNBOOK.md).

The Kigali network layer in this repository (`agencies`, `corridors`, `stops`,
`transit_routes`, `route_stops`, `route_frequencies`) is seeded from **public,
attributed sources only**, via the offline snapshot in
[`api/data/kigali-network-seed.json`](api/data/kigali-network-seed.json).

Nothing in this repository calls Ecofleet's live API, and no live vehicle,
GPS, or fare-card data is stored. See [Not used](#not-used) below.

## Sources

### 1. Historic route network — DT4A / GoMetro / World Bank–GFDRR GTFS (2019)

| | |
|---|---|
| **What we use** | 3 agencies (KBS, Royal Express, RFTC), 55 numbered routes with their `route_desc` strings, ordered stop sequences, 457 named stops, and headway windows. |
| **Feed** | Kigali dry-season GTFS, collected 26 Feb – 4 May 2019 by **GoMetro**, funded by **GFDRR / World Bank** ("Urban Transport Mapping for Resilience in Kigali"). |
| **Canonical URL** | https://gitlab.com/digitaltransport/data/africa/kigali |
| **Zip** | https://gitlab.com/digitaltransport/data/africa/kigali/-/raw/main/GTFS%20Datasets/Kigali_GTFS.zip |
| **Mobility Database** | `mdb-1961` (status: **inactive**) |
| **Stored as** | `source = 'dt4a-2019'`, `as_of = 2019-05-01` |
| **License** | **Not stated** in the Kigali repository. Digital Transport for Africa is an open-data commons and some sibling city repositories are CC BY-NC 4.0. Treat as **attribution required, license unclear**; contact info@digitaltransport4africa.org before commercial redistribution. |

This feed is **historic, not current**. Its calendar expired (`20190225–20210225`)
and the 2026 operator uses different route ids (`104F`, `124R`, `302F` where the
2019 feed has `104`, `302`). The two id spaces are deliberately **not merged**:
routes are unique on `(short_name, source)` so both can coexist.

The 1,749 stop rows named `Unknown` in the raw feed are GPS pings rather than
signed stops and are **not** imported. Fares, shapes, calendars and
`calendar_dates` are **not** imported.

### 2. Corridors A–G — Ecofleet network map (2026)

| | |
|---|---|
| **What we use** | The seven published corridor labels, hub names, colours, and the published hub chain per corridor. |
| **URL** | https://ecofleet.rw/network-map-2/ (also https://ecofleet.rw/my-card-tapgo/ for "7 lines") |
| **Stored as** | `source = 'ecofleet-network-map-2026'` |
| **Rights** | Ecofleet Solutions Ltd, all rights reserved. Cited here as published operator information. |

Corridor geometry on that page is **illustrative marketing geometry, not
surveyed GIS** — for example Corridor E lists Gahanga. Corridor hub chains are
therefore stored as published *names* (`corridors.stop_names`) and are not
presented as surveyed stops. No corridor is asserted to contain any 2019 route:
no public mapping exists between the 2019 numbered lines and the 2026 corridors,
so `transit_routes.corridor_id` is left null rather than guessed.

### 3. Airport shuttle — Ecofleet published timetable (June 2026)

| | |
|---|---|
| **What we use** | The KIA ↔ Serena Hotel shuttle, its 8 published stops, and the ~2 h cadence between 05:00 and 01:00. |
| **URL** | https://ecofleet.rw/airport-shuttle/ |
| **Stored as** | `source = 'ecofleet-airport-shuttle-2026'`, `as_of = 2026-06-01` |
| **Rights** | Ecofleet Solutions Ltd, all rights reserved. |

The published 5,000 RWF fare is recorded as a **note on the route description**
only. There are no fare tables in this schema, by design: the 2019 GTFS fares
are obsolete against 2026 distance-based Tap&Go pricing.

### 4. Service context — press (2024–2026)

| Source | Date | Used for |
|---|---|---|
| The New Times / AllAfrica, "Kigali Rolls Out Detailed Bus Schedules for 41 Routes" — https://allafrica.com/stories/202601130543.html | 13 Jan 2026 | Context only: 41 scheduled routes, peak 06:00–09:00 and 17:00–20:00 often every 10 min on the Downtown / Kimironko / Nyabugogo / Remera / Kacyiru trunks, off-peak 20–45 min. **No stop lists were invented from this**, and no headway rows are seeded from it. |
| KT Press, "Kigali Introduces New Public Transport Lines…" — https://www.ktpress.rw/2024/03/kigali-introduces-new-public-transport-lines-to-ease-mobility/ | 12 Mar 2024 | Context only: City of Kigali 7 corridors, 18 operators. |

### Why the route counts disagree

They count different things, and all three are kept with their own `source`:

| Count | Meaning |
|---|---|
| **7** | Ecofleet / City of Kigali *corridors* (marketing and licensing units) → `corridors` |
| **41** | Operational scheduled lines, Jan 2026 (context only, not seeded) |
| **55** | Routes in the 2019 GTFS feed (KBS 14 + Royal Express 13 + RFTC 28) → `transit_routes` |

## Not used

By design, none of the following is scraped, seeded, or stored:

- **`https://api.ecofleet.rw` live endpoints** — journey planner, vehicle arrays,
  and the Socket.IO live GPS stream. These were consulted once, manually, as
  product QA only; they are not a data source for this app.
- **Tap&Go / AC Group internals** (fare-card transactions).
- **busmaps.com** (an aggregator of `mdb-1961`; the underlying GTFS is cited
  directly instead).
- **HanoBus `data/`** (a third-party app's dataset).

## If you redistribute

Keep the `source` and `as_of` columns intact — they are what makes 2019 topology
distinguishable from 2026 published labels — and carry this file with the data.
When Ecofleet publishes an official GTFS / GTFS-RT feed (contemplated in its 2025
ITS terms of reference), **replace** the `dt4a-2019` rows rather than merging
them: the route ids have already diverged.
