import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "@/states/slices/authSlice";
import sidebarSlice from "@/states/slices/sidebarSlice";
import AppLayout from "./AppLayout";
import { IdentityCard, PageSection } from "@/components/layout/PageShell";

vi.mock("./Navbar", () => ({
  default: () => <header>Main navigation</header>,
}));
vi.mock("./Sidebar", () => ({
  default: () => <aside>Sidebar</aside>,
}));

function renderPane(children: ReactNode) {
  const store = configureStore({
    reducer: combineReducers({ auth: authSlice, sidebar: sidebarSlice }),
    preloadedState: {
      auth: { isHydrated: true, token: "t", user: { status: "ACTIVE" } },
      sidebar: { desktopExpanded: true, mobileOpen: false },
    } as never,
  });
  return render(
    <Provider store={store}>
      <AppLayout>{children}</AppLayout>
    </Provider>,
  );
}

describe("Authenticated app pane", () => {
  it("sits PageShell cards on --paper, not a nested paper panel", () => {
    const { container } = renderPane(
      <>
        <IdentityCard name="Ada" email="ada@example.com" />
        <PageSection title="Personal information">
          <p>Phone number</p>
        </PageSection>
      </>,
    );
    const pane = container.querySelector("[data-app-pane]")!;
    expect(pane.tagName).toBe("SECTION");
    expect(pane).toHaveClass("bg-(--paper)");
    expect(pane).toHaveClass("min-h-[calc(100vh-var(--navbar-height))]");
    expect(pane).not.toHaveClass("absolute");
    expect(pane).not.toHaveClass("overflow-y-auto");
    expect(pane).not.toHaveClass("card-framed");
    expect(container.firstElementChild).toHaveClass("bg-(--paper)");
    const cards = pane.querySelectorAll("section.card-framed");
    expect(cards.length).toBe(2);
    for (const card of cards) {
      expect(card).toHaveClass("card-framed");
      expect(card.className).not.toMatch(/\bbg-\(--surface\)\b/);
    }
  });
});
