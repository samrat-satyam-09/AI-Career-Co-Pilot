import mongoose, { Document, Schema } from "mongoose";

export interface ISystemLog extends Document {
  level: "info" | "warn" | "error" | "critical";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: mongoose.Types.ObjectId;
  ip?: string;
  createdAt: Date;
}

const systemLogSchema = new Schema<ISystemLog>(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error", "critical"],
      required: true,
    },
    source: { type: String, required: true },
    message: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ source: 1, createdAt: -1 });
systemLogSchema.index({ createdAt: -1 });

// Auto-delete logs older than 30 days
systemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const SystemLog = mongoose.model<ISystemLog>("SystemLog", systemLogSchema);
export default SystemLog;
