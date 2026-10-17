import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { meRequest } from "@/features/auth/api";
import type { AuthUser } from "@/features/auth/types";
import {
  clearAccessToken,
  loadAccessToken,
  saveAccessToken,
} from "@/lib/secure-token";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  status: "idle" | "loading" | "ready";
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

export const bootstrapAuth = createAsyncThunk(
  "auth/bootstrap",
  async (_, { rejectWithValue }) => {
    const token = await loadAccessToken();
    if (!token) {
      return { token: null, user: null };
    }

    try {
      const user = await meRequest(token);
      return { token, user };
    } catch {
      await clearAccessToken();
      return rejectWithValue("Session expired");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.status = "ready";
      state.error = null;
      void saveAccessToken(action.payload.token);
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      state.status = "ready";
      state.error = null;
      void clearAccessToken();
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.status = "ready";
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.status = "ready";
      });
  },
});

export const { setSession, setUser, clearSession } = authSlice.actions;
export default authSlice.reducer;
