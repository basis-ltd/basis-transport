import { useState } from "react";
import Modal from "@/components/cards/Modal";
import Button from "@/components/inputs/Button";
import TextArea from "@/components/inputs/TextArea";
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
      <Button type="button" onClick={() => setOpen(true)}>
        Report a problem
      </Button>
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
            className="grid gap-4"
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
            <TextArea
              label="Describe the stop or route issue"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              errorMessage={error || undefined}
            />
            <div className="journey-actions">
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? "Sending…" : "Send report"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
