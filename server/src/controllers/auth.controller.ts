import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import { ApiResponse } from "../utils/ApiResponse";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/jwt";
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from "../services/emailService";

// ── Helper: generate 6-digit OTP ──────────────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: send tokens + cookie ──────────────────────────────────────────────
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  setRefreshTokenCookie(res, refreshToken);

  // Store refresh token hash in DB
  user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  user.save({ validateBeforeSave: false });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.otp;
  delete userObj.otpExpiry;
  delete userObj.refreshToken;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpiry;

  res.status(statusCode).json(
    new ApiResponse(statusCode, { user: userObj, accessToken }, "Success")
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────────
export const register = catchAsyncErrors(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorHandler("An account with this email already exists", 409);
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const verifyExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes — auto-delete if not verified

  await User.create({ name, email, password, otp, otpExpiry, verifyExpiry });

  await sendOTPEmail(email, name, otp);

  res.status(201).json(
    new ApiResponse(201, { email }, "Account created. Please verify your email with the OTP sent.")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/verify-otp
// ─────────────────────────────────────────────────────────────────────────────
export const verifyOTP = catchAsyncErrors(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email }).select("+otp +otpExpiry");
  if (!user) throw new ErrorHandler("No account found with this email", 404);
  if (user.isVerified) throw new ErrorHandler("Email is already verified", 400);
  if (!user.otp || !user.otpExpiry) throw new ErrorHandler("OTP not generated. Please resend OTP", 400);
  if (user.otp !== otp) throw new ErrorHandler("Invalid OTP", 400);
  if (user.otpExpiry < new Date()) throw new ErrorHandler("OTP has expired. Please resend OTP", 400);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.verifyExpiry = undefined; // Clear TTL — user is now permanent
  await user.save({ validateBeforeSave: false });

  await sendWelcomeEmail(email, user.name);

  sendTokenResponse(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/resend-otp
// ─────────────────────────────────────────────────────────────────────────────
export const resendOTP = catchAsyncErrors(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ErrorHandler("No account found with this email", 404);
  if (user.isVerified) throw new ErrorHandler("Email is already verified", 400);

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.verifyExpiry = new Date(Date.now() + 5 * 60 * 1000); // Reset 5-min auto-delete window
  await user.save({ validateBeforeSave: false });

  await sendOTPEmail(email, user.name, otp);

  res.status(200).json(new ApiResponse(200, {}, "OTP resent successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────
export const login = catchAsyncErrors(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ErrorHandler("Invalid email or password", 401);
  if (!user.isVerified) throw new ErrorHandler("Please verify your email before logging in", 403);
  if (user.authProvider !== "local") {
    throw new ErrorHandler(`This account uses ${user.authProvider} login. Please use that instead.`, 400);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ErrorHandler("Invalid email or password", 401);

  sendTokenResponse(user, 200, res);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
export const logout = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user?.id);
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }

  clearRefreshTokenCookie(res);

  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh-token
// ─────────────────────────────────────────────────────────────────────────────
export const refreshToken = catchAsyncErrors(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ErrorHandler("Refresh token not found. Please login again", 401);

  let decoded: any;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ErrorHandler("Invalid or expired refresh token. Please login again", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ErrorHandler("User not found", 404);

  // Verify stored hash matches
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (user.refreshToken !== tokenHash) {
    throw new ErrorHandler("Invalid refresh token. Please login again", 401);
  }

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });

  res.status(200).json(new ApiResponse(200, { accessToken }, "Token refreshed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
export const forgotPassword = catchAsyncErrors(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Security: Don't reveal if email exists
    res.status(200).json(
      new ApiResponse(200, {}, "If this email is registered, you will receive a reset link.")
    );
    return;
  }

  if (user.authProvider !== "local") {
    throw new ErrorHandler(`This account uses ${user.authProvider} login. Password reset is not applicable.`, 400);
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetEmail(email, user.name, resetToken);

  res.status(200).json(
    new ApiResponse(200, {}, "Password reset link sent to your email")
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/verify-reset-token/:token
// ─────────────────────────────────────────────────────────────────────────────
export const verifyResetToken = catchAsyncErrors(async (req: Request, res: Response) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token as string).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  });

  if (!user) {
    throw new ErrorHandler("Password reset link is invalid or has already been used", 400);
  }

  res.status(200).json(new ApiResponse(200, { valid: true }, "Reset token is valid"));
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────────────────────
export const resetPassword = catchAsyncErrors(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token as string).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: new Date() },
  });

  if (!user) throw new ErrorHandler("Password reset link is invalid or has expired", 400);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  // Invalidate all sessions
  user.refreshToken = undefined;
  await user.save();

  clearRefreshTokenCookie(res);

  res.status(200).json(new ApiResponse(200, {}, "Password reset successful. Please login with your new password."));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMe = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id).populate("subscription.plan", "name slug type limits features");
  if (!user) throw new ErrorHandler("User not found", 404);

  res.status(200).json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/google/callback
// ─────────────────────────────────────────────────────────────────────────────
export const googleAuthCallback = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=auth_failed`);
  }

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  setRefreshTokenCookie(res, refreshToken);

  // Store refresh token hash in DB
  user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await user.save({ validateBeforeSave: false });

  // Redirect to frontend callback route with token
  res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/oauth/callback?token=${accessToken}&provider=google`);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/github/callback
// ─────────────────────────────────────────────────────────────────────────────
export const githubAuthCallback = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=auth_failed`);
  }

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

  setRefreshTokenCookie(res, refreshToken);

  // Store refresh token hash in DB
  user.refreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await user.save({ validateBeforeSave: false });

  // Redirect to frontend callback route with token
  res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/oauth/callback?token=${accessToken}&provider=github`);
});



