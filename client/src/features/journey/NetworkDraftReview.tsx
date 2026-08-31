import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { useState } from "react";
import TransferReviewEditor from "./TransferReviewEditor";

export interface DraftTransfer {
  id: string;
  fromStopId: string;
  toStopId: string;
  distanceMeters: number | null;
  durationSeconds: number | null;
  geometry: [number, number][];
  reviewed: boolean;
  source: string;
  pathKind?: "surveyed" | "pedestrian-provider" | "unknown";
  instructions?: string[];
  review?: {
    reviewerId: string;
    reviewedAt: string;
    evidenceUrl: string;
    notes: string;
    contentHash: string;
  };
}

export interface DraftStopArea {
  id: string;
  name: string;
  aliases: string[];
  coordinates: [number, number];
  boardingPointIds: string[];
}

export interface DraftSnapshot {
  patterns: unknown[];
  transfers: DraftTransfer[];
  stopAreas?: DraftStopArea[];
}

export function parseDraftSnapshot(editor: string): DraftSnapshot | null {
  try {
    const parsed = JSON.parse(editor) as DraftSnapshot;
    if (
      !parsed ||
      !Array.isArray(parsed.patterns) ||
      !Array.isArray(parsed.transfers) ||
      (parsed.stopAreas !== undefined && !Array.isArray(parsed.stopAreas))
    )
      return null;
    if (
      parsed.patterns.some(
        (p) =>
          !p ||
          typeof p !== "object" ||
          !Array.isArray((p as { stops?: unknown }).stops),
      ) ||
      parsed.transfers.some(
        (t) =>
          !t ||
          typeof t.id !== "string" ||
          typeof t.fromStopId !== "string" ||
          typeof t.toStopId !== "string" ||
          typeof t.source !== "string" ||
          typeof t.reviewed !== "boolean" ||
          !Array.isArray(t.geometry) ||
          (t.distanceMeters !== null && !Number.isFinite(t.distanceMeters)) ||
          (t.durationSeconds !== null && !Number.isFinite(t.durationSeconds)) ||
          (t.instructions !== undefined &&
            (!Array.isArray(t.instructions) ||
              t.instructions.some((v) => typeof v !== "string"))) ||
          (t.review !== undefined &&
            (!t.review ||
              typeof t.review.notes !== "string" ||
              typeof t.review.reviewedAt !== "string" ||
              typeof t.review.evidenceUrl !== "string" ||
              !t.review.evidenceUrl.startsWith("https://"))),
      ) ||
      parsed.stopAreas?.some(
        (a) =>
          !a ||
          typeof a.id !== "string" ||
          typeof a.name !== "string" ||
          !Array.isArray(a.boardingPointIds) ||
          a.boardingPointIds.some((id) => typeof id !== "string"),
      )
    )
      return null;
    return parsed;
  } catch {
    return null;
  }
}

