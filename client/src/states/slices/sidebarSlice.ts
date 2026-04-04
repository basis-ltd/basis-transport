import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  desktopExpanded: true,
  mobileOpen: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setDesktopSidebarExpanded: (state, action) => {
      state.desktopExpanded = action.payload;
    },
    toggleDesktopSidebar: (state) => {
      state.desktopExpanded = !state.desktopExpanded;
    },
    openMobileSidebar: (state) => {
      state.mobileOpen = true;
    },
    closeMobileSidebar: (state) => {
      state.mobileOpen = false;
    },
  },
});

export const {
  setDesktopSidebarExpanded,
  toggleDesktopSidebar,
  openMobileSidebar,
  closeMobileSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
