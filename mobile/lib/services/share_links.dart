import '../config/environment.dart';
import '../models/journey.dart';

/// Same `/travel?…` URL shape the web app produces so links round-trip.
String buildTravelUrl({JourneyLocation? origin, JourneyLocation? destination, int maxTransfers = 2, int maxWalkMeters = 800}) {
  String loc(JourneyLocation l) => l.stopId != null
    ? 'stop:${l.stopId}:${Uri.encodeComponent(l.name)}:${l.latitude},${l.longitude}'
    : 'coord:${Uri.encodeComponent(l.name)}:${l.latitude},${l.longitude}';
  final q = <String, String>{'maxTransfers': '$maxTransfers', 'maxWalkMeters': '$maxWalkMeters'};
  if (origin != null) q['origin'] = loc(origin);
  if (destination != null) q['destination'] = loc(destination);
  return '${Environment.publicSiteUrl}/travel?${Uri(queryParameters: q).query}';
}
