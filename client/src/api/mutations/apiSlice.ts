import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../rootApi";

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
  }),
});

export const { useLoginMutation, useSignupMutation } = apiSlice;
