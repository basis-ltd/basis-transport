import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../rootApi';
import { UUID } from '@/types';
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
  useCompleteRegistrationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useCreateUserMutation,
} = apiSlice;
