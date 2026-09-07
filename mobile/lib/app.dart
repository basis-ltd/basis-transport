import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'providers/providers.dart';
import 'router.dart';
import 'theme/theme.dart';

/// BasisApp: light/dark themes from index.css, system setting, session
/// restored on launch (token persistence + post-login redirect in router).
class BasisApp extends ConsumerStatefulWidget {
  const BasisApp({super.key});
  @override ConsumerState<BasisApp> createState() => _BasisAppState();
}
class _BasisAppState extends ConsumerState<BasisApp> {
  @override void initState() {
    super.initState();
    Future.microtask(() => ref.read(sessionProvider.notifier).restore());
  }
  @override Widget build(BuildContext context) {
    final router = buildRouter(ref);
    return MaterialApp.router(
      title: 'Basis Transport',
      theme: BasisTheme.light,
      darkTheme: BasisTheme.dark,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
