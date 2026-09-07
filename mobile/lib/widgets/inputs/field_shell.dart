import 'package:flutter/material.dart';
import '../../theme/tokens.dart';

/// FieldShell: label + control + help/error stack at fixed rhythm.
/// Invalid = --danger edge + icon + message (colour never alone).
class FieldShell extends StatelessWidget {
  final String? label; final Widget child; final String? help; final String? error;
  const FieldShell({super.key, this.label, required this.child, this.help, this.error});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 6, children: [
      // Labels sit in narrow side-by-side columns: clip rather than overflow.
      if (label != null) Text(label!, style: t.typeLabel, maxLines: 1, overflow: TextOverflow.ellipsis, softWrap: false),
      child,
      if (error != null) Row(crossAxisAlignment: CrossAxisAlignment.start, spacing: 6, children: [
        Icon(Icons.error_outline, size: 16, color: t.danger, semanticLabel: 'Error'),
        Expanded(child: Text(error!, style: TextStyle(fontSize: 13, height: 1.4, color: t.danger))),
      ])
      else if (help != null) Text(help!, style: t.typeMeta),
    ]);
  }
}
