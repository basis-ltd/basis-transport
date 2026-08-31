import { afterEach, describe, expect, it, vi } from "vitest";
import {
  approximateKigaliPoint,
  kigaliIpPoint,
  randomKigaliPoint,
} from "./kigali-view";

afterEach(() => vi.restoreAllMocks());
describe("Initial Kigali map view", () => {
  const local = {
    country_code: "RW",
    city: "Kigali",
    latitude: -1.95,
    longitude: 30.1,
  };
  it("only accepts a finite Kigali position, never a foreign or malformed result", () => {
    expect(kigaliIpPoint(local)).toEqual({ lat: -1.95, lng: 30.1 });
    for (const value of [
      null,
      {},
      { ...local, city: "Musanze" },
      { ...local, country_code: "US" },
      { ...local, error: true },
      { ...local, latitude: 40 },
      { ...local, longitude: NaN },
      { ...local, latitude: "-1.95" },
    ])
      expect(kigaliIpPoint(value)).toBeNull();
  });
  it("randomizes a view inside central Kigali", () => {
    vi.spyOn(Math, "random")
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999)
      .mockReturnValueOnce(0.999);
    const a = randomKigaliPoint(),
      b = randomKigaliPoint();
    expect(a).not.toEqual(b);
    for (const p of [a, b]) {
      expect(p.lat).toBeGreaterThanOrEqual(-1.965);
      expect(p.lat).toBeLessThan(-1.935);
      expect(p.lng).toBeGreaterThanOrEqual(30.06);
      expect(p.lng).toBeLessThan(30.125);
    }
  });
  it("omits cookies and referrers, and tolerates failed IP lookups", async () => {
    const request = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(local)));
    const controller = new AbortController();
    expect(await approximateKigaliPoint(controller.signal)).toEqual({
      lat: -1.95,
      lng: 30.1,
    });
    expect(request).toHaveBeenCalledWith(
      "https://ipapi.co/json/",
      expect.objectContaining({
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: controller.signal,
      }),
    );
    request.mockRejectedValue(new Error("Offline"));
    expect(await approximateKigaliPoint(controller.signal)).toBeNull();
    request.mockResolvedValue(new Response("{}", { status: 429 }));
    expect(await approximateKigaliPoint(controller.signal)).toBeNull();
  });
});
