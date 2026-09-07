// English-first passenger copy from client/src/features/journey/messages.ts — do not rewrite.
class JourneyMessages {
  static const from = 'From'; static const to = 'To';
  static const find = 'Find a journey'; static const finding = 'Finding connections…';
  static const swap = 'Swap origin and destination';
  static const selectLocations = 'Select both locations from the suggestions, or use your location.';
  static const differentDestination = 'Choose a different destination.';
  static const locationConsent = 'Precise location is requested only when you choose it. Google processes selected places and coordinates for maps, address lookups, and walking directions.';
  static String connections(int c) => '$c ${c == 1 ? 'connection' : 'connections'}';
  static String stops(int c) => '$c ${c == 1 ? 'stop' : 'stops'}';
  static const noConnection = ['No connection found', 'Try a nearby stop, allow more walking, or choose another destination.'];
  static const outsideCoverage = ['No stops within walking distance', 'Try choosing a bus stop directly or allow up to 2 km of walking.'];
  static const providerUnavailable = ['Walking directions are unavailable', 'Select named bus stops for both endpoints, or try again later.'];
  static const walkingOnly = ['Walking route', 'No bus connection found under your preferences. This route is walking only.'];
  static const alreadyThere = ['You are already there', 'Your origin and destination are the same place.'];
  static const searchLimit = ['Search limit reached', 'Some alternatives may be missing. Try fewer transfers or select stops directly.'];
  static const noService = ['No service at this time', 'Try a different departure time or check the route schedule.'];
  static const timingUnknown = ['Service timing unknown', 'We can suggest a route but cannot confirm when buses run.'];
  static List<String> forStatus(String s) => switch (s) {
    'no_connection' => noConnection, 'outside_coverage' => outsideCoverage,
    'provider_unavailable' => providerUnavailable, 'walking_only' => walkingOnly,
    'already_at_destination' => alreadyThere, 'search_limit_reached' => searchLimit,
    'no_service_at_time' => noService, 'service_timing_unknown' => timingUnknown, _ => const ['No results', 'Try adjusting your search.'],
  };
}
