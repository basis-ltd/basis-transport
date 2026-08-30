import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Share2, X } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/cards/Modal";
import LandingHeroForm from "./components/landing/LandingHeroForm";
import JourneyShell, {
  LoadState,
  NetworkNotice,
} from "@/features/journey/JourneyShell";
import { journeyMessages as copy } from "@/features/journey/messages";
import JourneyCard from "@/features/journey/JourneyCard";
import SaveButton from "@/features/journey/SaveButton";
import { networkRequest } from "@/features/journey/api";
import { parseTravelQuery, travelUrl } from "@/features/journey/locations";
import type { JourneyPlan } from "@/features/journey/types";

const JourneyMap = lazy(() => import("@/features/journey/JourneyMap"));
const states = copy;

export default function TravelGuidancePage() {
  const [params] = useSearchParams(),
    navigate = useNavigate(),
    query = params.toString();
  const parsed = parseTravelQuery(params);
  const [plan, setPlan] = useState<JourneyPlan>(),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const [preference, setPreference] = useState("fewest_transfers"),
    [maxWalk, setMaxWalk] = useState(800),
    [selected, setSelected] = useState(""),
    [selectedLeg, setSelectedLeg] = useState(0),
    [showMap, setShowMap] = useState(false),
    [shareOpen, setShareOpen] = useState(false);
  const selectLeg = useCallback((index: number) => setSelectedLeg(index), []);
  useEffect(() => {
    const controller = new AbortController();
    const { origin, destination } = parseTravelQuery(
      new URLSearchParams(query),
    );
    setPlan(undefined);
    setError("");
    setShowMap(false);
    setSelectedLeg(0);
    if (!origin || !destination) {
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    const location = (p: typeof origin) =>
      p.stopId
        ? { stopId: p.stopId }
        : { latitude: p.latitude, longitude: p.longitude };
    void networkRequest<JourneyPlan>("/journeys/plan", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({
        origin: location(origin),
        destination: location(destination),
        maxWalkMeters: maxWalk,
        maxTransfers: 2,
        preference,
      }),
    })
      .then((p) => {
        if (!controller.signal.aborted) {
          setPlan(p);
          setSelected(p.journeys[0]?.id || "");
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, preference, maxWalk, revision]);
  const [mobileMap, setMobileMap] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobileMap(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const selectedJourney = plan?.journeys.find((j) => j.id === selected);
  const title =
    parsed.origin && parsed.destination
      ? parsed.origin.name + " → " + parsed.destination.name
      : "Find your connection";
  const href =
    parsed.origin && parsed.destination
      ? travelUrl(parsed.origin, parsed.destination)
      : "/travel";
  return (
    <JourneyShell
      title="Your journey, stop by stop"
      description="Choose a connection. Know where to board, change buses, and get off."
      path="/travel"
    >
      <section className="journey-search-panel">
        <LandingHeroForm
          key={query}
          origin={parsed.origin}
          destination={parsed.destination}
          fromText={parsed.from}
          toText={parsed.to}
          onSearch={(a, b) => navigate(travelUrl(a, b))}
        />
      </section>
      {parsed.invalid && (
        <p className="journey-notice">
          This link is missing a valid location. Select both endpoints to find a
          connection.
        </p>
      )}
      {plan && (
        <NetworkNotice
          network={{
            verification: plan.verification,
            sourceUrl: plan.sourceUrl,
            validTo: plan.validTo,
          }}
        />
      )}
      {parsed.origin && parsed.destination && (
        <div className="journey-results-toolbar">
          <div>
            <h2>{title}</h2>
            <p aria-live="polite">
              {loading
                ? "Finding your connections…"
                : plan
                  ? copy.connections(plan.journeys.length)
                  : "Network directions"}
            </p>
          </div>
          <div className="journey-actions">
            <SaveButton href={href} label={title} kind="journey" />
            <button
              type="button"
              className="journey-button secondary"
              onClick={() => setShareOpen(true)}
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      )}
      <div className="journey-preferences">
        <label>
          Prefer
          <select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
          >
            <option value="fewest_transfers">Fewest changes</option>
            <option value="least_walking">Least walking</option>
          </select>
        </label>
        <label>
          Walk at each end
          <select
            value={maxWalk}
            onChange={(e) => setMaxWalk(Number(e.target.value))}
          >
            <option value={800}>Up to 800 m</option>
            <option value={1500}>Up to 1.5 km</option>
            <option value={2000}>Up to 2 km</option>
          </select>
        </label>
      </div>
      <LoadState
        loading={loading}
        error={error}
        retry={() => setRevision((v) => v + 1)}
      />
      {!loading && !error && plan && plan.status !== "ok" && (
        <div className="journey-empty">
          <h2>{states[plan.status][0]}</h2>
          <p>{states[plan.status][1]}</p>
          <Link className="journey-button secondary" to="/stops">
            Browse stops
          </Link>
        </div>
      )}
      {!loading && !error && plan?.status === "ok" && (
        <div className={"journey-results " + (showMap ? "with-map" : "")}>
          <div className="journey-results-list">
            {plan.journeys.map((j) => (
              <JourneyCard
                key={j.id}
                journey={j}
                sourceDate={plan.validTo}
                expanded={selected === j.id}
                selectedLeg={selectedLeg}
                onSelectLeg={selectLeg}
                onExpand={() => {
                  setSelected(j.id);
                  setSelectedLeg(0);
                }}
                onMap={() => {
                  setSelected(j.id);
                  setShowMap(true);
                }}
              />
            ))}
          </div>
          {showMap && !mobileMap && selectedJourney && (
            <section className="journey-map-panel" aria-label="Journey map">
              <button
                type="button"
                className="journey-map-close journey-button secondary"
                onClick={() => setShowMap(false)}
              >
                <X size={17} />
                Close map
              </button>
              <Suspense fallback={<p>Loading map…</p>}>
                <JourneyMap
                  journey={selectedJourney}
                  selectedLeg={selectedLeg}
                  onSelectLeg={selectLeg}
                />
              </Suspense>
            </section>
          )}
        </div>
      )}
      {mobileMap && (
        <Modal
          isOpen={showMap && Boolean(selectedJourney)}
          onClose={() => setShowMap(false)}
          heading="Journey map"
          className="journey-map-modal"
        >
          {selectedJourney && (
            <Suspense fallback={<p>Loading map…</p>}>
              <JourneyMap
                journey={selectedJourney}
                selectedLeg={selectedLeg}
                onSelectLeg={selectLeg}
              />
            </Suspense>
          )}
        </Modal>
      )}
      {plan && (
        <details className="journey-data-notes">
          <summary>About these directions</summary>
          <ul>
            {plan.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <small>Network version: {plan.datasetVersion}</small>
        </details>
      )}
      {!query && (
        <div className="journey-empty">
          <h2>Where would you like to go?</h2>
          <p>Choose stops or places above. You don’t need an account.</p>
          <Link to="/stops">Explore nearby stops</Link>
        </div>
      )}
      <Modal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        heading="Share this journey?"
      >
        <p>
          This link includes the precise coordinates you selected. Anyone with
          the link can see them.
        </p>
        <div className="journey-actions">
          <button
            type="button"
            className="journey-button"
            onClick={() =>
              void Promise.resolve()
                .then(() =>
                  navigator.clipboard.writeText(window.location.origin + href),
                )
                .then(() => {
                  toast.success("Journey link copied");
                  setShareOpen(false);
                })
                .catch(() =>
                  toast.error(
                    "Copying is unavailable. You can copy the address from your browser.",
                  ),
                )
            }
          >
            Copy journey link
          </button>
        </div>
      </Modal>
    </JourneyShell>
  );
}
