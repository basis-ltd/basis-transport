import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/states/slices/authSlice";
import TravelGuidancePage from "./TravelGuidancePage";

vi.mock("@/containers/navigation/AppLayout", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="authenticated-shell">{children}</div>
  ),
}));
vi.mock("@/features/journey/JourneyShell", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/journey/JourneyShell")>();
  return {
    ...actual,
    default: ({ children }: { children: ReactNode }) => (
      <div data-testid="public-shell">{children}</div>
    ),
  };
});
vi.mock("./components/landing/LandingHeroForm", () => ({
  default: () => <form aria-label="Plan a journey" />,
}));

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

function renderTravel(token?: string) {
  const store = configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        token,
        user: token ? { status: "ACTIVE", name: "Ada" } : undefined,
        isHydrated: true,
      },
    } as never,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/travel"]}>
        <TravelGuidancePage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("TravelGuidancePage shells", () => {
  beforeEach(() => {
    if (!document.getElementById("modal")) {
      const modal = document.createElement("div");
      modal.id = "modal";
      document.body.appendChild(modal);
    }
  });

  it("uses the public journey shell for guests", () => {
    renderTravel();
    expect(screen.getByTestId("public-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("authenticated-shell")).toBeNull();
    expect(
      screen.getByRole("form", { name: "Plan a journey" }),
    ).toBeInTheDocument();
  });

  it("uses the authenticated app shell when a session is present", () => {
    renderTravel("session-token");
    expect(screen.getByTestId("authenticated-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("public-shell")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Your journey, stop by stop" }),
    ).toHaveClass("type-page-title");
  });
});
