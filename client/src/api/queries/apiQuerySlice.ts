import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';

export const apiQuerySlice = createApi({
  reducerPath: 'apiQuery',
  baseQuery,
  tagTypes: ['Trips', 'Locations'],
  endpoints: (builder) => ({
    /**
     * TRIPS
     */
    fetchTrips: builder.query({
      query: ({
        page,
        size,
        status,
        locationFromId,
        locationToId,
        createdById,
        startTime,
        endTime,
      }) => {
        return {
          url: '/trips',
          params: {
            page,
            size,
            status,
            locationFromId,
            locationToId,
            createdById,
            startTime,
            endTime,
          },
          method: 'GET',
          tag: ['Trips'],
        };
      },
    }),

    // GET TRIP BY ID
    getTripById: builder.query({
      query: (id) => {
        return {
          url: `/trips/${id}`,
        };
      },
    }),

    /**
     * LOCATIONS
     */
    fetchLocations: builder.query({
      query: ({ page, size }) => {
        return {
          url: '/locations',
          params: {
            page,
            size,
          },
          method: 'GET',
          tag: ['Locations'],
        };
      },
    }),

    // GET LOCATION BY ID
    getLocationById: builder.query({
      query: (id) => {
        return {
          url: `/locations/${id}`,
          method: 'GET',
          tag: ['Locations'],
        };
      },
    }),

    /**
     * USER TRIPS
     */
    fetchUserTrips: builder.query({
      query: ({ page, size, tripId, userId, startTime, endTime, status }) => {
        return {
          url: '/user-trips',
          params: {
            page,
            size,
            tripId,
            userId,
            startTime,
            endTime,
            status,
          },
          method: 'GET',
          tag: ['UserTrips'],
        };
      },
    }),
  }),
});

export const {
  useLazyFetchTripsQuery,
  useLazyGetTripByIdQuery,
  useLazyFetchLocationsQuery,
  useLazyGetLocationByIdQuery,
  useLazyFetchUserTripsQuery,
} = apiQuerySlice;
