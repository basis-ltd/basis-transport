import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Auth token in flutter_secure_storage (mirrors web authSession token).
class AuthStorage {
  AuthStorage({FlutterSecureStorage? storage}) : _s = storage ?? const FlutterSecureStorage();
  final FlutterSecureStorage _s;
  static const _kToken = 'basis.auth.token';
  static const _kUser = 'basis.auth.user';
  Future<String?> readToken() => _s.read(key: _kToken);
  Future<void> writeToken(String t) => _s.write(key: _kToken, value: t);
  Future<void> clear() => Future.wait([_s.delete(key: _kToken), _s.delete(key: _kUser)]);
  Future<String?> readUserJson() => _s.read(key: _kUser);
  Future<void> writeUserJson(String v) => _s.write(key: _kUser, value: v);
}
