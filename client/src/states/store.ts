import { configureStore } from '@reduxjs/toolkit';
import sidebarSlice from './slices/sidebarSlice';
import authSlice from './slices/authSlice';
import { apiSlice } from '@/api/mutations/apiSlice';
import { apiQuerySlice } from '@/api/queries/apiQuerySlice';
import tripSlice from './slices/tripSlice';
import locationSlice from './slices/locationSlice';
import userTripSlice from './slices/userTripSlice';
import userSlice from './slices/userSlice';
import transportCardSlice from './slices/transportCardSlice';
import roleSlice from './slices/roleSlice';

export const store = configureStore({
  reducer: {
    sidebar: sidebarSlice,
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [apiQuerySlice.reducerPath]: apiQuerySlice.reducer,
    trip: tripSlice,
    location: locationSlice,
    userTrip: userTripSlice,
    user: userSlice,
    transportCard: transportCardSlice,
    role: roleSlice,
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
