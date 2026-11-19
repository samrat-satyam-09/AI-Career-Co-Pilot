import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import { connectCloudinary } from "./config/cloudinary";
import { connectRazorpay } from "./config/razorpay";
import { logger } from "./config/logger";

const PORT = process.env.PORT || 8000;

// Graceful startup
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    connectRedis();

    // Configure Cloudinary
    connectCloudinary();

    // Initialize Razorpay
    connectRazorpay();

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(
        `⚡ Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
      logger.info(`📡 Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : "Unknown reason";
  logger.error(`Unhandled Rejection: ${message}`);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

startServer();
