import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2 } from "lucide-react";
import { useAppSelector } from "@/states/hooks";
import JourneyShell, { LoadState } from "@/features/journey/JourneyShell";
import { networkRequest, useNetworkResource } from "@/features/journey/api";
import {
  removeSavedItem,
  saveItem,
  useSavedItems,
} from "@/features/journey/saved";
import type { SavedItem } from "@/features/journey/types";
import Modal from "@/components/cards/Modal";

export default function SavedJourneysPage() {
  const items = useSavedItems(),
    token = useAppSelector((s) => s.auth.token),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false),
    [syncing, setSyncing] = useState(false);
  const remote = useNetworkResource<SavedItem[]>(
    token ? "/me/saved-items" : null,
    true,
  );
  const upload = async () => {
    setSyncing(true);
    setError("");
    try {
      for (const item of items)
        await networkRequest(
          "/me/saved-items",
          { method: "POST", body: JSON.stringify(item) },
          true,
        );
      remote.refresh();
      setConfirm(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSyncing(false);
    }
  };
  const list = (values: SavedItem[], cloud = false) => (
    <div className="journey-directory">
      {values.map((item) => (
        <article key={item.key} className="journey-directory-item">
          <Bookmark size={20} />
          <div>
            <Link to={item.href}>
              <h2>{item.label}</h2>
            </Link>
            <p>
              {item.kind} ·{" "}
              {cloud ? "Account favorite" : "Saved on this device"}
            </p>
          </div>
          {cloud && (
            <button
              type="button"
              className="journey-button secondary"
              onClick={() => {
                try {
                  saveItem(item);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Keep here
            </button>
          )}
          <button
            type="button"
            className="journey-icon-button"
            aria-label={`Remove ${item.label}`}
            onClick={() => {
              if (cloud)
                void networkRequest(
                  `/me/saved-items/${item.id}`,
                  { method: "DELETE" },
                  true,
                )
                  .then(remote.refresh)
                  .catch((e) => setError(e.message));
              else
                try {
                  removeSavedItem(item.key);
                } catch (e) {
                  setError((e as Error).message);
                }
            }}
          >
            <Trash2 size={17} />
          </button>
        </article>
      ))}
    </div>
  );
  return (
    <JourneyShell
      title="Your saved places and journeys"
      description="Keep the connections you use. No account needed to save on this device."
      path="/saved"
    >
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      {items.length ? (
        list(items)
      ) : (
        <div className="journey-empty">
          <h2>Your next journey starts here</h2>
          <p>Save a route, stop, or journey to find it again easily.</p>
          <Link className="journey-button" to="/">
            Plan a journey
          </Link>
        </div>
      )}
      <section className="journey-search-panel">
        <h2>Use favorites across devices</h2>
        <p className="journey-field-hint">
          Account synchronization is optional. Nothing saved on this device is
          uploaded automatically.
        </p>
        {token ? (
          <>
            <button
              type="button"
              className="journey-button secondary"
              onClick={() => setConfirm(true)}
              disabled={!items.length}
            >
              Copy device favorites to account
            </button>
            <LoadState
              loading={remote.loading}
              error={remote.error}
              retry={remote.refresh}
            />
            {remote.data && list(remote.data, true)}
          </>
        ) : (
          <div className="journey-actions">
            <Link
              className="journey-button secondary"
              to="/auth/login?returnTo=%2Fsaved"
            >
              Sign in to synchronize
            </Link>
          </div>
        )}
      </section>
      <Modal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        heading="Copy favorites to your account?"
      >
        <p>
          This uploads {items.length} saved items, including any saved journey
          coordinates. Existing matching favorites will be updated.
        </p>
        <div className="journey-actions">
          <button
            type="button"
            className="journey-button"
            disabled={syncing}
            onClick={() => void upload()}
          >
            {syncing ? "Copying…" : "Copy favorites"}
          </button>
        </div>
      </Modal>
    </JourneyShell>
  );
}
