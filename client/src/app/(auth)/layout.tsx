"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAppSelector } from "@/redux/store";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

const AUTH_CONTENT: Record<
  string,
  { heading: string; subtext: string; highlight: string }
> = {
  "/login": {
    heading: "Resume tailored,",
    highlight: "interview aced.",
    subtext:
      "10,000+ professionals use AI Career Co-Pilot to land their dream jobs faster.",
  },
  "/register": {
    heading: "Your career,",
    highlight: "AI-powered.",
    subtext:
      "Join thousands of job seekers using AI to write better resumes and crush interviews.",
  },
  "/verify-otp": {
    heading: "One step",
    highlight: "closer.",
    subtext:
      "Verify your email to unlock AI-powered resume tailoring and interview coaching.",
  },
  "/forgot-password": {
    heading: "We've got",
    highlight: "you covered.",
    subtext:
      "Enter your email and we'll send you a secure link to reset your password.",
  },
};

const STATS = [
  { value: "10K+", label: "Resumes Tailored" },
  { value: "95%", label: "ATS Pass Rate" },
  { value: "5K+", label: "Users" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Check if token exists in sessionStorage, cookie, or Redux state
  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
    const cookieLoggedIn = typeof document !== "undefined" && document.cookie.split(";").some((item) => item.trim().startsWith("isLoggedIn=true"));
    if (!isLoading && (isAuthenticated || token || cookieLoggedIn)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle browser back-button navigation (bfcache / pageshow)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      const token = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
      const cookieLoggedIn = typeof document !== "undefined" && document.cookie.split(";").some((item) => item.trim().startsWith("isLoggedIn=true"));
      if (token || isAuthenticated || cookieLoggedIn) {
        router.replace(ROUTES.DASHBOARD);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [isAuthenticated, router]);

  const hasToken = typeof window !== "undefined" ? !!sessionStorage.getItem("accessToken") : false;
  const hasCookie = typeof document !== "undefined" ? document.cookie.split(";").some((item) => item.trim().startsWith("isLoggedIn=true")) : false;

  if (isLoading || isAuthenticated || hasToken || hasCookie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-10 h-10 animate-spin text-[#00be50]" />
      </div>
    );
  }

  const isReset = pathname?.startsWith("/reset-password");
  const content =
    AUTH_CONTENT[pathname || ""] ||
    AUTH_CONTENT["/login"];

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* ── Left Panel: Brand Visual ────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] bg-[#111314] p-12 relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Green radial glow */}
        <div className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,190,80,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-10">
          <div className="w-9 h-9 rounded-[8px] bg-[#00be50] flex items-center justify-center shadow-[0_0_20px_rgba(0,190,80,0.4)]">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl text-white">
            AI Career <span className="text-[#00be50]">Co-Pilot</span>
          </span>
        </Link>

        {/* Main Copy */}
        <div className="z-10">
          {!isReset && (
            <>
              <h1 className="text-[clamp(2rem,3vw,3rem)] font-extrabold leading-tight text-white mb-4">
                {content.heading}
                <br />
                <span className="text-[#00be50]">{content.highlight}</span>
              </h1>
              <p className="text-[#9ca3af] text-lg leading-relaxed max-w-sm mb-10">
                {content.subtext}
              </p>
            </>
          )}

          {/* Stats */}
          <div className="flex gap-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm text-[#6b7280] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial card */}
        <div className="z-10 rounded-xl border border-[#2d3134] bg-[#1e2123] p-5">
          <p className="text-[#d1d5db] text-sm leading-relaxed mb-4">
            &ldquo;AI Career Co-Pilot tailored my resume for every job I applied
            to. Got 3x more callbacks and landed my dream role at a top startup!&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00be50] to-[#00a545] flex items-center justify-center text-white font-bold text-sm">
              RS
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Rahul Sharma</div>
              <div className="text-xs text-[#6b7280]">SDE-2 at Zepto</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form Area ───────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar — only on mobile */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[6px] bg-[#00be50] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-extrabold text-sm text-[var(--text-primary)]">
              AI Career <span className="text-[#00be50]">Co-Pilot</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Theme toggle on desktop */}
        <div className="hidden lg:flex justify-end px-8 pt-6">
          <ThemeToggle />
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
