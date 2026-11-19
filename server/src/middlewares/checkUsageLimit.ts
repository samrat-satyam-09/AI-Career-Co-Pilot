import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Plan from "../models/Plan";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import { getRedis } from "../config/redis";

type UsageField =
  | "resumeTailorsThisMonth"
  | "jdAnalysisThisMonth"
  | "atsScoreChecksThisMonth"
  | "coverLettersThisMonth"
  | "mockInterviewsThisMonth"
  | "aiChatMessagesToday"
  | "skillGapAnalysisThisMonth";

type LimitField =
  | "resumeTailorsPerMonth"
  | "jdAnalysisPerMonth"
  | "atsScoreChecksPerMonth"
  | "coverLettersPerMonth"
  | "mockInterviewsPerMonth"
  | "aiChatMessagesPerDay"
  | "skillGapAnalysisPerMonth";

const usageToLimitMap: Record<UsageField, LimitField> = {
  resumeTailorsThisMonth: "resumeTailorsPerMonth",
  jdAnalysisThisMonth: "jdAnalysisPerMonth",
  atsScoreChecksThisMonth: "atsScoreChecksPerMonth",
  coverLettersThisMonth: "coverLettersPerMonth",
  mockInterviewsThisMonth: "mockInterviewsPerMonth",
  aiChatMessagesToday: "aiChatMessagesPerDay",
  skillGapAnalysisThisMonth: "skillGapAnalysisPerMonth",
};

// Check if user has exceeded their plan's usage limit for a specific feature
export const checkUsageLimit = (usageField: UsageField) => {
  return catchAsyncErrors(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const user = req.user;
      if (!user) {
        return next(new ErrorHandler("Authentication required", 401));
      }

      // Admin bypasses all limits
      if (user.role === "admin") return next();

      // Get user's plan limits (from Redis cache or DB)
      const redis = getRedis();
      let planLimits: Record<string, number> | null = null;

      if (user.subscription?.plan) {
        const cached = await redis.get(`plan:${user.subscription.plan}`);
        if (cached) {
          planLimits = JSON.parse(cached);
        } else {
          const plan = await Plan.findById(user.subscription.plan);
          if (plan) {
            planLimits = plan.limits as unknown as Record<string, number>;
            await redis.set(
              `plan:${user.subscription.plan}`,
              JSON.stringify(planLimits)
            );
          }
        }
      }

      // Fallback to free plan limits if no plan found
      if (!planLimits) {
        const freePlan = await Plan.findOne({ isDefault: true });
        planLimits = freePlan?.limits as unknown as Record<string, number>;
      }

      if (!planLimits) return next(); // No plan config — allow through

      const limitField = usageToLimitMap[usageField];
      const limit = planLimits[limitField];

      // -1 means unlimited
      if (limit === -1) return next();

      const currentUsage = user.usage?.[usageField] || 0;

      if (currentUsage >= limit) {
        return next(
          new ErrorHandler(
            `You've reached your ${limitField.replace(/PerMonth|PerDay/g, "")} limit. Upgrade to Pro for unlimited access.`,
            402
          )
        );
      }

      // Increment usage
      await User.findByIdAndUpdate(user._id, {
        $inc: { [`usage.${usageField}`]: 1 },
      });

      next();
    }
  );
};
