# Journey planner: implementation and release runbook

## Current delivery status — 30 August 2026

The application runs as a **local/internal network beta**, not verified public
transport coverage. Both target pages use the real planner. Guest routes,
stops, nearby discovery, sharing, local favorites, optional owner-scoped sync,
staff draft editing/publication/rollback, and persisted reports are implemented.
Live arrivals, seats, payments, tracking and passenger check-ins are not provided.

The frontend-design direction uses the existing paper/ink/green palette, DM Sans,
condensed route badges, and a boarding/transfer/alighting instruction spine.
Maps and staff/account screens are lazy-loaded. The initial client JS chunk is
about 425 kB before compression (136 kB gzip); lazy chunks are additional.

### Source status

The original DT4A GTFS produces **195 directional patterns, 55 route IDs, and
828 source-qualified named stop IDs**, with 28 import notices. These differ from
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

## Import, review, publish, rollback

Import always creates a draft transactionally. The default import downloads
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

Sign in as ADMIN/SUPER_ADMIN at `/admin/network`. Inspect quality notices, clone
published data to a draft, then edit its validated JSON snapshot. Correct names,
aliases, ordered occurrences, shapes, service dates, sourced fares, and reviewed
transfer links there. Shared stop IDs must have consistent metadata. Imports
currently use the CLI; the review editor is JSON-based, not a GIS editing tool.

Fixed fares have amount, RWF currency, source URL, validity dates and verification.
Transfers require distinct stop IDs, pedestrian geometry, distance, duration,
review status and evidence. Proximity alone never creates a transfer. Both
directions require separate reviewed links when appropriate.

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
and longitude. Stop IDs are authoritative. Responses distinguish `ok`,
`outside_coverage`, `no_connection`, and `provider_unavailable`; invalid input is
400, unpublished/unusable coverage is 503. Up to three distinct route-chain
alternatives are returned. Search bounds: eight candidate stops per endpoint,
two transfers, four nondominated labels per state, 2,000 frontier labels, and
150,000 ride expansions. Bounds can omit alternatives in very dense networks.

Endpoint walks use Google's pedestrian routes (3.5 s timeout); reviewed transfers
are capped at 400 m. Endpoint preference defaults to 800 m and cannot exceed
2 km. Ranking is transfers, walking, then ride distance, or least walking first.
There is no departure/arrival-time optimizer. Same-route reboarding is excluded
in v1. Missing shapes are schematics; missing fares/timing remain null. Ride
durations are source estimates; total time remains unknown without waiting time.

Public directory/detail endpoints are `/api/stops`, `/api/stops/:id`,
`/api/routes`, `/api/routes/:id`, and `/api/network/status`. Stop search supports
`q`, `lat`, `lng`, `radius` (100–5,000 m), `page` (zero-based), and `size` (1–100).
Nearby distances are straight-line discovery distances, not safe walking routes.

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

Verification completed locally: 15 API unit tests, 8 isolated API/security tests,
8 frontend component/utility tests, and 10 desktop/mobile Playwright tests. Both
production builds pass. A real Remera–Downtown browser flow had no runtime errors.
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
