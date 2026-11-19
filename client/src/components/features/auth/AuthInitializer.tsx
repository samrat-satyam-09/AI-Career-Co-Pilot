"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/redux/store";
import { setCredentials, clearCredentials, setLoading } from "@/redux/slices/authSlice";

/**
 * AuthInitializer — runs once on app mount to restore auth state
 * from refresh token cookie (via /auth/me endpoint).
 * This handles page refresh scenarios without requiring re-login.
 */
export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have an access token in sessionStorage first
        const storedToken = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;

        if (!storedToken) {
          // Try refresh token cookie to get a new access token
          const refreshRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/refresh-token`,
            { method: "POST", credentials: "include" }
          );

          if (!refreshRes.ok) {
            dispatch(clearCredentials());
            return;
          }

          const refreshData = await refreshRes.json();
          const newToken = refreshData?.data?.accessToken;
          if (!newToken) {
            dispatch(clearCredentials());
            return;
          }

          if (typeof window !== "undefined") {
            sessionStorage.setItem("accessToken", newToken);
          }

          // Fetch user profile
          const meRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/me`,
            {
              headers: { Authorization: `Bearer ${newToken}` },
              credentials: "include",
            }
          );

          if (!meRes.ok) {
            dispatch(clearCredentials());
            return;
          }

          const meData = await meRes.json();
          dispatch(setCredentials({ user: meData.data.user, accessToken: newToken }));
        } else {
          // We have a stored token — fetch user profile
          const meRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/me`,
            {
              headers: { Authorization: `Bearer ${storedToken}` },
              credentials: "include",
            }
          );

          if (!meRes.ok) {
            // Token expired — try refresh
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("accessToken");
            }
            dispatch(clearCredentials());
            return;
          }

          const meData = await meRes.json();
          dispatch(setCredentials({ user: meData.data.user, accessToken: storedToken }));
        }
      } catch {
        dispatch(clearCredentials());
      } finally {
        dispatch(setLoading(false));
      }
    };

    dispatch(setLoading(true));
    initAuth();

    // ── Cross-Tab Auth Synchronization ─────────────────────────────────────
    const handleAuthEvent = (data: { type: "LOGIN" | "LOGOUT"; user?: any; accessToken?: string }) => {
      if (data.type === "LOGOUT") {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("accessToken");
          document.cookie = "isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        dispatch(clearCredentials({ skipBroadcast: true }));
      } else if (data.type === "LOGIN") {
        if (data.user && data.accessToken) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("accessToken", data.accessToken);
          }
          dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, skipBroadcast: true }));
        } else {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("accessToken");
          }
          initAuth();
        }
      }
    };

    // 1. Storage Event Listener for cross-tab localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_event" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          handleAuthEvent(data);
        } catch (err) {
          // Ignore JSON parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // 2. BroadcastChannel for instant cross-tab messaging
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("auth_channel");
        channel.onmessage = (event) => {
          if (event.data?.type) {
            handleAuthEvent(event.data);
          }
        };
      } catch (err) {
        // BroadcastChannel unsupported or restricted
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (channel) {
        channel.close();
      }
    };
  }, [dispatch]);

  return <>{children}</>;
}
