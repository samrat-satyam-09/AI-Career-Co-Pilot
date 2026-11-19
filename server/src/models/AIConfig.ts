import mongoose, { Document, Schema } from "mongoose";

export interface IAIConfig extends Document {
  provider: "gemini" | "groq" | "openai" | "anthropic";
  modelName: string;
  apiKey: string; // Encrypted
  tier: "free" | "pro";
  priority: number;
  isActive: boolean;
  rateLimitPerMinute: number;
  maxTokens: number;
  costPer1kTokens: number;
  updatedAt: Date;
}

const aiConfigSchema = new Schema<IAIConfig>(
  {
    provider: {
      type: String,
      enum: ["gemini", "groq", "openai", "anthropic"],
      required: true,
    },
    modelName: { type: String, required: true },
    apiKey: { type: String, required: true }, // Stored encrypted
    tier: {
      type: String,
      enum: ["free", "pro"],
      required: true,
    },
    priority: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    rateLimitPerMinute: { type: Number, default: 60 },
    maxTokens: { type: Number, default: 4096 },
    costPer1kTokens: { type: Number, default: 0 },
  },
  { timestamps: true }
);

aiConfigSchema.index({ tier: 1, priority: 1, isActive: 1 });

const AIConfig = mongoose.model<IAIConfig>("AIConfig", aiConfigSchema);
export default AIConfig;
