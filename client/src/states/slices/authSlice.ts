import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { User } from '@/types/user.type';

interface AuthState {
  user?: User;
  token?: string;
  isHydrated: boolean;
}

const initialState: AuthState = {
  user: undefined,
  token: undefined,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreSession: (
      state,
      action: PayloadAction<{ user?: User; token?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isHydrated = true;
    },
    setUser: (state, action: PayloadAction<User | undefined>) => {
      state.user = action.payload;
      state.isHydrated = true;
    },
    setToken: (state, action: PayloadAction<string | undefined>) => {
      state.token = action.payload;
      state.isHydrated = true;
    },
    setLogout: (state) => {
      state.user = undefined;
      state.token = undefined;
      state.isHydrated = true;
    },
  },
});

export const { restoreSession, setUser, setToken, setLogout } = authSlice.actions;

export default authSlice.reducer;
