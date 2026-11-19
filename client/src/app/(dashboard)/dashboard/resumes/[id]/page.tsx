"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useGetResumeByIdQuery, useUpdateResumeMutation, useDeleteResumeMutation } from "@/redux/api/resumeApi";
import {
  ArrowLeft, FileText, Loader2, Save, Trash2, Star,
  Plus, X, ExternalLink, Clock, Wand2, Download,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data, isLoading, isError } = useGetResumeByIdQuery(id);
  const [updateResume, { isLoading: isSaving }] = useUpdateResumeMutation();
  const [deleteResume, { isLoading: isDeleting }] = useDeleteResumeMutation();

  const resume = data?.data?.resume;

  // Editable state
  const [title, setTitle] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("basics");
  const [newSkill, setNewSkill] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (resume) {
      setTitle(resume.title);
      setParsedData(JSON.parse(JSON.stringify(resume.parsedData || {})));
    }
  }, [resume]);

  const handleSave = async () => {
    try {
      await updateResume({ id, title, parsedData }).unwrap();
      toast.success("Resume saved successfully");
      setIsDirty(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save resume");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this resume permanently?")) return;
    try {
      await deleteResume(id).unwrap();
      toast.success("Resume deleted");
      router.push(ROUTES.RESUMES);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete resume");
    }
  };

  const markDirty = (updater: () => void) => {
    updater();
    setIsDirty(true);
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.12)] transition-colors";

  const labelClass = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5";

  const SECTIONS = [
    { id: "basics", label: "Basics" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "versions", label: "Versions" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#00be50]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText size={40} className="text-[var(--text-muted)] mb-4" />
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Resume not found</h2>
        <Link href={ROUTES.RESUMES} className="text-[#00be50] text-sm font-medium hover:underline">
          ← Back to Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.RESUMES}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] flex-shrink-0"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[var(--text-primary)]">{resume.title}</h1>
              {resume.isPrimary && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(0,190,80,0.1)] text-[#00be50] text-[11px] font-bold border border-[rgba(0,190,80,0.2)]">
                  <Star size={9} fill="currentColor" /> Primary
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <Clock size={11} /> Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/resumes/${id}/export/pdf`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:border-[#00be50] transition-colors"
          >
            <Download size={14} className="text-[#00be50]" /> PDF
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/resumes/${id}/export/docx`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-sm font-medium text-[var(--text-primary)] hover:border-[#8B5CF6] transition-colors"
          >
            <Download size={14} className="text-[#8B5CF6]" /> DOCX
          </a>
          <Link
            href={`${ROUTES.AI_ANALYZE_JD}?resumeId=${id}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors"
          >
            <Wand2 size={14} /> Tailor
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--error)] hover:border-[var(--error)] transition-colors"
            aria-label="Delete resume"
          >
            {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      {/* Title field */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-4">
        <label className={labelClass}>Resume Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => markDirty(() => setTitle(e.target.value))}
          className={inputClass}
          placeholder="e.g. Software Engineer — Google 2025"
        />
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-1 overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 py-2 px-3 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
              activeSection === s.id
                ? "bg-[#00be50] text-white"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* BASICS */}
      {activeSection === "basics" && parsedData && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" value={parsedData.name || ""} onChange={(e) => markDirty(() => setParsedData({ ...parsedData, name: e.target.value }))} className={inputClass} placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={parsedData.email || ""} onChange={(e) => markDirty(() => setParsedData({ ...parsedData, email: e.target.value }))} className={inputClass} placeholder="rahul@example.com" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={parsedData.phone || ""} onChange={(e) => markDirty(() => setParsedData({ ...parsedData, phone: e.target.value }))} className={inputClass} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className={labelClass}>Summary</label>
            <textarea rows={4} value={parsedData.summary || ""} onChange={(e) => markDirty(() => setParsedData({ ...parsedData, summary: e.target.value }))} className={`${inputClass} resize-none`} placeholder="Professional summary..." />
          </div>
        </div>
      )}

      {/* EXPERIENCE */}
      {activeSection === "experience" && parsedData && (
        <div className="space-y-3">
          {(parsedData.experience || []).map((exp: any, i: number) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Position {i + 1}</h3>
                <button onClick={() => markDirty(() => setParsedData({ ...parsedData, experience: parsedData.experience.filter((_: any, idx: number) => idx !== i) }))} className="p-1.5 rounded text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)]">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelClass}>Company</label>
                  <input type="text" value={exp.company} onChange={(e) => { const n = [...parsedData.experience]; n[i] = { ...n[i], company: e.target.value }; markDirty(() => setParsedData({ ...parsedData, experience: n })); }} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input type="text" value={exp.role} onChange={(e) => { const n = [...parsedData.experience]; n[i] = { ...n[i], role: e.target.value }; markDirty(() => setParsedData({ ...parsedData, experience: n })); }} className={inputClass} />
                </div>
              </div>
              <div className="mb-3">
                <label className={labelClass}>Duration</label>
                <input type="text" value={exp.duration} onChange={(e) => { const n = [...parsedData.experience]; n[i] = { ...n[i], duration: e.target.value }; markDirty(() => setParsedData({ ...parsedData, experience: n })); }} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows={3} value={exp.description} onChange={(e) => { const n = [...parsedData.experience]; n[i] = { ...n[i], description: e.target.value }; markDirty(() => setParsedData({ ...parsedData, experience: n })); }} className={`${inputClass} resize-none`} />
              </div>
            </div>
          ))}
          <button onClick={() => markDirty(() => setParsedData({ ...parsedData, experience: [...(parsedData.experience || []), { company: "", role: "", duration: "", description: "" }] }))} className="w-full py-3 border border-dashed border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors flex items-center justify-center gap-2">
            <Plus size={14} /> Add Position
          </button>
        </div>
      )}

      {/* EDUCATION */}
      {activeSection === "education" && parsedData && (
        <div className="space-y-3">
          {(parsedData.education || []).map((edu: any, i: number) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Education {i + 1}</h3>
                <button onClick={() => markDirty(() => setParsedData({ ...parsedData, education: parsedData.education.filter((_: any, idx: number) => idx !== i) }))} className="p-1.5 rounded text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)]">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Institution</label>
                  <input type="text" value={edu.institution} onChange={(e) => { const n = [...parsedData.education]; n[i] = { ...n[i], institution: e.target.value }; markDirty(() => setParsedData({ ...parsedData, education: n })); }} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Degree</label>
                  <input type="text" value={edu.degree} onChange={(e) => { const n = [...parsedData.education]; n[i] = { ...n[i], degree: e.target.value }; markDirty(() => setParsedData({ ...parsedData, education: n })); }} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Year</label>
                  <input type="text" value={edu.year} onChange={(e) => { const n = [...parsedData.education]; n[i] = { ...n[i], year: e.target.value }; markDirty(() => setParsedData({ ...parsedData, education: n })); }} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>GPA (optional)</label>
                  <input type="text" value={edu.gpa || ""} onChange={(e) => { const n = [...parsedData.education]; n[i] = { ...n[i], gpa: e.target.value }; markDirty(() => setParsedData({ ...parsedData, education: n })); }} className={inputClass} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => markDirty(() => setParsedData({ ...parsedData, education: [...(parsedData.education || []), { institution: "", degree: "", year: "", gpa: "" }] }))} className="w-full py-3 border border-dashed border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors flex items-center justify-center gap-2">
            <Plus size={14} /> Add Education
          </button>
        </div>
      )}

      {/* PROJECTS */}
      {activeSection === "projects" && parsedData && (
        <div className="space-y-3">
          {(parsedData.projects || []).map((proj: any, i: number) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Project {i + 1}</h3>
                <button onClick={() => markDirty(() => setParsedData({ ...parsedData, projects: parsedData.projects.filter((_: any, idx: number) => idx !== i) }))} className="p-1.5 rounded text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)]">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelClass}>Project Name</label>
                  <input type="text" value={proj.name} onChange={(e) => { const n = [...parsedData.projects]; n[i] = { ...n[i], name: e.target.value }; markDirty(() => setParsedData({ ...parsedData, projects: n })); }} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Technologies</label>
                  <input type="text" value={Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies} onChange={(e) => { const n = [...parsedData.projects]; n[i] = { ...n[i], technologies: e.target.value.split(",").map((t: string) => t.trim()) }; markDirty(() => setParsedData({ ...parsedData, projects: n })); }} className={inputClass} placeholder="React, Node.js..." />
                </div>
              </div>
              <div className="mb-3">
                <label className={labelClass}>Description</label>
                <textarea rows={2} value={proj.description} onChange={(e) => { const n = [...parsedData.projects]; n[i] = { ...n[i], description: e.target.value }; markDirty(() => setParsedData({ ...parsedData, projects: n })); }} className={`${inputClass} resize-none`} />
              </div>
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00be50] flex items-center gap-1 hover:underline">
                  <ExternalLink size={11} /> {proj.link}
                </a>
              )}
              <div className="mt-2">
                <label className={labelClass}>Link (optional)</label>
                <input type="url" value={proj.link || ""} onChange={(e) => { const n = [...parsedData.projects]; n[i] = { ...n[i], link: e.target.value }; markDirty(() => setParsedData({ ...parsedData, projects: n })); }} className={inputClass} placeholder="https://github.com/..." />
              </div>
            </div>
          ))}
          <button onClick={() => markDirty(() => setParsedData({ ...parsedData, projects: [...(parsedData.projects || []), { name: "", description: "", technologies: [], link: "" }] }))} className="w-full py-3 border border-dashed border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors flex items-center justify-center gap-2">
            <Plus size={14} /> Add Project
          </button>
        </div>
      )}

      {/* SKILLS */}
      {activeSection === "skills" && parsedData && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-5">
          <div>
            <label className={labelClass}>Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(parsedData.skills || []).map((skill: string, i: number) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(0,190,80,0.08)] text-[#00be50] text-xs font-medium border border-[rgba(0,190,80,0.2)]">
                  {skill}
                  <button onClick={() => markDirty(() => setParsedData({ ...parsedData, skills: parsedData.skills.filter((_: string, idx: number) => idx !== i) }))} className="hover:text-[var(--error)] transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSkill.trim()) {
                    e.preventDefault();
                    markDirty(() => setParsedData({ ...parsedData, skills: [...(parsedData.skills || []), newSkill.trim()] }));
                    setNewSkill("");
                  }
                }}
                placeholder="Type a skill and press Enter"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkill.trim()) {
                    markDirty(() => setParsedData({ ...parsedData, skills: [...(parsedData.skills || []), newSkill.trim()] }));
                    setNewSkill("");
                  }
                }}
                className="px-3 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] text-white hover:bg-[#00a545] transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div>
            <label className={labelClass}>Certifications</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(parsedData.certifications || []).map((cert: string, i: number) => (
                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(99,102,241,0.08)] text-[#8B5CF6] text-xs font-medium border border-[rgba(99,102,241,0.2)]">
                  {cert}
                  <button onClick={() => markDirty(() => setParsedData({ ...parsedData, certifications: parsedData.certifications.filter((_: string, idx: number) => idx !== i) }))} className="hover:text-[var(--error)]"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VERSIONS */}
      {activeSection === "versions" && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <h3 className="font-bold text-[var(--text-primary)] mb-4">Version History</h3>
          {(resume.versions || []).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No saved versions yet. Save your changes to create a version.</p>
          ) : (
            <div className="space-y-2">
              {[...(resume.versions || [])].reverse().map((v: any) => (
                <div key={v.versionNumber} className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(0,190,80,0.1)] border border-[rgba(0,190,80,0.2)] flex items-center justify-center text-xs font-bold text-[#00be50]">
                      v{v.versionNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">Version {v.versionNumber}</p>
                      <p className="text-xs text-[var(--text-muted)]">{new Date(v.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {v.atsScore && (
                    <span className="text-xs font-bold text-[#00be50] bg-[rgba(0,190,80,0.1)] px-2.5 py-1 rounded-full">
                      ATS: {v.atsScore}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Save Bar */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-full shadow-2xl px-5 py-2.5 z-50">
          <span className="text-sm text-[var(--text-secondary)]">Unsaved changes</span>
          <button onClick={() => { setTitle(resume.title); setParsedData(JSON.parse(JSON.stringify(resume.parsedData || {}))); setIsDirty(false); }} className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors font-medium">
            Discard
          </button>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors disabled:opacity-60">
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>
        </div>
      )}
    </div>
  );
}
