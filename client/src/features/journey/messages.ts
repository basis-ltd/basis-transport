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
    "Location is shared only when you choose it. Google processes place searches and walking coordinates.",
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
} as const;
