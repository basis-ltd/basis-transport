import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const scratch = process.env.UI_SCRATCH;

async function shot(page: Page, name: string) {
  if (!scratch) return;
  mkdirSync(scratch, { recursive: true });
  await page.screenshot({
    path: join(scratch, name),
    fullPage: true,
  });
}

async function stubLocateAndGeocode(page: Page) {
  await page.route(/maps\.googleapis\.com/, (route) => route.abort());
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
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
}

async function assertLabeledAttribution(page: Page, formSelector: string) {
  const form = page.locator(formSelector);
  await expect(form).toBeVisible();
  await page.getByRole("button", { name: "Use my location for from" }).click();
  const caption = form.locator(
    ".journey-google-attribution--overlay:not(.is-idle)",
  );
  await expect(caption).toBeVisible();
  await expect(caption).toContainText("Address by");
  await expect(caption.locator("span")).toHaveText("Google Maps");
  const pin = form.getByRole("button", { name: /Choose from on map/i });
  await expect(pin).toBeVisible();
  const geometry = await form.evaluate((root) => {
    const cap = root.querySelector(
      ".journey-google-attribution--overlay:not(.is-idle)",
    ) as HTMLElement | null;
    const trigger = root.querySelector(
      ".journey-pin-trigger",
    ) as HTMLElement | null;
    if (!cap || !trigger) return null;
    const capBox = cap.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(cap);
    const textBox = range.getBoundingClientRect();
    const cs = getComputedStyle(trigger);
    const pinBox = trigger.getBoundingClientRect();
    const content = {
      top: pinBox.top + parseFloat(cs.paddingTop),
      left: pinBox.left + parseFloat(cs.paddingLeft),
      bottom: pinBox.bottom - parseFloat(cs.paddingBottom),
      right: pinBox.right - parseFloat(cs.paddingRight),
    };
    const intersects = !(
      capBox.right <= content.left ||
      capBox.left >= content.right ||
      capBox.bottom <= content.top ||
      capBox.top >= content.bottom
    );
    return {
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      captionVisible: getComputedStyle(cap).visibility !== "hidden",
      captionClipped:
        textBox.height > 0 &&
        (textBox.bottom > capBox.bottom + 0.5 ||
          textBox.top < capBox.top - 0.5),
      captionLineHeight: parseFloat(getComputedStyle(cap).lineHeight),
      captionHeight: capBox.height,
      spanDisplay: getComputedStyle(cap.querySelector("span")!).display,
      intersectsPinContent: intersects,
    };
  });
  expect(geometry).toBeTruthy();
  expect(geometry!.captionVisible).toBe(true);
  expect(geometry!.captionClipped).toBe(false);
  expect(geometry!.spanDisplay).toBe("inline");
  expect(geometry!.captionHeight).toBeGreaterThanOrEqual(
    geometry!.captionLineHeight - 1,
  );
  expect(geometry!.captionHeight).toBeLessThan(
    geometry!.captionLineHeight * 1.5,
  );
  expect(geometry!.intersectsPinContent).toBe(false);
  expect(geometry!.scrollWidth).toBeLessThanOrEqual(geometry!.clientWidth + 1);
}

test("Saved journeys requires sign-in on the public auth shell", async ({
  page,
}) => {
  await page.goto("/saved");
  await expect(page).toHaveURL(/\/auth\/login\?returnTo=%2Fsaved/);
  await expect(
    page.getByRole("heading", { name: /welcome back/i }),
  ).toBeVisible();
  await shot(page, "saved.png");
});

test("landing hero form shows unclipped Address by Google Maps without covering the pin trigger", async ({
  page,
}) => {
  await stubLocateAndGeocode(page);
  await page.goto("/");
  await assertLabeledAttribution(page, "#landing-hero-form");
  await shot(page, "hero-form.png");
});

test("travel form shows unclipped Address by Google Maps without covering the pin trigger", async ({
  page,
}) => {
  await stubLocateAndGeocode(page);
  await page.goto("/travel");
  await assertLabeledAttribution(page, "form.journey-form");
});

const passenger = {
  id: "synthetic-passenger",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phoneNumber: "+250780000000",
  status: "ACTIVE",
  isProfileComplete: true,
  userRoles: [] as { role: { name: string } }[],
};

const staff = {
  ...passenger,
  id: "synthetic-staff",
  userRoles: [{ role: { name: "ADMIN" } }],
};

