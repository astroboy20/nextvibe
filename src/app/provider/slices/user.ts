import { IUser } from "@/types/user.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


type Role = "attendee" | "organizer" | "sponsor";

interface AuthState {
  user: Partial<IUser> | null;
  token: string | null;
  role: Role;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  role: "attendee",
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<IUser> | null>) {
      state.user = action.payload;
    //   state.token = action.payload?.token || null;
    },

    setRole(state, action: PayloadAction<Role>) {
      state.role = action.payload;
    },

    setIsAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = "attendee";
    },
  },
});

export const {
  setUser,
  setRole,
  setIsAuthenticated,
  logout,
} = authSlice.actions;

export default authSlice.reducer;