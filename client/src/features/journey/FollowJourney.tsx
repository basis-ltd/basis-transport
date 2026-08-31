import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, MapPin, RotateCcw } from "lucide-react";
import BackButton from "@/components/inputs/BackButton";
import Button from "@/components/inputs/Button";
import LocationSearch from "./LocationSearch";
import type { Journey, JourneyLocation, PassengerStep } from "./types";
import { metresBetween, stepCoordinates, requestLocation } from "./locations";
import {
  clearGuidance,
  loadGuidance,
  saveGuidance,
  type GuidanceState,
} from "./guidance-state";

const labels: Record<PassengerStep["kind"], string> = {
  walk: "Done walking",
  transfer: "At the next stop",
  wait: "At the stop",
  board: "Boarded",
  ride: "At my alighting stop",
  alight: "Alighted",
  arrive: "Arrived",
};

export default function FollowJourney({
  journey,
  datasetVersion = "",
  onClose,
  onReplanFrom,
}: {
  journey: Journey;
  datasetVersion?: string;
  onClose: () => void;
  onReplanFrom?: (
    location: JourneyLocation,
    completed: PassengerStep[],
  ) => void;
}) {
  const steps = journey.steps || [];
  const [progress, setProgress] = useState(() => {
    const saved = loadGuidance(journey, datasetVersion);
    return {
      stepIndex: saved?.stepIndex || 0,
      history: saved?.history || [],
      completedAt: saved?.completedAt || null,
    };
  });
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [geoHint, setGeoHint] = useState("");
  const [geoError, setGeoError] = useState("");
  const [visible, setVisible] = useState(
    () => document.visibilityState !== "hidden",
  );
  const [help, setHelp] = useState<"missed" | "lost" | "replan" | null>(null);
  const [replanLocation, setReplanLocation] = useState<JourneyLocation>();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const watchId = useRef<number | null>(null);
  const panel = useRef<HTMLElement>(null);
  const mounted = useRef(true);
  const { stepIndex, history, completedAt } = progress;
  const current = steps[stepIndex],
    next = steps[stepIndex + 1];
  const currentLeg =
    current?.legIndex != null ? journey.legs[current.legIndex] : undefined;
  const done = Boolean(completedAt);
  const state = (active: boolean): GuidanceState => ({
    version: 1,
    journeyId: journey.id,
    datasetVersion,
    stepIds: steps.map((s) => s.id),
    ...progress,
    active,
    updatedAt: Date.now(),
  });
  useEffect(() => {
    panel.current?.focus({ preventScroll: true });
    panel.current?.scrollIntoView?.({ block: "start" });
  }, []);

  useEffect(() => {
    if (steps.length)
      setStorageAvailable(
        saveGuidance({
          version: 1,
          journeyId: journey.id,
          datasetVersion,
          stepIds: steps.map((s) => s.id),
          ...progress,
          active: !progress.completedAt,
          updatedAt: Date.now(),
        }),
      );
  }, [progress, journey.id, datasetVersion, steps]);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null)
      navigator.geolocation?.clearWatch(watchId.current);
    watchId.current = null;
  }, []);

  useEffect(() => {
    mounted.current = true;
    const changed = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", changed);
    return () => {
      mounted.current = false;
      stopWatch();
      document.removeEventListener("visibilitychange", changed);
    };
  }, [stopWatch]);

  useEffect(() => {
    stopWatch();
    setGeoHint("");
    if (!geoEnabled || !visible || done || !current) return;
    if (!navigator.geolocation) {
      setGeoError(
        "Location suggestions are unavailable. You can continue manually.",
      );
      setGeoEnabled(false);
      return;
    }
    const target = stepCoordinates(journey, current);
    if (!target) return;
    let active = true;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (!active) return;
        const fresh =
          Date.now() - pos.timestamp <= 30000 && pos.coords.accuracy <= 80;
        const nearby =
          fresh &&
          metresBetween(
            {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
            target,
          ) <= 80;
        setGeoHint(
          nearby
            ? "You may be near this step. Confirm manually when ready."
            : "",
        );
      },
      (error) => {
        if (!active) return;
        setGeoError(
          error.code === 1
            ? "Location permission was denied. Guidance stays manual."
            : "Location could not be read. Guidance stays manual.",
        );
        setGeoEnabled(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 12000 },
    );
    return () => {
      active = false;
      stopWatch();
    };
  }, [geoEnabled, visible, done, current, journey, stopWatch]);

  const advance = () =>
    setProgress((p) =>
      p.stepIndex < steps.length - 1
        ? {
            stepIndex: p.stepIndex + 1,
            history: [...p.history, p.stepIndex].slice(-1000),
            completedAt: null,
          }
        : { ...p, completedAt: new Date().toISOString() },
    );
  const undo = () =>
    setProgress((p) =>
      p.completedAt
        ? { ...p, completedAt: null }
        : p.history.length
          ? {
              stepIndex: p.history[p.history.length - 1],
              history: p.history.slice(0, -1),
              completedAt: null,
            }
          : p,
    );

  const locateForReplan = async () => {
    setLocating(true);
    setLocationError("");
    try {
      const location = await requestLocation();
      if (mounted.current) setReplanLocation(location);
    } catch (error) {
      if (mounted.current) setLocationError((error as Error).message);
    } finally {
      if (mounted.current) setLocating(false);
    }
  };

  if (!current)
    return (
      <section className="follow-journey">
        <p>No step-by-step guidance is available for this journey.</p>
        <BackButton onClick={onClose}>
          Back to results
        </BackButton>
      </section>
    );

  return (
    <section
      ref={panel}
      tabIndex={-1}
      className="follow-journey"
      aria-label="Follow journey guidance"
    >
      <div className="follow-journey-header">
        <BackButton
          onClick={() => {
            stopWatch();
            saveGuidance(state(false));
            onClose();
          }}
        >
          Exit guidance
        </BackButton>
        <p className="follow-journey-progress" aria-live="polite">
          {done
            ? "Arrival confirmed"
            : `Step ${stepIndex + 1} of ${steps.length}`}
        </p>
      </div>
      {!storageAvailable && (
        <p role="status">
          Progress cannot be saved in this browser. Keep this page open to
          continue.
        </p>
      )}
      {!done && (
        <div className="follow-journey-geo">
          <Button
            type="button"
            aria-pressed={geoEnabled}
            onClick={() => {
              if (geoEnabled) stopWatch();
              setGeoEnabled(!geoEnabled);
              setGeoError("");
            }}
          >
            <MapPin size={16} />
            {geoEnabled ? "Stop location suggestions" : "Suggest with location"}
          </Button>
          <p className="journey-field-hint">
            Optional, while this page is visible. Location never confirms
            boarding or arrival.
          </p>
        </div>
      )}
      {geoError && <p role="status">{geoError}</p>}
      {geoHint && (
        <p className="follow-journey-notice" role="status">
          {geoHint}
        </p>
      )}
      {!done && (
        <>
          <div
            className="follow-journey-current"
            aria-live="polite"
            aria-atomic="true"
          >
            <h2 className="sr-only">{current.kind}</h2>
            <p>{current.text}</p>
            {current.paymentInstructions && (
              <p className="follow-journey-fare">
                {current.paymentInstructions}
              </p>
            )}
            {current.timing.label && (
              <p className="follow-journey-timing">
                {current.timing.label}
                {current.timing.seconds !== null &&
                  ` · about ${Math.ceil(current.timing.seconds / 60)} min`}
              </p>
            )}
          </div>
          {currentLeg?.kind === "walk" && (
            <>
              {currentLeg.quality === "pedestrian-route" && (
                <p className="journey-google-credit">
                  <span translate="no">Google Maps</span> · walking directions
                </p>
              )}
              <ol className="follow-walking-directions">
                {currentLeg.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ol>
            </>
          )}
          {next && (
            <div className="follow-journey-next">
              <ArrowRight size={14} />
              <span>Next: {next.text}</span>
            </div>
          )}
          <div className="follow-journey-actions">
            <Button type="button" variant="primary" onClick={advance}>
              <Check size={16} />
              {labels[current.kind]}
            </Button>
            {history.length > 0 && (
              <Button type="button" onClick={undo}>
                <RotateCcw size={16} />
                Undo
              </Button>
            )}
          </div>
        </>
      )}
      {done && (
        <div className="follow-journey-complete" role="status">
          <Check size={24} />
          <p>Journey complete.</p>
          <Button type="button" onClick={undo}>
            Undo arrival
          </Button>
          <Button
            type="button"
            onClick={() => {
              clearGuidance();
              onClose();
            }}
          >
            Done
          </Button>
        </div>
      )}
      <details className="follow-journey-itinerary">
        <summary>Full itinerary</summary>
        <ol>
          {steps.map((s, i) => (
            <li
              key={s.id}
              aria-current={!done && i === stepIndex ? "step" : undefined}
              className={
                done || i < stepIndex
                  ? "is-done"
                  : i === stepIndex
                    ? "is-current"
                    : undefined
              }
            >
              {s.text}
            </li>
          ))}
        </ol>
      </details>
      {!done && onReplanFrom && (
        <div className="follow-journey-help">
          <Button type="button" onClick={() => setHelp("missed")}>
            Missed my stop
          </Button>
          <Button type="button" onClick={() => setHelp("lost")}>
            Cannot find this stop
          </Button>
          <Button type="button" onClick={() => setHelp("replan")}>
            Replan from here
          </Button>
        </div>
      )}
      {help && !done && onReplanFrom && (
        <section className="follow-replan" aria-label="Replan journey">
          <h3>Where are you now?</h3>
          <p>
            {help === "missed"
              ? "Your original alighting stop may be behind you. Stay aware of your surroundings and select where you can safely continue."
              : "Choose your actual location. Your itinerary position is not proof of where you are."}
          </p>
          <LocationSearch
            label="Replan from"
            value={replanLocation}
            onChange={setReplanLocation}
          />
          <Button
            type="button"
            disabled={locating}
            onClick={() => void locateForReplan()}
          >
            {locating ? "Finding you…" : "Use my current location"}
          </Button>
          <p className="journey-field-hint">
            Replanning sends the selected endpoints to Basis and, when needed,
            Google for walking directions.
          </p>
          {locationError && <p role="alert">{locationError}</p>}
          <div className="journey-actions">
            <Button
              type="button"
              variant="primary"
              disabled={!replanLocation}
              onClick={() => {
                if (!replanLocation) return;
                stopWatch();
                saveGuidance(state(false));
                onReplanFrom(replanLocation, steps.slice(0, stepIndex));
              }}
            >
              Find remaining journey
            </Button>
            <Button type="button" onClick={() => setHelp(null)}>
              Keep this itinerary
            </Button>
          </div>
        </section>
      )}
    </section>
  );
}
