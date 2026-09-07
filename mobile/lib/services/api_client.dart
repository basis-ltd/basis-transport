import 'package:dio/dio.dart';
import 'dart:math';
import '../config/environment.dart';
import '../models/journey.dart';
import '../models/network.dart';
import 'auth_storage.dart';

/// Dio client mirroring networkRequest + rootApi:
/// base URL from API_URL, `Authorization: Bearer` only on authenticated
/// calls, `x-idempotency-key` UUID per mutation, unwrap `{message,data}`,
/// surface `message` (joined when array) as error text, 204 = empty success,
/// never attach a token to public reads.
class ApiException implements Exception {
  final String message; const ApiException(this.message);
  @override String toString() => message;
}

class ApiClient {
  ApiClient({Dio? dio, AuthStorage? authStorage})
      : _dio = dio ?? Dio(BaseOptions(baseUrl: _base(), connectTimeout: const Duration(seconds: 15), receiveTimeout: const Duration(seconds: 20))),
        _auth = authStorage ?? AuthStorage();
  final Dio _dio; final AuthStorage _auth;
  static String _base() => Environment.apiUrl.replaceAll(RegExp(r'/$'), '');

  Future<T> _get<T>(String path, T Function(dynamic) decode, {bool auth = false, Map<String, dynamic>? query}) async {
    final headers = await _headers(auth: auth, mutation: false);
    try {
      final r = await _dio.get(path, queryParameters: query, options: Options(headers: headers));
      if (r.statusCode == 204) return decode(null);
      return decode((r.data is Map) ? r.data['data'] : null);
    } on DioException catch (e) { throw ApiException(_msg(e)); }
  }
  Future<T> _mut<T>(String path, String method, Object? body, T Function(dynamic) decode, {bool auth = true}) async {
    final headers = await _headers(auth: auth, mutation: true);
    try {
      final r = await _dio.request(path, data: body, options: Options(method: method, headers: headers));
      if (r.statusCode == 204) return decode(null);
      return decode((r.data is Map) ? r.data['data'] : null);
    } on DioException catch (e) { throw ApiException(_msg(e)); }
  }
  Future<Map<String, String>> _headers({required bool auth, required bool mutation}) async {
    final h = <String, String>{'Content-Type': 'application/json'};
    if (auth) { final t = await _auth.readToken(); if (t != null && t.isNotEmpty) h['Authorization'] = 'Bearer $t'; }
    if (mutation) h['x-idempotency-key'] = _uuidV4();
    return h;
  }
  static String _uuidV4() {
    final r = Random.secure();
    final b = List<int>.generate(16, (_) => r.nextInt(256));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    final h = b.map((x) => x.toRadixString(16).padLeft(2, '0')).join();
    return '${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-${h.substring(16, 20)}-${h.substring(20)}';
  }

  static String _msg(DioException e) {
    final d = e.response?.data;
    if (d is Map && d['message'] != null) {
      final m = d['message'];
      if (m is List) return m.join('. ');
      return '$m';
    }
    return 'The service could not be reached. Try again.';
  }

  // Public reads (no token).
  Future<NetworkStatus> networkStatus() => _get('/network/status', (d) => NetworkStatus.fromJson((d ?? {}) as Map<String, dynamic>));
  Future<Map<String, dynamic>> networkMap() => _get('/network/map', (d) => (d ?? {}) as Map<String, dynamic>);
  Future<JourneyPlan> planJourney({required JourneyLocation origin, required JourneyLocation destination, int maxTransfers = 2, int maxWalkMeters = 800, String preference = 'fewest_transfers', String? departureAt}) =>
    _mut('/journeys/plan', 'POST', {'origin': origin.toJson(), 'destination': destination.toJson(), 'maxTransfers': maxTransfers.clamp(0, 4), 'maxWalkMeters': maxWalkMeters.clamp(100, 2000), 'preference': preference, if (departureAt case final d?) 'departureAt': d},
      (d) => JourneyPlan.fromJson(d as Map<String, dynamic>), auth: false);
  Future<PageResult<NetworkStop>> stops({int page = 1, int size = 20, String? q, double? lat, double? lng}) async {
    final d = await _get('/stops', (x) => x, query: {'page': page, 'size': size, if (q case final v?) 'q': v, if (lat case final v?) 'lat': v, if (lng case final v?) 'lng': v});
    final m = (d ?? {}) as Map<String, dynamic>;
    return PageResult(rows: ((m['rows'] ?? m['data'] ?? []) as List).map((e) => NetworkStop.fromJson(e)).toList(),
      totalCount: (m['totalCount'] ?? 0) as int, totalPages: (m['totalPages'] ?? 1) as int, currentPage: (m['currentPage'] ?? page) as int);
  }
  Future<StopDetail> stop(String id) => _get('/stops/$id', (d) => StopDetail.fromJson((d ?? {}) as Map<String, dynamic>));
  Future<PageResult<RouteSummary>> routes({int page = 1, int size = 20, String? q, double? lat, double? lng}) async {
    final d = await _get('/routes', (x) => x, query: {'page': page, 'size': size, if (q case final v?) 'q': v, if (lat case final v?) 'lat': v, if (lng case final v?) 'lng': v});
    final m = (d ?? {}) as Map<String, dynamic>;
    return PageResult(rows: ((m['rows'] ?? m['data'] ?? []) as List).map((e) => RouteSummary.fromJson(e as Map<String, dynamic>)).toList(),
      totalCount: (m['totalCount'] ?? 0) as int, totalPages: (m['totalPages'] ?? 1) as int, currentPage: (m['currentPage'] ?? page) as int);
  }
  Future<RouteDetail> route(String id) => _get('/routes/$id', (d) => RouteDetail.fromJson((d ?? {}) as Map<String, dynamic>));
  Future<List<Map<String, dynamic>>> agencies() => _get('/agencies', (d) => ((d is List) ? d : (d is Map ? (d['rows'] ?? []) as List : [])) as List<Map<String, dynamic>>);
  Future<Map<String, dynamic>> agency(String id) => _get('/agencies/$id', (d) => (d ?? {}) as Map<String, dynamic>);
  Future<List<Map<String, dynamic>>> corridors() => _get('/corridors', (d) => ((d is List) ? d : (d is Map ? (d['rows'] ?? []) as List : [])) as List<Map<String, dynamic>>);
  Future<Map<String, dynamic>> corridor(String id) => _get('/corridors/$id', (d) => (d ?? {}) as Map<String, dynamic>);

