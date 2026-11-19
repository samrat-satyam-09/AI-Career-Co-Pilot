import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  authProvider: "local" | "google" | "github";
  role: "user" | "admin";
  subscription: {
    plan: mongoose.Types.ObjectId;
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
    status: "active" | "cancelled" | "expired" | "trial" | "none";
    currentPeriodEnd?: Date;
    couponApplied?: mongoose.Types.ObjectId;
    discountApplied?: number;
  };
  usage: {
    resumeTailorsThisMonth: number;
    jdAnalysisThisMonth: number;
    atsScoreChecksThisMonth: number;
    coverLettersThisMonth: number;
    mockInterviewsThisMonth: number;
    aiChatMessagesToday: number;
    skillGapAnalysisThisMonth: number;
    resetDate: Date;
    dailyResetDate: Date;
  };
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  refreshToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: Date;
  verifyExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password by default
    },
    avatar: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" },
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    subscription: {
      plan: {
        type: Schema.Types.ObjectId,
        ref: "Plan",
      },
      razorpayCustomerId: String,
      razorpaySubscriptionId: String,
      status: {
        type: String,
        enum: ["active", "cancelled", "expired", "trial", "none"],
        default: "none",
      },
      currentPeriodEnd: Date,
      couponApplied: {
        type: Schema.Types.ObjectId,
        ref: "Coupon",
      },
      discountApplied: Number,
    },
    usage: {
      resumeTailorsThisMonth: { type: Number, default: 0 },
      jdAnalysisThisMonth: { type: Number, default: 0 },
      atsScoreChecksThisMonth: { type: Number, default: 0 },
      coverLettersThisMonth: { type: Number, default: 0 },
      mockInterviewsThisMonth: { type: Number, default: 0 },
      aiChatMessagesToday: { type: Number, default: 0 },
      skillGapAnalysisThisMonth: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now },
      dailyResetDate: { type: Date, default: Date.now },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: String,
    otpExpiry: Date,
    refreshToken: String,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    verifyExpiry: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Index for performance
userSchema.index({ email: 1 });
userSchema.index({ "subscription.status": 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// TTL index — auto-delete unverified users after verifyExpiry passes
// Only documents where verifyExpiry exists are affected
userSchema.index({ verifyExpiry: 1 }, { expireAfterSeconds: 0 });

// Mongoose middleware for Redis user cache invalidation
userSchema.post("save", async function (doc) {
  try {
    const { invalidateUserCache } = require("../utils/userCache");
    await invalidateUserCache(doc._id.toString());
  } catch (error) {
    console.error("Failed to invalidate user cache on save:", error);
  }
});

userSchema.post("findOneAndUpdate", async function () {
  try {
    const query = this.getQuery();
    let userId = query._id;
    if (!userId) {
      const doc = await this.model.findOne(query);
      if (doc) userId = doc._id;
    }
    if (userId) {
      const { invalidateUserCache } = require("../utils/userCache");
      await invalidateUserCache(userId.toString());
    }
  } catch (error) {
    console.error("Failed to invalidate user cache on findOneAndUpdate:", error);
  }
});


const User = mongoose.model<IUser>("User", userSchema);
export default User;
