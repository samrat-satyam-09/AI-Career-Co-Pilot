"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col lg:flex-row">
      {/* Left Column: Split Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        {/* Radial green glow */}
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px]" />

        <div className="relative z-10">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
            <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white shadow-[var(--shadow-glow)]">
              <Sparkles size={16} />
            </div>
            <span>AI Career Co-Pilot</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md my-auto space-y-6">
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Land your next role, <span className="text-[var(--accent)]">twice as fast.</span>
          </h1>
          <p className="text-sm text-[var(--sidebar-text-muted)]">
            Join thousands of job seekers using AI Career Co-Pilot to match JDs, optimize resumes, score ATS-friendliness, and practice custom mock interviews.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-[var(--sidebar-text-muted)] border-t border-[var(--sidebar-border)] pt-6">
          <span>&copy; {new Date().getFullYear()} AI Career Co-Pilot</span>
          <div className="flex gap-4">
            <Link href={ROUTES.PRIVACY} className="hover:text-white transition-colors">Privacy</Link>
            <Link href={ROUTES.TERMS} className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-[var(--bg-primary)] relative">
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
