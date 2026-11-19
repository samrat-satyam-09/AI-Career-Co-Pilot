import { baseApi } from "./baseApi";

export interface Resume {
  _id: string;
  title: string;
  isPrimary: boolean;
  rawFileUrl?: string;
  parsedData: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      year: string;
      gpa?: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>;
    certifications: string[];
  };
  versions?: Array<{
    versionNumber: number;
    atsScore?: number;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const resumeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/resumes
    getAllResumes: builder.query<{ data: { resumes: Resume[]; count: number } }, void>({
      query: () => "/resumes",
      providesTags: ["Resume"],
    }),

    // GET /api/v1/resumes/:id
    getResumeById: builder.query<{ data: { resume: Resume } }, string>({
      query: (id) => `/resumes/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Resume", id }],
    }),

    // POST /api/v1/resumes
    createResume: builder.mutation<
      { data: { resume: Resume } },
      { title: string; parsedData?: Partial<Resume["parsedData"]> }
    >({
      query: (body) => ({ url: "/resumes", method: "POST", body }),
      invalidatesTags: ["Resume"],
    }),

    // POST /api/v1/resumes/upload
    uploadResume: builder.mutation<
      { data: { resume: Resume } },
      { file: string; title?: string }
    >({
      query: (body) => ({ url: "/resumes/upload", method: "POST", body }),
      invalidatesTags: ["Resume"],
    }),

    // PUT /api/v1/resumes/:id
    updateResume: builder.mutation<
      { data: { resume: Resume } },
      { id: string; title?: string; parsedData?: Partial<Resume["parsedData"]> }
    >({
      query: ({ id, ...body }) => ({ url: `/resumes/${id}`, method: "PUT", body }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Resume", id }, "Resume"],
    }),

    // DELETE /api/v1/resumes/:id
    deleteResume: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/resumes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Resume"],
    }),

    // PUT /api/v1/resumes/:id/primary
    setPrimaryResume: builder.mutation<{ data: { resume: Resume } }, string>({
      query: (id) => ({ url: `/resumes/${id}/primary`, method: "PUT" }),
      invalidatesTags: ["Resume"],
    }),

    // GET /api/v1/resumes/:id/versions
    getResumeVersions: builder.query<{ data: { versions: any[] } }, string>({
      query: (id) => `/resumes/${id}/versions`,
    }),

    // POST /api/v1/resumes/:id/duplicate
    duplicateResume: builder.mutation<{ data: { resume: Resume } }, string>({
      query: (id) => ({ url: `/resumes/${id}/duplicate`, method: "POST" }),
      invalidatesTags: ["Resume"],
    }),
  }),
});

export const {
  useGetAllResumesQuery,
  useGetResumeByIdQuery,
  useCreateResumeMutation,
  useUploadResumeMutation,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useSetPrimaryResumeMutation,
  useGetResumeVersionsQuery,
  useDuplicateResumeMutation,
} = resumeApi;
