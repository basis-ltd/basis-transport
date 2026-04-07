import {
  useLazyFetchNearbyTripsQuery,
  useLazyCountAvailableCapacityQuery,
  useLazyGetTripByIdQuery,
  useLazyFetchTripsQuery,
} from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import { useEffect, useState } from 'react';
import { usePagination } from '../common/pagination.hooks';
import { setTrip, setTripsList } from '@/states/slices/tripSlice';
import { Trip } from '@/types/trip.type';
import {
  useCancelTripMutation,
  useCompleteTripMutation,
  useCreateTripMutation,
  useQuickJoinTripMutation,
  useStartTripMutation,
} from '@/api/mutations/apiSlice';
import { useBrowseLocations } from '../locations/location.hooks';
import { persistAuthSession } from '@/states/authSession';
import { setToken, setUser } from '@/states/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { UUID } from '@/types';

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
    setTotalCount,
    setTotalPages,
    totalCount,
    totalPages,
  } = usePagination();

  // QUERY
  const [
    fetchTrips,
    {
      data,
      isFetching,
      isError,
      isSuccess
    },
  ] = useLazyFetchTripsQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setTripsList(data?.data?.rows));
      setTotalCount(data?.data?.totalCount);
      setTotalPages(data?.data?.totalPages);
    }
  }, [dispatch, data?.data?.rows, isSuccess, setTotalCount, setTotalPages, data?.data?.totalCount, data?.data?.totalPages]);

  return {
    fetchTrips,
    data,
    isFetching,
    isError,
    isSuccess,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
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

/**
 * COUNT AVAILABLE CAPACITY
 */
export const useCountAvailableCapacity = () => {

  const [availableCapacity, setAvailableCapacity] = useState<{
    availableCapacity: number;
    totalCapacity: number;
  }>({
    availableCapacity: 0,
    totalCapacity: 0,
  });

  // MUTATION
  const [
    countAvailableCapacity,
    {
      isFetching: tripAvailableCapacityIsFetching,
      isSuccess: tripAvailableCapacityIsSuccess,
      data: tripAvailableCapacityData,
    },
  ] = useLazyCountAvailableCapacityQuery();

  useEffect(() => {
    if (tripAvailableCapacityIsSuccess) {
      setAvailableCapacity({
        availableCapacity: tripAvailableCapacityData?.data?.availableCapacity,
        totalCapacity: tripAvailableCapacityData?.data?.totalCapacity ?? 0,
      });
    }
  }, [
    tripAvailableCapacityData?.data?.availableCapacity,
    tripAvailableCapacityData?.data?.totalCapacity,
    tripAvailableCapacityIsSuccess,
  ]);

  return {
    countAvailableCapacity,
    tripAvailableCapacityIsFetching,
    tripAvailableCapacityIsSuccess,
    availableCapacity,
  };
};

/**
 * START TRIP
 */
export const useStartTrip = () => {

  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  // MUTATION
  const [
    startTrip,
    {
      isLoading,
      isSuccess,
      reset,
      data,
    },
  ] = useStartTripMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setTrip(data?.data));
    }
  }, [dispatch, data?.data, isSuccess]);

  return {
    startTrip,
    isLoading,
    isSuccess,
    reset,
    data,
  };
};

/**
 * COMPLETE TRIP
 */
export const useCompleteTrip = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  // GET TRIP BY ID
  const { getTripById } = useGetTripById();

  // MUTATION
  const [
    completeTrip,
    {
      isLoading: completeTripIsLoading,
      isSuccess: completeTripIsSuccess,
      reset: completeTripReset,
      data: completeTripData,
    },
  ] = useCompleteTripMutation();

  useEffect(() => {
    if (completeTripIsSuccess) {
      dispatch(setTrip(completeTripData?.data));
      completeTripReset();
      getTripById(completeTripData?.data?.id);
    }
  }, [dispatch, completeTripData, completeTripData?.data, completeTripIsSuccess, completeTripReset, getTripById]);

  return {
    completeTrip,
    completeTripIsLoading,
    completeTripIsSuccess,
    completeTripData,
    completeTripReset,
  };
};

/**
 * CANCEL TRIP
 */
export const useCancelTrip = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  // GET TRIP BY ID
  const { getTripById } = useGetTripById();

  // MUTATION
  const [
    cancelTrip,
    {
      isLoading: cancelTripIsLoading,
      isSuccess: cancelTripIsSuccess,
      reset: cancelTripReset,
      data: cancelTripData,
    },
  ] = useCancelTripMutation();

  useEffect(() => {
    if (cancelTripIsSuccess) {
      dispatch(setTrip(cancelTripData?.data));
      cancelTripReset();
      getTripById(cancelTripData?.data?.id);
    }
  }, [dispatch, cancelTripData?.data, cancelTripIsSuccess, cancelTripReset, getTripById]);

  return {
    cancelTrip,
    cancelTripIsLoading,
    cancelTripIsSuccess,
    cancelTripData,
    cancelTripReset,
  };
};

/**
 * FETCH NEARBY TRIPS
 */
export const useFetchNearbyTrips = () => {
  const { browserLocation, browserLocationIsLoading } = useBrowseLocations();
  const [fetchNearbyTrips, { data, isFetching }] = useLazyFetchNearbyTripsQuery();

  useEffect(() => {
    if (browserLocationIsLoading) {
      return;
    }

    const hasCoordinates = Boolean(browserLocation.lat && browserLocation.lng);

    if (hasCoordinates) {
      fetchNearbyTrips({
        lat: browserLocation.lat,
        lng: browserLocation.lng,
        limit: 5,
      });
      return;
    }

    fetchNearbyTrips({ limit: 5 });
  }, [
    browserLocation.lat,
    browserLocation.lng,
    browserLocationIsLoading,
    fetchNearbyTrips,
  ]);

  return {
    nearbyTrips: data?.data ?? [],
    isLoading: browserLocationIsLoading || isFetching,
    browserLocation,
    locationSource: browserLocation.source,
  };
};

/**
 * QUICK JOIN TRIP
 */
export const useQuickJoinTrip = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [
    quickJoinTripMutation,
    { isLoading: quickJoinTripIsLoading, isSuccess: quickJoinTripIsSuccess },
  ] = useQuickJoinTripMutation();

  const quickJoinTrip = async ({
    tripId,
    phoneNumber,
    entranceLocation,
  }: {
    tripId: UUID;
    phoneNumber: string;
    entranceLocation: { type: 'Point'; coordinates: [number, number] };
  }) => {
    try {
      const response = await quickJoinTripMutation({
        tripId,
        phoneNumber,
        entranceLocation,
      }).unwrap();

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (token && user) {
        await persistAuthSession({ user, token });
        dispatch(setToken(token));
        dispatch(setUser(user));
      }

      const destinationTripId = response?.data?.userTrip?.tripId || tripId;
      navigate(`/trips/${destinationTripId}`);

      return response;
    } catch (error) {
      toast.error(
        (
          error as {
            data?: {
              message?: string;
            };
          }
        )?.data?.message ?? 'Unable to join trip'
      );
      throw error;
    }
  };

  return {
    quickJoinTrip,
    quickJoinTripIsLoading,
    quickJoinTripIsSuccess,
  };
};
