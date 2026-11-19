import mongoose, { Document, Schema } from "mongoose";

interface IResumeVersion {
  versionNumber: number;
  tailoredForApplication?: mongoose.Types.ObjectId;
  content: Record<string, unknown>;
  atsScore?: number;
  createdAt: Date;
}

export interface IResume extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  isPrimary: boolean;
  rawFileUrl?: string;
  rawFilePublicId?: string;
  parsedData: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills: string[];
    experience: Array<{
      company: string;
      role: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      year: string;
      gpa?: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>;
    certifications: string[];
  };
  versions: IResumeVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeVersionSchema = new Schema<IResumeVersion>(
  {
    versionNumber: { type: Number, required: true },
    tailoredForApplication: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
    },
    content: { type: Schema.Types.Mixed, required: true },
    atsScore: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const resumeSchema = new Schema<IResume>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    isPrimary: { type: Boolean, default: false },
    rawFileUrl: String,
    rawFilePublicId: String,
    parsedData: {
      name: String,
      email: String,
      phone: String,
      summary: String,
      skills: [String],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          year: String,
          gpa: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          link: String,
        },
      ],
      certifications: [String],
    },
    versions: [resumeVersionSchema],
  },
  { timestamps: true }
);

resumeSchema.index({ user: 1, isPrimary: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });

const Resume = mongoose.model<IResume>("Resume", resumeSchema);
export default Resume;
