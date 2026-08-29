# Basis Transport API

NestJS backend for Basis Transport — bus tracking and fleet management.

## Stack

- **NestJS 10** (Express adapter)
- **TypeORM** + PostgreSQL (`synchronize: true`)
- **JWT** authentication with role-based guards
- **Winston** logging
- **Resend** + React Email
- **Pindo** SMS

## Development

```bash
cd api
cp .env.example .env   # configure DB, JWT, email, SMS
npm install
npm run dev            # nest start --watch (port 8080)
```

## Production

```bash
npm run build
npm run start:prod
```

On Node.js 22+, `src/polyfills.ts` is imported at startup to patch `buffer.SlowBuffer` for `jsonwebtoken` compatibility.

## Clustering

`src/main.ts` forks one worker per CPU (same behavior as the previous Express `server.ts`).

## API

All routes are under `/api/*`. Root health check:

```
GET / → { "message": "Welcome to the Transport Management API" }
```

## Seeds

```bash
npm run seed:permissions
npm run seed:roles
npm run seed:super-admin
npm run seed
```

Seeds bootstrap a NestJS application context for dependency injection.

## Architecture

```
src/
├── main.ts                 # Cluster bootstrap
├── app.module.ts
├── common/                 # Guards, filters, interceptors, middleware
├── config/                 # @nestjs/config
├── database/               # TypeORM root module
├── modules/                # Feature modules (auth, trips, users, …)
├── services/               # Business logic (@Injectable)
├── entities/
├── integrations/sms/
├── emails/
└── seeds/
```

## Environment

See `.env.example` for required variables (`DB_*`, `JWT_SECRET`, `RESEND_*`, `CLIENT_APP_URL`, `PINDO_*`).
