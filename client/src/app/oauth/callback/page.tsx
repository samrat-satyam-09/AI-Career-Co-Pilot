"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, UserCheck, RefreshCw, Compass, X, XCircle, ArrowLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setCredentials } from "@/redux/slices/authSlice";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

const STEPS = [
  { id: "handshake", text: "Establishing secure handshake...", icon: RefreshCw },
  { id: "token", text: "Verifying credentials & token...", icon: ShieldCheck },
  { id: "profile", text: "Syncing workspace profile...", icon: UserCheck },
  { id: "dashboard", text: "Initializing dashboard...", icon: Compass },
];

// Canvas particle system for rendering small, multi-directional colored bubbles
function BubbleCanvas({ provider, error }: { provider: string | null; error: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }

    const particles: Particle[] = [];
    const count = 12; // Minimal, subtle particle density

    // Initialize particles with pure brand green (0, 190, 80) and varying individual opacities
    for (let i = 0; i < count; i++) {
      const opacity = (Math.random() * 0.32 + 0.06).toFixed(2); // Random opacity from 0.06 to 0.38
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 5 + 2, // Small bubbles: 2px to 7px
        color: `rgba(0, 190, 80, ${opacity})`,
        vx: (Math.random() - 0.5) * 1.6, // Move horizontally (left or right)
        vy: (Math.random() - 0.5) * 1.6, // Move vertically (up or down)
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Apply velocity vectors
        p.x += p.vx;
        p.y += p.vy;

        // Wrap particles back onto screen boundaries
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        // Render bubble path
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [provider, error]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading: isAuthLoading } = useAppSelector((state) => state.auth);
  const calledRef = useRef(false);

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Redirect away ONLY if authenticated and NOT currently processing an OAuth callback token
  useEffect(() => {
    const errParam = searchParams.get("error");
    const tokenParam = searchParams.get("token");
    if (!isAuthLoading && isAuthenticated && !errParam && !tokenParam) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isAuthLoading, searchParams, router]);

  // Handle browser back button (pageshow / bfcache)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        const storedToken = typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
        if (storedToken) {
          router.replace(ROUTES.DASHBOARD);
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [router]);

  useEffect(() => {
    const prov = searchParams.get("provider");
    setProvider(prov || "google");
    
    const err = searchParams.get("error");
    if (err) {
      setError("Authentication failed. The login handshake was declined or timed out.");
    }
  }, [searchParams]);

  useEffect(() => {
    // If error is already present in search parameters, don't initiate fetch
    if (searchParams.get("error")) return;
    
    if (calledRef.current) return;
    calledRef.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setError("Authentication failed: No token received from provider.");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Step 0: Handshake
        setCurrentStepIdx(0);
        await new Promise((resolve) => setTimeout(resolve, 750));

        // Step 1: Token verification & profile fetch
        setCurrentStepIdx(1);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await res.json();
        const user = data.data.user;
        setEmail(user.email);
        await new Promise((resolve) => setTimeout(resolve, 850));

        // Step 2: Syncing workspace profile
        setCurrentStepIdx(2);
        await new Promise((resolve) => setTimeout(resolve, 850));

        // Step 3: Initializing dashboard
        setCurrentStepIdx(3);
        await new Promise((resolve) => setTimeout(resolve, 850));
        
        // NOW all 4 steps have finished on screen! Store credentials & navigate
        dispatch(setCredentials({ user, accessToken: token }));
        
        const currentProvider = searchParams.get("provider") || "google";
        toast.success(`Successfully logged in with ${currentProvider === "github" ? "GitHub" : "Google"}!`);
        router.replace(ROUTES.DASHBOARD);
      } catch (err: any) {
        console.error("OAuth callback error:", err);
        setError("Failed to sync your workspace profile. Please try signing in again.");
      }
    };

    // Start profile fetch sequence
    fetchUserProfile();
  }, [searchParams, router, dispatch, provider]);

  // Render loading screen if already authenticated (e.g. direct access/refresh)
  // and we are NOT actively processing a new token exchange in this component instance.
  if (!isAuthLoading && isAuthenticated && !error && !calledRef.current) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[#00be50]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  const isGithub = provider === "github";
  const hasError = !!error;

  const glow1Color = error
    ? "bg-red-500/8"
    : isGithub
    ? "bg-indigo-500/6"
    : "bg-emerald-500/5";
  const glow2Color = error
    ? "bg-rose-500/8"
    : isGithub
    ? "bg-slate-500/6"
    : "bg-blue-500/4";
  
  const iconBorderGlow = isGithub
    ? "border-[#333] shadow-[0_0_20px_rgba(255,255,255,0.05)] text-[var(--text-primary)]"
    : "border-[#4285F4] shadow-[0_0_20px_rgba(66,133,244,0.2)] text-[#4285F4]";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] overflow-hidden text-[var(--text-primary)] px-4">
      {/* Background Image with Gentle/Halka Side Opacity Fade Mask */}
      <img
        src="/whiteGreen-background.jpg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none"
        style={{
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
          maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Gentle Side Opacity Gradient Overlays */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--bg-primary)]/30 to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--bg-primary)]/30 to-transparent z-0 pointer-events-none" />

      {/* Small multi-directional bubbles particle background */}
      <BubbleCanvas provider={provider} error={hasError} />

      {/* Background Animated Glows - Double Misty Glows */}
      <div className={`absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${glow1Color} rounded-full blur-[140px] pointer-events-none opacity-90 animate-pulse z-0`} style={{ animationDuration: '4s' }} />
      <div className={`absolute top-[60%] left-[55%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] ${glow2Color} rounded-full blur-[140px] pointer-events-none opacity-90 animate-pulse z-0`} style={{ animationDuration: '6s' }} />
      
      {/* Direct Content Layout (No card container background/box) */}
      <div className="relative w-full max-w-[420px] text-center flex flex-col items-center transition-all duration-300 z-10 text-[var(--text-primary)] px-4">
        
        {/* Render Error Screen if authentication failed */}
        {error ? (
          <>
            {/* Top right close icon */}
            <button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-full hover:bg-[var(--bg-secondary)]"
              aria-label="Close error screen"
            >
              <X size={18} />
            </button>

            {/* Error Badge with Provider Logo overlay */}
            <div className="w-16 h-16 rounded-full border border-[rgba(239,68,68,0.35)] shadow-[0_0_20px_rgba(239,68,68,0.22)] text-[#ef4444] bg-[var(--bg-card)] flex items-center justify-center mb-6 relative">
              <XCircle size={32} />
              
              {/* Floating provider badge */}
              <div className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center p-1 text-[var(--text-primary)] shadow-sm">
                {isGithub ? (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
              </div>
            </div>

            {/* Error Message Details */}
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-2 tracking-tight">
              Sign In Failed
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-[290px] leading-relaxed">
              {error}
            </p>

            {/* Action Return Button */}
            <button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2 shadow-[0_4px_12px_rgba(0,190,80,0.15)]"
            >
              <ArrowLeft size={16} />
              Return to Login
            </button>
          </>
        ) : (
          <>
            {/* Dynamic Provider Icon with Glow */}
            <div className={`w-16 h-16 rounded-full border bg-[var(--bg-card)] flex items-center justify-center mb-6 transition-all duration-500 transform scale-110 ${iconBorderGlow}`}>
              {isGithub ? (
                <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-8 h-8">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-extrabold text-gray-600 mb-1 tracking-tight">
              Secure Authorization
            </h2>

            {/* Dynamically display user's email if available (with pulsing green dot) */}
            {email ? (
              <div className="mb-6 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-medium inline-flex items-center gap-2 transition-all">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00be50] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00be50]" />
                </span>
                <span className="tracking-tight select-all text-gray-200 font-semibold">{email}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-8 max-w-[280px]">
                Exchanging secure credential tokens with {isGithub ? "GitHub" : "Google"} APIs.
              </p>
            )}

            {/* Custom Progress Bar */}
            <div className="w-full bg-[var(--bg-secondary)] h-1.5 rounded-full overflow-hidden mb-8 relative border border-[var(--border)]">
              <div
                className="bg-[#00be50] h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(0,190,80,0.5)]"
                style={{ width: `${((currentStepIdx + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            {/* Step-by-Step Indicators */}
            <div className="w-full text-left space-y-4">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < currentStepIdx;
                const isActive = idx === currentStepIdx;
                
                let statusColor = "text-gray-400 opacity-60";
                let iconClass = "bg-[var(--bg-secondary)] text-gray-400 border-[var(--border)]";
                
                if (isCompleted) {
                  statusColor = "text-[#00be50] font-medium";
                  iconClass = "bg-[rgba(0,190,80,0.08)] text-[#00be50] border-[#00be50]/30";
                } else if (isActive) {
                  statusColor = "text-gray-600 font-medium";
                  iconClass = "bg-gray-100 text-gray-600 border-gray-300 animate-spin";
                }

                return (
                  <div key={step.id} className={`flex items-center gap-3.5 transition-all duration-300 ${statusColor}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${iconClass}`}>
                      <Icon size={15} className={isActive ? "animate-pulse" : ""} />
                    </div>
                    <span className="text-xs tracking-wide">
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-center z-10">
        <p className="text-[11px] text-gray-500 tracking-wider uppercase font-semibold">
          AI Career Co-Pilot Enterprise Security
        </p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#00be50]" />
        </div>
      }
    >
      <OAuthCallbackHandler />
    </Suspense>
  );
}
