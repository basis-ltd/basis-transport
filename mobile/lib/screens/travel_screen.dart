import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/journey/geolocation.dart';
import '../features/journey/journey_map.dart';
import '../features/journey/journey_widgets.dart';
import '../features/journey/messages.dart';
import '../models/journey.dart';
import '../providers/providers.dart';
import '../theme/tokens.dart';
import '../widgets/badges.dart';
import '../widgets/cards.dart';
import '../widgets/inputs/app_button.dart';
import '../widgets/inputs/app_select.dart';
import '../widgets/page_shell.dart';

/// TravelGuidancePage → planner: From/To pickers (stops first, route numbers
/// disambiguate), use-my-location on tap, Find a journey, JourneyCard
/// results, FollowJourney spine, collapsed-map usable text, share, empty/
//// failure states, historical-dataset notice + coverage dates.
class TravelScreen extends ConsumerStatefulWidget {
  final String? initialOrigin; final String? initialDestination;
  const TravelScreen({super.key, this.initialOrigin, this.initialDestination});
  @override ConsumerState<TravelScreen> createState() => _TravelScreenState();
}
class _TravelScreenState extends ConsumerState<TravelScreen> {
  JourneyLocation? _from; JourneyLocation? _to;
  int _maxTransfers = 2; int _maxWalk = 800; String _pref = 'fewest_transfers';
  PlanArgs? _plan; int _open = -1; bool _mapCollapsed = false;
  @override void initState() {
    super.initState();
    if (widget.initialOrigin != null) _from = JourneyLocation(latitude: -1.9441, longitude: 30.0619, name: widget.initialOrigin!);
    if (widget.initialDestination != null) _to = JourneyLocation(latitude: -1.9550, longitude: 30.0619, name: widget.initialDestination!);
    if (_from != null && _to != null) _plan = PlanArgs(origin: _from!, destination: _to!);
  }
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final planAsync = _plan == null ? null : ref.watch(journeyPlanProvider(_plan!));
    final statusAsync = ref.watch(networkStatusProvider);
    return Scaffold(body: PageBody(children: [
      PageHeader(eyebrow: 'Journeys', title: 'Plan a journey', description: 'From / To with stop and place suggestions.',
        actions: AppButton(label: _mapCollapsed ? 'Show map' : 'Hide map', variant: AppButtonVariant.outline, size: AppControlSize.sm, onPressed: () => setState(() => _mapCollapsed = !_mapCollapsed))),
      BasisCard(child: Column(spacing: 12, children: [
        LocationSearch(label: JourneyMessages.from, value: _from, onChanged: (v) => setState(() => _from = v)),
        LocationSearch(label: JourneyMessages.to, value: _to, onChanged: (v) => setState(() => _to = v)),
        Row(spacing: 8, children: [
          Expanded(child: AppButton(label: 'Use my location', variant: AppButtonVariant.outline, size: AppControlSize.md, icon: Icons.my_location,
            onPressed: () async { final loc = await requestPickupLocation(context); if (loc != null) setState(() => _from ??= loc); })),
          Expanded(child: AppButton(label: JourneyMessages.swap, variant: AppButtonVariant.outline, size: AppControlSize.md, onPressed: () => setState(() { final x = _from; _from = _to; _to = x; }))),
        ]),
        Row(spacing: 8, children: [
          Expanded(child: AppSelect<int>(label: 'Max transfers', value: _maxTransfers,
            items: [for (var i = 0; i <= 4; i++) DropdownMenuItem(value: i, child: Text('$i'))],
            onChanged: (v) => setState(() => _maxTransfers = v ?? 2))),
          Expanded(child: AppSelect<int>(label: 'Max walk (m)', value: _maxWalk,
            items: [for (final m in [100, 400, 800, 1200, 2000]) DropdownMenuItem(value: m, child: Text('$m m'))],
            onChanged: (v) => setState(() => _maxWalk = v ?? 800))),
          Expanded(child: AppSelect<String>(label: 'Preference', value: _pref,
            items: const [DropdownMenuItem(value: 'fewest_transfers', child: Text('Fewest transfers')), DropdownMenuItem(value: 'least_walking', child: Text('Least walking'))],
            onChanged: (v) => setState(() => _pref = v ?? 'fewest_transfers'))),
        ]),
        Text(JourneyMessages.locationConsent, style: t.typeMeta),
        AppButton(label: JourneyMessages.find, size: AppControlSize.lg, onPressed: (_from == null || _to == null) ? null : () {
          if (_from!.name == _to!.name) { setState(() => _plan = null); return; }
          setState(() { _open = -1; _plan = PlanArgs(origin: _from!, destination: _to!, maxTransfers: _maxTransfers, maxWalkMeters: _maxWalk, preference: _pref); });
        }),
        Row(spacing: 8, children: [ShareJourneyButton(origin: _from, destination: _to),
          if (_from != null && _to != null) SaveButton(href: '/travel?o=${Uri.encodeComponent(_from!.name)}&d=${Uri.encodeComponent(_to!.name)}', label: '${_from!.name} → ${_to!.name}', kind: 'journey'),
        ]),
      ])),
      if (_from != null && _to != null && _from!.name == _to!.name) const PlanFailure(status: 'already_at_destination'),
      if (planAsync != null) planAsync.when(
        data: (plan) {
          if (plan.status != 'ok' && plan.status != 'walking_only') return PlanFailure(status: plan.status);
          if (plan.journeys.isEmpty) return const PlanFailure(status: 'no_connection');
          final j = (_open >= 0 && _open < plan.journeys.length) ? plan.journeys[_open] : null;
          return Column(spacing: 16, children: [
            Text(JourneyMessages.connections(plan.journeys.length), style: t.typeCardTitle),
            JourneyMapView(journey: j ?? plan.journeys.first, collapsed: _mapCollapsed),
            for (var i = 0; i < plan.journeys.length; i++) Column(spacing: 8, children: [
              JourneyCard(journey: plan.journeys[i], onOpen: () => setState(() => _open = _open == i ? -1 : i)),
              if (_open == i) BasisCard(nested: true, child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 12, children: [
                FollowJourney(journey: plan.journeys[i]),
                for (final l in plan.journeys[i].legs) if (l is WalkLeg) WalkingDirections(leg: l),
                ReportIssue(referenceId: plan.journeys[i].id),
              ])),
            ]),
            if (plan.warnings.isNotEmpty) PageNote(plan.warnings.join('\n')),
            statusAsync.maybeWhen(data: (s) => PageNote('Historical dataset · Coverage ${s.validFrom ?? '—'} → ${s.validTo ?? 'present'}${s.notice.isNotEmpty ? ' · ${s.notice}' : ''}'), orElse: () => const SizedBox.shrink()),
          ]);
        },
        loading: () => const Loader(label: JourneyMessages.finding),
        error: (e, _) => AppError(message: '$e', onRetry: () => ref.invalidate(journeyPlanProvider(_plan!)))),
      if (_plan == null && !(_from != null && _to != null && _from!.name == _to!.name))
        InkWell(onTap: () => context.go('/stops'), child: Text('No connection yet — try a nearby stop or allow up to 2 km of walking.', style: t.typeMeta)),
    ]));
  }
}
