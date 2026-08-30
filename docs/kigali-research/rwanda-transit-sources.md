# Public sources for Kigali / Rwanda bus routes, stops, and schedules

Research date: **30 Aug 2026** (America/Chicago).  
Scope: citable **public** feeds and documents for seeding a transit app. No competitor private dumps (busmaps, HanoBus, Tap&Go internals). Ecofleet Bisi API notes are in [`api-notes.md`](./api-notes.md).

---

## Executive summary

| Question | Answer |
|---|---|
| Is there a public GTFS? | **Yes, but stale.** Digital Transport for Africa / GoMetro / World Bank–GFDRR, dry 2019 + wet 2020. 55 routes, 2,607 stop records, frequencies-based headways. Mobility Database **mdb-1961 / mdb-1962, status=inactive**. |
| Official current GTFS from Ecofleet? | **Not published.** 2025 ITS tender *requires* a supplier to generate GTFS static + GTFS-RT and expose it via REST. Not a live open feed as of this research. |
| Ecofleet public API? | **Yes, undocumented REST** at `https://api.ecofleet.rw/api/v1` for stop search + trip plan (no login). Not a GTFS dump; live vehicles/fares. See `api-notes.md`. |
| How many lines? | **Several overlapping counts:** Ecofleet Tap&Go page says **7 lines**; City of Kigali (Mar 2024) allocated **7 corridors / many lines / 18 operators**; New Times (Jan 2026) **41 scheduled routes**; 2019 GTFS **55 routes** (KBS 14 + Royal 13 + **RFTC 28**). |
| Best seed | Import DT4A GTFS into GTFS-like tables **as a historical network backbone**, overlay **named corridors/hubs** from Ecofleet + KT Press + New Times, add **airport shuttle** as one extra route with real stop_times. Do **not** bulk-ingest Ecofleet live GPS. |

---

## 1. Best public data sources

### 1.1 Digital Transport for Africa — Kigali GTFS (primary)

| | |
|---|---|
| **What** | Full GTFS Schedule (agencies, routes, trips, stops, stop_times, calendar, frequencies, shapes, fares). |
| **URL (canonical)** | https://gitlab.com/digitaltransport/data/africa/kigali |
| **Dry zip** | https://gitlab.com/digitaltransport/data/africa/kigali/-/raw/main/GTFS%20Datasets/Kigali_GTFS.zip (~739 KiB) |
| **Wet zip** | https://gitlab.com/digitaltransport/data/africa/kigali/-/raw/main/GTFS%20Datasets/Kigali_WetGTFS.zip |
| **TUMI Datahub** | https://hub.tumidata.org/dataset/gtfs-kigali — same initiative. CKAN: `https://hub.tumidata.org/api/3/action/package_show?id=gtfs-kigali` (TLS/timeout from this box; use GitLab or Mobility Database mirrors). |
| **Mobility Database** | **mdb-1961** dry, **mdb-1962** wet. `status=inactive`. Latest mirrors: https://files.mobilitydatabase.org/mdb-1961/latest.zip and `…/mdb-1962/latest.zip`. Catalog CSV: https://files.mobilitydatabase.org/feeds_v2.csv |
| **Direct download in catalog** | GitLab raw URLs above (`urls.authentication_type=0`). |
| **Collected by** | GoMetro |
| **Funded by** | GFDRR + World Bank (“Urban Transport Mapping for Resilience in Kigali”) |
| **When** | Dry: 26 Feb – 4 May **2019**. Wet: 2–10 Dec **2020**. Files inside zip dated 10 Dec 2021. Calendar validity `20190225–20210225`. |
| **License** | **Not stated** in the Kigali repo README (no LICENSE file). DT4A is an open-data commons; some other DT4A city repos are **CC BY-NC 4.0**. Treat as **attribution-required, license unclear** — credit GoMetro / DT4A / World Bank–GFDRR; ask info@digitaltransport4africa.org before commercial redistribution. OSM extracts used with this feed are ODbL. |
| **Contains** | Routes + stops + **shapes** + **frequencies** (not clock-face stop_times) + fares. |

**Counts from the dry zip (inspected locally):**

