// Application-wide constants

// ──────────── Route Paths ────────────
export const ROUTES = {
  // Public
  HOME: "/",
  FEATURES: "/features",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_OTP: "/verify-otp",
  FORGOT_PASSWORD: "/forgot-password",

  // Dashboard
  DASHBOARD: "/dashboard",
  RESUMES: "/dashboard/resumes",
  RESUMES_NEW: "/dashboard/resumes/new",
  APPLICATIONS: "/dashboard/applications",
  APPLICATIONS_NEW: "/dashboard/applications/new",
  AI_TOOLS: "/dashboard/ai-tools",
  AI_ANALYZE_JD: "/dashboard/ai-tools/analyze-jd",
  AI_ATS_SCORE: "/dashboard/ai-tools/ats-score",
  AI_COVER_LETTER: "/dashboard/ai-tools/cover-letter",
  AI_SKILL_GAP: "/dashboard/ai-tools/skill-gap",
  AI_CAREER_CHAT: "/dashboard/ai-tools/career-chat",
  INTERVIEWS: "/dashboard/interviews",
  INTERVIEWS_NEW: "/dashboard/interviews/new",
  BILLING: "/dashboard/billing",
  SETTINGS: "/dashboard/settings",
  NOTIFICATIONS: "/dashboard/notifications",

  // Admin
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SUBSCRIPTIONS: "/admin/subscriptions",
  ADMIN_PLANS: "/admin/plans",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_AI_CONFIG: "/admin/ai-config",
  ADMIN_AI_USAGE: "/admin/ai-usage",
  ADMIN_APPLICATIONS: "/admin/applications",
  ADMIN_CONTENT: "/admin/content",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_LOGS: "/admin/logs",
} as const;

// ──────────── API Base URL ────────────
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ──────────── Application Status Colors ────────────
export const STATUS_COLORS: Record<string, string> = {
  wishlist: "#6366F1",   // Indigo
  applied: "#00BE50",    // Green (brand)
  oa: "#F59E0B",         // Amber
  interview: "#8B5CF6",  // Purple
  offer: "#14B8A6",      // Teal
  rejected: "#EF4444",   // Red
};

// ──────────── Plan Limits (fallback — real limits come from API) ────────────
export const FREE_PLAN_LIMITS = {
  resumeUploads: 1,
  resumeTailorsPerMonth: 3,
  jdAnalysisPerMonth: 5,
  atsScoreChecksPerMonth: 3,
  coverLettersPerMonth: 2,
  mockInterviewsPerMonth: 2,
  jobApplications: 10,
  aiChatMessagesPerDay: 10,
  skillGapAnalysisPerMonth: 2,
};

// ──────────── Kanban Columns ────────────
export const KANBAN_COLUMNS = [
  { id: "wishlist", title: "Wishlist", color: "#6366F1" },
  { id: "applied", title: "Applied", color: "#00BE50" },
  { id: "oa", title: "OA", color: "#F59E0B" },
  { id: "interview", title: "Interview", color: "#8B5CF6" },
  { id: "offer", title: "Offer", color: "#14B8A6" },
  { id: "rejected", title: "Rejected", color: "#EF4444" },
] as const;

// ──────────── Interview Types ────────────
export const INTERVIEW_TYPES = [
  { value: "dsa", label: "DSA / Coding" },
  { value: "hr", label: "HR / Behavioral" },
  { value: "system-design", label: "System Design" },
  { value: "behavioral", label: "Behavioral" },
] as const;

export const DIFFICULTY_LEVELS = [
  { value: "easy", label: "Easy", color: "#00BE50" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "hard", label: "Hard", color: "#EF4444" },
] as const;
