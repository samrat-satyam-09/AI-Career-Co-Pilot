import { z } from "zod";

export const analyzeJDSchema = z.object({
  jdText: z.string().min(50, "JD text must be at least 50 characters").max(10000),
});

export const matchScoreSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  jdText: z.string().min(50, "JD text must be at least 50 characters").max(10000),
});

export const tailorResumeSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  jdText: z.string().min(50, "JD text must be at least 50 characters").max(10000),
  applicationId: z.string().optional(),
});

export const atsScoreSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
});

export const coverLetterSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  jdText: z.string().min(50, "JD text must be at least 50 characters").max(10000),
  tone: z.enum(["professional", "friendly", "enthusiastic"]).default("professional"),
});

export const skillGapSchema = z.object({
  resumeId: z.string().min(1, "Resume ID is required"),
  jdText: z.string().min(50, "JD text must be at least 50 characters").max(10000),
});

export const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .default([]),
});
