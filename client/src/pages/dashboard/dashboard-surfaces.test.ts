import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const illegible = /\bfont-light\b|\btext-\[(?:10|11|12)px\]\b/;

describe("Signed-in dashboard surfaces", () => {
  it("has no page files under pages/dashboard (route redirects to /saved)", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const files = readdirSync(dir).filter((name) => name.endsWith(".tsx"));
    expect(files).toEqual([]);
  });

  it("does not leave undersized light text on authenticated pages", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const files = [
      "pages/common/SavedJourneysPage.tsx",
      "pages/profile/UserProfilePage.tsx",
      "pages/users/UsersPage.tsx",
      "pages/users/UserDetailsPage.tsx",
      "pages/users/CreateUserPage.tsx",
      "pages/common/NetworkAdminPage.tsx",
      "components/layout/PageShell.tsx",
      "containers/navigation/AppLayout.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source, file).not.toMatch(illegible);
    }
  });
});
