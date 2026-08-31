/** English-first passenger copy. Keep complete sentences and plural forms together. */
export const journeyMessages = {
  from: "From",
  to: "To",
  find: "Find a journey",
  finding: "Finding connections…",
  swap: "Swap origin and destination",
  selectLocations:
    "Select both locations from the suggestions, or use your location.",
  differentDestination: "Choose a different destination.",
  locationConsent:
    "Location is shared only when you choose it. Google processes place searches and coordinates for address lookups and walking directions.",
  connections: (count: number) =>
    `${count} ${count === 1 ? "connection" : "connections"}`,
  stops: (count: number) => `${count} ${count === 1 ? "stop" : "stops"}`,
  no_connection: [
    "No connection found",
    "Try a nearby stop, allow more walking, or choose another destination.",
  ],
  outside_coverage: [
    "No stops within walking distance",
    "Try choosing a bus stop directly or allow up to 2 km of walking.",
  ],
  provider_unavailable: [
    "Walking directions are unavailable",
    "Select named bus stops for both endpoints, or try again later.",
  ],
  walking_only: [
    "Walking route",
    "No bus connection found under your preferences. This route is walking only.",
  ],
  already_at_destination: [
    "You are already there",
    "Your origin and destination are the same place.",
  ],
  search_limit_reached: [
    "Search limit reached",
    "Some alternatives may be missing. Try fewer transfers or select stops directly.",
  ],
  no_service_at_time: [
    "No service at this time",
    "Try a different departure time or check the route schedule.",
  ],
  service_timing_unknown: [
    "Service timing unknown",
    "We can suggest a route but cannot confirm when buses run.",
  ],
} as const;
