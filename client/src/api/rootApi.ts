import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { localStorageAdapter } from '@/adapters/storage/localStorage.adapter';
import { environment } from '@/constants/environment.constants';

const prepareHeaders = async (headers: Headers) => {
  const token = await localStorageAdapter.getItem('token');
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
