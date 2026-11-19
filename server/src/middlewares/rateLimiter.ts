import rateLimit from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import { getRedis } from "../config/redis";

// Auth routes — strict: 10 req/15min/IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // store: new RedisStore({ sendCommand: (...args: string[]) => getRedis().call(...args) }),
});

// OTP resend — very strict: 3 req/10min/email
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI routes — free tier: 20 req/day/user
export const aiFreeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: {
    success: false,
    message: "Daily AI usage limit reached. Upgrade to Pro for more.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload routes: 5 req/min/user
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many uploads. Please wait a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API: 100 req/min/user
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Coupon validation: 10 req/min (prevent brute-force code guessing)
export const couponLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many coupon attempts. Please wait a minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
