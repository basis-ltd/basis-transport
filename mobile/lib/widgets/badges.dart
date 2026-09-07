import 'package:flutter/material.dart';
import '../theme/tokens.dart';

/// RouteBadge: Barlow Condensed, accent — the only Barlow in the app.
class RouteBadge extends StatelessWidget {
  final String number; const RouteBadge(this.number, {super.key});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: t.accentSurface, border: Border.all(color: t.accentLine), borderRadius: BorderRadius.circular(t.radiusPill)),
      child: Text(number, style: TextStyle(fontFamily: 'BarlowCondensed', fontSize: 16, fontWeight: FontWeight.w600, color: t.accentInk)));
  }
}

/// StatusBadge: pill; colour never travels alone (label always present).
class StatusBadge extends StatelessWidget {
  final String label; final String tone; // ok|warn|bad|info|neutral
  const StatusBadge({super.key, required this.label, this.tone = 'neutral'});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final (bg, fg, edge) = switch (tone) {
      'ok' => (t.accentSurface, t.accentInk, t.accentLine),
      'warn' => (t.warningSurface, t.warning, t.warningLine),
      'bad' => (t.dangerSurface, t.danger, t.dangerLine),
      'info' => (t.infoSurface, t.info, t.infoLine),
      _ => (t.surface, t.ink, t.line),
    };
    return Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, border: Border.all(color: edge), borderRadius: BorderRadius.circular(t.radiusPill)),
      child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: fg)));
  }
}

class StatCard extends StatelessWidget {
  final String label; final String value; final String? sub;
  const StatCard({super.key, required this.label, required this.value, this.sub});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: t.paper, border: Border.all(color: t.line), borderRadius: BorderRadius.circular(t.radiusCard)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 4, children: [
        Text(label, style: t.typeEyebrow),
        Text(value, style: t.typeMetric),
        if (sub != null) Text(sub!, style: t.typeMeta),
      ]));
  }
}

class Loader extends StatelessWidget {
  final String? label; const Loader({super.key, this.label});
  @override Widget build(BuildContext context) => Center(child: Column(mainAxisSize: MainAxisSize.min, spacing: 12, children: [
    const CircularProgressIndicator(),
    if (label != null) Text(label!, style: BasisTokens.of(context).typeMeta),
  ]));
}

class AppError extends StatelessWidget {
  final String message; final VoidCallback? onRetry;
  const AppError({super.key, required this.message, this.onRetry});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(mainAxisSize: MainAxisSize.min, spacing: 8, children: [
      Icon(Icons.error_outline, color: t.danger, semanticLabel: 'Error'),
      Text(message, style: t.typeBodySm, textAlign: TextAlign.center),
      if (onRetry != null) OutlinedButton(onPressed: onRetry, child: const Text('Try again')),
    ]);
  }
}
