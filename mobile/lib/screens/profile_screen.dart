import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../theme/tokens.dart';
import '../widgets/cards.dart';
import '../widgets/inputs/app_button.dart';
import '../widgets/page_shell.dart';

/// UserProfilePage + session handling: restore on launch, expiry handling,
/// post-login redirect behaviour.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});
  @override Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(sessionProvider);
    final t = BasisTokens.of(context);
    return Scaffold(body: PageBody(children: [
      const PageHeader(eyebrow: 'Account', title: 'Profile'),
      BasisCard(child: s.signedIn ? Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 8, children: [
          Text(s.user?.name ?? s.user?.email ?? s.user?.phone ?? 'Signed in', style: t.typeCardTitle),
          Text('Roles: ${(s.user?.roles ?? []).join(', ')}', style: t.typeMeta),
          AppButton(label: 'Sign out', variant: AppButtonVariant.outline, onPressed: () async {
            await ref.read(sessionProvider.notifier).signOut(); if (context.mounted) context.go('/');
          }),
        ]) : Column(spacing: 8, children: [
          const Text('You are signed out.'),
          AppButton(label: 'Log in', onPressed: () => context.go('/auth/login?redirect=/account/profile')),
        ])),
    ]));
  }
}
