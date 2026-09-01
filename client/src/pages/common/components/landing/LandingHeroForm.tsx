import { useState } from "react";
import { ArrowDownUp, ArrowRight } from "lucide-react";
import Button from "@/components/inputs/Button";
import LocationSearch from "@/features/journey/LocationSearch";
import { journeyMessages as copy } from "@/features/journey/messages";
import { validLocation } from "@/features/journey/locations";
import type { JourneyLocation } from "@/features/journey/types";

export const LANDING_HERO_FORM_ID = "landing-hero-form";

interface Props {
  origin?: JourneyLocation;
  destination?: JourneyLocation;
  fromText?: string;
  toText?: string;
  onSearch: (origin: JourneyLocation, destination: JourneyLocation) => void;
  onLocationsChange?: (
    origin: JourneyLocation | undefined,
    destination: JourneyLocation | undefined,
  ) => void;
  busy?: boolean;
  /** Hero landing layout — stacked fields and peekaboo-style action row. */
  variant?: "hero" | "compact";
  onNearby?: () => void;
  nearbyBusy?: boolean;
}

export default function LandingHeroForm({
  origin: initialOrigin,
  destination: initialDestination,
  fromText,
  toText,
  onSearch,
  onLocationsChange,
  busy = false,
  variant = "compact",
  onNearby,
  nearbyBusy = false,
}: Props) {
  const [origin, setOrigin] = useState(initialOrigin),
    [destination, setDestination] = useState(initialDestination),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const isHero = variant === "hero";

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
    onLocationsChange?.(destination, origin);
    setRevision((v) => v + 1);
    setError("");
  };

  const originField = (
    <LocationSearch
      key={"origin-" + revision}
      label={copy.from}
      endpoint="origin"
      otherStopId={destination?.stopId}
      initialText={fromText}
      value={origin}
      appearance={isHero ? "field" : "composite"}
      onChange={(v) => {
        setOrigin(v);
        onLocationsChange?.(v, destination);
        setError("");
      }}
    />
  );

  const destinationField = (
    <LocationSearch
      key={"destination-" + revision}
      label={copy.to}
      endpoint="destination"
      otherStopId={origin?.stopId}
      initialText={toText}
      value={destination}
      appearance={isHero ? "field" : "composite"}
      onChange={(v) => {
        setDestination(v);
        onLocationsChange?.(origin, v);
        setError("");
      }}
    />
  );

  return (
    <form
      id={LANDING_HERO_FORM_ID}
      className={isHero ? "journey-form journey-form--hero" : "journey-form"}
      onSubmit={(e) => {
        e.preventDefault();
        if (!validLocation(origin) || !validLocation(destination)) {
          setError(copy.selectLocations);
          return;
        }
        if (
          origin.latitude === destination.latitude &&
          origin.longitude === destination.longitude
        ) {
          setError(copy.differentDestination);
          return;
        }
        setError("");
        onSearch(origin, destination);
      }}
    >
      <fieldset className="journey-fields">
        <legend className="sr-only">Plan a journey</legend>
        {isHero ? (
          <div className="journey-route-stack">
            {originField}
            {destinationField}
            <button
              type="button"
              className="journey-route-swap landing-affix-btn"
              aria-label={copy.swap}
              onClick={swap}
            >
              <ArrowDownUp size={18} />
            </button>
          </div>
        ) : (
          <>
            {originField}
            <Button
              type="button"
              size="icon-sm"
              className="journey-swap"
              aria-label={copy.swap}
              onClick={swap}
            >
              <ArrowDownUp size={19} />
            </Button>
            {destinationField}
          </>
        )}
      </fieldset>
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      {isHero ? (
        <>
          <p className="journey-form-consent">{copy.locationConsent}</p>
          <nav
            className="journey-hero-actions"
            aria-label="Journey planning actions"
          >
            {onNearby ? (
              <button
                type="button"
                className="landing-link-sweep"
                disabled={nearbyBusy}
                onClick={onNearby}
              >
                {nearbyBusy ? "Finding you…" : "Find nearby stops"}
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="journey-find-button landing-btn-primary max-sm:w-full"
              disabled={busy}
            >
              {busy ? copy.finding : copy.find}
            </button>
          </nav>
        </>
      ) : (
        <div className="journey-form-actions">
          <p>{copy.locationConsent}</p>
          <Button
            type="submit"
            variant="primary"
            className="journey-find-button"
            disabled={busy}
          >
            {busy ? copy.finding : copy.find}
            <ArrowRight size={17} />
          </Button>
        </div>
      )}
    </form>
  );
}
