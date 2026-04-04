import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { environment } from '@/constants/environment.constants';
import { getCurrentAuthToken } from '@/states/authSession';

const prepareHeaders = (headers: Headers) => {
  const token = getCurrentAuthToken();
  const randomKey = crypto.randomUUID();
  if (token) {
    headers.set('authorization', `Bearer ${token}`);
  }
  headers.set('x-idempotency-key', randomKey);
  return headers;
};

export const baseQuery = fetchBaseQuery({
  baseUrl: environment.apiUrl,
  prepareHeaders,
});
