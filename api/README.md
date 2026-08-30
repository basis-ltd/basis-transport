# Basis Transport API

NestJS backend for Basis Transport — bus tracking and fleet management.

## Stack

- **NestJS 10** (Express adapter)
- **TypeORM** + PostgreSQL (`synchronize: true`)
- **Passport JWT** (`@nestjs/jwt`, `passport-jwt`) with role-based guards
- **class-validator** DTOs (global `ValidationPipe`)
- **Winston** logging
- **Resend** + React Email (`EmailModule`)
- **Pindo** SMS

## Development

```bash
cd api
cp .env.example .env   # configure DB, JWT, email, SMS
npm install
npm run dev            # single-process watch mode (port 8080)
```

`npm run dev` runs a **single process** to avoid `EADDRINUSE` during local development.

## Production

```bash
npm run build
NODE_ENV=production npm run start:prod
```

With `NODE_ENV=production`, `src/main.ts` forks one worker per CPU (same behavior as the previous Express `server.ts`).

## Node 22+ polyfill

`src/polyfills.ts` is imported first at startup (and in seed scripts) to patch `buffer.SlowBuffer` for `jsonwebtoken` compatibility until that dependency chain is upgraded.

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Watch mode, single process |
| `npm run build` | Compile to `dist/` |
| `npm run start` | Run via Nest CLI (non-watch) |
| `npm run start:debug` | Debug + watch |
| `npm run start:prod` | Run compiled `dist/main.js` |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier |
| `npm run test` | Unit tests (Jest) |
| `npm run test:e2e` | E2E tests (requires DB) |
| `npm run seed` | Permissions → roles → super-admin |

## Environment

Required variables are validated at boot via `src/config/env.validation.ts`. See `.env.example`:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `RESEND_API_KEY`, `RESEND_FROM` (for email)
- `CLIENT_APP_URL`
- `PINDO_TOKEN`, `PINDO_SENDER_ID` (optional SMS overrides)

Typed config: `ConfigService<AppConfig, true>` from `src/config/config.types.ts`.

## API

All routes are under `/api/*`. Root health check:

```
GET / → { "message": "Welcome to the Transport Management API" }
```

Public landing stats (no auth):

```
GET /api/dashboard/public/landing-stats
```

## Seeds

```bash
npm run seed:permissions
npm run seed:roles
npm run seed:super-admin
# or
npm run seed
```

Seeds bootstrap a NestJS application context (`NestFactory.createApplicationContext`).

## Architecture

```
src/
├── main.ts                     # bootstrap; cluster when NODE_ENV=production
├── polyfills.ts
├── app.module.ts
├── config/                     # configuration, env validation, AppConfig types
├── database/
├── common/                     # guards, filters, interceptors, middleware, DTOs, utils
├── entities/                   # shared TypeORM entities
├── integrations/
│   ├── email/                  # EmailModule + EmailService (Resend)
│   └── sms/
├── emails/                     # React Email templates
├── modules/                    # feature modules (auth, trips, users, …)
│   └── <feature>/
│       ├── <feature>.module.ts
│       ├── <feature>.controller.ts
│       ├── <feature>.service.ts
│       └── dto/
└── seeds/
```

Path aliases (tsconfig): `@/*`, `@common/*`, `@modules/*`.
