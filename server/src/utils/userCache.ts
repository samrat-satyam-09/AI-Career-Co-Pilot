import { getRedis } from "../config/redis";
import { logger } from "../config/logger";

const CACHE_TTL = 3600 * 24; // 24 hours

// Helper to generate cache key
export const getUserCacheKey = (userId: string) => `user:${userId}`;

// Cache user details in Redis
export const cacheUser = async (userId: string, user: any): Promise<void> => {
  try {
    const redis = getRedis();
    const key = getUserCacheKey(userId);
    
    // Ensure it's a plain JS object
    const userData = typeof user.toObject === "function" ? user.toObject() : user;
    
    // Remove sensitive or unnecessary fields
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;
    delete userData.refreshToken;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpiry;
    
    await redis.setex(key, CACHE_TTL, JSON.stringify(userData));
  } catch (err: any) {
    logger.error(`Error caching user ${userId} in Redis: ${err.message}`);
  }
};

// Retrieve user from Redis cache
export const getCachedUser = async (userId: string): Promise<any | null> => {
  try {
    const redis = getRedis();
    const key = getUserCacheKey(userId);
    const cachedData = await redis.get(key);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (err: any) {
    logger.error(`Error fetching cached user ${userId} from Redis: ${err.message}`);
  }
  return null;
};

// Invalidate user cache
export const invalidateUserCache = async (userId: string): Promise<void> => {
  try {
    const redis = getRedis();
    const key = getUserCacheKey(userId);
    await redis.del(key);
  } catch (err: any) {
    logger.error(`Error invalidating user ${userId} cache in Redis: ${err.message}`);
  }
};
