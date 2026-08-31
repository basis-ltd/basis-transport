import { useId, useState } from "react";
import { Map, Marker, useMap } from "@vis.gl/react-google-maps";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/inputs/Button";
import Input from "@/components/inputs/Input";
import GoogleMapFrame from "./GoogleMapFrame";
import type { JourneyLocation } from "./types";

type Point = { lat: number; lng: number };
const defaultCenter = { lat: -1.95, lng: 30.09 };
function CenterButton({ onPick }: { onPick: (point: Point) => void }) {
  const map = useMap();
  return (
    <Button
      className="journey-pin-center"
      type="button"
      disabled={!map}
      onClick={() => {
        const center = map?.getCenter();
        if (center) onPick(center.toJSON());
      }}
    >
      Use map center
    </Button>
  );
}

export function parsePin(latitude: string, longitude: string): Point | null {
  if (!latitude.trim() || !longitude.trim()) return null;
  const lat = Number(latitude),
    lng = Number(longitude);
  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
    ? { lat, lng }
    : null;
}

export default function MapPinPicker({
  label,
  value,
  onChoose,
  onClose,
}: {
  label: string;
  value?: JourneyLocation;
  onChoose: (location: JourneyLocation) => void;
  onClose: () => void;
}) {
  const id = useId();
  const [latitude, setLatitude] = useState(value ? String(value.latitude) : "");
  const [longitude, setLongitude] = useState(
    value ? String(value.longitude) : "",
  );
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const point = parsePin(latitude, longitude);
  const [center] = useState(
    value ? { lat: value.latitude, lng: value.longitude } : defaultCenter,
  );
  const pick = (p: Point) => {
    setLatitude(String(Number(p.lat.toFixed(6))));
    setLongitude(String(Number(p.lng.toFixed(6))));
    setError("");
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="journey-page journey-pin-dialog">
        <DialogTitle>Choose {label.toLowerCase()} on map</DialogTitle>
        <DialogDescription>
          Click to place a pin, or use the arrow keys to pan the map and choose
          its center. You can also enter coordinates below.
        </DialogDescription>
        <div className="journey-pin-canvas">
          <GoogleMapFrame
            fallback={
              <div className="journey-map-unavailable">
                <h3>Map unavailable</h3>
                <p>
                  Enter coordinates below, or cancel and search for a stop or
                  place. Reload the page to retry map access.
                </p>
              </div>
            }
          >
            <Map
              defaultCenter={center}
              defaultZoom={14}
              gestureHandling="cooperative"
              disableDefaultUI
              zoomControl
              keyboardShortcuts
              onClick={(event) => {
                if (event.detail.latLng) pick(event.detail.latLng);
              }}
            >
              {point && <Marker position={point} title="Selected location" />}
              <CenterButton onPick={pick} />
            </Map>
          </GoogleMapFrame>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!point) {
              setError(
                "Enter a latitude from −90 to 90 and a longitude from −180 to 180, or select a point on the map.",
              );
              return;
            }
            onChoose({
              latitude: point.lat,
              longitude: point.lng,
              name:
                name.trim() ||
                `Map pin (${point.lat.toFixed(5)}, ${point.lng.toFixed(5)})`,
            });
          }}
        >
          <div className="journey-pin-coordinates">
            <Input
              id={`${id}-lat`}
              label="Latitude"
              inputMode="decimal"
              value={latitude}
              maxLength={30}
              placeholder="e.g. −1.95"
              onChange={(e) => {
                setLatitude(e.target.value);
                setError("");
              }}
            />
            <Input
              id={`${id}-lng`}
              label="Longitude"
              inputMode="decimal"
              value={longitude}
              maxLength={30}
              placeholder="e.g. 30.09"
              onChange={(e) => {
                setLongitude(e.target.value);
                setError("");
              }}
            />
          </div>
          <Input
            id={`${id}-label`}
            label="Location label (optional)"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Home entrance"
          />
          {error && (
            <p className="journey-error" role="alert">
              {error}
            </p>
          )}
          <p className="journey-field-hint" role="status">
            {point
              ? `Selected: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}. Confirm to use this point.`
              : "No point selected."}
          </p>
          <p className="journey-field-hint">
            Maps are provided by Google. Planning sends your selected
            coordinates to Basis and its pedestrian-routing provider. No GPS is
            requested here.
          </p>
          <div className="journey-actions">
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Use this location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
