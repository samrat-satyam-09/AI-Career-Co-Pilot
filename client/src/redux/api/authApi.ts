import { baseApi } from "./baseApi";
import { setCredentials, clearCredentials } from "../slices/authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/v1/auth/register
    register: builder.mutation<
      { data: { email: string }; message: string },
      { name: string; email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),

    // POST /api/v1/auth/verify-otp
    verifyOTP: builder.mutation<
      { data: { user: any; accessToken: string }; message: string },
      { email: string; otp: string }
    >({
      query: (body) => ({ url: "/auth/verify-otp", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      },
    }),

    // POST /api/v1/auth/resend-otp
    resendOTP: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/resend-otp", method: "POST", body }),
    }),

    // POST /api/v1/auth/login
    login: builder.mutation<
      { data: { user: any; accessToken: string }; message: string },
      { email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken }));
      },
    }),

    // POST /api/v1/auth/logout
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(clearCredentials());
      },
    }),

    // POST /api/v1/auth/refresh-token
    refreshToken: builder.mutation<{ data: { accessToken: string } }, void>({
      query: () => ({ url: "/auth/refresh-token", method: "POST" }),
    }),

    // POST /api/v1/auth/forgot-password
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    // GET /api/v1/auth/verify-reset-token/:token
    verifyResetToken: builder.query<{ data: { valid: boolean }; message: string }, string>({
      query: (token) => `/auth/verify-reset-token/${token}`,
    }),

    // POST /api/v1/auth/reset-password/:token
    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string; confirmPassword: string }
    >({
      query: ({ token, ...body }) => ({
        url: `/auth/reset-password/${token}`,
        method: "POST",
        body,
      }),
    }),

    // GET /api/v1/auth/me
    getMe: builder.query<{ data: { user: any } }, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyOTPMutation,
  useResendOTPMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useVerifyResetTokenQuery,
  useResetPasswordMutation,
  useGetMeQuery,
} = authApi;
