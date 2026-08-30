import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import JourneyShell, {
  LoadState,
  NetworkNotice,
} from "@/features/journey/JourneyShell";
import { useNetworkResource } from "@/features/journey/api";
import SaveButton from "@/features/journey/SaveButton";
import ReportIssue from "@/features/journey/ReportIssue";
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
              <div className="journey-actions">
                <Link
                  className="journey-button"
                  to={`/travel?originLat=${stop.coordinates[1]}&originLon=${stop.coordinates[0]}&originStopId=${encodeURIComponent(stop.id)}&from=${encodeURIComponent(stop.name)}`}
                >
                  Start here
                </Link>
                <Link
                  className="journey-button secondary"
                  to={`/travel?destLat=${stop.coordinates[1]}&destLon=${stop.coordinates[0]}&destStopId=${encodeURIComponent(stop.id)}&to=${encodeURIComponent(stop.name)}`}
                >
                  Travel here
                </Link>
              </div>
              <h2>Routes serving this stop</h2>
              <div className="journey-directory">
                {stop.routes.map((r) => (
                  <Link
                    className="journey-directory-item"
                    key={r.id}
                    to={`/routes/${encodeURIComponent(r.id)}`}
                  >
                    <span className="journey-route-badge">{r.shortName}</span>
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
                <label>
                  Direction / variant
                  <select
                    value={pattern.id}
                    onChange={(e) => setPatternId(e.target.value)}
                  >
                    {route.patterns.map((p, i) => (
                      <option value={p.id} key={p.id}>
                        To {p.headsign} · variant {i + 1}
                      </option>
                    ))}
                  </select>
                </label>
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
              <Link
                className="journey-button"
                to={travelUrl(
                  locationFromStop(pattern.stops[0]),
                  locationFromStop(pattern.stops[pattern.stops.length - 1]),
                )}
              >
                Plan this direction
              </Link>
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
