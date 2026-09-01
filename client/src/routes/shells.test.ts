import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

describe("Public vs authenticated shells", () => {
  it("keeps guest planning public and wraps personalized routes in auth/staff outlets", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.tsx"),
      "utf8",
    );
    expect(source).toMatch(/path="\/travel" element=\{<Travel/);
    expect(source).toMatch(/path="\/routes" element=\{<Directory/);
    expect(source).toMatch(
      /<Route element=\{<AuthenticatedRoutes \/>\}>[\s\S]*path="\/saved"[\s\S]*StaffRoutes[\s\S]*path="\/admin\/network"/,
    );
    expect(source).not.toMatch(
      /path="\/stops\/:id"[\s\S]*path="\/saved"[\s\S]*path="\/contact"/,
    );
    const travel = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        "../pages/common/TravelGuidancePage.tsx",
      ),
      "utf8",
    );
    expect(travel).toMatch(/signedIn/);
    expect(travel).toMatch(/<AppLayout>/);
    expect(travel).toMatch(/<JourneyShell/);
    const layout = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        "../containers/navigation/AppLayout.tsx",
      ),
      "utf8",
    );
    expect(layout).toMatch(/data-app-pane/);
    expect(layout).toMatch(/bg-\(--surface\)/);
    expect(layout).not.toMatch(/card-framed/);
  });
});
