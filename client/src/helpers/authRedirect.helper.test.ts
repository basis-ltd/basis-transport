import { describe, expect, it } from "vitest";
import { isSafeReturnTo, loginUrl } from "./authRedirect.helper";

describe("login return paths", () => {
  it("allows personalization and planning return URLs", () => {
    expect(isSafeReturnTo("/saved")).toBe(true);
    expect(isSafeReturnTo("/travel?originStopId=A")).toBe(true);
    expect(isSafeReturnTo("/admin/network")).toBe(true);
    expect(loginUrl("/saved")).toBe("/auth/login?returnTo=%2Fsaved");
  });

  it("rejects open redirects", () => {
    expect(isSafeReturnTo("https://evil.example")).toBe(false);
    expect(isSafeReturnTo("//evil.example")).toBe(false);
    expect(isSafeReturnTo("/auth/login")).toBe(false);
    expect(loginUrl("//evil")).toBe("/auth/login");
  });
});
