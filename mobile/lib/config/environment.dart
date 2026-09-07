import 'package:flutter/foundation.dart';

/// Environmentتصر through `--dart-define`, mirroring `client/.env.example`.
///
/// Defaults match the web client:
/// - API_URL defaults to `http://localhost:8080/api` (VITE_API_URL)
/// - PUBLIC_SITE_URL defaults to `https://transport.basis.rw`
/// - GOOGLE_MAPS_API_KEY defaults to `''` (maps render without API extras)
class Environment {
  const Environment._();

  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:8080/api',
  );

  static const String publicSiteUrl = String.fromEnvironment(
    'PUBLIC_SITE_URL',
    defaultValue: 'https://transport.basis.rw',
  );

  static const String googleMapsApiKey = String.fromEnvironment(
    'GOOGLE_MAPS_API_KEY',
    defaultValue: '',
  );

  static void debugPrint() {
    if (kDebugMode) {
      // Never print the maps key value itself.
      // ignore: avoid_print
      print('ENV apiUrl=$apiUrl publicSiteUrl=$publicSiteUrl '
          'mapsKeySet=${googleMapsApiKey.isNotEmpty}');
    }
  }
}
