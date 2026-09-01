import { useEffect, useState } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import GoogleMapFrame from "@/features/journey/GoogleMapFrame";
import {
  approximateKigaliPoint,
  randomKigaliPoint,
  type MapPoint,
} from "@/features/journey/kigali-view";
import type { JourneyLocation } from "@/features/journey/types";

interface Props {
  origin?: JourneyLocation;
  destination?: JourneyLocation;
}
const point = (location: JourneyLocation): MapPoint => ({
  lat: location.latitude,
  lng: location.longitude,
});

function Endpoints({
  origin,
  destination,
  center,
}: Props & { center: MapPoint }) {
  const map = useMap();
  const fromLat = origin?.latitude,
    fromLng = origin?.longitude;
  const toLat = destination?.latitude,
    toLng = destination?.longitude;
  useEffect(() => {
    if (!map) return;
    const positions: MapPoint[] = [];
    if (fromLat !== undefined && fromLng !== undefined)
      positions.push({ lat: fromLat, lng: fromLng });
    if (toLat !== undefined && toLng !== undefined)
      positions.push({ lat: toLat, lng: toLng });
    const fit = () => {
      if (positions.length === 2 && (fromLat !== toLat || fromLng !== toLng)) {
        const bounds = new google.maps.LatLngBounds();
        positions.forEach((p) => bounds.extend(p));
        map.fitBounds(bounds, 64);
      } else {
        map.setCenter(positions[0] ?? center);
        map.setZoom(positions.length ? 15 : 13);
      }
    };
    fit();
    // Keep both endpoints in view across the stacked/mobile breakpoint.
    if (typeof ResizeObserver === "undefined") return;
    const resize = new ResizeObserver(fit);
    resize.observe(map.getDiv());
    return () => resize.disconnect();
  }, [map, center, fromLat, fromLng, toLat, toLng]);
  return (
    <>
      {origin && (
        <Marker
          position={point(origin)}
          title={`From: ${origin.name}`}
          label={{ text: "A", color: "#ffffff", fontWeight: "600" }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: "#318549",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />
      )}
      {destination && (
        <Marker
          position={point(destination)}
          title={`To: ${destination.name}`}
          label={{ text: "B", color: "#ffffff", fontWeight: "600" }}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: "#000000",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />
      )}
    </>
  );
}

export default function LandingJourneyMap({ origin, destination }: Props) {
  const [center, setCenter] = useState(randomKigaliPoint);
  const [, setApproximate] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    void approximateKigaliPoint(controller.signal).then((p) => {
      if (!controller.signal.aborted && p) {
        setCenter(p);
        setApproximate(true);
      }
    });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return (
    <aside className="landing-journey-map" aria-label="Journey map">
      <div className="landing-map-canvas">
        <GoogleMapFrame
          fallback={
            <div className="journey-map-unavailable">
              <MapPin size={28} aria-hidden="true" />
              <h2>Map unavailable</h2>
              <p>
                Your selected places are listed below. You can still search for
                a journey.
              </p>
            </div>
          }
        >
          <Map
            defaultCenter={center}
            defaultZoom={13}
            maxZoom={17}
            gestureHandling="cooperative"
            disableDefaultUI
            zoomControl
            keyboardShortcuts
            styles={[
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ]}
          >
            <Endpoints
              origin={origin}
              destination={destination}
              center={center}
            />
          </Map>
        </GoogleMapFrame>
      </div>
      <div
        className="landing-map-endpoints"
        aria-live="polite"
        aria-atomic="true"
      >
        <p>
          <span className="landing-map-marker is-origin" aria-hidden="true">
            A
          </span>
          <span>
            <small>From</small>
            {origin?.name || "Choose your starting point"}
          </span>
        </p>
        <p>
          <span className="landing-map-marker" aria-hidden="true">
            B
          </span>
          <span>
            <small>To</small>
            {destination?.name || "Choose your destination"}
          </span>
        </p>
      </div>
      <p className="landing-map-note">
        The initial view uses an approximate IP location via ipapi, or a point
        in Kigali. Your precise location is only requested when you choose it.
      </p>
    </aside>
  );
}
