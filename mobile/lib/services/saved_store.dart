import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/journey.dart';

/// Device favourites in shared_preferences under `basis.saved.v1`,
/// same shape, 100-item cap, and href allow-list as saved.ts.
class SavedStore {
  static const key = 'basis.saved.v1';
  static final RegExp hrefAllow = RegExp(r'^/(travel\?|stops/|routes/)');
  static const cap = 100;

  static List<SavedItem> parse(String? raw) {
    if (raw == null || raw.isEmpty) return [];
    try {
      final v = jsonDecode(raw);
      if (v is! List) return [];
      return v.whereType<Map<String, dynamic>>()
        .where((m) => m['key'] is String && m['label'] is String && m['href'] is String && hrefAllow.hasMatch(m['href'] as String))
        .take(cap).map(SavedItem.fromJson).toList();
    } catch (_) { return []; }
  }

  static Future<List<SavedItem>> load() async {
    final p = await SharedPreferences.getInstance();
    return parse(p.getString(key));
  }
  static Future<void> save(SavedItem item) async {
    final p = await SharedPreferences.getInstance();
    final cur = parse(p.getString(key));
    await p.setString(key, jsonEncode([item.toJson(), ...cur.where((i) => i.key != item.key)].take(cap).map((e) => e.toJson()).toList()));
  }
  static Future<void> remove(String itemKey) async {
    final p = await SharedPreferences.getInstance();
    final cur = parse(p.getString(key));
    await p.setString(key, jsonEncode(cur.where((i) => i.key != itemKey).map((e) => e.toJson()).toList()));
  }
  static String savedKey(String href) {
    var h = 2166136261;
    for (final c in href.codeUnits) { h = ((h ^ c) * 16777619) & 0xFFFFFFFF; }
    return 'favorite-${h.toRadixString(16)}';
  }
}
