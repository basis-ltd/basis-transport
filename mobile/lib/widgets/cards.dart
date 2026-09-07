import 'package:flutter/material.dart';
import '../theme/tokens.dart';

/// Cards do not float: 12px radius, 1px --line border on --paper, no shadow.
/// Nested cards drop to --surface-sunken. Only menus/dialogs cast shadows.
class BasisCard extends StatelessWidget {
  final Widget child; final EdgeInsetsGeometry padding; final bool nested;
  const BasisCard({super.key, required this.child, this.padding = const EdgeInsets.all(20), this.nested = false});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Container(padding: padding,
      decoration: BoxDecoration(color: nested ? t.surfaceSunken : t.paper,
        border: Border.all(color: t.line), borderRadius: BorderRadius.circular(t.radiusCard)),
      child: child);
  }
}

class QuietCard extends StatelessWidget {
  final Widget child;
  const QuietCard({super.key, required this.child});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Container(padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: t.surface, borderRadius: BorderRadius.circular(t.radiusControl)), child: child);
  }
}

/// Entrance: one fade + 8px rise over 200ms with --ease-glide. Honours disableAnimations.
class FadeRise extends StatelessWidget {
  final Widget child; const FadeRise({super.key, required this.child});
  @override Widget build(BuildContext context) {
    if (MediaQuery.disableAnimationsOf(context)) return child;
    return TweenAnimationBuilder<double>(tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: BasisTokens.of(context).animationMs),
      curve: BasisTokens.easeGlide,
      builder: (c, v, ch) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 8 * (1 - v)), child: ch)), child: child);
  }
}
