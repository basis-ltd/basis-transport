import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LocationSearch from "./LocationSearch";
import { reverseGeocodeLocation } from "./places";
import "./journey.css";

vi.mock("./places", () => ({
  createPlaceSearch: () => async () => [
    {
      id: "place-1",
      label: "Remera Taxi Park",
      select: async () => ({
        name: "Remera Taxi Park",
        latitude: -1.958,
        longitude: 30.119,
        placeId: "place-1",
      }),
    },
  ],
  reverseGeocodeLocation: vi.fn(),
}));
vi.mock("./api", () => ({
  networkRequest: async () => ({ rows: [], totalCount: 0 }),
}));

const gps = { latitude: -1.958855, longitude: 30.119324 };

function mockGps() {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: vi.fn((success: (p: GeolocationPosition) => void) =>
        success({ coords: gps } as GeolocationPosition),
      ),
    },
  });
}

describe("LocationSearch Google Maps attribution", () => {
  it("uses the hero form icons for compact clear and current-location actions", () => {
    const { rerender } = render(
      <LocationSearch label="From" onChange={vi.fn()} />,
    );

    expect(
      screen
        .getByRole("button", { name: "Use my location for from" })
        .querySelector('[data-icon="crosshairs"]'),
    ).toBeTruthy();

    rerender(
      <LocationSearch
        label="From"
        value={{ name: "Remera", latitude: -1.958, longitude: 30.119 }}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen
        .getByRole("button", { name: "Clear from" })
        .querySelector('[data-icon="xmark"]'),
    ).toBeTruthy();
  });

  it("keeps the control row and pin trigger in the same slots when Address by Google Maps is shown", async () => {
    mockGps();
    vi.mocked(reverseGeocodeLocation).mockResolvedValue({
      ...gps,
      name: "KG 11 Ave, Kigali, Rwanda",
    });
    const { container } = render(
      <LocationSearch label="From" onChange={vi.fn()} />,
    );
    const field = container.querySelector(".journey-field")!;
    const pin = screen.getByRole("button", {
      name: "Choose from on map",
    });
    const slotKinds = (root: Element) =>
      [...root.children].map((el) =>
        [...el.classList]
          .filter((name) => name !== "is-idle")
          .sort()
          .join(" "),
      );
    const unlabeledSlots = slotKinds(field);
    expect(unlabeledSlots[0]).toContain("journey-location-search-anchor");
    expect(unlabeledSlots[1]).toContain("journey-google-attribution--overlay");
    expect(unlabeledSlots[2]).toContain("journey-pin-trigger");
    expect(
      field.querySelector(".journey-google-attribution--overlay"),
    ).toHaveClass("is-idle");

    fireEvent.click(
      screen.getByRole("button", { name: "Use my location for from" }),
    );
    await waitFor(() =>
      expect(
        field.querySelector(".journey-google-attribution--overlay.is-idle"),
      ).toBeNull(),
    );

    const attribution = screen.getByText(/Address by/).closest("p")!;
    expect(attribution).toHaveClass("journey-google-attribution--overlay");
    expect(attribution).not.toHaveClass("is-idle");
    expect(pin.previousElementSibling).toBe(attribution);
    expect(slotKinds(field)).toEqual(unlabeledSlots);
    expect(attribution.querySelector("span")).toHaveAttribute(
      "translate",
      "no",
    );
  });

  it("shows Place suggestions by Google Maps inside the suggestion list, not as a new field row", async () => {
    const { container } = render(
      <LocationSearch label="To" onChange={vi.fn()} />,
    );
    const input = screen.getByRole("combobox", { name: "To" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Remera" } });
    const attribution = await screen.findByText(/Place suggestions by/);
    expect(attribution.closest(".journey-suggestions")).toBeTruthy();
    expect(
      container.querySelector(
        ".journey-location-search-anchor > .journey-google-attribution",
      ),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Choose to on map" }).parentElement,
    ).toHaveClass("journey-field");
  });
});
