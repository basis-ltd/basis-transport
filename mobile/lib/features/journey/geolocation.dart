import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../models/journey.dart';

/// useGeolocationPickup/useNearestPlace: permission requested only after
/// the user taps (mirrors web consent-first flow).
Future<JourneyLocation?> requestPickupLocation(BuildContext context) async {
  var perm = await Geolocator.checkPermission();
  if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
  if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Location permission is needed to use your location.')));
    }
    return null;
  }
  final pos = await Geolocator.getCurrentPosition();
  return JourneyLocation(latitude: pos.latitude, longitude: pos.longitude, name: 'My location');
}
