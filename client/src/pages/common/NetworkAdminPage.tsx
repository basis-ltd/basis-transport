import { useState } from "react";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import TextArea from "@/components/inputs/TextArea";
import JourneyShell, { LoadState } from "@/features/journey/JourneyShell";
import { networkRequest, useNetworkResource } from "@/features/journey/api";
import type { Dataset, PassengerReport } from "@/features/journey/types";
import Modal from "@/components/cards/Modal";
import NetworkDraftReview, {
  parseDraftSnapshot,
} from "@/features/journey/NetworkDraftReview";

export default function NetworkAdminPage() {
  const datasets = useNetworkResource<Dataset[]>(
      "/admin/network/datasets",
      true,
    ),
    reports = useNetworkResource<{
      rows: PassengerReport[];
      totalCount: number;
    }>("/admin/network/reports?size=50", true);
  const [selected, setSelected] = useState<Dataset>(),
    [comparison, setComparison] = useState<{
      summary: {
        addedRoutes: number;
        withdrawnRoutes: number;
        modifiedRoutes: number;
      };
      entries: { category: string; message: string }[];
    }>(),
    [editor, setEditor] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [publishId, setPublishId] = useState("");
  const [comparisonCount, setComparisonCount] = useState(20);
  const open = async (id: string) => {
    setError("");
    setComparison(undefined);
    setComparisonCount(20);
    try {
      const d = await networkRequest<Dataset>(
        `/admin/network/datasets/${id}`,
        {},
        true,
      );
      setSelected(d);
      setEditor(JSON.stringify(d.snapshot, null, 2));
      const c = await networkRequest<{
        report: {
          summary: {
            addedRoutes: number;
            withdrawnRoutes: number;
            modifiedRoutes: number;
          };
          entries: { category: string; message: string }[];
        };
      }>(`/admin/network/datasets/${id}/comparison`, {}, true);
      setComparison(c.report);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const act = async (path: string, body?: unknown, method = "POST") => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await networkRequest(
        path,
        { method, body: body === undefined ? undefined : JSON.stringify(body) },
        true,
      );
      datasets.refresh();
      reports.refresh();
      setPublishId("");
      setNotice("Changes saved.");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  return (
    <JourneyShell
      title="Network administration"
      description="Review source data, correct drafts, and publish a network passengers can trust."
      path="/admin/network"
    >
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="journey-notice">
          {notice}
        </p>
      )}
      <p className="journey-notice">
        Import a GTFS archive with the API’s network:import command. Imports
        create drafts only. Public publication requires current service, rights
        approval, and verification evidence.
      </p>
      <LoadState
        loading={datasets.loading}
        error={datasets.error}
        retry={datasets.refresh}
      />
      <div className="journey-directory">
        {datasets.data?.map((d) => (
          <article className="journey-directory-item" key={d.id}>
            <div>
              <h2>{d.version}</h2>
              <p>
                {d.status} · {d.verification} · rights {d.rightsStatus} ·{" "}
                {d.patternCount} patterns
              </p>
              <p>{d.issues.length} import notices</p>
              <div className="journey-actions">
                <Button type="button" onClick={() => void open(d.id)}>
                  Inspect
                </Button>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void act(`/admin/network/datasets/${d.id}/clone`)
                  }
                >
                  Create editable copy
                </Button>
                {d.status !== "published" && (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy}
                    onClick={() => setPublishId(d.id)}
                  >
                    {d.status === "archived"
                      ? "Restore this version"
                      : "Publish draft"}
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <section className="journey-search-panel">
          <h2>{selected.version}</h2>
          <p className="journey-field-hint">
            {selected.status === "draft"
              ? "Edit stop names, aliases, pattern sequences, calendars, sourced fares, and reviewed transfer links in the validated snapshot. Stop metadata must agree across all occurrences."
              : "Published and archived snapshots are immutable. Create an editable copy to make changes."}
          </p>
          {"patterns" in selected.snapshot && (
            <div
              className="journey-admin-inventory"
              aria-label="Snapshot inventory"
            >
              <p>
                <strong>{selected.snapshot.patterns.length}</strong> patterns ·{" "}
                <strong>
                  {(selected.snapshot as { transfers?: unknown[] }).transfers
                    ?.length ?? 0}
                </strong>{" "}
                transfer links ·{" "}
                <strong>
                  {(selected.snapshot as { stopAreas?: unknown[] }).stopAreas
                    ?.length ?? 0}
                </strong>{" "}
                stop areas
              </p>
              <p className="journey-field-hint">
                Reviewed transfers:{" "}
                {
                  (
                    (
                      selected.snapshot as {
                        transfers?: { reviewed?: boolean }[];
                      }
                    ).transfers ?? []
                  ).filter((t) => t.reviewed).length
                }{" "}
                · Unreviewed:{" "}
                {
                  (
                    (
                      selected.snapshot as {
                        transfers?: { reviewed?: boolean }[];
                      }
                    ).transfers ?? []
                  ).filter((t) => !t.reviewed).length
                }
              </p>
            </div>
          )}
          <NetworkDraftReview
            editor={editor}
            readonly={selected.status !== "draft" || busy}
            onChange={setEditor}
            canReview={
              !busy &&
              Boolean(selected.snapshotRevision) &&
              JSON.stringify(parseDraftSnapshot(editor)) ===
                JSON.stringify(selected.snapshot)
            }
            onReview={async (id, evidence) => {
              setBusy(true);
              setError("");
              setNotice("");
              try {
                await networkRequest(
                  `/admin/network/datasets/${selected.id}/transfers/${encodeURIComponent(id)}/review`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      ...evidence,
                      confirm: true,
                      expectedRevision: selected.snapshotRevision,
                    }),
                  },
                  true,
                );
                await open(selected.id);
                setNotice(
                  "Pedestrian path review recorded. Publish the draft to make the approved link available to routing.",
                );
              } catch (e) {
                setError((e as Error).message);
                throw e;
              } finally {
                setBusy(false);
              }
            }}
          />
          <TextArea
            label="Network snapshot"
            className="journey-admin-editor font-mono text-sm"
            value={editor}
            readonly={selected.status !== "draft" || busy}
            onChange={(e) => setEditor(e.target.value)}
            rows={18}
            resize
          />
          {selected.status === "draft" && (
            <div className="journey-actions">
              <Button
                type="button"
                variant="primary"
                disabled={busy}
                onClick={async () => {
                  try {
                    const saved = await act(
                      `/admin/network/datasets/${selected.id}/snapshot`,
                      JSON.parse(editor),
                      "PATCH",
                    );
                    if (saved) await open(selected.id);
                  } catch {
                    setError("The snapshot is not valid JSON.");
                  }
                }}
              >
                Validate and save draft
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={() => void open(selected.id)}
              >
                Discard editor edits and reload saved draft
              </Button>
            </div>
          )}
          <details className="journey-data-notes">
            <summary>Import quality notices</summary>
            <ul>
              {selected.issues.map((i, n) => (
                <li key={n}>
                  {i.reference}: {i.message}
                </li>
              ))}
            </ul>
          </details>
          {comparison && (
            <details className="journey-data-notes" open>
              <summary>Import comparison report</summary>
              <p>
                {comparison.summary.addedRoutes} routes added ·{" "}
                {comparison.summary.withdrawnRoutes} withdrawn ·{" "}
                {comparison.summary.modifiedRoutes} modified
              </p>
              <ul>
                {comparison.entries.slice(0, comparisonCount).map((e, n) => (
                  <li key={n}>
                    <strong>{e.category}</strong>: {e.message}
                  </li>
                ))}
              </ul>
              {comparison.entries.length > comparisonCount && (
                <Button
                  type="button"
                  onClick={() => setComparisonCount((n) => n + 20)}
                >
                  Show next{" "}
                  {Math.min(20, comparison.entries.length - comparisonCount)}{" "}
                  changes ({comparison.entries.length - comparisonCount}{" "}
                  remaining)
                </Button>
              )}
            </details>
          )}
          {selected.status === "draft" && (
            <form
              className="grid gap-4 mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void act(
                  `/admin/network/datasets/${selected.id}/metadata`,
                  {
                    rightsStatus: selected.rightsStatus,
                    rightsEvidence: selected.rightsEvidence,
                    verification: selected.verification,
                    verificationEvidence: selected.verificationEvidence,
                  },
                  "PATCH",
                );
              }}
            >
              <Select
                label="Usage rights"
                value={selected.rightsStatus}
                onChange={(value) =>
                  setSelected({ ...selected, rightsStatus: value })
                }
                options={[
                  { label: "Unclear — internal only", value: "unclear" },
                  { label: "Approved for public use", value: "approved" },
                ]}
              />
              <Input
                label="Rights evidence"
                value={selected.rightsEvidence}
                onChange={(e) =>
                  setSelected({ ...selected, rightsEvidence: e.target.value })
                }
              />
              <Select
                label="Verification"
                value={selected.verification}
                onChange={(value) =>
                  setSelected({
                    ...selected,
                    verification: value as Dataset["verification"],
                  })
                }
                options={[
                  { label: "Historic", value: "historic" },
                  { label: "Unverified", value: "unverified" },
                  { label: "Verified current service", value: "verified" },
                ]}
              />
              <Input
                label="Verification evidence"
                value={selected.verificationEvidence}
                onChange={(e) =>
                  setSelected({
                    ...selected,
                    verificationEvidence: e.target.value,
                  })
                }
              />
              <Button
                type="submit"
                variant="primary"
                className="w-fit"
                disabled={busy}
              >
                Save review evidence
              </Button>
            </form>
          )}
        </section>
      )}
      <h2 className="text-xl mt-10">Passenger reports</h2>
      <LoadState
        loading={reports.loading}
        error={reports.error}
        retry={reports.refresh}
      />
      <div className="journey-directory">
        {reports.data?.rows.map((r) => (
          <article key={r.id} className="journey-directory-item">
            <div>
              <h2>
                {r.kind} · {r.status}
              </h2>
              <p>{r.message}</p>
              <p>
                {r.referenceId || ""} {r.email || ""}
              </p>
              <Button
                type="button"
                className="mt-3"
                disabled={busy}
                onClick={() =>
                  void act(
                    `/admin/network/reports/${r.id}`,
                    { status: r.status === "open" ? "resolved" : "open" },
                    "PATCH",
                  )
                }
              >
                {r.status === "open" ? "Mark resolved" : "Reopen"}
              </Button>
            </div>
          </article>
        ))}
      </div>
      <Modal
        isOpen={Boolean(publishId)}
        onClose={() => setPublishId("")}
        heading="Publish this network version?"
      >
        <p>
          The current published version will be archived. All API workers will
          switch to this version. Publication does not make historic data
          current or grant usage rights.
        </p>
        <div className="journey-actions">
          <Button
            type="button"
            variant="primary"
            disabled={busy}
            onClick={() =>
              void act(`/admin/network/datasets/${publishId}/publish`, {
                confirm: true,
              })
            }
          >
            Confirm publication
          </Button>
        </div>
        {error && (
          <p role="alert" className="journey-error">
            {error}
          </p>
        )}
      </Modal>
    </JourneyShell>
  );
}
