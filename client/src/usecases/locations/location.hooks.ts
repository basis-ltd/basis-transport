import { useLazyFetchLocationsQuery } from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import { useEffect, useState } from 'react';
import { usePagination } from '../common/pagination.hooks';
import { setLocationsList } from '@/states/slices/locationSlice';

/**
 * FETCH LOCATIONS
 */
export const useFetchLocations = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  /**
   * PAGINATION
   */
  const {
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
    setTotalCount,
    setTotalPages,
  } = usePagination();

  const [
    fetchLocations,
    {
      data,
      isFetching: locationsIsFetching,
      isError: locationsIsError,
      isSuccess: locationsIsSuccess,
    },
  ] = useLazyFetchLocationsQuery();

  useEffect(() => {
    if (locationsIsSuccess) {
      setTotalCount(data?.data?.totalCount);
      setTotalPages(data?.data?.totalPages);
      dispatch(setLocationsList(data?.data?.rows));
    }
  }, [
    data?.data?.rows,
    data?.data?.totalCount,
    data?.data?.totalPages,
    dispatch,
    fetchLocations,
    locationsIsSuccess,
    setTotalCount,
    setTotalPages,
  ]);

  return {
    fetchLocations,
    data,
    locationsIsFetching,
    locationsIsError,
    locationsIsSuccess,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
    setTotalCount,
    setTotalPages,
  };
};

/**
 * BROWSE LOCATIONS
 */
export const useBrowseLocations = () => {
  /**
   * STATE VARIABLES
   */
  const [browserLocation, setBrowserLocation] = useState<{
    lat: number;
    lng: number;
    source: string;
  }>({
    lat: 0,
    lng: 0,
    source: '',
  });
  const [browserLocationIsLoading, setBrowserLocationIsLoading] = useState(false);

  const getBrowserLocation = async (): Promise<GeolocationPosition> => {
    // Method 1: Try HTML5 Geolocation (most accurate)
    const tryGeolocation = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
  
        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 8000, // 8 seconds
          maximumAge: 300000 // 5 minutes cache
        };
  
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            let errorMessage = 'Geolocation failed';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                errorMessage = 'Location request timed out';
                break;
            }
            reject(new Error(errorMessage));
          },
          options
        );
      });
    };

    // Method 2: Fallback to IP Geolocation (less accurate)
    const tryIpGeolocation = async (): Promise<GeolocationPosition> => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.error) {
          throw new Error('IP Geolocation failed');
        }

        // Create a position object that matches the GeolocationPosition interface
        const position: GeolocationPosition = {
          coords: {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 10000, // accuracy in meters (IP geolocation is typically accurate to about 10km)
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
            toJSON() { return this; }
          },
          timestamp: Date.now(),
          toJSON() { return this; }
        };

        return position;
      } catch {
        throw new Error('IP Geolocation failed');
      }
    };

    try {
      // First try browser geolocation
      return await tryGeolocation();
    } catch (error) {
      console.log('Browser geolocation failed, falling back to IP geolocation:', error);
      // If browser geolocation fails, try IP geolocation
      return await tryIpGeolocation();
    }
  };

  useEffect(() => {
    setBrowserLocationIsLoading(true);
    getBrowserLocation().then((position) => {
      setBrowserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: position.coords.accuracy <= 100 ? 'geolocation' : 'ip',
      });
    }).catch((error) => {
      console.error('All location methods failed:', error);
    }).finally(() => {
      setBrowserLocationIsLoading(false);
    });
  }, []);

  return {
    browserLocation,
    browserLocationIsLoading,
  };
};
