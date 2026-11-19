const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

async function generateReport() {
  console.log("Generating Newspaper-Style Project Report PDF (White Background, Serif Typography)...");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Career Co-Pilot — Project Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,400;1,700&family=Cinzel:wght@600;700;800;900&display=swap');

    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
      @bottom-center {
        content: "Page " counter(page);
        font-family: 'Merriweather', Georgia, serif;
        font-size: 9pt;
        color: #555555;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
      color: #111111;
      background: #ffffff;
      line-height: 1.75;
      font-size: 11pt;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }

    /* Newspaper Cover Page (Pure White BG) */
    .cover-page {
      page-break-after: always;
      height: 100%;
      background: #ffffff;
      color: #111111;
      padding: 20px 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px double #111111;
      padding: 40px;
      min-h-[90vh];
    }

    .masthead-header {
      text-align: center;
      border-bottom: 1px solid #111111;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }

    .masthead-issue {
      font-family: 'Cinzel', serif;
      font-size: 9pt;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #444444;
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #111111;
      padding-bottom: 4px;
      margin-bottom: 15px;
    }

    .masthead-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 38pt;
      font-weight: 900;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #111111;
      line-height: 1.05;
      margin-bottom: 6px;
    }

    .masthead-subtitle {
      font-family: 'Merriweather', serif;
      font-size: 11pt;
      font-style: italic;
      color: #333333;
    }

    .double-rule {
      border-top: 3px double #111111;
      margin: 25px 0;
    }

    .cover-main-article {
      margin: 30px 0;
      text-align: justify;
    }

    .article-headline {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24pt;
      font-weight: 800;
      line-height: 1.2;
      color: #111111;
      margin-bottom: 14px;
      text-align: left;
    }

    .article-lead {
      font-size: 12pt;
      line-height: 1.8;
      color: #222222;
      font-weight: 400;
      text-align: justify;
      text-justify: inter-word;
      margin-bottom: 20px;
    }

    .first-letter::first-letter {
      font-family: 'Playfair Display', serif;
      font-size: 42pt;
      float: left;
      line-height: 0.8;
      padding-right: 8px;
      padding-top: 4px;
      font-weight: 900;
      color: #111111;
    }

    .cover-footer {
      border-top: 1px solid #111111;
      padding-top: 20px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      text-align: left;
    }

    .meta-box {
      border-left: 2px solid #111111;
      padding-left: 12px;
    }

    .meta-label {
      font-family: 'Cinzel', serif;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #555555;
      font-weight: 700;
    }

    .meta-value {
      font-family: 'Merriweather', serif;
      font-size: 10pt;
      font-weight: 700;
      color: #111111;
      margin-top: 2px;
    }

    /* Inside Pages */
    .page-header {
      border-bottom: 2px solid #111111;
      padding-bottom: 6px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .page-header-title {
      font-family: 'Cinzel', serif;
      font-size: 12pt;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #111111;
    }

    .page-header-meta {
      font-family: 'Merriweather', serif;
      font-size: 9pt;
      font-style: italic;
      color: #555555;
    }

    h2.section-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 18pt;
      font-weight: 800;
      color: #111111;
      border-bottom: 2px solid #111111;
      padding-bottom: 4px;
      margin-top: 25px;
      margin-bottom: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    h3.sub-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 13pt;
      font-weight: 700;
      color: #111111;
      margin-top: 18px;
      margin-bottom: 8px;
      border-left: 3px solid #111111;
      padding-left: 8px;
    }

    p {
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
      margin-bottom: 14px;
      color: #222222;
      font-size: 10.5pt;
    }

    /* Two-column Editorial Section */
    .columns-2 {
      column-count: 2;
      column-gap: 24px;
      column-rule: 1px solid #e0e0e0;
      margin-bottom: 20px;
    }

    .columns-2 p {
      margin-bottom: 12px;
    }

    /* Clean Newspaper Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      margin-bottom: 20px;
      font-size: 9.5pt;
    }

    th {
      font-family: 'Cinzel', serif;
      background: #ffffff;
      color: #111111;
      font-weight: 800;
      text-align: left;
      padding: 8px 10px;
      border-top: 2px solid #111111;
      border-bottom: 2px solid #111111;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 8.5pt;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #dddddd;
      color: #222222;
      text-align: left;
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: 2px solid #111111;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 1px 6px;
      border: 1px solid #111111;
      font-family: 'Cinzel', serif;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      background: #ffffff;
      color: #111111;
    }

    code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9.5pt;
      background: #f5f5f5;
      padding: 1px 4px;
      border: 1px solid #e0e0e0;
      color: #111111;
    }

    ul, ol {
      padding-left: 22px;
      margin-bottom: 14px;
      text-align: justify;
    }

    li {
      margin-bottom: 6px;
      color: #222222;
      font-size: 10.5pt;
    }

    .page-break {
      page-break-after: always;
    }

    .quote-box {
      border-top: 2px solid #111111;
      border-bottom: 2px solid #111111;
      padding: 14px 20px;
      margin: 20px 0;
      font-style: italic;
      text-align: center;
      font-size: 12pt;
      font-family: 'Playfair Display', Georgia, serif;
      color: #111111;
    }
  </style>
</head>
<body>

  <!-- NEWSPAPER COVER PAGE (PURE WHITE BG) -->
  <div class="cover-page">
    <div>
      <div class="masthead-issue">
        <span>TECHNICAL DOCUMENTATION & REPORT</span>
        <span>VOL. 1 • EDITION 2026</span>
        <span>SPECIAL EDITION</span>
      </div>

      <div class="masthead-header">
        <h1 class="masthead-title">AI Career Co-Pilot</h1>
        <p class="masthead-subtitle">The Engineering & Architectural Standard for Next-Generation Career Intelligence</p>
      </div>

      <div class="double-rule"></div>

      <div class="cover-main-article">
        <h2 class="article-headline">Comprehensive Full-Stack Software Project & Systems Report</h2>
        <p class="article-lead first-letter">
          The job search ecosystem is undergoing a fundamental transformation driven by artificial intelligence, automated applicant tracking systems (ATS), and hyper-personalized career management tools. AI Career Co-Pilot has been architected and built to empower professionals with an integrated suite of intelligent services: real-time resume tailoring against target Job Descriptions, ATS match scoring, custom cover letter synthesis, interactive mock interview simulations, and Kanban-style job application tracking.
        </p>
        <p class="article-lead">
          This comprehensive project report documents the complete engineering implementation of AI Career Co-Pilot—covering frontend Next.js 16 App Router architecture, Express.js microservice APIs, MongoDB Atlas database design, Redis rate-limiting, and high-fidelity Puppeteer PDF document rendering engines.
        </p>
      </div>
    </div>

    <div>
      <div class="quote-box">
        &ldquo;Building scalable, production-grade AI platforms requiring precision, security, and exceptional visual design.&rdquo;
      </div>

      <div class="cover-footer">
        <div class="meta-box">
          <div class="meta-label">Project Name</div>
          <div class="meta-value">AI Career Co-Pilot</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Technology Stack</div>
          <div class="meta-value">Next.js 16 • Express • TS • MongoDB</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Date of Issue</div>
          <div class="meta-value">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 2: EXECUTIVE SUMMARY & ARCHITECTURE -->
  <div class="page-header">
    <span class="page-header-title">AI Career Co-Pilot — System Report</span>
    <span class="page-header-meta">Section 1: Architecture</span>
  </div>

  <h2 class="section-heading">1. Executive Summary & Systems Architecture</h2>

  <p>
    <strong>AI Career Co-Pilot</strong> is an end-to-end software platform engineered to streamline and accelerate the job search process for candidates. By combining high-performance modern web stacks with artificial intelligence algorithms, the system allows job seekers to construct ATS-optimized resumes, tailor content for specific target roles, analyze skill gaps, generate customized cover letters, and track applications through an intuitive Kanban interface.
  </p>

  <h3 class="sub-heading">1.1 High-Level Architecture Overview</h3>
  <div class="columns-2">
    <p>
      <strong>Frontend Layer</strong>: Developed using Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. State management is structured with Redux Toolkit and RTK Query, providing automatic API caching, optimistic UI updates, and server session re-hydration.
    </p>
    <p>
      <strong>Backend Service Layer</strong>: Built on Node.js v24, Express.js, and TypeScript. Implements strict domain-driven controller separation, Zod payload validation, and centralized error handling middleware (<code>ApiResponse</code> & <code>ErrorHandler</code>).
    </p>
    <p>
      <strong>Database & Cache Tier</strong>: Uses MongoDB Atlas with Mongoose ORM configured for high-availability replica set connections, alongside Redis for rate limiting and BullMQ queue management.
    </p>
    <p>
      <strong>Document & Media Engine</strong>: Employs headless Puppeteer for server-side HTML-to-PDF rendering, the <code>docx</code> library for Word document packing, and Cloudinary for secure file storage.
    </p>
  </div>

  <h3 class="sub-heading">1.2 System Specification Matrix</h3>
  <table>
    <thead>
      <tr>
        <th>Architectural Layer</th>
        <th>Technologies Implemented</th>
        <th>Technical Function & Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Client UI Layer</strong></td>
        <td>Next.js 16, React 19, Tailwind CSS v4</td>
        <td>Server/Client components, responsive layout, glassmorphic styling</td>
      </tr>
      <tr>
        <td><strong>State & API Client</strong></td>
        <td>Redux Toolkit, RTK Query</td>
        <td>Global auth state, API caching, tag-based cache invalidation</td>
      </tr>
      <tr>
        <td><strong>Backend REST API</strong></td>
        <td>Express.js, Node.js v24, TypeScript</td>
        <td>HTTP route handlers, request validation, global error middleware</td>
      </tr>
      <tr>
        <td><strong>Database & Cache</strong></td>
        <td>MongoDB Atlas, Redis 7, BullMQ</td>
        <td>Relational document schema, session caching, job queue management</td>
      </tr>
      <tr>
        <td><strong>Media & Document Engine</strong></td>
        <td>Puppeteer, docx, Cloudinary</td>
        <td>Headless A4 PDF compilation, native DOCX generation, raw file storage</td>
      </tr>
      <tr>
        <td><strong>Security Subsystem</strong></td>
        <td>JWT, Passport.js, Helmet, Rate-Limit</td>
        <td>HTTP-only refresh cookies, OAuth 2.0 (Google/GitHub), DDoS defense</td>
      </tr>
      <tr>
        <td><strong>Payment & Webhooks</strong></td>
        <td>Razorpay SDK, Smee.io Tunneling</td>
        <td>Subscription checkout flows, HMAC signature verification</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- PAGE 3: DETAILED MODULE IMPLEMENTATION -->
  <div class="page-header">
    <span class="page-header-title">AI Career Co-Pilot — System Report</span>
    <span class="page-header-meta">Section 2: Modules</span>
  </div>

  <h2 class="section-heading">2. Module Implementation Specifications</h2>

  <h3 class="sub-heading">2.1 Authentication & Security Infrastructure (Phase 1)</h3>
  <p>
    The authentication framework is built around a secure dual-token architecture designed to maintain persistent sessions without exposing sensitive access tokens in client storage:
  </p>
  <ul>
    <li><strong>Dual-Token Flow</strong>: Short-lived access tokens (15 minutes) held in application memory, paired with long-lived refresh tokens (7 days) stored in <code>HTTP-only, SameSite=Strict</code> cookies.</li>
    <li><strong>Social OAuth 2.0 Integration</strong>: Configured Passport.js Google and GitHub authentication strategies with automatic account linking.</li>
    <li><strong>OTP Email Verification</strong>: Cryptographically secure 6-digit one-time password generation backed by Nodemailer transactional HTML email delivery.</li>
    <li><strong>Rate Limiting & Defense</strong>: Strict rate limiting powered by Redis to guard against brute-force attacks on login, registration, and reset endpoints.</li>
  </ul>

  <h3 class="sub-heading">2.2 Resume Management & Document Engine (Phase 2)</h3>
  <p>
    The resume management system provides full document lifecycle capabilities—from raw upload to structured interactive editing and multi-format document generation.
  </p>
  <table>
    <thead>
      <tr>
        <th>API Route</th>
        <th>Method</th>
        <th>Functional Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>/api/v1/resumes</code></td>
        <td><span class="badge">GET</span></td>
        <td>Retrieve all resumes associated with the logged-in account.</td>
      </tr>
      <tr>
        <td><code>/api/v1/resumes/:id</code></td>
        <td><span class="badge">GET</span></td>
        <td>Fetch complete parsed data structure and version history.</td>
      </tr>
      <tr>
        <td><code>/api/v1/resumes</code></td>
        <td><span class="badge">POST</span></td>
        <td>Create new resume from scratch with subscription plan checks.</td>
      </tr>
      <tr>
        <td><code>/api/v1/resumes/upload</code></td>
        <td><span class="badge">POST</span></td>
        <td>Upload raw PDF/DOCX to Cloudinary and extract text contents.</td>
      </tr>
      <tr>
        <td><code>/api/v1/resumes/:id/export/pdf</code></td>
        <td><span class="badge">GET</span></td>
        <td>Compile resume into print-ready A4 PDF via Puppeteer.</td>
      </tr>
      <tr>
        <td><code>/api/v1/resumes/:id/export/docx</code></td>
        <td><span class="badge">GET</span></td>
        <td>Pack resume data into native Microsoft Word (.docx) format.</td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub-heading">2.3 User Interface Engineering Highlights</h3>
  <ul>
    <li><strong>Smart Collapsible Sidebar</strong>: Default expanded state (width: 256px), with collapse toggle button and automatic hover overlay expansion.</li>
    <li><strong>Real-time Dirty Form Detection</strong>: Resume editor tracks unsaved state changes and displays a floating save bar with instant Save and Discard triggers.</li>
    <li><strong>Multi-Tab Section Builder</strong>: Tabbed editing across Basic Info, Experience, Education, Projects, Skills, and Version History.</li>
    <li><strong>Responsive Newspaper & Modern Themes</strong>: CSS custom property design system supporting high-contrast light and dark modes.</li>
  </ul>

  <div class="page-break"></div>

  <!-- PAGE 4: DATABASE & CONCLUSION -->
  <div class="page-header">
    <span class="page-header-title">AI Career Co-Pilot — System Report</span>
    <span class="page-header-meta">Section 3: Data & Conclusion</span>
  </div>

  <h2 class="section-heading">3. Data Model Design & Project Conclusion</h2>

  <h3 class="sub-heading">3.1 Core Database Schemas</h3>
  <table>
    <thead>
      <tr>
        <th>Mongoose Schema</th>
        <th>Primary Fields & Relations</th>
        <th>Database Indexing Strategy</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>UserSchema</strong></td>
        <td><code>name, email, password, role, isVerified, avatar, subscription</code></td>
        <td>Unique index on <code>email</code></td>
      </tr>
      <tr>
        <td><strong>ResumeSchema</strong></td>
        <td><code>user (Ref: User), title, isPrimary, rawFileUrl, parsedData, versions</code></td>
        <td>Compound index on <code>{ user: 1, isPrimary: 1 }</code></td>
      </tr>
      <tr>
        <td><strong>JobApplicationSchema</strong></td>
        <td><code>user, company, role, status, resumeUsed, salary, notes, appliedDate</code></td>
        <td>Index on <code>{ user: 1, status: 1 }</code></td>
      </tr>
      <tr>
        <td><strong>InterviewSessionSchema</strong></td>
        <td><code>user, type, difficulty, questions, overallScore, feedback</code></td>
        <td>Index on <code>{ user: 1, createdAt: -1 }</code></td>
      </tr>
      <tr>
        <td><strong>SubscriptionSchema</strong></td>
        <td><code>user, plan, status, razorpaySubscriptionId, limits</code></td>
        <td>Index on <code>{ user: 1, status: 1 }</code></td>
      </tr>
    </tbody>
  </table>

  <h3 class="sub-heading">3.2 Technical Conclusion & Verification</h3>
  <p>
    The <strong>AI Career Co-Pilot</strong> platform has been verified for production readiness across backend and frontend environments. Both server REST endpoints and client Next.js routes function seamlessly with clean code organization, robust security controls, and high-quality serif presentation standards.
  </p>

  <div class="quote-box">
    &ldquo;End of Official Engineering Project Report — AI Career Co-Pilot v1.0.0&rdquo;
  </div>

</body>
</html>
  `;

  // Launch Puppeteer to create PDF using system Edge/Chrome
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(edgePath) ? edgePath : undefined,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const outputPath = path.resolve(__dirname, "../../AI_Career_CoPilot_Project_Report.pdf");

    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
    });

    console.log(`✅ Newspaper-Style Project Report PDF generated successfully at: ${outputPath}`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    await browser.close();
  }
}

generateReport();
