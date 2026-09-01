import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "@/states/hooks";
import AppLayout from "@/containers/navigation/AppLayout";
import { PageBody, PageHeader } from "@/components/layout/PageShell";
import { Seo } from "@/components/seo";
import "@/features/journey/journey.css";
import { Share2, X } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/cards/Modal";
import Button from "@/components/inputs/Button";
import Select from "@/components/inputs/Select";
import { FieldShell } from "@/components/inputs/Field";
import LandingHeroForm from "./components/landing/LandingHeroForm";
import JourneyShell, {
  LoadState,
  NetworkNotice,
} from "@/features/journey/JourneyShell";
import { journeyMessages as copy } from "@/features/journey/messages";
import JourneyCard from "@/features/journey/JourneyCard";
import FollowJourney from "@/features/journey/FollowJourney";
import SaveButton from "@/features/journey/SaveButton";
import { networkRequest } from "@/features/journey/api";
import { parseTravelQuery, travelUrl } from "@/features/journey/locations";
import { loadGuidance } from "@/features/journey/guidance-state";
import type { JourneyPlan, PassengerStep } from "@/features/journey/types";

const JourneyMap = lazy(() => import("@/features/journey/JourneyMap"));
const states = copy;

/**
 * This page is the one route in the app that renders in two shells: the public
 * `JourneyShell` when you are signed out, and `AppLayout` when you are not.
 * The title, the description, and the head tags are declared once here so the
 * two branches cannot drift — the signed-in branch used to render no `Seo` at
 * all, which left /travel without a canonical link or its noindex for exactly
 * the visitors who reach it most.
 */
const PAGE_TITLE = "Your journey, stop by stop";
const PAGE_DESCRIPTION =
  "Choose a connection. Know where to board, change buses, and get off.";

