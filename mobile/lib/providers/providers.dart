import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/app_models.dart';
import '../models/journey.dart';
import '../models/network.dart';
import '../services/api_client.dart';
import '../services/auth_storage.dart';
import '../services/saved_store.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());
final authStorageProvider = Provider<AuthStorage>((ref) => AuthStorage());

/// Session state mirrors web authSession + authRedirect helper.
class SessionState { final String? token; final AppUser? user;
  const SessionState({this.token, this.user});
  bool get signedIn => token != null && token!.isNotEmpty;
}
class SessionNotifier extends Notifier<SessionState> {
  @override SessionState build() => const SessionState();
  Future<void> restore() async {
    final t = await ref.read(authStorageProvider).readToken();
    state = SessionState(token: t);
  }
  Future<void> signIn(String token, AppUser user) async {
    await ref.read(authStorageProvider).writeToken(token);
    state = SessionState(token: token, user: user);
  }
  Future<void> signOut() async {
    await ref.read(authStorageProvider).clear();
    state = const SessionState();
  }
}
final sessionProvider = NotifierProvider<SessionNotifier, SessionState>(SessionNotifier.new);

// useNetworkResource shape: AsyncValue + refresh via ref.invalidate.
final networkStatusProvider = FutureProvider<NetworkStatus>((ref) => ref.read(apiClientProvider).networkStatus());
final networkMapProvider = FutureProvider<Map<String, dynamic>>((ref) => ref.read(apiClientProvider).networkMap());
final stopsPageProvider = FutureProvider.family<PageResult<NetworkStop>, ({int page, String q})>((ref, a) => ref.read(apiClientProvider).stops(page: a.page, q: a.q.isEmpty ? null : a.q));
final stopDetailProvider = FutureProvider.family<StopDetail, String>((ref, id) => ref.read(apiClientProvider).stop(id));
final routesPageProvider = FutureProvider.family<PageResult<RouteSummary>, ({int page, String q})>((ref, a) => ref.read(apiClientProvider).routes(page: a.page, q: a.q.isEmpty ? null : a.q));
final routeDetailProvider = FutureProvider.family<RouteDetail, String>((ref, id) => ref.read(apiClientProvider).route(id));
final savedDeviceProvider = FutureProvider<List<SavedItem>>((ref) => SavedStore.load());
final savedRemoteProvider = FutureProvider<List<SavedItem>>((ref) {
  if (!ref.watch(sessionProvider).signedIn) return Future.value(<SavedItem>[]);
  return ref.read(apiClientProvider).savedItems();
});
final insightsProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, scope) => ref.read(apiClientProvider).insights(scope));
final usersProvider = FutureProvider<List<Map<String, dynamic>>>((ref) => ref.read(apiClientProvider).users());

class PlanArgs { final JourneyLocation origin; final JourneyLocation destination;
  final int maxTransfers; final int maxWalkMeters; final String preference; final String? departureAt;
  const PlanArgs({required this.origin, required this.destination, this.maxTransfers = 2, this.maxWalkMeters = 800, this.preference = 'fewest_transfers', this.departureAt});
  @override bool operator ==(Object o) => o is PlanArgs && o.origin.name == origin.name && o.destination.name == destination.name;
  @override int get hashCode => Object.hash(origin.name, destination.name, maxTransfers, maxWalkMeters, preference, departureAt);
}
final journeyPlanProvider = FutureProvider.family<JourneyPlan, PlanArgs>((ref, a) => ref.read(apiClientProvider).planJourney(
  origin: a.origin, destination: a.destination, maxTransfers: a.maxTransfers, maxWalkMeters: a.maxWalkMeters, preference: a.preference, departureAt: a.departureAt));
