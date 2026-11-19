import mongoose, { Document, Schema } from "mongoose";

interface IQuestion {
  question: string;
  userAnswer?: string;
  aiFeedback?: string;
  score?: number;
}

export interface IInterviewSession extends Document {
  user: mongoose.Types.ObjectId;
  targetRole: string;
  targetCompany?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "dsa" | "hr" | "system-design" | "behavioral";
  questions: IQuestion[];
  overallFeedback?: string;
  overallScore?: number;
  status: "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: [true, "Target role is required"],
      trim: true,
    },
    targetCompany: { type: String, trim: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["dsa", "hr", "system-design", "behavioral"],
      required: [true, "Interview type is required"],
    },
    questions: [
      {
        question: { type: String, required: true },
        userAnswer: String,
        aiFeedback: String,
        score: { type: Number, min: 0, max: 10 },
      },
    ],
    overallFeedback: String,
    overallScore: { type: Number, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ user: 1, status: 1 });
interviewSessionSchema.index({ user: 1, createdAt: -1 });

const InterviewSession = mongoose.model<IInterviewSession>(
  "InterviewSession",
  interviewSessionSchema
);
export default InterviewSession;
