import 'package:flutter/material.dart';
import '../../theme/tokens.dart';
import 'field_shell.dart';

/// AppTextField mirrors the web Input: token edge, 1px inset --ink focus
/// ring, --danger invalid edge + icon + message. Never styled inline.
class AppTextField extends StatelessWidget {
  final String? label; final String? hint; final TextEditingController? controller;
  final String? error; final String? help; final bool obscure; final TextInputType? keyboard;
  final ValueChanged<String>? onChanged; final int minHeight;
  const AppTextField({super.key, this.label, this.hint, this.controller, this.error, this.help, this.obscure = false, this.keyboard, this.onChanged, this.minHeight = 40});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return FieldShell(label: label, help: help, error: error, child: ConstrainedBox(
      constraints: BoxConstraints(minHeight: minHeight.toDouble()),
      child: TextField(controller: controller, obscureText: obscure, keyboardType: keyboard, onChanged: onChanged,
        style: t.typeBodySm.copyWith(color: t.ink),
        decoration: InputDecoration(hintText: hint,
          errorText: null,
          filled: true, fillColor: t.paper,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl), borderSide: BorderSide(color: error != null ? t.danger : t.line)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl), borderSide: BorderSide(color: error != null ? t.danger : t.line)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl),
            borderSide: BorderSide(color: error != null ? t.danger : t.ink)),
        ))));
  }
}
