import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';
import '../../widgets/badges.dart';
import '../../widgets/cards.dart';
import '../../widgets/dialogs.dart';
import '../../widgets/inputs/app_button.dart';
import '../../widgets/inputs/app_text_field.dart';
import '../../widgets/misc.dart';
import '../../widgets/page_shell.dart';

/// Users module: list, details, create, delete. ADMIN/SUPER_ADMIN only
/// (enforced in router redirect, mirroring StaffRoutes).
class UsersScreen extends ConsumerStatefulWidget {
  const UsersScreen({super.key});
  @override ConsumerState<UsersScreen> createState() => _UsersScreenState();
}
class _UsersScreenState extends ConsumerState<UsersScreen> {
  int _page = 0;
  @override Widget build(BuildContext context) => Scaffold(body: PageBody(children: [
    PageHeader(eyebrow: 'People', title: 'Users', description: 'Directory of accounts.',
      actions: AppButton(label: 'Create user', size: AppControlSize.sm, onPressed: () => context.go('/users/create'))),
    ref.watch(usersProvider).when(
      data: (rows) => PaginatedTable(
        columns: const ['Name', 'Contact', 'Roles'],
        rows: [for (final u in rows) ['${u['name'] ?? ''}', '${u['email'] ?? u['phone'] ?? ''}', '${((u['roles'] ?? []) as List).join(', ')}']],
        page: _page, totalPages: 1, onPage: (p) => setState(() => _page = p)),
      loading: () => const Loader(), error: (e, _) => AppError(message: '$e')),
  ]));
}

class UserDetailsScreen extends ConsumerWidget {
  final String id; const UserDetailsScreen({super.key, required this.id});
  @override Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(body: PageBody(children: [
      const PageHeader(eyebrow: 'People', title: 'User details'),
      FutureBuilder(future: ref.read(apiClientProvider).user(id),
        builder: (c, s) {
          if (!s.hasData) return const Loader();
          final u = s.data!;
          return BasisCard(child: Column(spacing: 8, children: [
            DetailList(items: [MapEntry('Name', '${u['name'] ?? ''}'), MapEntry('Email', '${u['email'] ?? ''}'), MapEntry('Phone', '${u['phone'] ?? ''}')]),
            AppButton(label: 'Delete user', variant: AppButtonVariant.outline, onPressed: () async {
              final ok = await ConfirmDialog.show(context, title: 'Delete user?', body: 'This removes the account.', confirmLabel: 'Delete');
              if (ok == true) { await ref.read(apiClientProvider).deleteUser(id); if (context.mounted) context.go('/users'); }
            }),
          ]));
        }),
    ]));
  }
}

class CreateUserScreen extends ConsumerStatefulWidget {
  const CreateUserScreen({super.key});
  @override ConsumerState<CreateUserScreen> createState() => _CreateUserScreenState();
}
class _CreateUserScreenState extends ConsumerState<CreateUserScreen> {
  final _n = TextEditingController(); final _e = TextEditingController(); final _p = TextEditingController();
  String? _err; bool _busy = false;
  @override Widget build(BuildContext context) => Scaffold(body: PageBody(children: [
    const PageHeader(eyebrow: 'People', title: 'Create user'),
    BasisCard(child: Column(spacing: 12, children: [
      AppTextField(label: 'Name', controller: _n), AppTextField(label: 'Email', controller: _e),
      AppTextField(label: 'Password', controller: _p, obscure: true),
      if (_err != null) AppError(message: _err!),
      AppButton(label: 'Create', loading: _busy, onPressed: () async {
        setState(() { _busy = true; _err = null; });
        try { await ref.read(apiClientProvider).createUser({'name': _n.text.trim(), 'email': _e.text.trim(), 'password': _p.text}); if (context.mounted) context.go('/users'); }
        catch (e) { setState(() => _err = '$e'); } finally { if (mounted) setState(() => _busy = false); }
      }),
    ])),
  ]));
}
