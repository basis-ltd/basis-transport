import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'providers/providers.dart';
import 'screens/auth_screens.dart';
import 'screens/content_screens.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/directory_screens.dart';
import 'screens/landing_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/saved_screen.dart';
import 'screens/staff/network_admin_screen.dart';
import 'screens/staff/users_screens.dart';
import 'screens/travel_screen.dart';
import 'theme/tokens.dart';
import 'widgets/nav/app_nav.dart';

bool _staff(List<String> r) => r.contains('ADMIN') || r.contains('SUPER_ADMIN');

GoRouter buildRouter(WidgetRef ref) {
  final session = ref.watch(sessionProvider);
  final roles = session.user?.roles ?? [];
  String? guard(BuildContext c, GoRouterState s, {bool staff = false, bool auth = false}) {
    if (auth && !session.signedIn) return '/auth/login?redirect=${Uri.encodeComponent(s.uri.toString())}';
    if (staff && !_staff(roles)) return session.signedIn ? '/dashboard' : '/auth/login?redirect=${Uri.encodeComponent(s.uri.toString())}';
    return null;
  }
  Widget shell(BuildContext c, GoRouterState s, Widget child) => Scaffold(
    appBar: AppBar(title: const Text('Basis Transport')),
    drawer: AppDrawer(roles: roles),
    body: child,
    bottomNavigationBar: AppBottomNav(location: s.uri.toString(), roles: roles),
  );
  return GoRouter(
    initialLocation: '/',
    redirect: (c, s) {
      final u = s.uri.toString();
      // Retired-service redirects mirror the web router.
      if (u.startsWith('/trips') || u.startsWith('/user-trips') || u.startsWith('/locations') || u.startsWith('/account/transport-cards')) return '/retired';
      return null;
    },
    routes: [
      ShellRoute(builder: shell, routes: [
        GoRoute(path: '/', builder: (c, s) => const LandingScreen()),
        GoRoute(path: '/travel', builder: (c, s) {
          final o = s.uri.queryParameters['o'] ?? s.uri.queryParameters['origin'];
          final d = s.uri.queryParameters['d'] ?? s.uri.queryParameters['destination'];
          if (o != null && d == null) return TravelScreen(initialOrigin: o);
          return TravelScreen(initialOrigin: o, initialDestination: d);
        }),
        GoRoute(path: '/routes', builder: (c, s) => const DirectoryScreen(kind: 'routes')),
        GoRoute(path: '/routes/:id', builder: (c, s) => DetailsScreen(kind: 'routes', id: s.pathParameters['id']!)),
        GoRoute(path: '/stops', builder: (c, s) => const DirectoryScreen(kind: 'stops')),
        GoRoute(path: '/stops/:id', builder: (c, s) => DetailsScreen(kind: 'stops', id: s.pathParameters['id']!)),
        GoRoute(path: '/about', builder: (c, s) => const ContentScreen(name: 'about')),
        GoRoute(path: '/help', builder: (c, s) => const ContentScreen(name: 'help')),
        GoRoute(path: '/cities', builder: (c, s) => const ContentScreen(name: 'cities')),
        GoRoute(path: '/contact', builder: (c, s) => const ContentScreen(name: 'contact')),
        GoRoute(path: '/privacy', builder: (c, s) => const ContentScreen(name: 'privacy')),
        GoRoute(path: '/terms', builder: (c, s) => const ContentScreen(name: 'terms')),
        GoRoute(path: '/cookies', builder: (c, s) => const ContentScreen(name: 'cookies')),
        GoRoute(path: '/retired', builder: (c, s) => const ContentScreen(name: 'retired')),
        GoRoute(path: '/auth/login', builder: (c, s) => LoginScreen(redirect: s.uri.queryParameters['redirect'])),
        GoRoute(path: '/auth/register', builder: (c, s) => const SimpleAuthScreen(mode: 'signup')),
        GoRoute(path: '/auth/forgot-password', builder: (c, s) => const SimpleAuthScreen(mode: 'forgot')),
        GoRoute(path: '/auth/reset-phone-otp', builder: (c, s) => const SimpleAuthScreen(mode: 'phone-otp')),
        GoRoute(path: '/auth/reset-password', builder: (c, s) => const SimpleAuthScreen(mode: 'reset')),
        GoRoute(path: '/auth/complete-registration', builder: (c, s) => const SimpleAuthScreen(mode: 'complete')),
        GoRoute(path: '/dashboard', builder: (c, s) => const DashboardScreen(), redirect: (c, s) => guard(c, s, auth: true)),
        GoRoute(path: '/saved', builder: (c, s) => const SavedScreen()),
        GoRoute(path: '/account/profile', builder: (c, s) => const ProfileScreen(), redirect: (c, s) => guard(c, s, auth: true)),
        GoRoute(path: '/admin/network', builder: (c, s) => const NetworkAdminScreen(), redirect: (c, s) => guard(c, s, staff: true)),
        GoRoute(path: '/users', builder: (c, s) => const UsersScreen(), redirect: (c, s) => guard(c, s, staff: true)),
        GoRoute(path: '/users/create', builder: (c, s) => const CreateUserScreen(), redirect: (c, s) => guard(c, s, staff: true)),
        GoRoute(path: '/users/:id', builder: (c, s) => UserDetailsScreen(id: s.pathParameters['id']!), redirect: (c, s) => guard(c, s, staff: true)),
      ]),
    ],
    errorBuilder: (c, s) => const ContentScreen(name: 'notfound'),
  );
}
