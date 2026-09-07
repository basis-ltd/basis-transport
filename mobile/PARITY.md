# Web route → Flutter screen parity (as built)

| Web route | Flutter |
| --- | --- |
| `/` LandingPage | `LandingScreen` (`lib/screens/landing_screen.dart`) |
| `/travel` TravelGuidancePage (+`?origin` only → asks destination) | `TravelScreen` (`lib/screens/travel_screen.dart`) |
| `/routes` NetworkDirectoryPage(kind=routes) | `DirectoryScreen(kind: routes)` |
| `/routes/:id` NetworkDetailsPage | `DetailsScreen(kind: routes)` |
| `/stops` NetworkDirectoryPage(kind=stops) | `DirectoryScreen(kind: stops)` |
| `/stops/:id` NetworkDetailsPage | `DetailsScreen(kind: stops)` |
| `/saved` SavedJourneysPage | `SavedScreen` |
| `/dashboard` DashboardPage (commuter/driver/operations) | `DashboardScreen` (scope by role) |
| `/admin/network` NetworkAdminPage (+DraftReview, TransferReviewEditor) | `NetworkAdminScreen` |
| `/users`, `/users/create`, `/users/:id` | `UsersScreen`, `CreateUserScreen`, `UserDetailsScreen` |
| `/auth/login` Login | `LoginScreen` (post-login `redirect` honored) |
| `/auth/register` Signup | `SimpleAuthScreen(mode: signup)` |
| `/auth/forgot-password` ForgotPassword | `SimpleAuthScreen(mode: forgot)` |
| `/auth/reset-phone-otp` PhoneResetOtp | `SimpleAuthScreen(mode: phone-otp)` |
| `/auth/reset-password` ResetPassword | `SimpleAuthScreen(mode: reset)` |
| `/auth/complete-registration` CompleteRegistration | `SimpleAuthScreen(mode: complete)` |
| `/account/profile` UserProfilePage | `ProfileScreen` |
| `/about`, `/help`, `/cities`, `/contact`, `/privacy`, `/terms`, `/cookies` | `ContentScreen(name: …)` |
| `/trips*`, `/user-trips*`, `/locations*`, `/account/transport-cards*` | `ContentScreen(name: retired)` via router redirect |
| `*` NotFoundPage | `ContentScreen(name: notfound)` (errorBuilder) |

Auth gating: `/dashboard`, `/account/profile` require sign-in
(AuthenticatedRoutes); `/admin/network`, `/users*` require ADMIN/SUPER_ADMIN
(StaffRoutes). Guest planning (`/`, `/travel`, `/routes*`, `/stops*`) is public.
