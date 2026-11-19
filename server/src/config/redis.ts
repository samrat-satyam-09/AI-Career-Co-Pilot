import Redis from "ioredis";
import { logger } from "./logger";

let redis: Redis;

const connectRedis = (): Redis => {
  if (redis) return redis;

  redis = new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on("connect", () => {
    logger.info("Redis connected");
  });

  redis.on("error", (err) => {
    logger.error(`Redis error: ${err.message}`);
  });

  redis.on("close", () => {
    logger.warn("Redis connection closed");
  });

  redis.connect().catch((err) => {
    logger.error(`Redis connection failed: ${err.message}`);
  });

  return redis;
};

export { connectRedis };
export const getRedis = (): Redis => {
  if (!redis) {
    throw new Error("Redis not initialized. Call connectRedis() first.");
  }
  return redis;
};
