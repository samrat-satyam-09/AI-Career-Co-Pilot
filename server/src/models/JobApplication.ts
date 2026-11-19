import mongoose, { Document, Schema } from "mongoose";

interface INote {
  text: string;
  createdAt: Date;
}

interface ITimelineEntry {
  status: string;
  changedAt: Date;
}

export interface IJobApplication extends Document {
  user: mongoose.Types.ObjectId;
  company: string;
  role: string;
  jdText?: string;
  jdUrl?: string;
  status:
    | "wishlist"
    | "applied"
    | "oa"
    | "interview"
    | "offer"
    | "rejected";
  resumeVersionUsed?: mongoose.Types.ObjectId;
  coverLetter?: string;
  matchScore?: number;
  skillGaps: string[];
  appliedDate?: Date;
  followUpDate?: Date;
  notes: INote[];
  timeline: ITimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    jdText: String,
    jdUrl: String,
    status: {
      type: String,
      enum: ["wishlist", "applied", "oa", "interview", "offer", "rejected"],
      default: "wishlist",
    },
    resumeVersionUsed: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
    },
    coverLetter: String,
    matchScore: { type: Number, min: 0, max: 100 },
    skillGaps: [String],
    appliedDate: Date,
    followUpDate: Date,
    notes: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    timeline: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

jobApplicationSchema.index({ user: 1, status: 1 });
jobApplicationSchema.index({ user: 1, createdAt: -1 });
jobApplicationSchema.index({ user: 1, followUpDate: 1 });
jobApplicationSchema.index({ user: 1, company: "text", role: "text" });

const JobApplication = mongoose.model<IJobApplication>(
  "JobApplication",
  jobApplicationSchema
);
export default JobApplication;
