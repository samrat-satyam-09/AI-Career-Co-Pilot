# AI Career Co-Pilot — Full Implementation Plan
### (Handoff document for agentic IDE — e.g. Antigravity / Claude Code / Cursor)

> **Instructions for the AI agent executing this plan:**
> Build this project module-by-module, in the exact phase order given below. Do NOT skip API endpoints — the minimum count per module is fixed and must be implemented in full before moving to the next phase. Each API must include: input validation, auth middleware (where marked 🔒), error handling via a central `ErrorHandler`, and consistent JSON response shape `{ success, data, message }`. Use the tech stack specified — do not substitute unless explicitly told.

---

## 1. Tech Stack (fixed — do not change)

**Frontend:** Next.js 15 (App Router), TypeScript, Redux Toolkit + RTK Query, Tailwind CSS v4, Framer Motion
**Backend:** Node.js + Express, TypeScript, MongoDB + Mongoose, Redis (caching + rate limiting), JWT (access + refresh)
**AI Layer:** LLM router with fallback chain — Primary: Gemini 1.5 Flash / Groq Llama-3.1 (free-tier tasks), Secondary: OpenAI GPT-4o-mini or Claude Haiku (paid-tier tasks), these things must be handled by Admin panel
**Payments:** Razorpay (Subscriptions + Webhooks)
**Infra:** MongoDB Atlas, Redis Cloud/Upstash, Backend on Railway/Render, Frontend on Vercel
**Others:** Nodemailer (emails), Cloudinary (file storage — resumes/avatars), BullMQ (background jobs — resume parsing, email queue), Zod (validation)

---

## 2. Module List with FIXED Minimum API Counts

| # | Module | Minimum APIs |
|---|--------|:---:|
| 1 | Auth & User Management | 10 |
| 2 | Resume Management | 8 |
| 3 | AI Core (JD Matching / Tailoring / Cover Letter) | 8 |
| 4 | Job Application Tracker | 10 |
| 5 | Mock Interview Agent | 8 |
| 6 | Subscription & Payments | 6 |
| 7 | Admin & Analytics | 5 |
| 8 | Notifications | 4 |
| | **TOTAL** | **59** |

⚠️ **This distribution is final.** Each module must ship with at least this many endpoints. Extra utility endpoints (health check, etc.) don't count toward this total.

---

## 3. Database Schema (MongoDB / Mongoose)

### `User`
```
{
  name, email (unique), password (hashed), avatar { public_id, url },
  authProvider: enum[local, google, github],
  role: enum[user, admin],
  subscription: { plan: enum[free, pro], razorpayCustomerId, razorpaySubscriptionId, status, currentPeriodEnd },
  usage: { resumeTailorsThisMonth, mockInterviewsThisMonth, resetDate },
  isVerified, otp, otpExpiry,
  refreshToken,
  createdAt, updatedAt
}
```
### `Resume`
```
{
  user: ObjectId(ref User),
  title,
  isPrimary: boolean,
  rawFileUrl (Cloudinary),
  parsedData: { name, email, phone, summary, skills[], experience[], education[], projects[], certifications[] },
  versions: [{ versionNumber, tailoredForApplication: ObjectId(ref JobApplication), content, atsScore, createdAt }],
  createdAt, updatedAt
}
```

### `JobApplication`
```
{
  user: ObjectId(ref User),
  company, role, jdText, jdUrl,
  status: enum[wishlist, applied, oa, interview, offer, rejected],
  resumeVersionUsed: ObjectId,
  coverLetter: String,
  matchScore: Number,
  skillGaps: [String],
  appliedDate, followUpDate,
  notes: [{ text, createdAt }],
  timeline: [{ status, changedAt }],
  createdAt, updatedAt
}
```

