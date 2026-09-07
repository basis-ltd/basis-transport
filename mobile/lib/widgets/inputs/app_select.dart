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
    final style = t.typeBodySm.copyWith(color: t.ink);
    return FieldShell(label: label, error: error, child: DropdownButtonFormField<T>(
      initialValue: value, items: items, onChanged: onChanged,
      style: style,
      // Without isExpanded the closed control sizes to the widest option and
      // overflows its column; the selected-item builder ellipsizes what is left.
      isExpanded: true,
      selectedItemBuilder: (context) => [
        for (final i in items) Align(alignment: AlignmentDirectional.centerStart,
          child: DefaultTextStyle(style: style, maxLines: 1, overflow: TextOverflow.ellipsis, softWrap: false, child: i.child)),
      ],
      decoration: InputDecoration(hintText: hint, filled: true, fillColor: t.paper,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl), borderSide: BorderSide(color: t.line)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl), borderSide: BorderSide(color: error != null ? t.danger : t.line))),
    ));
  }
}
