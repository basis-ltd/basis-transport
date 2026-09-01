import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Map as MapIcon } from "lucide-react";
import Button from "@/components/inputs/Button";
import BackButton from "@/components/inputs/BackButton";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNetworkResource } from "./api";
import { LoadState, NetworkNotice } from "./JourneyShell";
import type { NetworkMapData } from "./types";

const NetworkMapCanvas = lazy(() => import("./NetworkMapCanvas"));
export default function NetworkExplorer() {
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState("");
  const [sequence, setSequence] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [desktop, setDesktop] = useState(
    () => window.matchMedia("(min-width: 900px)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(min-width: 900px)");
    const update = () => {
      setDesktop(media.matches);
      if (media.matches) setMapOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const query = new URLSearchParams();
  for (const key of ["q", "routeId", "agency", "headsign"]) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }
  const resource = useNetworkResource<NetworkMapData>(`/network/map?${query}`);
  const data = resource.data;
  const selected =
    data?.patterns.find((p) => p.id === selectedId) || data?.patterns[0];
  const currentSequence = selected?.id === selectedId ? sequence : null;
  const currentStop = selected?.stops.find(
    (s) => s.sequence === currentSequence,
  );
  const select = useCallback((id: string) => {
    setSelectedId(id);
    setSequence(null);
  }, []);
  const selectStop = useCallback(
    (next: number) => {
      if (selected) {
        setSelectedId(selected.id);
        setSequence(next);
      }
    },
    [selected],
  );
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: key === "q" });
    setSelectedId("");
    setSequence(null);
  };
  const map = data && (
    <Suspense fallback={<p role="status">Loading map…</p>}>
      <NetworkMapCanvas
        patterns={data.patterns}
        selectedId={selected?.id || ""}
        selectedSequence={currentSequence}
        onSelect={select}
        onStop={selectStop}
      />
    </Suspense>
  );
  return (
    <>
      <div className="journey-explorer-filters">
        <Input
          label="Search network"
          value={params.get("q") || ""}
          maxLength={100}
          placeholder="Route number or destination"
          onChange={(e) => setFilter("q", e.target.value)}
        />
        <Select
          label="Route"
          value={params.get("routeId") || ""}
          onChange={(v) => setFilter("routeId", v)}
          options={[
            { value: "", label: "All routes" },
            ...(data?.filters.routes || []).map((r) => ({
              value: r.id,
              label: `${r.number} · ${r.name}`,
            })),
          ]}
        />
        <Select
          label="Operator"
          value={params.get("agency") || ""}
          onChange={(v) => setFilter("agency", v)}
          options={[
            { value: "", label: "All operators" },
            ...(data?.filters.agencies || []).map((value) => ({
              value,
              label: value,
            })),
          ]}
        />
        <Select
          label="Direction"
          value={params.get("headsign") || ""}
          onChange={(v) => setFilter("headsign", v)}
          options={[
            { value: "", label: "All directions" },
            ...(data?.filters.headsigns || []).map((value) => ({
              value,
              label: `Towards ${value}`,
            })),
          ]}
        />
      </div>
      <NetworkNotice network={data?.network} />
      <LoadState
        loading={resource.loading}
        error={resource.error}
        retry={resource.refresh}
      />
      {data && (
        <>
          <p className="journey-field-hint" role="status">
            {data.patterns.length} of {data.totalPatterns} directional patterns
            · {data.totalRoutes} routes match
          </p>
          <p className="journey-field-hint">
            Dataset {data.network.version} · source validity through{" "}
            {data.network.validTo || "unknown"}.
          </p>
          {data.truncated && (
            <p className="journey-network-warning">
              This overview is limited. Choose a route or direction to show more
              detail; it is not the complete network.
            </p>
          )}
          {data.filters.routesTruncated && (
            <p className="journey-field-hint">
              The route selector is limited. Use the route directory to find
              additional routes.
            </p>
          )}
          {!selected ? (
            <div className="journey-empty">
              <h2>No routes match</h2>
              <p>Clear a filter or try another route number.</p>
              <Button type="button" onClick={() => setParams({ view: "map" })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="journey-explorer-layout">
                <section
                  className="journey-explorer-details"
                  aria-label="Route directions and stops"
                >
                  <Select
                    label="Route variant"
                    value={selected.id}
                    onChange={select}
                    options={data.patterns.map((p) => {
                      const variants = data.patterns.filter(
                        (v) =>
                          v.routeId === p.routeId && v.headsign === p.headsign,
                      );
                      const suffix =
                        variants.length > 1
                          ? ` · variant ${variants.findIndex((v) => v.id === p.id) + 1} of ${variants.length}`
                          : "";
                      return {
                        value: p.id,
                        label: `${p.routeNumber} → ${p.headsign || p.routeName} · ${p.stopCount} stops${suffix}`,
                      };
                    })}
                  />
                  <div className="journey-explorer-route">
                    <span className="route-badge journey-route-badge">
                      {selected.routeNumber}
                    </span>
                    <div>
                      <h2>
                        Towards{" "}
                        {selected.headsign || "destination not supplied"}
                      </h2>
                      <p>{selected.agency}</p>
                    </div>
                  </div>
                  <Link
                    className="journey-text-link"
                    to={`/routes/${encodeURIComponent(selected.routeId)}`}
                  >
                    Route details and operating information
                  </Link>
                  <p className="journey-field-hint">
                    Stop order is directional. A route on this map does not mean
                    a bus is running now.
                  </p>
                  {!desktop && (
                    <Button type="button" onClick={() => setMapOpen(true)}>
                      <MapIcon size={17} />
                      Open network map
                    </Button>
                  )}
                  <ol
                    className="journey-network-spine"
                    aria-label="Stops in travel order"
                  >
                    {selected.stops.map((stop) => (
                      <li
                        key={`${selected.id}:${stop.sequence}`}
                        className={
                          stop.sequence === currentSequence ? "is-selected" : ""
                        }
                      >
                        <button
                          type="button"
                          aria-pressed={stop.sequence === currentSequence}
                          onClick={() => selectStop(stop.sequence)}
                        >
                          <span
                            className="journey-network-dot"
                            aria-hidden="true"
                          />
                          <span>
                            {stop.name}
                            <small>
                              Stop {stop.sequence + 1} · {stop.code}
                            </small>
                          </span>
                        </button>
                        {stop.sequence === currentSequence && (
                          <Link
                            className="journey-text-link"
                            to={`/stops/${encodeURIComponent(stop.id)}`}
                          >
                            Stop details and journey planning
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                  {selected.stopsTruncated && (
                    <p className="journey-network-warning">
                      Only the first {selected.stops.length} of{" "}
                      {selected.stopCount} stops are shown. Open route details
                      for the full sequence.
                    </p>
                  )}
                </section>
                {desktop && (
                  <section
                    className="journey-explorer-map"
                    aria-label="Network map"
                  >
                    {map}
                    <MapLegend />
                    <p className="journey-field-hint" role="status">
                      {currentStop
                        ? `Selected stop: ${currentStop.name}`
                        : `Selected route: ${selected.routeNumber} towards ${selected.headsign}`}
                    </p>
                  </section>
                )}
              </div>
              {!desktop && (
                <Dialog open={mapOpen} onOpenChange={setMapOpen}>
                  <DialogContent className="journey-page journey-network-dialog">
                    <DialogTitle>
                      Network map · {selected.routeNumber}
                    </DialogTitle>
                    <DialogDescription>
                      Towards {selected.headsign}. Select a line to change
                      direction, or a stop marker for its name.
                    </DialogDescription>
                    <NetworkNotice network={data.network} />
                    {mapOpen && map}
                    <MapLegend />
                    <p role="status">
                      {currentStop
                        ? `Selected stop: ${currentStop.name}`
                        : `${selected.stopCount} stops on this pattern`}
                    </p>
                    <BackButton onClick={() => setMapOpen(false)}>
                      Back to stop list
                    </BackButton>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function MapLegend() {
  return (
    <p className="journey-network-legend">
      <span>Solid: source shape, simplified for overview.</span>
      <span>Dashed: schematic connection, not a road path.</span>
    </p>
  );
}
