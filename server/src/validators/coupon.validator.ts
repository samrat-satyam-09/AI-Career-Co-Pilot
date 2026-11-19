import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code cannot exceed 20 characters")
    .regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric")
    .transform((v) => v.toUpperCase()),
  description: z.string().min(1, "Description is required"),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number().min(1, "Discount value must be at least 1"),
  maxDiscountAmount: z.number().optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  maxTotalUses: z.number().default(-1),
  maxUsesPerUser: z.number().default(1),
  applicablePlans: z.array(z.string()).default([]),
  minPurchaseAmount: z.number().default(0),
  isFirstPurchaseOnly: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine((data) => data.validUntil > data.validFrom, {
  message: "Expiry date must be after start date",
  path: ["validUntil"],
}).refine(
  (data) => {
    if (data.discountType === "percentage" && data.discountValue > 100) return false;
    return true;
  },
  { message: "Percentage discount cannot exceed 100%", path: ["discountValue"] }
);

export const updateCouponSchema = z.object({
  description: z.string().optional(),
  discountValue: z.number().min(1).optional(),
  maxDiscountAmount: z.number().optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
  maxTotalUses: z.number().optional(),
  maxUsesPerUser: z.number().optional(),
  applicablePlans: z.array(z.string()).optional(),
  minPurchaseAmount: z.number().optional(),
  isFirstPurchaseOnly: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").transform((v) => v.toUpperCase()),
  planSlug: z.string().min(1, "Plan is required"),
});

export const applyCouponSchema = validateCouponSchema;
