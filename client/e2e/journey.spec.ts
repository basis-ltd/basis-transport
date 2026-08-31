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
  fareQuote: {
    status: "unknown",
    legFares: [],
    transferAdjustments: [],
    subtotal: null,
    total: null,
  },
  steps: [
    {
      id: "wait-1",
      kind: "wait",
      legIndex: 0,
      location: { name: "Kabuga", stopId: "A" },
      text: "Wait at Kabuga for route 101 towards Downtown. Service timing is unknown.",
      confidence: "unknown",
      timing: { status: "unknown", seconds: null, label: null },
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    },
    {
      id: "board-1",
      kind: "board",
      legIndex: 0,
      location: { name: "Kabuga", stopId: "A" },
      text: "Board route 101 (Fixture operator) towards Downtown.",
      confidence: "verified",
      timing: { status: "unknown", seconds: null, label: null },
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    },
    {
      id: "alight-1",
      kind: "alight",
      legIndex: 0,
      location: { name: "Downtown", stopId: "B" },
      text: "Get off at Downtown (stop 2 on this trip).",
      confidence: "verified",
      timing: { status: "unknown", seconds: null, label: null },
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    },
    {
      id: "arrive-1",
      kind: "arrive",
      legIndex: null,
      location: { name: "Downtown" },
      text: "Arrive at Downtown.",
      confidence: "verified",
      timing: { status: "unknown", seconds: null, label: null },
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    },
  ],
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
  const routeList = () => ({
    rows: [
      {
        id: "101",
        shortName: "101",
        longName: "Kabuga – Downtown",
        agency: "Fixture operator",
        patterns: 1,
      },
      {
        id: "202",
        shortName: "202",
        longName: "Remera – CBD",
        agency: "Other operator",
        patterns: 2,
      },
    ],
    totalCount: 2,
    totalPages: 1,
    currentPage: 0,
    network: metadata,
    filters: {
      agencies: ["Fixture operator", "Other operator"],
      headsigns: ["CBD", "Downtown"],
    },
  });
  await page.route(
    (url) => {
      const path = new URL(url).pathname;
      return path === "/api/routes" || path.endsWith("/api/routes");
    },
    async (route) => {
      const url = new URL(route.request().url());
      const agency = url.searchParams.get("agency") || "";
      const headsign = url.searchParams.get("headsign") || "";
      const base = routeList();
      const rows = base.rows.filter(
        (r) =>
          (!agency || r.agency === agency) &&
          (!headsign ||
            r.longName.toLowerCase().includes(headsign.toLowerCase())),
      );
      await route.fulfill({
        json: {
          message: "OK",
          data: { ...base, rows, totalCount: rows.length },
        },
      });
    },
  );
  await page.route(
    /\/api\/(network|journeys|stops|reports)(\/|\?|$)/,
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
      else if (url.pathname.endsWith("/network/map")) {
        const patterns = [
          {
            id: "p",
            routeId: "101",
            routeNumber: "101",
            routeName: "Kabuga – Downtown",
            agency: "Fixture operator",
            direction: "0",
            headsign: "Downtown",
            geometry: [origin.coordinates, destination.coordinates],
            geometryQuality: "schematic",
            generalized: false,
            stops: [origin, destination],
            stopCount: 2,
            stopsTruncated: false,
          },
          {
            id: "return",
            routeId: "101",
            routeNumber: "101",
            routeName: "Kabuga – Downtown",
            agency: "Fixture operator",
            direction: "1",
            headsign: "Kabuga",
            geometry: [destination.coordinates, origin.coordinates],
            geometryQuality: "schematic",
            generalized: false,
            stops: [
              { ...destination, sequence: 0 },
              { ...origin, sequence: 1 },
            ],
            stopCount: 2,
            stopsTruncated: false,
          },
        ].filter(
          (p) =>
            (!url.searchParams.get("headsign") ||
              p.headsign === url.searchParams.get("headsign")) &&
            (!url.searchParams.get("q") ||
              p.routeName
                .toLowerCase()
                .includes(url.searchParams.get("q")!.toLowerCase())),
        );
        data = {
          patterns,
          network: metadata,
          totalPatterns: patterns.length,
          totalRoutes: patterns.length ? 1 : 0,
          truncated: false,
          filters: {
            routes: [{ id: "101", number: "101", name: "Kabuga – Downtown" }],
            routesTruncated: false,
            agencies: ["Fixture operator"],
            headsigns: ["Downtown", "Kabuga"],
          },
        };
      } else if (url.pathname.endsWith("/journeys/plan")) {
        const body = (route.request().postDataJSON() || {}) as {
          departureAt?: string;
        };
        data = {
          status: body.departureAt ? "service_timing_unknown" : status,
          datasetVersion: metadata.version,
          verification: "historic",
          sourceUrl: metadata.sourceUrl,
          departureAt: body.departureAt ?? null,
          origin: { name: origin.name, coordinates: origin.coordinates },
          destination: {
            name: destination.name,
            coordinates: destination.coordinates,
          },
          journeys: status === "ok" || body.departureAt ? [journey] : [],
          warnings: body.departureAt
            ? ["Departure planning uses calendar checks only in this fixture."]
            : ["Synthetic browser fixture, not verified service."],
        };
      } else if (url.pathname.endsWith("/stops")) {
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
test("map pin fallback is explicit, cancels safely and survives journey URL reload", async ({
  page,
}, testInfo) => {
  await fixture(page);
  await page.goto(link);
  await page.getByRole("button", { name: "Choose from on map" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose from on map" });
  await expect(
    dialog.getByRole("heading", { name: "Map unavailable" }),
  ).toBeVisible();
  await dialog.getByLabel("Latitude", { exact: true }).fill("-1.96");
  await dialog.getByLabel("Longitude", { exact: true }).fill("30.12");
  await dialog.getByLabel("Location label (optional)").fill("My entrance");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("map-pin-picker.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("combobox", { name: "From" })).toHaveValue(
    "Kabuga",
  );
  await page.getByRole("button", { name: "Choose from on map" }).click();
  await dialog.getByLabel("Latitude", { exact: true }).fill("-1.96");
  await dialog.getByLabel("Longitude", { exact: true }).fill("30.12");
  await dialog.getByLabel("Location label (optional)").fill("My entrance");
  await dialog.getByRole("button", { name: "Use this location" }).click();
  await expect(page).toHaveURL(/originStopId=A/); // Confirming an endpoint does not submit the search.
  await page
    .getByRole("button", { name: "Find a journey", exact: true })
    .click();
  await expect(page).toHaveURL(/originLat=-1.96/);
  expect(new URL(page.url()).searchParams.has("originStopId")).toBe(false);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "From" })).toHaveValue(
    "My entrance",
  );
});

test("network map explorer keeps direction filters, stop order and text during a map outage", async ({
  page,
}, testInfo) => {
  await fixture(page);
  await page.goto("/routes");
  await page.getByRole("button", { name: "Network map", exact: true }).click();
  await expect(page).toHaveURL(/view=map/);
  await expect(
    page.getByRole("heading", { name: "Towards Downtown", exact: true }),
  ).toBeVisible();
  const stops = page.getByRole("list", { name: "Stops in travel order" });
  await expect(stops.getByRole("button").first()).toContainText("Kabuga");
  await page.getByRole("combobox", { name: "Direction", exact: true }).click();
  await page
    .getByRole("option", { name: "Towards Kabuga", exact: true })
    .click();
  await expect(stops.getByRole("button").first()).toContainText("Downtown");
  await page.reload();
  await expect(stops.getByRole("button").first()).toContainText("Downtown");
  await stops.getByRole("button").last().click();
  await expect(
    stops.getByRole("link", { name: "Stop details and journey planning" }),
  ).toHaveAttribute("href", "/stops/A");
  const mobile = testInfo.project.name === "mobile";
  if (mobile)
    await page.getByRole("button", { name: "Open network map" }).click();
  await expect(
    page.getByRole("heading", { name: "Map unavailable" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: testInfo.outputPath("network-map-explorer.png"),
    fullPage: !mobile,
    animations: "disabled",
  });
  if (mobile)
    await page.getByRole("button", { name: "Back to stop list" }).click();
  await page.getByRole("button", { name: "Route list", exact: true }).click();
  await expect(page).not.toHaveURL(/view=map/);
});

test("network map handles unavailable data, retry and empty filters without stale routes", async ({
  page,
}) => {
  await fixture(page);
  let unavailable = true;
  await page.route(/\/api\/network\/map(?:\?|$)/, (route) =>
    unavailable
      ? route.fulfill({
          status: 503,
          json: { message: "Verified coverage is unavailable." },
        })
      : route.fallback(),
  );
  await page.goto("/routes?view=map");
  await expect(page.getByRole("alert")).toContainText(
    "Verified coverage is unavailable",
  );
  unavailable = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Towards Downtown", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search network" })
    .fill("Not a route");
  await expect(
    page.getByRole("heading", { name: "No routes match" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Stops in travel order" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Towards Downtown", exact: true }),
  ).toBeVisible();
});

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
  await page.getByRole("button", { name: /Direct connection/ }).click();
  await expect(page.getByText(/Board route 101/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Direct connection/ }).click();
  await expect(page.getByText(/Board route 101/)).toBeVisible();
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
  await expect(page.getByText(/Board route 101/)).toBeVisible();
});
test("follow journey mode advances manually and resumes after reload", async ({
  page,
}, testInfo) => {
  await fixture(page);
  await page.goto(link);
  await page.getByRole("button", { name: /Direct connection/ }).click();
  await page
    .getByRole("button", { name: "Start journey", exact: true })
    .click();
  await expect(page.locator(".follow-journey-current")).toContainText(
    /Wait at Kabuga/,
  );
  await page.getByRole("button", { name: "At the stop", exact: true }).click();
  await expect(page.locator(".follow-journey-current")).toContainText(
    /Board route 101/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("follow-journey.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator(".follow-journey-current")).toContainText(
    /Board route 101/,
  );
  await page.getByRole("button", { name: "Boarded", exact: true }).click();
  await page.getByRole("button", { name: "Alighted", exact: true }).click();
  await expect(
    page.getByText("Journey complete.", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Arrived", exact: true }).click();
  await expect(
    page.getByText("Journey complete.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo arrival" }).click();
  await expect(
    page.getByRole("button", { name: "Arrived", exact: true }),
  ).toBeVisible();
});
test("preferences survive reload and browser history, including explicit extra transfers", async ({
  page,
}) => {
  await fixture(page);
  await page.goto(link);
  await page
    .getByRole("combobox", { name: "Bus changes", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Up to 4 changes", exact: true })
    .click();
  await expect(page).toHaveURL(/maxTransfers=4/);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Bus changes", exact: true }),
  ).toContainText("Up to 4 changes");
  await page
    .getByRole("combobox", { name: "Walk at each end", exact: true })
    .click();
  await page.getByRole("option", { name: "Up to 2 km", exact: true }).click();
  await expect(page).toHaveURL(/maxWalkMeters=2000/);
  await page.goBack();
  await expect(
    page.getByRole("combobox", { name: "Walk at each end", exact: true }),
  ).toContainText("Auto · nearest connection");
});
test("missing a stop requires choosing an actual replanning origin", async ({
  page,
}) => {
  await fixture(page);
  await page.goto(link);
  await page
    .getByRole("button", { name: "Start journey", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Missed my stop", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Find remaining journey" }),
  ).toBeDisabled();
  await expect(page.locator(".follow-journey-current")).toContainText(
    "Wait at Kabuga",
  );
  const field = page.getByRole("combobox", {
    name: "Replan from",
    exact: true,
  });
  await field.fill("Kab");
  await page.getByRole("option", { name: /Kabuga/ }).click();
  await expect(
    page.getByRole("button", { name: "Find remaining journey" }),
  ).toBeEnabled();
});
test("route explorer filters by operator and direction", async ({ page }) => {
  await fixture(page);
  await page.goto("/routes");
  await expect(page.getByRole("link", { name: /Kabuga/ })).toBeVisible();
  await page.getByRole("combobox", { name: "Operator", exact: true }).click();
  await page
    .getByRole("option", { name: "Fixture operator", exact: true })
    .click();
  await expect(page).toHaveURL(/agency=/);
  await expect(page.getByRole("link", { name: /Kabuga/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Remera/ })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Direction", exact: true }).click();
  await page.getByRole("option", { name: "Towards CBD", exact: true }).click();
  await expect(page).toHaveURL(/headsign=CBD/);
  await expect(page.getByText(/No routes found/)).toBeVisible();
});
test("departure time sends ISO timestamp and shows timing notice", async ({
  page,
}) => {
  await fixture(page);
  await page.goto(link);
  await page.locator('input[type="datetime-local"]').fill("2019-02-25T08:00");
  await expect(page.getByText(/cannot confirm when buses run/i)).toBeVisible({
    timeout: 10000,
  });
});
