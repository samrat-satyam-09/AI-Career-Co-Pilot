import { z } from "zod";

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required").trim(),
  role: z.string().min(1, "Role is required").trim(),
  jdText: z.string().optional(),
  jdUrl: z.string().url("Invalid URL").optional(),
  status: z
    .enum(["wishlist", "applied", "oa", "interview", "offer", "rejected"])
    .default("wishlist"),
  appliedDate: z.coerce.date().optional(),
  followUpDate: z.coerce.date().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export const updateStatusSchema = z.object({
  status: z.enum(["wishlist", "applied", "oa", "interview", "offer", "rejected"]),
});

export const addNoteSchema = z.object({
  text: z.string().min(1, "Note text is required").max(500, "Note too long"),
});
