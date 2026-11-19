import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { logger } from "../config/logger";

interface MongooseError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: string;
}

// Central error handling middleware — ALL errors pass through here
const errorMiddleware = (
  err: MongooseError | ErrorHandler,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err } as ErrorHandler & MongooseError;
  error.message = err.message || "Internal Server Error";
  error.statusCode = (err as ErrorHandler).statusCode || 500;

  // Mongoose duplicate key error (E11000)
  if ((err as MongooseError).code === 11000) {
    const field = Object.keys((err as MongooseError).keyValue || {})[0];
    error = new ErrorHandler(
      `Duplicate value for '${field}'. Please use a different value.`,
      400
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values((err as MongooseError).errors || {}).map(
      (val) => val.message
    );
    error = new ErrorHandler(messages.join(". "), 400);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    const mongoErr = err as MongooseError;
    error = new ErrorHandler(
      `Invalid ${mongoErr.path}: ${mongoErr.value}`,
      400
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ErrorHandler("Invalid token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    error = new ErrorHandler("Token expired. Please log in again.", 401);
  }

  // Log error in development
  if (process.env.NODE_ENV !== "production") {
    logger.error(`${error.statusCode} - ${error.message}`, {
      stack: err.stack,
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorMiddleware;
