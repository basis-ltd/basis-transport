import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../models/app_models.dart';
import '../providers/providers.dart';
import '../theme/tokens.dart';
import '../widgets/cards.dart';
import '../widgets/inputs/app_button.dart';
import '../widgets/inputs/app_text_field.dart';
import '../widgets/misc.dart';
import '../widgets/page_shell.dart';

/// AuthPageShell equivalent + Login form pattern: single form controller,
/// field-level errors fed to the shared errorMessage slot.
class AuthShell extends StatelessWidget {
  final String title; final Widget child;
  const AuthShell({super.key, required this.title, required this.child});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return Scaffold(body: PageBody(children: [
      PageHeader(eyebrow: 'Account', title: title),
      BasisCard(child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 480), child: child)),
      Text('Passenger wording and error strings match the web app.', style: t.typeMeta),
    ]));
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  final String? redirect; const LoginScreen({super.key, this.redirect});
  @override ConsumerState<LoginScreen> createState() => _LoginScreenState();
}
class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _id = TextEditingController(); final _pw = TextEditingController();
  String? _idErr; String? _pwErr; String? _formErr; bool _busy = false;
  @override Widget build(BuildContext context) => AuthShell(title: 'Log in', child: Column(spacing: 12, children: [
    AppTextField(label: 'Email or phone', controller: _id, error: _idErr),
    AppTextField(label: 'Password', controller: _pw, obscure: true, error: _pwErr),
    if (_formErr != null) Text(_formErr!, style: TextStyle(color: BasisTokens.of(context).danger)),
    AppButton(label: 'Log in', loading: _busy, onPressed: () async {
      setState(() { _idErr = _id.text.isEmpty ? 'Enter your email or phone.' : null; _pwErr = _pw.text.isEmpty ? 'Enter your password.' : null; _formErr = null; });
      if (_idErr != null || _pwErr != null) return;
      setState(() => _busy = true);
      try {
        final r = await ref.read(apiClientProvider).login(_id.text.trim(), _pw.text);
        final token = (r['token'] ?? r['accessToken'] ?? '') as String;
        final user = AppUser.fromJson((r['user'] ?? {}) as Map<String, dynamic>);
        await ref.read(sessionProvider.notifier).signIn(token, user);
        if (context.mounted) context.go(widget.redirect ?? '/dashboard');
      } catch (e) { setState(() => _formErr = '$e'); } finally { if (mounted) setState(() => _busy = false); }
    }),
    Row(spacing: 8, children: [
      Expanded(child: AppButton(label: 'Create account', variant: AppButtonVariant.outline, onPressed: () => context.go('/auth/register'))),
      Expanded(child: AppButton(label: 'Forgot password', variant: AppButtonVariant.breadcrumb, onPressed: () => context.go('/auth/forgot-password'))),
    ]),
  ]));
}

class SimpleAuthScreen extends ConsumerStatefulWidget {
  final String mode; // signup|forgot|reset|phone-otp|complete
  const SimpleAuthScreen({super.key, required this.mode});
  @override ConsumerState<SimpleAuthScreen> createState() => _SimpleAuthScreenState();
}
class _SimpleAuthScreenState extends ConsumerState<SimpleAuthScreen> {
  final _a = TextEditingController(); final _b = TextEditingController(); final _c = TextEditingController();
  String? _err; bool _busy = false; bool _done = false;
  String get _title => switch (widget.mode) {
    'signup' => 'Create account', 'forgot' => 'Forgot password', 'reset' => 'Reset password',
    'phone-otp' => 'Phone verification', 'complete' => 'Complete registration', _ => 'Account' };
  @override Widget build(BuildContext context) {
    return AuthShell(title: _title, child: _done
      ? Text('Done. Continue to ${_title.toLowerCase()} from your email or SMS.', style: BasisTokens.of(context).typeBodySm)
      : Column(spacing: 12, children: [
        if (widget.mode == 'signup') ...[
          AppTextField(label: 'Name', controller: _a), TelInput(controller: _b),
          AppTextField(label: 'Password', controller: _c, obscure: true),
        ] else if (widget.mode == 'forgot') AppTextField(label: 'Email', controller: _a, keyboard: TextInputType.emailAddress)
        else if (widget.mode == 'reset') ...[AppTextField(label: 'New password', controller: _a, obscure: true), AppTextField(label: 'Reset token', controller: _b)]
        else if (widget.mode == 'phone-otp') ...[TelInput(controller: _a), AppTextField(label: 'Code', controller: _b, keyboard: TextInputType.number)]
        else ...[AppTextField(label: 'Name', controller: _a), AppTextField(label: 'Phone', controller: _b)],
        if (_err != null) Text(_err!, style: TextStyle(color: BasisTokens.of(context).danger)),
        AppButton(label: _title, loading: _busy, onPressed: () async {
          setState(() { _busy = true; _err = null; });
          try {
            final api = ref.read(apiClientProvider);
            switch (widget.mode) {
              case 'signup': await api.signup({'name': _a.text.trim(), 'phone': _b.text.trim(), 'password': _c.text}); break;
              case 'forgot': await api.forgotPassword(_a.text.trim()); break;
              case 'reset': await api.resetPassword({'token': _b.text.trim(), 'password': _a.text}); break;
              case 'phone-otp': await api.phoneVerifyOtp({'phone': _a.text.trim(), 'code': _b.text.trim()}); break;
              case 'complete': await api.completeRegistration({'name': _a.text.trim(), 'phone': _b.text.trim()}); break;
            }
            setState(() => _done = true);
          } catch (e) { setState(() => _err = '$e'); } finally { if (mounted) setState(() => _busy = false); }
        }),
      ]));
  }
}