async function persistSession(
  page: Page,
  user: typeof passenger,
  token = "synthetic-browser-token",
) {
  await page.goto("/");
  await page.evaluate(
    async ({ sessionUser, sessionToken }) => {
      const path = "/src/states/authSession.ts";
      const { persistAuthSession } = await import(/* @vite-ignore */ path);
      await persistAuthSession({ token: sessionToken, user: sessionUser });
    },
    { sessionUser: user, sessionToken: token },
  );
}

/**
 * A card is told from the page by exactly one thing: its edge.
 *
 * This used to assert a different fill and a shadow as well. That contract is
 * what produced a tinted ground with a tinted hairline on it — three surfaces
 * a step apart, none of which read. The card now sits on the same white as the
 * page and earns its outline instead, so what has to be checked is that the
 * outline actually carries contrast rather than that it merely exists.
 */
async function assertCardSitsOnSurface(page: Page) {
  const pane = page.locator("[data-app-pane]");
  await expect(pane).toBeVisible();
  const card = pane.locator("section.card-framed").first();
  await expect(card).toBeVisible();
  const contrast = await page.evaluate(() => {
    const luminance = (color: string) => {
      const [r, g, b] = (color.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"])
        .slice(0, 3)
        .map((value) => {
          const channel = Number(value) / 255;
          return channel <= 0.03928
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const paneEl = document.querySelector("[data-app-pane]") as HTMLElement;
    const cardEl = paneEl?.querySelector(
      "section.card-framed",
    ) as HTMLElement | null;
    if (!paneEl || !cardEl) return null;
    const cardStyle = getComputedStyle(cardEl);
    const cardBg = cardStyle.backgroundColor;
    const borderColor = cardStyle.borderTopColor;
    const ratio = (a: string, b: string) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    return {
      cardBg,
      borderColor,
      borderWidth: cardStyle.borderTopWidth,
      borderRadius: cardStyle.borderTopLeftRadius,
      edgeContrast: ratio(borderColor, cardBg),
    };
  });
  expect(contrast).toBeTruthy();
  expect(contrast!.cardBg).toMatch(/rgb\(255,\s*255,\s*255\)/);
  expect(contrast!.borderWidth).toBe("1px");
  expect(contrast!.borderColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(contrast!.borderRadius).toBe("12px");
  // A hairline the reader cannot see is the bug this whole check exists for.
  expect(contrast!.edgeContrast).toBeGreaterThan(1.2);
}

async function assertReadableAuthenticatedPage(page: Page) {
  const metrics = await page.evaluate(() => {
    const heading = document.querySelector("[data-app-pane] h1");
    const description = document.querySelector(
      "[data-app-pane] [data-page-description]",
    );
    return {
      headingSize: heading
        ? parseFloat(getComputedStyle(heading).fontSize)
        : 0,
      descriptionSize: description
        ? parseFloat(getComputedStyle(description).fontSize)
        : 0,
    };
  });
  expect(metrics.headingSize).toBeGreaterThanOrEqual(24);
  expect(metrics.descriptionSize).toBeGreaterThanOrEqual(13);
}

test("guest travel keeps the public shell", async ({ page }) => {
  await page.goto("/travel");
  await expect(
    page.getByRole("navigation", { name: "Public navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toHaveCount(0);
  await shot(page, "travel-public.png");
});

test("signed-in travel uses the authenticated app shell", async ({ page }) => {
  await persistSession(page, passenger);
  await page.goto("/travel");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Public navigation" }),
  ).toHaveCount(0);
  await assertReadableAuthenticatedPage(page);
  await shot(page, "travel-authenticated.png");
});

test("profile IdentityCard is a paper surface on the app pane", async ({
  page,
}) => {
  await persistSession(page, passenger);
  await page.goto("/account/profile");
  await expect(page.getByRole("heading", { name: "My profile" })).toBeVisible();
  await expect(page.getByText("Ada Lovelace", { exact: true })).toBeVisible();
  await assertCardSitsOnSurface(page);
  await assertReadableAuthenticatedPage(page);
  await shot(page, "profile-cards.png");
});

test("user details IdentityCard is a paper surface on the app pane", async ({
  page,
}) => {
  await page.route("**/api/users/user-1", async (route) => {
    await route.fulfill({
      json: { message: "OK", data: staff },
    });
  });
  await persistSession(page, staff);
  await page.goto("/users/user-1");
  await expect(
    page.getByRole("heading", { name: "User details" }),
  ).toBeVisible();
  await expect(page.getByText("Ada Lovelace", { exact: true })).toBeVisible();
  await assertCardSitsOnSurface(page);
  await assertReadableAuthenticatedPage(page);
  await shot(page, "user-details-cards.png");
});
