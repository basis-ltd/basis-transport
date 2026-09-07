import 'package:flutter/material.dart';
import '../../theme/tokens.dart';
import 'field_shell.dart';

/// AppSelect mirrors the web Select on the same control contract.
class AppSelect<T> extends StatelessWidget {
  final String? label; final T? value; final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?>? onChanged; final String? error; final String? hint;
  const AppSelect({super.key, this.label, this.value, required this.items, this.onChanged, this.error, this.hint});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return FieldShell(label: label, error: error, child: DropdownButtonFormField<T>(
      initialValue: value, items: items, onChanged: onChanged,
      style: t.typeBodySm.copyWith(color: t.ink),
      decoration: InputDecoration(hintText: hint, filled: true, fillColor: t.paper,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl), borderSide: BorderSide(color: t.line)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl), borderSide: BorderSide(color: error != null ? t.danger : t.line))),
    ));
  }
}
