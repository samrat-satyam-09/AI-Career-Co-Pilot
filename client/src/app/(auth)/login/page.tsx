"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/redux/api/authApi";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/store";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [redirectingProvider, setRedirectingProvider] = useState<
    "google" | "github" | null
  >(null);

  // Redirection guard on page load
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("accessToken")
        : null;
    const cookieLoggedIn =
      typeof document !== "undefined" &&
      document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("isLoggedIn=true"));
    if (token || isAuthenticated || cookieLoggedIn) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handlePageShow = () => {
      setRedirectingProvider(null);
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("accessToken")
          : null;
      const cookieLoggedIn =
        typeof document !== "undefined" &&
        document.cookie
          .split(";")
          .some((item) => item.trim().startsWith("isLoggedIn=true"));
      if (token || isAuthenticated || cookieLoggedIn) {
        router.replace(ROUTES.DASHBOARD);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isAuthenticated, router]);

  const hasToken =
    typeof window !== "undefined"
      ? !!sessionStorage.getItem("accessToken")
      : false;
  const hasCookie =
    typeof document !== "undefined"
      ? document.cookie
          .split(";")
          .some((item) => item.trim().startsWith("isLoggedIn=true"))
      : false;

  if (hasToken || isAuthenticated || hasCookie) {
    return null;
  }

  const handleInputChange = (field: "email" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (field === "email") {
        if (!value) next.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          next.email = "Invalid email address";
        else delete next.email;
      }
      if (field === "password") {
        if (!value) next.password = "Password is required";
        else delete next.password;
      }
      return next;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(form).unwrap();
      toast.success("Welcome back!");
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      const rawMsg = err?.data?.message;
      const msg = typeof rawMsg === "string" ? rawMsg : "Login failed. Please try again.";
      toast.error(msg);
      if (typeof rawMsg === "string" && rawMsg.toLowerCase().includes("verify")) {
        router.push(
          `${ROUTES.VERIFY_OTP}?email=${encodeURIComponent(form.email)}`,
        );
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)] mb-1.5">
          Welcome back
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="text-[#00be50] font-semibold hover:underline"
          >
            Sign up free
          </Link>
        </p>
      </div>

      {/* Social OAuth Buttons */}
      <div className="flex gap-3 mb-6">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}/api/v1/auth/google`}
          onClick={(e) => {
            if (redirectingProvider) {
              e.preventDefault();
              return;
            }
            setRedirectingProvider("google");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors ${
            redirectingProvider ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {redirectingProvider === "google" ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#00be50]" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </>
          )}
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}/api/v1/auth/github`}
          onClick={(e) => {
            if (redirectingProvider) {
              e.preventDefault();
              return;
            }
            setRedirectingProvider("github");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors ${
            redirectingProvider ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {redirectingProvider === "github" ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#00be50]" />
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </>
          )}
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)]">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="you@example.com"
            className={`w-full px-4 py-2.5 rounded-[var(--radius-sm)] border text-sm bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.15)] ${
              errors.email ? "border-[var(--error)]" : "border-[var(--border)]"
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[var(--error)]">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              Password
            </label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-[#00be50] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              className={`w-full px-4 py-2.5 pr-11 rounded-[var(--radius-sm)] border text-sm bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.15)] ${
                errors.password
                  ? "border-[var(--error)]"
                  : "border-[var(--border)]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-[var(--error)]">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
}
