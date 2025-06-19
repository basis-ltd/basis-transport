import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';
import { Trip } from '@/types/trip.type';
import { UserTrip } from '@/types/userTrip.type';
import { UUID } from '@/types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    /**
     * AUTH
     */

    // LOGIN
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
      }),
    }),

    // SIGNUP
    signup: builder.mutation({
      query: ({ name, email, password, phoneNumber }) => ({
        url: '/auth/signup',
        method: 'POST',
        body: { name, email, password, phoneNumber },
      }),
    }),

    /**
     * TRIPS
     */

    // CREATE TRIP
    createTrip: builder.mutation({
      query: (trip: Partial<Trip>) => ({
        url: '/trips',
        method: 'POST',
        body: trip,
      }),
    }),

    /**
     * USER TRIPS
     */

    // CREATE USER TRIP
    createUserTrip: builder.mutation({
      query: (userTrip: Partial<UserTrip>) => ({
        url: '/user-trips',
        method: 'POST',
        body: userTrip,
      }),
    }),

    // UPDATE USER TRIP
    updateUserTrip: builder.mutation({
      query: ({ id, userTrip }: { id: UUID; userTrip: Partial<UserTrip> }) => ({
        url: `/user-trips/${id}`,
        method: 'PATCH',
        body: userTrip,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useCreateTripMutation,
  useCreateUserTripMutation,
  useUpdateUserTripMutation,
} = apiSlice;
