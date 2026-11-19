import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string;
  slug: string;
  description: string;
  type: "free" | "paid";
  price: number;
  currency: string;
  billingCycle: "monthly" | "annual" | "lifetime";
  razorpayPlanId?: string;
  displayPrice: string;
  originalPrice?: number;
  isPopular: boolean;
  displayOrder: number;
  badgeText?: string;
  color?: string;
  limits: {
    resumeUploads: number;
    resumeTailorsPerMonth: number;
    jdAnalysisPerMonth: number;
    atsScoreChecksPerMonth: number;
    coverLettersPerMonth: number;
    mockInterviewsPerMonth: number;
    jobApplications: number;
    aiChatMessagesPerDay: number;
    skillGapAnalysisPerMonth: number;
  };
  features: {
    priorityAIModels: boolean;
    exportPDF: boolean;
    exportDOCX: boolean;
    voiceInterviews: boolean;
    prioritySupport: boolean;
    customResumeTemplates: boolean;
    advancedAnalytics: boolean;
  };
  featureList: Array<{
    text: string;
    included: boolean;
  }>;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Plan description is required"],
    },
    type: {
      type: String,
      enum: ["free", "paid"],
      required: true,
    },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    billingCycle: {
      type: String,
      enum: ["monthly", "annual", "lifetime"],
      default: "monthly",
    },
    razorpayPlanId: String,
    displayPrice: { type: String, default: "Free" },
    originalPrice: Number,
    isPopular: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    badgeText: String,
    color: String,
    limits: {
      resumeUploads: { type: Number, default: 1 },
      resumeTailorsPerMonth: { type: Number, default: 3 },
      jdAnalysisPerMonth: { type: Number, default: 5 },
      atsScoreChecksPerMonth: { type: Number, default: 3 },
      coverLettersPerMonth: { type: Number, default: 2 },
      mockInterviewsPerMonth: { type: Number, default: 2 },
      jobApplications: { type: Number, default: 10 },
      aiChatMessagesPerDay: { type: Number, default: 10 },
      skillGapAnalysisPerMonth: { type: Number, default: 2 },
    },
    features: {
      priorityAIModels: { type: Boolean, default: false },
      exportPDF: { type: Boolean, default: false },
      exportDOCX: { type: Boolean, default: false },
      voiceInterviews: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      customResumeTemplates: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
    },
    featureList: [
      {
        text: { type: String, required: true },
        included: { type: Boolean, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

planSchema.index({ slug: 1 }, { unique: true });
planSchema.index({ isActive: 1, displayOrder: 1 });

const Plan = mongoose.model<IPlan>("Plan", planSchema);
export default Plan;
