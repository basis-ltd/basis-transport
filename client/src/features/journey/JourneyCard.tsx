import { BusFront, ChevronDown, Footprints, Map, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/inputs/Button";
import { journeyMessages as copy } from "./messages";
import { metres, minutes } from "./locations";
import type { Journey } from "./types";

export default function JourneyCard({
  journey,
  sourceDate,
  expanded,
  onExpand,
  onMap,
  onStart,
  selectedLeg,
  onSelectLeg,
}: {
  journey: Journey;
  sourceDate?: string | null;
  expanded: boolean;
  onExpand: () => void;
  onMap: () => void;
  onStart?: () => void;
  selectedLeg: number;
  onSelectLeg: (i: number) => void;
}) {
  const rides = journey.legs.filter((l) => l.kind === "ride");
  const steps = journey.steps ?? [];
  return (
    <article className={`journey-card ${expanded ? "is-selected" : ""}`}>
      <Button
        type="button"
        className="journey-card-summary !h-auto w-full justify-start rounded-none border-0 bg-transparent px-[22px] py-[22px] shadow-none hover:bg-(--surface) hover:opacity-100"
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
            {!rides.length
              ? "Walking only"
              : journey.transfers
                ? `${journey.transfers} ${journey.transfers === 1 ? "change" : "changes"}`
                : "Direct connection"}
          </strong>
          <span>
            {metres(journey.walkingMeters)} walking ·{" "}
            {metres(journey.ridingMeters)} ride
          </span>
        </span>
        <span className="journey-fare">
          {journey.fareQuote?.status === "partial"
            ? "Partial fare"
            : journey.fareRwf === null
              ? "Fare unavailable"
              : `${journey.fareRwf.toLocaleString()} RWF`}
          <ChevronDown size={17} />
        </span>
      </Button>
      <p className="journey-card-provenance">
        Source coverage:{" "}
        {sourceDate ? `through ${sourceDate}` : "date unavailable"} · not live
        service
      </p>
      {journey.durationSeconds !== null && (
        <p className="journey-card-provenance">
          {journey.timingStatus === "scheduled"
            ? "Timetable journey"
            : "Estimated journey"}
          : {minutes(journey.durationSeconds)} including walking
          {rides.length ? " and waiting" : ""}
        </p>
      )}
      {expanded && (
        <div id={`journey-${journey.id}`} className="journey-card-detail">
          <div className="journey-detail-toolbar">
            <p>Follow your connection</p>
            <div className="journey-detail-actions">
              {onStart && (
                <Button type="button" variant="primary" onClick={onStart}>
                  Start journey
                </Button>
              )}
              <Button type="button" onClick={onMap}>
                <Map size={16} />
                Show map
              </Button>
            </div>
          </div>
          {steps.length > 0 ? (
            <ol className="journey-spine journey-spine-steps">
              {steps.map((step) => {
                const leg =
                  step.legIndex === null
                    ? undefined
                    : journey.legs[step.legIndex];
                return (
                  <li
                    key={step.id}
                    className={`${step.kind} ${step.legIndex === selectedLeg ? "is-active" : ""}`}
                  >
                    <span className="journey-spine-node">
                      {step.kind === "walk" || step.kind === "transfer" ? (
                        <Footprints size={17} />
                      ) : (
                        <BusFront size={17} />
                      )}
                    </span>
                    <div className="journey-leg">
                      {step.legIndex === null ? (
                        <p className="journey-leg-title">{step.text}</p>
                      ) : (
                        <Button
                          type="button"
                          className="journey-step-select"
                          aria-pressed={step.legIndex === selectedLeg}
                          onClick={() => onSelectLeg(step.legIndex!)}
                        >
                          {step.text}
                        </Button>
                      )}
                      {step.paymentInstructions && (
                        <p className="journey-fare-note">
                          {step.paymentInstructions}
                        </p>
                      )}
                      {step.timing.label && (
                        <p className="journey-timing-note">
                          {step.timing.label}
                          {step.timing.seconds !== null &&
                            ` · about ${Math.ceil(step.timing.seconds / 60)} min`}
                        </p>
                      )}
                      {leg?.kind === "walk" && (
                        <>
                          {leg.quality === "pedestrian-route" && (
                            <p className="journey-google-credit">
                              <span translate="no">Google Maps</span> · walking
                              directions
                            </p>
                          )}
                          <details>
                            <summary>Walking directions</summary>
                            <ol>
                              {leg.instructions.map((instruction, i) => (
                                <li key={i}>{instruction}</li>
                              ))}
                            </ol>
                            <small>
                              Check pedestrian access and crossings locally.
                            </small>
                          </details>
                        </>
                      )}
                      {step.kind === "ride" && leg?.kind === "ride" && (
                        <>
                          <details>
                            <summary>View intermediate stops</summary>
                            <ol>
                              {leg.stops.map((s) => (
                                <li key={s.sequence}>
                                  <Link
                                    to={`/stops/${encodeURIComponent(s.id)}`}
                                  >
                                    {s.name}
                                  </Link>
                                </li>
                              ))}
                            </ol>
                          </details>
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
                );
              })}
            </ol>
          ) : (
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
                    <Button
                      type="button"
                      className="journey-leg-title !h-auto min-h-8 justify-start border-0 bg-transparent p-0 font-medium shadow-none hover:bg-transparent hover:opacity-100"
                      onClick={() => onSelectLeg(index)}
                    >
                      {leg.kind === "walk"
                        ? `Walk to ${leg.to.name}`
                        : `Board ${leg.routeNumber} at ${leg.board.name}`}
                    </Button>
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
          )}
          {journey.fareQuote && journey.fareQuote.status !== "unknown" && (
            <div className="journey-fare-breakdown">
              <p>
                Fare subtotal:{" "}
                {journey.fareQuote.subtotal !== null
                  ? `${journey.fareQuote.subtotal.toLocaleString()} RWF`
                  : "unknown"}
              </p>
              {journey.fareQuote.transferAdjustments.map((a, i) => (
                <p key={i}>
                  {a.description}: {a.amount.toLocaleString()} RWF
                </p>
              ))}
            </div>
          )}
          {journey.fareQuote?.warnings?.map((warning) => (
            <p className="journey-card-note" key={warning}>
              {warning}
            </p>
          ))}
          <div className="journey-card-note">
            {rides.length
              ? `${
                  steps.some(
                    (s) => s.kind === "wait" && s.timing.status === "unknown",
                  ) || !steps.length
                    ? "Waiting time is unknown."
                    : "Timetable times are not live predictions."
                } Confirm the route number and destination before boarding.`
              : "Check pedestrian access and crossings along the route."}
          </div>
        </div>
      )}
    </article>
  );
}
