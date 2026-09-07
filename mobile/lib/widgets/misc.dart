import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/tokens.dart';

class Combobox<T extends Object> extends StatelessWidget {
  final String? hint; final List<T> options; final String Function(T) label;
  final ValueChanged<T?>? onChanged; final T? value;
  const Combobox({super.key, this.hint, required this.options, required this.label, this.onChanged, this.value});
  @override Widget build(BuildContext context) => Autocomplete<T>(
    displayStringForOption: label,
    optionsBuilder: (v) => options.where((o) => label(o).toLowerCase().contains(v.text.toLowerCase())),
    onSelected: onChanged,
    fieldViewBuilder: (c, ctrl, focus, submit) => TextField(controller: ctrl, focusNode: focus,
      decoration: InputDecoration(hintText: hint, border: const OutlineInputBorder())),
    optionsViewBuilder: (c, submit, opts) => Align(alignment: Alignment.topLeft,
      child: Material(elevation: 4, child: SizedBox(width: 320, child: ListView(children: [
        for (final o in opts) ListTile(title: Text(label(o)), onTap: () => submit(o))])))),
  );
}

class AppDateField extends StatelessWidget {
  final String? label; final DateTime? value; final ValueChanged<DateTime?>? onChanged;
  const AppDateField({super.key, this.label, this.value, this.onChanged});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 6, children: [
      if (label != null) Text(label!, style: t.typeLabel),
      OutlinedButton.icon(icon: const Icon(Icons.calendar_today, size: 16), label: Text(value == null ? 'Select date' : DateFormat.yMMMd().format(value!)),
        onPressed: () async { final d = await showDatePicker(context: context, firstDate: DateTime(2000), lastDate: DateTime(2100), initialDate: value ?? DateTime.now()); onChanged?.call(d); }),
    ]);
  }
}

/// TelInput with intl-aware basic validation (libphonenumber-equivalent:
/// E.164-ish digit check; full libphonenumber has no Flutter equivalent here).
class TelInput extends StatelessWidget {
  final TextEditingController? controller; final String? error; final ValueChanged<String>? onChanged;
  const TelInput({super.key, this.controller, this.error, this.onChanged});
  static String? validate(String? v) {
    if (v == null || v.trim().isEmpty) return 'Enter a phone number.';
    final digits = v.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 9 || digits.length > 15) return 'Enter a valid phone number with country code.';
    return null;
  }
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return TextField(controller: controller, keyboardType: TextInputType.phone, onChanged: onChanged,
      decoration: InputDecoration(labelText: 'Phone', hintText: '+250 …', errorText: error,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(t.radiusControl))));
  }
}

class AppToggle extends StatelessWidget {
  final bool value; final ValueChanged<bool>? onChanged; final String? label;
  const AppToggle({super.key, required this.value, this.onChanged, this.label});
  @override Widget build(BuildContext context) => Row(spacing: 8, children: [
    Switch(value: value, onChanged: onChanged), if (label != null) Text(label!),
  ]);
}

class AppBackButton extends StatelessWidget {
  const AppBackButton({super.key});
  @override Widget build(BuildContext context) => const BackButton();
}

class PaginatedTable extends StatelessWidget {
  final List<String> columns; final List<List<String>> rows;
  final int page; final int totalPages; final ValueChanged<int> onPage;
  const PaginatedTable({super.key, required this.columns, required this.rows, required this.page, required this.totalPages, required this.onPage});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(spacing: 8, children: [
      SingleChildScrollView(scrollDirection: Axis.horizontal, child: DataTable(
        columns: [for (final c in columns) DataColumn(label: Text(c, style: t.typeLabel))],
        rows: [for (final r in rows) DataRow(cells: [for (final cell in r) DataCell(Text(cell, style: t.typeBodySm))])],
      )),
      Row(mainAxisAlignment: MainAxisAlignment.end, spacing: 8, children: [
        Text('Page ${page + 1} of $totalPages', style: t.typeMeta),
        IconButton(icon: const Icon(Icons.chevron_left), onPressed: page > 0 ? () => onPage(page - 1) : null, tooltip: 'Previous page'),
        IconButton(icon: const Icon(Icons.chevron_right), onPressed: page < totalPages - 1 ? () => onPage(page + 1) : null, tooltip: 'Next page'),
      ]),
    ]);
  }
}
