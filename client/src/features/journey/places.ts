import { loadGoogleMapsLibrary } from "@/utils/googleMapsApi.util";
import type { JourneyLocation } from "./types";

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
