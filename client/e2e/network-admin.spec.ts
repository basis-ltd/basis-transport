import { test, expect } from "@playwright/test";

test("staff supplies a pedestrian path, saves it, then records explicit review evidence", async ({
  page,
}, testInfo) => {
  const t = {
    id: "test-transfer",
    fromStopId: "A",
    toStopId: "B",
    geometry: [],
    distanceMeters: null,
    durationSeconds: null,
    reviewed: false,
    source: "",
    pathKind: "unknown",
    instructions: [],
  };
  const metadata = {
    version: "synthetic-staff-test",
    verification: "historic",
    source: "synthetic",
    sourceUrl: "https://example.org/synthetic",
    rightsStatus: "unclear",
    validFrom: "2019-01-01",
    validTo: "2021-01-01",
  };
  const draft = {
    ...metadata,
    id: "00000000-0000-4000-8000-000000000001",
    status: "draft",
    issues: [],
    rightsEvidence: "",
    verificationEvidence: "",
    snapshotRevision: "a".repeat(64),
    snapshot: {
      patterns: [
        {
          id: "pattern",
          routeId: "1",
          stops: [
            {
              id: "A",
              name: "Alpha",
              code: "A",
              coordinates: [30, -1.95],
              aliases: [],
            },
            {
              id: "B",
              name: "Bravo",
              code: "B",
              coordinates: [30.001, -1.95],
              aliases: [],
            },
          ],
        },
      ],
      transfers: [t],
    },
  };
  let reviewBody: Record<string, unknown> | undefined;
  await page.route(/\/api\/network\/status/, (route) =>
    route.fulfill({
      json: { message: "OK", data: { ...metadata, ready: false } },
    }),
  );
  await page.route(/\/api\/admin\/network\//, async (route) => {
    const url = new URL(route.request().url()),
      method = route.request().method();
    expect(route.request().headers().authorization).toBe(
      "Bearer synthetic-staff-browser-token",
    );
    let data: unknown = draft;
    if (url.pathname.endsWith("/datasets")) data = [draft];
    else if (url.pathname.endsWith("/reports"))
      data = { rows: [], totalCount: 0 };
    else if (url.pathname.endsWith("/comparison"))
      data = {
        report: {
          summary: { addedRoutes: 0, withdrawnRoutes: 0, modifiedRoutes: 0 },
          entries: Array.from({ length: 21 }, (_, i) => ({
            category: "transfer_modified",
            message: `Synthetic change ${i + 1}`,
          })),
        },
      };
    else if (url.pathname.endsWith("/snapshot") && method === "PATCH") {
      draft.snapshot = route.request().postDataJSON();
      draft.snapshotRevision = "b".repeat(64);
    } else if (url.pathname.endsWith("/review") && method === "POST") {
      reviewBody = route.request().postDataJSON();
      expect(reviewBody?.expectedRevision).toBe(draft.snapshotRevision);
      Object.assign(draft.snapshot.transfers[0], {
        reviewed: true,
        review: {
          reviewerId: "synthetic-staff",
          reviewedAt: "2026-08-30T12:00:00Z",
          evidenceUrl: reviewBody?.evidenceUrl,
          notes: reviewBody?.notes,
          contentHash: "c".repeat(64),
        },
      });
      draft.snapshotRevision = "d".repeat(64);
    }
    await route.fulfill({ json: { message: "OK", data } });
  });
  await page.goto("/");
  await page.evaluate(async () => {
    const path = "/src/states/authSession.ts";
    const { persistAuthSession } = await import(/* @vite-ignore */ path);
    await persistAuthSession({
      token: "synthetic-staff-browser-token",
      user: {
        id: "synthetic-staff",
        name: "Synthetic reviewer",
        isProfileComplete: true,
        userRoles: [{ role: { name: "ADMIN" } }],
      },
    });
  });
  await page.goto("/admin/network");
  await page.getByRole("button", { name: "Inspect", exact: true }).click();
  const transfer = page.locator(".journey-transfer-review");
  await transfer.locator("summary").click();
  await expect(
    transfer.getByRole("button", { name: "Approve saved path" }),
  ).toBeDisabled();
  await transfer
    .getByRole("spinbutton", { name: "Walking distance (metres)" })
    .fill("120");
  await transfer
    .getByRole("spinbutton", { name: "Walking duration (seconds)" })
    .fill("160");
  await transfer
    .getByRole("combobox", { name: "Pedestrian path source" })
    .selectOption("surveyed");
  await transfer
    .getByRole("textbox", { name: "Path source reference" })
    .fill("Synthetic test survey, not actual field evidence");
  await transfer
    .getByLabel("Pedestrian path coordinates [longitude, latitude]", {
      exact: true,
    })
    .fill("[[30,-1.95],[30.001,-1.95]]");
  await transfer
    .getByLabel("Walking and crossing instructions (one per line)")
    .fill("Use the marked synthetic crossing to Bravo.");
  await transfer.getByRole("button", { name: "Update path in editor" }).click();
  if ((await transfer.getAttribute("open")) === null)
    await transfer.locator("summary").click();
  await expect(
    transfer.getByRole("button", { name: "Approve saved path" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Validate and save draft" }).click();
  await expect(page.getByText("Changes saved.", { exact: true })).toBeVisible();
  if ((await transfer.getAttribute("open")) === null)
    await transfer.locator("summary").click();
  await expect(
    transfer.getByRole("button", { name: "Approve saved path" }),
  ).toBeEnabled();
  await transfer
    .getByRole("textbox", { name: "Review evidence URL" })
    .fill("https://example.org/synthetic-pedestrian-evidence");
  await transfer
    .getByLabel("Review notes, including crossings and access limitations")
    .fill(
      "Synthetic browser fixture only; confirms the explicit evidence workflow.",
    );
  await transfer.getByRole("checkbox").check();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("staff-transfer-review.png"),
    fullPage: true,
    animations: "disabled",
  });
  await transfer.getByRole("button", { name: "Approve saved path" }).click();
  await expect(
    page.getByText("Approved pedestrian path", { exact: true }),
  ).toBeVisible();
  expect(reviewBody?.confirm).toBe(true);
  expect(reviewBody).not.toHaveProperty("reviewerId");
  await page.getByRole("button", { name: /Show next 1 changes/ }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Synthetic change 21" }),
  ).toBeVisible();
});
