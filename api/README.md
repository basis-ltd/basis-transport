# Basis Transport

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This is the backend service for Basis Transport, responsible for managing buses, routes, users, and real-time tracking. It is built with Node.js, TypeScript, and Express, and uses a modular architecture for scalability and maintainability.

---

## Architecture

- **Entry Point:** `src/server.ts` starts the HTTP server.
- **App Initialization:** `src/app.ts` sets up the Express app, middleware, and routes.
- **Database:** `src/data-source.ts` configures the database connection (likely using TypeORM or similar).
- **Modular Structure:** Business logic is separated into services, routes, middlewares, helpers, and entities.
- **Environment Variables:** Managed via a `.env` file for sensitive configuration.

---

## Folder Structure

```
src/
  app.ts            # Express app setup
  server.ts         # Application entry point
  data-source.ts    # Database connection/config
  constants/        # Application-wide constants
  entities/         # ORM entities/models
  helpers/          # Utility/helper functions
  middlewares/      # Express middlewares
  routes/           # Express route handlers
  services/         # Business logic/services
  types/            # TypeScript type definitions
```

**You should also create a `.env.example` file in your project root as described above.**

Let me know if you want to add more details or further customize the documentation!

---

## Setup

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)
- A running database (e.g., PostgreSQL, MySQL, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/basis-ltd/basis-transport-be.git
   cd basis-transport-be
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```

4. **Run database migrations (if applicable):**
   ```bash
   # Example for TypeORM
   npm run typeorm migration:run
   ```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# .env.example

# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=basis-transport

# JWT
JWT_SECRET=your-jwt-secret

# Other
NODE_ENV=development
```

**Note:** Do not commit your real `.env` file to version control.

---

## Running the Application

### Development

```bash
npm run dev
```

This will start the server with hot-reloading (using `ts-node-dev` or similar).

### Production

```bash
npm run build
npm start
```

- `npm run build` compiles TypeScript to JavaScript in the `dist/` folder.
- `npm start` runs the compiled code.

---

## Scripts

- `npm run dev` — Start in development mode
- `npm run build` — Compile TypeScript
- `npm start` — Start in production mode
- `npm test` — Run tests (if configured)
- `npm run lint` — Lint the codebase

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## License

[ISC](LICENSE)

## Features

- User Authentication
- Role-based Access Control
- Transport Card Management
- Trip Management
- User Trip Management
- Automated Audit Logging

## Trip and UserTrip Management

The system supports comprehensive management of trips and user trips, enabling tracking of journeys, user participation, and real-time status updates.

### Trip
A **Trip** represents a scheduled or ongoing journey, including its route, status, and capacity.

**Main fields:**
- `referenceId`: Unique reference for the trip
- `startTime`, `endTime`: Timestamps for trip duration
- `locationFromId`, `locationToId`: Start and end locations
- `createdById`: User who created the trip
- `status`: Current status (e.g., PENDING, ACTIVE, COMPLETED)
- `totalCapacity`: Maximum number of users
- `currentLocation`: Geospatial location (if tracked)

**Endpoints:**
- `POST   /trips` — Create a new trip
- `PATCH  /trips/:id` — Update a trip
- `DELETE /trips/:id` — Delete a trip
- `GET    /trips` — List trips (with filters)
- `GET    /trips/:id` — Get trip by ID
- `GET    /trips/reference/:referenceId` — Get trip by reference ID

### UserTrip
A **UserTrip** records a user's participation in a trip, including entry/exit locations and times.

**Main fields:**
- `userId`: The user on the trip
- `tripId`: The trip being joined
- `status`: User's trip status (e.g., IN_PROGRESS, COMPLETED)
- `entranceLocation`, `exitLocation`: Geospatial points
- `startTime`, `endTime`: When the user joined/left
- `createdById`: Who recorded the entry

**Endpoints:**
- `POST   /user-trips` — Create a user trip (user boards a trip)
- `PATCH  /user-trips/:id` — Update a user trip
- `DELETE /user-trips/:id` — Delete a user trip
- `GET    /user-trips` — List user trips (with filters)
- `GET    /user-trips/:id` — Get user trip by ID

### Example Usage
- Create a trip, then allow users to join via user trips.
- Track which users are on which trips, their entry/exit points, and trip status.
- Use filters to query trips by status, location, or creator, and user trips by user, trip, or time range.

## Audit Trail System

The system includes a comprehensive audit trail feature that automatically logs changes when entities are updated or deleted:

- **What**: Records old values and new values for each change
- **When**: Timestamps each change (via `createdAt` field)
- **Who**: Tracks which user made the change
- **How**: Uses decorator patterns to transparently capture changes

### Implementation

The audit system consists of:

1. **AuditLog Entity**: Stores audit records with action type (create/update/delete), entity information, old/new values, and user ID
2. **AuditLogService**: Provides methods to create audit logs and retrieve entity history
3. **Audit Decorators**: `@AuditUpdate` and `@AuditDelete` decorators that can be applied to service methods

### Usage Example

To enable audit logging on a service method:

```typescript
@AuditUpdate({
  entityType: 'EntityName',
  getEntityId: (args) => args[0], // First parameter is the ID
  getUserId: (args) => args[1]?.createdById // Extract userId from method arguments
})
async updateEntity(id: UUID, data: Partial<Entity>): Promise<Entity> {
  // Method implementation
}

@AuditDelete({
  entityType: 'EntityName',
  getEntityId: (args) => args[0], // First parameter is the ID
  getUserId: (args) => args[1]?.createdById // Extract userId from method arguments
})
async deleteEntity(id: UUID, metadata?: { createdById?: UUID }): Promise<void> {
  // Method implementation
}
```

The audit system will automatically:
1. Capture the entity's state before changes
2. Record the user who made the change (from method arguments or AuditContext)
3. Store the operation type (update/delete)
4. Save the data in the audit_logs table

### Viewing Audit History

The `AuditLogService` provides methods to retrieve audit logs:

```typescript
// Fetch all logs with filtering options
const { logs, total } = await auditLogService.fetchAuditLogs(
  page,
  limit,
  entityType,
  entityId,
  userId,
  startDate,
  endDate
);

// Fetch history for a specific entity
const history = await auditLogService.fetchEntityHistory(entityType, entityId);
```

This audit trail implementation ensures comprehensive change tracking without significant performance impact, using decorators to maintain separation of concerns.
