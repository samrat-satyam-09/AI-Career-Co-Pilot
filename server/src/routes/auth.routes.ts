import { Router } from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  refreshToken,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getMe,
  googleAuthCallback,
  githubAuthCallback,
} from "../controllers/auth.controller";
import passport from "passport";
import { isAuthenticated } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";
import { authLimiter } from "../middlewares/rateLimiter";

const router = Router();

// ── Public Auth Routes ─────────────────────────────────────────────────────────
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/verify-otp", authLimiter, validate(verifyOTPSchema), verifyOTP);
router.post("/resend-otp", authLimiter, validate(resendOTPSchema), resendOTP);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password/:token", authLimiter, validate(resetPasswordSchema), resetPassword);

// ── Token Management ───────────────────────────────────────────────────────────
router.post("/refresh-token", refreshToken);

// ── Social Auth Routes ─────────────────────────────────────────────────────────
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/oauth/callback?error=oauth_failed&provider=google`,
    session: false,
  }),
  googleAuthCallback
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/oauth/callback?error=oauth_failed&provider=github`,
    session: false,
  }),
  githubAuthCallback
);




// ── Protected Routes ───────────────────────────────────────────────────────────
router.get("/me", isAuthenticated, getMe);
router.post("/logout", isAuthenticated, logout);

export default router;
