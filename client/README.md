# Basis Transport

A modern, minimal React application for the Basis Transport project. This app provides a foundation for building scalable, maintainable web interfaces using the latest frontend technologies.

## Tech Stack
- **React 19** – UI library
- **TypeScript** – Static typing
- **Vite** – Fast build tool and dev server
- **Tailwind CSS** – Utility-first CSS framework
- **Lucide React** – Icon library
- **ESLint** – Linting and code quality

## Project Structure

```
basis-transport-fe/
  src/
    adapters/         # Storage and external adapters
      storage/
    api/              # API logic (queries, mutations, rootApi)
      queries/
      mutations/
    components/       # Reusable UI components
      custom/
      inputs/
      table/
      ui/
    constants/        # App-wide constants
    containers/       # Layout and navigation containers
      navigation/
    helpers/          # Utility/helper functions
    lib/              # General utilities
    pages/            # Route-based pages
      auth/
      common/
      dashboard/
      trips/
    routes/           # Routing logic and outlets
      outlets/
    states/           # State management (store, slices, hooks)
      slices/
    types/            # TypeScript types and entities
    usecases/         # Business logic hooks (by domain)
      auth/
      common/
      trips/
  public/             # Static assets
  ...                 # Config and root files
```

## Key Features & Changes
- **Modular Architecture:** Clear separation of concerns with dedicated folders for API, business logic (usecases), state management, and UI components.
- **Typed Entities:** All domain models and types are defined in `src/types` for strong type safety.
- **Reusable Components:** UI is built from modular, reusable components under `src/components`.
- **State Management:** Centralized Redux store and slices in `src/states`.
- **API Layer:** Organized API queries and mutations for scalable data fetching.
- **Hooks-based Usecases:** Business logic is encapsulated in hooks under `src/usecases` for reusability and testability.
- **Live Trip Tracking:** Real-time bus and user location tracking with Google Maps, including route, distance, and time.
- **Interactive Trip Details:** View trip metadata and live map for each trip, with alternative route navigation.
- **Modern Tooling:** Uses Vite, Tailwind CSS, and ESLint for a fast, modern development experience.

## 🚍 Trip Tracking & Management

### Trips Page (`/trips`)
- **Overview:**  The Trips page displays a paginated, sortable, and filterable table of all trips in the system.
- **Features:**
  - **Table Columns:** Reference ID, Depart, Destination, Status, Created By, Start/End Time, and Actions.
  - **Actions:** View trip details via a contextual menu.
  - **Pagination:** Server-driven, with controls for page and size.
  - **Loading States:** Skeleton rows for loading, and clear empty states.
  - **Data Source:** Uses Redux state and RTK Query for efficient data fetching and caching.

### Trip Details Page (`/trips/:id`)
- **Overview:**  The Trip Details page provides a detailed view of a single trip, including a live map and trip metadata.
- **Features:**
  - **Live Map Tracking:**
    - Uses Google Maps to show the current bus location (if available) and the user's location.
    - Displays the route from the bus to the user, with distance and estimated time.
    - Supports alternative routes with navigation controls.
    - Responsive, accessible, and visually integrated with the rest of the UI.
  - **Trip Metadata:**
    - Reference ID, origin, destination, and other trip details.
  - **Location Handling:**
    - If the bus's current location is available, the map shows the route from the bus to the user.
    - If not, it shows the route from the trip's starting point to the user.
    - Uses browser geolocation to determine the user's current position.

### Key Components & Hooks
- **`MapView`**  – Embeds a Google Map with dynamic origin/destination and custom labels.
- **`MapDirections`**  – Renders the route, distance, duration, and alternative routes. Fully semantic and responsive, with accessible navigation.
- **`useFetchTrips`, `useGetTripById`, `useGetTripLocations`**  – Custom hooks for fetching trip lists, trip details, and computing map locations.

### Data Model
- **Trip:**  Reference ID, status, start/end time, origin/destination (with coordinates), current bus location, and creator.
- **Location:**  Name, description, address (geometry), and creator.
- **Geometry:**  GeoJSON-like structure for coordinates.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Preview production build:**
   ```bash
   npm run preview
   ```
5. **Lint the codebase:**
   ```bash
   npm run lint
   ```