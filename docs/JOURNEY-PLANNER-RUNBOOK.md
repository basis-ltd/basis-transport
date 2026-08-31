# Journey planner: implementation and release runbook

## Current delivery status — 30 August 2026

The application runs as a **local/internal network beta**, not verified public
transport coverage. Both target pages use the real planner. Guest routes,
stops, nearby discovery, sharing, local favorites, optional owner-scoped sync,
staff draft editing/publication/rollback, and persisted reports are implemented.
Live arrivals, seats, payments, tracking and passenger check-ins are not provided.

The frontend-design direction uses the existing paper/ink/green palette, DM Sans,
condensed route badges, and a boarding/transfer/alighting instruction spine.
Maps and staff/account screens are lazy-loaded. The current initial client JS
chunk is about 592 kB before compression (190 kB gzip); lazy chunks are additional.
This exceeds the earlier 425 kB baseline and needs further bundle analysis.
Passengers can start on-device **Follow journey** guidance from any expanded
connection card. Guidance uses manual progress controls, undo, browser-storage
resume, optional foreground location suggestions (never auto-confirms steps),
and replan — no server-managed trip or movement history. Arrival requires an
explicit confirmation. Missing a stop never advances the old itinerary. Replan
asks for an actual selected location or a fresh, opt-in position; completed text
is retained in memory for reference, not saved as a movement history.

Progress storage contains only journey/dataset/step identifiers and manual
progress, expires after 12 hours, and is rejected after a dataset or step change.
No Google walking geometry/text is persisted. Storage failure leaves guidance
usable with a visible notice. Location watchers stop on exit, completion,
permission failure, unmount, or a hidden document.

### Source status

The original DT4A GTFS produces **195 directional patterns, 55 route IDs, and
828 source-qualified named stop IDs**. The latest in-memory archive validation
reports 218 notices: 27 stop/pattern issues and 191 unverified-fare notices. The
older stored import had 28 notices. These counts differ from
the old 56-route/693-stop flattened seed because source stop identities are no
longer merged by name/coordinate, the unrelated shuttle is not reconstructed,
and malformed patterns are quarantined. Review notices before publication.

Service dates remain 2019-02-25 through 2021-02-25. Import time does not refresh
service validity. Unknown GPS samples are omitted; malformed named stops
quarantine their affected patterns. No current fare or safe transfer is inferred.

The raw source has no reviewed transfer links in this import. Real Remera–Downtown
and Kimironko–Nyabugogo direct patterns can be inspected; Kabuga–Downtown must
remain unavailable until an actual connection is established. Synthetic unit
and browser fixtures are **not field-reviewed Kigali reference journeys**.

## Local setup

Use Node 22+ and PostgreSQL with PostGIS. Set API credentials from
`api/.env.example` and client variables from `client/.env.example`.

```sh
cd api
npm ci
npm run db:migrate
NETWORK_ACCESS=internal npm run network:import -- --publish-internal
npm run dev
```

In another terminal, run `npm ci` then `npm run dev` from `client`.
`NETWORK_ACCESS=internal` is accepted only outside production; public network
requests also require a loopback peer and localhost Origin in that mode.
Do not proxy this internal dataset to a public domain. Public mode fails closed
until a current, verified, rights-approved dataset has been published.

Named stop-to-stop planning works without Google Routes. Coordinate endpoints
require `GOOGLE_ROUTES_API_KEY` on the server. The browser uses a **different**
`VITE_GOOGLE_MAPS_API_KEY`. Restrict both keys and enable billing/quota alerts.
Never paste server keys into client configuration, logs, or issue reports.
Pedestrian-only fallback between nearby named stops also requires the provider.
If a bus connection cannot be found and that walking check fails, the result is
`provider_unavailable`, not proof that no journey exists.