### `InterviewSession`
```
{
  user: ObjectId(ref User),
  targetRole, targetCompany, difficulty: enum[easy, medium, hard],
  type: enum[dsa, hr, system-design, behavioral],
  questions: [{ question, userAnswer, aiFeedback, score }],
  overallFeedback, overallScore,
  status: enum[in-progress, completed],
  createdAt, updatedAt
}
```

### `Subscription` (mirrors Razorpay, optional separate collection for audit)
```
{ user, razorpaySubscriptionId, plan, status, startDate, endDate, invoices: [{ id, amount, date, status }] }
```

### `Notification`
```
{ user, type, title, message, isRead, link, createdAt } etc.
```

---

## 4. Phase-by-Phase Plan

---

### **PHASE 0 — Project Setup (Day 1-2)**
- Init monorepo: `client/` (Next.js 15) + `server/` (Express + TS)
- Configure ESLint, Prettier, TS strict mode
- Setup MongoDB Atlas connection, Redis connection
- Setup `.env` structure for both client/server
- Central `ErrorHandler` class + `catchAsyncErrors` wrapper
- Setup Winston/Morgan logging
- Setup Zod schemas folder for validation
- Git repo + branch strategy (`main`, `dev`, `feature/*`)

**Deliverable:** Empty but connected full-stack skeleton, health-check endpoint working.

---

### **PHASE 1 — Auth & User Management Module (10 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 1 | POST | `/api/v1/auth/register` | ❌ | Register with email/password, send OTP |
| 2 | POST | `/api/v1/auth/verify-otp` | ❌ | Verify OTP, activate account |
| 3 | POST | `/api/v1/auth/resend-otp` | ❌ | Resend OTP (rate-limited via Redis) |
| 4 | POST | `/api/v1/auth/login` | ❌ | Login, issue access + refresh token (httpOnly cookie) |
| 5 | GET | `/api/v1/auth/logout` | 🔒 | Clear refresh token cookie, invalidate in DB |
| 6 | GET | `/api/v1/auth/refresh-token` | ❌ (cookie) | Issue new access token from refresh token |
| 7 | POST | `/api/v1/auth/forgot-password` | ❌ | Send password reset link/OTP |
| 8 | PUT | `/api/v1/auth/reset-password/:token` | ❌ | Reset password |
| 9 | GET | `/api/v1/auth/google` + `/api/v1/auth/google/callback` | ❌ | Google OAuth flow |
| 10 | GET | `/api/v1/auth/github` + `/api/v1/auth/github/callback` | ❌ | GitHub OAuth flow |

**Bonus (recommended, not counted in 10):** `GET /api/v1/users/me` 🔒, `PUT /api/v1/users/me` 🔒, `PUT /api/v1/users/avatar` 🔒

**Key implementation notes:**
- Access token: 15 min expiry, in memory/Redux state only
- Refresh token: 7 day expiry, httpOnly + secure cookie
- OTP: 6-digit, 5 min expiry, stored hashed in Redis (not Mongo) to avoid DB writes on every retry
- Rate limit OTP resend: max 3 per 10 min per email (Redis)

---

### **PHASE 2 — Resume Management Module (8 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 11 | POST | `/api/v1/resumes/upload` | 🔒 | Upload raw resume (PDF/DOCX) to Cloudinary |
| 12 | POST | `/api/v1/resumes/parse` | 🔒 | Parse uploaded resume into structured JSON (via LLM or `pdf-parse`/`mammoth`) |
| 13 | POST | `/api/v1/resumes` | 🔒 | Create resume manually (no upload, builder UI) |
| 14 | GET | `/api/v1/resumes` | 🔒 | List all resumes of logged-in user |
| 15 | GET | `/api/v1/resumes/:id` | 🔒 | Get single resume detail |
| 16 | PUT | `/api/v1/resumes/:id` | 🔒 | Update resume content |
| 17 | DELETE | `/api/v1/resumes/:id` | 🔒 | Delete a resume |
| 18 | PUT | `/api/v1/resumes/:id/set-primary` | 🔒 | Mark resume as primary/default |

