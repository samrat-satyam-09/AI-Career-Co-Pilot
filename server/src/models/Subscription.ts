import mongoose, { Document, Schema } from "mongoose";

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  razorpaySubscriptionId: string;
  plan: mongoose.Types.ObjectId;
  status: "created" | "authenticated" | "active" | "paused" | "cancelled" | "completed" | "expired";
  startDate?: Date;
  endDate?: Date;
  couponApplied?: mongoose.Types.ObjectId;
  discountApplied?: number;
  invoices: Array<{
    invoiceId: string;
    amount: number;
    date: Date;
    status: "paid" | "pending" | "failed";
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "authenticated", "active", "paused", "cancelled", "completed", "expired"],
      default: "created",
    },
    startDate: Date,
    endDate: Date,
    couponApplied: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    discountApplied: Number,
    invoices: [
      {
        invoiceId: String,
        amount: Number,
        date: Date,
        status: {
          type: String,
          enum: ["paid", "pending", "failed"],
          default: "pending",
        },
      },
    ],
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });

const Subscription = mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema
);
export default Subscription;
