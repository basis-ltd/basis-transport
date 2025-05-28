# Basis Transport Monorepo

A monorepo containing both the backend (API) and frontend (Client) applications for Basis Transport—a platform for bus tracking, trip management, and real-time fleet operations.

---

## Table of Contents

- [Monorepo Structure](#monorepo-structure)
- [Setup & Development](#setup--development)
- [API Documentation](#api-documentation)
- [Client Documentation](#client-documentation)
- [Key Features](#key-features)
- [Trip Details Visualization](#trip-details-visualization)
- [Contributing](#contributing)
- [License](#license)

---

## Monorepo Structure

```
basis-transport/
  api/      # Backend (Node.js, Express, TypeScript)
  client/   # Frontend (React, Vite, TypeScript)
  dev.sh    # Script to run both API and Client in development
```

---

## Setup & Development

### Prerequisites

- Node.js (v16+ recommended)
- npm (v8+ recommended)
- A running database (e.g., PostgreSQL)

### 1. Install Dependencies

From the root directory, run:

```bash
./dev.sh
```

This script will:
- Install dependencies for both `api` and `client`
- Start both servers concurrently (API and Client in development mode)

### 2. Environment Variables

#### API

- Copy `api/.env.example` to `api/.env` and fill in the required values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=basis-transport
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

#### Client

- No special environment variables required for local development by default.

### 3. Running Individually

#### API

```bash
cd api
npm install
npm run dev
```

#### Client

```bash
cd client
npm install
npm run dev
```

---

## API Documentation

The backend is built with Node.js, TypeScript, and Express. It manages buses, routes, users, trips, and real-time tracking.

### Main Features
- User Authentication & Role-based Access Control
- Transport Card Management
- Trip & User Trip Management
- Automated Audit Logging

### Key Endpoints

#### Trip
- `POST   /trips` — Create a new trip
- `PATCH  /trips/:id` — Update a trip
- `DELETE /trips/:id` — Delete a trip
- `GET    /trips` — List trips (with filters)
- `GET    /trips/:id` — Get trip by ID
- `GET    /trips/reference/:referenceId` — Get trip by reference ID

#### UserTrip
- `POST   /user-trips` — Create a user trip (user boards a trip)
- `PATCH  /user-trips/:id` — Update a user trip
- `DELETE /user-trips/:id` — Delete a user trip
- `GET    /user-trips` — List user trips (with filters)
- `GET    /user-trips/:id` — Get user trip by ID

#### Audit Trail
- Automatic logging of create, update, and delete actions on entities, including who made the change and when.

---

## Client Documentation

The frontend is a modern React application using Vite, TypeScript, and Tailwind CSS.

### Tech Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- Google Maps integration

### Project Structure

```
client/
  src/
    adapters/         # Storage and external adapters
    api/              # API logic (queries, mutations)
    components/       # Reusable UI components
    containers/       # Layout and navigation
    pages/            # Route-based pages (auth, dashboard, trips, etc.)
    states/           # Redux store, slices, hooks
    usecases/         # Business logic hooks
```

### Key Features
- Modular, scalable architecture
- Typed domain models
- Reusable UI components
- Centralized state management
- Organized API queries and mutations
- Hooks-based business logic
- **Live Trip Tracking**: Real-time bus and user location tracking with Google Maps
- **Interactive Trip Details**: View trip metadata and live map for each trip

---

## Key Features

- User authentication and role-based access
- Trip and user trip management
- Real-time bus and user location tracking
- Automated audit logging for all critical actions
- Modern, responsive UI with live maps and trip details

---

## Trip Details Visualization

### Trip Details Page (`/trips/:id`)

The Trip Details page provides a detailed view of a single trip, including a live map and trip metadata.

**Features:**
- **Live Map Tracking:**
  - Uses Google Maps to show the current bus location (if available) and the user's location.
  - Displays the route from the bus to the user, with distance and estimated time.
  - Responsive and visually integrated with the rest of the UI.
- **Trip Metadata:**
  - Reference ID, origin, destination, and other trip details.
- **Location Handling:**
  - If the bus's current location is available, the map shows the route from the bus to the user.
  - If not, it shows the route from the trip's starting point to the user.
  - Uses browser geolocation to determine the user's current position.

**Key Components & Hooks:**
- `MapView` – Embeds a Google Map with dynamic origin/destination and custom labels.
- `useGetTripById`, `useGetTripLocations` – Custom hooks for fetching trip details and computing map locations.

**Example Implementation:**
See `client/src/pages/trips/TripDetailsPage.tsx` for the full implementation.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## License

[MIT](LICENSE)
