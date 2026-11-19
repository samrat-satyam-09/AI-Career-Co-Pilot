import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "@/lib/constants";

// Base query with auth headers
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include", // Send cookies (refresh token)
  prepareHeaders: (headers) => {
    // Get access token from memory (not localStorage for security)
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("accessToken")
        : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Auth endpoints where a 401 means "wrong credentials", not "expired token"
const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/verify-reset-token",
  "/auth/reset-password",
];

// Extract the URL string from the args (could be a string or FetchArgs object)
const getRequestUrl = (args: string | FetchArgs): string =>
  typeof args === "string" ? args : args.url;

// Base query with automatic token refresh on 401
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 (token expired), try to refresh
  if (result.error && result.error.status === 401) {
    const url = getRequestUrl(args);

    // Skip refresh logic for auth endpoints — 401 here means wrong credentials
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.startsWith(ep));
    if (isAuthEndpoint) {
      return result;
    }

    // Try to get a new access token using refresh token cookie
    const refreshResult = await rawBaseQuery(
      "/auth/refresh-token",
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { data: { accessToken: string } };
      // Store new access token
      sessionStorage.setItem("accessToken", data.data.accessToken);

      // Retry the original request
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — clear token and redirect to login
      sessionStorage.removeItem("accessToken");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  return result;
};

// Base API — all API slices will inject endpoints into this
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Resume",
    "Application",
    "Interview",
    "Notification",
    "Subscription",
    "Plan",
    "Coupon",
    "AdminUsers",
    "AdminAnalytics",
    "AdminConfig",
    "AdminLogs",
  ],
  endpoints: () => ({}),
});
