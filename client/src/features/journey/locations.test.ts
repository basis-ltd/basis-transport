import { describe, it, expect } from "vitest";
import { parseTravelQuery, travelUrl } from "./locations";
describe("Shareable journey locations", () => {
  it("round trips labels, coordinates, and source-qualified stop IDs", () => {
    const origin = {
      name: "Kabuga",
      latitude: -1.979,
      longitude: 30.223,
      stopId: "DT4A_1",
    };
    const destination = {
      name: "Downtown",
      latitude: -1.943,
      longitude: 30.057,
      stopId: "DT4A_2",
    };
    const parsed = parseTravelQuery(
      new URLSearchParams(travelUrl(origin, destination).split("?")[1]),
    );
    expect(parsed.origin).toEqual(origin);
    expect(parsed.destination).toEqual(destination);
    expect(parsed.invalid).toBe(false);
  });
  it("preserves the origin and labels of incomplete legacy links", () => {
    const parsed = parseTravelQuery(
      new URLSearchParams("lat=-1.95&lng=30.1&from=Remera&to=Downtown"),
    );
    expect(parsed.origin?.name).toBe("Remera");
    expect(parsed.to).toBe("Downtown");
    expect(parsed.destination).toBeUndefined();
    expect(parsed.invalid).toBe(true);
  });
  it("rejects missing, nonfinite, and out-of-range coordinates", () => {
    for (const value of ["", "Infinity", "NaN", "91"])
      expect(
        parseTravelQuery(
          new URLSearchParams("originLat=" + value + "&originLon=30"),
        ).origin,
      ).toBeUndefined();
  });
});
