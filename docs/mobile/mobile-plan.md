# Overnight goal prompt — Basis Transport Flutter app

Build a Flutter mobile application at `mobile/` in this repository that is a
faithful port of the existing React client at `client/`, consuming the existing
NestJS API at `api/`. Work autonomously and continuously until every phase below
is complete. Do not stop to ask questions. Where a detail is genuinely ambiguous,
pick the option that most closely mirrors `client/src`, record the decision in
`mobile/DECISIONS.md`, and keep going.

## Ground rules

1. `client/src/index.css` is the single source of truth for the design system.
   `client/DESIGN.md` explains it. Where the two disagree, the CSS file wins.
2. Translate the CSS custom properties into Dart once, in
   `mobile/lib/theme/tokens.dart`, exposed through a `ThemeExtension` called
   `BasisTokens`. Every widget reads tokens. Never write a raw hex, radius,
   duration, or font size in a widget file — the only exceptions are Google Maps
   polyline/marker styling, which takes literal `#318549` and `#6e6e6e`.
3. Port the type scale as named `TextStyle` getters matching the web utility
   names exactly: `typePageTitle`, `typeH2`, `typeH3`, `typeCardTitle`,
   `typeMetric`, `typeBody`, `typeBodySm`, `typeLabel`, `typeMeta`,
   `typeEyebrow`. Weight ladder is 400 / 500 / 600 and stops there. 12sp floor.
   No letter spacing.
4. DM Sans for everything; Barlow Condensed 600 for route numbers only. Bundle
   both as asset fonts under `mobile/assets/fonts/` and declare them in
   `pubspec.yaml` — do not fetch fonts at runtime.
5. Cards do not float. A card is a 12px-radius, 1px `--line` border on `--paper`
   with no shadow (`BasisCard`). A card nested in a card drops to
   `--surface-sunken`. Only menus (`--shadow-menu`) and dialogs
   (`--shadow-modal`) cast anything.
6. The accent `#318549` (dark: `#4cbe72`) marks position in the network and
   nothing else: the page header stop marker, navigation icons, route number
   badges, and the connectors on a journey step spine. Primary buttons, focus,
   and selection are `--ink`. Do not use the accent to say what a control does.
7. One control height scale — 36 / 40 / 44 — with 40 the default; touch targets
   in the journey flow are 44. Build the control contract once in
   `mobile/lib/widgets/inputs/` (`AppButton`, `AppTextField`, `AppSelect`,
   `AppTextArea`, `FieldShell`) mirroring
   `client/src/components/inputs/control.ts`, and never style a control inline.
8. Implement light and dark themes from the `:root` and `.dark` blocks of
   `index.css`, following the system setting.
9. Entrance animation is one fade plus an 8px rise over 200ms with the
   `--ease-glide` curve. No staggered cascades, no parallax, no hover scale.
   Honour `MediaQuery.disableAnimations`.
10. Reuse the API's copy. Passenger-facing wording, notices, and error strings
    come from `client/src/features/journey/messages.ts` and the matching web
    pages — do not rewrite them.

## Phase 1 — Project foundation

Create the Flutter project at `mobile/` with package name `rw.basis.transport`,
Android and iOS targets only. Add `mobile/.gitignore`, and a `mobile/README.md`
covering setup, environment variables, and how to run.

Dependencies: `flutter_riverpod`, `go_router`, `dio`, `google_maps_flutter`,
`geolocator`, `shared_preferences`, `flutter_secure_storage`, `url_launcher`,
`intl`. Do not add code generation (`freezed`, `json_serializable`,
`build_runner`) — write `fromJson` / `toJson` by hand so the build never depends
on a generator step.

Configure environment through `--dart-define`: `API_URL`,
`GOOGLE_MAPS_API_KEY`, `PUBLIC_SITE_URL`. Read them in
`mobile/lib/config/environment.dart` with the same defaults as
`client/.env.example`. Wire the Maps key into the Android manifest and the iOS
AppDelegate.

