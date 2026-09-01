import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "@/components/inputs/Button";
import Select from "@/components/inputs/Select";
import JourneyShell, {
  LoadState,
  NetworkNotice,
} from "@/features/journey/JourneyShell";
import { useNetworkResource } from "@/features/journey/api";
import SaveButton from "@/features/journey/SaveButton";
import ReportIssue from "@/features/journey/ReportIssue";
import StopIdentity from "@/features/journey/StopIdentity";
import { locationFromStop, travelUrl } from "@/features/journey/locations";
import type { RouteDetail, StopDetail } from "@/features/journey/types";

export default function NetworkDetailsPage({
  kind,
}: {
  kind: "routes" | "stops";
}) {
  const { id = "" } = useParams(),
    path = `/${kind}/${encodeURIComponent(id)}`;
  const { data, error, loading, refresh } = useNetworkResource<
    RouteDetail | StopDetail
  >(path);
  const [patternId, setPatternId] = useState("");
  const route = data && "shortName" in data ? data : undefined,
    stop = data && "code" in data ? data : undefined;
  const pattern =
    route?.patterns.find((p) => p.id === patternId) || route?.patterns[0];
  const serviceTime = (seconds: number) =>
    `${Math.floor(seconds / 3600)}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}`;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
  }).format(new Date());
  const title = route
    ? `Route ${route.shortName}`
    : stop?.name || "Network details";
  return (
    <JourneyShell title={title} description={route?.longName} path={path}>
      <LoadState loading={loading} error={error} retry={refresh} />
      <NetworkNotice network={data?.network} />
      {data && (
        <>
          <div className="journey-actions">
            <SaveButton
              href={path}
              label={stop?.name || `${route?.shortName} · ${route?.longName}`}
              kind={kind === "routes" ? "route" : "stop"}
            />
            <ReportIssue
              kind={kind === "routes" ? "route" : "stop"}
              referenceId={id}
            />
          </div>
          {stop && (
            <>
              <StopIdentity stop={stop} />
              {stop.stopArea && stop.stopArea.boardingPoints.length > 1 && (
                <div className="journey-stop-area">
                  <h2>{stop.stopArea.name}</h2>
                  <p className="journey-field-hint">
                    This terminal has {stop.stopArea.boardingPoints.length}{" "}
                    boarding points. Select the platform your route uses.
                  </p>
                  <ul className="journey-route-stops">
                    {stop.stopArea.boardingPoints.map((p) => (
                      <li key={p.id}>
                        <Link to={`/stops/${encodeURIComponent(p.id)}`}>
                          {p.name}
                          {p.id === stop.id ? " (this stop)" : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="journey-actions">
                <Button
                  variant="primary"
                  route={`/travel?originLat=${stop.coordinates[1]}&originLon=${stop.coordinates[0]}&originStopId=${encodeURIComponent(stop.id)}&from=${encodeURIComponent(stop.name)}`}
                >
                  Start here
                </Button>
                <Button
                  route={`/travel?destLat=${stop.coordinates[1]}&destLon=${stop.coordinates[0]}&destStopId=${encodeURIComponent(stop.id)}&to=${encodeURIComponent(stop.name)}`}
                >
                  Travel here
                </Button>
              </div>
              <h2>Routes serving this stop</h2>
              <div className="journey-directory">
                {stop.routes.map((r) => (
                  <Link
                    className="journey-directory-item"
                    key={r.id}
                    to={`/routes/${encodeURIComponent(r.id)}`}
                  >
                    <span className="route-badge journey-route-badge">{r.shortName}</span>
                    <div>
                      <h2>{r.longName}</h2>
                      <p>{r.agency}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
          {route && pattern && (
            <>
              <div className="journey-preferences">
                <Select
                  label="Direction / variant"
                  value={pattern.id}
                  onChange={setPatternId}
                  options={route.patterns.map((p, i) => ({
                    value: p.id,
                    label: `To ${p.headsign} · variant ${i + 1}`,
                  }))}
                />
              </div>
              <p>
                {pattern.agency} · Towards {pattern.headsign}
              </p>
              <ol className="journey-route-stops">
                {pattern.stops.map((s) => (
                  <li key={s.sequence}>
                    <Link to={`/stops/${encodeURIComponent(s.id)}`}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ol>
              <Button
                variant="primary"
                route={travelUrl(
                  locationFromStop(pattern.stops[0]),
                  locationFromStop(pattern.stops[pattern.stops.length - 1]),
                )}
              >
                Plan this direction
              </Button>
              <details className="journey-data-notes">
                <summary>Source operating information</summary>
                <p>
                  {data.network.verification === "historic"
                    ? "Historical observations, not a current timetable."
                    : "Confirm service locally before travelling."}
                </p>
                <p>
                  Source service dates: {pattern.service.validFrom} –{" "}
                  {pattern.service.validTo}
                </p>
                {pattern.service.windows.map((w, i) => (
                  <p key={i}>
                    Source interval: about {Math.round(w.headwaySeconds / 60)}{" "}
                    minutes · {serviceTime(w.startSeconds)}–
                    {serviceTime(w.endSeconds)} (service-day hours)
                  </p>
                ))}
                <p>
                  Fare:{" "}
                  {pattern.fare?.verified &&
                  pattern.fare.validFrom <= today &&
                  pattern.fare.validTo >= today
                    ? `${pattern.fare.amount} RWF`
                    : "Unavailable"}
                </p>
              </details>
            </>
          )}
        </>
      )}
    </JourneyShell>
  );
}
