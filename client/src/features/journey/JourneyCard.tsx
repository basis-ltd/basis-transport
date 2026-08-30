import { BusFront, ChevronDown, Footprints, Map, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { journeyMessages as copy } from "./messages";
import { metres, minutes } from "./locations";
import type { Journey } from "./types";

export default function JourneyCard({
  journey,
  sourceDate,
  expanded,
  onExpand,
  onMap,
  selectedLeg,
  onSelectLeg,
}: {
  journey: Journey;
  sourceDate?: string | null;
  expanded: boolean;
  onExpand: () => void;
  onMap: () => void;
  selectedLeg: number;
  onSelectLeg: (i: number) => void;
}) {
  const rides = journey.legs.filter((l) => l.kind === "ride");
  return (
    <article className={`journey-card ${expanded ? "is-selected" : ""}`}>
      <button
        type="button"
        className="journey-card-summary"
        aria-expanded={expanded}
        aria-controls={`journey-${journey.id}`}
        onClick={onExpand}
      >
        <span className="journey-route-badges">
          {rides.map((r, i) => (
            <span key={i} className="journey-route-badge">
              {r.routeNumber}
            </span>
          ))}
        </span>
        <span className="journey-card-title">
          <strong>
            {journey.transfers
              ? `${journey.transfers} ${journey.transfers === 1 ? "change" : "changes"}`
              : "Direct connection"}
          </strong>
          <span>
            {metres(journey.walkingMeters)} walking ·{" "}
            {metres(journey.ridingMeters)} ride
          </span>
        </span>
        <span className="journey-fare">
          {journey.fareRwf === null
            ? "Fare unavailable"
            : `${journey.fareRwf.toLocaleString()} RWF`}
          <ChevronDown size={17} />
        </span>
      </button>
      <p className="journey-card-provenance">
        Source coverage:{" "}
        {sourceDate ? `through ${sourceDate}` : "date unavailable"} · not live
        service
      </p>
      {expanded && (
        <div id={`journey-${journey.id}`} className="journey-card-detail">
          <div className="journey-detail-toolbar">
            <p>Follow your connection</p>
            <button
              type="button"
              className="journey-button secondary"
              onClick={onMap}
            >
              <Map size={16} />
              Show map
            </button>
          </div>
          <ol className="journey-spine">
            {journey.legs.map((leg, index) => (
              <li
                key={index}
                className={`${leg.kind} ${selectedLeg === index ? "is-active" : ""}`}
              >
                <span className="journey-spine-node">
                  {leg.kind === "walk" ? (
                    <Footprints size={17} />
                  ) : (
                    <BusFront size={17} />
                  )}
                </span>
                <div className="journey-leg">
                  <button
                    type="button"
                    className="journey-leg-title"
                    onClick={() => onSelectLeg(index)}
                  >
                    {leg.kind === "walk"
                      ? `Walk to ${leg.to.name}`
                      : `Board ${leg.routeNumber} at ${leg.board.name}`}
                  </button>
                  {leg.kind === "walk" ? (
                    <>
                      <p>
                        {metres(leg.distanceMeters)} · About{" "}
                        {minutes(leg.durationSeconds)}
                      </p>
                      {leg.quality === "pedestrian-route" && (
                        <p className="journey-google-credit">
                          <span translate="no">Google Maps</span> · walking
                          directions
                        </p>
                      )}
                      {leg.instructions.length > 0 && (
                        <details>
                          <summary>Walking directions</summary>
                          <ol>
                            {leg.instructions.map((instruction, i) => (
                              <li key={i}>{instruction}</li>
                            ))}
                          </ol>
                          <small>
                            Check pedestrian access and crossings locally.
                            Walking routes can be missing clear paths.
                          </small>
                        </details>
                      )}
                    </>
                  ) : (
                    <>
                      <p>
                        Towards <strong>{leg.headsign}</strong> · {leg.agency}
                      </p>
                      <p>
                        {copy.stops(leg.stops.length - 1)} ·{" "}
                        {metres(leg.distanceMeters)}
                        {leg.durationSeconds !== null
                          ? ` · About ${minutes(leg.durationSeconds)} riding (source estimate)`
                          : ""}
                      </p>
                      <details>
                        <summary>View intermediate stops</summary>
                        <ol>
                          {leg.stops.map((s) => (
                            <li key={s.sequence}>
                              <Link to={`/stops/${encodeURIComponent(s.id)}`}>
                                {s.name}
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </details>
                      <p className="journey-alight">
                        <MapPin size={16} />
                        Get off at{" "}
                        <Link
                          to={`/stops/${encodeURIComponent(leg.alight.id)}`}
                        >
                          {leg.alight.name}
                        </Link>
                      </p>
                      {leg.geometryQuality === "schematic" && (
                        <small>
                          Map connection is schematic; the road path is
                          unverified.
                        </small>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="journey-card-note">
            Waiting time is unknown. Confirm the route number and destination
            before boarding.
          </div>
        </div>
      )}
    </article>
  );
}
