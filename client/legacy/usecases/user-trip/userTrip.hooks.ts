import { useLazyFetchUserTripsQuery, useLazyGetUserTripByIdQuery } from '@/api/queries/apiQuerySlice';
import { useAppDispatch } from '@/states/hooks';
import {
  setAddToUserTripList,
  setCurrentUserTrip,
  setUserTrip,
  setUserTripsList,
} from '@/states/slices/userTripSlice';
import { useEffect } from 'react';
import { usePagination } from '../common/pagination.hooks';
import {
  useCreateUserTripMutation,
  useUpdateUserTripMutation,
} from '@/api/mutations/apiSlice';

/**
 * FETCH USER TRIPS
 */
export const useFetchUserTrips = () => {
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

  /**
   * MUTATION
   */
  const [
    fetchUserTrips,
    {
      data,
      isFetching: userTripsIsFetching,
      isError: userTripsIsError,
      isSuccess: userTripsIsSuccess,
    },
  ] = useLazyFetchUserTripsQuery();

  useEffect(() => {
    if (userTripsIsSuccess) {
      dispatch(setUserTripsList(data?.data?.rows));
      setTotalCount(data?.data?.totalCount);
      setTotalPages(data?.data?.totalPages);
    }
  }, [
    data?.data?.rows,
    dispatch,
    userTripsIsSuccess,
    setTotalCount,
    setTotalPages,
    data?.data?.totalCount,
    data?.data?.totalPages,
  ]);

  return {
    fetchUserTrips,
    data,
    userTripsIsFetching,
    userTripsIsError,
    userTripsIsSuccess,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
  };
};

/**
 * CREATE USER TRIP
 */
export const useCreateUserTrip = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  /**
   * MUTATION
   */
  const [
    createUserTrip,
    {
      isLoading: createUserTripIsLoading,
      isSuccess: createUserTripIsSuccess,
      reset: createUserTripReset,
      data: createUserTripData,
    },
  ] = useCreateUserTripMutation();

  useEffect(() => {
    if (createUserTripIsSuccess) {
      dispatch(setAddToUserTripList(createUserTripData?.data));
      dispatch(setCurrentUserTrip(createUserTripData?.data));
      createUserTripReset();
    }
  }, [
    createUserTripIsSuccess,
    dispatch,
    createUserTripData?.data,
    createUserTripReset,
  ]);

  return {
    createUserTrip,
    createUserTripIsLoading,
    createUserTripIsSuccess,
    createUserTripReset,
    createUserTripData,
  };
};

/**
 * UPDATE USER TRIP
 */
export const useUpdateUserTrip = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  /**
   * MUTATION
   */
  const [
    updateUserTrip,
    {
      isLoading: updateUserTripIsLoading,
      isSuccess: updateUserTripIsSuccess,
      reset: updateUserTripReset,
      data: updateUserTripData,
    },
  ] = useUpdateUserTripMutation();

  useEffect(() => {
    if (updateUserTripIsSuccess) {
      dispatch(setCurrentUserTrip(undefined));
      updateUserTripReset();
    }
  }, [
    updateUserTripData?.data,
    updateUserTripIsSuccess,
    dispatch,
    updateUserTripReset,
  ]);

  return {
    updateUserTrip,
    updateUserTripIsLoading,
    updateUserTripIsSuccess,
    updateUserTripReset,
    updateUserTripData,
  };
};

/**
 * GET USER TRIP
 */
export const useGetUserTrip = () => {
  /**
   * STATE VARIABLES
   */
  const dispatch = useAppDispatch();

  /**
   * MUTATION
   */
  const [
    getUserTrip,
    {
      data: userTripData,
      isFetching: userTripIsFetching,
      isSuccess: userTripIsSuccess,
      isError: userTripIsError,
    },
  ] = useLazyGetUserTripByIdQuery();

  useEffect(() => {
    if (userTripIsSuccess) {
      dispatch(setUserTrip(userTripData?.data));
    }
  }, [userTripIsSuccess, dispatch, userTripData?.data]);

  return {
    getUserTrip,
    userTripData,
    userTripIsFetching,
    userTripIsSuccess,
    userTripIsError,
  };
};
