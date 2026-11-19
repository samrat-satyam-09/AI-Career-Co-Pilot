"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { useForgotPasswordMutation } from "@/redux/api/authApi";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Auto-redirect to login after submitting forgot-password
  useEffect(() => {
    if (!submitted) return;
    if (redirectCountdown <= 0) {
      router.push(ROUTES.LOGIN);
      return;
    }
    const timer = setTimeout(() => setRedirectCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, redirectCountdown, router]);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (!val) {
      setError("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError("Invalid email address");
    } else {
      setError("");
    }
  };

  const validate = () => {
    if (!email) { setError("Email is required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email address"); return false; }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await forgotPassword({ email }).unwrap();
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[rgba(0,190,80,0.1)] border border-[rgba(0,190,80,0.2)] flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-[#00be50]" />
        </div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Check your inbox</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-semibold text-[var(--text-primary)]">{email}</span>.
          The link is valid for 1 hour.
        </p>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Redirecting to login in {redirectCountdown}s...
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={() => { setSubmitted(false); setRedirectCountdown(5); }}
            className="text-[#00be50] font-semibold hover:underline"
          >
            Try again
          </button>
        </p>
        <Link
          href={ROUTES.LOGIN}
          className="block mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-1.5">
          Forgot password?
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Enter your email and we&apos;ll send you a secure reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-[var(--radius-sm)] border text-sm bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.15)] ${
              error ? "border-[var(--error)]" : "border-[var(--border)]"
            }`}
          />
          {error && <p className="mt-1 text-xs text-[var(--error)]">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Sending link...</>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
        <Link href={ROUTES.LOGIN} className="text-[#00be50] font-semibold hover:underline">
          ← Back to login
        </Link>
      </p>
    </div>
  );
}
