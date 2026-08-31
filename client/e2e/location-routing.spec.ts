import { test, expect, type Page } from "@playwright/test";

const from = {
  stopId: "remera-out",
  name: "Remera park",
  coordinates: [30.119324, -1.958855],
};
const to = {
  stopId: "downtown-in",
  name: "Downtown",
  coordinates: [30.057247, -1.94375],
};
const metadata = {
  datasetVersion: "synthetic-only",
  verification: "historic",
  sourceUrl: "https://example.org/fixture",
  validFrom: "2019-01-01",
  validTo: "2021-01-01",
};
async function setup(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
  await page.route(/\/api\/network\/status/, (route) =>
    route.fulfill({
      json: {
        message: "OK",
        data: { ...metadata, ready: true, stops: 3, routes: 1, patterns: 1 },
      },
    }),
  );
  await page.route(/\/api\/stops\?/, (route) =>
    route.fulfill({
      json: {
        message: "OK",
        data: {
          rows: [
            {
              id: to.stopId,
              code: to.stopId,
              name: to.name,
              coordinates: to.coordinates,
              aliases: [],
              services: [{ routeNumber: "101", headsign: "Downtown" }],
            },
          ],
          totalCount: 1,
        },
      },
    }),
  );
}
test("current location shows the address, stays opt-in and preserves coordinates in navigation", async ({
  page,
}) => {
  await setup(page);
  // Synthetic GPS and provider responses only; never request the tester's position.
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition(success: PositionCallback) {
          success({
            coords: { latitude: -1.958855, longitude: 30.119324 },
          } as GeolocationPosition);
        },
      },
    });
    Object.assign(window, {
      google: {
        maps: {
          importLibrary: async (name: string) =>
            name === "geocoding"
              ? {
                  Geocoder: class {
                    async geocode() {
                      return {
                        results: [
                          { formatted_address: "KG 11 Ave, Kigali, Rwanda" },
                        ],
                      };
                    }
                  },
                }
              : {
                  AutocompleteSessionToken: class {},
                  AutocompleteSuggestion: {
                    fetchAutocompleteSuggestions: async () => ({
                      suggestions: [],
                    }),
                  },
                },
        },
      },
    });
  });
  await page.route(/\/api\/journeys\/plan/, (route) =>
    route.fulfill({
      json: {
        message: "OK",
        data: {
          ...metadata,
          status: "provider_unavailable",
          origin: from,
          destination: to,
          journeys: [],
          warnings: [],
        },
      },
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("combobox", { name: "From", exact: true }),
  ).toHaveValue("");
  await page.getByRole("button", { name: "Use my location for from" }).click();
  await expect(
    page.getByRole("combobox", { name: "From", exact: true }),
  ).toHaveValue("KG 11 Ave, Kigali, Rwanda");
  await page
    .getByRole("combobox", { name: "To", exact: true })
    .fill("Downtown");
  await page.getByRole("option", { name: /Downtown/ }).click();
  await page
    .getByRole("button", { name: "Find a journey", exact: true })
    .click();
  await expect(page).toHaveURL(/from=KG\+11\+Ave/);
  const query = new URL(page.url()).searchParams;
  expect(query.get("originLat")).toBe("-1.958855");
  expect(query.get("originLon")).toBe("30.119324");
  expect(query.has("originStopId")).toBe(false);
});

test("Remera recovery changes boarding points only after explicit selection and survives history", async ({
  page,
}) => {
  await setup(page);
  const requests: string[] = [];
  await page.route(/\/api\/journeys\/plan/, async (route) => {
    const body = route.request().postDataJSON();
    requests.push(body.origin.stopId);
    const recovered = body.origin.stopId === from.stopId;
    const stops = [from, to].map((p, sequence) => ({
      id: p.stopId,
      code: p.stopId,
      name: p.name,
      coordinates: p.coordinates,
      aliases: [],
      sequence,
      sourceSequence: sequence + 1,
      elapsedSeconds: null,
      shapeIndex: null,
    }));
    await route.fulfill({
      json: {
        message: "OK",
        data: {
          ...metadata,
          status: recovered ? "ok" : "no_connection",
          origin: recovered ? from : { ...from, stopId: "remera-in" },
          destination: to,
          journeys: recovered
            ? [
                {
                  id: "synthetic-101",
                  transfers: 0,
                  walkingMeters: 0,
                  ridingMeters: 8000,
                  durationSeconds: null,
                  fareRwf: null,
                  legs: [
                    {
                      kind: "ride",
                      routeId: "101",
                      routeNumber: "101",
                      agency: "Test",
                      patternId: "outbound",
                      headsign: "Downtown",
                      board: stops[0],
                      alight: stops[1],
                      stops,
                      distanceMeters: 8000,
                      durationSeconds: null,
                      geometry: [],
                      geometryQuality: "schematic",
                      fareRwf: null,
                      timingStatus: "unknown",
                    },
                  ],
                },
              ]
            : [],
          nearbyConnections: recovered
            ? []
            : [
                {
                  origin: from,
                  destination: to,
                  originDistanceMeters: 40,
                  destinationDistanceMeters: 0,
                  routeNumber: "101",
                  headsign: "Downtown",
                },
              ],
          warnings: [],
        },
      },
    });
  });
  const original =
    "/travel?originLat=-1.958687&originLon=30.118961&destLat=-1.94375&destLon=30.057247&from=Remera&to=Downtown&originStopId=remera-in&destStopId=downtown-in";
  await page.goto(original);
  const alternatives = page.getByRole("region", {
    name: "Nearby boarding alternatives",
  });
  await expect(alternatives).toBeVisible();
  await expect(alternatives).toContainText("not checked walking routes");
  // React StrictMode may repeat an aborted read-only request in development.
  expect([...new Set(requests)]).toEqual(["remera-in"]);
  await alternatives.getByRole("button", { name: "Use these stops" }).click();
  await expect(page).toHaveURL(/originStopId=remera-out/);
  await expect(page.getByText("1 connection", { exact: true })).toBeVisible();
  await expect(page.getByText("101", { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 connection", { exact: true })).toBeVisible();
  await page.goBack();
  await expect(alternatives).toBeVisible();
  await expect(page).toHaveURL(/originStopId=remera-in/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
