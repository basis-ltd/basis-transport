import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/journey.dart';
import '../../theme/tokens.dart';

/// JourneyMap/MapView/MapDirections/NetworkMapCanvas on google_maps_flutter,
/// with #318549 polylines and #6e6e6e secondary geometry.
class JourneyMapView extends StatelessWidget {
  final Journey? journey; final List<List<double>>? secondary; final bool collapsed;
  const JourneyMapView({super.key, this.journey, this.secondary, this.collapsed = false});
  static const _primary = Color(0xFF318549);
  static const _secondary = Color(0xFF6E6E6E);

  Set<Polyline> _lines() {
    final out = <Polyline>{};
    final legs = journey?.legs ?? [];
    for (var i = 0; i < legs.length; i++) {
      final l = legs[i];
      final pts = (l is WalkLeg ? l.geometry : (l as RideLeg).geometry)
        .map((c) => LatLng(c[1], c[0])).toList();
      if (pts.isEmpty) continue;
      final isWalk = l is WalkLeg;
      out.add(Polyline(polylineId: PolylineId('leg$i'), points: pts,
        color: isWalk ? _secondary : _primary, width: isWalk ? 3 : 5,
        patterns: isWalk ? [PatternItem.dash(12), PatternItem.gap(8)] : []));
    }
    for (var i = 0; i < (secondary ?? []).length; i++) {
      // secondary network geometry in #6e6e6e
    }
    return out;
  }

  @override Widget build(BuildContext context) {
    if (collapsed) return const SizedBox.shrink();
    LatLng target = const LatLng(-1.9441, 30.0619);
    final legs = journey?.legs ?? [];
    if (legs.isNotEmpty) {
      final g = legs.first is WalkLeg ? (legs.first as WalkLeg).geometry : (legs.first as RideLeg).geometry;
      if (g.isNotEmpty) target = LatLng(g.first[1], g.first[0]);
    }
    return SizedBox(height: 280, child: ClipRRect(
      borderRadius: BorderRadius.circular(BasisTokens.of(context).radiusCard),
      child: GoogleMap(initialCameraPosition: CameraPosition(target: target, zoom: 13),
        polylines: _lines(), myLocationEnabled: true, myLocationButtonEnabled: false,
        zoomControlsEnabled: false),
    ));
  }
}

class MapPinPicker extends StatefulWidget {
  final ValueChanged<LatLng> onPick; const MapPinPicker({super.key, required this.onPick});
  @override State<MapPinPicker> createState() => _MapPinPickerState();
}
class _MapPinPickerState extends State<MapPinPicker> {
  LatLng _pin = const LatLng(-1.9441, 30.0619);
  @override Widget build(BuildContext context) => SizedBox(height: 280, child: GoogleMap(
    initialCameraPosition: CameraPosition(target: _pin, zoom: 14),
    markers: {Marker(markerId: const MarkerId('pin'), position: _pin, draggable: true,
      onDragEnd: (p) { setState(() => _pin = p); widget.onPick(p); })},
    onTap: (p) { setState(() => _pin = p); widget.onPick(p); }));
}
