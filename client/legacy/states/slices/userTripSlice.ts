import { UserTrip } from '@/types/userTrip.type';
import { createSlice } from '@reduxjs/toolkit';

interface UserTripState {
  userTripsList: UserTrip[];
  userTrip?: UserTrip;
  selectedUserTrip?: UserTrip;
  currentUserTrip?: UserTrip;
}

const initialState: UserTripState = {
  userTripsList: [],
  userTrip: undefined,
  selectedUserTrip: undefined,
  currentUserTrip: undefined,
};

const userTripSlice = createSlice({
  name: 'userTrip',
  initialState,
  reducers: {
    setUserTripsList: (state, action) => {
      state.userTripsList = action.payload;
    },
    setUserTrip: (state, action) => {
      state.userTrip = action.payload;
    },
    setSelectedUserTrip: (state, action) => {
      state.selectedUserTrip = action.payload;
    },
    setAddToUserTripList: (state, action) => {
      state.userTripsList.unshift(action.payload);
    },
    setCurrentUserTrip: (state, action) => {
      state.currentUserTrip = action.payload;
    },
  },
});

export const {
  setUserTripsList,
  setUserTrip,
  setSelectedUserTrip,
  setAddToUserTripList,
  setCurrentUserTrip,
} = userTripSlice.actions;

export default userTripSlice.reducer;
