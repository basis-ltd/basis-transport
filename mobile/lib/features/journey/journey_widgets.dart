import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/journey.dart';
import '../../models/network.dart';
import '../../providers/providers.dart';
import '../../services/saved_store.dart';
import '../../services/share_links.dart';
import '../../theme/tokens.dart';
import '../../widgets/badges.dart';
import '../../widgets/cards.dart';
import '../../widgets/inputs/app_button.dart';
import '../../widgets/inputs/app_text_field.dart';
import 'messages.dart';

String fmtMeters(int m) => m >= 1000 ? '${(m / 1000).toStringAsFixed(1)} km' : '$m m';
String fmtSecs(int? s) {
  if (s == null) return 'Time unknown';
  final m = (s / 60).round(); if (m < 60) return '$m min';
  return '${m ~/ 60}h ${m % 60}m';
}

/// JourneyCard: compares changes, walking and ride distance.
class JourneyCard extends StatelessWidget {
  final Journey journey; final VoidCallback? onOpen;
  const JourneyCard({super.key, required this.journey, this.onOpen});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final routes = journey.legs.whereType<RideLeg>().map((e) => e.routeNumber).toList();
    return BasisCard(child: InkWell(onTap: onOpen, child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 8, children: [
      Row(spacing: 8, children: [
        for (final r in routes.take(3)) RouteBadge(r),
        const Spacer(),
        Text(fmtSecs(journey.durationSeconds), style: t.typeCardTitle),
      ]),
      Text('${journey.transfers} ${journey.transfers == 1 ? 'change' : 'changes'} · Walk ${fmtMeters(journey.walkingMeters)} · Ride ${fmtMeters(journey.ridingMeters)}', style: t.typeMeta),
      if (journey.fareRwf != null) Text('${journey.fareRwf!.toStringAsFixed(0)} RWF', style: t.typeBodySm),
    ])));
  }
}

/// FollowJourney: boarding/intermediate/transfer/alighting on a step spine
/// with accent connectors. Usable with the map collapsed.
class FollowJourney extends StatelessWidget {
  final Journey journey; const FollowJourney({super.key, required this.journey});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final steps = journey.steps ?? [];
    final items = steps.isNotEmpty ? steps.map((s) => _StepRow(text: s.text, meta: _meta(s))).toList()
      : _legsAsSteps(journey);
    return Column(spacing: 0, children: [
      for (var i = 0; i < items.length; i++) Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Column(children: [
          Container(width: 12, height: 12, decoration: BoxDecoration(color: t.accentInk, shape: BoxShape.circle)),
          if (i != items.length - 1) Container(width: 2, height: 36, color: t.accentLine),
        ]),
        const SizedBox(width: 12),
        Expanded(child: Padding(padding: const EdgeInsets.only(bottom: 12), child: items[i])),
      ]),
    ]);
  }
  static String _meta(PassengerStep s) => [
    if ((s.timing['label']) != null) '${s.timing['label']}',
    if (s.fareAmount != null) '${s.fareAmount!.toStringAsFixed(0)} RWF',
  ].join(' · ');
  static List<Widget> _legsAsSteps(Journey j) => [
    for (final l in j.legs) l is WalkLeg
      ? _StepRow(text: 'Walk ${fmtMeters(l.distanceMeters)}: ${l.instructions.join(' ')}', meta: fmtMeters(l.distanceMeters))
      : _StepRow(text: 'Board ${(l as RideLeg).routeNumber} at ${l.board.name}, alight at ${l.alight.name}', meta: '${(l as RideLeg).stops.length} stops'),
  ];
}

class _StepRow extends StatelessWidget {
  final String text; final String meta;
  const _StepRow({required this.text, required this.meta});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(text, style: t.typeBodySm), Text(meta, style: t.typeMeta),
    ]);
  }
}

/// LocationSearch: stops first, route numbers disambiguate same names.
class LocationSearch extends ConsumerWidget {
  final String label; final JourneyLocation? value; final ValueChanged<JourneyLocation?> onChanged;
  const LocationSearch({super.key, required this.label, required this.value, required this.onChanged});
  @override Widget build(BuildContext context, WidgetRef ref) {
    final ctrl = TextEditingController(text: value?.name ?? '');
    return AppTextField(label: label, hint: 'Search stops or places', controller: ctrl,
      onChanged: (q) async {
        if (q.length < 2) return;
        try {
          final page = await ref.read(apiClientProvider).stops(q: q, size: 6);
          if (!context.mounted) return;
          final stops = page.rows;
          showDialog(context: context, builder: (_) => SimpleDialog(title: Text(label), children: [
            for (final s in stops) SimpleDialogOption(
              onPressed: () { Navigator.pop(context); onChanged(JourneyLocation(stopId: s.id, latitude: s.coordinates[1], longitude: s.coordinates[0], name: StopIdentity.label(s.name, s.routeNumbers))); },
              child: Text(StopIdentity.label(s.name, s.routeNumbers))),
            SimpleDialogOption(onPressed: () { Navigator.pop(context); onChanged(JourneyLocation(latitude: -1.9441, longitude: 30.0619, name: q)); }, child: Text('Use “$q” as a place')),
          ]));
        } catch (_) {}
      });
  }
}

