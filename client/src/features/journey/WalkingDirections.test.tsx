import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WalkingDirections from "./WalkingDirections";
import type { WalkLeg } from "./types";

describe("Walking navigation handoff", () => {
  it("opens walking mode with the actual endpoints without inventing a path or time", () => {
    const leg: WalkLeg = {
      kind: "walk",
      from: { name: "Entrance", coordinates: [30.061, -1.951] },
      to: { name: "Boarding stop", stopId: "A", coordinates: [30.06, -1.95] },
      quality: "unverified-access",
      distanceMeters: 157,
      durationSeconds: null,
      geometry: [],
      instructions: ["Walk to Boarding stop."],
    };
    render(<WalkingDirections leg={leg} />);
    const link = screen.getByRole("link", {
      name: /Open walking navigation to Boarding stop/,
    });
    const url = new URL(link.getAttribute("href")!);
    expect(url.searchParams.get("origin")).toBe("-1.951,30.061");
    expect(url.searchParams.get("destination")).toBe("-1.95,30.06");
    expect(url.searchParams.get("travelmode")).toBe("walking");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText(/Walking path not checked/)).toHaveTextContent(
      "time is unknown",
    );
    expect(
      screen.queryByText(/Google Maps · walking directions/),
    ).not.toBeInTheDocument();
  });
});
