import { createSlice } from '@reduxjs/toolkit';
import { Trip } from '@/types/trip.type';

interface TripState {
  tripsList: Trip[];
  trip?: Trip;
  selectedTrip?: Trip;
  startTripModal: boolean;
}

const initialState: TripState = {
  tripsList: [],
  trip: undefined,
  selectedTrip: undefined,
  startTripModal: false,
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
    setSelectedTrip: (state, action) => {
      state.selectedTrip = action.payload;
    },
    setStartTripModal: (state, action) => {
      state.startTripModal = action.payload;
    },
  },
});
export const { setTripsList, setTrip, setSelectedTrip, setStartTripModal } = tripSlice.actions;

export default tripSlice.reducer;
