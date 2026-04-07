import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';
import { UUID } from '@/types';
import { TransportCardProvider } from '@/constants/transportCard.constants';

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
      query: ({
        page,
        size,
        name,
        createdById,
        provider,
      }: {
        page: number;
        size: number;
        name?: string;
        createdById?: UUID;
        provider?: TransportCardProvider;
      }) => {
        return {
          url: '/transport-cards',
          params: {
            page,
            size,
            name,
            createdById,
            provider,
          },
          method: 'GET',
        };
      },
      providesTags: ['TransportCards'],
    }),

    // GET TRANSPORT CARD BY ID
    getTransportCardById: builder.query({
      query: (id: UUID) => {
        return {
          url: `/transport-cards/${id}`,
          method: 'GET',
        };
      },
      providesTags: (_result, _error, id) => [{ type: 'TransportCards', id }],
    }),

    // FETCH AUDIT LOGS BY ENTITY ID
    fetchAuditLogsByEntityId: builder.query({
      query: ({
        entityType,
        entityId,
        page = 0,
        size = 20,
      }: {
        entityType: string;
        entityId: UUID;
        page?: number;
        size?: number;
      }) => ({
        url: `/audit-logs/entity/${entityType}/${entityId}`,
        params: { page, size },
        method: 'GET',
      }),
    }),

    createTransportCard: builder.mutation<
      unknown,
      { name?: string; cardNumber: string; provider?: TransportCardProvider }
    >({
      query: (body) => ({
        url: '/transport-cards',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TransportCards'],
    }),

    updateTransportCard: builder.mutation<
      unknown,
      {
        id: UUID;
        body: Partial<{
          name: string;
          cardNumber: string;
          provider: TransportCardProvider;
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/transport-cards/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        'TransportCards',
        { type: 'TransportCards', id },
      ],
    }),

    deleteTransportCard: builder.mutation<unknown, UUID>({
      query: (id) => ({
        url: `/transport-cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        'TransportCards',
        { type: 'TransportCards', id },
      ],
    }),

    /**
     * DASHBOARD
     */

    getPublicLandingStats: builder.query<
      { commutes: number; users: number },
      void
    >({
      query: () => ({
        url: '/dashboard/public/landing-stats',
      }),
      transformResponse: (response: {
        data: { commutes: number; users: number };
      }) => response.data,
    }),

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

    // TIME SPENT IN TRIPS
    timeSpentInTrips: builder.query({
      query: ({ startDate, endDate, userId }) => {
        return {
          url: '/dashboard/user-trips/time-spent',
          params: {
            startDate,
            endDate,
            userId,
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
  useFetchTripsQuery,
  useLazyFetchTripsQuery,
  useGetTripByIdQuery,
  useLazyGetTripByIdQuery,
  useFetchLocationsQuery,
  useLazyFetchLocationsQuery,
  useGetLocationByIdQuery,
  useLazyGetLocationByIdQuery,
  useFetchUserTripsQuery,
  useLazyFetchUserTripsQuery,
  useFetchUsersQuery,
  useLazyFetchUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useFetchTransportCardsQuery,
  useLazyFetchTransportCardsQuery,
  useGetTransportCardByIdQuery,
  useLazyGetTransportCardByIdQuery,
  useFetchAuditLogsByEntityIdQuery,
  useLazyFetchAuditLogsByEntityIdQuery,
  useCreateTransportCardMutation,
  useUpdateTransportCardMutation,
  useDeleteTransportCardMutation,
  useGetPublicLandingStatsQuery,
  useCountUserTripsQuery,
  useLazyCountUserTripsQuery,
  useCountTransportCardsQuery,
  useLazyCountTransportCardsQuery,
  useCountUsersQuery,
  useLazyCountUsersQuery,
  useGetUserTripByIdQuery,
  useLazyGetUserTripByIdQuery,
  useFetchRolesQuery,
  useLazyFetchRolesQuery,
  useGetRoleByIdQuery,
  useLazyGetRoleByIdQuery,
  useCountAvailableCapacityQuery,
  useLazyCountAvailableCapacityQuery,
  useTimeSpentInTripsQuery,
  useLazyTimeSpentInTripsQuery,
} = apiQuerySlice;
