import { environment } from '@/constants/environment.constants';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { LocateFixed, MapPin } from 'lucide-react';

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };

interface LandingHeroMapPanelProps {
  userPosition: { lat: number; lng: number } | null;
  isLocating: boolean;
  onUseCurrentLocation: () => void;
  pickupLabel?: string;
  dropoffLabel?: string;
}

const LandingHeroMapPanel = ({
  userPosition,
  isLocating,
  onUseCurrentLocation,
  pickupLabel,
  dropoffLabel,
}: LandingHeroMapPanelProps) => {
  if (!environment.googleMapsApiKey) {
    return (
      <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--landing-radius)] bg-[var(--landing-surface)]">
        <figcaption className="landing-meta absolute inset-0 flex items-center justify-center p-8 text-center">
          Map preview appears when Google Maps is configured.
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-[var(--landing-radius)] bg-[var(--landing-surface)]">
      <APIProvider apiKey={environment.googleMapsApiKey}>
        <Map
          style={{ width: '100%', height: '100%' }}
          center={userPosition ?? KIGALI_CENTER}
          defaultCenter={KIGALI_CENTER}
          defaultZoom={12}
          zoom={userPosition ? 13 : 12}
          gestureHandling="cooperative"
          disableDefaultUI
          zoomControl
          clickableIcons={false}
        >
          {userPosition ? <Marker position={userPosition} title="You" /> : null}
        </Map>
      </APIProvider>

      {pickupLabel || dropoffLabel ? (
        <figcaption className="landing-meta absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] space-y-1 rounded-[var(--landing-radius)] bg-[var(--landing-paper)] px-3 py-2 text-[var(--landing-ink)]">
          {pickupLabel ? (
            <span className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{pickupLabel}</span>
            </span>
          ) : null}
          {dropoffLabel ? (
            <span className="flex items-start gap-1.5 text-[var(--landing-muted)]">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{dropoffLabel}</span>
            </span>
          ) : null}
        </figcaption>
      ) : userPosition ? (
        <figcaption className="landing-meta absolute left-3 top-3 z-10 rounded-[var(--landing-radius)] bg-[var(--landing-paper)] px-3 py-2 text-[var(--landing-ink)]">
          Your approximate area
        </figcaption>
      ) : null}

      {!userPosition ? (
        <button
          type="button"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
          className="absolute bottom-3 left-3 z-10 inline-flex h-9 items-center gap-2 rounded-[var(--landing-radius)] border border-[var(--landing-line)] bg-[var(--landing-paper)] px-3 text-sm text-[var(--landing-ink)] transition-colors hover:bg-[var(--landing-surface)] disabled:opacity-60"
        >
          <LocateFixed
            className={`size-4 ${isLocating ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
          {isLocating ? 'Finding you…' : 'Use my location'}
        </button>
      ) : null}
    </figure>
  );
};

export default LandingHeroMapPanel;
