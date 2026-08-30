import { useState } from "react";
import JourneyShell, { LoadState } from "@/features/journey/JourneyShell";
import { networkRequest, useNetworkResource } from "@/features/journey/api";
import type { Dataset, PassengerReport } from "@/features/journey/types";
import Modal from "@/components/cards/Modal";

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
    [editor, setEditor] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [publishId, setPublishId] = useState("");
  const open = async (id: string) => {
    setError("");
    try {
      const d = await networkRequest<Dataset>(
        `/admin/network/datasets/${id}`,
        {},
        true,
      );
      setSelected(d);
      setEditor(JSON.stringify(d.snapshot, null, 2));
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
    } catch (e) {
      setError((e as Error).message);
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
                <button
                  type="button"
                  className="journey-button secondary"
                  onClick={() => void open(d.id)}
                >
                  Inspect
                </button>
                <button
                  type="button"
                  className="journey-button secondary"
                  disabled={busy}
                  onClick={() =>
                    void act(`/admin/network/datasets/${d.id}/clone`)
                  }
                >
                  Create editable copy
                </button>
                {d.status !== "published" && (
                  <button
                    type="button"
                    className="journey-button"
                    disabled={busy}
                    onClick={() => setPublishId(d.id)}
                  >
                    {d.status === "archived"
                      ? "Restore this version"
                      : "Publish draft"}
                  </button>
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
          <label htmlFor="network-snapshot" className="block my-3 text-sm">
            Network snapshot
          </label>
          <textarea
            id="network-snapshot"
            className="journey-admin-editor"
            value={editor}
            readOnly={selected.status !== "draft"}
            onChange={(e) => setEditor(e.target.value)}
            spellCheck={false}
          />
          {selected.status === "draft" && (
            <div className="journey-actions">
              <button
                type="button"
                className="journey-button"
                disabled={busy}
                onClick={() => {
                  try {
                    void act(
                      `/admin/network/datasets/${selected.id}/snapshot`,
                      JSON.parse(editor),
                      "PATCH",
                    );
                  } catch {
                    setError("The snapshot is not valid JSON.");
                  }
                }}
              >
                Validate and save draft
              </button>
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
          {selected.status === "draft" && (
            <form
              className="grid gap-3 mt-6"
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
              <label>
                Usage rights
                <select
                  className="journey-directory-search block"
                  value={selected.rightsStatus}
                  onChange={(e) =>
                    setSelected({ ...selected, rightsStatus: e.target.value })
                  }
                >
                  <option value="unclear">Unclear — internal only</option>
                  <option value="approved">Approved for public use</option>
                </select>
              </label>
              <label>
                Rights evidence
                <input
                  className="journey-directory-search block"
                  value={selected.rightsEvidence}
                  onChange={(e) =>
                    setSelected({ ...selected, rightsEvidence: e.target.value })
                  }
                />
              </label>
              <label>
                Verification
                <select
                  className="journey-directory-search block"
                  value={selected.verification}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      verification: e.target.value as Dataset["verification"],
                    })
                  }
                >
                  <option value="historic">Historic</option>
                  <option value="unverified">Unverified</option>
                  <option value="verified">Verified current service</option>
                </select>
              </label>
              <label>
                Verification evidence
                <input
                  className="journey-directory-search block"
                  value={selected.verificationEvidence}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      verificationEvidence: e.target.value,
                    })
                  }
                />
              </label>
              <button
                type="submit"
                className="journey-button w-fit"
                disabled={busy}
              >
                Save review evidence
              </button>
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
              <button
                type="button"
                className="journey-button secondary mt-3"
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
              </button>
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
          <button
            type="button"
            className="journey-button"
            disabled={busy}
            onClick={() =>
              void act(`/admin/network/datasets/${publishId}/publish`, {
                confirm: true,
              })
            }
          >
            Confirm publication
          </button>
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
