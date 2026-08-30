import { useBrowseLocations } from '@/usecases/locations/location.hooks';
import { useState } from 'react';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import useConfirm from '@/components/feedback/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LandingHeroActions from './LandingHeroActions';
import LandingHeroForm, { type LandingHeroFormValues } from './LandingHeroForm';
import LandingHeroHeadline from './LandingHeroHeadline';
import LandingHeroLocationStatus from './LandingHeroLocationStatus';
import LandingHeroMapPanel from './LandingHeroMapPanel';
import LandingHeroTrustIndicators from './LandingHeroTrustIndicators';

interface LandingHeroSectionProps {
  commutesValue: string;
  usersValue: string;
  onLearnMore: () => void;
}

const CURRENT_LOCATION_LABEL = 'Current location';

const LandingHeroSection = ({
  commutesValue,
  usersValue,
  onLearnMore,
}: LandingHeroSectionProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [routePreview, setRoutePreview] = useState({ pickup: '', dropoff: '' });

  const { browserLocation, browserLocationIsLoading } = useBrowseLocations();
  const { confirm, confirmDialog } = useConfirm();

  const userPosition =
    browserLocation.lat && browserLocation.lng
      ? { lat: browserLocation.lat, lng: browserLocation.lng }
      : null;

  const isResolvingLocation = isLocating || browserLocationIsLoading;

  const buildTravelSearchParams = (from: string, to: string) => {
    const params = new URLSearchParams();

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    if (userPosition) {
      params.set('lat', String(userPosition.lat));
      params.set('lng', String(userPosition.lng));
    }

    return params;
  };

  const applyCurrentLocation = (setPickup?: (value: string) => void) => {
    setPickup?.(CURRENT_LOCATION_LABEL);
    setRoutePreview((current) => ({
      ...current,
      pickup: CURRENT_LOCATION_LABEL,
    }));
  };

  /**
     * Reading device location leaves the page, so it is asked for rather than
     * taken: the reader gets to see what is about to happen before the browser
     * permission prompt appears.
     */
  const requestCurrentLocation = async (
    setPickup?: (value: string) => void
  ) => {
    const agreed = await confirm({
      title: 'Use your current location?',
      description:
        'Basis will read your device location once to fill in where you are starting from. It is not saved or shared.',
      confirmLabel: 'Use my location',
      icon: faLocationCrosshairs,
    });

    if (!agreed) {
      return;
    }

    if (!navigator.geolocation) {
      if (userPosition) {
        applyCurrentLocation(setPickup);
        return;
      }
      toast.error('Location is not available on this device.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        applyCurrentLocation(setPickup);
      },
      () => {
        setIsLocating(false);
        if (userPosition) {
          applyCurrentLocation(setPickup);
          return;
        }
        toast.error('Unable to access your location. Enter it manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const onPlanSubmit = (data: LandingHeroFormValues) => {
    const from = data.pickupLocation.trim();
    const to = data.dropoffLocation.trim();

    setIsSubmitting(true);
    setRoutePreview({ pickup: from, dropoff: to });
    navigate(`/travel?${buildTravelSearchParams(from, to).toString()}`);
    setIsSubmitting(false);
  };

  const onSeeNearby = () => {
    if (!userPosition) {
      void requestCurrentLocation();
      return;
    }

    navigate(`/travel?${buildTravelSearchParams('', '').toString()}`);
  };

  return (
    <section className="flex w-full items-center min-h-[calc(100svh-4rem)]">
      <div className="landing-container py-10 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
          <div className="landing-enter flex flex-col items-start gap-6">
            <LandingHeroLocationStatus
              isLocating={isResolvingLocation}
              hasCurrentLocation={Boolean(userPosition)}
              onUseCurrentLocation={() => void requestCurrentLocation()}
            />

            <LandingHeroHeadline onLearnMore={onLearnMore} />

            <LandingHeroForm
              onSubmit={onPlanSubmit}
              onUseCurrentLocation={(setPickup) =>
                void requestCurrentLocation(setPickup)
              }
              isLocating={isResolvingLocation}
            />

            <LandingHeroActions
              isLoading={isSubmitting}
              onSeeNearby={onSeeNearby}
            />

            <LandingHeroTrustIndicators
              commutesValue={commutesValue}
              usersValue={usersValue}
            />
          </div>

          <div className="max-lg:hidden">
            <LandingHeroMapPanel
              userPosition={userPosition}
              isLocating={isResolvingLocation}
              onUseCurrentLocation={() => void requestCurrentLocation()}
              pickupLabel={routePreview.pickup}
              dropoffLabel={routePreview.dropoff}
            />
          </div>
        </div>
      </div>
      {confirmDialog}
    </section>
  );
};

export default LandingHeroSection;
