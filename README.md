# Basis Transport

A guest-first public transport journey planner built with React/Vite and
NestJS/TypeORM/PostGIS. Plan connections, explore directional routes and stops,
find nearby boarding points, share links, and save favorites without an account.
Accounts add optional synchronization; staff review and publish network data.

The local dataset is a **historical internal beta**, not current verified public
coverage. No live arrivals, seat availability, tracking, payments, or passenger
check-ins are provided.

## Start here

See [the planner runbook](docs/JOURNEY-PLANNER-RUNBOOK.md) for setup, migrations,
Google keys, testing, backup recovery, data provenance, and public-release gates.
See [the passenger guide](GUIDE.md) for using the application.

- `api/`: NestJS API, immutable network datasets, directional GTFS importer.
- `client/`: guest planner, Google map adapter, discovery and staff review UI.
- `api/legacy/` and `client/legacy/`: retired source, outside active builds.
- `ATTRIBUTION.md`: source history and unresolved usage rights.

## Development

Use Node 22+ and PostgreSQL with PostGIS. Configure each app from its
`.env.example`. Install dependencies in both directories with `npm ci`.

From `api`, run `npm run db:migrate`, then
`NETWORK_ACCESS=internal npm run network:import -- --publish-internal`, then
`npm run dev`. From `client`, run `npm run dev`.

Historical internal data is loopback-only. Do not expose it publicly.
Schema synchronization is disabled; preserve backups before applying migrations.

## Verification

API: `npm run build`, `npm test -- --runInBand`; API integration tests require
an isolated `basis_planner_test_*` database (see the runbook).
Client: `npm run build`, `npm test`, and `npm run test:e2e`.

Public launch requires current coverage, reviewed transfers, resolved source rights,
provider setup, dependency remediation, and staging/operational acceptance.
