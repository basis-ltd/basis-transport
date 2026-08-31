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
  preferences?: URLSearchParams,
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
  for (const key of [
    "preference",
    "maxWalkMeters",
    "maxTransfers",
    "departureAt",
  ]) {
    const value = preferences?.get(key);
    if (value) query.set(key, value);
  }
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
      { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
    );
  });
export function locationFromJourneyStop(
  journey: import("./types").Journey,
  stopId: string | undefined,
  _name: string,
): import("./types").JourneyLocation | null {
  for (const leg of journey.legs) {
    if (leg.kind === "walk" && leg.to.stopId === stopId) {
      return {
        name: leg.to.name,
        stopId,
        latitude: leg.to.coordinates[1],
        longitude: leg.to.coordinates[0],
      };
    }
    if (leg.kind === "ride") {
      if (leg.board.id === stopId) {
        return {
          name: leg.board.name,
          stopId,
          latitude: leg.board.coordinates[1],
          longitude: leg.board.coordinates[0],
        };
      }
      if (leg.alight.id === stopId) {
        return {
          name: leg.alight.name,
          stopId,
          latitude: leg.alight.coordinates[1],
          longitude: leg.alight.coordinates[0],
        };
      }
    }
  }
  return null; // A missing location must never become a valid-looking point at 0,0.
}

export function stepCoordinates(
  journey: import("./types").Journey,
  step: import("./types").PassengerStep,
): { latitude: number; longitude: number } | null {
  if (!step.location?.stopId) return null;
  const stopId = step.location.stopId;
  for (const leg of journey.legs) {
    if (leg.kind === "walk") {
      if (leg.to.stopId === stopId) {
        return {
          latitude: leg.to.coordinates[1],
          longitude: leg.to.coordinates[0],
        };
      }
      if (leg.from.stopId === stopId) {
        return {
          latitude: leg.from.coordinates[1],
          longitude: leg.from.coordinates[0],
        };
      }
      continue;
    }
    for (const stop of [leg.board, leg.alight, ...leg.stops]) {
      if (stop.id === stopId) {
        return {
          latitude: stop.coordinates[1],
          longitude: stop.coordinates[0],
        };
      }
    }
  }
  return null;
}

export function metresBetween(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export const metres = (n: number) =>
  n < 1000 ? `${Math.round(n)} m` : `${(n / 1000).toFixed(1)} km`;
export const minutes = (n: number) => `${Math.max(1, Math.round(n / 60))} min`;
