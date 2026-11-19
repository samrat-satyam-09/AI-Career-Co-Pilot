# 🚀 AI Career Co-Pilot

An enterprise-ready, AI-driven full-stack career platform designed to empower job seekers. It provides end-to-end support throughout the hiring journey—from intelligent resume parsing and job description tailoring to smart application tracking and dynamic mock interviews.

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Features](#-key-features)
- [Directory Structure](#-directory-structure)
- [Module Breakdown](#-module-breakdown)
- [Getting Started & Installation](#-getting-started--installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Database Schema Overview](#-database-schema-overview)
- [Deployment Guide](#-deployment-guide)

---

## 🛠 Architecture & Tech Stack

### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **State Management:** Redux Toolkit & RTK Query
- **Styling & UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Form Handling & Validation:** Zod, React Hook Form

### **Backend**
- **Runtime:** Node.js with Express
- **Language:** TypeScript
- **Database:** MongoDB Atlas (via Mongoose ODM)
- **Caching & Rate Limiting:** Redis / Upstash
- **Job Queue:** BullMQ (Background jobs for resume parsing & notification/email queues)
- **Authentication:** JWT (Access + Refresh Token flow) & OAuth (Google/GitHub)

### **AI Core & Integrations**
- **Multi-LLM Routing:** Fallback chain powered by Google Gemini 1.5 Flash, Groq (Llama-3.1), and OpenAI GPT-4o-mini / Claude Haiku
- **Payments:** Razorpay (Subscriptions, Webhook events)
- **Media Storage:** Cloudinary (Resumes, User Avatars)
- **Communication:** Nodemailer (Transactional Emails & OTPs)

---

## ✨ Key Features

1. **Authentication & Identity:**
   - Multi-provider authentication (Email/Password, Google OAuth, GitHub OAuth).
   - Email verification with OTP and secure Refresh Token rotation.
2. **Resume Management & ATS Optimization:**
   - Upload PDF/DOCX to Cloudinary with automated AI text parsing.
   - Real-time ATS match scoring against target Job Descriptions (JDs).
   - Multiple tailored resume versions per application.
3. **AI Core & Tailoring:**
   - Automated skill gap analysis and keyword suggestions.
   - Dynamic AI-generated tailored cover letters customized for the target job role.
4. **Kanban Application Tracker:**
   - Track applications across stages: *Wishlist → Applied → Online Assessment → Interview → Offer → Rejected*.
   - Timeline audit trails and follow-up reminders.
5. **AI Mock Interview Simulator:**
   - Role-specific dynamic interview questions and real-time response evaluations.
   - Comprehensive feedback reports on answers, communication, and technical depth.
6. **Subscription & Billing:**
   - Tiered plans (Free vs. Pro) managed via Razorpay subscriptions and webhooks.

---

## 📂 Directory Structure

```plaintext
AI-Career-Co-Pilot/
├── client/                              # Next.js 15 Frontend
│   ├── public/                          # Static assets and public files
│   ├── src/
│   │   ├── app/                         # App router (pages, layouts, route groups)
│   │   ├── components/                  # Reusable UI & layout components
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── lib/                         # Client-side utility functions & integrations
│   │   ├── redux/                       # Redux store slices & RTK Query APIs
│   │   ├── styles/                      # Global styles and Tailwind configuration
│   │   └── utils/                       # Shared helpers and formatters
│   ├── next.config.ts                   # Next.js configuration
│   ├── package.json
│   └── tsconfig.json
│
├── server/                              # Express + TypeScript Backend
│   ├── scripts/                         # Database seed and maintenance scripts
│   ├── src/
│   │   ├── config/                      # Database, Redis, Cloudinary, and Nodemailer configs
│   │   ├── controllers/                 # Route controllers (Auth, Resume, AI, Jobs, etc.)
│   │   ├── jobs/                        # BullMQ queues and workers
│   │   ├── middlewares/                 # Auth verification, rate limiting, error handler
│   │   ├── models/                      # Mongoose schemas & data models
│   │   ├── routes/                      # Modular API route definitions
│   │   ├── services/                    # Business logic, AI LLM routing, Payment services
│   │   ├── utils/                       # Token helpers, response formatters, logging
│   │   ├── validators/                  # Zod request validation schemas
│   │   ├── app.ts                       # Express application setup
│   │   └── server.ts                    # Server bootstrap & cluster entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                           # Git ignore rules
└── README.md                            # Project documentation
```

---

## 📦 Module Breakdown

| Module | Core Functionality |
|---|---|
| **Auth & User Management** | User registration, login, logout, password reset, OTP verification, token refresh. |
| **Resume Management** | Upload raw resumes, PDF parsing, extract education/experience/skills, version control. |
| **AI Core Services** | ATS score calculator, JD skill matching, resume tailoring, cover letter generator. |
| **Job Application Tracker** | CRUD applications, drag-and-drop Kanban status updates, timeline logs, notes. |
| **Mock Interview Agent** | Generate AI interview questions, answer submission, score evaluation, feedback history. |
| **Subscription & Payments** | Razorpay checkout session, subscription verification, webhooks, usage limits. |
| **Admin & Analytics** | User metrics, subscription analytics, AI token usage monitor, LLM routing control. |
| **Notifications** | In-app alerts, email notifications for interview dates, follow-up reminders. |

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js**: `v18.x` or `v20.x` or higher
- **Package Manager**: `npm` or `pnpm`
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI
- **Redis**: Local Redis server or Upstash Redis URL

### 1. Clone the Repository
```bash
git clone git@github.com:samrat-satyam-09/AI-Career-Co-Pilot.git
cd "AI-Career-Co-Pilot"
```

### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env   # Configure your environment variables
npm run dev
```
The backend server will start on `http://localhost:5000` (or your configured `PORT`).

### 3. Frontend Setup
In a new terminal window:
```bash
cd client
npm install
cp .env.example .env.local   # Configure frontend environment variables
npm run dev
```
The frontend application will start on `http://localhost:3000`.

---

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database & Cache
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai_career_copilot
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI API Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
OPENAI_API_KEY=your_openai_api_key

# Cloudinary (File Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

## 📊 Database Schema Overview

- **User**: Authentication, personal details, roles (`user`, `admin`), subscription tier, usage quota.
- **Resume**: Parsed resume structured JSON (experience, skills, education), raw Cloudinary asset URL, and versions.
- **JobApplication**: Applied role, company, job description, Kanban status, match score, and timeline updates.
- **InterviewSession**: Generated questions, user responses, AI scoring, and improvement feedback.
- **Transaction / Subscription**: Payment IDs, plan active status, Razorpay webhook logs.

---

## 🚢 Deployment Guide

- **Client (Frontend):** Recommended deployment on [Vercel](https://vercel.com).
  - Framework Preset: `Next.js`
  - Root Directory: `client`
- **Server (Backend):** Recommended deployment on [Railway](https://railway.app) or [Render](https://render.com).
  - Root Directory: `server`
  - Build Command: `npm run build`
  - Start Command: `npm run start`
- **Database & Cache:** MongoDB Atlas for production DB; Upstash / Redis Cloud for Redis queues and caching.

---

## 📜 License
This project is proprietary and intended for career acceleration and job search optimization.
