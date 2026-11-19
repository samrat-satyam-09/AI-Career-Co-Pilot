import { Request, Response } from "express";
import User from "../models/User";
import { ApiResponse } from "../utils/ApiResponse";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import { cloudinary } from "../config/cloudinary";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/users/profile
// ─────────────────────────────────────────────────────────────────────────────
export const getProfile = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id)
    .populate("subscription.plan", "name slug type limits features featureList displayPrice isPopular");
  if (!user) throw new ErrorHandler("User not found", 404);

  res.status(200).json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/users/profile
// ─────────────────────────────────────────────────────────────────────────────
export const updateProfile = catchAsyncErrors(async (req: Request, res: Response) => {
  const { name } = req.body;

  const user = await User.findByIdAndUpdate(
    (req as any).user.id,
    { name },
    { new: true, runValidators: true }
  );

  res.status(200).json(new ApiResponse(200, { user }, "Profile updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/users/avatar
// ─────────────────────────────────────────────────────────────────────────────
export const uploadAvatar = catchAsyncErrors(async (req: Request, res: Response) => {
  const { avatar } = req.body; // base64 image string

  if (!avatar) throw new ErrorHandler("Please provide an image", 400);

  const user = await User.findById((req as any).user.id);
  if (!user) throw new ErrorHandler("User not found", 404);

  // Delete old avatar if exists
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  const result = await cloudinary.uploader.upload(avatar, {
    folder: "ai-career-copilot/avatars",
    width: 200,
    crop: "scale",
  });

  user.avatar = { public_id: result.public_id, url: result.secure_url };
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/users/change-password
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = catchAsyncErrors(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById((req as any).user.id).select("+password");
  if (!user) throw new ErrorHandler("User not found", 404);

  if (user.authProvider !== "local") {
    throw new ErrorHandler("Password change is not available for social login accounts", 400);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ErrorHandler("Current password is incorrect", 400);

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/users/account
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAccount = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id);
  if (!user) throw new ErrorHandler("User not found", 404);

  // Delete avatar from cloudinary
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  await User.findByIdAndDelete((req as any).user.id);

  res.clearCookie("refreshToken");
  res.status(200).json(new ApiResponse(200, {}, "Account deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/users/usage
// ─────────────────────────────────────────────────────────────────────────────
export const getUsage = catchAsyncErrors(async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id)
    .populate("subscription.plan", "limits features");
  if (!user) throw new ErrorHandler("User not found", 404);

  res.status(200).json(new ApiResponse(200, { usage: user.usage, plan: user.subscription?.plan }, "Usage fetched successfully"));
});
