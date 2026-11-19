import { Request, Response, NextFunction } from "express";
import SystemConfig from "../models/SystemConfig";
import ErrorHandler from "../utils/ErrorHandler";
import { getRedis } from "../config/redis";

// Check maintenance mode — blocks all non-admin routes if enabled
const maintenanceMode = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip check for admin routes
    if (req.originalUrl.startsWith("/api/v1/admin")) {
      return next();
    }

    // Skip health check
    if (req.originalUrl === "/api/v1/health") {
      return next();
    }

    // Check Redis cache first
    const redis = getRedis();
    const cached = await redis.get("config:maintenance_mode");

    if (cached !== null) {
      if (cached === "true") {
        return next(
          new ErrorHandler(
            "Service is currently under maintenance. Please try again later.",
            503
          )
        );
      }
      return next();
    }

    // Fallback to DB
    const config = await SystemConfig.findOne({ key: "maintenance_mode" });
    const isMaintenanceMode = config?.value === true;

    // Cache the result
    await redis.set("config:maintenance_mode", String(isMaintenanceMode));

    if (isMaintenanceMode) {
      return next(
        new ErrorHandler(
          "Service is currently under maintenance. Please try again later.",
          503
        )
      );
    }

    next();
  } catch {
    // If check fails, allow request through
    next();
  }
};

export default maintenanceMode;
