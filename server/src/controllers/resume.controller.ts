import { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary";
import Resume from "../models/Resume";
import User from "../models/User";
import { ApiResponse } from "../utils/ApiResponse";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncErrors from "../utils/catchAsyncErrors";
import { logger } from "../config/logger";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/resumes — Get all resumes for logged-in user
// ─────────────────────────────────────────────────────────────────────────────
export const getAllResumes = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const resumes = await Resume.find({ user: userId })
      .select("-versions -parsedData")
      .sort({ isPrimary: -1, updatedAt: -1 });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { resumes, count: resumes.length },
          "Resumes fetched successfully",
        ),
      );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/resumes/:id — Get a single resume by ID
// ─────────────────────────────────────────────────────────────────────────────
export const getResumeById = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const resume = await Resume.findOne({ _id: req.params.id, user: userId });

    if (!resume) throw new ErrorHandler("Resume not found", 404);

    res
      .status(200)
      .json(new ApiResponse(200, { resume }, "Resume fetched successfully"));
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/resumes — Create a new resume (manual entry)
// ─────────────────────────────────────────────────────────────────────────────
export const createResume = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const { title, parsedData } = req.body;

    // Check plan limits
    const user = await User.findById(userId).populate("subscription.plan");
    const existingCount = await Resume.countDocuments({ user: userId });
    const planLimits = (user?.subscription?.plan as any)?.limits;
    const maxResumes = planLimits?.resumeUploads ?? 1;

    if (existingCount >= maxResumes) {
      throw new ErrorHandler(
        `Your plan allows a maximum of ${maxResumes} resume(s). Please upgrade to add more.`,
        403,
      );
    }

    const resume = await Resume.create({
      user: userId,
      title,
      parsedData: parsedData || {},
      versions: [
        { versionNumber: 1, content: parsedData || {}, atsScore: null },
      ],
    });

    res
      .status(201)
      .json(new ApiResponse(201, { resume }, "Resume created successfully"));
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/resumes/upload — Upload & parse a resume PDF/DOCX
// ─────────────────────────────────────────────────────────────────────────────
export const uploadResume = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const { file, title } = req.body; // file = base64 encoded PDF/DOCX

    if (!file) throw new ErrorHandler("Please provide a resume file", 400);

    // Check plan limits
    const user = await User.findById(userId).populate("subscription.plan");
    const existingCount = await Resume.countDocuments({ user: userId });
    const planLimits = (user?.subscription?.plan as any)?.limits;
    const maxResumes = planLimits?.resumeUploads ?? 1;

    if (existingCount >= maxResumes) {
      throw new ErrorHandler(
        `Your plan allows a maximum of ${maxResumes} resume(s). Upgrade your plan to upload more.`,
        403,
      );
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: `ai-career-copilot/resumes/${userId}`,
      resource_type: "raw",
      format: "pdf",
    });

    // Basic text extraction placeholder — real parsing via AI in Phase 3
    const parsedData = {
      name: user?.name || "",
      email: user?.email || "",
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    };

    const resume = await Resume.create({
      user: userId,
      title: title || `Resume ${existingCount + 1}`,
      rawFileUrl: uploadResult.secure_url,
      rawFilePublicId: uploadResult.public_id,
      parsedData,
      versions: [{ versionNumber: 1, content: parsedData }],
    });

    logger.info(`Resume uploaded by user ${userId}: ${uploadResult.public_id}`);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { resume },
          "Resume uploaded successfully. Use AI parse to extract content.",
        ),
      );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/resumes/:id — Update resume data
