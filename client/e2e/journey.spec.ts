import { test, expect, type Page } from "@playwright/test";

const origin = {
  id: "A",
  code: "A",
  name: "Kabuga",
  aliases: [],
  coordinates: [30.223, -1.979],
  sequence: 0,
  sourceSequence: 1,
  elapsedSeconds: 0,
  shapeIndex: null,
};
const destination = {
  ...origin,
  id: "B",
  code: "B",
  name: "Downtown",
  coordinates: [30.057, -1.943],
  sequence: 1,
  sourceSequence: 2,
  elapsedSeconds: 1200,
};
const metadata = {
  version: "synthetic-browser-test",
  verification: "historic",
  sourceUrl: "https://example.org/test",
  validFrom: "2019-01-01",
  validTo: "2021-01-01",
};
const journey = {
  id: "test-journey",
  transfers: 0,
  walkingMeters: 0,
  ridingMeters: 18200,
  durationSeconds: null,
  fareRwf: null,
  legs: [
    {
      kind: "ride",
      patternId: "p",
      routeId: "test:1",
      routeNumber: "101",
      agency: "Fixture operator",
      headsign: "Downtown",
      board: origin,
      alight: destination,
      stops: [origin, destination],
      geometry: [origin.coordinates, destination.coordinates],
      geometryQuality: "schematic",
      distanceMeters: 18200,
      durationSeconds: 1200,
      fare: null,
    },
  ],
};
const link =
  "/travel?originLat=-1.979&originLon=30.223&destLat=-1.943&destLon=30.057&from=Kabuga&to=Downtown&originStopId=A&destStopId=B";
async function fixture(page: Page, status = "ok") {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
  await page.route(
    /\/api\/(network|journeys|stops|routes|reports)(\/|\?|$)/,
    async (route) => {
      const url = new URL(route.request().url());
      let data: unknown;
      if (url.pathname.endsWith("/network/status"))
        data = {
          ...metadata,
          ready: true,
          mode: "internal-beta",
          routes: 1,
          stops: 2,
          patterns: 1,
        };
      else if (url.pathname.endsWith("/journeys/plan"))
        data = {
          status,
          datasetVersion: metadata.version,
          verification: "historic",
          sourceUrl: metadata.sourceUrl,
          origin: { name: origin.name, coordinates: origin.coordinates },
          destination: {
            name: destination.name,
            coordinates: destination.coordinates,
          },
          journeys: status === "ok" ? [journey] : [],
          warnings: ["Synthetic browser fixture, not verified service."],
        };
      else if (url.pathname.endsWith("/stops")) {
        const q = (url.searchParams.get("q") || "").toLowerCase();
        data = {
          rows: [origin, destination].filter((s) =>
            s.name.toLowerCase().includes(q),
          ),
          totalCount: 2,
          totalPages: 1,
          currentPage: 1,
          network: metadata,
        };
      } else data = { ...origin, routes: [], network: metadata };
      await route.fulfill({ json: { message: "OK", data } });
    },
  );
}
test("guest search, keyboard selection, reload, share warning, and device favorite", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/");
  const from = page.getByRole("combobox", { name: "From" }),
    to = page.getByRole("combobox", { name: "To" });
  await from.fill("Kab");
  await expect(page.getByRole("option", { name: /Kabuga/ })).toBeVisible();
  await from.press("ArrowDown");
  await from.press("Enter");
  await to.fill("Down");
  await expect(page.getByRole("option", { name: /Downtown/ })).toBeVisible();
  await to.press("ArrowDown");
  await to.press("Enter");
  await page
    .getByRole("button", { name: "Find a journey", exact: true })
    .click();
  await expect(page).toHaveURL(/originStopId=A/);
  await expect(
    page.getByRole("button", { name: "Board 101 at Kabuga", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Board 101 at Kabuga", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("precise coordinates");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.goto("/saved");
  await expect(
    page.getByRole("link", { name: /Kabuga → Downtown/ }),
  ).toBeVisible();
  await expect(page).not.toHaveURL(/auth/);
});
test("legacy links retain the origin but do not invent a destination", async ({
  page,
}) => {
  await fixture(page);
  await page.goto("/travel?lat=-1.95&lng=30.1&from=Remera&to=Downtown");
  await expect(page.getByRole("combobox", { name: "From" })).toHaveValue(
    "Remera",
  );
  await expect(page.getByRole("combobox", { name: "To" })).toHaveValue(
    "Downtown",
  );
  await page
    .getByRole("button", { name: "Find a journey", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Select both locations");
});
test("location is opt-in; nearby navigation needs one successful request", async ({
  page,
}) => {
  await fixture(page);
  await page.addInitScript(() => {
    let calls = 0;
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (success: (value: unknown) => void) => {
          calls++;
          (window as unknown as { locationCalls: number }).locationCalls =
            calls;
          success({ coords: { latitude: -1.95, longitude: 30.1 } });
        },
      },
    });
  });
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { locationCalls?: number }).locationCalls || 0,
    ),
  ).toBe(0);
  await page
    .getByRole("button", { name: "Find nearby stops", exact: true })
    .click();
  await expect(page).toHaveURL(/stops\?lat=/);
  expect(
    await page.evaluate(
      () => (window as unknown as { locationCalls: number }).locationCalls,
    ),
  ).toBe(1);
});
test("provider failure offers stop selection and does not show unrelated services", async ({
  page,
}) => {
  await fixture(page, "provider_unavailable");
  await page.goto(link);
  await expect(
    page.getByRole("heading", { name: "Walking directions are unavailable" }),
  ).toBeVisible();
  await expect(page.locator(".journey-card")).toHaveCount(0);
});
test("results fit the viewport and text survives a map outage", async ({
  page,
}, testInfo) => {
  await fixture(page);
  await page.goto(link);
  await expect(page.locator(".journey-card")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("journey-results.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Show map", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Map unavailable" }),
  ).toBeVisible({ timeout: 18000 });
  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
  } else await page.getByRole("button", { name: "Close map" }).click();
  await expect(
    page.getByRole("button", { name: "Board 101 at Kabuga", exact: true }),
  ).toBeVisible();
});
