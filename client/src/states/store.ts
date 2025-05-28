import { configureStore } from '@reduxjs/toolkit';
import sidebarSlice from './slices/sidebarSlice';
import authSlice from './slices/authSlice';
import { apiSlice } from '@/api/mutations/apiSlice';
import { apiQuerySlice } from '@/api/queries/apiQuerySlice';
import tripSlice from './slices/tripSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarSlice,
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [apiQuerySlice.reducerPath]: apiQuerySlice.reducer,
    trip: tripSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      apiQuerySlice.middleware
    ),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
