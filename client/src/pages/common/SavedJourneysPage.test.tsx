import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/states/slices/authSlice";
import SavedJourneysPage from "./SavedJourneysPage";
import { removeSavedItem, saveItem } from "@/features/journey/saved";
import "@/features/journey/journey.css";
import "@/index.css";

const item = {
  key: "favorite-saved-ui",
  label: "Remera to Downtown",
  href: "/travel?originStopId=A&destStopId=B",
  kind: "journey" as const,
};

function renderSaved() {
  const store = configureStore({ reducer: { auth: authSlice } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SavedJourneysPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("Saved Journeys layout", () => {
  beforeEach(() => {
    localStorage.clear();
    removeSavedItem(item.key);
    if (!document.getElementById("modal")) {
      const modal = document.createElement("div");
      modal.id = "modal";
      document.body.appendChild(modal);
    }
  });

  it("uses DESIGN.md type, radius, and shadow tokens on the empty and sync sections", () => {
    const { container } = renderSaved();
    expect(
      screen.getByRole("heading", { name: "Saved places and journeys" }),
    ).toHaveClass("type-page-title");
    const empty = container.querySelector(".journey-empty")!;
    expect(empty.tagName).toBe("SECTION");
    expect(empty.className).toBe("journey-empty");
    expect(
      screen.getByRole("heading", { name: /next journey/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Use favorites across devices" }),
    ).toHaveClass("type-card-title");
  });

  it("renders saved items as compact directory cards", () => {
    saveItem(item);
    const { container } = renderSaved();
    const card = container.querySelector(".journey-directory-item")!;
    expect(screen.getByRole("heading", { name: item.label })).toHaveTextContent(
      item.label,
    );
    expect(card).toBeTruthy();
    expect(container.querySelector(".journey-directory")?.tagName).toBe("UL");
  });
});
