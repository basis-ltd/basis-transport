import { ExternalLink } from "lucide-react";
import type { WalkLeg } from "./types";

function walkingNavigationUrl(leg: WalkLeg): string {
  const coordinates = ([lng, lat]: [number, number]) => `${lat},${lng}`;
  const params = new URLSearchParams({
    api: "1",
    origin: coordinates(leg.from.coordinates),
    destination: coordinates(leg.to.coordinates),
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

export default function WalkingDirections({ leg }: { leg: WalkLeg }) {
  const unverified = leg.quality === "unverified-access";
  return (
    <div className="journey-walking-directions">
      {unverified ? (
        <p className="journey-field-hint">
          Walking path not checked · {leg.distanceMeters} m minimum. The actual
          walk may be longer; time is unknown.
        </p>
      ) : leg.quality === "pedestrian-route" ? (
        <p className="journey-google-credit">
          <span translate="no">Google Maps</span> · walking directions
        </p>
      ) : null}
      {leg.instructions.length > 0 && (
        <details open={unverified || undefined}>
          <summary>
            {unverified ? "Getting to the next point" : "Walking directions"}
          </summary>
          <ol>
            {leg.instructions.map((instruction, i) => (
              <li key={i}>{instruction}</li>
            ))}
          </ol>
          <small>Check pedestrian access and crossings locally.</small>
        </details>
      )}
      <a
        className="journey-walking-link"
        href={walkingNavigationUrl(leg)}
        target="_blank"
        rel="noopener noreferrer"
        referrerPolicy="no-referrer"
      >
        Open walking navigation to {leg.to.name}
        <ExternalLink size={14} aria-hidden="true" />
        <span className="sr-only"> (opens Google Maps in a new tab)</span>
      </a>
    </div>
  );
}
