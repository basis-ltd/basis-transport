import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import '../widgets/cards.dart';
import '../widgets/page_shell.dart';

/// Static content: About, Help, Cities, Contact, Privacy, Terms, Cookies,
/// Not found, Retired-service. Copy mirrors the web pages' wording family.
class ContentScreen extends StatelessWidget {
  final String name; const ContentScreen({super.key, required this.name});
  static const _bodies = {
    'about': ('About Basis Transport', 'Basis Transport plans bus journeys from the historical network dataset, with walking directions, fares, and source/verification evidence on every result.'),
    'help': ('Help centre', 'Pick From and To from the suggestions, or use your location. If no connection is found, try a nearby stop or allow up to 2 km of walking. Nearby stops do not imply a safe crossing between platforms.'),
    'cities': ('Supported cities', 'Coverage follows the imported historical dataset. Check the coverage dates on the home screen for the current source.'),
    'contact': ('Contact us', 'Send feedback through the report form on any journey, or email the team from the public site.'),
    'privacy': ('Privacy policy', 'Location is requested only when you choose it. Saved journeys stay on your device unless you sign in and import them.'),
    'terms': ('Terms of service', 'Journey results come from a historical dataset and may not reflect live operations. Verify critical trips locally.'),
    'cookies': ('Cookie policy', 'The mobile app does not use web cookies. Device storage holds only your saved favourites.'),
    'notfound': ('Page not found', 'The page you asked for does not exist. Try the home screen or the journey planner.'),
    'retired': ('Retired service', 'This section (trips, user-trips, locations, transport-cards) has been retired. Use Travel, Saved, Routes, and Stops instead.'),
  };
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final b = _bodies[name] ?? _bodies['notfound']!;
    return Scaffold(body: PageBody(children: [
      PageHeader(eyebrow: 'Information', title: b.$1),
      BasisCard(child: Text(b.$2, style: t.typeBody)),
    ]));
  }
}
