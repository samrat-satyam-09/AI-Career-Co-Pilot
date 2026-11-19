"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import {
  useGetAllResumesQuery,
  useDeleteResumeMutation,
  useSetPrimaryResumeMutation,
  useDuplicateResumeMutation,
} from "@/redux/api/resumeApi";
import {
  FileText,
  Plus,
  Star,
  MoreVertical,
  Trash2,
  Copy,
  Edit,
  Loader2,
  Upload,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ResumesPage() {
  const { data, isLoading, isFetching } = useGetAllResumesQuery();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteResumeMutation();
  const [setPrimary, { isLoading: isSettingPrimary }] = useSetPrimaryResumeMutation();
  const [duplicate, { isLoading: isDuplicating }] = useDuplicateResumeMutation();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resumes = data?.data?.resumes ?? [];

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteResume(id).unwrap();
      toast.success("Resume deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
    setOpenMenuId(null);
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimary(id).unwrap();
      toast.success("Primary resume updated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update primary resume");
    }
    setOpenMenuId(null);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicate(id).unwrap();
      toast.success("Resume duplicated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to duplicate resume");
    }
    setOpenMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">My Resumes</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-0.5">
            {resumes.length > 0
              ? `${resumes.length} resume${resumes.length > 1 ? "s" : ""} — star one to set as primary`
              : "Upload or create your first resume to get started"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`${ROUTES.RESUMES}/upload`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Upload size={15} />
            Upload PDF
          </Link>
          <Link
            href={ROUTES.RESUMES_NEW}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors"
          >
            <Plus size={15} />
            New Resume
          </Link>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-[var(--radius)] bg-[var(--bg-card)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mb-5">
            <FileText size={28} className="text-[var(--text-muted)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">No resumes yet</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6 max-w-xs">
            Upload an existing resume or create one from scratch to get started with AI-powered tailoring.
          </p>
          <div className="flex gap-3">
            <Link
              href={`${ROUTES.RESUMES}/upload`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Upload size={15} /> Upload PDF
            </Link>
            <Link
              href={ROUTES.RESUMES_NEW}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors"
            >
              <Plus size={15} /> Build from Scratch
            </Link>
          </div>
        </div>
      ) : (
        // Resume Cards Grid
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              className={`relative group bg-[var(--bg-card)] border rounded-[var(--radius)] p-5 hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all duration-200 ${
                resume.isPrimary ? "border-[#00be50]" : "border-[var(--border)]"
              }`}
            >
              {/* Primary Badge */}
              {resume.isPrimary && (
                <div className="absolute top-3 right-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(0,190,80,0.1)] text-[#00be50] text-[11px] font-bold border border-[rgba(0,190,80,0.2)]">
                  <Star size={9} fill="currentColor" /> Primary
                </div>
              )}

              {/* 3-dot Menu */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => setOpenMenuId(openMenuId === resume._id ? null : resume._id)}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  aria-label="Actions"
                >
                  <MoreVertical size={15} />
                </button>

                {/* Dropdown */}
                {openMenuId === resume._id && (
                  <div className="absolute top-8 right-0 z-20 w-44 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-sm)] shadow-xl overflow-hidden">
                    <Link
                      href={`${ROUTES.RESUMES}/${resume._id}`}
                      className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                      onClick={() => setOpenMenuId(null)}
                    >
                      <Edit size={14} /> Edit
                    </Link>
                    {!resume.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(resume._id)}
                        disabled={isSettingPrimary}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <Star size={14} /> Set as Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicate(resume._id)}
                      disabled={isDuplicating}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      <Copy size={14} /> Duplicate
                    </button>
                    <div className="h-px bg-[var(--border)] my-1" />
                    <button
                      onClick={() => handleDelete(resume._id, resume.title)}
                      disabled={deletingId === resume._id}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--error)] hover:bg-[rgba(239,68,68,0.05)] transition-colors"
                    >
                      {deletingId === resume._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Resume Icon */}
              <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[rgba(0,190,80,0.08)] border border-[rgba(0,190,80,0.15)] flex items-center justify-center mb-4">
                <FileText size={22} className="text-[#00be50]" />
              </div>

              {/* Info */}
              <Link href={`${ROUTES.RESUMES}/${resume._id}`}>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1 hover:text-[#00be50] transition-colors line-clamp-1 pr-16">
                  {resume.title}
                </h3>
              </Link>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  href={`${ROUTES.RESUMES}/${resume._id}`}
                  className="flex-1 text-center py-2 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Edit
                </Link>
                <Link
                  href={`${ROUTES.AI_ANALYZE_JD}?resumeId=${resume._id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[var(--radius-sm)] text-xs font-semibold text-[#00be50] bg-[rgba(0,190,80,0.08)] hover:bg-[rgba(0,190,80,0.15)] transition-colors"
                >
                  <Wand2 size={11} /> Tailor
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close menu */}
      {openMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  );
}