Build the theme layer described in the ground rules, plus
`mobile/lib/theme/theme.dart` assembling `ThemeData` for light and dark.

## Phase 2 — Data layer

Port every model in `client/src/features/journey/types.ts` and
`client/src/types/` to Dart classes under `mobile/lib/models/`, keeping field
names and nullability identical.

Build `mobile/lib/services/api_client.dart` on Dio, mirroring
`client/src/features/journey/api.ts` and `client/src/api/rootApi.ts`: base URL
from `API_URL`, `Authorization: Bearer <token>` only on authenticated calls, an
`x-idempotency-key` UUID per mutation, unwrap the `{ message, data }` envelope,
surface `message` (joining it when it is an array) as the error text, treat 204
as an empty success, and never attach a token to public reads.

Cover these endpoints:

- `GET /network/status`, `GET /network/map`
- `POST /journeys/plan` — body `{ origin, destination, maxTransfers (0–4,
  default 2), maxWalkMeters (100–2000), preference: 'fewest_transfers' |
  'least_walking', departureAt }`
- `GET /stops`, `GET /stops/:id`, `GET /routes`, `GET /routes/:id` — query
  `page`, `size`, `q`, `lat`, `lng`
- `GET /agencies`, `GET /agencies/:id`, `GET /corridors`, `GET /corridors/:id`
- `POST /auth/login`, `/auth/signup`, `/auth/forgot-password`,
  `/auth/reset-password`, `/auth/complete-registration`, `/auth/phone/precheck`,
  `/auth/phone/send-otp`, `/auth/phone/verify-otp`,
  `/auth/phone/reset/send-otp`, `/auth/phone/reset/verify-otp`
- `GET /me/saved-items`, `POST /me/saved-items`, `DELETE /me/saved-items/:id`
- `POST /reports`
- `GET /insights/commuter`, `GET /insights/driver`, `GET /insights/overview`
- `GET /users`, `GET /users/:id`, `POST /users`, `DELETE /users/:id`

Riverpod providers per resource, mirroring the loading / error / refresh shape
of `useNetworkResource`. Auth token in `flutter_secure_storage`; device
favourites in `shared_preferences` under the key `basis.saved.v1` with the same
shape and the same 100-item cap and href allow-list as
`client/src/features/journey/saved.ts`.

## Phase 3 — Shared UI kit

Port to `mobile/lib/widgets/`, one file per component, matching the web
component names:

- `PageShell`, `PageBody`, `PageHeader` (eyebrow, title, description, actions,
  and the accent route rail from `.app-page-stop`), `PageNote`, `PageSection`,
  `DetailList`, `PageFooter`. `PageBody` owns the 28px gap; blocks inside it
  never set their own outer margins.
- `BasisCard` (framed) and `QuietCard`.
- The input set from ground rule 7, with focus as a 1px inset `--ink` ring and
  an `--ink` border, and invalid as a `--danger` edge plus an icon plus a
  message.
- `RouteBadge` (Barlow Condensed, accent), `StatusBadge`, `StatCard`,
  `Loader`, `ConfirmDialog`, `Modal`, `Combobox`, `DatePicker`, `TelInput`
  (with `libphonenumber`-equivalent validation via `intl`), `Toggle`,
  `KeyValuePair`, `BackButton`, `Table` with pagination, `Sparkline`,
  `DonutChart`, `SeriesChart` (accent first, and vary dash patterns across
  series).
- Bottom navigation and a drawer built from the roles and items in
  `client/src/constants/sidebar.constants.ts`, filtered by role the same way.

## Phase 4 — Guest journey planner

This is the core of the product; give it the most care. Port, from
`client/src/features/journey/` and `client/src/pages/common/`:

- Landing screen with the hero journey form (`LandingHeroForm`,
  `LandingJourneyMap`).
