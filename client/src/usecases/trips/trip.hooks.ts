import {
  useLazyFetchTripsQuery,
  useLazyGetTripByIdQuery,
} from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import { useEffect, useState } from 'react';
import { usePagination } from '../common/pagination.hooks';
import { setTrip, setTripsList } from '@/states/slices/tripSlice';
import { Trip } from '@/types/trip.type';
import { useCreateTripMutation } from '@/api/mutations/apiSlice';

// FETCH TRIPS
export const useFetchTrips = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  // PAGINATION
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

  // MUTATION

  const [
    fetchTrips,
    {
      data: tripsData,
      isFetching: tripsIsFetching,
      isError: tripsIsError,
      isSuccess: tripsIsSuccess,
    },
  ] = useLazyFetchTripsQuery();

  useEffect(() => {
    if (tripsIsSuccess) {
      setTotalCount(tripsData?.data?.totalCount);
      setTotalPages(tripsData?.data?.totalPages);
      dispatch(setTripsList(tripsData?.data?.rows));
    }
  }, [
    dispatch,
    setTotalCount,
    setTotalPages,
    tripsData?.data?.rows,
    tripsData?.data?.totalCount,
    tripsData?.data?.totalPages,
    tripsIsSuccess,
  ]);

  return {
    fetchTrips,
    tripsData,
    tripsIsFetching,
    tripsIsError,
    page,
    size,
    totalCount,
    totalPages,
    setPage,
    setSize,
  };
};

// GET TRIP BY ID
export const useGetTripById = () => {
  // STATE VARIABLES
  const dispatch = useAppDispatch();

  const [
    getTripById,
    {
      data: tripData,
      isFetching: tripIsFetching,
      isError: tripIsError,
      isSuccess: tripIsSuccess,
    },
  ] = useLazyGetTripByIdQuery();

  useEffect(() => {
    if (tripIsSuccess) {
      dispatch(setTrip(tripData?.data));
    }
  }, [dispatch, tripData?.data, tripIsSuccess]);

  return {
    tripData,
    tripIsFetching,
    tripIsError,
    tripIsSuccess,
    getTripById,
  };
};

// GET TRIP LOCATIONS
export const useGetTripLocations = ({ trip }: { trip?: Trip }) => {
  // STATE VARIABLES
  const [origin, setOrigin] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [destination, setDestination] = useState<{ lat: number; lng: number }>({
    lat: 0,
    lng: 0,
  });
  const [defaultCenter, setDefaultCenter] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 0,
    lng: 0,
  });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: 0,
    lng: 0,
  });

  // GET CURRENT LOCATION FROM BROWSER
  const getBrowserLocation = async () => {
    const browserLocation = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return browserLocation;
  };

  useEffect(() => {
    getBrowserLocation().then((location) => {
      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    });
  }, []);

  useEffect(() => {
    if (trip) {
      /**
       * CURRENT LOCATION IS AVAILABLE
       */
      if (
        trip?.currentLocation &&
        userLocation &&
        userLocation?.lat !== 0 &&
        userLocation?.lng !== 0
      ) {
        // SET ORIGIN
        setOrigin({
          lat: trip?.currentLocation?.coordinates?.[0] ?? 0,
          lng: trip?.currentLocation?.coordinates?.[1] ?? 0,
        });

        // SET DEFAULT CENTER
        setDefaultCenter({
          lat: trip?.currentLocation?.coordinates?.[0] ?? 0,
          lng: trip?.currentLocation?.coordinates?.[1] ?? 0,
        });

        // SET CURRENT LOCATION
        setDestination({
          lat: userLocation.lat,
          lng: userLocation.lng,
        });
      } else {
        /**
         * CURRENT LOCATION IS NOT AVAILABLE
         */
        setOrigin({
          lat: trip?.locationFrom?.address?.coordinates?.[0] ?? 0,
          lng: trip?.locationFrom?.address?.coordinates?.[1] ?? 0,
        });

        // SET DEFAULT CENTER
        setDefaultCenter({
          lat: trip?.locationFrom?.address?.coordinates?.[0] ?? 0,
          lng: trip?.locationFrom?.address?.coordinates?.[1] ?? 0,
        });

        // SET DESTINATION
        setDestination({
          lat: trip?.locationTo?.address?.coordinates?.[0] ?? 0,
          lng: trip?.locationTo?.address?.coordinates?.[1] ?? 0,
        });
      }

      /**
       * USER LOCATION IS NOT AVAILABLE
       */
      if (!userLocation) {
        setOrigin({
          lat: trip?.locationFrom?.address?.coordinates?.[0] ?? 0,
          lng: trip?.locationFrom?.address?.coordinates?.[1] ?? 0,
        });

        setDefaultCenter({
          lat: trip?.locationFrom?.address?.coordinates?.[0] ?? 0,
          lng: trip?.locationFrom?.address?.coordinates?.[1] ?? 0,
        });

        setDestination({
          lat: trip?.locationTo?.address?.coordinates?.[0] ?? 0,
          lng: trip?.locationTo?.address?.coordinates?.[1] ?? 0,
        });
      }
    }
  }, [trip, userLocation]);

  return {
    origin,
    destination,
    defaultCenter,
  };
};

// CREATE TRIP
export const useCreateTrip = () => {
  // MUTATION
  const [
    createTrip,
    {
      isLoading: createTripIsLoading,
      isSuccess: createTripIsSuccess,
      reset: createTripReset,
    },
  ] = useCreateTripMutation();

  return {
    createTrip,
    createTripIsLoading,
    createTripIsSuccess,
    createTripReset,
  };
};