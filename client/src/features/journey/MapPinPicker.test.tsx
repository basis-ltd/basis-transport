import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import MapPinPicker, { parsePin } from "./MapPinPicker";

const maps = vi.hoisted(() => ({ status: "LOADED" }));
vi.mock("@/constants/environment.constants", () => ({
  environment: { googleMapsApiKey: "unit-test-not-a-real-key" },
}));
vi.mock("@vis.gl/react-google-maps", () => ({
  APILoadingStatus: {
    LOADED: "LOADED",
    FAILED: "FAILED",
    AUTH_FAILURE: "AUTH_FAILURE",
  },
  useApiLoadingStatus: () => maps.status,
  APIProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Map: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick: (e: unknown) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onClick({ detail: { latLng: { lat: -1.95, lng: 30.1 } } })
        }
      >
        Test map point
      </button>
      {children}
    </div>
  ),
  Marker: () => <span>Selected pin marker</span>,
  useMap: () => ({
    getCenter: () => ({ toJSON: () => ({ lat: -1.96, lng: 30.11 }) }),
  }),
}));

describe("Explicit map pin selection", () => {
  beforeEach(() => {
    maps.status = "LOADED";
  });
  it("never treats a blank coordinate or the default map center as a selection", () => {
    const choose = vi.fn();
    render(<MapPinPicker label="From" onChoose={choose} onClose={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("No point selected");
    fireEvent.click(screen.getByRole("button", { name: "Use this location" }));
    expect(choose).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a latitude");
    for (const [lat, lng] of [
      ["", "0"],
      [" ", "0"],
      ["91", "30"],
      ["-1", "181"],
      ["NaN", "30"],
      ["1", "Infinity"],
    ])
      expect(parsePin(lat, lng)).toBeNull();
    expect(parsePin("0", "0")).toEqual({ lat: 0, lng: 0 });
  });
  it("requires confirmation after a map click and does not reuse an old stop identity", () => {
    const choose = vi.fn();
    render(
      <MapPinPicker
        label="From"
        value={{
          stopId: "old",
          name: "Old platform",
          latitude: -1.9,
          longitude: 30,
        }}
        onChoose={choose}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Test map point" }));
    expect(choose).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText("Location label (optional)"), {
      target: { value: "Entrance" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Use this location" }));
    expect(choose).toHaveBeenCalledWith({
      name: "Entrance",
      latitude: -1.95,
      longitude: 30.1,
    });
  });
  it("supports explicit keyboard-center selection and cancelling edits", () => {
    const choose = vi.fn(),
      close = vi.fn();
    render(<MapPinPicker label="To" onChoose={choose} onClose={close} />);
    fireEvent.click(screen.getByRole("button", { name: "Use map center" }));
    expect(screen.getByLabelText("Latitude")).toHaveValue("-1.96");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(close).toHaveBeenCalledOnce();
    expect(choose).not.toHaveBeenCalled();
  });
  it("keeps coordinate input usable after a provider authentication failure", () => {
    maps.status = "AUTH_FAILURE";
    const choose = vi.fn();
    render(<MapPinPicker label="To" onChoose={choose} onClose={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: "Map unavailable" }),
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("Latitude"), {
      target: { value: "-1.94" },
    });
    fireEvent.change(screen.getByLabelText("Longitude"), {
      target: { value: "30.06" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Use this location" }));
    expect(choose).toHaveBeenCalledWith({
      name: "Map pin (-1.94000, 30.06000)",
      latitude: -1.94,
      longitude: 30.06,
    });
  });
});
