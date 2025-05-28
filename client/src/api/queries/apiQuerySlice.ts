import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';

export const apiQuerySlice = createApi({
  reducerPath: 'apiQuery',
  baseQuery,
  tagTypes: ['Trips'],
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
  }),
});

export const { useLazyFetchTripsQuery, useLazyGetTripByIdQuery } =
  apiQuerySlice;
