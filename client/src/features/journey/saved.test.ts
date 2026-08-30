import { describe, it, expect, vi } from "vitest";
import { saveItem, removeSavedItem } from "./saved";
describe("Device favorites", () => {
  it("persists only explicit saves and deduplicates", () => {
    expect(localStorage.getItem("basis.saved.v1")).toBeNull();
    const item = {
      key: "test",
      label: "Kabuga",
      href: "/stops/A",
      kind: "stop" as const,
    };
    saveItem(item);
    saveItem(item);
    expect(JSON.parse(localStorage.getItem("basis.saved.v1")!)).toHaveLength(1);
    removeSavedItem("test");
    expect(JSON.parse(localStorage.getItem("basis.saved.v1")!)).toEqual([]);
  });
  it("reports unavailable storage rather than claiming a successful save", () => {
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() =>
      saveItem({ key: "a", label: "A", href: "/stops/A", kind: "stop" }),
    ).toThrow("cannot save favorites");
    spy.mockRestore();
  });
});
