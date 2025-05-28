import { createSlice } from '@reduxjs/toolkit';
import { Trip } from '@/types/trip.type';

interface TripState {
  tripsList: Trip[];
  trip?: Trip;
}

const initialState: TripState = {
  tripsList: [],
  trip: undefined,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setTripsList: (state, action) => {
      state.tripsList = action.payload;
    },
    setTrip: (state, action) => {
      state.trip = action.payload;
    },
  },
});
export const { setTripsList, setTrip } = tripSlice.actions;

export default tripSlice.reducer;
