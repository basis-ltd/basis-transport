import type { JourneyLocation, NetworkStop } from "./types";

export const locationFromStop = (s: NetworkStop): JourneyLocation => ({
  stopId: s.id,
  latitude: s.coordinates[1],
  longitude: s.coordinates[0],
  name: s.name,
});
export const validLocation = (
  s: JourneyLocation | undefined,
): s is JourneyLocation =>
  Boolean(
    s &&
    Number.isFinite(s.latitude) &&
    Number.isFinite(s.longitude) &&
    Math.abs(s.latitude) <= 90 &&
    Math.abs(s.longitude) <= 180,
  );
export function travelUrl(
  origin: JourneyLocation,
  destination: JourneyLocation,
) {
  const query = new URLSearchParams({
    originLat: String(origin.latitude),
    originLon: String(origin.longitude),
    destLat: String(destination.latitude),
    destLon: String(destination.longitude),
    from: origin.name,
    to: destination.name,
  });
  if (origin.stopId) query.set("originStopId", origin.stopId);
  if (destination.stopId) query.set("destStopId", destination.stopId);
  return `/travel?${query}`;
}
export function parseTravelQuery(q: URLSearchParams) {
  const read = (
    lat: string | null,
    lon: string | null,
    name: string,
    stopId: string | null,
  ): JourneyLocation | undefined => {
    if (lat === null || lon === null || lat.trim() === "" || lon.trim() === "")
      return;
    const p = {
      latitude: Number(lat),
      longitude: Number(lon),
      name: name || "Selected location",
      ...(stopId ? { stopId } : {}),
    };
    return validLocation(p) ? p : undefined;
  };
  const origin = read(
    q.get("originLat") ?? q.get("lat"),
    q.get("originLon") ?? q.get("lng"),
    q.get("from") || "",
    q.get("originStopId"),
  );
  const destination = read(
    q.get("destLat"),
    q.get("destLon"),
    q.get("to") || "",
    q.get("destStopId"),
  );
  const hasQuery = Boolean(q.toString());
  return {
    origin,
    destination,
    from: q.get("from") || "",
    to: q.get("to") || "",
    invalid: hasQuery && (!origin || !destination),
  };
}
export const requestLocation = () =>
  new Promise<JourneyLocation>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Location is unavailable in this browser. Search for a stop instead.",
        ),
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          latitude: p.coords.latitude,
          longitude: p.coords.longitude,
          name: "Current location",
        }),
      (e) =>
        reject(
          new Error(
            e.code === 1
              ? "Location permission was denied. Search for a stop instead."
              : "Your location could not be found. Try again or search for a stop.",
          ),
        ),
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true },
    );
  });
export const metres = (n: number) =>
  n < 1000 ? `${Math.round(n)} m` : `${(n / 1000).toFixed(1)} km`;
export const minutes = (n: number) => `${Math.max(1, Math.round(n / 60))} min`;
