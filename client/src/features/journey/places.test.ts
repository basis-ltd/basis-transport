import { afterEach, describe, expect, it, vi } from "vitest";
import { loadGoogleMapsLibrary } from "@/utils/googleMapsApi.util";
import { reverseGeocodeLocation } from "./places";

vi.mock("@/utils/googleMapsApi.util", () => ({
  loadGoogleMapsLibrary: vi.fn(),
}));
const point = {
  name: "Current location",
  latitude: -1.958855,
  longitude: 30.119324,
};
const load = vi.mocked(loadGoogleMapsLibrary);
function geocoder(results: unknown[]) {
  const geocode = vi.fn().mockResolvedValue({ results });
  load.mockResolvedValue({
    Geocoder: class {
      geocode = geocode;
    },
  } as unknown as google.maps.GeocodingLibrary);
  return geocode;
}
afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("Current location address lookup", () => {
  it("uses the formatted address but preserves exact GPS coordinates", async () => {
    const geocode = geocoder([
      {
        formatted_address: "KG 11 Ave, Kigali, Rwanda",
        geometry: { location: { lat: () => 0, lng: () => 0 } },
      },
    ]);
    expect(
      await reverseGeocodeLocation(point, new AbortController().signal),
    ).toEqual({ ...point, name: "KG 11 Ave, Kigali, Rwanda" });
    expect(geocode).toHaveBeenCalledWith({
      location: { lat: point.latitude, lng: point.longitude },
    });
  });
  it("rejects empty results and provider failures", async () => {
    geocoder([]);
    await expect(
      reverseGeocodeLocation(point, new AbortController().signal),
    ).rejects.toThrow("No address");
    load.mockRejectedValueOnce(new Error("unavailable"));
    await expect(
      reverseGeocodeLocation(point, new AbortController().signal),
    ).rejects.toThrow("unavailable");
  });
  it("times out and does not issue a late geocode after the library loads", async () => {
    vi.useFakeTimers();
    let resolve!: (library: google.maps.GeocodingLibrary) => void;
    load.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const result = expect(
      reverseGeocodeLocation(point, new AbortController().signal),
    ).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(5000);
    await result;
    const geocode = vi.fn();
    resolve({
      Geocoder: class {
        geocode = geocode;
      },
    } as unknown as google.maps.GeocodingLibrary);
    await Promise.resolve();
    expect(geocode).not.toHaveBeenCalled();
  });
  it("does not send coordinates for a cancelled selection", async () => {
    const geocode = geocoder([]);
    const controller = new AbortController();
    controller.abort();
    await expect(
      reverseGeocodeLocation(point, controller.signal),
    ).rejects.toThrow("cancelled");
    expect(geocode).not.toHaveBeenCalled();
  });
});
