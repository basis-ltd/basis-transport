# Retired operations source

Trip, check-in, ad-hoc location, transport-card, dashboard, flattened-network
controllers and the old demo seeder are retained here for reference, outside
the active TypeScript build. They must not be registered again.

Original database entities remain to preserve foreign keys and audit history.
The archive migration blocks changes to legacy records; active retired HTTP
endpoints return 410. See `docs/JOURNEY-PLANNER-RUNBOOK.md` at repository root.
