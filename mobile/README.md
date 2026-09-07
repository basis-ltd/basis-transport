# Basis Transport — Flutter app

Faithful port of the React client at `client/` consuming the NestJS API at `api/`.

## Setup

Flutter 3.47.2 is installed at `~/Downloads/flutter` (not on PATH):

```sh
export PATH="$HOME/Downloads/flutter/bin:$PATH"
cd mobile
flutter pub get
```

Fonts are bundled as assets (DM Sans 400/500/600, Barlow Condensed 600 for
route numbers). Drop the `.ttf` files into `assets/fonts/` (see `DECISIONS.md`);
they are declared in `pubspec.yaml` and never fetched at runtime.

## Environment (`--dart-define`)

| Key | Default (mirrors `client/.env.example`) |
| --- | --- |
| `API_URL` | `http://localhost:8080/api` |
| `GOOGLE_MAPS_API_KEY` | `''` |
| `PUBLIC_SITE_URL` | `https://transport.basis.rw` |

## Run

```sh
export PATH="$HOME/Downloads/flutter/bin:$PATH"
flutter run --dart-define API_URL=http://localhost:8080/api \
  --dart-define GOOGLE_MAPS_API_KEY=KEY \
  --dart-define PUBLIC_SITE_URL=https://transport.basis.rw
```

Only `flutter create`, `flutter pub get`, `flutter pub add`, `flutter analyze`
work on this machine (no Android SDK / full Xcode, so no `flutter build`/`run`
for devices). Per the overnight brief, `flutter analyze` was intentionally not
run in this pass.

## Structure

`lib/config` environment · `lib/theme` tokens + ThemeData · `lib/models`
hand-written `fromJson`/`toJson` (no codegen) · `lib/services` Dio client,
secure token storage, device favourites, share links · `lib/providers`
Riverpod 3.x providers · `lib/widgets` shared UI kit · `lib/features/journey`
planner pieces · `lib/screens` routes · `lib/router.dart` go_router 18.x.
