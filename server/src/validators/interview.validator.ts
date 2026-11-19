import { z } from "zod";

export const startInterviewSchema = z.object({
  targetRole: z.string().min(1, "Target role is required").trim(),
  targetCompany: z.string().trim().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  type: z.enum(["dsa", "hr", "system-design", "behavioral"]),
});

export const submitAnswerSchema = z.object({
  answer: z.string().min(1, "Answer is required").max(5000, "Answer too long"),
});
