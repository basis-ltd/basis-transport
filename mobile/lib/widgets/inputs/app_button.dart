import 'package:flutter/material.dart';
import '../../theme/tokens.dart';

/// Control contract from control.ts: heights 36/40/44 (40 default, 44 in
/// journey flow). Primary = --ink on --paper; outline = bordered secondary.
enum AppButtonVariant { primary, outline, breadcrumb }
enum AppControlSize { sm, md, lg }
class AppButton extends StatelessWidget {
  final String label; final VoidCallback? onPressed; final AppButtonVariant variant;
  final AppControlSize size; final bool loading; final IconData? icon;
  const AppButton({super.key, required this.label, this.onPressed, this.variant = AppButtonVariant.primary, this.size = AppControlSize.md, this.loading = false, this.icon});
  double _h(BasisTokens t) => size == AppControlSize.sm ? t.controlSm : size == AppControlSize.lg ? t.controlLg : t.controlMd;
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final h = _h(t);
    // A button placed in an Expanded/Wrap slot is width-constrained: the label
    // must ellipsize rather than overflow the control edge. A button laid out
    // with unbounded width (a plain Row slot) sizes to its content instead —
    // Flexible would assert there, so the label is measured unconstrained.
    final child = loading ? SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: variant == AppButtonVariant.primary ? t.paper : t.ink))
      : LayoutBuilder(builder: (context, c) {
        const style = TextStyle(fontSize: 14, fontWeight: FontWeight.w500);
        final text = Text(label, style: style, maxLines: 1, overflow: TextOverflow.ellipsis, softWrap: false, textAlign: TextAlign.center);
        return Row(mainAxisSize: MainAxisSize.min, spacing: 8, children: [
          if (icon != null) Icon(icon, size: 18),
          if (c.maxWidth.isFinite) Flexible(child: text) else text,
        ]);
      });
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(t.radiusControl));
    // Material's default 24px horizontal padding wastes room the label needs on
    // narrow screens; 14px keeps the control contract's tap target intact.
    const padding = EdgeInsets.symmetric(horizontal: 14);
    return SizedBox(height: h, child: switch (variant) {
      AppButtonVariant.primary => ElevatedButton(onPressed: loading ? null : onPressed, style: ElevatedButton.styleFrom(backgroundColor: t.ink, foregroundColor: t.paper, shape: shape, padding: padding), child: child),
      AppButtonVariant.outline => OutlinedButton(onPressed: loading ? null : onPressed, style: OutlinedButton.styleFrom(foregroundColor: t.ink, side: BorderSide(color: t.line), shape: shape, padding: padding), child: child),
      AppButtonVariant.breadcrumb => FilledButton.tonal(onPressed: loading ? null : onPressed, style: FilledButton.styleFrom(backgroundColor: t.surface, foregroundColor: t.ink, shape: shape, padding: padding), child: child),
    });
  }
}
