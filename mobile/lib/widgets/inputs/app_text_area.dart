import 'package:flutter/material.dart';
import 'app_text_field.dart';

/// TextArea: same control with height released (min 96).
class AppTextArea extends StatelessWidget {
  final String? label; final String? hint; final TextEditingController? controller;
  final String? error; final ValueChanged<String>? onChanged;
  const AppTextArea({super.key, this.label, this.hint, this.controller, this.error, this.onChanged});
  @override Widget build(BuildContext context) => AppTextField(label: label, hint: hint, controller: controller, error: error, onChanged: onChanged, keyboard: TextInputType.multiline, minHeight: 96);
}
