import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import ErrorHandler from "../utils/ErrorHandler";
import User, { IUser } from "../models/User";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import { getCachedUser, cacheUser } from "../utils/userCache";

// Extend Express User to include IUser properties (Passport compatibility)
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}


// Verify JWT access token from Authorization header
export const isAuthenticated = catchAsyncErrors(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new ErrorHandler("Please login to access this resource", 401)
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyAccessToken(token);
      
      // Check cache first
      let cachedUserData = await getCachedUser(decoded.id);
      let user: any = null;

      if (cachedUserData) {
        // Hydrate plain JS object back to a Mongoose document
        user = User.hydrate(cachedUserData);
      } else {
        // Cache miss: query DB
        user = await User.findById(decoded.id).select("-password");
        if (user) {
          // Cache user details
          await cacheUser(decoded.id, user);
        }
      }

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      req.user = user;
      next();
    } catch {
      return next(
        new ErrorHandler("Invalid or expired token. Please login again.", 401)
      );
    }
  }
);


// Authorize by roles
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role '${req.user?.role}' is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
