"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useUploadResumeMutation } from "@/redux/api/resumeApi";
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ResumeUploadPage() {
  const router = useRouter();
  const [uploadResume, { isLoading }] = useUploadResumeMutation();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(pdf|docx|doc)$/i)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setFile(selectedFile);
    if (!title) {
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(fileNameWithoutExt);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a resume file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64File = reader.result as string;
      try {
        const res = await uploadResume({
          file: base64File,
          title: title || file.name,
        }).unwrap();

        toast.success("Resume uploaded successfully!");
        router.push(`${ROUTES.RESUMES}/${res.data.resume._id}`);
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to upload resume");
      }
    };
  };

  const inputClass =
    "w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[#00be50] focus:ring-2 focus:ring-[rgba(0,190,80,0.12)] transition-colors";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={ROUTES.RESUMES}
          className="p-2 rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)]"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Upload Resume</h1>
          <p className="text-sm text-[var(--text-secondary)]">Upload your existing PDF or Word document</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5">
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">
            Resume Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Developer Resume 2025"
            className={inputClass}
          />
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`bg-[var(--bg-card)] border-2 border-dashed rounded-[var(--radius)] p-8 text-center transition-all ${
            dragOver
              ? "border-[#00be50] bg-[rgba(0,190,80,0.04)]"
              : file
              ? "border-[#00be50] bg-[rgba(0,190,80,0.02)]"
              : "border-[var(--border)] hover:border-[var(--border-hover)]"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.docx,.doc"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(0,190,80,0.1)] border border-[rgba(0,190,80,0.2)] flex items-center justify-center mb-3">
                <CheckCircle2 size={28} className="text-[#00be50]" />
              </div>
              <p className="font-bold text-[var(--text-primary)] text-sm mb-1">{file.name}</p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <label
                htmlFor="file-upload"
                className="text-xs font-semibold text-[#00be50] hover:underline cursor-pointer"
              >
                Choose a different file
              </label>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-3 text-[var(--text-muted)]">
                <Upload size={24} />
              </div>
              <p className="font-bold text-[var(--text-primary)] text-sm mb-1">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Supports PDF, DOCX (Max 10MB)
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)]">
                <FileText size={14} /> Select File
              </span>
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href={ROUTES.RESUMES}
            className="flex-1 text-center py-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !file}
            className="flex-1 py-2.5 rounded-[var(--radius-sm)] bg-[#00be50] hover:bg-[#00a545] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading...</>
            ) : (
              "Upload & Continue"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
