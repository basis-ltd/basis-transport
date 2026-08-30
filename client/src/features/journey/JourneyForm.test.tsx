import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LandingHeroForm from "@/pages/common/components/landing/LandingHeroForm";
vi.mock("./places", () => ({ createPlaceSearch: () => async () => [] }));
vi.mock("./api", () => ({
  networkRequest: async () => ({
    rows: [
      {
        id: "A",
        code: "A",
        name: "Kabuga",
        aliases: [],
        coordinates: [30.2, -1.9],
      },
    ],
  }),
}));
describe("Guest journey form", () => {
  it("requires selected locations and never requests location on mount", () => {
    const locate = vi.fn();
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { getCurrentPosition: locate },
    });
    render(<LandingHeroForm onSearch={vi.fn()} />);
    expect(locate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Find a journey" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Select both");
  });
  it("supports keyboard stop selection and swapping endpoints", async () => {
    const onSearch = vi.fn();
    const destination = { name: "Downtown", latitude: -1.94, longitude: 30.06 };
    render(<LandingHeroForm onSearch={onSearch} destination={destination} />);
    const from = screen.getByRole("combobox", { name: "From" });
    fireEvent.focus(from);
    fireEvent.change(from, { target: { value: "Kab" } });
    await screen.findByRole("option", { name: /Kabuga/ });
    fireEvent.keyDown(from, { key: "ArrowDown" });
    fireEvent.keyDown(from, { key: "Enter" });
    await waitFor(() => expect(from).toHaveValue("Kabuga"));
    fireEvent.click(
      screen.getByRole("button", { name: "Swap origin and destination" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Find a journey" }));
    expect(onSearch).toHaveBeenCalledWith(
      destination,
      expect.objectContaining({ stopId: "A", name: "Kabuga" }),
    );
  });
  it("recovers from geolocation denial", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _: unknown,
          reject: (e: { code: number }) => void,
        ) => reject({ code: 1 }),
      },
    });
    render(<LandingHeroForm onSearch={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Use my location for from" }),
    );
    await screen.findByText(
      "Location permission was denied. Search for a stop instead.",
    );
  });
});
