import 'package:flutter/material.dart';
import '../theme/tokens.dart';
import 'inputs/app_button.dart';

/// ConfirmDialog + Modal: the only surfaces that cast shadows (--shadow-modal).
class ConfirmDialog extends StatelessWidget {
  final String title; final String body; final String confirmLabel; final VoidCallback onConfirm;
  const ConfirmDialog({super.key, required this.title, required this.body, required this.confirmLabel, required this.onConfirm});
  static Future<bool?> show(BuildContext c, {required String title, required String body, required String confirmLabel}) =>
    showDialog<bool>(context: c, builder: (_) => ConfirmDialog(title: title, body: body, confirmLabel: confirmLabel, onConfirm: () => Navigator.pop(c, true)));
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return AlertDialog(title: Text(title, style: t.typeCardTitle), content: Text(body, style: t.typeBodySm),
      actions: [AppButton(label: 'Cancel', variant: AppButtonVariant.outline, size: AppControlSize.sm, onPressed: () => Navigator.pop(context, false)),
        AppButton(label: confirmLabel, size: AppControlSize.sm, onPressed: onConfirm)]);
  }
}

class AppModal extends StatelessWidget {
  final String title; final Widget child;
  const AppModal({super.key, required this.title, required this.child});
  static Future<T?> open<T>(BuildContext c, String title, Widget child) =>
    showDialog<T>(context: c, builder: (_) => AppModal(title: title, child: child));
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Dialog(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 520),
      child: Padding(padding: const EdgeInsets.all(20), child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, spacing: 12, children: [
        Row(children: [Expanded(child: Text(title, style: t.typeCardTitle)),
          IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context), tooltip: 'Close')]),
        child,
      ]))));
  }
}
