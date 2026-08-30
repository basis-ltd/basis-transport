import { useBrowseLocations } from '@/usecases/locations/location.hooks';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import LandingHeroActions from './LandingHeroActions';
import LandingHeroForm, {
  type LandingHeroFormValues,
} from './LandingHeroForm';
import LandingHeroHeadline from './LandingHeroHeadline';
import LandingHeroLocationStatus from './LandingHeroLocationStatus';
import LandingHeroMapPanel from './LandingHeroMapPanel';
import LandingHeroTrustIndicators from './LandingHeroTrustIndicators';
import { useGeolocationPickup } from '@/hooks/locations/useGeolocationPickup';
import {
  describeLocation,
  hasCoordinates,
} from '@/utils/locations.util';

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

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LandingHeroFormValues>({
    defaultValues: {
      pickupLocation: undefined,
      dropoffLocation: undefined,
      pickupSource: 'search',
    },
  });

  const geolocation = useGeolocationPickup(control, setValue);
  const pickupLocation = useWatch({ control, name: 'pickupLocation' });
  const dropoffLocation = useWatch({ control, name: 'dropoffLocation' });
  const pickupSource = useWatch({ control, name: 'pickupSource' });

  const { browserLocation, browserLocationIsLoading } = useBrowseLocations();

  const userPosition =
    browserLocation.lat && browserLocation.lng
      ? { lat: browserLocation.lat, lng: browserLocation.lng }
      : null;

  const isResolvingLocation =
    geolocation.isLocating || browserLocationIsLoading;

  const pickupLabel =
    pickupSource === 'geolocation' && pickupLocation
      ? CURRENT_LOCATION_LABEL
      : describeLocation(pickupLocation);
  const dropoffLabel = describeLocation(dropoffLocation);

  const buildTravelSearchParams = (from: string, to: string, coords?: {
    lat: number;
    lng: number;
  }) => {
    const params = new URLSearchParams();

    if (from) {
      params.set('from', from);
    }

    if (to) {
      params.set('to', to);
    }

    const position = coords ?? userPosition;
    if (position) {
      params.set('lat', String(position.lat));
      params.set('lng', String(position.lng));
    }

    return params;
  };

  const onPlanSubmit = (data: LandingHeroFormValues) => {
    const from =
      data.pickupSource === 'geolocation'
        ? CURRENT_LOCATION_LABEL
        : describeLocation(data.pickupLocation);
    const to = describeLocation(data.dropoffLocation);

    const coords = hasCoordinates(data.pickupLocation)
      ? {
          lat: data.pickupLocation!.latitude,
          lng: data.pickupLocation!.longitude,
        }
      : undefined;

    setIsSubmitting(true);
    navigate(`/travel?${buildTravelSearchParams(from, to, coords).toString()}`);
    setIsSubmitting(false);
  };

  const onSeeNearby = () => {
    if (!userPosition && !hasCoordinates(pickupLocation)) {
      void geolocation.useMyLocation('pickupLocation');
      return;
    }

    const coords = hasCoordinates(pickupLocation)
      ? {
          lat: pickupLocation!.latitude,
          lng: pickupLocation!.longitude,
        }
      : userPosition ?? undefined;

    navigate(
      `/travel?${buildTravelSearchParams('', '', coords).toString()}`
    );
  };

  return (
    <section className="flex w-full items-center min-h-[calc(100svh-4rem)]">
      <div className="landing-container py-10 lg:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16">
          <div className="landing-enter flex flex-col items-start gap-6">
            <LandingHeroLocationStatus
              isLocating={isResolvingLocation}
              hasCurrentLocation={Boolean(
                userPosition ||
                  (pickupSource === 'geolocation' && pickupLocation)
              )}
              onUseCurrentLocation={() =>
                void geolocation.useMyLocation('pickupLocation')
              }
            />

            <LandingHeroHeadline onLearnMore={onLearnMore} />

            <LandingHeroForm
              onSubmit={handleSubmit(onPlanSubmit)}
              control={control}
              errors={errors}
              geolocation={geolocation}
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
              onUseCurrentLocation={() =>
                void geolocation.useMyLocation('pickupLocation')
              }
              pickupLabel={pickupLabel}
              dropoffLabel={dropoffLabel}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHeroSection;
