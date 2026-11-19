import puppeteer from "puppeteer";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { IResume } from "../models/Resume";

/**
 * Generate clean HTML representation of a resume for PDF rendering
 */
export function generateResumeHTML(resume: IResume): string {
  const data = resume.parsedData || {};
  const name = data.name || "Resume";
  const email = data.email || "";
  const phone = data.phone || "";
  const summary = data.summary || "";
  const skills = data.skills || [];
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1a1a1a;
      line-height: 1.5;
      padding: 40px;
      background: #ffffff;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid #00be50;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .name {
      font-size: 26px;
      font-weight: 800;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .contact-info {
      margin-top: 6px;
      color: #4b5563;
      font-size: 12px;
      display: flex;
      gap: 16px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      color: #00be50;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 12px;
    }
    .summary {
      color: #374151;
      line-height: 1.6;
    }
    .item {
      margin-bottom: 12px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .item-title {
      font-weight: 700;
      font-size: 13px;
      color: #111827;
    }
    .item-sub {
      font-weight: 600;
      color: #4b5563;
    }
    .item-date {
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
    }
    .item-desc {
      margin-top: 4px;
      color: #374151;
      white-space: pre-line;
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .skill-badge {
      background: #f3f4f6;
      color: #1f2937;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      border: 1px solid #e5e7eb;
    }
    ul {
      padding-left: 18px;
      margin-top: 4px;
    }
    li {
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${name}</div>
    <div class="contact-info">
      ${email ? `<span>✉ ${email}</span>` : ""}
      ${phone ? `<span>📞 ${phone}</span>` : ""}
    </div>
  </div>

  ${
    summary
      ? `
    <div class="section-title">Professional Summary</div>
    <div class="summary">${summary}</div>
  `
      : ""
  }

  ${
    experience.length > 0
      ? `
    <div class="section-title">Work Experience</div>
    ${experience
      .map(
        (exp) => `
      <div class="item">
        <div class="item-header">
          <div><span class="item-title">${exp.role}</span> <span class="item-sub">| ${exp.company}</span></div>
          <div class="item-date">${exp.duration}</div>
        </div>
        <div class="item-desc">${exp.description}</div>
      </div>
    `,
      )
      .join("")}
  `
      : ""
  }

  ${
    education.length > 0
      ? `
    <div class="section-title">Education</div>
    ${education
      .map(
        (edu) => `
      <div class="item">
        <div class="item-header">
          <div><span class="item-title">${edu.degree}</span> <span class="item-sub">(${edu.institution})</span></div>
          <div class="item-date">${edu.year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ""}</div>
        </div>
      </div>
    `,
      )
      .join("")}
  `
      : ""
  }

  ${
    projects.length > 0
      ? `
    <div class="section-title">Projects</div>
    ${projects
      .map(
        (proj) => `
      <div class="item">
        <div class="item-header">
          <span class="item-title">${proj.name}</span>
          ${proj.link ? `<span class="item-date">${proj.link}</span>` : ""}
        </div>
        <div class="item-desc">${proj.description}</div>
        ${
          proj.technologies && proj.technologies.length > 0
            ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">Tech: ${proj.technologies.join(", ")}</div>`
            : ""
        }
      </div>
    `,
      )
      .join("")}
  `
      : ""
  }

  ${
    skills.length > 0
      ? `
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${skills.map((s) => `<span class="skill-badge">${s}</span>`).join("")}
    </div>
  `
      : ""
  }

  ${
    certifications.length > 0
      ? `
    <div class="section-title">Certifications</div>
    <ul>
      ${certifications.map((c) => `<li>${c}</li>`).join("")}
    </ul>
  `
      : ""
  }
</body>
</html>
  `;
}

/**
 * Export Resume to PDF using Puppeteer
 */
export async function exportResumeToPDF(resume: IResume): Promise<Buffer> {
  const html = generateResumeHTML(resume);
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const browser = await puppeteer.launch({
    executablePath: require("fs").existsSync(edgePath) ? edgePath : undefined,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Export Resume to DOCX using docx package
 */
export async function exportResumeToDocx(resume: IResume): Promise<Buffer> {
  const data = resume.parsedData || {};
  const name = data.name || "Resume";
  const email = data.email || "";
  const phone = data.phone || "";
  const summary = data.summary || "";
  const skills = data.skills || [];
  const experience = data.experience || [];
  const education = data.education || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  const children: Paragraph[] = [];

  // Header Name
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: name.toUpperCase(),
          bold: true,
          size: 32,
          color: "111827",
        }),
      ],
    }),
  );

  // Contact Info
  if (email || phone) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: [email, phone].filter(Boolean).join("  |  "),
            size: 20,
            color: "4B5563",
          }),
        ],
      }),
    );
  }

  const createSectionHeader = (title: string) => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      space: { before: 200, after: 100 },
      border: {
        bottom: { color: "00BE50", space: 1, style: BorderStyle.SINGLE, size: 12 },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 22,
          color: "00BE50",
        }),
      ],
    });
  };

  // Summary
  if (summary) {
    children.push(createSectionHeader("Professional Summary"));
    children.push(
      new Paragraph({
        children: [new TextRun({ text: summary, size: 22, color: "374151" })],
      }),
    );
  }

  // Experience
  if (experience.length > 0) {
    children.push(createSectionHeader("Work Experience"));
    for (const exp of experience) {
      children.push(
        new Paragraph({
          space: { before: 100, after: 40 },
          children: [
            new TextRun({ text: exp.role, bold: true, size: 22, color: "111827" }),
            new TextRun({ text: ` — ${exp.company}`, bold: true, size: 22, color: "4B5563" }),
            new TextRun({ text: `  (${exp.duration})`, size: 20, color: "6B7280" }),
          ],
        }),
      );
      if (exp.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: exp.description, size: 20, color: "374151" })],
          }),
        );
      }
    }
  }

  // Education
  if (education.length > 0) {
    children.push(createSectionHeader("Education"));
    for (const edu of education) {
      children.push(
        new Paragraph({
          space: { before: 80, after: 40 },
          children: [
            new TextRun({ text: edu.degree, bold: true, size: 22, color: "111827" }),
            new TextRun({ text: ` (${edu.institution})`, size: 20, color: "4B5563" }),
            new TextRun({ text: `  ${edu.year}${edu.gpa ? ` • GPA: ${edu.gpa}` : ""}`, size: 20, color: "6B7280" }),
          ],
        }),
      );
    }
  }

  // Projects
  if (projects.length > 0) {
    children.push(createSectionHeader("Projects"));
    for (const proj of projects) {
      children.push(
        new Paragraph({
          space: { before: 100, after: 40 },
          children: [
            new TextRun({ text: proj.name, bold: true, size: 22, color: "111827" }),
            ...(proj.link ? [new TextRun({ text: `  (${proj.link})`, size: 20, color: "00BE50" })] : []),
          ],
        }),
      );
      if (proj.description) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: proj.description, size: 20, color: "374151" })],
          }),
        );
      }
    }
  }

  // Skills
  if (skills.length > 0) {
    children.push(createSectionHeader("Skills"));
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: skills.join(", "), size: 22, color: "1F2937" }),
        ],
      }),
    );
  }

  // Certifications
  if (certifications.length > 0) {
    children.push(createSectionHeader("Certifications"));
    for (const cert of certifications) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: cert, size: 22, color: "374151" })],
        }),
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Extract raw text from file Buffer (PDF or DOCX)
 */
export async function parseResumeBufferText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === "application/pdf" || mimeType.includes("pdf")) {
    const data = await pdfParse(buffer);
    return data.text || "";
  } else if (
    mimeType.includes("wordprocessingml") ||
    mimeType.includes("docx") ||
    mimeType.includes("msword")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }
  return buffer.toString("utf-8");
}
