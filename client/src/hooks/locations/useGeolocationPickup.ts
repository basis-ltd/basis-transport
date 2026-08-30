import { useEffect, useRef, useState } from 'react';
import type { Control, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useNearestPlace } from '@/hooks/locations/useNearestPlace';
import type {
  LandingHeroFormValues,
  PickupSource,
  TripLocation,
} from '@/types/tripLocation.type';
import {
  coordinateKey,
  getCurrentLocation,
  locationErrorMessage,
  type LocationError,
} from '@/utils/locations.util';

export type GeolocationTarget = 'pickupLocation' | 'dropoffLocation';

export interface GeolocationPickupState {
  pickupSource: PickupSource;
  setPickupSource: (source: PickupSource) => void;
  locationError: string | null;
  isLocating: boolean;
  useMyLocation: (target?: GeolocationTarget) => Promise<void>;
  clearLocationError: () => void;
}

export const useGeolocationPickup = (
  control: Control<LandingHeroFormValues>,
  setValue: UseFormSetValue<LandingHeroFormValues>
): GeolocationPickupState => {
  const pickupLocation = useWatch({ control, name: 'pickupLocation' });
  const dropoffLocation = useWatch({ control, name: 'dropoffLocation' });
  const pickupSource = useWatch({ control, name: 'pickupSource' }) ?? 'search';
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const geolocationKey = useRef<string | null>(null);

  const locationForLookup =
    pickupSource === 'geolocation' &&
    pickupLocation &&
    !pickupLocation.name?.trim() &&
    !pickupLocation.formattedAddress?.trim()
      ? pickupLocation
      : null;
  const nearestPlace = useNearestPlace(locationForLookup);

  const setPickupSource = (source: PickupSource) => {
    setValue('pickupSource', source, { shouldDirty: true });
    setLocationError(null);
  };

  useEffect(() => {
    if (
      pickupSource === 'geolocation' &&
      coordinateKey(pickupLocation) !== geolocationKey.current &&
      geolocationKey.current !== null
    ) {
      setValue('pickupSource', 'search', { shouldDirty: true });
    }
    if (pickupLocation || dropoffLocation) setLocationError(null);
  }, [pickupLocation, dropoffLocation, pickupSource, setValue]);

  useEffect(() => {
    if (
      pickupSource !== 'geolocation' ||
      !pickupLocation ||
      pickupLocation.name?.trim() ||
      pickupLocation.formattedAddress?.trim() ||
      nearestPlace.isLoading ||
      (!nearestPlace.placeName && !nearestPlace.address)
    ) {
      return;
    }

    setValue(
      'pickupLocation',
      {
        ...pickupLocation,
        ...(nearestPlace.placeName ? { name: nearestPlace.placeName } : {}),
        ...(nearestPlace.address
          ? { formattedAddress: nearestPlace.address }
          : {}),
      },
      { shouldDirty: true, shouldValidate: true }
    );
  }, [pickupLocation, nearestPlace, pickupSource, setValue]);

  const locationForDropoffLookup =
    dropoffLocation &&
    !dropoffLocation.name?.trim() &&
    !dropoffLocation.formattedAddress?.trim()
      ? dropoffLocation
      : null;
  const nearestDropoff = useNearestPlace(locationForDropoffLookup);

  useEffect(() => {
    if (
      !dropoffLocation ||
      dropoffLocation.name?.trim() ||
      dropoffLocation.formattedAddress?.trim() ||
      nearestDropoff.isLoading ||
      (!nearestDropoff.placeName && !nearestDropoff.address)
    ) {
      return;
    }

    setValue(
      'dropoffLocation',
      {
        ...dropoffLocation,
        ...(nearestDropoff.placeName ? { name: nearestDropoff.placeName } : {}),
        ...(nearestDropoff.address
          ? { formattedAddress: nearestDropoff.address }
          : {}),
      },
      { shouldDirty: true, shouldValidate: true }
    );
  }, [dropoffLocation, nearestDropoff, setValue]);

  const useMyLocation = async (
    target: GeolocationTarget = 'pickupLocation'
  ) => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const location = await getCurrentLocation();
      if (
        typeof location.latitude !== 'number' ||
        typeof location.longitude !== 'number'
      ) {
        throw { code: 2, message: 'Location unavailable' } as LocationError;
      }

      const nextLocation: TripLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      if (target === 'dropoffLocation') {
        setValue('dropoffLocation', nextLocation, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        return;
      }

      geolocationKey.current = coordinateKey(nextLocation);
      setValue('pickupSource', 'geolocation', { shouldDirty: true });
      setValue('pickupLocation', nextLocation, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } catch (error) {
      const locationFailure =
        typeof error === 'object' && error && 'code' in error
          ? (error as LocationError)
          : ({ code: -1, message: 'Unknown location error' } as LocationError);
      setLocationError(locationErrorMessage(locationFailure));
    } finally {
      setIsLocating(false);
    }
  };

  return {
    pickupSource,
    setPickupSource,
    locationError,
    isLocating,
    useMyLocation,
    clearLocationError: () => setLocationError(null),
  };
};
