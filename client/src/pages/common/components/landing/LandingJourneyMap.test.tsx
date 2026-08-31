import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import LandingJourneyMap from "./LandingJourneyMap";
import { approximateKigaliPoint } from "@/features/journey/kigali-view";

const maps = vi.hoisted(() => ({
  map: { fitBounds: vi.fn(), setCenter: vi.fn(), setZoom: vi.fn() },
}));
vi.mock("@/features/journey/kigali-view", async (original) => ({
  ...(await original<typeof import("@/features/journey/kigali-view")>()),
  approximateKigaliPoint: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/features/journey/GoogleMapFrame", () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@vis.gl/react-google-maps", () => ({
  Map: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMap: () => maps.map,
  Marker: ({
    title,
    position,
  }: {
    title: string;
    position: { lat: number; lng: number };
  }) => (
    <span
      role="img"
      aria-label={title}
      data-lat={position.lat}
      data-lng={position.lng}
    />
  ),
}));
const origin = { name: "Remera", latitude: -1.959, longitude: 30.12 };
const destination = { name: "Downtown", latitude: -1.944, longitude: 30.057 };
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(approximateKigaliPoint).mockResolvedValue(null);
  vi.stubGlobal("google", {
    maps: {
      SymbolPath: { CIRCLE: 0 },
      LatLngBounds: class {
        points: unknown[] = [];
        extend(p: unknown) {
          this.points.push(p);
        }
      },
    },
  });
});
describe("Landing map view and selection", () => {
  it("centers an IP hint without claiming it as a selected origin", async () => {
    vi.mocked(approximateKigaliPoint).mockResolvedValue({
      lat: -1.95,
      lng: 30.09,
    });
    render(<LandingJourneyMap />);
    await screen.findByText("Near you · approximate");
    expect(maps.map.setCenter).toHaveBeenLastCalledWith({
      lat: -1.95,
      lng: 30.09,
    });
    expect(
      screen.queryByRole("img", { name: /From:/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Choose your starting point")).toBeVisible();
  });
  it("plots both endpoints, fits them, and removes cleared markers", async () => {
    const view = render(<LandingJourneyMap origin={origin} />);
    await waitFor(() => expect(approximateKigaliPoint).toHaveBeenCalled());
    expect(screen.getByRole("img", { name: "From: Remera" })).toHaveAttribute(
      "data-lat",
      "-1.959",
    );
    view.rerender(
      <LandingJourneyMap origin={origin} destination={destination} />,
    );
    expect(screen.getByRole("img", { name: "To: Downtown" })).toHaveAttribute(
      "data-lng",
      "30.057",
    );
    expect(maps.map.fitBounds).toHaveBeenLastCalledWith(
      expect.objectContaining({
        points: [
          { lat: origin.latitude, lng: origin.longitude },
          { lat: destination.latitude, lng: destination.longitude },
        ],
      }),
      64,
    );
    view.rerender(<LandingJourneyMap destination={origin} />);
    expect(
      screen.queryByRole("img", { name: /From:/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "To: Remera" })).toBeVisible();
    expect(maps.map.setCenter).toHaveBeenLastCalledWith({
      lat: origin.latitude,
      lng: origin.longitude,
    });
  });
  it("never lets a late IP result move the map away from selected endpoints", async () => {
    let resolve!: (point: { lat: number; lng: number }) => void;
    vi.mocked(approximateKigaliPoint).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    render(<LandingJourneyMap origin={origin} destination={destination} />);
    await act(async () => resolve({ lat: -1.95, lng: 30.09 }));
    expect(maps.map.setCenter).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "From: Remera" })).toBeVisible();
    expect(screen.getByRole("img", { name: "To: Downtown" })).toBeVisible();
  });
  it("refits selected endpoints after a viewport resize and disconnects on unmount", async () => {
    let resize!: () => void;
    const disconnect = vi.fn();
    Object.assign(maps.map, { getDiv: () => document.createElement("div") });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );
    const view = render(
      <LandingJourneyMap origin={origin} destination={destination} />,
    );
    await act(async () => {});
    maps.map.fitBounds.mockClear();
    act(() => resize());
    expect(maps.map.fitBounds).toHaveBeenCalledOnce();
    view.unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    vi.stubGlobal("ResizeObserver", undefined);
  });
});
