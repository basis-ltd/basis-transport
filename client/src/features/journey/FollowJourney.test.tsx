import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FollowJourney from "./FollowJourney";
import { loadGuidance } from "./guidance-state";
import type { Journey, PassengerStepKind } from "./types";

vi.mock("./places", () => ({ createPlaceSearch: () => async () => [] }));
vi.mock("./api", () => ({ networkRequest: async () => ({ rows: [] }) }));
const journey: Journey = {
  id: "guidance-test",
  legs: [],
  transfers: 0,
  walkingMeters: 0,
  ridingMeters: 100,
  durationSeconds: null,
  fareRwf: null,
  steps: (["wait", "board", "alight", "arrive"] as PassengerStepKind[]).map(
    (kind, i) => ({
      id: `step-${i}`,
      kind,
      text: `${kind} instruction`,
      legIndex: null,
      confidence: "unknown",
      timing: { status: "unknown", seconds: null, label: null },
      fareAmount: null,
      fareCurrency: null,
      paymentTiming: null,
      paymentInstructions: null,
    }),
  ),
};
function show(onReplanFrom = vi.fn()) {
  return render(
    <MemoryRouter>
      <FollowJourney
        journey={journey}
        datasetVersion="v1"
        onClose={vi.fn()}
        onReplanFrom={onReplanFrom}
      />
    </MemoryRouter>,
  );
}
beforeEach(() => localStorage.clear());
describe("Passenger-controlled guidance", () => {
  it("requires explicit arrival confirmation and allows undo", () => {
    show();
    for (const name of ["At the stop", "Boarded", "Alighted"])
      fireEvent.click(screen.getByRole("button", { name }));
    expect(screen.queryByText("Journey complete.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Arrived" }));
    expect(screen.getByText("Journey complete.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo arrival" }));
    expect(screen.queryByText("Journey complete.")).not.toBeInTheDocument();
  });
  it("resumes progress and undo history, but not against a different dataset", () => {
    const view = show();
    fireEvent.click(screen.getByRole("button", { name: "At the stop" }));
    view.unmount();
    show();
    expect(screen.getByRole("button", { name: "Boarded" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(
      screen.getByRole("button", { name: "At the stop" }),
    ).toBeInTheDocument();
    expect(loadGuidance(journey, "new-dataset")).toBeNull();
  });
  it("does not move progress or fabricate a position after a missed stop", () => {
    const onReplan = vi.fn();
    show(onReplan);
    fireEvent.click(screen.getByRole("button", { name: "Missed my stop" }));
    expect(
      screen.getByRole("button", { name: "At the stop" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Find remaining journey" }),
    ).toBeDisabled();
    expect(onReplan).not.toHaveBeenCalled();
  });
  it("rejects corrupt, negative, expired and mismatched progress", () => {
    show();
    const valid = JSON.parse(localStorage.getItem("basis-journey-guidance")!);
    for (const change of [
      { stepIndex: -1 },
      { stepIds: [] },
      { updatedAt: 0 },
      { history: [999] },
    ]) {
      localStorage.setItem(
        "basis-journey-guidance",
        JSON.stringify({ ...valid, ...change }),
      );
      expect(loadGuidance(journey, "v1")).toBeNull();
    }
  });
  it("stores only identities and manual progress, never provider content or coordinates", () => {
    show();
    const saved = localStorage.getItem("basis-journey-guidance")!;
    expect(saved).not.toMatch(
      /instruction|coordinates|geometry|latitude|longitude/,
    );
    expect(loadGuidance(journey, "v1")?.active).toBe(true);
  });
  it("location suggestions never advance steps and the watcher stops on exit", () => {
    let position: PositionCallback = () => undefined;
    const clearWatch = vi.fn();
    const watchPosition = vi.fn((callback: PositionCallback) => {
      position = callback;
      return 42;
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: { watchPosition, clearWatch },
    });
    const target = {
      name: "Boarding point",
      stopId: "A",
      coordinates: [30, -1.95] as [number, number],
    };
    const guided: Journey = {
      ...journey,
      steps: journey.steps!.map((s) => ({
        ...s,
        location: { name: target.name, stopId: "A" },
      })),
      legs: [
        {
          kind: "walk",
          from: target,
          to: target,
          geometry: [],
          distanceMeters: 0,
          durationSeconds: 0,
          instructions: [],
          quality: "pedestrian-route",
        },
      ],
    };
    const view = render(
      <MemoryRouter>
        <FollowJourney
          journey={guided}
          datasetVersion="geo"
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(watchPosition).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Suggest with location" }),
    );
    act(() =>
      position({
        timestamp: Date.now(),
        coords: { latitude: -1.95, longitude: 30, accuracy: 10 },
      } as GeolocationPosition),
    );
    expect(screen.getByText(/You may be near/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "At the stop" }),
    ).toBeInTheDocument();
    view.unmount();
    expect(clearWatch).toHaveBeenCalledWith(42);
  });
  it("continues manually and discloses when browser storage is unavailable", () => {
    const save = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw Error("disabled");
    });
    show();
    expect(screen.getByText(/Progress cannot be saved/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "At the stop" }));
    expect(screen.getByRole("button", { name: "Boarded" })).toBeInTheDocument();
    save.mockRestore();
  });
});
