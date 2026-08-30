import { useEffect, useState } from 'react';
import type { TripLocation } from '@/types/tripLocation.type';
import {
  calculateHaversineDistance,
  hasCoordinates,
} from '@/utils/locations.util';
import { loadGoogleMapsLibrary } from '@/utils/googleMapsApi.util';

export interface NearestPlace {
  placeName: string | null;
  address: string | null;
}

const EMPTY_PLACE: NearestPlace = { placeName: null, address: null };
const MAX_POI_DISTANCE_METRES = 200;
const cache = new Map<string, Promise<NearestPlace>>();

const cacheKey = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

const findNearestPoi = (
  placesLibrary: google.maps.PlacesLibrary,
  position: google.maps.LatLngLiteral
): Promise<string | null> =>
  new Promise((resolve) => {
    const service = new placesLibrary.PlacesService(document.createElement('div'));
    service.nearbySearch(
      {
        location: position,
        rankBy: placesLibrary.RankBy.DISTANCE,
        type: 'point_of_interest',
      },
      (results, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !results?.length
        ) {
          resolve(null);
          return;
        }

        const [nearest] = results;
        const nearestPosition = nearest.geometry?.location;
        if (!nearest.name || !nearestPosition) {
          resolve(null);
          return;
        }

        const distanceMetres =
          calculateHaversineDistance(
            { latitude: position.lat, longitude: position.lng },
            { latitude: nearestPosition.lat(), longitude: nearestPosition.lng() }
          ) * 1000;

        resolve(distanceMetres <= MAX_POI_DISTANCE_METRES ? nearest.name : null);
      }
    );
  });

const findAddress = (
  geocodingLibrary: google.maps.GeocodingLibrary,
  position: google.maps.LatLngLiteral
): Promise<string | null> =>
  new Promise((resolve) => {
    const geocoder = new geocodingLibrary.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status !== 'OK' || !results?.length) {
        resolve(null);
        return;
      }
      resolve(results[0]?.formatted_address ?? null);
    });
  });

const lookupNearestPlace = async (
  placesLibrary: google.maps.PlacesLibrary,
  geocodingLibrary: google.maps.GeocodingLibrary,
  position: google.maps.LatLngLiteral
): Promise<NearestPlace> => {
  const [placeName, address] = await Promise.all([
    findNearestPoi(placesLibrary, position).catch(() => null),
    findAddress(geocodingLibrary, position).catch(() => null),
  ]);
  return { placeName, address };
};

export const useNearestPlace = (
  location?: TripLocation | null
): NearestPlace & { isLoading: boolean } => {
  const persistedName = location?.name?.trim() || null;
  const persistedAddress = location?.formattedAddress?.trim() || null;
  const isPersisted = Boolean(persistedName || persistedAddress);

  const latitude = location?.latitude ?? null;
  const longitude = location?.longitude ?? null;

  const [resolved, setResolved] = useState<NearestPlace>(EMPTY_PLACE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isPersisted || !hasCoordinates({ latitude, longitude })) {
      setResolved(EMPTY_PLACE);
      setIsLoading(false);
      return;
    }

    const position = { lat: Number(latitude), lng: Number(longitude) };
    const key = cacheKey(position.lat, position.lng);

    let cached = cache.get(key);
    if (!cached) {
      cached = Promise.all([
        loadGoogleMapsLibrary('places'),
        loadGoogleMapsLibrary('geocoding'),
      ]).then(([placesLibrary, geocodingLibrary]) =>
        lookupNearestPlace(placesLibrary, geocodingLibrary, position)
      );
      cache.set(key, cached);
    }

    let active = true;
    setIsLoading(true);

    cached
      .then((place) => {
        if (active) setResolved(place);
      })
      .catch(() => {
        cache.delete(key);
        if (active) setResolved(EMPTY_PLACE);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isPersisted, latitude, longitude]);

  if (isPersisted) {
    return {
      placeName: persistedName,
      address: persistedAddress,
      isLoading: false,
    };
  }

  return { ...resolved, isLoading };
};

export default useNearestPlace;
