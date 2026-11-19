import mongoose, { Document, Schema } from "mongoose";

interface IRedemption {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  discountApplied: number;
  redeemedAt: Date;
}

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscountAmount?: number;
  validFrom: Date;
  validUntil: Date;
  maxTotalUses: number;
  maxUsesPerUser: number;
  currentUses: number;
  applicablePlans: string[];
  minPurchaseAmount: number;
  isFirstPurchaseOnly: boolean;
  redemptions: IRedemption[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{3,20}$/, "Code must be 3-20 alphanumeric characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount must be at least 1"],
    },
    maxDiscountAmount: Number,
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    maxTotalUses: { type: Number, default: -1 }, // -1 = unlimited
    maxUsesPerUser: { type: Number, default: 1 },
    currentUses: { type: Number, default: 0 },
    applicablePlans: [String], // Plan slugs, empty = all paid plans
    minPurchaseAmount: { type: Number, default: 0 },
    isFirstPurchaseOnly: { type: Boolean, default: false },
    redemptions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
        discountApplied: { type: Number, required: true },
        redeemedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1, validUntil: 1 });
couponSchema.index({ "redemptions.user": 1 });

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;
