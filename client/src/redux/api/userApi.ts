import { baseApi } from "./baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/users/profile
    getProfile: builder.query<{ data: { user: any } }, void>({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),

    // PUT /api/v1/users/profile
    updateProfile: builder.mutation<
      { data: { user: any }; message: string },
      { name?: string }
    >({
      query: (body) => ({ url: "/users/profile", method: "PUT", body }),
      invalidatesTags: ["User"],
    }),

    // PUT /api/v1/users/avatar
    uploadAvatar: builder.mutation<
      { data: { avatar: { public_id: string; url: string } } },
      { avatar: string }
    >({
      query: (body) => ({ url: "/users/avatar", method: "PUT", body }),
      invalidatesTags: ["User"],
    }),

    // PUT /api/v1/users/change-password
    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/users/change-password", method: "PUT", body }),
    }),

    // GET /api/v1/users/usage
    getUsage: builder.query<{ data: { usage: any; plan: any } }, void>({
      query: () => "/users/usage",
      providesTags: ["User"],
    }),

    // DELETE /api/v1/users/account
    deleteAccount: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/users/account", method: "DELETE" }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useGetUsageQuery,
  useDeleteAccountMutation,
} = userApi;
