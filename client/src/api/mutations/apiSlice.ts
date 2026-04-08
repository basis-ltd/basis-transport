import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';
import { Trip } from '@/types/trip.type';
import { UserTrip } from '@/types/userTrip.type';
import { UUID } from '@/types';
import { Location } from '@/types/location.type';
import { User } from '@/types/user.type';

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
      query: ({ username, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { username, password },
      }),
    }),

    phoneLoginPrecheck: builder.mutation({
      query: ({ phoneNumber }: { phoneNumber: string }) => ({
        url: '/auth/phone/precheck',
        method: 'POST',
        body: { phoneNumber },
      }),
    }),

    sendPhoneOtp: builder.mutation({
      query: ({ phoneNumber }: { phoneNumber: string }) => ({
        url: '/auth/phone/send-otp',
        method: 'POST',
        body: { phoneNumber },
      }),
    }),

    verifyPhoneOtp: builder.mutation({
      query: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => ({
        url: '/auth/phone/verify-otp',
        method: 'POST',
        body: { phoneNumber, otp },
      }),
    }),

    sendPhoneResetOtp: builder.mutation({
      query: ({ phoneNumber }: { phoneNumber: string }) => ({
        url: '/auth/phone/reset/send-otp',
        method: 'POST',
        body: { phoneNumber },
      }),
    }),

    verifyPhoneResetOtp: builder.mutation({
      query: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => ({
        url: '/auth/phone/reset/verify-otp',
        method: 'POST',
        body: { phoneNumber, otp },
      }),
    }),

    resetPasswordWithPhone: builder.mutation({
      query: ({
        phoneNumber,
        resetToken,
        password,
      }: {
        phoneNumber: string;
        resetToken: string;
        password: string;
      }) => ({
        url: '/auth/phone/reset-password',
        method: 'POST',
        body: { phoneNumber, resetToken, password },
      }),
    }),

    completeRegistration: builder.mutation({
      query: ({
        email,
        password,
      }: {
        email?: string;
        password: string;
      }) => ({
        url: '/auth/complete-registration',
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

    // FORGOT PASSWORD
    forgotPassword: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // RESET PASSWORD
    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    /**
     * LOCATIONS
     */

    // CREATE LOCATION
    createLocation: builder.mutation({
      query: (location: Partial<Location>) => ({
        url: '/locations',
        method: 'POST',
        body: location,
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

    // START TRIP
    startTrip: builder.mutation({
      query: (id: UUID) => ({
        url: `/trips/${id}/start`,
        method: 'PATCH',
      }),
    }),

    // END TRIP
    completeTrip: builder.mutation({
      query: (id: UUID) => ({
        url: `/trips/${id}/complete`,
        method: 'PATCH',
      }),
    }),

    // CANCEL TRIP
    cancelTrip: builder.mutation({
      query: (id: UUID) => ({
        url: `/trips/${id}/cancel`,
        method: 'PATCH',
      }),
    }),

    // QUICK JOIN TRIP
    quickJoinTrip: builder.mutation({
      query: ({
        tripId,
        phoneNumber,
        entranceLocation,
      }: {
        tripId: UUID;
        phoneNumber: string;
        entranceLocation: { type: 'Point'; coordinates: [number, number] };
      }) => ({
        url: `/trips/${tripId}/quick-join`,
        method: 'POST',
        body: { phoneNumber, entranceLocation },
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

    /**
     * USERS
     */

    // CREATE USER
    createUser: builder.mutation({
      query: ({ user, roleIds }: { user: Partial<User>; roleIds: UUID[] }) => ({
        url: '/users',
        method: 'POST',
        body: {
          user,
          roleIds,
        },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  usePhoneLoginPrecheckMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
  useSendPhoneResetOtpMutation,
  useVerifyPhoneResetOtpMutation,
  useResetPasswordWithPhoneMutation,
  useCompleteRegistrationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCreateLocationMutation,
  useCreateTripMutation,
  useCreateUserTripMutation,
  useUpdateUserTripMutation,
  useCreateUserMutation,
  useStartTripMutation,
  useCompleteTripMutation,
  useCancelTripMutation,
  useQuickJoinTripMutation,
} = apiSlice;
