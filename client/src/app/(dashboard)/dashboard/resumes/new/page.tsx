"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useCreateResumeMutation } from "@/redux/api/resumeApi";
import { ArrowLeft, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface EducationItem {
  institution: string;
  degree: string;
  year: string;
  gpa: string;
}

interface ProjectItem {
  name: string;
  description: string;
  technologies: string;
  link: string;
}

export default function NewResumePage() {
  const router = useRouter();
  const [createResume, { isLoading }] = useCreateResumeMutation();

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { company: "", role: "", duration: "", description: "" },
  ]);
  const [education, setEducation] = useState<EducationItem[]>([
    { institution: "", degree: "", year: "", gpa: "" },
  ]);
  const [projects, setProjects] = useState<ProjectItem[]>([
    { name: "", description: "", technologies: "", link: "" },
  ]);
  const [certifications, setCertifications] = useState("");
  const [activeSection, setActiveSection] = useState<string>("basics");

  const SECTIONS = [
    { id: "basics", label: "Basic Info" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills & Certs" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Resume title is required");
      return;
    }

    const parsedData = {
      name,
      email,
      phone,
      summary,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      experience: experience.filter((e) => e.company || e.role),
      education: education.filter((e) => e.institution || e.degree),
      projects: projects.filter((p) => p.name).map((p) => ({
        ...p,
        technologies: p.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      })),
      certifications: certifications.split(",").map((c) => c.trim()).filter(Boolean),
    };

    try {
      const result = await createResume({ title, parsedData }).unwrap();
      toast.success("Resume created successfully!");
      router.push(`${ROUTES.RESUMES}/${result.data.resume._id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create resume");
    }
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.12)] transition-colors";

  const labelClass = "block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={ROUTES.RESUMES}
          className="p-2 rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Create New Resume</h1>
          <p className="text-sm text-[var(--text-secondary)]">Fill in your details section by section</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Resume Title */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[rgba(0,190,80,0.1)] flex items-center justify-center">
              <FileText size={16} className="text-[#00be50]" />
            </div>
            <h2 className="font-bold text-[var(--text-primary)]">Resume Title</h2>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Software Engineer Resume — Google 2025"
            className={inputClass}
            required
          />
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 mb-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 py-2 px-2 rounded-[var(--radius-sm)] text-xs font-semibold transition-all ${
                activeSection === s.id
                  ? "bg-[#00be50] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Section: Basics */}
        {activeSection === "basics" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul Sharma" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@example.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Professional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                placeholder="Experienced software engineer with 3+ years building scalable web applications..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        {/* Section: Experience */}
        {activeSection === "experience" && (
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Position {i + 1}</h3>
                  {experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}
                      className="p-1.5 rounded text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Company</label>
                    <input type="text" value={exp.company} onChange={(e) => { const n = [...experience]; n[i].company = e.target.value; setExperience(n); }} placeholder="Google" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Role</label>
                    <input type="text" value={exp.role} onChange={(e) => { const n = [...experience]; n[i].role = e.target.value; setExperience(n); }} placeholder="Software Engineer" className={inputClass} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className={labelClass}>Duration</label>
                  <input type="text" value={exp.duration} onChange={(e) => { const n = [...experience]; n[i].duration = e.target.value; setExperience(n); }} placeholder="Jan 2023 – Present" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description / Achievements</label>
                  <textarea
                    rows={3}
                    value={exp.description}
                    onChange={(e) => { const n = [...experience]; n[i].description = e.target.value; setExperience(n); }}
                    placeholder="• Led development of microservices handling 10M+ requests/day&#10;• Reduced latency by 40%..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setExperience([...experience, { company: "", role: "", duration: "", description: "" }])}
              className="w-full py-3 border border-dashed border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add another position
            </button>
          </div>
        )}

        {/* Section: Education */}
        {activeSection === "education" && (
          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Education {i + 1}</h3>
                  {education.length > 1 && (
                    <button type="button" onClick={() => setEducation(education.filter((_, idx) => idx !== i))} className="p-1.5 rounded text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Institution</label>
                    <input type="text" value={edu.institution} onChange={(e) => { const n = [...education]; n[i].institution = e.target.value; setEducation(n); }} placeholder="IIT Delhi" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Degree</label>
                    <input type="text" value={edu.degree} onChange={(e) => { const n = [...education]; n[i].degree = e.target.value; setEducation(n); }} placeholder="B.Tech in Computer Science" className={inputClass} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Year</label>
                    <input type="text" value={edu.year} onChange={(e) => { const n = [...education]; n[i].year = e.target.value; setEducation(n); }} placeholder="2019 – 2023" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>GPA (optional)</label>
                    <input type="text" value={edu.gpa} onChange={(e) => { const n = [...education]; n[i].gpa = e.target.value; setEducation(n); }} placeholder="8.5 / 10" className={inputClass} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setEducation([...education, { institution: "", degree: "", year: "", gpa: "" }])} className="w-full py-3 border border-dashed border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> Add another education
            </button>
          </div>
        )}

        {/* Section: Projects */}
        {activeSection === "projects" && (
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">Project {i + 1}</h3>
                  {projects.length > 1 && (
                    <button type="button" onClick={() => setProjects(projects.filter((_, idx) => idx !== i))} className="p-1.5 rounded text-[var(--error)] hover:bg-[rgba(239,68,68,0.08)] transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input type="text" value={proj.name} onChange={(e) => { const n = [...projects]; n[i].name = e.target.value; setProjects(n); }} placeholder="AI Resume Builder" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Technologies (comma-separated)</label>
                    <input type="text" value={proj.technologies} onChange={(e) => { const n = [...projects]; n[i].technologies = e.target.value; setProjects(n); }} placeholder="React, Node.js, MongoDB" className={inputClass} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className={labelClass}>Description</label>
                  <textarea rows={2} value={proj.description} onChange={(e) => { const n = [...projects]; n[i].description = e.target.value; setProjects(n); }} placeholder="Brief description of the project and your contributions..." className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Link (optional)</label>
                  <input type="url" value={proj.link} onChange={(e) => { const n = [...projects]; n[i].link = e.target.value; setProjects(n); }} placeholder="https://github.com/..." className={inputClass} />
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setProjects([...projects, { name: "", description: "", technologies: "", link: "" }])} className="w-full py-3 border border-dashed border-[var(--border)] rounded-[var(--radius-sm)] text-sm font-medium text-[var(--text-secondary)] hover:text-[#00be50] hover:border-[#00be50] transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> Add another project
            </button>
          </div>
        )}

        {/* Section: Skills */}
        {activeSection === "skills" && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 space-y-4">
            <div>
              <label className={labelClass}>Technical Skills (comma-separated)</label>
              <textarea
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="JavaScript, TypeScript, React, Node.js, MongoDB, AWS, Docker..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">Separate each skill with a comma</p>
            </div>
            <div>
              <label className={labelClass}>Certifications (comma-separated)</label>
              <textarea
                rows={2}
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="AWS Certified Developer, Google Cloud Professional..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <Link
            href={ROUTES.RESUMES}
            className="flex-1 text-center py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 size={15} className="animate-spin" /> Saving...</>
            ) : (
              "Save Resume"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
