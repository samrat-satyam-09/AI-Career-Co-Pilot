import mongoose, { Document, Schema } from "mongoose";

export interface ISystemConfig extends Document {
  key: string;
  value: unknown;
  category: "general" | "ai" | "email" | "features";
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const systemConfigSchema = new Schema<ISystemConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ["general", "ai", "email", "features"],
      default: "general",
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

systemConfigSchema.index({ key: 1 }, { unique: true });
systemConfigSchema.index({ category: 1 });

const SystemConfig = mongoose.model<ISystemConfig>(
  "SystemConfig",
  systemConfigSchema
);
export default SystemConfig;
