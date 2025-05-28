import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: true,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.isOpen = action.payload;
    },
  },
});

export const { setSidebarOpen } = sidebarSlice.actions;

export default sidebarSlice.reducer;