| File | Rows | Notes |
|---|---|---|
| `agency.txt` | 3 | `1` KBS, `2` Royal Express, `3` RFTC. Empty `agency_url`. TZ missing (should be `Africa/Kigali`). |
| `routes.txt` | **55** | All `route_type=3` (bus). KBS **14** (`101–115`, skip 110), Royal **13** (`201–215`), **RFTC 28** (`301–414` with gaps). `route_long_name` is zone labels; **useful names are in `route_desc`**. |
| `stops.txt` | **2,607** | Only ~**540 unique names**; **1,749 named `Unknown`** — GPS pings, not signed stops. |
| `trips.txt` | 220 | 1–5 trips per route (direction / peak bucket). |
| `stop_times.txt` | 2,608 | Sequence + times, but service is really **headway-based**. |
| `frequencies.txt` | 220 | Typical windows `06:00–10:00` and `15:00–18:00`. Headways 240–2880 s (~4–48 min). |
| `calendar.txt` | 2 services | Weekday vs weekend. |
| `shapes.txt` | 135,640 vertices | Good geometry for 2019 paths. |
| `fare_attributes.txt` | 49 fares | RWF, ~108–517. **Stale vs 2026 Tap&Go distance fares.** |

**RFTC 28 route IDs in this public feed** (agency_id=3):  
301, 302, 303, 304, 305, 306, 308, 309, 310, 311, 313, 314, 315, 316, 317, 318, 320, 321, 322, 325, 401, 402, 403, 404, 406, 411, 412, 414.

Human-readable `route_desc` (e.g. 302 = “Kimironko–Stadium–Chez Lando–Kimihurura–CBD”) is listed in [`gtfs-routes.md`](./gtfs-routes.md).

**Reports in the same GitLab repo:**

- `Reports/Summary_Report_on_Kigali_Dry-Season_Data_Submission_DS_21022020.pdf`
- `Reports/Resilience_Mapping_Kigali_Wet_Condition.pdf`
- World Bank demonstration note (Kinshasa + Kigali floods / GTFS): https://documents1.worldbank.org/curated/en/099140104282221130/

**Use for seed:** yes — topology, stop clusters, historic route numbers, shapes.  
**Do not treat as 2026 schedules.** Ecofleet now uses codes like `104F` / `124R` / `302F` (see API sample).

### 1.2 OpenStreetMap (stops + roads; weak PTv2)

| | |
|---|---|
| **Extract** | https://download.geofabrik.de/africa/rwanda.html — `rwanda-latest.osm.pbf` (ODbL). ~63 MB, daily. |
| **Overpass** | Query `highway=bus_stop`, `public_transport=platform`, `relation[route=bus]` in Kigali bbox `(-2.03,29.98,-1.88,30.22)`. Example: https://overpass-turbo.eu |
| **License** | ODbL 1.0 — attribution + share-alike on the database. |
| **Contains** | Named stops/parks (Nyabugogo, Remera, Kimironko, etc.), road network. **No evidence of a complete PTv2 `route`/`route_master` set for Kigali buses.** No GitHub dump of Kigali PTv2 relations found. |
| **Use** | Snap / dedupe stop names; walking graph. Not a schedule source. |

### 1.3 Ecofleet official public pages (current operator, not GTFS)

