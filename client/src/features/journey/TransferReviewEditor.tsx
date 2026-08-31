import { useId, useState } from "react";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import { controlClassName } from "@/components/inputs/control";
import type { DraftTransfer } from "./NetworkDraftReview";

export default function TransferReviewEditor({
  transfer: t,
  readonly,
  canReview,
  onChange,
  onRemove,
  onReview,
}: {
  transfer: DraftTransfer;
  readonly: boolean;
  canReview: boolean;
  onChange: (next: DraftTransfer) => void;
  onRemove: () => void;
  onReview?: (
    id: string,
    evidence: { evidenceUrl: string; notes: string },
  ) => Promise<void>;
}) {
  const id = useId();
  const [kind, setKind] = useState(t.pathKind || "unknown"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const ready =
    t.geometry.length >= 2 &&
    t.distanceMeters !== null &&
    t.distanceMeters > 0 &&
    t.durationSeconds !== null &&
    t.durationSeconds > 0 &&
    Boolean(t.source.trim()) &&
    t.pathKind !== "unknown" &&
    Boolean(t.pathKind) &&
    Boolean(t.instructions?.length);
  return (
    <details className="journey-transfer-review">
      <summary>
        <span className="journey-review-path">
          {t.fromStopId} → {t.toStopId}
        </span>
        <span>
          {t.reviewed && t.review
            ? "Approved pedestrian path"
            : "Not approved for routing"}
        </span>
      </summary>
      <p className="journey-field-hint">
        {t.distanceMeters === null
          ? "Distance unknown"
          : `${t.distanceMeters} m`}{" "}
        ·{" "}
        {t.durationSeconds === null
          ? "Duration unknown"
          : `${t.durationSeconds} seconds`}
      </p>
      {t.review && (
        <p className="journey-field-hint">
          Reviewed {t.review.reviewedAt} ·{" "}
          <a href={t.review.evidenceUrl} target="_blank" rel="noreferrer">
            Review evidence
          </a>
          <br />
          {t.review.notes}
        </p>
      )}
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      {!readonly && (
        <>
          <form
            className="journey-transfer-editor"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              const fields = new FormData(event.currentTarget);
              try {
                const geometry: unknown = JSON.parse(
                  String(fields.get("geometry")),
                );
                if (
                  !Array.isArray(geometry) ||
                  geometry.length < 2 ||
                  geometry.length > 1000 ||
                  geometry.some(
                    (p) =>
                      !Array.isArray(p) ||
                      p.length !== 2 ||
                      p.some(
                        (v) => typeof v !== "number" || !Number.isFinite(v),
                      ) ||
                      Math.abs(p[0]) > 180 ||
                      Math.abs(p[1]) > 90,
                  )
                )
                  throw new Error(
                    "Enter 2–1000 valid [longitude, latitude] points for the actual pedestrian path.",
                  );
                const next: DraftTransfer = {
                  ...t,
                  geometry,
                  distanceMeters: Number(fields.get("distance")),
                  durationSeconds: Number(fields.get("duration")),
                  source: String(fields.get("source")).trim(),
                  instructions: String(fields.get("instructions"))
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  pathKind: kind as DraftTransfer["pathKind"],
                  reviewed: false,
                };
                delete next.review;
                onChange(next);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <p className="journey-field-hint">
              Use a field survey or a source licensed for storage. Do not paste
              temporary Google directions. Saving edits removes any previous
              approval.
            </p>
            <div className="journey-transfer-grid">
              <Input
                label="Walking distance (metres)"
                name="distance"
                type="number"
                min={1}
                max={400}
                required
                defaultValue={
                  t.distanceMeters === null ? "" : String(t.distanceMeters)
                }
              />
              <Input
                label="Walking duration (seconds)"
                name="duration"
                type="number"
                min={1}
                max={14400}
                required
                defaultValue={
                  t.durationSeconds === null ? "" : String(t.durationSeconds)
                }
              />
            </div>
            <label htmlFor={`${id}-source-kind`}>Pedestrian path source</label>
            <select
              id={`${id}-source-kind`}
              className={controlClassName}
              value={kind}
              onChange={(event) => setKind(event.target.value as typeof kind)}
            >
              <option value="unknown">Not supplied</option>
              <option value="surveyed">Field-surveyed path</option>
              <option value="pedestrian-provider">
                Licensed pedestrian source
              </option>
            </select>
            <Input
              label="Path source reference"
              name="source"
              maxLength={2000}
              required
              defaultValue={t.source}
            />
            <label htmlFor={`${id}-geometry`}>
              Pedestrian path coordinates [longitude, latitude]
            </label>
            <textarea
              id={`${id}-geometry`}
              name="geometry"
              rows={4}
              required
              defaultValue={JSON.stringify(t.geometry)}
              maxLength={60000}
            />
            <label htmlFor={`${id}-instructions`}>
              Walking and crossing instructions (one per line)
            </label>
            <textarea
              id={`${id}-instructions`}
              name="instructions"
              rows={3}
              required
              maxLength={10000}
              defaultValue={t.instructions?.join("\n") || ""}
            />
            <Button type="submit">Update path in editor</Button>
          </form>
          {!t.reviewed && (
            <form
              className="journey-transfer-editor"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canReview || !ready || !onReview) return;
                const fields = new FormData(event.currentTarget);
                setBusy(true);
                setError("");
                try {
                  await onReview(t.id, {
                    evidenceUrl: String(fields.get("evidenceUrl")),
                    notes: String(fields.get("notes")),
                  });
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <h4>Approve the saved pedestrian path</h4>
              <p className="journey-field-hint">
                Inspect the path, crossings, boarding points and source rights
                first. Your account and review time will be recorded. Each
                direction needs its own review.
              </p>
              {!canReview && (
                <p className="journey-field-hint">
                  Validate and save the draft before approval.
                </p>
              )}
              {!ready && (
                <p className="journey-field-hint">
                  Supply the path, distance, duration, source and passenger
                  instructions before approval.
                </p>
              )}
              <Input
                label="Review evidence URL"
                name="evidenceUrl"
                type="url"
                pattern="https://.*"
                required
                maxLength={2000}
              />
              <label htmlFor={`${id}-notes`}>
                Review notes, including crossings and access limitations
              </label>
              <textarea
                id={`${id}-notes`}
                name="notes"
                required
                minLength={20}
                maxLength={2000}
                rows={3}
              />
              <label className="journey-review-confirm">
                <input type="checkbox" required />I checked this exact
                pedestrian path and its crossings; proximity alone is not
                evidence.
              </label>
              <Button
                type="submit"
                variant="primary"
                disabled={!canReview || !ready || busy || !onReview}
              >
                {busy ? "Recording review…" : "Approve saved path"}
              </Button>
            </form>
          )}
          <div className="journey-actions">
            {t.reviewed && (
              <Button
                type="button"
                onClick={() => {
                  const next = { ...t, reviewed: false };
                  delete next.review;
                  onChange(next);
                }}
              >
                Remove approval in editor
              </Button>
            )}
            <Button type="button" onClick={onRemove}>
              Remove transfer in editor
            </Button>
          </div>
        </>
      )}
    </details>
  );
}
