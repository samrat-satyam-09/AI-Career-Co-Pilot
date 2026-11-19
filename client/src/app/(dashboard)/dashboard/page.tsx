"use client";

import { useAppSelector } from "@/redux/store";
import { useGetAllResumesQuery } from "@/redux/api/resumeApi";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  FileText,
  Briefcase,
  Wand2,
  Video,
  TrendingUp,
  Star,
  Plus,
  ArrowRight,
  Zap,
} from "lucide-react";

const QUICK_STATS = [
  { label: "Resumes", icon: FileText, route: ROUTES.RESUMES, color: "#00be50", bgColor: "rgba(0,190,80,0.1)" },
  { label: "Applications", icon: Briefcase, route: ROUTES.APPLICATIONS, color: "#8B5CF6", bgColor: "rgba(139,92,246,0.1)" },
  { label: "AI Tools", icon: Wand2, route: ROUTES.AI_TOOLS, color: "#F59E0B", bgColor: "rgba(245,158,11,0.1)" },
  { label: "Interviews", icon: Video, route: ROUTES.INTERVIEWS, color: "#14B8A6", bgColor: "rgba(20,184,166,0.1)" },
];

const AI_TOOLS = [
  { label: "Tailor Resume to JD", desc: "Match your resume to any job description", icon: "🎯", route: ROUTES.AI_ANALYZE_JD },
  { label: "Check ATS Score", desc: "See how well your resume passes ATS filters", icon: "📊", route: ROUTES.AI_ATS_SCORE },
  { label: "Generate Cover Letter", desc: "AI-crafted letter for any role", icon: "✉️", route: ROUTES.AI_COVER_LETTER },
  { label: "Skill Gap Analysis", desc: "Identify missing skills for your target role", icon: "🔍", route: ROUTES.AI_SKILL_GAP },
  { label: "Career Chat", desc: "Get personalized career advice from AI", icon: "💬", route: ROUTES.AI_CAREER_CHAT },
];

export default function DashboardOverviewPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: resumeData } = useGetAllResumesQuery();

  const resumeCount = resumeData?.data?.count ?? 0;
  const primaryResume = resumeData?.data?.resumes?.find((r) => r.isPrimary);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* ── Greeting Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">
            {greeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Here&apos;s what&apos;s happening with your job search.
          </p>
        </div>
        <Link
          href={ROUTES.RESUMES_NEW}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors shadow-[0_0_20px_rgba(0,190,80,0.3)]"
        >
          <Plus size={16} />
          New Resume
        </Link>
      </div>

      {/* ── Quick Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.route}
              className="group bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center mb-3"
                style={{ background: stat.bgColor }}
              >
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-0.5">{stat.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                  {stat.label === "Resumes" ? resumeCount : "—"}
                </span>
                <ArrowRight
                  size={14}
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors"
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Primary Resume + AI Tools Row ─────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Primary Resume Card */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Star size={16} className="text-[#00be50]" />
              Primary Resume
            </h2>
            <Link href={ROUTES.RESUMES} className="text-xs text-[#00be50] hover:underline font-medium">
              Manage →
            </Link>
          </div>

          {primaryResume ? (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[rgba(0,190,80,0.1)] border border-[rgba(0,190,80,0.2)] flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-[#00be50]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{primaryResume.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Updated {new Date(primaryResume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`${ROUTES.RESUMES}/${primaryResume._id}`}
                  className="flex-1 text-center py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[rgba(0,190,80,0.1)] text-[#00be50] hover:bg-[rgba(0,190,80,0.2)] transition-colors"
                >
                  Edit Resume
                </Link>
                <Link
                  href={ROUTES.AI_ANALYZE_JD}
                  className="flex-1 text-center py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Tailor to JD
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3">No resume uploaded yet</p>
              <Link
                href={ROUTES.RESUMES_NEW}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00be50] hover:underline"
              >
                <Plus size={12} /> Upload your first resume
              </Link>
            </div>
          )}
        </div>

        {/* AI Tools Quick Access */}
        <div className="lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Zap size={16} className="text-[#F59E0B]" />
              AI Career Tools
            </h2>
            <Link href={ROUTES.AI_TOOLS} className="text-xs text-[#00be50] hover:underline font-medium">
              All tools →
            </Link>
          </div>
          <div className="space-y-2">
            {AI_TOOLS.map((tool) => (
              <Link
                key={tool.label}
                href={tool.route}
                className="flex items-center gap-3 p-3 rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] transition-colors group"
              >
                <span className="text-xl w-8 text-center">{tool.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#00be50] transition-colors truncate">
                    {tool.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{tool.desc}</p>
                </div>
                <ArrowRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Get Started Banner (shown if no resume) ────────────── */}
      {resumeCount === 0 && (
        <div className="relative overflow-hidden rounded-[var(--radius)] border border-[rgba(0,190,80,0.3)] bg-[linear-gradient(135deg,rgba(0,190,80,0.06)_0%,transparent_60%)] p-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,rgba(0,190,80,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-3xl">🚀</div>
            <div className="flex-1">
              <h3 className="font-bold text-[var(--text-primary)] mb-1">Start your career journey</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Upload your resume to unlock AI-powered tailoring, ATS scoring, and interview coaching.
              </p>
            </div>
            <Link
              href={ROUTES.RESUMES_NEW}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors"
            >
              <TrendingUp size={15} /> Get Started
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
