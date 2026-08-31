import { lazy, Suspense, useState } from "react";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import JourneyShell, {
  LoadState,
  NetworkNotice,
} from "@/features/journey/JourneyShell";
import { useNetworkResource } from "@/features/journey/api";
import { metres, requestLocation } from "@/features/journey/locations";
import type { NetworkStop, Page, RouteSummary } from "@/features/journey/types";

const NetworkExplorer = lazy(
  () => import("@/features/journey/NetworkExplorer"),
);

export default function NetworkDirectoryPage({
  kind,
}: {
  kind: "routes" | "stops";
}) {
  const [params, setParams] = useSearchParams(),
    [locationError, setLocationError] = useState(""),
    [locating, setLocating] = useState(false);
  const page = Math.max(0, Number(params.get("page")) || 0),
    query = new URLSearchParams(params);
  const mapView = kind === "routes" && params.get("view") === "map";
  query.delete("view");
  query.delete("routeId");
  query.set("size", "20");
  query.set("page", String(page));
  const setFilter = (key: string, value: string) => {
    const q = new URLSearchParams(params);
    if (value) q.set(key, value);
    else q.delete(key);
    q.delete("page");
    setParams(q, { replace: true });
  };
  const resource = useNetworkResource<Page<NetworkStop | RouteSummary>>(
    mapView ? null : `/${kind}?${query}`,
  );
  const nearby = async () => {
    setLocating(true);
    setLocationError("");
    try {
      const p = await requestLocation();
      setParams({ lat: String(p.latitude), lng: String(p.longitude) });
    } catch (e) {
      setLocationError((e as Error).message);
    } finally {
      setLocating(false);
    }
  };
  return (
    <JourneyShell
      title={
        kind === "routes"
          ? "Explore bus routes"
          : params.has("lat")
            ? "Stops near you"
            : "Find a bus stop"
      }
      description={
        kind === "routes"
          ? "Browse lines and their directional stop patterns."
          : "Find your boarding point and the routes that serve it."
      }
      path={`/${kind}`}
    >
      {kind === "routes" && (
        <nav className="journey-view-switch" aria-label="Network view">
          <Button
            type="button"
            aria-pressed={!mapView}
            onClick={() => {
              const q = new URLSearchParams(params);
              q.delete("view");
              q.delete("routeId");
              setParams(q);
            }}
          >
            Route list
          </Button>
          <Button
            type="button"
            aria-pressed={mapView}
            onClick={() => {
              const q = new URLSearchParams(params);
              q.set("view", "map");
              q.delete("page");
              setParams(q);
            }}
          >
            Network map
          </Button>
        </nav>
      )}
      {mapView ? (
        <Suspense fallback={<p role="status">Loading network explorer…</p>}>
          <NetworkExplorer />
        </Suspense>
      ) : (
        <>
          <div className="journey-results-toolbar">
            <Input
              id="directory-search"
              label={`Search ${kind}`}
              labelClassName="sr-only"
              className="journey-directory-search"
              placeholder={`Search ${kind === "routes" ? "a route number or destination" : "a stop name"}`}
              value={params.get("q") || ""}
              maxLength={100}
              onChange={(e) => {
                const q = new URLSearchParams(params);
                if (e.target.value) q.set("q", e.target.value);
                else q.delete("q");
                q.delete("page");
                setParams(q, { replace: true });
              }}
            />
            {kind === "routes" && resource.data?.filters && (
              <>
                <Select
                  label="Operator"
                  value={params.get("agency") || ""}
                  onChange={(value) => setFilter("agency", value)}
                  options={[
                    { value: "", label: "All operators" },
                    ...resource.data.filters.agencies.map((agency) => ({
                      value: agency,
                      label: agency,
                    })),
                  ]}
                />
                <Select
                  label="Direction"
                  value={params.get("headsign") || ""}
                  onChange={(value) => setFilter("headsign", value)}
                  options={[
                    { value: "", label: "All directions" },
                    ...resource.data.filters.headsigns.map((headsign) => ({
                      value: headsign,
                      label: `Towards ${headsign}`,
                    })),
                  ]}
                />
              </>
            )}
            {kind === "stops" && (
              <Button
                type="button"
                disabled={locating}
                onClick={() => void nearby()}
              >
                <Navigation size={17} />
                {locating ? "Finding you…" : "Find nearby stops"}
              </Button>
            )}
          </div>
          {locationError && (
            <p role="alert" className="journey-error">
              {locationError}
            </p>
          )}
          {params.has("lat") && (
            <div className="journey-actions">
              <p className="journey-field-hint">
                Within 1 km · distances are straight-line, not walking
                directions.
              </p>
              <Button type="button" onClick={() => setParams({})}>
                Show all stops
              </Button>
            </div>
          )}
          <NetworkNotice network={resource.data?.network} />
          <LoadState
            loading={resource.loading}
            error={resource.error}
            retry={resource.refresh}
          />
          {resource.data && (
            <>
              <p className="journey-field-hint" aria-live="polite">
                {resource.data.totalCount} {kind}
              </p>
              <div className="journey-directory">
                {resource.data.rows.map((item) => (
                  <Link
                    className="journey-directory-item"
                    key={item.id}
                    to={`/${kind}/${encodeURIComponent(item.id)}`}
                  >
                    {"shortName" in item ? (
                      <span className="journey-route-badge">
                        {item.shortName}
                      </span>
                    ) : (
                      <MapPin size={21} />
                    )}
                    <div>
                      <h2>{"shortName" in item ? item.longName : item.name}</h2>
                      <p>
                        {"shortName" in item
                          ? `${item.agency} · ${item.patterns} directional patterns`
                          : item.distanceMeters !== undefined
                            ? `${metres(item.distanceMeters)} from your selected location`
                            : item.code}
                      </p>
                    </div>
                    <ArrowRight size={18} />
                  </Link>
                ))}
              </div>
              {!resource.data.rows.length && (
                <div className="journey-empty">
                  <h2>No {kind} found</h2>
                  <p>Try another name or search a wider area.</p>
                </div>
              )}
              {resource.data.totalPages > 1 && (
                <nav className="journey-pagination" aria-label="Results pages">
                  <Button
                    type="button"
                    disabled={page === 0}
                    onClick={() => {
                      const q = new URLSearchParams(params);
                      q.set("page", String(page - 1));
                      setParams(q);
                    }}
                  >
                    Previous
                  </Button>
                  <span>
                    {page + 1} / {resource.data.totalPages}
                  </span>
                  <Button
                    type="button"
                    disabled={page + 1 >= resource.data.totalPages}
                    onClick={() => {
                      const q = new URLSearchParams(params);
                      q.set("page", String(page + 1));
                      setParams(q);
                    }}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </JourneyShell>
  );
}