Current-location inputs reverse-geocode the opted-in GPS position using the
browser key; enable the [Geocoding API](https://developers.google.com/maps/documentation/javascript/geocoding)
alongside Maps JavaScript and Places. The returned address changes only the label,
not the GPS coordinates. Failed or timed-out address lookups retain a coordinate
label with a notice; edits/swap cancel stale address results. No automatic GPS or
IP-location lookup is used.

### Remera–Downtown troubleshooting

The historic source contains separate Remera platforms. `DT4A_22880084` is an
arrival-only platform on route 105; it does not connect to Downtown. The directional
route 101 pattern connects `DT4A_22907889` (remera park) to `DT4A_22907895`
(downtown). This is source topology, **not verified current service**.

Journey autocomplete uses `endpoint=origin|destination` to omit terminal-only
occurrences that cannot serve that role, shows headsigns, and prioritizes direct
links to `otherStopId` before pagination. Same-name platforms remain distinct.
When planning returns `no_connection` or `provider_unavailable`, optional
`nearbyConnections` are explicitly different stop-to-stop searches, not journeys
from the original locations. They use bounded straight-line discovery distances,
never fabricated walking routes. Selecting “Use these stops” updates both stop
IDs in the URL and starts a new plan; history restores the original search.
No endpoint is moved automatically, and no service is silently reversed.

## Import, review, publish, rollback

Import always creates a draft transactionally and emits a comparison summary
against the currently published snapshot when one exists. The default import downloads
[the original GTFS](https://gitlab.com/digitaltransport/data/africa/kigali/-/raw/main/GTFS%20Datasets/Kigali_GTFS.zip).
For another reviewed source, pass its archive, namespace, and source URL:

```sh
npm run network:import -- /absolute/path/current-feed.zip --source=operator-2026 --url=https://operator.example/feed.zip
```

Current operator archives must be supplied locally. Do not change the historical
source namespace merely to bypass review. Historical observations remain separate
from current schedules in distinct dataset versions. Original trip, shape, service,
stop and stop-sequence identifiers are retained. Service-day times use elapsed
seconds, including values over 24 hours. This importer supports the supplied
calendar-based GTFS profile; it is not a general GTFS-Flex or realtime importer.

The importer now supports explicit `stops.parent_station` relationships between
stations (`location_type=1`) and platforms (`0` or empty). Stations become terminal
containers, never bus-stop occurrences. Distinct same-name/same-position platforms
retain separate source-qualified IDs. Invalid parents, duplicate stop IDs and
missing/non-platform stop-time references quarantine the affected pattern instead
of skipping the invalid occurrence. The historic DT4A `Unknown` GPS-sample exception
is source-specific. Entrances, nodes, boarding areas and pathway import still need
a richer access model; these are reported, not silently made routable.

`translations.txt` stop-name translations require `feed_info.txt`. Exact record-ID
translations override exact field-value translations; conflicting equal-priority
values are quarantined. Language tags are BCP 47. Search includes translated names
for both platforms and terminals. Route/headsign and other translated fields are
reported as unsupported by this profile. Stop detail includes platform codes,
language-tagged names and original source identity; duplicate public stop codes
require a source-qualified stop ID. Terminal detail returns its serving routes
and separate boarding platforms.

Snapshots retain `importProvenance` (namespace, actual source URL, archive checksum,
import timestamp, optional retrieval timestamp and feed version/language). Original
route, trip, stop and stop-time records carry `sourceRecord` / `routeSourceRecord`
or `stopTimeRecord` references. These references identify the source, not verified
current service. The importer CLI now forwards `--url` into all source fields.
For a local archive, retrieval time stays unknown unless supplied explicitly:

```sh
npm run network:import -- /absolute/path/current-feed.zip --source=operator-2026 --url=https://operator.example/feed.zip --retrieved-at=2026-08-29T12:00:00Z
```

Only use that timestamp when it is known. Automatic downloads record retrieval
time separately from service dates. Staff cannot change or remove the original
import envelope through snapshot editing. These optional JSON fields need no SQL
migration; older snapshots remain readable. Import a new draft to acquire source
references rather than rewriting an archived/published version.

Sign in as ADMIN/SUPER_ADMIN at `/admin/network`. Inspect quality notices, clone
published data to a draft, then edit its validated JSON snapshot. Correct names,
aliases, ordered occurrences, shapes, service dates and sourced fares there.
Shared stop IDs must have consistent names, aliases, coordinates, zones, language
labels and terminal membership. The structured editor adds terminal membership
and evidence-bound pedestrian-path review; raw JSON remains available. Imports
currently use the CLI; this is not a GIS drawing or source-identity mapping tool.
Comparison reports include stop labels/areas, global fare rules and separate
parallel pathways. Use “Show next changes” to inspect reports longer than 20 entries.

Fixed fares have amount, RWF currency, source URL, validity dates and verification.
GTFS `fare_attributes` / `fare_rules` import as unverified `fareRules[]` when present.
Review and verify amounts before publication. Section fares may restrict stop IDs
or occurrence sequences; zone fares use explicitly sourced zone IDs. Payment
timing, methods, instructions, validity and confidence belong to the rule.
Transfer discounts/charges live in snapshot-level `fareRules` and require explicit
`fromRouteId` / `toRouteId`. Optional `fromStopId` / `toStopId` restrict the previous
ride’s alighting point and next ride’s boarding point. Each adjustment is applied
once per eligible change, not once per journey or every change indiscriminately.
Missing scope, expired/conflicting evidence or a discount exceeding the known
fare leaves the total unknown. Estimated rules are not definitive quotes; the
estimated-quote display and category/distance/complex eligibility models remain
unfinished. Unsupported eligibility fields are rejected, never silently ignored.

### Pedestrian transfer review

“Add transfer link” creates an unreviewed request with empty geometry and unknown
distance/duration. Supply the actual surveyed or licensed pedestrian path, its
distance (1–400 m), duration, source reference and passenger crossing instructions.
Do not paste temporary Google directions into persistent snapshots. Save the draft
before review, then supply an HTTPS evidence URL, review notes and explicit
confirmation. Each direction requires a separate reviewed link. Proximity alone
never creates a transfer; source geometry checks cannot prove crossing safety.

`GET /api/admin/network/datasets/:id` returns `snapshotRevision`. The protected
`POST /api/admin/network/datasets/:id/transfers/:transferId/review` accepts:

```json
{
  "expectedRevision": "<64-character revision returned by GET>",
  "evidenceUrl": "https://operator.example/surveys/path-evidence",
  "notes": "Describe the inspected path, crossings and access limitations.",
  "confirm": true
}
```

The server records the authenticated reviewer and review time. Stale revisions
return 409; reload and inspect the saved path again. Missing or inconsistent path
data returns 400. Approval is bound to the exact stop coordinates, geometry,
distance, duration, source and instructions. Changes require fresh approval.
An approved draft still needs publication before routing can use it.

Imports and editable copies remove/forbid carried-forward approval. Snapshot JSON
cannot create approval metadata. Existing checkbox-only approvals are ignored by
routing; clone, supply evidence and review again. Their archived records remain
intact. These are additive JSON fields, with no new SQL migration or table drop.
Only transfer approval currently has optimistic revision checking; generic snapshot
saves remain last-writer-wins and should not be edited concurrently by staff.

Public publication requires rights approval, verification evidence and current
service dates. Historical DT4A metadata cannot be relabeled as verified current.
Publishing archives the previous version atomically. Restore a previous version
from the same staff page; it must still meet public-release checks. Every worker
checks the published version per request and uses an immutable version-specific
routing graph. A request never mixes multiple dataset versions.

## API contract

All endpoints keep `{ message, data }`. Public endpoints ignore absent/expired
passenger authentication; administration and saved-item sync remain protected.

```json
{
  "origin": { "stopId": "DT4A_22907889" },
  "destination": { "stopId": "DT4A_22907895" },
  "maxWalkMeters": 800,
  "maxTransfers": 2,
  "preference": "fewest_transfers"
}
```

Send to `POST /api/journeys/plan`. A location can instead contain numeric latitude
and longitude. Stop IDs are authoritative. Optional `departureAt` (ISO-8601) filters
connections by service calendar and frequency windows in Africa/Kigali time; it never
invents headway-based waits. Responses distinguish `ok`,
`walking_only`, `already_at_destination`, `outside_coverage`, `no_connection`,
`search_limit_reached`, and `provider_unavailable`; invalid input is
400, unpublished/unusable coverage is 503. Up to three distinct route-chain
alternatives are returned. Each journey includes typed passenger `steps`
(`walk`, `wait`, `board`, `ride`, `alight`, `transfer`, `arrive`) and an
optional `fareQuote` with per-leg fares, transfer adjustments, and explicit
unknown/partial/known totals. Search bounds: 64 spatial candidates per endpoint,
up to 16 pedestrian checks per endpoint prioritizing service diversity, two
transfers by default (explicitly selectable up to four), four nondominated labels
per state, 2,000 frontier labels, and 150,000 ride expansions. Candidate/frontier/
label/expansion truncation produces an explicit search-limit warning instead of
being treated as proof of no connection.

Endpoint walks use Google's pedestrian routes (3.5 s timeout); reviewed transfers
are capped at 400 m. Endpoint preference defaults to 800 m and cannot exceed
2 km. Ranking is transfers, walking, then ride distance, or least walking first.
Departure requests use time-aware labels before alternative pruning. Only a
verified dataset and a separately verified `service.timetable` with an IANA
timezone can produce scheduled waits. `timetable.departures` contains absolute
service-day starts; stop arrival/departure offsets remain relative to that start.
Imports retain starts and timezone but leave timetables unverified. Frequency
templates are not converted to exact departures. Search considers the next 24 h,
calendar exceptions, previous service-day overnight trips, dwell and a 120-second
minimum transfer buffer. Complete timetable totals include walks and waits;
any unknown timing component leaves the total unknown. Historical schedules
remain network guides. Same-route reboarding is currently excluded.

These are additive, optional JSON snapshot fields; existing datasets require no
in-place rewrite or table drop. Existing explicit migrations remain mandatory
for empty/older databases. Import a draft and review evidence rather than
modifying a published snapshot.

GTFS fare origin/destination identifiers are zones, not stop IDs. Non-RWF fares
are quarantined, never relabeled or implicitly converted. Section/fixed/zone
quotes use the requested fare date; conflicting equally applicable evidence
returns unknown. Partial quotes expose the known subtotal but no complete total.
Fare instruction indices refer to physical legs, including leading walks.

Public directory/detail endpoints are `/api/stops`, `/api/stops/:id`,
`/api/routes`, `/api/routes/:id`, and `/api/network/status`. Stop search supports
`q`, `lat`, `lng`, `radius` (100–5,000 m), `page` (zero-based), and `size` (1–100).
Route search also supports `agency` and `headsign` filters; list responses include
available filter values. Stop detail includes terminal `stopArea` boarding points
when present. Text search also returns matching terminal areas as distinct results.
Nearby distances are straight-line discovery distances, not safe walking routes.

`GET /api/network/map` supplies the guest explorer at `/routes?view=map` from one
published dataset version. Optional filters: `q`, `agency`, `headsign`, `routeId`
(strings up to 100 characters). It uses the same rate limit and verified/public
coverage gate as other public reads. Unsupported query keys are stripped by the
global whitelist; they cannot override payload limits. No migration is needed.
Response data includes `patterns`, `network` provenance, filter options,
`totalPatterns`, `totalRoutes`, `truncated` and fixed `limits`. Caps are 100 patterns,
128 geometry points per pattern, 200 stop occurrences per pattern / 2,000 total,
and 500 route-filter entries. Repeated visits retain their occurrence sequence.
`geometryQuality`, `generalized`, `stopCount`, and `stopsTruncated` distinguish
source shapes, simplified overview lines, and incomplete/schematic information.
Overview geometry is display-only: routing continues to use original shapes.
Refine the map by route or open route details for the full stop sequence.

Both journey search fields offer **Choose … on map**. Opening the picker does not
request geolocation or choose the default map center. Click a point or explicitly
choose the keyboard-panned center, then confirm; coordinates can also be entered
when maps fail. Cancelling preserves the previous endpoint. Confirmed pins clear
old stop IDs and use the existing coordinate URL and precise-location sharing
warning. They are not automatically saved as favorites. Browser map scripts and
the explorer remain lazy-loaded. Mobile maps open full-screen; stop lists and
coordinate entry remain usable without the provider.

`/api/me/saved-items` GET/POST and DELETE `/:id` are owner-scoped, limited to
100 favorites. Local import requires confirmation. `/api/reports` persists
anonymous stop/route/contact reports. Staff review does not automatically alter
published routing data.

## Cutover and backups

Schema synchronization is disabled. The baseline adopts a complete existing
schema or initializes an empty one; a partially present baseline is rejected.
Review schema drift on other deployments before adopting that baseline.
Do not run old seeds: `seed:kigali` now invokes the directional importer.

Before every production cutover, create a custom-format PostgreSQL backup,
verify its catalog, restore it into an isolated PostGIS database, and compare
archive/audit counts. Then run migrations before starting the new server.
No legacy tables are dropped. Row triggers reject changes to archived records;
use a restricted application database role without TRUNCATE/schema privileges.
The baseline and populated network migrations intentionally refuse destructive
down-migrations. Restore a tested backup for full schema rollback; use dataset
publication rollback for network-data mistakes.

This workspace's pre-cutover backup was restored into
`basis_planner_test_restore_1788076930171`; all migrations and API integration
checks passed there. The original empty-schema test database is
`basis_planner_test_1788075173967`. Both were retained for inspection.
The local developer database was migrated only after those checks.
Archived counts remain trips=2, user_trips=0, locations=4, transport_cards=0.

Local backups are in
`/var/folders/09/0t_prn015cxfsvjq0h9ykwcw0000gn/T/basis-planner-backup-2RmYQw/`:
`basis_transport.before-planner.dump` (restore-tested) and
`basis_transport.cutover.dump` (fresh cutover backup). Move these to an approved
encrypted backup location; a temporary directory is not durable backup storage.

## Privacy and production controls

- Planning payloads, saved links and reports are excluded from mutation auditing.
  Request logging strips query strings. Metrics keep counts/timings only, not
  endpoints. Explicitly synchronized favorites intentionally retain their links.
- Configure proxy/CDN logs to use path without query (for nginx, `$uri`, not
  `$request_uri`), disable request-body logging, and exclude travel URLs/labels
  from analytics/error-session replay. Infrastructure configuration is a release
  requirement; application code cannot sanitize an upstream provider's logs.
- Browser referrer policy is strict-origin. Geolocation is opt-in, with no IP
  fallback. Google processes searches and walking coordinates; shared links can
  reveal precise endpoints. Walking responses are not cached or persisted.
- Per worker/minute: 20 plans, 120 network reads, 5 reports per peer IP; up to 160
  outbound walking requests by default and 32 concurrent provider calls.
  `WEB_CONCURRENCY` defaults to one. Set shared gateway limits before scaling;
  do not trust arbitrary forwarded IP headers. JSON request bodies are bounded.
- `/api/health` returns 503 when the database/network is not ready. Public mode
  also requires the walking provider to be configured and not recently failing.
  Internal mode can run stop-only. This is not a continuous paid provider probe.
- `/api/admin/network/metrics` exposes per-worker rolling p95, outcomes and
  provider-call counts to staff only. Export aggregate measurements to staging
  monitoring; no external monitoring account has been configured.

## Verification commands

```sh
# api directory
npm run build
npm test -- --runInBand
DB_NAME=basis_planner_test_restore_1788076930171 NETWORK_ACCESS=internal npm run test:e2e -- --runInBand

# client directory
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Tests require an isolated `basis_planner_test_*` database for migrations/API
checks. Do not point tests at developer or production data. Browser fixtures
exercise keyboard search, URL reload, legacy links, explicit location, sharing,
favorites, unavailable providers/maps, and 320 px / desktop rendering.

## Gates still required before public release

Latest resumed verification: 90 API unit tests, 12 isolated API/security tests,
30 frontend component/utility/adapter tests, and 30 desktop/mobile Playwright tests.
Both production builds pass. See `DOOR-TO-DOOR-AUDIT.md` for remaining full-goal
requirements; these synthetic tests do not establish current-route verification.
Network-map and pin-picker adapter tests cover selection and overlay cleanup;
browser tests cover provider outage, confirmation/cancellation, reload, filters,
empty results and retry. Paid/live Google map and pedestrian-provider QA still
requires a staging configuration with appropriately restricted keys.
Staff browser tests use synthetic authentication and mocked data. Real isolated
API tests separately enforce role authorization, evidence/revision checks,
forged-approval rejection, publication isolation and preserved archive counts.
Terminal import integration covers translated public search, terminal/platform
details, ambiguous stop-code rejection, provenance protection and correct boarding.
The new stop-identity visual fixture was also inspected in the in-app browser at
desktop and 320 px. It is excluded from the production application entry.
A prior real Remera–Downtown browser flow had no runtime errors.
A ten-request local stop-only sample had a 250 ms maximum; this is not a staging
load measurement. Compatible dependency fixes were applied: the client audit is
clean; backend findings remain, including a transitive tar critical advisory and
NestJS/development-tool advisories requiring a separately tested upgrade.

1. Resolve GTFS redistribution rights and import genuinely current verified
   routes. Review every intended boarding platform, crossing and transfer.
2. Establish field-reviewed Kabuga–Downtown, Remera–Downtown, and
   Kimironko–Nyabugogo fixtures; synthetic tests cannot satisfy that gate.
3. Configure separate restricted Google keys, test real coordinate-to-stop walks,
   verify attribution/retention compliance, and perform actual map-provider QA.
4. Resolve production dependency audit findings and regression-test upgrades.
5. Run agreed staging load tests: p95 warm planning under 1 s and uncached
   end-to-end under 5 s. Local functional tests are not a staging load result.
6. Set durable backups, restore drills, proxy redaction/shared limits, report
   retention, support ownership, and jurisdiction-appropriate policy review.

See the [GTFS reference](https://gtfs.org/documentation/schedule/reference/),
[Google Routes API](https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes),
and [Places autocomplete](https://developers.google.com/maps/documentation/javascript/place-autocomplete-data)
when extending the import or provider adapters.
