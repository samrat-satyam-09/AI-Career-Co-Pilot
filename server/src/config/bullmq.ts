import { Queue, Worker, Processor } from "bullmq";
import { logger } from "./logger";

// Redis connection options for BullMQ
const getRedisConnection = () => ({
  host: new URL(process.env.REDIS_URL!).hostname,
  port: parseInt(new URL(process.env.REDIS_URL!).port || "6379"),
  password: new URL(process.env.REDIS_URL!).password || undefined,
});

// Queue names
export const QUEUE_NAMES = {
  EMAIL: "email-queue",
  RESUME_PARSE: "resume-parse-queue",
  AI_USAGE_CLEANUP: "ai-usage-cleanup",
  ANALYTICS_SNAPSHOT: "analytics-snapshot",
  NOTIFICATION: "notification-queue",
  COUPON_EXPIRY: "coupon-expiry-check",
} as const;

// Queue factory
export const createQueue = (name: string): Queue => {
  const queue = new Queue(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  });

  queue.on("error", (err) => {
    logger.error(`Queue ${name} error: ${err.message}`);
  });

  logger.info(`Queue ${name} initialized`);
  return queue;
};

// Worker factory
export const createWorker = (
  name: string,
  processor: Processor
): Worker => {
  const worker = new Worker(name, processor, {
    connection: getRedisConnection(),
    concurrency: 5,
  });

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} in ${name} completed`);
  });

  worker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} in ${name} failed: ${err.message}`);
  });

  return worker;
};
