import { useState } from "react";
import { ArrowDownUp, ArrowRight } from "lucide-react";
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
  busy?: boolean;
}
export default function LandingHeroForm({
  origin: initialOrigin,
  destination: initialDestination,
  fromText,
  toText,
  onSearch,
  busy = false,
}: Props) {
  const [origin, setOrigin] = useState(initialOrigin),
    [destination, setDestination] = useState(initialDestination),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  return (
    <form
      id={LANDING_HERO_FORM_ID}
      className="journey-form"
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
        <LocationSearch
          key={"origin-" + revision}
          label={copy.from}
          initialText={fromText}
          value={origin}
          onChange={(v) => {
            setOrigin(v);
            setError("");
          }}
        />
        <button
          type="button"
          className="journey-swap journey-icon-button"
          aria-label={copy.swap}
          onClick={() => {
            setOrigin(destination);
            setDestination(origin);
            setRevision((v) => v + 1);
            setError("");
          }}
        >
          <ArrowDownUp size={19} />
        </button>
        <LocationSearch
          key={"destination-" + revision}
          label={copy.to}
          initialText={toText}
          value={destination}
          onChange={(v) => {
            setDestination(v);
            setError("");
          }}
        />
      </fieldset>
      {error && (
        <p className="journey-error" role="alert">
          {error}
        </p>
      )}
      <div className="journey-form-actions">
        <p>{copy.locationConsent}</p>
        <button type="submit" className="journey-button" disabled={busy}>
          {busy ? copy.finding : copy.find}
          <ArrowRight size={17} />
        </button>
      </div>
    </form>
  );
}
