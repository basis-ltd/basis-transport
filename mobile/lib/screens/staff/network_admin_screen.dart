import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/providers.dart';
import '../../theme/tokens.dart';
import '../../widgets/badges.dart';
import '../../widgets/cards.dart';
import '../../widgets/dialogs.dart';
import '../../widgets/inputs/app_button.dart';
import '../../widgets/inputs/app_text_area.dart';
import '../../widgets/misc.dart';
import '../../widgets/page_shell.dart';

/// NetworkAdminPage + NetworkDraftReview + TransferReviewEditor: datasets,
/// import issues, draft edits, verification/rights evidence, publish/restore,
/// transfer review, passenger report review. ADMIN/SUPER_ADMIN only.
class NetworkAdminScreen extends ConsumerStatefulWidget {
  const NetworkAdminScreen({super.key});
  @override ConsumerState<NetworkAdminScreen> createState() => _NetworkAdminScreenState();
}
class _NetworkAdminScreenState extends ConsumerState<NetworkAdminScreen> {
  final _evidence = TextEditingController();
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Scaffold(body: PageBody(children: [
      const PageHeader(eyebrow: 'Administration', title: 'Network administration',
        description: 'Datasets, drafts, verification and rights evidence, publish and restore.'),
      const PageSection(title: 'Datasets', child: Text('Dataset revisions, checksums, and import issues appear here once the admin datasets endpoint is available.')),
      PageSection(title: 'Draft review', child: BasisCard(nested: true, child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 8, children: [
        Text('Verification and rights evidence', style: t.typeCardTitle),
        AppTextArea(hint: 'Evidence notes…', controller: _evidence),
        Row(spacing: 8, children: [
          AppButton(label: 'Publish', size: AppControlSize.sm, onPressed: () async {
            final ok = await ConfirmDialog.show(context, title: 'Publish dataset?', body: 'Passengers will see the new network.', confirmLabel: 'Publish');
            if (ok == true && context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Publish queued (endpoint wiring pending).')));
          }),
          AppButton(label: 'Restore', variant: AppButtonVariant.outline, size: AppControlSize.sm, onPressed: () {}),
        ]),
      ]))),
      const PageSection(title: 'Transfer review', child: TransferReviewEditor()),
      PageSection(title: 'Passenger reports', child: FutureBuilder(
        future: null, builder: (c, s) => Text('Report review queue appears here.', style: t.typeMeta))),
    ]));
  }
}

class TransferReviewEditor extends StatefulWidget {
  const TransferReviewEditor({super.key});
  @override State<TransferReviewEditor> createState() => _TransferReviewEditorState();
}
class _TransferReviewEditorState extends State<TransferReviewEditor> {
  bool _allow = true;
  @override Widget build(BuildContext context) => BasisCard(nested: true, child: Column(spacing: 8, children: [
    AppToggle(value: _allow, label: 'Allow transfers at reviewed stops', onChanged: (v) => setState(() => _allow = v)),
    Text('Transfer decisions are recorded against the draft before publish.', style: BasisTokens.of(context).typeMeta),
  ]));
}
