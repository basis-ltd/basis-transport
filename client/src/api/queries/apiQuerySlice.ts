import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';

export const apiQuerySlice = createApi({
  reducerPath: 'apiQuery',
  baseQuery,
  tagTypes: [
    'Trips',
    'Locations',
    'UserTrips',
    'Users',
    'User',
    'TransportCards',
  ],
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

    // COUNT AVAILABLE CAPACITY
    countAvailableCapacity: builder.query({
      query: ({ id }) => {
        return {
          url: `/trips/${id}/capacity`,
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

    // FETCH USER TRIPS
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

    // GET USER TRIP BY ID
    getUserTripById: builder.query({
      query: (id) => {
        return {
          url: `/user-trips/${id}`,
        };
      },
    }),

    /**
     * USERS
     */
    fetchUsers: builder.query({
      query: ({ page, size }) => {
        return {
          url: '/users',
          params: {
            page,
            size,
          },
          method: 'GET',
          tag: ['Users'],
        };
      },
    }),

    // GET USER BY ID
    getUserById: builder.query({
      query: (id) => {
        return {
          url: `/users/${id}`,
          method: 'GET',
          tag: ['Users'],
        };
      },
    }),

    /**
     * TRANSPORT CARDS
     */
    fetchTransportCards: builder.query({
      query: ({ page, size, name, createdById }) => {
        return {
          url: '/transport-cards',
          params: {
            page,
            size,
            name,
            createdById,
          },
          method: 'GET',
          tag: ['TransportCards'],
        };
      },
    }),

    // GET TRANSPORT CARD BY ID
    getTransportCardById: builder.query({
      query: (id) => {
        return {
          url: `/transport-cards/${id}`,
          method: 'GET',
          tag: ['TransportCards'],
        };
      },
    }),

    /**
     * DASHBOARD
     */

    // COUNT USER TRIPS
    countUserTrips: builder.query({
      query: ({ userId, startDate, endDate }) => {
        return {
          url: '/dashboard/user-trips/count',
          params: {
            userId,
            startDate,
            endDate,
          },
        };
      },
    }),

    // COUNT TRANSPORT CARDS
    countTransportCards: builder.query({
      query: () => {
        return {
          url: '/dashboard/transport-cards/count',
        };
      },
    }),

    // COUNT USERS
    countUsers: builder.query({
      query: ({ status }) => {
        return {
          url: '/dashboard/users/count',
          params: {
            status,
          },
        };
      },
    }),

    /**
     * ROLES
     */

    // FETCH ROLES
    fetchRoles: builder.query({
      query: () => {
        return {
          url: '/roles',
        };
      },
    }),

    // GET ROLE BY ID
    getRoleById: builder.query({
      query: (id) => {
        return {
          url: `/roles/${id}`,
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
  useLazyFetchUsersQuery,
  useLazyGetUserByIdQuery,
  useLazyFetchTransportCardsQuery,
  useLazyGetTransportCardByIdQuery,
  useLazyCountUserTripsQuery,
  useLazyCountTransportCardsQuery,
  useLazyCountUsersQuery,
  useLazyGetUserTripByIdQuery,
  useLazyFetchRolesQuery,
  useLazyGetRoleByIdQuery,
  useLazyCountAvailableCapacityQuery,
} = apiQuerySlice;