Ecofleet Solutions Ltd is the **state-owned** fleet/manager for Kigali buses (https://ecofleet.rw/).

| Page | Contains | License |
|---|---|---|
| https://ecofleet.rw/my-card-tapgo/ | “**all 7 Ecofleet bus lines** across Kigali” | All rights reserved; cite as Ecofleet marketing. |
| https://ecofleet.rw/network-map-2/ | Corridors **A–G**, stop name lists, illustrative lat/lng, fare chips 250–300 Rwf | Same. Client-side JS, see `api-notes.md`. |
| https://ecofleet.rw/airport-shuttle/ | **Real timetable** KIA↔Serena, June 2026 table, 5,000 RWF | Same. Best public clock-face schedule. |
| https://bisi.ecofleet.rw/ | Live planner UI | Operator ToS; API undocumented. |

### 1.4 Government / press (citable route lists, not GIS)

| Source | Date | What we can cite |
|---|---|---|
| KT Press, “Kigali Introduces New Public Transport Lines…” | **12 Mar 2024** | **7 corridors**, 18 operators (14 companies + 4 individuals), named lines per corridor, ~500 buses, ~250k weekday riders. https://www.ktpress.rw/2024/03/kigali-introduces-new-public-transport-lines-to-ease-mobility/ |
| The New Times via AllAfrica, “Kigali Rolls Out Detailed Bus Schedules for **41 Routes**” | **13 Jan 2026** | Peak 10 min on Downtown / Kimironko / Nyabugogo / Remera / Kacyiru; off-peak 20–45 min; ~300 Ecofleet buses/day; named route strings (Kabuga–Nyabugogo, Kimironko–Downtown, etc.). https://allafrica.com/stories/202601130543.html (original: New Times). |
| The New Times, Ecofleet tracking pilot | **27 Apr 2026** | GPS displays on **Kacyiru** and **Rwandex** stops — technical pilot, not citywide GTFS-RT. https://www.newtimes.co.rw/article/35202/news/technology/public-transport-ecofleet-trials-real-time-bus-tracking |
| Ecofleet ITS tender ToR | posted ~Sep 2025 | Future **GTFS static + GTFS-RT REST**, auth + rate limit, Google Maps integration. Ops target **1 Oct 2025**. Not a published feed. |

RURA licenses operators onto corridors; no RURA open GTFS found.

### 1.5 Academic / other

| Source | Notes |
|---|---|
| Figshare “Kigali Bus transportation dataset” (AMBO AMANDURE, 2021) https://doi.org/10.6084/m9.figshare.13228316.v1 | Academic dump; JS-walled from this box. Inspect before use; likely research GPS, not a maintained GTFS. |
| Wanziguya, “From field to feed… Evidence from Kigali” (2026) https://doi.org/10.13140/rg.2.2.28638.29765 | Method paper on GTFS + maps; not a feed. |
| Transitous issue #584 | Points at DT4A GitLab; Kigali **not** in Transitous routing yet. |
| `Gacaca6/hanobusappdev` | Kigali tracker **app**. **Do not copy `data/`.** |
| busmaps.com Rwanda | Aggregator of **mdb-1961**. 28 RFTC routes is the GTFS count. **Do not use their API as a source.** |
| AC Mobility / Tap&Go https://www.acgroup.rw/ | Fare cards, not routes. |

---

## 2. Ecofleet public API surface

Full endpoint list, auth, and JSON samples: **[`/workspace/ecofleet/api-notes.md`](./api-notes.md)**.

| | |
|---|---|
| **Base** | `https://api.ecofleet.rw/api/v1` |
| **Auth** | Optional Bearer from `localStorage.accessToken`. Account routes (`/auth/*`) need login. Planner GETs returned **200 without a token**. |
| **Public GETs (JS + live 200s)** | `/journey-planner/stops/search`, `/journey-planner/plan` (also `/nearby-routes`, `/route-stops` in JS). |
| **Broken** | `GET /routes` → 404 (JS still calls it). |
| **Realtime** | Socket.IO `https://api.ecofleet.rw/journey-planner` (not probed). |
| **Docs** | None. |

**Usable as a public API?** Yes for **autocomplete + OD planning + live ETA**, undocumented, operator-owned. **Do not seed the app by scraping it.** Prefer asking Ecofleet (`info@ecofleet.rw`) for a GTFS dump or partnership — their ITS ToR already contemplates third-party GTFS.

---

## 3. Recommended seed strategy

### 3.1 What the current Basis Transport DB actually is

Local schema inspection (`basis-schema.md`): PostgreSQL + TypeORM, **`locations` + operational `trips`**, PostGIS points. **No agencies / routes / stop_times / calendars.** A seed *today* can only fill tables that exist.

### 3.2 Two layers

**Layer A — ship now (simple tables)**  
Enough to demo corridors and “buses near X”:

```
agencies          id, name, source
corridors         id (A–G), name, from_hub, to_hub, color, source
routes            id, agency_id, corridor_id, short_name, long_name, desc, source, as_of
stops             id, name, lat, lon, stop_type (hub|stop|unknown), osm_id?, source
route_stops       route_id, stop_id, sequence
```

Populate:

1. **Hubs** from Ecofleet map + OSM names: Nyabugogo, Downtown/CBD, Remera, Kimironko, Kicukiro/Nyanza, Nyamirambo, Kanombe/KIA, Gisozi/Batsinda, Sonatubes.
2. **Corridors A–G** from Ecofleet HTML (labels) + KT Press (line lists).
3. **Historic route numbers + `route_desc`** from DT4A `routes.txt` as `source=dt4a-2019`.
4. **Airport shuttle** as one route with **real** `stop_times` from ecofleet.rw/airport-shuttle.
5. Dedup stops: cluster DT4A `Unknown` pings; keep named parks.

**Layer B — GTFS-like (when you add a planner)**

Standard tables: `agency`, `routes`, `trips`, `stop_times`, `stops`, `calendar`, `calendar_dates`, `frequencies`, `shapes`, `fare_attributes`, `fare_rules`.

- Import **mdb-1961 dry** as `feed_version=dt4a-dry-2019`.
- Mark `calendar.end_date` expired; use `frequencies` not clock times.
- Keep a `source` / `as_of` column so 2019 shapes are not shown as “live Ecofleet”.
- When Ecofleet publishes GTFS (ITS ToR), **replace** this feed rather than merge blindly — route IDs have already changed (`104F` vs `104`).

**Do not:** ingest Ecofleet `/plan` vehicle arrays, Tap&Go transactions, or busmaps.

**Fares:** 2019 GTFS fares are obsolete (New Times 2026: Kimironko–Downtown 426 vs 543 RWF depending on direction). Seed **no fares** except the published airport 5,000 RWF, or a single “distance-based Tap&Go” flag.

---

## 4. Starter list of well-known Kigali corridors

Hubs every source agrees on: **Nyabugogo** (main transfer, ~100k pax/day in GFDRR notes), **Downtown / CBD**, **Remera**, **Kimironko**, **Kicukiro / Nyanza**, **Nyamirambo**, **Kanombe / KIA**.

### Ecofleet 7-corridor map (2026 HTML)

Cite: https://ecofleet.rw/network-map-2/ and Tap&Go “7 lines” https://ecofleet.rw/my-card-tapgo/

| ID | Corridor | Role |
|---|---|---|
| A | Remera ↔ Downtown | East–centre trunk (UTC, Sonatubes) |
| B | Kicukiro ↔ Nyabugogo | South → Nyabugogo (Gikondo, Rwandex, Nyanza) |
| C | Gisozi ↔ CBD | North (Batsinda, Kacyiru) |
| D | Gikondo ↔ Downtown | South-central |
| E | Kimironko ↔ Nyabugogo | NE trunk |
| F | Kanombe ↔ City Centre | Airport road / Gisimenti / Remera |
| G | Nyamata ↔ Downtown | Southern approach ( peri-urban ) |

### City of Kigali 7 corridors (Mar 2024) — many lines each

Cite: KT Press, 12 Mar 2024.

| Corridor | Focus | Example lines (KT Press) | Operators named |
|---|---|---|---|
| **A** | Gasabo / Kicukiro | Remera–Downtown, Kabuga–Nyabugogo, Rubirizi–Downtown, Remera–Nyabugogo via Kacyiru, Nyanza–Remera, Remera–SEZ, Remera–Busanza, CBD–Downtown | KBS, Nyabugogo Cooperative, Ritco, Volcano |
| **B** | Downtown / Nyabugogo–Kicukiro / Kanombe | Kibaya–Kanombe–Downtown via Sonatubes, Remera–Ndera, Remera–Masaka, Kabuga–Remera, Busanza–Remera, Kanombe–Nyabugogo via Kacyiru | KBS, Ritco, Four G, Nsengiyumva JP, Remera Cooperative |
| **C** | Nyanza–Downtown / Nyabugogo | Nyanza–Downtown via Zion / Gatenga, Rwandex–Zion–Nyabugogo, Nyanza–Kimironko | Bus Transport Logistics, Royal Express, Yahoo Express |
| **D** | Kicukiro–Niboye / Nyamirambo | Downtown–St Joseph, Downtown–Bwerankori, Nyanza–Bwerankori–Nyamirambo (RP) | Royal Express, Yahoo Express, SU Direct |
| **E** | Gasabo / Kimironko | Kinyinya–Downtown via Nyarutarama, **Kimironko–Downtown**, Kacyiru–Downtown, Batsinda–Kimironko, Kabuga–Kimironko | Volcano, Ebenezer, Royal Express, Centre Centre Cooperative, Jali |
| **F** | Gasabo / Batsinda | Batsinda–Downtown, **Kimironko–Nyabugogo**, Kinyinya–Nyabugogo via Utexrwa | Shalom, Jali, City Centre, others |
| **G** | Nyarugenge / Nyamirambo | **Nyamirambo–Downtown**, Nyamirambo–Kimisagara–Nyabugogo, Nyacyonga–Nyabugogo, Karama–Nyabugogo | Ritco, KBS, Volcano, Jali, Remera Cooperative, Murinda Raphael |

### New Times 41-route schedules (Jan 2026) — headways, not GIS

Cite: AllAfrica/New Times, 13 Jan 2026. Ecofleet: ~300 buses/day.

Peak **06:00–09:00** and **17:00–20:00**, often **every 10 minutes** on:

- Corridor A: Kabuga–Murindi–Nyabugogo; Kabuga–Kibaya–Nyabugogo; Kabuga–Kibaya–Downtown; Kabuga–Murindi–Downtown  
- Corridor B: Nyanza–Gatenga–Downtown; Nyanza–Kimironko; Nyabugogo–Gatenga–Nyanza; Downtown–Bwerankori–Miduha  
- Corridor C: **Kimironko–Downtown**; Kimironko–Zindiro–Musave; Nyacyonga–Batsinda–Kimironko; Kimironko–Masaka–Kabuga  
- Corridor D: **Kimironko–Nyabugogo via Kacyiru**  
- Plus Nyamirambo (Kitabi–CHUK–Downtown; Kitabi–Nyamirambo–Kimisagara–Nyabugogo–Downtown), Nyacyonga–Downtown, Bishenyi–Downtown via Nyabugogo, etc.

Off-peak often 30–45 min. Coverage gaps called out: Kabuga–Downtown avoiding Sonatubes, Gahanga, Mageragere–Nyabugogo, night service.

### Historic GTFS (2019) — numbered routes through the same hubs

Cite: DT4A `routes.txt` `route_desc` / [`gtfs-routes.md`](./gtfs-routes.md).

| Hub | Example 2019 routes |
|---|---|
| **Nyabugogo** | KBS 102, 105, 112; Royal 204, 206, 212, 214; RFTC 305, 310, 314, 315, 321, 402, 404, 411, 412, 414 |
| **Remera** | KBS 101, 103–115 (Remera park as terminus for many Zone I lines) |
| **Downtown / CBD** | KBS 101, 103, 104; Royal 201, 203, 205; RFTC 301–304, 313, 317, 401, 403 |
| **Kimironko** | RFTC 302, 305, 306, 309, 316, 318, 322, 325; Royal 213, 215 |
| **Nyamirambo** | RFTC 401, 402, 406 |
| **Kicukiro / Nyanza** | Royal 203, 207, 208, 211, 213, 214; KBS 108 |
| **Kanombe / airport road** | KBS 104, 114, 115 |

### Airport (Kanombe / KIA)

Cite: https://ecofleet.rw/airport-shuttle/ — dedicated shuttle, **not** the 7 urban corridors. Board: KIA arrivals parking; city: Serena. Intermediate: Chez Lando, Gishushu, KABC, Park Inn, Urban Blue, BPR.

---

## 5. What we can actually get (honest inventory)

| Data | Quality | Action |
|---|---|---|
| 2019/2020 GTFS (routes, stops, shapes, headways, fares) | Complete file, **expired** | Seed topology + historic numbers |
| Named hubs / corridor labels | Strong, multi-source | Seed `corridors` + `stops` hubs |
| 2024 line names per corridor | Strong (KT Press) | Seed `routes.long_name` |
| 2026 41-route headways | Strong (New Times), no stop lists | Seed `frequencies` qualitatively or as notes |
| Airport shuttle times | Strong HTML table | Seed one GTFS route with stop_times |
| OSM stop nodes | Partial, ODbL | Enrich names/coords |
| Ecofleet live plan API | Works unauthenticated | Product research / QA only |
| Official current GTFS-RT | **Does not exist publicly** | Ask Ecofleet; watch ITS rollout |
| Tap&Go / AC Group routes | Private | Skip |
| RFTC “28 routes” | = 2019 GTFS agency 3 | Cite GTFS, not busmaps |

---

## Local artifacts

| Path | What |
|---|---|
| `/workspace/ecofleet/rwanda-transit-sources.md` | This report |
| `/workspace/ecofleet/api-notes.md` | Bisi/API endpoints |
| `/workspace/ecofleet/gtfs-routes.md` | 55 DT4A `route_desc` strings |
| `/workspace/ecofleet/gtfs/Kigali_GTFS.zip` | Dry GTFS copy |
| `/workspace/ecofleet/gtfs/mdb-1961-latest.zip` | Mobility Database mirror |
| `/workspace/ecofleet/network-map-corridors.js.txt` | Ecofleet A–G JS |
| `/workspace/ecofleet/remera.json` `downtown.json` `plan.json` | Public API samples (do not republish as open data) |
