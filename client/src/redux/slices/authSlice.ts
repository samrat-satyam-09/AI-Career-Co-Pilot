import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: { public_id: string; url: string };
  role: "user" | "admin";
  authProvider: "local" | "google" | "github";
  isVerified: boolean;
  subscription: {
    plan?: {
      _id: string;
      name: string;
      slug: string;
      type: string;
      limits: Record<string, number>;
      features: Record<string, boolean>;
    };
    status: "active" | "cancelled" | "expired" | "trial" | "none";
    currentPeriodEnd?: string;
  };
  usage: {
    resumeTailorsThisMonth: number;
    jdAnalysisThisMonth: number;
    atsScoreChecksThisMonth: number;
    coverLettersThisMonth: number;
    mockInterviewsThisMonth: number;
    aiChatMessagesToday: number;
    skillGapAnalysisThisMonth: number;
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true initially to allow hydration check
};

import { broadcastAuthEvent } from "@/utils/authSync";

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; skipBroadcast?: boolean }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        sessionStorage.setItem("accessToken", action.payload.accessToken);
        if (!action.payload.skipBroadcast) {
          broadcastAuthEvent("LOGIN", { user: action.payload.user, accessToken: action.payload.accessToken });
        }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearCredentials: (state, action: PayloadAction<{ skipBroadcast?: boolean } | undefined>) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("accessToken");
        if (!action?.payload?.skipBroadcast) {
          broadcastAuthEvent("LOGOUT");
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, clearCredentials, setLoading } =
  authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectUserPlan = (state: { auth: AuthState }) => state.auth.user?.subscription?.plan?.slug || "free";
