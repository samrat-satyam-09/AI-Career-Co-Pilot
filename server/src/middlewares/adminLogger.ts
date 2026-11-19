import { Request, Response, NextFunction } from "express";
import SystemLog from "../models/SystemLog";

// Logs all admin actions to SystemLog for audit trail
const adminLogger = (action: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await SystemLog.create({
        level: "info",
        source: "admin",
        message: `Admin action: ${action}`,
        metadata: {
          adminId: req.user?._id,
          adminEmail: req.user?.email,
          method: req.method,
          path: req.originalUrl,
          body: req.method !== "GET" ? req.body : undefined,
          params: req.params,
        },
        userId: req.user?._id,
        ip: req.ip,
      });
    } catch {
      // Don't block the request if logging fails
    }
    next();
  };
};

export default adminLogger;