**Key implementation notes:**
- Use `pdf-parse` for PDF, `mammoth` for DOCX text extraction, then pass extracted text to LLM with a structured JSON-output prompt to populate `parsedData`
- Version history stored as sub-array inside `Resume.versions` — do NOT create separate collection (keep it denormalized for read speed)
- Cache parsed resume in Redis (`resume:{id}`) with 1hr TTL, invalidate on update

---

### **PHASE 3 — AI Core Module (8 APIs)** — Core Differentiator

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 19 | POST | `/api/v1/ai/analyze-jd` | 🔒 | Paste JD text → extract required skills, seniority, keywords |
| 20 | POST | `/api/v1/ai/match-score` | 🔒 | Compare resume vs JD → return match % + skill gaps |
| 21 | POST | `/api/v1/ai/tailor-resume` | 🔒 | Generate JD-tailored resume version (creates new `Resume.versions` entry) |
| 22 | POST | `/api/v1/ai/ats-score` | 🔒 | Score resume for ATS-friendliness (formatting + keyword density) |
| 23 | POST | `/api/v1/ai/generate-cover-letter` | 🔒 | Generate cover letter from resume + JD |
| 24 | POST | `/api/v1/ai/skill-gap-suggestions` | 🔒 | Suggest courses/resources to close skill gaps |
| 25 | POST | `/api/v1/ai/chat` | 🔒 | Freeform AI career-advice chat (SSE streaming) |
| 26 | GET | `/api/v1/ai/usage` | 🔒 | Return remaining free-tier AI usage this month |

