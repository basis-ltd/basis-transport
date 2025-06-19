import {
  useLazyCountTransportCardsQuery,
  useLazyCountUsersQuery,
  useLazyCountUserTripsQuery,
} from '@/api/queries/apiQuerySlice';
import { useEffect, useState } from 'react';

/**
 * COUNT USER TRIPS
 */
export const useCountUserTrips = () => {
  /**
   * STATE VARIABLES
   */
  const [userTripsCount, setUserTripsCount] = useState(0);

  const [
    countUserTrips,
    {
      data: userTripsCountData,
      isFetching: userTripsCountIsFetching,
      isError: userTripsCountIsError,
    },
  ] = useLazyCountUserTripsQuery();

  // FETCH USER TRIPS COUNT
  useEffect(() => {
    if (userTripsCountData) {
      setUserTripsCount(userTripsCountData?.data);
    }
  }, [userTripsCountData]);

  return {
    countUserTrips,
    userTripsCount,
    userTripsCountIsFetching,
    userTripsCountIsError,
  };
};

/**
 * COUNT TRANSPORT CARDS
 */

export const useCountTransportCards = () => {
  const [transportCardsCount, setTransportCardsCount] = useState(0);

  const [
    countTransportCards,
    {
      data: transportCardsCountData,
      isFetching: transportCardsCountIsFetching,
      isError: transportCardsCountIsError,
    },
  ] = useLazyCountTransportCardsQuery();

  // FETCH TRANSPORT CARDS COUNT
  useEffect(() => {
    if (transportCardsCountData) {
      setTransportCardsCount(transportCardsCountData?.data);
    }
  }, [transportCardsCountData]);

  return {
    countTransportCards,
    transportCardsCount,
    transportCardsCountIsFetching,
    transportCardsCountIsError,
  };
};

/**
 * COUNT USERS
 */

export const useCountUsers = () => {
  const [usersCount, setUsersCount] = useState(0);

  const [
    countUsers,
    {
      data: usersCountData,
      isFetching: usersCountIsFetching,
      isError: usersCountIsError,
    },
  ] = useLazyCountUsersQuery();

  // FETCH USERS COUNT
  useEffect(() => {
    if (usersCountData) {
      setUsersCount(usersCountData?.data);
    }
  }, [usersCountData]);

  return {
    countUsers,
    usersCount,
    usersCountIsFetching,
    usersCountIsError,
  };
};
