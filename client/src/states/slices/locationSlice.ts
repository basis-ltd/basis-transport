
import { createSlice } from '@reduxjs/toolkit'
import { Location } from '@/types/location.type';

interface LocationState {
  locationsList: Location[];
  location?: Location;
  selectedLocation?: Location;
}

const initialState: LocationState = {
  locationsList: [],
  location: undefined,
  selectedLocation: undefined,
}

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocationsList: (state, action) => {
      state.locationsList = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
  },
    });

export const { setLocationsList, setLocation, setSelectedLocation } =
  locationSlice.actions;

export default locationSlice.reducer;