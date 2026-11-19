import nodemailer from "nodemailer";
import { logger } from "../config/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.FROM_NAME || "AI Career Co-Pilot"}" <${process.env.SMTP_USER}>`;

// ─── Send OTP Verification Email ──────────────────────────────────────────────
export const sendOTPEmail = async (email: string, name: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Verify your AI Career Co-Pilot account",
      html: `
        <div style="font-family:'Inter',Arial,sans-serif;background:#0f1112;color:#f3f4f6;padding:40px;border-radius:12px;max-width:480px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:28px;font-weight:800;color:#f3f4f6;">AI Career</span>
            <span style="font-size:28px;font-weight:800;color:#00be50;"> Co-Pilot</span>
          </div>
          <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Verify Your Email</h2>
          <p style="color:#9ca3af;margin:0 0 24px;">Hi ${name}, enter this code to verify your account:</p>
          <div style="background:#1e2123;border:1px solid #2d3134;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#00be50;font-family:monospace;">${otp}</span>
          </div>
          <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">This code expires in <strong style="color:#f3f4f6;">10 minutes</strong>.</p>
          <p style="color:#6b7280;font-size:14px;margin:0;">If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #2d3134;margin:32px 0 16px;"/>
          <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">© 2025 AI Career Co-Pilot. All rights reserved.</p>
        </div>
      `,
    });
    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send OTP email to ${email}: ${error}`);
    throw new Error("Failed to send verification email");
  }
};

// ─── Send Welcome Email ────────────────────────────────────────────────────────
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Welcome to AI Career Co-Pilot 🚀",
      html: `
        <div style="font-family:'Inter',Arial,sans-serif;background:#0f1112;color:#f3f4f6;padding:40px;border-radius:12px;max-width:480px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:28px;font-weight:800;color:#f3f4f6;">AI Career</span>
            <span style="font-size:28px;font-weight:800;color:#00be50;"> Co-Pilot</span>
          </div>
          <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Welcome aboard, ${name}! 🎉</h2>
          <p style="color:#9ca3af;margin:0 0 24px;">Your account is verified and ready to go. Start by uploading your resume or tailoring it to your dream job.</p>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#00be50,#00a545);color:#fff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">Go to Dashboard →</a>
          <hr style="border:none;border-top:1px solid #2d3134;margin:32px 0 16px;"/>
          <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">© 2025 AI Career Co-Pilot. All rights reserved.</p>
        </div>
      `,
    });
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email to ${email}: ${error}`);
  }
};

// ─── Send Password Reset Email ─────────────────────────────────────────────────
export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "Reset your AI Career Co-Pilot password",
      html: `
        <div style="font-family:'Inter',Arial,sans-serif;background:#0f1112;color:#f3f4f6;padding:40px;border-radius:12px;max-width:480px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:32px;">
            <span style="font-size:28px;font-weight:800;color:#f3f4f6;">AI Career</span>
            <span style="font-size:28px;font-weight:800;color:#00be50;"> Co-Pilot</span>
          </div>
          <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Reset Your Password</h2>
          <p style="color:#9ca3af;margin:0 0 24px;">Hi ${name}, click the button below to reset your password. This link is valid for <strong style="color:#f3f4f6;">1 hour</strong>.</p>
          <a href="${resetURL}" style="display:inline-block;background:linear-gradient(135deg,#00be50,#00a545);color:#fff;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;">Reset Password →</a>
          <p style="color:#6b7280;font-size:13px;margin:24px 0 0;">Or copy this link:<br/><span style="color:#9ca3af;word-break:break-all;">${resetURL}</span></p>
          <p style="color:#6b7280;font-size:14px;margin:16px 0 0;">If you didn't request this, please ignore this email.</p>
          <hr style="border:none;border-top:1px solid #2d3134;margin:32px 0 16px;"/>
          <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">© 2025 AI Career Co-Pilot. All rights reserved.</p>
        </div>
      `,
    });
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}: ${error}`);
    throw new Error("Failed to send password reset email");
  }
};
