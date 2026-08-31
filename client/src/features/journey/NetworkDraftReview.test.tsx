import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NetworkDraftReview, {
  createTransferLink,
  parseDraftSnapshot,
  type DraftSnapshot,
  type DraftTransfer,
} from "./NetworkDraftReview";
import TransferReviewEditor from "./TransferReviewEditor";

const data: DraftSnapshot = {
  patterns: [
    {
      stops: [
        { id: "A", coordinates: [30, -1.95] },
        { id: "B", coordinates: [30.001, -1.95] },
      ],
    },
  ],
  transfers: [],
};
const supplied: DraftTransfer = {
  id: "t",
  fromStopId: "A",
  toStopId: "B",
  distanceMeters: 120,
  durationSeconds: 160,
  geometry: [
    [30, -1.95],
    [30.001, -1.95],
  ],
  source: "Synthetic field survey",
  pathKind: "surveyed",
  instructions: ["Follow the synthetic marked crossing."],
  reviewed: false,
};
const expand = (container: HTMLElement) => {
  container.querySelector("details")!.open = true;
};
describe("Staff transfer review", () => {
  it("creates only an unreviewed request, without guessed coordinates or walking metrics", () => {
    const t = createTransferLink(data, "A", "B");
    expect(t).toMatchObject({
      geometry: [],
      distanceMeters: null,
      durationSeconds: null,
      reviewed: false,
      source: "",
      pathKind: "unknown",
    });
    expect(() => createTransferLink(data, "missing", "B")).toThrow(
      "exist in this draft",
    );
    expect(
      parseDraftSnapshot(JSON.stringify({ ...data, transfers: null })),
    ).toBeNull();
    expect(
      parseDraftSnapshot(JSON.stringify({ ...data, transfers: [null] })),
    ).toBeNull();
    expect(
      parseDraftSnapshot(JSON.stringify({ ...data, stopAreas: false })),
    ).toBeNull();
  });
  it("cannot approve an incomplete path or unsaved edits", () => {
    const { container, rerender } = render(
      <TransferReviewEditor
        transfer={createTransferLink(data, "A", "B")}
        readonly={false}
        canReview
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expand(container);
    expect(
      screen.getByRole("button", { name: "Approve saved path" }),
    ).toBeDisabled();
    rerender(
      <TransferReviewEditor
        transfer={supplied}
        readonly={false}
        canReview={false}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onReview={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Approve saved path" }),
    ).toBeDisabled();
  });
  it("submits explicit evidence and surfaces review rejection without a success claim", async () => {
    const review = vi
      .fn()
      .mockRejectedValue(
        new Error("This draft changed. Reload before approving."),
      );
    const { container } = render(
      <TransferReviewEditor
        transfer={supplied}
        readonly={false}
        canReview
        onChange={vi.fn()}
        onRemove={vi.fn()}
        onReview={review}
      />,
    );
    expand(container);
    fireEvent.change(
      screen.getByRole("textbox", { name: "Review evidence URL" }),
      {
        target: { value: "https://example.org/synthetic" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(
        "Review notes, including crossings and access limitations",
      ),
      {
        target: {
          value: "The synthetic marked crossing was inspected for this test.",
        },
      },
    );
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Approve saved path" }));
    await waitFor(() =>
      expect(review).toHaveBeenCalledWith(
        "t",
        expect.objectContaining({
          evidenceUrl: "https://example.org/synthetic",
        }),
      ),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This draft changed",
    );
  });
  it("removes approval when path data is edited", () => {
    const change = vi.fn();
    const { container } = render(
      <TransferReviewEditor
        transfer={{
          ...supplied,
          reviewed: true,
          review: {
            reviewedAt: "2026-08-30",
            reviewerId: "fixture",
            evidenceUrl: "https://example.org/test",
            contentHash: "test",
            notes: "Synthetic fixture only.",
          },
        }}
        readonly={false}
        canReview
        onChange={change}
        onRemove={vi.fn()}
      />,
    );
    expand(container);
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "Walking distance (metres)" }),
      {
        target: { value: "130" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Update path in editor" }),
    );
    expect(change).toHaveBeenCalledWith(
      expect.objectContaining({ distanceMeters: 130, reviewed: false }),
    );
    expect(change.mock.calls[0][0].review).toBeUndefined();
  });
  it("keeps malformed editor data intact and reports unknown stop IDs", () => {
    function Editor() {
      const [editor, setEditor] = useState(JSON.stringify(data));
      return (
        <NetworkDraftReview
          editor={editor}
          readonly={false}
          onChange={setEditor}
        />
      );
    }
    render(<Editor />);
    fireEvent.change(screen.getByLabelText("From stop ID"), {
      target: { value: "missing" },
    });
    fireEvent.change(screen.getByLabelText("To stop ID"), {
      target: { value: "B" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add transfer link" }));
    expect(screen.getByRole("alert")).toHaveTextContent("exist in this draft");
  });
});