// ─────────────────────────────────────────────────────────────────────────────
export const updateResume = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const { title, parsedData } = req.body;

    const resume = await Resume.findOne({ _id: req.params.id, user: userId });
    if (!resume) throw new ErrorHandler("Resume not found", 404);

    if (title) resume.title = title;
    if (parsedData) {
      resume.parsedData = parsedData;
      // Save new version
      const nextVersion = (resume.versions?.length || 0) + 1;
      resume.versions.push({
        versionNumber: nextVersion,
        content: parsedData,
        atsScore: undefined,
        createdAt: new Date(),
      });
    }

    await resume.save();

    res
      .status(200)
      .json(new ApiResponse(200, { resume }, "Resume updated successfully"));
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/resumes/:id — Delete a resume
// ─────────────────────────────────────────────────────────────────────────────
export const deleteResume = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const resume = await Resume.findOne({ _id: req.params.id, user: userId });

    if (!resume) throw new ErrorHandler("Resume not found", 404);

    // Delete raw file from Cloudinary if exists
    if (resume.rawFilePublicId) {
      await cloudinary.uploader.destroy(resume.rawFilePublicId, {
        resource_type: "raw",
      });
    }

    await Resume.findByIdAndDelete(resume._id);

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Resume deleted successfully"));
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/v1/resumes/:id/primary — Set as primary resume
// ─────────────────────────────────────────────────────────────────────────────
export const setPrimaryResume = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;

    const resume = await Resume.findOne({ _id: req.params.id, user: userId });
    if (!resume) throw new ErrorHandler("Resume not found", 404);

    // Unset all other primaries first
    await Resume.updateMany(
      { user: userId, isPrimary: true },
      { isPrimary: false },
    );

    resume.isPrimary = true;
    await resume.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, { resume }, "Primary resume updated successfully"),
      );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/resumes/:id/versions — Get all versions of a resume
// ─────────────────────────────────────────────────────────────────────────────
export const getResumeVersions = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: userId,
    }).select("versions title");

    if (!resume) throw new ErrorHandler("Resume not found", 404);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { versions: resume.versions, title: resume.title },
          "Versions fetched successfully",
        ),
      );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/resumes/:id/duplicate — Duplicate a resume
// ─────────────────────────────────────────────────────────────────────────────
export const duplicateResume = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const source = await Resume.findOne({ _id: req.params.id, user: userId });

    if (!source) throw new ErrorHandler("Resume not found", 404);

    // Check plan limits
    const user = await User.findById(userId).populate("subscription.plan");
    const existingCount = await Resume.countDocuments({ user: userId });
    const planLimits = (user?.subscription?.plan as any)?.limits;
    const maxResumes = planLimits?.resumeUploads ?? 1;

    if (existingCount >= maxResumes) {
      throw new ErrorHandler(
        `Your plan allows a maximum of ${maxResumes} resume(s). Upgrade to duplicate.`,
        403,
      );
    }

    const copy = await Resume.create({
      user: userId,
      title: `${source.title} (Copy)`,
      parsedData: source.parsedData,
      versions: [{ versionNumber: 1, content: source.parsedData }],
      isPrimary: false,
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { resume: copy },
          "Resume duplicated successfully",
        ),
      );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/resumes/:id/export/pdf — Export Resume as PDF (Puppeteer)
// ─────────────────────────────────────────────────────────────────────────────
export const exportResumePDF = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const resume = await Resume.findOne({ _id: req.params.id, user: userId });

    if (!resume) throw new ErrorHandler("Resume not found", 404);

    const { exportResumeToPDF } = await import("../services/resumeExportService");
    const pdfBuffer = await exportResumeToPDF(resume);

    const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/resumes/:id/export/docx — Export Resume as DOCX (docx package)
// ─────────────────────────────────────────────────────────────────────────────
export const exportResumeDOCX = catchAsyncErrors(
  async (req: Request, res: Response) => {
    const userId = (req as any).user._id;
    const resume = await Resume.findOne({ _id: req.params.id, user: userId });

    if (!resume) throw new ErrorHandler("Resume not found", 404);

    const { exportResumeToDocx } = await import("../services/resumeExportService");
    const docxBuffer = await exportResumeToDocx(resume);

    const filename = `${resume.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", docxBuffer.length);
    res.send(docxBuffer);
  },
);