  // Auth (authenticated only where web requires it; login/signup public).
  Future<Map<String, dynamic>> login(String id, String pw) => _mut('/auth/login', 'POST', {'identifier': id, 'password': pw}, (d) => (d ?? {}) as Map<String, dynamic>, auth: false);
  Future<Map<String, dynamic>> signup(Map<String, dynamic> b) => _mut('/auth/signup', 'POST', b, (d) => (d ?? {}) as Map<String, dynamic>, auth: false);
  Future<void> forgotPassword(String email) => _mut('/auth/forgot-password', 'POST', {'email': email}, (_) {}, auth: false);
  Future<void> resetPassword(Map<String, dynamic> b) => _mut('/auth/reset-password', 'POST', b, (_) {}, auth: false);
  Future<Map<String, dynamic>> completeRegistration(Map<String, dynamic> b) => _mut('/auth/complete-registration', 'POST', b, (d) => (d ?? {}) as Map<String, dynamic>);
  Future<Map<String, dynamic>> phonePrecheck(String phone) => _mut('/auth/phone/precheck', 'POST', {'phone': phone}, (d) => (d ?? {}) as Map<String, dynamic>, auth: false);
  Future<void> phoneSendOtp(String phone) => _mut('/auth/phone/send-otp', 'POST', {'phone': phone}, (_) {}, auth: false);
  Future<Map<String, dynamic>> phoneVerifyOtp(Map<String, dynamic> b) => _mut('/auth/phone/verify-otp', 'POST', b, (d) => (d ?? {}) as Map<String, dynamic>, auth: false);
  Future<void> phoneResetSendOtp(String phone) => _mut('/auth/phone/reset/send-otp', 'POST', {'phone': phone}, (_) {}, auth: false);
  Future<Map<String, dynamic>> phoneResetVerifyOtp(Map<String, dynamic> b) => _mut('/auth/phone/reset/verify-otp', 'POST', b, (d) => (d ?? {}) as Map<String, dynamic>, auth: false);

  // Saved / reports / insights / users (authenticated).
  Future<List<SavedItem>> savedItems() => _get('/me/saved-items', (d) => ((d is List) ? d : []) .map((e) => SavedItem.fromJson(e as Map<String, dynamic>)).toList(), auth: true);
  Future<SavedItem> addSavedItem(SavedItem i) => _mut('/me/saved-items', 'POST', i.toJson(), (d) => SavedItem.fromJson((d ?? i.toJson()) as Map<String, dynamic>));
  Future<void> deleteSavedItem(String id) => _mut('/me/saved-items/$id', 'DELETE', null, (_) {});
  Future<PassengerReport> postReport(Map<String, dynamic> b) => _mut('/reports', 'POST', b, (d) => PassengerReport.fromJson(((d ?? b) as Map).map((k, v) => MapEntry('$k', v))), auth: false);
  Future<Map<String, dynamic>> insights(String scope) => _get('/insights/$scope', (d) => (d ?? {}) as Map<String, dynamic>, auth: true);
  Future<List<Map<String, dynamic>>> users() => _get('/users', (d) => ((d is List) ? d : (d is Map ? (d['rows'] ?? []) : [])) as List<Map<String, dynamic>>, auth: true);
  Future<Map<String, dynamic>> user(String id) => _get('/users/$id', (d) => (d ?? {}) as Map<String, dynamic>, auth: true);
  Future<Map<String, dynamic>> createUser(Map<String, dynamic> b) => _mut('/users', 'POST', b, (d) => (d ?? {}) as Map<String, dynamic>);
  Future<void> deleteUser(String id) => _mut('/users/$id', 'DELETE', null, (_) {});
}