**Key implementation notes:**
- Build an `llmRouter.ts` utility: `callLLM(prompt, { tier: 'free' | 'pro' })` — routes free tier to Gemini Flash/Groq, pro tier to GPT-4o-mini/Claude Haiku. Wrap with try/catch fallback chain (same pattern as your MAYA 2.0 Gemini→Groq→Ollama fallback).
- All prompts must force strict JSON output for #19, #20, #22 (use a system prompt like "Respond ONLY with valid JSON, no markdown fences").
- Middleware `checkUsageLimit` 🔒 before every AI route — decrements `User.usage.resumeTailorsThisMonth`, blocks if free-tier limit hit, returns 402-style custom error prompting upgrade.
- Cache `analyze-jd` results in Redis keyed by hash of JD text (many users paste the same JD) — cuts LLM cost significantly.
- `/ai/chat` uses SSE streaming (same pattern you already built in Soft Coding's AI chat).

---

### **PHASE 4 — Job Application Tracker Module (10 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 27 | POST | `/api/v1/applications` | 🔒 | Create new application entry |
| 28 | GET | `/api/v1/applications` | 🔒 | List all applications (filter by status, company, query params) |
| 29 | GET | `/api/v1/applications/:id` | 🔒 | Get single application detail |
| 30 | PUT | `/api/v1/applications/:id` | 🔒 | Update application (JD, notes, dates) |
| 31 | PATCH | `/api/v1/applications/:id/status` | 🔒 | Update status (drives Kanban drag-drop), appends to timeline |
| 32 | DELETE | `/api/v1/applications/:id` | 🔒 | Delete application |
| 33 | POST | `/api/v1/applications/:id/notes` | 🔒 | Add a note to application |
| 34 | GET | `/api/v1/applications/stats/summary` | 🔒 | Dashboard stats (counts per status, this week's applied count) — Redis cached |
| 35 | GET | `/api/v1/applications/upcoming-followups` | 🔒 | List applications with followUpDate <= today+3 |
| 36 | POST | `/api/v1/applications/bulk-import` | 🔒 | CSV/JSON bulk import of applications |

**Key implementation notes:**
- Kanban statuses: `wishlist → applied → oa → interview → offer/rejected` — enforce valid transitions server-side
- `stats/summary` cached in Redis (`stats:{userId}`), invalidate on any status change (same invalidation pattern as your GrowthUpSkills course-edit cache fix)
- `timeline` array auto-appends whenever status changes — gives user an audit trail without extra API

---

### **PHASE 5 — Mock Interview Agent Module (8 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 37 | POST | `/api/v1/interviews` | 🔒 | Start new session (role, company, type, difficulty) |
| 38 | GET | `/api/v1/interviews` | 🔒 | List past sessions |
| 39 | GET | `/api/v1/interviews/:id` | 🔒 | Get session detail + transcript |
| 40 | POST | `/api/v1/interviews/:id/next-question` | 🔒 | AI generates next question based on role/history |
| 41 | POST | `/api/v1/interviews/:id/submit-answer` | 🔒 | Submit answer text → AI scores + gives feedback |
| 42 | POST | `/api/v1/interviews/:id/complete` | 🔒 | End session → generate overall feedback report |
| 43 | DELETE | `/api/v1/interviews/:id` | 🔒 | Delete session |
| 44 | POST | `/api/v1/interviews/:id/voice-answer` | 🔒 | (v2) Upload audio → STT (Groq Whisper) → same scoring pipeline as #41 |

**Key implementation notes:**
- v1 = text-only Q&A (ship first). v2 = plug in Groq Whisper STT + Edge TTS exactly like MAYA 2.0's voice pipeline — same libraries, direct reuse.
- Question generation prompt must take previous Q&A in the session as context so questions progressively increase difficulty (adaptive interview).
- Score rubric: correctness, clarity, depth — LLM returns structured `{ score, feedback }` JSON per answer.

---

### **PHASE 6 — Subscription & Payments Module (6 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 45 | GET | `/api/v1/subscriptions/plans` | ❌ | List available plans (Free/Pro/pricing) |
| 46 | POST | `/api/v1/subscriptions/checkout-session` | 🔒 | Create Stripe Checkout session |
| 47 | POST | `/api/v1/subscriptions/webhook` | ❌ (Stripe signature verified) | Stripe webhook — handle `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` |
| 48 | GET | `/api/v1/subscriptions/me` | 🔒 | Get current user's subscription status |
| 49 | POST | `/api/v1/subscriptions/cancel` | 🔒 | Cancel subscription (at period end) |
| 50 | GET | `/api/v1/subscriptions/invoices` | 🔒 | List past invoices |

**Key implementation notes:**
- Reuse your GrowthUpSkills fix: reset `clientSecret`/session state properly on modal close to avoid stale PaymentIntent bugs.
- Webhook route needs raw body parser (`express.raw()`), NOT `express.json()` — mount it before global JSON middleware.
- On successful payment, webhook updates `User.subscription` AND resets `usage` counters for pro-tier limits.

---

### **PHASE 7 — Admin & Analytics Module (5 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 51 | GET | `/api/v1/admin/users` | 🔒 Admin | List/search all users, paginated |
| 52 | PUT | `/api/v1/admin/users/:id/role` | 🔒 Admin | Promote/demote user role |
| 53 | GET | `/api/v1/admin/analytics/overview` | 🔒 Admin | Total users, MRR, active subs, AI calls today |
| 54 | GET | `/api/v1/admin/analytics/usage-trends` | 🔒 Admin | Time-series of signups/AI usage (for charts) |
| 55 | DELETE | `/api/v1/admin/users/:id` | 🔒 Admin | Soft-delete/ban a user |

---

### **PHASE 8 — Notifications Module (4 APIs)**

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|:---:|---|
| 56 | GET | `/api/v1/notifications` | 🔒 | List notifications (paginated) |
| 57 | PATCH | `/api/v1/notifications/:id/read` | 🔒 | Mark single notification read |
| 58 | PATCH | `/api/v1/notifications/read-all` | 🔒 | Mark all as read |
| 59 | POST | `/api/v1/notifications/preferences` | 🔒 | Update email/push notification preferences |

**Key implementation notes:**
- Use BullMQ + Redis to queue: OTP emails, follow-up reminder emails (from Phase 4's `upcoming-followups`), subscription receipts.
- Reuse your existing dark-themed EJS email template pattern from GrowthUpSkills/Soft Coding for consistency.

---

## 5. Frontend Build Order (maps to backend phases)

1. Auth pages (login/register/OTP/OAuth buttons) + protected route wrapper
2. Dashboard shell (sidebar nav, RTK Query base API setup with `baseQuery` + auto refresh-token retry)
3. Resume builder/upload UI + version diff viewer
4. JD-paste screen → match score + tailor button → tailored resume preview
5. Kanban board for applications (drag-drop using `@dnd-kit` or `react-beautiful-dnd`)
6. Mock interview chat-style UI with timer per question
7. Pricing page + Stripe Checkout redirect + billing portal
8. Admin dashboard (charts via `recharts`)
9. Notification bell dropdown

Use your custom Tailwind breakpoints (`400,500,600,700,800,900,1000,1100,1200,1300,1500px`) alongside standard ones, consistent with your GrowthUpSkills setup. Use `React.use(params)` for client components / `await params` for server components (Next.js 15 pattern).

---

## 6. Folder Structure (server)

```
server/
├── src/
│   ├── config/          # db.ts, redis.ts, cloudinary.ts, stripe.ts
│   ├── models/           # User, Resume, JobApplication, InterviewSession, Notification
│   ├── controllers/      # one per module
│   ├── routes/           # one per module
│   ├── middlewares/      # auth.ts, checkUsageLimit.ts, errorHandler.ts, rateLimiter.ts
│   ├── services/         # llmRouter.ts, resumeParser.ts, emailService.ts, stripeService.ts
│   ├── utils/            # ApiResponse.ts, catchAsyncErrors.ts, jwt.ts
│   ├── validators/       # zod schemas per module
│   └── app.ts / server.ts
```

## 7. Folder Structure (client)

```
client/
├── app/                  # Next.js 15 App Router
│   ├── (auth)/
│   ├── (dashboard)/
│   │   ├── resumes/
│   │   ├── applications/
│   │   ├── interviews/
│   │   └── billing/
├── redux/
│   ├── store.ts
│   └── api/              # one RTK Query api slice per module
├── components/
└── lib/
```

---

## 8. Execution Order Summary (give this to the agentic IDE as the literal task queue)

1. Phase 0 — scaffold + config
2. Phase 1 — Auth (10 APIs) + auth UI
3. Phase 2 — Resume Management (8 APIs) + resume UI
4. Phase 3 — AI Core (8 APIs) + JD/tailor UI
5. Phase 4 — Application Tracker (10 APIs) + Kanban UI
6. Phase 5 — Mock Interview (8 APIs) + interview UI
7. Phase 6 — Payments (6 APIs) + pricing/billing UI
8. Phase 7 — Admin & Analytics (5 APIs) + admin UI
9. Phase 8 — Notifications (4 APIs) + notification UI
10. Final — integration testing, rate-limit audit, deploy (Vercel + Railway/Render + Atlas + Upstash)

**Total APIs: 59** (exceeds the 55 minimum requirement)

---

## 9. Non-negotiable engineering standards for every phase

- Every mutating route validated with Zod before hitting controller
- Every route wrapped in `catchAsyncErrors`, errors go through central `ErrorHandler` middleware
- Every 🔒 route passes through `isAuthenticated` middleware; admin routes additionally pass `authorizeRoles("admin")`
- Every list endpoint supports pagination (`page`, `limit` query params)
- Every LLM-calling endpoint respects `checkUsageLimit` and logs token usage for cost tracking
- Redis used for: OTP storage, rate limiting, dashboard stat caching, JD-analysis caching — invalidate explicitly on writes, never rely on TTL alone for correctness-critical data
