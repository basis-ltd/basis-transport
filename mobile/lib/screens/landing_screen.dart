import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/journey/journey_widgets.dart';
import '../features/journey/messages.dart';
import '../models/journey.dart';
import '../providers/providers.dart';
import '../theme/tokens.dart';
import '../widgets/cards.dart';
import '../widgets/inputs/app_button.dart';
import '../widgets/page_shell.dart';

/// Landing: hero journey form + coverage/source dates from GET /network/status.
class LandingScreen extends ConsumerStatefulWidget {
  const LandingScreen({super.key});
  @override ConsumerState<LandingScreen> createState() => _LandingScreenState();
}
class _LandingScreenState extends ConsumerState<LandingScreen> {
  JourneyLocation? _from; JourneyLocation? _to;
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final status = ref.watch(networkStatusProvider);
    return Scaffold(
      body: PageBody(children: [
        FadeRise(child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 8, children: [
          Text('Basis Transport', style: t.typeEyebrow),
          Text('Plan your journey across the city', style: t.typePageTitle),
          Text('Bus routes, stops, walking directions, and fares — from the historical network dataset.', style: t.typeBody),
        ])),
        BasisCard(child: Column(spacing: 12, children: [
          LocationSearch(label: JourneyMessages.from, value: _from, onChanged: (v) => setState(() => _from = v)),
          LocationSearch(label: JourneyMessages.to, value: _to, onChanged: (v) => setState(() => _to = v)),
          Row(spacing: 8, children: [
            Expanded(child: AppButton(label: JourneyMessages.find, size: AppControlSize.lg, onPressed: (_from == null || _to == null) ? null : () =>
              context.go('/travel?o=${Uri.encodeComponent(_from!.name)}&d=${Uri.encodeComponent(_to!.name)}'))),
            AppButton(label: JourneyMessages.swap, variant: AppButtonVariant.outline, size: AppControlSize.lg, onPressed: () => setState(() { final x = _from; _from = _to; _to = x; })),
          ]),
          Text(JourneyMessages.selectLocations, style: t.typeMeta),
        ])),
        status.when(data: (s) => PageNote('Historical dataset · ${s.routes} routes · ${s.stops} stops'
          '${s.validFrom != null ? ' · Coverage ${s.validFrom} → ${s.validTo ?? 'present'}' : ''}'
          '${s.notice.isNotEmpty ? '\n${s.notice}' : ''}'),
          loading: () => const SizedBox.shrink(), error: (e, _) => const SizedBox.shrink()),
        PageFooter(text: 'Nearby stops do not imply a safe crossing between platforms. Distances are straight-line unless stated.'),
      ]),
    );
  }
}
