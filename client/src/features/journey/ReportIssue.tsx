import { useState } from "react";
import Modal from "@/components/cards/Modal";
import { networkRequest } from "./api";

export default function ReportIssue({
  kind,
  referenceId,
}: {
  kind: "stop" | "route";
  referenceId: string;
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <>
      <button
        type="button"
        className="journey-button secondary"
        onClick={() => setOpen(true)}
      >
        Report a problem
      </button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        heading={sent ? "Report received" : "What needs correcting?"}
      >
        {sent ? (
          <p>
            Thank you. Our team will review your report before changing the
            network.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              void networkRequest("/reports", {
                method: "POST",
                body: JSON.stringify({ kind, referenceId, message }),
              })
                .then(() => setSent(true))
                .catch((e) => setError(e.message))
                .finally(() => setBusy(false));
            }}
          >
            <label htmlFor="report-message">
              Describe the stop or route issue
            </label>
            <textarea
              id="report-message"
              className="journey-directory-search"
              style={{ maxWidth: "none", minHeight: 140 }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              minLength={10}
              maxLength={3000}
              required
            />
            {error && (
              <p className="journey-error" role="alert">
                {error}
              </p>
            )}
            <div className="journey-actions">
              <button type="submit" className="journey-button" disabled={busy}>
                {busy ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
