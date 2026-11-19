import mongoose, { Schema } from "mongoose";


export interface IAIUsageLog {
  user: mongoose.Types.ObjectId;
  endpoint: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  responseTimeMs: number;
  success: boolean;
  error?: string;
  createdAt?: Date;
}


const aiUsageLogSchema = new Schema<IAIUsageLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    endpoint: { type: String, required: true },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    costUSD: { type: Number, default: 0 },
    responseTimeMs: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
    error: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

aiUsageLogSchema.index({ user: 1, createdAt: -1 });
aiUsageLogSchema.index({ provider: 1, model: 1, createdAt: -1 });
aiUsageLogSchema.index({ createdAt: -1 });

const AIUsageLog = mongoose.model<IAIUsageLog>("AIUsageLog", aiUsageLogSchema);
export default AIUsageLog;
