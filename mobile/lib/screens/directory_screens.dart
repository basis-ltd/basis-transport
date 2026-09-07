import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import '../features/journey/journey_widgets.dart';
import '../providers/providers.dart';
import '../theme/tokens.dart';
import '../widgets/badges.dart';
import '../widgets/cards.dart';
import '../widgets/inputs/app_button.dart';
import '../widgets/inputs/app_text_field.dart';
import '../widgets/page_shell.dart';

/// /routes + /stops directories and detail screens (NetworkDirectoryPage,
/// NetworkDetailsPage, NetworkExplorer): source-qualified lines, directional
/// variants, serving routes, single-location-request nearby. Distances labelled
/// straight-line.
class DirectoryScreen extends ConsumerStatefulWidget {
  final String kind; // routes|stops
  const DirectoryScreen({super.key, required this.kind});
  @override ConsumerState<DirectoryScreen> createState() => _DirectoryScreenState();
}
class _DirectoryScreenState extends ConsumerState<DirectoryScreen> {
  String _q = ''; int _page = 0;
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final isRoutes = widget.kind == 'routes';
    final prov = isRoutes ? ref.watch(routesPageProvider((page: _page + 1, q: _q))) : ref.watch(stopsPageProvider((page: _page + 1, q: _q)));
    return Scaffold(body: PageBody(children: [
      PageHeader(eyebrow: 'Network', title: isRoutes ? 'Routes' : 'Stops',
        description: isRoutes ? 'Source-qualified lines with directional variants.' : 'Serving routes per stop. Distances are straight-line.',
        actions: !isRoutes ? AppButton(label: 'Find nearby stops', variant: AppButtonVariant.outline, size: AppControlSize.sm, icon: Icons.my_location,
          onPressed: () async {
            var p = await Geolocator.checkPermission();
            if (p == LocationPermission.denied) p = await Geolocator.requestPermission();
            if (p == LocationPermission.denied || p == LocationPermission.deniedForever) return;
            final pos = await Geolocator.getCurrentPosition(); // single location request
            if (!context.mounted) return;
            context.go('/stops?lat=${pos.latitude}&lng=${pos.longitude}');
          }) : null),
      AppTextField(hint: 'Search ${widget.kind}…', onChanged: (v) => setState(() { _q = v; _page = 0; })),
      prov.when(
        data: (pg) => Column(spacing: 12, children: [
          for (final r in (pg.rows as List))
            BasisCard(child: InkWell(
              onTap: () => context.go(isRoutes ? '/routes/${(r as dynamic).id}' : '/stops/${(r as dynamic).id}'),
              child: isRoutes ? Row(spacing: 12, children: [
                  RouteBadge((r as dynamic).shortName as String),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text((r as dynamic).longName as String, style: t.typeCardTitle),
                    Text('${(r as dynamic).agency} · ${(r as dynamic).patterns} patterns', style: t.typeMeta),
                  ])),
                ]) : Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 6, children: [
                  Text((r as dynamic).name as String, style: t.typeCardTitle),
                  Text(StopIdentity.label('', (r as dynamic).routeNumbers), style: t.typeMeta),
                  if ((r as dynamic).distanceMeters != null) Text('Straight-line distance: ${fmtMeters((r as dynamic).distanceMeters as int)}', style: t.typeMeta),
                ]))),
          Row(mainAxisAlignment: MainAxisAlignment.end, spacing: 8, children: [
            Text('Page ${_page + 1} of ${pg.totalPages}', style: t.typeMeta),
            IconButton(icon: const Icon(Icons.chevron_left), onPressed: _page > 0 ? () => setState(() => _page--) : null, tooltip: 'Previous page'),
            IconButton(icon: const Icon(Icons.chevron_right), onPressed: _page < pg.totalPages - 1 ? () => setState(() => _page++) : null, tooltip: 'Next page'),
          ]),
        ]),
        loading: () => const Loader(label: 'Loading…'),
        error: (e, _) => AppError(message: '$e', onRetry: () => ref.invalidate(isRoutes ? routesPageProvider : stopsPageProvider))),
    ]));
  }
}

class DetailsScreen extends ConsumerWidget {
  final String kind; final String id;
  const DetailsScreen({super.key, required this.kind, required this.id});
  @override Widget build(BuildContext context, WidgetRef ref) {
    final t = BasisTokens.of(context);
    if (kind == 'routes') {
      final d = ref.watch(routeDetailProvider(id));
      return Scaffold(body: PageBody(children: [PageHeader(eyebrow: 'Route', title: 'Route details'),
        d.when(data: (r) => Column(spacing: 16, children: [
          Row(spacing: 8, children: [RouteBadge(r.shortName), Expanded(child: Text(r.longName, style: t.typeCardTitle))]),
          Text('${r.agency} · Source: ${r.network.source} · Verification: ${r.network.verification}', style: t.typeMeta),
          for (final p in r.patterns) BasisCard(nested: true, child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 4, children: [
            Text('${p['headsign'] ?? ''} · ${p['direction'] ?? ''}', style: t.typeBodySm),
            Text('${((p['stops'] ?? []) as List).length} stops · Geometry: ${p['geometryQuality'] ?? 'schematic'}', style: t.typeMeta),
          ])),
          SaveButton(href: '/routes/$id', label: r.longName, kind: 'route'),
        ]), loading: () => const Loader(), error: (e, _) => AppError(message: '$e'))]));
    }
    final d = ref.watch(stopDetailProvider(id));
    return Scaffold(body: PageBody(children: [PageHeader(eyebrow: 'Stop', title: 'Stop details'),
      d.when(data: (s) => Column(spacing: 16, children: [
        Text(s.stop.name, style: t.typeCardTitle),
        Text('Code ${s.stop.code} · Source: ${s.network.source} · Verification: ${s.network.verification}', style: t.typeMeta),
        if (s.boardingPoints.isNotEmpty) PageSection(title: 'Boarding points', child: Column(spacing: 4, children: [
          for (final b in s.boardingPoints) Text('${b['name']} (${b['code']})', style: t.typeBodySm)])),
        PageSection(title: 'Serving routes', child: Wrap(spacing: 8, runSpacing: 8, children: [
          for (final r in s.routes) InkWell(onTap: () => context.go('/routes/${r.id}'), child: RouteBadge(r.shortName))])),
        SaveButton(href: '/stops/$id', label: s.stop.name, kind: 'stop'),
      ]), loading: () => const Loader(), error: (e, _) => AppError(message: '$e'))]));
  }
}
