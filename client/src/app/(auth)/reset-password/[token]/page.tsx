"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check, X, AlertTriangle } from "lucide-react";
import { useResetPasswordMutation, useVerifyResetTokenQuery } from "@/redux/api/authApi";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function ResetPasswordContent() {
  const router = useRouter();
  const params = useParams();
  const token = (params?.token as string) || "";

  const { data: tokenData, isLoading: isVerifyingToken, isError: isTokenError } = useVerifyResetTokenQuery(token, {
    skip: !token,
  });

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: "password" | "confirmPassword", value: string) => {
    setForm((prev) => {
      const nextForm = { ...prev, [field]: value };
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        if (field === "password") {
          if (!value) nextErrors.password = "Password is required";
          else if (!PASSWORD_RULES.every((r) => r.test(value))) nextErrors.password = "Password doesn't meet all requirements";
          else delete nextErrors.password;

          // Re-evaluate confirmPassword match if confirmPassword has value
          if (nextForm.confirmPassword) {
            if (value !== nextForm.confirmPassword) nextErrors.confirmPassword = "Passwords don't match";
            else delete nextErrors.confirmPassword;
          }
        }
        if (field === "confirmPassword") {
          if (!value) nextErrors.confirmPassword = "Please confirm your password";
          else if (nextForm.password !== value) nextErrors.confirmPassword = "Passwords don't match";
          else delete nextErrors.confirmPassword;
        }
        return nextErrors;
      });
      return nextForm;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.password) newErrors.password = "Password is required";
    else if (!PASSWORD_RULES.every((r) => r.test(form.password)))
      newErrors.password = "Password doesn't meet all requirements";
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await resetPassword({ token, password: form.password, confirmPassword: form.confirmPassword }).unwrap();
      setSuccess(true);
      setTimeout(() => router.push(ROUTES.LOGIN), 2500);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reset password. The link may have expired.");
    }
  };

  if (isVerifyingToken) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#00be50] mb-3" />
        <p className="text-sm text-[var(--text-secondary)]">Verifying reset link...</p>
      </div>
    );
  }

  if (isTokenError || !tokenData?.data?.valid) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mb-2">
          Link Already Used or Expired
        </h1>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          This password reset link is invalid, expired, or has already been used. For security reasons, reset links can only be used once.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white font-semibold text-sm transition-colors flex items-center justify-center shadow-sm"
          >
            Request new reset link
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mt-1"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(0,190,80,0.1)] border-2 border-[#00be50] flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-[#00be50]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Password reset!</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Your password has been changed successfully. Redirecting to login...
        </p>
        <Link href={ROUTES.LOGIN} className="text-[#00be50] font-semibold text-sm hover:underline">
          Go to login →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-1.5">
          Reset your password
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Create a new strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New Password */}
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Create a strong password"
              className={`w-full px-4 py-2.5 pr-11 rounded-[var(--radius-sm)] border text-sm bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.15)] ${
                errors.password ? "border-[var(--error)]" : "border-[var(--border)]"
              }`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Toggle">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2.5 grid grid-cols-2 gap-1">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(form.password);
                return (
                  <div key={rule.label} className="flex items-center gap-1.5">
                    {passed ? <Check size={11} className="text-[#00be50]" /> : <X size={11} className="text-[var(--text-muted)]" />}
                    <span className={`text-[11px] ${passed ? "text-[#00be50]" : "text-[var(--text-muted)]"}`}>{rule.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-[var(--error)]">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full px-4 py-2.5 pr-11 rounded-[var(--radius-sm)] border text-sm bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.15)] ${
                errors.confirmPassword ? "border-[var(--error)]" : form.confirmPassword && form.password === form.confirmPassword ? "border-[#00be50]" : "border-[var(--border)]"
              }`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Toggle">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-[var(--error)]">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="animate-spin text-[#00be50]" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
