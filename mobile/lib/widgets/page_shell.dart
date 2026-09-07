import 'package:flutter/material.dart';
import '../theme/tokens.dart';

/// Port of components/layout/PageShell: PageShell/PageBody/PageHeader/
/// PageNote/PageSection/DetailList/PageFooter. PageBody owns the 28px gap;
/// blocks inside never set their own outer margins.
class PageShell extends StatelessWidget {
  final Widget child; final String? title;
  const PageShell({super.key, required this.child, this.title});
  @override Widget build(BuildContext context) {
    return Scaffold(appBar: title == null ? null : AppBar(title: Text(title!)), body: child);
  }
}

class PageBody extends StatelessWidget {
  final List<Widget> children;
  const PageBody({super.key, required this.children});
  @override Widget build(BuildContext context) {
    return SingleChildScrollView(padding: const EdgeInsets.all(20),
      child: Center(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 1180),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, spacing: 28, children: children))));
  }
}

class PageHeader extends StatelessWidget {
  final String? eyebrow; final String title; final String? description; final Widget? actions;
  const PageHeader({super.key, this.eyebrow, required this.title, this.description, this.actions});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      // Accent route rail from .app-page-stop: filled stop + line down the title.
      Column(children: [
        Container(width: 8, height: 8, margin: const EdgeInsets.only(top: 5), decoration: BoxDecoration(color: t.accentInk, shape: BoxShape.circle)),
        Container(width: 2, height: 44, decoration: BoxDecoration(color: t.accentLine, borderRadius: BorderRadius.circular(t.radiusPill))),
      ]),
      const SizedBox(width: 14),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        if (eyebrow case final e?) Text(e, style: t.typeEyebrow),
        Text(title, style: t.typePageTitle.copyWith(color: t.ink)),
        if (description case final d?) Padding(padding: const EdgeInsets.only(top: 6), child: Text(d, style: t.typeMeta)),
      ])),
      if (actions case final a?) a,
    ]);
  }
}

class PageNote extends StatelessWidget {
  final String text; const PageNote(this.text, {super.key});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Container(padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: t.surfaceSunken, border: Border.all(color: t.line), borderRadius: BorderRadius.circular(t.radiusControl)),
      child: Text(text, style: t.typeBodySm));
  }
}

class PageSection extends StatelessWidget {
  final String title; final Widget child;
  const PageSection({super.key, required this.title, required this.child});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 12, children: [
      Text(title, style: t.typeCardTitle), child,
    ]);
  }
}

class DetailList extends StatelessWidget {
  final int columns; final List<MapEntry<String, String>> items;
  const DetailList({super.key, this.columns = 3, required this.items});
  @override Widget build(BuildContext context) {
    return Wrap(spacing: 16, runSpacing: 12, children: [
      for (final e in items) SizedBox(width: 220, child: KeyValuePair(label: e.key, value: e.value)),
    ]);
  }
}

class PageFooter extends StatelessWidget {
  final String? text; const PageFooter({super.key, this.text});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Text(text ?? '', style: t.typeMeta);
  }
}

class KeyValuePair extends StatelessWidget {
  final String label; final String value;
  const KeyValuePair({super.key, required this.label, required this.value});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: t.typeLabel), Text(value, style: t.typeBodySm),
    ]);
  }
}