export default function TravelGuidancePage() {
  const [params, setParams] = useSearchParams(),
    navigate = useNavigate(),
    query = params.toString();
  const parsed = parseTravelQuery(params);
  const [plan, setPlan] = useState<JourneyPlan>(),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const preference =
    params.get("preference") === "least_walking"
      ? "least_walking"
      : "fewest_transfers";
  const maxWalk = [800, 1500, 2000].includes(
    Number(params.get("maxWalkMeters")),
  )
    ? Number(params.get("maxWalkMeters"))
    : undefined;
  const rawTransfers = params.get("maxTransfers");
  const maxTransfers =
    rawTransfers !== null && /^[0-4]$/.test(rawTransfers)
      ? Number(rawTransfers)
      : 2;
  const rawDeparture = params.get("departureAt") || "";
  const departureAt =
    rawDeparture && Number.isFinite(Date.parse(rawDeparture))
      ? rawDeparture
      : "";
  const localDeparture = departureAt
    ? new Date(
        Date.parse(departureAt) -
          new Date(departureAt).getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16)
    : "";
  const changePreference = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  const [completedSteps, setCompletedSteps] = useState<PassengerStep[]>([]);
  const [selected, setSelected] = useState(""),
    [selectedLeg, setSelectedLeg] = useState(0),
    [showMap, setShowMap] = useState(false),
    [shareOpen, setShareOpen] = useState(false),
    [guidance, setGuidance] = useState(false),
    [replanned, setReplanned] = useState(false);
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
        maxTransfers,
        preference,
        ...(departureAt
          ? { departureAt: new Date(departureAt).toISOString() }
          : {}),
      }),
    })
      .then((p) => {
        if (!controller.signal.aborted) {
          setPlan(p);
          const resumed = p.journeys.find(
            (j) => loadGuidance(j, p.datasetVersion)?.active,
          );
          setSelected(resumed?.id || p.journeys[0]?.id || "");
          setGuidance(Boolean(resumed));
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, preference, maxWalk, maxTransfers, departureAt, revision]);
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
      ? travelUrl(parsed.origin, parsed.destination, params)
      : "/travel";
  const signedIn = Boolean(useAppSelector((s) => s.auth.token));
  const content = (
    <>
      <section className="journey-search-panel">
        <LandingHeroForm
          key={query}
          origin={parsed.origin}
          destination={parsed.destination}
          fromText={parsed.from}
          toText={parsed.to}
          busy={loading}
          onSearch={(a, b) => {
            const next = travelUrl(a, b, params);
            if (next === href) setRevision((value) => value + 1);
            else navigate(next);
          }}
        />
        <section
          className="journey-planner-preferences"
          aria-labelledby="journey-preferences-title"
        >
          <header>
            <h2 id="journey-preferences-title">Journey preferences</h2>
            <p>Adjust walking, changes, and departure time.</p>
          </header>
          <div className="journey-preferences">
            <Select
              label="Prefer"
              value={preference}
              onChange={(value) => changePreference("preference", value)}
              options={[
                { label: "Fewest changes", value: "fewest_transfers" },
                { label: "Least walking", value: "least_walking" },
              ]}
            />
            <Select
              label="Walk at each end"
              value={maxWalk === undefined ? "auto" : String(maxWalk)}
              onChange={(value) =>
                changePreference("maxWalkMeters", value)
              }
              options={[
                { label: "Auto · nearest connection", value: "auto" },
                { label: "Up to 800 m", value: "800" },
                { label: "Up to 1.5 km", value: "1500" },
                { label: "Up to 2 km", value: "2000" },
              ]}
            />
            <Select
              label="Bus changes"
              value={String(maxTransfers)}
              onChange={(value) => changePreference("maxTransfers", value)}
              options={[0, 1, 2, 3, 4].map((n) => ({
                value: String(n),
                label: n === 0 ? "Direct only" : `Up to ${n} changes`,
              }))}
            />
            <FieldShell label="Leave at (your device time)">
              <input
                type="datetime-local"
                value={localDeparture}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || Number.isFinite(Date.parse(value)))
                    changePreference(
                      "departureAt",
                      value ? new Date(value).toISOString() : "",
                    );
                }}
                className="journey-datetime"
              />
            </FieldShell>
          </div>
        </section>
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
            <Button type="button" onClick={() => setShareOpen(true)}>
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      )}
      <div
        className={`journey-plan-stage ${
          parsed.origin && parsed.destination ? "is-active" : ""
        }`}
      >
        <LoadState
          loading={loading}
          error={error}
          retry={() => setRevision((v) => v + 1)}
          className="journey-plan-loading"
        />
        {!loading &&
          !error &&
          plan &&
          plan.status !== "ok" &&
          plan.status !== "walking_only" &&
          plan.status !== "search_limit_reached" &&
          plan.status !== "service_timing_unknown" && (
            <div className="journey-empty">
              <h2>{states[plan.status][0]}</h2>
              <p>{states[plan.status][1]}</p>
              {!!plan.nearbyConnections?.length && (
                <section
                  className="journey-stop-alternatives"
                  aria-label="Nearby boarding alternatives"
                >
                  <h3>Try different boarding points</h3>
                  <p>
                    These stops have a direct link in the published network.
                    Selecting one changes your endpoints. Getting to and from
                    these stops is not included; distances below are
                    straight-line distances, not checked walking routes. Confirm
                    service before travelling.
                  </p>
                  {plan.nearbyConnections.map((choice) => (
                    <article
                      className="journey-card journey-stop-alternative"
                      key={`${choice.origin.stopId}-${choice.destination.stopId}`}
                    >
                      <h4>
                        {choice.origin.name} → {choice.destination.name}
                      </h4>
                      <p>
                        <span
                          className="route-badge journey-route-badge"
                          aria-label={`Route ${choice.routeNumber}`}
                        >
                          {choice.routeNumber}
                        </span>{" "}
                        towards {choice.headsign}
                      </p>
                      <p>
                        {choice.originDistanceMeters} m from your start ·{" "}
                        {choice.destinationDistanceMeters} m from your
                        destination
                      </p>
                      <Button
                        type="button"
                        onClick={() =>
                          navigate(
                            travelUrl(
                              {
                                ...choice.origin,
                                latitude: choice.origin.coordinates[1],
                                longitude: choice.origin.coordinates[0],
                              },
                              {
                                ...choice.destination,
                                latitude: choice.destination.coordinates[1],
                                longitude: choice.destination.coordinates[0],
                              },
                              params,
                            ),
                          )
                        }
                      >
                        Use these stops
                      </Button>
                    </article>
                  ))}
                </section>
              )}
              <div className="journey-empty-actions">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Search again
                </Button>
                <Button route="/stops">Browse stops</Button>
              </div>
            </div>
          )}
        {!loading &&
          !error &&
          plan &&
          (plan.status === "ok" ||
            plan.status === "walking_only" ||
            plan.status === "search_limit_reached" ||
            plan.status === "service_timing_unknown") && (
            <div className={"journey-results " + (showMap ? "with-map" : "")}>
              {plan.status === "walking_only" && (
                <p className="journey-notice" role="status">
                  {states.walking_only[1]}
                </p>
              )}
              {plan.status === "search_limit_reached" && (
                <p className="journey-notice is-historic" role="status">
                  {states.search_limit_reached[1]}
                </p>
              )}
              {plan.status === "service_timing_unknown" && (
                <p className="journey-notice is-historic" role="status">
                  {states.service_timing_unknown[1]}
                </p>
              )}
              {replanned && (
                <p className="journey-notice" role="status">
                  This is your remaining journey from the location you selected.
                </p>
              )}
              {completedSteps.length > 0 && (
                <details className="journey-data-notes">
                  <summary>Completed steps before replanning</summary>
                  <ol>
                    {completedSteps.map((s, i) => (
                      <li key={`${s.id}-${i}`}>{s.text}</li>
                    ))}
                  </ol>
                </details>
              )}
              {guidance && selectedJourney ? (
                <FollowJourney
                  key={`${plan.datasetVersion}:${selectedJourney.id}`}
                  journey={selectedJourney}
                  datasetVersion={plan.datasetVersion}
                  onClose={() => setGuidance(false)}
                  onReplanFrom={(location, completed) => {
                    const dest = parsed.destination;
                    if (!dest || !selectedJourney) return;
                    setGuidance(false);
                    setReplanned(true);
                    setCompletedSteps((previous) => [
                      ...previous,
                      ...completed,
                    ]);
                    const next = new URLSearchParams(params);
                    next.delete("departureAt"); // Replan now, not at a missed past departure.
                    navigate(travelUrl(location, dest, next));
                  }}
                />
              ) : (
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
                      onStart={() => {
                        setSelected(j.id);
                        setGuidance(true);
                      }}
                    />
                  ))}
                </div>
              )}
              {showMap && !mobileMap && selectedJourney && (
                <section className="journey-map-panel" aria-label="Journey map">
                  <Button
                    type="button"
                    className="journey-map-close"
                    onClick={() => setShowMap(false)}
                  >
                    <X size={17} />
                    Close map
                  </Button>
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
      </div>
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
        <section className="journey-empty">
          <h2>Where would you like to go?</h2>
          <p>
            {signedIn
              ? "Pick a start and a destination above, and every connection between them shows up here."
              : "Choose stops or places above. You don’t need an account."}
          </p>
          <div className="journey-empty-actions">
            <Button route="/stops">Browse stops</Button>
          </div>
        </section>
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
          <Button
            type="button"
            variant="primary"
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
          </Button>
        </div>
      </Modal>
    </>
  );
  if (signedIn) {
    return (
      <AppLayout>
        <Seo
          title={`${PAGE_TITLE} | Basis Transport`}
          description={PAGE_DESCRIPTION}
          canonicalPath="/travel"
          noIndex
        />
        <PageBody className="journey-page journey-page--app">
          <PageHeader title={PAGE_TITLE} description={PAGE_DESCRIPTION} />
          {content}
        </PageBody>
      </AppLayout>
    );
  }
  return (
    <JourneyShell
      title={PAGE_TITLE}
      description={PAGE_DESCRIPTION}
      path="/travel"
    >
      {content}
    </JourneyShell>
  );
}
