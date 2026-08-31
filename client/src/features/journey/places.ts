import { loadGoogleMapsLibrary } from "@/utils/googleMapsApi.util";
import type { JourneyLocation } from "./types";

/** Resolve a display address without moving the GPS point to an address centroid. */
export async function reverseGeocodeLocation(
  location: JourneyLocation,
  signal: AbortSignal,
): Promise<JourneyLocation> {
  let active = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let onAbort: () => void = () => {};
  try {
    return await Promise.race([
      (async () => {
        const library = await loadGoogleMapsLibrary("geocoding");
        if (!active || signal.aborted)
          throw new Error("Address lookup cancelled.");
        const { results } = await new library.Geocoder().geocode({
          location: { lat: location.latitude, lng: location.longitude },
        });
        const name = results.find((r) =>
          r.formatted_address?.trim(),
        )?.formatted_address;
        if (!name) throw new Error("No address found.");
        return { ...location, name };
      })(),
      new Promise<never>((_, reject) => {
        onAbort = () => reject(new Error("Address lookup cancelled."));
        if (signal.aborted) onAbort();
        else signal.addEventListener("abort", onAbort, { once: true });
        timer = setTimeout(
          () => reject(new Error("Address lookup timed out.")),
          5000,
        );
      }),
    ]);
  } finally {
    active = false;
    clearTimeout(timer);
    signal.removeEventListener("abort", onAbort);
  }
}

export interface PlaceSuggestion {
  id: string;
  label: string;
  select: () => Promise<JourneyLocation>;
}
export function createPlaceSearch() {
  let token: google.maps.places.AutocompleteSessionToken | undefined;
  return async (input: string): Promise<PlaceSuggestion[]> => {
    const library = await loadGoogleMapsLibrary("places");
    token ??= new library.AutocompleteSessionToken();
    const response =
      await library.AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: token,
        includedRegionCodes: ["rw"],
        locationBias: { center: { lat: -1.95, lng: 30.09 }, radius: 40000 },
      });
    return response.suggestions.flatMap((s) =>
      s.placePrediction
        ? [
            {
              id: s.placePrediction.placeId,
              label: s.placePrediction.text.toString(),
              select: async () => {
                const p = s.placePrediction!.toPlace();
                await p.fetchFields({
                  fields: ["location", "displayName", "formattedAddress"],
                });
                token = undefined;
                if (!p.location)
                  throw new Error("Choose a location with a map position.");
                return {
                  latitude: p.location.lat(),
                  longitude: p.location.lng(),
                  name: p.displayName || p.formattedAddress || input,
                  placeId: p.id,
                };
              },
            },
          ]
        : [],
    );
  };
}
