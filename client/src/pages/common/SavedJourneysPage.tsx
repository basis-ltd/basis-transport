import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2 } from "lucide-react";
import Button from "@/components/inputs/Button";
import { useAppSelector } from "@/states/hooks";
import { LoadState } from "@/features/journey/JourneyShell";
import { networkRequest, useNetworkResource } from "@/features/journey/api";
import {
  removeSavedItem,
  saveItem,
  useSavedItems,
} from "@/features/journey/saved";
import type { SavedItem } from "@/features/journey/types";
import Modal from "@/components/cards/Modal";
import {
  PageBody,
  PageHeader,
  PageSection,
} from "@/components/layout/PageShell";
import "@/features/journey/journey.css";

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
    <ul className="journey-directory">
      {values.map((item) => (
        <li key={item.key}>
          <article className="journey-directory-item">
            <Bookmark size={16} aria-hidden="true" />
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
              <Button
                type="button"
                onClick={() => {
                  try {
                    saveItem(item);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Keep here
              </Button>
            )}
            <Button
              type="button"
              size="icon-sm"
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
              <Trash2 size={14} />
            </Button>
          </article>
        </li>
      ))}
    </ul>
  );
  return (
    <PageBody>
      <PageHeader
        eyebrow="Journey planner"
        title="Saved places and journeys"
        description="Keep the connections you use on this account."
      />
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      {items.length ? (
        list(items)
      ) : (
        <section className="journey-empty">
          <h2>Your next journey starts here</h2>
          <p>Save a route, stop, or journey from a plan to find it again.</p>
          <Button variant="primary" route="/travel">
            Plan a journey
          </Button>
        </section>
      )}
      <PageSection
        title="Use favorites across devices"
        description="Copy this device’s saved items to your account when you want them on another phone or computer."
      >
        <Button
          type="button"
          className="w-fit"
          disabled={!items.length}
          onClick={() => setConfirm(true)}
        >
          Copy device favorites to account
        </Button>
        <LoadState
          loading={remote.loading}
          error={remote.error}
          retry={remote.refresh}
        />
        {remote.data && list(remote.data, true)}
      </PageSection>
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
          <Button
            type="button"
            variant="primary"
            disabled={syncing}
            onClick={() => void upload()}
          >
            {syncing ? "Copying…" : "Copy favorites"}
          </Button>
        </div>
      </Modal>
    </PageBody>
  );
}
