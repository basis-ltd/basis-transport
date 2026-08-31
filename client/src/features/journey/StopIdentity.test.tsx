import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StopIdentity from "./StopIdentity";
import type { NetworkStop } from "./types";
const stop: NetworkStop = {
  id: "A",
  code: "A",
  name: "Central",
  coordinates: [30, -1.95],
  aliases: [],
};
describe("Stop identity", () => {
  it("shows a precise boarding point and labels imported names without a verification claim", () => {
    const { container } = render(
      <StopIdentity
        stop={{
          ...stop,
          platformCode: "2",
          displayNames: { fr: "Quai deux", rw: "Ahantu" },
          sourceRecord: {
            namespace: "synthetic",
            file: "stops.txt",
            recordId: "A",
          },
        }}
      />,
    );
    expect(screen.getByText("Boarding point 2")).toBeInTheDocument();
    container.querySelector("details")!.open = true;
    expect(screen.getByText("Quai deux")).toHaveAttribute("lang", "fr");
    expect(screen.getByText(/Source record/)).toHaveTextContent(
      "not current service verification",
    );
  });
  it("does not invent platform codes or alternate names for older snapshots", () => {
    const { container } = render(<StopIdentity stop={stop} />);
    expect(container).toBeEmptyDOMElement();
  });
});
