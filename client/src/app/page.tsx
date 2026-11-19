"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Briefcase,
  Wand2,
  Video,
  Shield,
  TrendingUp,
  Award,
  Zap,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function Home() {
  const stats = [
    { value: "10K+", label: "Resumes Tailored" },
    { value: "95%", label: "ATS Pass Rate" },
    { value: "5K+", label: "Happy Job Seekers" },
  ];

  const features = [
    {
      icon: FileText,
      title: "Resume Tailoring",
      desc: "Instantly align your resume with any job description. Optimize keywords and formatting to stand out.",
    },
    {
      icon: Zap,
      title: "ATS Scorer",
      desc: "Get an interactive score showing how friendly your resume is to applicant tracking systems.",
    },
    {
      icon: Video,
      title: "Mock Interviews",
      desc: "Practice with custom AI interviews tailored to target roles. Get real-time adaptive feedback.",
    },
    {
      icon: Briefcase,
      title: "Job Tracker",
      desc: "Manage your applications on a dynamic Kanban board. Keep track of timeline, notes, and tasks.",
    },
    {
      icon: Wand2,
      title: "Cover Letter Generator",
      desc: "Generate professional, matching cover letters tailored to each job application in seconds.",
    },
    {
      icon: Sparkles,
      title: "AI Career Chat",
      desc: "Receive career advice, path guidance, and resume feedback through our real-time chat agent.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Upload Resume",
      desc: "Upload your existing PDF or Word resume, or use our smart builder to create one.",
    },
    {
      num: "02",
      title: "Paste Job Link",
      desc: "Add target job description details or link to extract keywords and requirements.",
    },
    {
      num: "03",
      title: "Get Hired",
      desc: "Tailor resume, generate cover letters, practice interviews, and track your success.",
    },
  ];

  const testimonials = [
    {
      quote: "AI Career Co-Pilot changed my job search completely. I got 3 interviews in a week after optimization.",
      name: "Rohan Sharma",
      role: "Software Engineer",
    },
    {
      quote: "The mock interview adaptive mode is scary good. It prepared me for tough tech questions perfectly.",
      name: "Sneha Patel",
      role: "Product Manager",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#181A1B] text-gray-100">
      {/* Header Navigation */}
      <Navbar />

      {/* ────────────────────── HERO SECTION ────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#181A1B]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="inline-block">
              <Badge variant="pro" dot>
                Launch Promo: Get 50% Off Pro
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
            >
              Land Your Dream Job <br />
              <span className="gradient-text font-black">Twice As Fast</span> With AI
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
            >
              Supercharge your job search with our advanced, AI-powered suite of career tools. Match JDs, optimize resumes, score ATS-friendliness, and practice custom mock interviews.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  Start Free Trial
                </Button>
              </Link>
              <Link href={ROUTES.FEATURES}>
                <Button variant="secondary" size="lg">
                  See Features
                </Button>
              </Link>
            </motion.div>

            {/* Stats Counter Row */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-12 border-t border-gray-800"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)]">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Interactive Floating Card mockups */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 max-w-5xl mx-auto border border-gray-800 rounded-[var(--radius-lg)] overflow-hidden shadow-2xl glass"
          >
            <div className="bg-[#111314] px-4 py-3 flex items-center gap-2 border-b border-gray-800">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="mx-auto bg-[#1e2123] text-xs text-gray-400 py-1 px-8 rounded-md w-64 text-center truncate">
                dashboard.aicareerpilot.com
              </div>
            </div>
            <div className="bg-[#181A1B] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mini sidebar */}
              <div className="hidden md:block space-y-4 border-r border-gray-800 pr-6">
                <div className="h-6 w-24 bg-gray-800 rounded-md" />
                <div className="space-y-2">
                  <div className="h-8 bg-[var(--accent)]/10 rounded-md border-l-2 border-[var(--accent)]" />
                  <div className="h-8 bg-gray-800/40 rounded-md" />
                  <div className="h-8 bg-gray-800/40 rounded-md" />
                </div>
              </div>
              {/* Main content snippet */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <div className="h-6 w-32 bg-gray-800 rounded-md" />
                    <div className="h-4 w-48 bg-gray-800/60 rounded-md" />
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--accent)] flex items-center justify-center text-xs font-bold">
                    85%
                  </div>
                </div>
                <div className="space-y-3 bg-[#1e2123] p-4 rounded-lg border border-gray-800">
                  <div className="flex gap-2 items-center">
                    <CheckCircle2 size={16} className="text-[var(--accent)]" />
                    <div className="h-4 w-40 bg-gray-800 rounded" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <CheckCircle2 size={16} className="text-[var(--accent)]" />
                    <div className="h-4 w-52 bg-gray-800 rounded" />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-4 h-4 rounded-full border border-gray-600" />
                    <div className="h-4 w-36 bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────── FEATURES SECTION ────────────────────── */}
      <section className="py-20 bg-[#1E2123]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="pro">Features Suite</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything you need to succeed
            </h2>
            <p className="text-gray-400">
              Powerful, AI-driven components built to handle every aspect of your professional job application journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={i}
                  variant="default"
                  hover
                  className="bg-[#181A1B] border-gray-800 p-6 flex flex-col gap-4 text-left"
                >
                  <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] shrink-0">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────── HOW IT WORKS ────────────────────── */}
      <section className="py-20 bg-[#181A1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="default">Workflow</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How it works</h2>
            <p className="text-gray-400">Follow three simple steps to start receiving responses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center space-y-4 relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--accent)] flex items-center justify-center text-xl font-extrabold text-white bg-[#181A1B] shadow-[var(--shadow-glow)]">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white">{step.title}</h3>
                <p className="text-sm text-gray-400 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── TESTIMONIALS ────────────────────── */}
      <section className="py-20 bg-[#151718] border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16 space-y-4">
            <Badge variant="pro">Success Stories</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Trusted by job seekers</h2>
            <p className="text-gray-400">See how professionals are changing their outcomes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <Card
                key={i}
                variant="glass"
                className="p-6 text-left border-l-4 border-[var(--accent)] flex flex-col justify-between"
              >
                <p className="text-base text-gray-300 italic mb-6">"{t.quote}"</p>
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── FOOTER ────────────────────── */}
      <Footer />
    </div>
  );
}
