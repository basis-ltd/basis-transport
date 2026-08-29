import { LocateFixed, MapPin } from 'lucide-react';

interface LandingHeroLocationStatusProps {
  isLocating: boolean;
  hasCurrentLocation: boolean;
  onUseCurrentLocation: () => void;
}

const LandingHeroLocationStatus = ({
  isLocating,
  hasCurrentLocation,
  onUseCurrentLocation,
}: LandingHeroLocationStatusProps) => {
  if (isLocating) {
    return (
      <p className="landing-meta flex items-center gap-2">
        <LocateFixed className="size-4 shrink-0 animate-pulse" aria-hidden="true" />
        Finding your location…
      </p>
    );
  }

  if (hasCurrentLocation) {
    return (
      <p className="landing-meta flex items-center gap-2">
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        Using your current location
      </p>
    );
  }

  return (
    <p className="landing-meta flex items-center gap-2">
      <MapPin className="size-4 shrink-0" aria-hidden="true" />
      <span>Location not detected</span>
      <span aria-hidden="true">·</span>
      <button
        type="button"
        onClick={onUseCurrentLocation}
        className="landing-link-sweep text-[0.8125rem]"
      >
        Use my location
      </button>
    </p>
  );
};

export default LandingHeroLocationStatus;