export function stringifyDraftSnapshot(snapshot: DraftSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

function stopCoordinates(
  snapshot: DraftSnapshot,
  stopId: string,
): [number, number] | null {
  for (const pattern of snapshot.patterns as {
    stops?: { id: string; coordinates: [number, number] }[];
  }[]) {
    const stop = pattern.stops?.find((s) => s && s.id === stopId);
    if (stop) return stop.coordinates;
  }
  return null;
}

export function createTransferLink(
  snapshot: DraftSnapshot,
  fromStopId: string,
  toStopId: string,
): DraftTransfer {
  const from = stopCoordinates(snapshot, fromStopId);
  const to = stopCoordinates(snapshot, toStopId);
  if (!from || !to || fromStopId === toStopId)
    throw new Error("Choose two distinct stop IDs that exist in this draft.");
  return {
    id: crypto.randomUUID(),
    fromStopId,
    toStopId,
    distanceMeters: null,
    durationSeconds: null,
    geometry: [],
    reviewed: false,
    source: "",
    pathKind: "unknown",
    instructions: [],
  };
}

export default function NetworkDraftReview({
  editor,
  readonly,
  onChange,
  canReview = false,
  onReview,
}: {
  editor: string;
  readonly: boolean;
  onChange: (next: string) => void;
  canReview?: boolean;
  onReview?: (
    id: string,
    evidence: { evidenceUrl: string; notes: string },
  ) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const snapshot = parseDraftSnapshot(editor);
  if (!snapshot) {
    return (
      <p className="journey-error" role="alert">
        Snapshot JSON is invalid. Fix the editor below before using structured
        review tools.
      </p>
    );
  }

  const update = (next: DraftSnapshot) =>
    onChange(stringifyDraftSnapshot(next));

  const removeTransfer = (id: string) => {
    try {
      update({
        ...snapshot,
        transfers: snapshot.transfers.filter((t) => t.id !== id),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const addTransfer = (fromStopId: string, toStopId: string) => {
    if (!fromStopId.trim() || !toStopId.trim() || fromStopId === toStopId)
      return;
    setError("");
    try {
      update({
        ...snapshot,
        transfers: [
          ...snapshot.transfers,
          createTransferLink(snapshot, fromStopId.trim(), toStopId.trim()),
        ],
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const addStopArea = (name: string, boardingPointIds: string) => {
    const ids = boardingPointIds
      .split(/[,\s]+/)
      .map((id) => id.trim())
      .filter(Boolean);
    if (!name.trim() || !ids.length) return;
    const anchor = stopCoordinates(snapshot, ids[0]);
    if (
      !anchor ||
      ids.some((id) => !stopCoordinates(snapshot, id)) ||
      new Set(ids).size !== ids.length ||
      snapshot.stopAreas?.some((a) =>
        a.boardingPointIds.some((id) => ids.includes(id)),
      )
    ) {
      setError(
        "Choose existing, distinct boarding points not already assigned to a terminal.",
      );
      return;
    }
    setError("");
    update({
      ...snapshot,
      stopAreas: [
        ...(snapshot.stopAreas ?? []),
        {
          id: `AREA_${crypto.randomUUID()}`,
          name: name.trim(),
          aliases: [],
          coordinates: anchor,
          boardingPointIds: ids,
        },
      ],
    });
  };

  const removeStopArea = (id: string) => {
    update({
      ...snapshot,
      stopAreas: (snapshot.stopAreas ?? []).filter((a) => a.id !== id),
      patterns: snapshot.patterns.map((p) => {
        const pattern = p as { stops: { stopAreaId?: string }[] };
        return {
          ...pattern,
          stops: pattern.stops.map((s) =>
            s.stopAreaId === id ? { ...s, stopAreaId: undefined } : s,
          ),
        };
      }),
    });
  };

  return (
    <div className="journey-admin-review">
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      <section>
        <h3>Transfer links</h3>
        <p className="journey-field-hint">
          Reviewed pedestrian links between distinct boarding points. Proximity
          alone never creates a transfer.
        </p>
        {snapshot.transfers.length === 0 && (
          <p className="journey-field-hint">No transfer links in this draft.</p>
        )}
        <div className="journey-transfer-reviews">
          {snapshot.transfers.map((t) => (
            <TransferReviewEditor
              key={t.id + JSON.stringify(t)}
              transfer={t}
              readonly={readonly}
              canReview={canReview}
              onReview={onReview}
              onChange={(next) =>
                update({
                  ...snapshot,
                  transfers: snapshot.transfers.map((old) =>
                    old.id === t.id ? next : old,
                  ),
                })
              }
              onRemove={() => removeTransfer(t.id)}
            />
          ))}
        </div>
        {!readonly && (
          <form
            className="journey-admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              addTransfer(
                String(data.get("fromStopId") || ""),
                String(data.get("toStopId") || ""),
              );
              e.currentTarget.reset();
            }}
          >
            <Input
              name="fromStopId"
              label="From stop ID"
              placeholder="REMERA_111"
            />
            <Input
              name="toStopId"
              label="To stop ID"
              placeholder="REMERA_101"
            />
            <Button type="submit">Add transfer link</Button>
          </form>
        )}
      </section>

      <section>
        <h3>Stop areas</h3>
        <p className="journey-field-hint">
          Terminals group multiple boarding points. Passengers can search by
          terminal name during planning.
        </p>
        {(snapshot.stopAreas ?? []).length === 0 && (
          <p className="journey-field-hint">No stop areas in this draft.</p>
        )}
        <ul className="journey-admin-table">
          {(snapshot.stopAreas ?? []).map((area) => (
            <li key={area.id}>
              <span>
                {area.name} ({area.id}) · {area.boardingPointIds.join(", ")}
              </span>
              {!readonly && (
                <Button type="button" onClick={() => removeStopArea(area.id)}>
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
        {!readonly && (
          <form
            className="journey-admin-form"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              addStopArea(
                String(data.get("areaName") || ""),
                String(data.get("boardingPoints") || ""),
              );
              e.currentTarget.reset();
            }}
          >
            <Input
              name="areaName"
              label="Terminal name"
              placeholder="Remera Taxi Park"
            />
            <Input
              name="boardingPoints"
              label="Boarding point stop IDs"
              placeholder="REMERA_111, REMERA_101"
            />
            <Button type="submit">Add stop area</Button>
          </form>
        )}
      </section>
    </div>
  );
}
