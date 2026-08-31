import { test, expect } from "@playwright/test";

test("boarding point and translated source details work with keyboard and narrow viewports", async ({
  page,
}, testInfo) => {
  await page.goto("/e2e/fixtures/stop-identity.html");
  await expect(page.getByText("Boarding point 2")).toBeVisible();
  const summary = page
    .locator("summary")
    .filter({ hasText: "Stop names and source" });
  await summary.focus();
  await summary.press("Enter");
  await expect(page.getByText("Quai deux")).toBeVisible();
  await expect(page.getByText("Quai deux")).toHaveAttribute("lang", "fr");
  await expect(page.getByText(/Source record:/)).toContainText(
    "not current service verification",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("stop-identity.png"),
    fullPage: true,
  });
});
