import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import NetworkMapCanvas from "./NetworkMapCanvas";
import type { NetworkMapPattern } from "./types";

const mock = vi.hoisted(() => ({
  map: { fitBounds: vi.fn(), panTo: vi.fn() },
}));
vi.mock("./GoogleMapFrame", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@vis.gl/react-google-maps", () => ({
  Map: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useMap: () => mock.map,
  Marker: ({ title, onClick }: { title: string; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {title}
    </button>
  ),
}));
const pattern: NetworkMapPattern = {
  id: "forward",
  routeId: "1",
  routeNumber: "101",
  routeName: "Fixture",
  agency: "Fixture",
  direction: "0",
  headsign: "B",
  geometry: [
    [30, -1.9],
    [30.1, -1.95],
  ],
  geometryQuality: "source-shape",
  generalized: false,
  stops: [
    { id: "A", code: "A", name: "A", coordinates: [30, -1.9], sequence: 0 },
    { id: "B", code: "B", name: "B", coordinates: [30.1, -1.95], sequence: 1 },
  ],
  stopCount: 2,
  stopsTruncated: false,
};
type DrawnLine = {
  options: Record<string, unknown>;
  click?: () => void;
  setMap: (map: unknown) => void;
};
const lines: DrawnLine[] = [];
const clearListeners = vi.fn();
describe("Network map rendering adapter", () => {
  beforeEach(() => {
    lines.length = 0;
    clearListeners.mockClear();
    mock.map.fitBounds.mockClear();
    mock.map.panTo.mockClear();
    vi.stubGlobal("google", {
      maps: {
        LatLngBounds: class {
          extend() {}
          isEmpty() {
            return false;
          }
        },
        Polyline: class {
          record: DrawnLine;
          constructor(options: Record<string, unknown>) {
            this.record = { options, setMap: vi.fn() };
            lines.push(this.record);
          }
          addListener(_: string, callback: () => void) {
            this.record.click = callback;
          }
          setMap(map: unknown) {
            this.record.setMap(map);
          }
        },
        event: { clearInstanceListeners: clearListeners },
      },
    });
  });
  it("draws source geometry separately from dashed schematics and cleans up overlays", () => {
    const { unmount } = render(
      <NetworkMapCanvas
        patterns={[
          pattern,
          { ...pattern, id: "reverse", geometryQuality: "schematic" },
        ]}
        selectedId="forward"
        selectedSequence={null}
        onSelect={vi.fn()}
        onStop={vi.fn()}
      />,
    );
    expect(lines).toHaveLength(2);
    expect(lines[0].options.path).toEqual([
      { lng: 30, lat: -1.9 },
      { lng: 30.1, lat: -1.95 },
    ]);
    expect(lines[0].options.strokeOpacity).toBe(1);
    expect(lines[1].options.strokeOpacity).toBe(0);
    expect(lines[1].options.icons).toBeDefined();
    unmount();
    expect(clearListeners).toHaveBeenCalledTimes(2);
    lines.forEach((line) => expect(line.setMap).toHaveBeenCalledWith(null));
  });
  it("synchronizes line and stop selection, including the selected occurrence", () => {
    const select = vi.fn(),
      stop = vi.fn();
    render(
      <NetworkMapCanvas
        patterns={[pattern]}
        selectedId="forward"
        selectedSequence={1}
        onSelect={select}
        onStop={stop}
      />,
    );
    lines[0].click?.();
    expect(select).toHaveBeenCalledWith("forward");
    fireEvent.click(screen.getByRole("button", { name: "2. B" }));
    expect(stop).toHaveBeenCalledWith(1);
    expect(mock.map.panTo).toHaveBeenCalledWith({ lat: -1.95, lng: 30.1 });
  });
});
