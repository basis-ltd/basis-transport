import { describe, it, expect, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { reverseGeocodeLocation } from "./places";
import LandingHeroForm from "@/pages/common/components/landing/LandingHeroForm";
vi.mock("./places", () => ({
  createPlaceSearch: () => async () => [],
  reverseGeocodeLocation: vi.fn(),
}));
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
  const gps = { latitude: -1.958855, longitude: 30.119324 };
  const mockGps = () =>
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: vi.fn((success) => success({ coords: gps })),
      },
    });
  it("labels the selected current location with its address in the hero input", async () => {
    mockGps();
    vi.mocked(reverseGeocodeLocation).mockResolvedValue({
      ...gps,
      name: "KG 11 Ave, Kigali, Rwanda",
    });
    const onSearch = vi.fn();
    const destination = { name: "Downtown", latitude: -1.94, longitude: 30.06 };
    render(
      <LandingHeroForm
        variant="hero"
        onSearch={onSearch}
        destination={destination}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Use my location for from" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "From" })).toHaveValue(
        "KG 11 Ave, Kigali, Rwanda",
      ),
    );
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Find a journey" }));
    expect(onSearch).toHaveBeenCalledWith(
      { ...gps, name: "KG 11 Ave, Kigali, Rwanda" },
      destination,
    );
  });
  it("keeps the location usable with a coordinate label when address lookup fails", async () => {
    mockGps();
    vi.mocked(reverseGeocodeLocation).mockRejectedValue(
      new Error("Provider unavailable"),
    );
    render(<LandingHeroForm onSearch={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Use my location for from" }),
    );
    await screen.findByText(/its address could not be loaded/);
    expect(screen.getByRole("combobox", { name: "From" })).toHaveValue(
      "-1.95886, 30.11932",
    );
  });
  it("never overwrites an edited input with a late address response", async () => {
    mockGps();
    let resolve!: (p: typeof gps & { name: string }) => void;
    vi.mocked(reverseGeocodeLocation).mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    render(<LandingHeroForm onSearch={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Use my location for from" }),
    );
    await waitFor(() => expect(resolve).toBeDefined());
    fireEvent.change(screen.getByRole("combobox", { name: "From" }), {
      target: { value: "Remera" },
    });
    await act(async () => resolve({ ...gps, name: "Late address" }));
    expect(screen.getByRole("combobox", { name: "From" })).toHaveValue(
      "Remera",
    );
  });
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
    const onLocationsChange = vi.fn();
    const destination = { name: "Downtown", latitude: -1.94, longitude: 30.06 };
    render(
      <LandingHeroForm
        onSearch={onSearch}
        onLocationsChange={onLocationsChange}
        destination={destination}
      />,
    );
    const from = screen.getByRole("combobox", { name: "From" });
    fireEvent.focus(from);
    fireEvent.change(from, { target: { value: "Kab" } });
    await screen.findByRole("option", { name: /Kabuga/ });
    fireEvent.keyDown(from, { key: "ArrowDown" });
    fireEvent.keyDown(from, { key: "Enter" });
    await waitFor(() => expect(from).toHaveValue("Kabuga"));
    expect(onLocationsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ stopId: "A" }),
      destination,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Swap origin and destination" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Find a journey" }));
    expect(onSearch).toHaveBeenCalledWith(
      destination,
      expect.objectContaining({ stopId: "A", name: "Kabuga" }),
    );
    expect(onLocationsChange).toHaveBeenLastCalledWith(
      destination,
      expect.objectContaining({ stopId: "A" }),
    );
    fireEvent.change(screen.getByRole("combobox", { name: "From" }), {
      target: { value: "New starting point" },
    });
    expect(onLocationsChange).toHaveBeenLastCalledWith(
      undefined,
      expect.objectContaining({ stopId: "A" }),
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
