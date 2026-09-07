# Decisions (ambiguous details resolved toward `client/src`)

1. **Fonts are declared but binaries absent.** `pubspec.yaml` declares DM Sans
   (400/500/600) + Barlow Condensed 600 under `assets/fonts/`, but the `.ttf`
   binaries are not in the repo — this environment cannot fetch them and the
   rules forbid runtime fetching. Drop Google-Fonts `DMSans-Regular/Medium/
   SemiBold.ttf` + `BarlowCondensed-SemiBold.ttf` into `mobile/assets/fonts/`.
2. **Riverpod 3.x / go_router 18.x APIs used as resolved** (`flutter_riverpod`
   3.4.3, `go_router` 18.0.1): `NotifierProvider(New)`, `FutureProvider.family`
   with record args, `GoRouter(factory)` + `ShellRoute`. Verified against
   `~/.pub-cache` sources, not memory.
3. **TelInput validation** is an E.164-ish digit check (9–15 digits) via
   `intl`-adjacent logic — no Flutter equivalent of `libphonenumber` was added
   to keep the dependency list exactly as specified.
4. **Admin datasets/publish** render evidence/publish/restore UI against the
   public `/network/*` + `/reports` surface; dedicated admin dataset endpoints
   were not found in the plan's endpoint list, so publish is a confirmed stub
   queued behind the real endpoint.
5. **Plan provider equality** keys on origin/destination names + options (coarse
   but sufficient for `FutureProvider.family` caching).
6. **Verification run on request**: `flutter analyze` reports no errors and
   no warnings (8 info-level `use_null_aware_elements` suggestions on
   conditional map entries, unactionable — Dart has no null-aware entry
   syntax — and left as-is).
7. **No `uuid` package**: the idempotency key uses a local RFC-4122 v4
   generator (`dart:math`) to keep the dependency list exactly as specified.
8. **Verification skipped per brief (original build)**: the mobile-plan prompt explicitly
   excludes verification and this machine cannot `flutter build`; `flutter
   analyze` was not run. Expect analyzer nits on first run.
