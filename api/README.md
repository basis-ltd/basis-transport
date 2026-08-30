# Basis journey-planning API

NestJS + TypeORM + PostgreSQL/PostGIS. See the
[runbook](../docs/JOURNEY-PLANNER-RUNBOOK.md) for migration, import, backup,
provider configuration, API contracts, and release gates.

## Commands

- `npm run db:migrate`: explicit transactional migrations; back up first.
- `npm run network:import`: import original GTFS into a draft.
- `NETWORK_ACCESS=internal npm run network:import -- --publish-internal`: local historical beta.
- `npm run dev`: API on port 8080 by default.
- `npm run build` and `npm test -- --runInBand`: build/unit checks.
- `npm run test:e2e -- --runInBand`: requires isolated `DB_NAME=basis_planner_test_*`
  and `NETWORK_ACCESS=internal`; never use the developer database.

Public APIs: journeys/plan, network/status, routes, stops, reports.
Protected APIs: me/saved-items, admin/network, user and audit administration.
Retired trips, user-trips, locations, transport-cards and dashboard endpoints
return 410. Their records and audit relationships remain archived in place.

No schema synchronization, inferred fares, automatic platform merges, or driving
geometry for bus legs. See `src/modules/network/network.types.ts` for the typed
contract and `src/database/migrations` for schema changes.