class StopIdentity {
  static String label(String name, List<String>? routeNumbers) =>
    (routeNumbers == null || routeNumbers.isEmpty) ? name : '$name (${routeNumbers.take(3).join(', ')})';
}

class WalkingDirections extends StatelessWidget {
  final WalkLeg leg; const WalkingDirections({super.key, required this.leg});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 4, children: [
      Text('Walk ${fmtMeters(leg.distanceMeters)}', style: t.typeCardTitle),
      for (final i in leg.instructions) Text('• $i', style: t.typeBodySm),
    ]);
  }
}

class SaveButton extends ConsumerWidget {
  final String href; final String label; final String kind;
  const SaveButton({super.key, required this.href, required this.label, required this.kind});
  @override Widget build(BuildContext context, WidgetRef ref) {
    final saved = ref.watch(savedDeviceProvider);
    return saved.when(
      data: (items) {
        final isSaved = items.any((i) => i.href == href);
        return AppButton(label: isSaved ? 'Saved' : 'Save', variant: AppButtonVariant.outline, size: AppControlSize.sm,
          icon: isSaved ? Icons.bookmark : Icons.bookmark_border,
          onPressed: () async {
            if (isSaved) { await SavedStore.remove(SavedStore.savedKey(href)); }
            else { await SavedStore.save(SavedItem(key: SavedStore.savedKey(href), label: label, href: href, kind: kind)); }
            ref.invalidate(savedDeviceProvider);
          });
      },
      loading: () => const AppButton(label: 'Save', variant: AppButtonVariant.outline, size: AppControlSize.sm),
      error: (e, _) => const AppButton(label: 'Save', variant: AppButtonVariant.outline, size: AppControlSize.sm));
  }
}

class ReportIssue extends StatefulWidget {
  final String? referenceId; const ReportIssue({super.key, this.referenceId});
  @override State<ReportIssue> createState() => _ReportIssueState();
}
class _ReportIssueState extends State<ReportIssue> {
  final _msg = TextEditingController(); String? _err; bool _sent = false; bool _busy = false;
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    if (_sent) return Text('Thanks — your report was received.', style: t.typeBodySm);
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, spacing: 8, children: [
      AppTextField(label: 'Report an issue', hint: 'What is wrong?', controller: _msg, error: _err),
      AppButton(label: 'Send report', size: AppControlSize.sm, loading: _busy, onPressed: () async {
        if (_msg.text.trim().isEmpty) { setState(() => _err = 'Describe the issue.'); return; }
        setState(() { _busy = true; _err = null; });
        try { await ProviderScope.containerOf(context).read(apiClientProvider).postReport({'kind': 'journey', 'referenceId': widget.referenceId, 'message': _msg.text.trim()}); setState(() => _sent = true); }
        catch (e) { setState(() => _err = '$e'); }
        finally { if (mounted) setState(() => _busy = false); }
      }),
    ]);
  }
}

class ShareJourneyButton extends StatelessWidget {
  final JourneyLocation? origin; final JourneyLocation? destination;
  const ShareJourneyButton({super.key, this.origin, this.destination});
  @override Widget build(BuildContext context) {
    return AppButton(label: 'Share', variant: AppButtonVariant.outline, size: AppControlSize.sm, icon: Icons.share, onPressed: () {
      final url = buildTravelUrl(origin: origin, destination: destination);
      showDialog(context: context, builder: (_) => AlertDialog(
        title: const Text('Share this journey'),
        content: Text('This link carries your precise selected coordinates.\n\n$url'),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Done'))]));
    });
  }
}

class PlanFailure extends StatelessWidget {
  final String status; const PlanFailure({super.key, required this.status});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final m = JourneyMessages.forStatus(status);
    return BasisCard(child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 6, children: [
      Text(m[0], style: t.typeCardTitle), Text(m[1], style: t.typeBodySm),
      if (status == 'no_connection') Text('Nearby stops do not imply a safe crossing between platforms. Try another stop or increase endpoint walking up to 2 km.', style: t.typeMeta),
      if (status == 'outside_coverage') Text('Nearby stops do not imply a safe crossing between platforms.', style: t.typeMeta),
    ]));
  }
}
