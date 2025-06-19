import { User } from '@/types/user.type';
import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  user?: User;
  selectedUser?: User;
  usersList: User[];
}

const initialState: UserState = {
  user: undefined,
  selectedUser: undefined,
  usersList: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setUsersList: (state, action) => {
      state.usersList = action.payload;
    },
  },
});

export const { setUser, setSelectedUser, setUsersList } = userSlice.actions;

export default userSlice.reducer;
