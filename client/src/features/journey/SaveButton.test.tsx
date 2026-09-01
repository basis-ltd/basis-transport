import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/states/slices/authSlice";
import SaveButton from "./SaveButton";

vi.mock("sonner", () => ({
  toast: { message: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="path">{`${location.pathname}${location.search}`}</p>;
}

function renderSave(token?: string) {
  const store = configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        token,
        user: token ? { status: "ACTIVE" } : undefined,
        isHydrated: true,
      },
    } as never,
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/travel?from=A"]}>
        <SaveButton
          href="/travel?from=A"
          label="Remera to Downtown"
          kind="journey"
        />
        <LocationProbe />
      </MemoryRouter>
    </Provider>,
  );
}

describe("SaveButton authentication", () => {
  it("sends guests to sign in instead of saving", () => {
    renderSave();
    fireEvent.click(screen.getByRole("button", { name: /save/i }));
    expect(screen.getByTestId("path")).toHaveTextContent(
      "/auth/login?returnTo=%2Ftravel%3Ffrom%3DA",
    );
  });

  it("saves for a signed-in passenger", () => {
    renderSave("session-token");
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(screen.getByRole("button", { name: /saved/i })).toBeInTheDocument();
  });
});
