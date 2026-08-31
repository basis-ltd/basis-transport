import { useEffect, useRef, useState } from "react";
import { environment } from "@/constants/environment.constants";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import type { Journey } from "./types";

function Paths({
  journey,
  selectedLeg,
  onSelectLeg,
}: {
  journey: Journey;
  selectedLeg: number;
  onSelectLeg: (index: number) => void;
}) {
  const map = useMap(),
    fitted = useRef("");
  useEffect(() => {
    if (!map) return;
    const bounds = new google.maps.LatLngBounds();
    const lines = journey.legs.map((leg, index) => {
      const path = leg.geometry.map(([lng, lat]) => ({ lat, lng }));
      path.forEach((p) => bounds.extend(p));
      if (leg.kind === "walk") {
        for (const [lng, lat] of [leg.from.coordinates, leg.to.coordinates])
          bounds.extend({ lat, lng });
      }
      const dashed = leg.kind === "walk" || leg.geometryQuality === "schematic";
      const line = new google.maps.Polyline({
        map,
        path,
        strokeColor: leg.kind === "walk" ? "#6e6e6e" : "#308449",
        strokeWeight: index === selectedLeg ? 7 : 4,
        strokeOpacity: dashed ? 0 : 0.85,
        icons: dashed
          ? [
              {
                icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
                offset: "0",
                repeat: "15px",
              },
            ]
          : undefined,
      });
      line.addListener("click", () => onSelectLeg(index));
      return line;
    });
    if (fitted.current !== journey.id && !bounds.isEmpty()) {
      map.fitBounds(bounds, 55);
      fitted.current = journey.id;
    }
    return () =>
      lines.forEach((l) => {
        google.maps.event.clearInstanceListeners(l);
        l.setMap(null);
      });
  }, [map, journey, selectedLeg, onSelectLeg]);
  return (
    <>
      {journey.legs.flatMap((leg, i) =>
        leg.kind === "ride"
          ? [
              <Marker
                key={`${i}-board`}
                position={{
                  lat: leg.board.coordinates[1],
                  lng: leg.board.coordinates[0],
                }}
                title={`Board ${leg.routeNumber}: ${leg.board.name}`}
                onClick={() => onSelectLeg(i)}
              />,
              <Marker
                key={`${i}-alight`}
                position={{
                  lat: leg.alight.coordinates[1],
                  lng: leg.alight.coordinates[0],
                }}
                title={`Alight: ${leg.alight.name}`}
                onClick={() => onSelectLeg(i)}
              />,
            ]
          : [
              <Marker
                key={`${i}-walk-from`}
                position={{
                  lat: leg.from.coordinates[1],
                  lng: leg.from.coordinates[0],
                }}
                title={`Walk from ${leg.from.name}`}
                onClick={() => onSelectLeg(i)}
              />,
              <Marker
                key={`${i}-walk-to`}
                position={{
                  lat: leg.to.coordinates[1],
                  lng: leg.to.coordinates[0],
                }}
                title={`Walk to ${leg.to.name}`}
                onClick={() => onSelectLeg(i)}
              />,
            ],
      )}
    </>
  );
}
export default function JourneyMap({
  journey,
  selectedLeg,
  onSelectLeg,
}: {
  journey: Journey;
  selectedLeg: number;
  onSelectLeg: (index: number) => void;
}) {
  const [failed, setFailed] = useState(false),
    [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 12000);
    return () => clearTimeout(timer);
  }, [loaded]);
  if (!environment.googleMapsApiKey || failed)
    return (
      <div className="journey-map-unavailable">
        <h3>Map unavailable</h3>
        <p>
          You can still follow the stop-by-stop directions. Try again when map
          access is available.
        </p>
      </div>
    );
  return (
    <div className="journey-map">
      <APIProvider
        apiKey={environment.googleMapsApiKey}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      >
        <Map
          defaultCenter={{ lat: -1.95, lng: 30.09 }}
          defaultZoom={12}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
        >
          <Paths
            journey={journey}
            selectedLeg={selectedLeg}
            onSelectLeg={onSelectLeg}
          />
        </Map>
      </APIProvider>
      <p className="journey-map-caption">
        Solid: source route shape · Dashed: walking or schematic connection
        {journey.legs.some(
          (leg) => leg.kind === "walk" && leg.quality === "unverified-access",
        ) &&
          ". Unchecked walks show endpoints only; use walking navigation for the street path."}
      </p>
    </div>
  );
}
