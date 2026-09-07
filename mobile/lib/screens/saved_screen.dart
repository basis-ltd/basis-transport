import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../services/saved_store.dart';
import '../theme/tokens.dart';
import '../widgets/badges.dart';
import '../widgets/cards.dart';
import '../widgets/dialogs.dart';
import '../widgets/inputs/app_button.dart';
import '../widgets/page_shell.dart';

/// SavedJourneysPage: works fully signed out, optional sync when signed in,
/// explicit confirmation before importing device favourites.
class SavedScreen extends ConsumerWidget {
  const SavedScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) {
    final t = BasisTokens.of(context);
    final device = ref.watch(savedDeviceProvider);
    final remote = ref.watch(savedRemoteProvider);
    final signedIn = ref.watch(sessionProvider).signedIn;
    return Scaffold(body: PageBody(children: [
      const PageHeader(eyebrow: 'Library', title: 'Saved journeys', description: 'Device favourites work signed out.'),
      device.when(
        data: (items) => items.isEmpty
          ? const BasisCard(child: Text('No saved journeys yet. Save a journey, stop, or route to find it here.'))
          : Column(spacing: 8, children: [for (final i in items) BasisCard(child: Row(spacing: 8, children: [
              Expanded(child: InkWell(onTap: () => context.go(i.href), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(i.label, style: t.typeCardTitle), Text(i.href, style: t.typeMeta)]))),
              StatusBadge(label: i.kind),
              IconButton(icon: const Icon(Icons.delete_outline), tooltip: 'Remove', onPressed: () async {
                final ok = await ConfirmDialog.show(context, title: 'Remove saved item?', body: '“${i.label}” will be removed from this device.', confirmLabel: 'Remove');
                if (ok == true) { await SavedStore.remove(i.key); ref.invalidate(savedDeviceProvider); }
              }),
            ]))]),
        loading: () => const Loader(), error: (e, _) => AppError(message: '$e')),
      if (signedIn) remote.when(
        data: (items) => PageSection(title: 'Synced', child: items.isEmpty
          ? Text('Nothing synced yet.', style: t.typeMeta)
          : Column(spacing: 8, children: [
              for (final i in items) QuietCard(child: InkWell(onTap: () => context.go(i.href), child: Text(i.label))),
              AppButton(label: 'Import device favourites', variant: AppButtonVariant.outline, onPressed: () async {
                final ok = await ConfirmDialog.show(context, title: 'Import favourites?',
                  body: 'Copy every device favourite to your account? This adds ${device.value?.length ?? 0} items.', confirmLabel: 'Import');
                if (ok != true) return;
                final api = ref.read(apiClientProvider);
                for (final i in (device.value ?? [])) { try { await api.addSavedItem(i); } catch (_) {} }
                ref.invalidate(savedRemoteProvider);
              }),
            ])),
        loading: () => const Loader(), error: (e, _) => AppError(message: '$e')),
    ]));
  }
}
