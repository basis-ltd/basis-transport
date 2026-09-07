import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/tokens.dart';

/// Bottom navigation + drawer from sidebar.constants roles, filtered by role.
class NavItem { final String title; final String path; final IconData icon; final List<String> roles;
  const NavItem({required this.title, required this.path, required this.icon, required this.roles}); }

const allNavItems = [
  NavItem(title: 'Dashboard', path: '/dashboard', icon: Icons.dashboard, roles: ['ADMIN', 'USER', 'DRIVER', 'SUPER_ADMIN']),
  NavItem(title: 'Saved journeys', path: '/saved', icon: Icons.bookmark, roles: ['ADMIN', 'USER', 'DRIVER', 'SUPER_ADMIN']),
  NavItem(title: 'Plan a journey', path: '/travel', icon: Icons.directions_bus, roles: ['ADMIN', 'USER', 'DRIVER', 'SUPER_ADMIN']),
  NavItem(title: 'Users', path: '/users', icon: Icons.people, roles: ['ADMIN', 'SUPER_ADMIN']),
  NavItem(title: 'Network administration', path: '/admin/network', icon: Icons.place, roles: ['ADMIN', 'SUPER_ADMIN']),
];

List<NavItem> navForRoles(List<String> roles) {
  if (roles.isEmpty) return [allNavItems[2]];
  return allNavItems.where((i) => i.roles.any(roles.contains)).toList();
}

class AppBottomNav extends StatelessWidget {
  final String location; final List<String> roles;
  const AppBottomNav({super.key, required this.location, required this.roles});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final items = [const NavItem(title: 'Home', path: '/', icon: Icons.home, roles: []), allNavItems[2],
      const NavItem(title: 'Routes', path: '/routes', icon: Icons.route, roles: []),
      const NavItem(title: 'Stops', path: '/stops', icon: Icons.pin_drop, roles: []),
      const NavItem(title: 'Saved', path: '/saved', icon: Icons.bookmark, roles: [])];
    var idx = items.indexWhere((i) => location == i.path || (i.path != '/' && location.startsWith(i.path)));
    if (idx < 0) idx = 0;
    return BottomNavigationBar(currentIndex: idx, selectedItemColor: t.accentInk, unselectedItemColor: t.muted,
      type: BottomNavigationBarType.fixed, onTap: (i) => context.go(items[i].path),
      items: [for (final n in items) BottomNavigationBarItem(icon: Icon(n.icon), label: n.title)]);
  }
}

class AppDrawer extends StatelessWidget {
  final List<String> roles;
  const AppDrawer({super.key, required this.roles});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final items = navForRoles(roles);
    return Drawer(child: ListView(children: [
      DrawerHeader(child: Text('Basis Transport', style: t.typeCardTitle)),
      for (final n in items) ListTile(leading: Icon(n.icon, color: t.accentInk), title: Text(n.title),
        onTap: () { Navigator.pop(context); context.go(n.path); }),
      const Divider(),
      for (final e in const [('/about','About'),('/help','Help centre'),('/cities','Supported cities'),('/contact','Contact'),('/privacy','Privacy'),('/terms','Terms'),('/cookies','Cookies')])
        ListTile(title: Text(e.$2), onTap: () { Navigator.pop(context); context.go(e.$1); }),
    ]));
  }
}
