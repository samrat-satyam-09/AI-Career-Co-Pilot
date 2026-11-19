import mongoose, { Document, Schema } from "mongoose";

export interface IContentBlock extends Document {
  key: string;
  type: "text" | "html" | "json";
  content: unknown;
  page: string;
  isActive: boolean;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const contentBlockSchema = new Schema<IContentBlock>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "html", "json"],
      default: "text",
    },
    content: { type: Schema.Types.Mixed, required: true },
    page: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

contentBlockSchema.index({ key: 1 }, { unique: true });
contentBlockSchema.index({ page: 1, isActive: 1 });

const ContentBlock = mongoose.model<IContentBlock>(
  "ContentBlock",
  contentBlockSchema
);
export default ContentBlock;
