import {
  useLazyCountTransportCardsQuery,
  useLazyCountUsersQuery,
  useLazyCountUserTripsQuery,
  useLazyTimeSpentInTripsQuery,
} from '@/api/queries/apiQuerySlice';
import moment from 'moment';
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

/**
 * TIME SPENT IN TRIPS
 */

export const useTimeSpentInTrips = () => {
  const [timeSpentInTrips, setTimeSpentInTrips] = useState(0);

  const [
    fetchTimeSpentInTrips,
    {
      data: timeSpentInTripsData,
      isFetching: timeSpentInTripsIsFetching,
      isError: timeSpentInTripsIsError,
    },
  ] = useLazyTimeSpentInTripsQuery();

  // FETCH TIME SPENT IN TRIPS
  useEffect(() => {
    if (timeSpentInTripsData) {
      const timeInHours = moment
        .duration(timeSpentInTripsData?.data, 'seconds')
        .asHours();
      setTimeSpentInTrips(timeInHours);
    }
  }, [timeSpentInTripsData]);

  return {
    timeSpentInTrips,
    fetchTimeSpentInTrips,
    timeSpentInTripsIsFetching,
    timeSpentInTripsIsError,
  };
};
