import type { PlaceSearchResult } from '@/components/inputs/PlaceSearch';
import type { TripLocation } from '@/types/tripLocation.type';

export interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export interface LocationError {
  code: number;
  message: string;
}

export const getCurrentLocation = (): Promise<LocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      } as LocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject({
          code: error.code,
          message: error.message,
        } as LocationError);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

export const calculateHaversineDistance = (
  from: LocationCoordinates,
  to: LocationCoordinates
): number => {
  if (
    !from ||
    !to ||
    from.latitude === null ||
    from.longitude === null ||
    to.latitude === null ||
    to.longitude === null
  ) {
    return 0;
  }

  const earthRadiusKm = 6371;
  const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.latitude * Math.PI) / 180) *
      Math.cos((to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const placeSearchResultToTripLocation = (
  result: PlaceSearchResult
): TripLocation => ({
  latitude: result.coordinates.latitude,
  longitude: result.coordinates.longitude,
  ...(result.name ? { name: result.name } : {}),
  ...(result.formattedAddress
    ? { formattedAddress: result.formattedAddress }
    : {}),
  ...(result.placeId ? { placeId: result.placeId } : {}),
});

export const hasCoordinates = (
  location?: TripLocation | LocationCoordinates | null
): boolean =>
  typeof location?.latitude === 'number' &&
  typeof location?.longitude === 'number' &&
  Number.isFinite(location.latitude) &&
  Number.isFinite(location.longitude);

export const coordinateKey = (location?: TripLocation | null) => {
  if (!hasCoordinates(location)) return '';
  return `${location?.latitude},${location?.longitude}`;
};

export const locationErrorMessage = (error: LocationError): string => {
  switch (error.code) {
    case 1:
      return 'Location permission was denied. Allow it in your browser settings, or type your pickup instead.';
    case 2:
      return 'Your location is currently unavailable. Try again, or type your pickup instead.';
    case 3:
      return 'Finding your location timed out. Try again, or type your pickup instead.';
    case 0:
      return 'This browser does not support location sharing. Type your pickup instead.';
    default:
      return 'We could not find your location. Try again, or type your pickup instead.';
  }
};

export const describeLocation = (location?: TripLocation | null): string => {
  if (!location) return '';

  return (
    location.name ||
    location.formattedAddress ||
    (hasCoordinates(location)
      ? `${location.latitude?.toFixed(5)}, ${location.longitude?.toFixed(5)}`
      : '')
  );
};
