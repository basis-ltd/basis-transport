import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/providers.dart';
import '../../theme/tokens.dart';
import '../../widgets/badges.dart';
import '../../widgets/cards.dart';
import '../../widgets/charts/charts.dart';
import '../../widgets/page_shell.dart';

/// DashboardPage + commuter/driver/operations dashboards from
/// components/dashboard, driven by /insights/*, gated by role as the web app.
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) {
    final roles = ref.watch(sessionProvider).user?.roles ?? [];
    final scope = roles.contains('DRIVER') ? 'driver' : roles.contains('ADMIN') || roles.contains('SUPER_ADMIN') ? 'overview' : 'commuter';
    final data = ref.watch(insightsProvider(scope));
    return Scaffold(body: PageBody(children: [
      PageHeader(eyebrow: 'Dashboard', title: '${scope[0].toUpperCase()}${scope.substring(1)} dashboard'),
      data.when(
        data: (m) {
          final series = ((m['series'] ?? m['rows'] ?? []) as List)
            .map((e) => (((e is Map) ? (e['value'] ?? e['count'] ?? 0) : 0) as num).toDouble()).toList();
          final names = ((m['series'] ?? m['rows'] ?? []) as List)
            .map((e) => ((e is Map) ? ('${e['label'] ?? e['name'] ?? ''}') : '')).toList();
          final stats = (m['stats'] ?? m['summary'] ?? {}) as Map;
          return Column(spacing: 16, children: [
            Wrap(spacing: 12, runSpacing: 12, children: [
              for (final e in stats.entries) StatCard(label: '${e.key}', value: '${e.value}'),
              if (stats.isEmpty) ...[
                StatCard(label: 'Journeys', value: '${series.length}'),
                StatCard(label: 'Total', value: series.fold(0.0, (a, b) => a + b).toStringAsFixed(0)),
              ],
            ]),
            if (series.isNotEmpty) BasisCard(child: SeriesChart(series: [series], names: names.isEmpty ? ['Trips'] : names)),
            if (series.isNotEmpty) BasisCard(child: DonutChart(values: series.take(5).toList(), labels: names.take(5).toList())),
            if (series.isNotEmpty) BasisCard(child: Sparkline(values: series)),
          ]);
        },
        loading: () => const Loader(label: 'Loading dashboard…'),
        error: (e, _) => AppError(message: '$e', onRetry: () => ref.invalidate(insightsProvider))),
    ]));
  }
}
