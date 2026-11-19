import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").trim(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only")
    .trim(),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["free", "paid"]),
  price: z.number().min(0).default(0),
  currency: z.string().default("INR"),
  billingCycle: z.enum(["monthly", "annual", "lifetime"]).default("monthly"),
  displayPrice: z.string().default("Free"),
  originalPrice: z.number().optional(),
  isPopular: z.boolean().default(false),
  displayOrder: z.number().default(0),
  badgeText: z.string().optional(),
  color: z.string().optional(),
  limits: z.object({
    resumeUploads: z.number().default(1),
    resumeTailorsPerMonth: z.number().default(3),
    jdAnalysisPerMonth: z.number().default(5),
    atsScoreChecksPerMonth: z.number().default(3),
    coverLettersPerMonth: z.number().default(2),
    mockInterviewsPerMonth: z.number().default(2),
    jobApplications: z.number().default(10),
    aiChatMessagesPerDay: z.number().default(10),
    skillGapAnalysisPerMonth: z.number().default(2),
  }),
  features: z.object({
    priorityAIModels: z.boolean().default(false),
    exportPDF: z.boolean().default(false),
    exportDOCX: z.boolean().default(false),
    voiceInterviews: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
    customResumeTemplates: z.boolean().default(false),
    advancedAnalytics: z.boolean().default(false),
  }),
  featureList: z
    .array(
      z.object({
        text: z.string(),
        included: z.boolean(),
      })
    )
    .default([]),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const updatePlanSchema = createPlanSchema.partial();
