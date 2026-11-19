"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  useVerifyOTPMutation,
  useResendOTPMutation,
} from "@/redux/api/authApi";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [verifyOTP, { isLoading: isVerifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useResendOTPMutation();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    try {
      await verifyOTP({ email, otp: code }).unwrap();
      toast.success("Email verified! Welcome aboard 🎉");
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      toast.error(err?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await resendOTP({ email }).unwrap();
      toast.success("New OTP sent to your email");
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to resend OTP");
    }
  };

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-[var(--text-secondary)] mb-4">
          Invalid verification link.
        </p>
        <Link
          href={ROUTES.REGISTER}
          className="text-[#00be50] font-semibold hover:underline"
        >
          Go back to register
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[rgba(0,190,80,0.1)] border border-[rgba(0,190,80,0.2)] flex items-center justify-center mb-4 sm:mb-5 mx-auto sm:mx-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 sm:w-7 sm:h-7 text-[#00be50]"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mb-1.5">
          Check your email
        </h1>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[var(--text-primary)] break-all">
            {email}
          </span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex gap-1.5 sm:gap-2.5 mb-6 justify-between" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            aria-label={`OTP digit ${index + 1}`}
            className={`w-10 h-12 xs:w-11 xs:h-13 sm:w-12 sm:h-14 flex-1 text-center text-lg sm:text-xl font-bold rounded-[var(--radius-sm)] border bg-[var(--bg-card)] text-[var(--text-primary)] transition-all focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.15)] p-0 ${
              digit ? "border-[#00be50]" : "border-[var(--border)]"
            }`}
          />
        ))}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={isVerifying || otp.some((d) => !d)}
        className="w-full min-h-[44px] py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
      >
        {isVerifying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify email"
        )}
      </button>

      {/* Resend */}
      <p className="text-center text-xs sm:text-sm text-[var(--text-secondary)] mt-4">
        Didn&apos;t receive the code?{" "}
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[#00be50] font-semibold hover:underline disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        ) : (
          <span className="text-[var(--text-muted)]">
            Resend in {countdown}s
          </span>
        )}
      </p>

      {/* Back link */}
      <p className="text-center text-xs sm:text-sm text-[var(--text-secondary)] mt-3">
        <Link
          href={ROUTES.LOGIN}
          className="text-[#00be50] font-semibold hover:underline inline-flex items-center gap-1"
        >
          ← Back to login
        </Link>
      </p>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin text-[#00be50]" />
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