- `TravelGuidancePage` → the planner screen: From / To pickers with stop and
  place suggestions where stops are listed first and route numbers disambiguate
  similarly named boarding points (`LocationSearch`, `PlaceSearch`,
  `StopIdentity`); optional use-my-location that requests permission only after
  the user taps it (`useGeolocationPickup`, `useNearestPlace`); Find a journey;
  results comparing changes, walking distance and ride distance (`JourneyCard`).
- `FollowJourney` — boarding, intermediate stop, transfer and alighting
  instructions on a step spine with accent connectors. Text instructions must be
  fully usable with the map collapsed.
- `JourneyMap` / `MapView` / `MapDirections` / `NetworkMapCanvas` on
  `google_maps_flutter`, with `#318549` polylines and `#6e6e6e` secondary
  geometry.
- `WalkingDirections`, `MapPinPicker`, `SaveButton`, `ReportIssue`.
- Share: warn that the link carries precise selected coordinates before copying,
  and produce the same `/travel?…` URL shape the web app produces so links
  round-trip between platforms. Handle inbound links with only an origin by
  asking for a destination.
- Empty and failure states: when no connection is found, offer another stop or
  increasing endpoint walking up to 2 km, and state that nearby stops do not
  imply a safe crossing between platforms.
- Carry the historical-dataset notice and the coverage/source dates from
  `GET /network/status` wherever the web app shows them.

## Phase 5 — Discovery, saved, and content

- `/routes` and `/stops` directories and detail screens
  (`NetworkDirectoryPage`, `NetworkDetailsPage`, `NetworkExplorer`), including
  source-qualified lines, directional variants, serving routes, and Find nearby
  stops using a single location request. Label discovery distances as
  straight-line.
- Saved screen (`SavedJourneysPage`) working fully signed out, with optional
  sync for signed-in users and an explicit confirmation before importing device
  favourites.
- Static content screens: About, Help centre, Supported cities, Contact,
  Privacy, Terms, Cookies, Not found, and the retired-service screen.

## Phase 6 — Auth and account

Port `client/src/pages/auth/`: login, signup, forgot password, phone OTP reset,
reset password, complete registration, each on the `AuthPageShell` equivalent.
Use the form pattern from `Login.tsx` — a single form controller, field-level
errors fed to the shared `errorMessage` slot. Then the profile screen
(`UserProfilePage`) and session handling: token persistence, restore on launch,
expiry handling, and the post-login redirect behaviour in
`client/src/helpers/authRedirect.helper.ts`.

## Phase 7 — Dashboard

Port `DashboardPage` and the commuter, driver, and operations dashboards from
`client/src/components/dashboard/`, using the ported chart widgets and
`StatCard`, driven by the `/insights/*` endpoints and gated by role exactly as
the web app gates them.

## Phase 8 — Staff

Port the users module (list, details, create, delete) and the network
administration screen (`NetworkAdminPage`, `NetworkDraftReview`,
`TransferReviewEditor`) covering datasets, import issues, draft edits,
verification and rights evidence, publish and restore, transfer review, and
passenger report review. Restrict to ADMIN and SUPER_ADMIN the same way
`StaffRoutes` does.

## Phase 9 — Polish

Accessibility: semantics labels on every interactive element, colour never the
sole carrier of meaning, 4.5:1 body text and 3:1 UI edges in both themes,
minimum 36px controls and 44px journey-flow targets, and wide content scrolling
inside its own container rather than the screen scrolling sideways.

Then write `mobile/PARITY.md` mapping every web route to its Flutter screen, and
`mobile/DESIGN.md` documenting the token translation, both kept accurate to what
you actually built.

## Working discipline

Commit after each completed screen or component group with a conventional
commit message. Keep files small and one concern each, matching the structure
and comment density of `client/src`. If a phase turns out to be blocked, write
the blocker into `mobile/DECISIONS.md` and move to the next phase rather than
stopping — return to it once the rest is done.
