import { z } from "zod";

export const createResumeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  parsedData: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      summary: z.string().optional(),
      skills: z.array(z.string()).default([]),
      experience: z
        .array(
          z.object({
            company: z.string(),
            role: z.string(),
            duration: z.string(),
            description: z.string(),
          })
        )
        .default([]),
      education: z
        .array(
          z.object({
            institution: z.string(),
            degree: z.string(),
            year: z.string(),
            gpa: z.string().optional(),
          })
        )
        .default([]),
      projects: z
        .array(
          z.object({
            name: z.string(),
            description: z.string(),
            technologies: z.array(z.string()).default([]),
            link: z.string().url().optional(),
          })
        )
        .default([]),
      certifications: z.array(z.string()).default([]),
    })
    .optional(),
});

export const updateResumeSchema = createResumeSchema.partial();
