import { useEffect, useRef } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";
import GoogleMapFrame from "./GoogleMapFrame";
import type { NetworkMapPattern } from "./types";

function Lines({
  patterns,
  selectedId,
  selectedSequence,
  onSelect,
  onStop,
}: Props) {
  const map = useMap(),
    fitted = useRef("");
  const selected = patterns.find((p) => p.id === selectedId);
  useEffect(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    const lines = patterns.map((pattern) => {
      const path = pattern.geometry.map(([lng, lat]) => ({ lat, lng }));
      if (!selected || pattern.id === selectedId)
        path.forEach((point) => bounds.extend(point));
      const active = pattern.id === selectedId;
      const schematic = pattern.geometryQuality === "schematic";
      const line = new google.maps.Polyline({
        map,
        path,
        strokeColor: active ? "#318549" : "#6e6e6e",
        strokeOpacity: schematic ? 0 : active ? 1 : 0.45,
        strokeWeight: active ? 6 : 3,
        zIndex: active ? 2 : 1,
        icons: schematic
          ? [
              {
                icon: { path: "M 0,-1 0,1", strokeOpacity: 0.8, scale: 2 },
                offset: "0",
                repeat: "12px",
              },
            ]
          : undefined,
      });
      line.addListener("click", () => onSelect(pattern.id));
      return line;
    });
    const identity = patterns.map((p) => p.id).join(",") + "/" + selectedId;
    if (fitted.current !== identity && !bounds.isEmpty()) {
      map.fitBounds(bounds, 48);
      fitted.current = identity;
    }
    return () =>
      lines.forEach((line) => {
        google.maps.event.clearInstanceListeners(line);
        line.setMap(null);
      });
  }, [map, patterns, selected, selectedId, onSelect]);
  useEffect(() => {
    const stop = selected?.stops.find((s) => s.sequence === selectedSequence);
    if (map && stop)
      map.panTo({ lat: stop.coordinates[1], lng: stop.coordinates[0] });
  }, [map, selected, selectedSequence]);
  return (
    <>
      {selected?.stops.map((stop) => (
        <Marker
          key={`${selected.id}:${stop.sequence}`}
          position={{ lat: stop.coordinates[1], lng: stop.coordinates[0] }}
          title={`${stop.sequence + 1}. ${stop.name}`}
          label={stop.sequence === selectedSequence ? "●" : undefined}
          onClick={() => onStop(stop.sequence)}
        />
      ))}
    </>
  );
}
interface Props {
  patterns: NetworkMapPattern[];
  selectedId: string;
  selectedSequence: number | null;
  onSelect: (id: string) => void;
  onStop: (sequence: number) => void;
}
export default function NetworkMapCanvas(props: Props) {
  return (
    <div className="journey-network-canvas">
      <GoogleMapFrame
        fallback={
          <div className="journey-map-unavailable">
            <h3>Map unavailable</h3>
            <p>
              Use the route selector and ordered stop list to explore this
              network. Reload the page to retry map access.
            </p>
          </div>
        }
      >
        <Map
          defaultCenter={{ lat: -1.95, lng: 30.09 }}
          defaultZoom={12}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
          keyboardShortcuts
        >
          <Lines {...props} />
        </Map>
      </GoogleMapFrame>
    </div>
  );
}
