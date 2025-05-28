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
  }),
});

export const { useLoginMutation } = apiSlice;
