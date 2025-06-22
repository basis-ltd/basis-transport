import { createSlice } from '@reduxjs/toolkit';
import { Role } from '@/types/role.type';

interface RoleState {
  rolesList: Role[];
  role?: Role;
  selectedRole?: Role;
}

const initialState: RoleState = {
  rolesList: [],
  role: undefined,
  selectedRole: undefined,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRolesList: (state, action) => {
      state.rolesList = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
  },
});

export const { setRolesList, setRole, setSelectedRole } = roleSlice.actions;

export default roleSlice.reducer;
