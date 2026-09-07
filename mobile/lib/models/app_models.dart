// Port of client/src/types/* — auth, users, insights, agencies, corridors.
class AppUser {
  final String id; final String? email; final String? phone;
  final String? name; final List<String> roles; final bool phoneVerified;
  const AppUser({required this.id, this.email, this.phone, this.name, required this.roles, required this.phoneVerified});
  factory AppUser.fromJson(Map<String, dynamic> j) => AppUser(
    id: (j['id'] ?? '') as String, email: j['email'] as String?, phone: j['phone'] as String?,
    name: (j['name'] ?? j['fullName']) as String?,
    roles: ((j['roles'] as List?) ?? []).map((e) => e is String ? e : (e['name'] ?? '').toString()).toList(),
    phoneVerified: (j['phoneVerified'] ?? j['isPhoneVerified'] ?? false) as bool);
  bool get isAdmin => roles.contains('ADMIN') || roles.contains('SUPER_ADMIN');
}

class AuthSession {
  final String token; final AppUser user;
  const AuthSession({required this.token, required this.user});
}

class Agency { final String id; final String name;
  const Agency({required this.id, required this.name});
  factory Agency.fromJson(Map<String, dynamic> j) => Agency(id: (j['id'] ?? '') as String, name: (j['name'] ?? '') as String); }

class Corridor { final String id; final String name;
  const Corridor({required this.id, required this.name});
  factory Corridor.fromJson(Map<String, dynamic> j) => Corridor(id: (j['id'] ?? '') as String, name: (j['name'] ?? '') as String); }

class InsightPoint { final String label; final double value;
  const InsightPoint({required this.label, required this.value});
  factory InsightPoint.fromJson(Map<String, dynamic> j) => InsightPoint(label: (j['label'] ?? j['name'] ?? '') as String, value: ((j['value'] ?? j['count'] ?? 0) as num).toDouble()); }

class InsightsData {
  final List<InsightPoint> series; final Map<String, dynamic> raw;
  const InsightsData({required this.series, required this.raw});
  factory InsightsData.fromJson(Map<String, dynamic> j) {
    final list = (j['series'] ?? j['rows'] ?? j['points'] ?? j['data'] ?? []) as List;
    return InsightsData(series: list.map((e) => InsightPoint.fromJson((e is Map<String,dynamic>) ? e : {'label':'','value':0})).toList(), raw: j);
  }
}
