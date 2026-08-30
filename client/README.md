# Basis passenger client

React + Vite + TypeScript. The public product is `/travel`, `/routes`, `/stops`,
and `/saved`. Sign-in is optional for synchronization, mandatory for staff tools.

## Development

Configure `.env` from `.env.example`, then `npm ci` and `npm run dev`.
Use a separately restricted browser Google Maps key; never include the server
Routes key in a Vite variable.

Run `npm run build`, `npm test`, and `npm run test:e2e`.
Install Playwright Chromium with `npx playwright install chromium` if needed.
`PLAYWRIGHT_CHROMIUM_PATH` can select an existing Chromium executable.

The shared journey form uses local stops and a Google Places adapter. URLs carry
both selected endpoints. Maps are optional/lazy; stop-by-stop text remains usable
when maps fail. Favorites persist only after an explicit action.

Core planner strings live in `src/features/journey/messages.ts`; preserve complete
sentences and plural forms when adding translations. English is the only shipped
language. Retired source is preserved under `legacy/`, outside active builds.

See [the release runbook](../docs/JOURNEY-PLANNER-RUNBOOK.md) and
[the passenger guide](../GUIDE.md).
