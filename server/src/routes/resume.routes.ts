import { Router } from "express";
import {
  getAllResumes,
  getResumeById,
  createResume,
  uploadResume,
  updateResume,
  deleteResume,
  setPrimaryResume,
  getResumeVersions,
  duplicateResume,
  exportResumePDF,
  exportResumeDOCX,
} from "../controllers/resume.controller";
import { isAuthenticated } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { uploadLimiter } from "../middlewares/rateLimiter";
import { createResumeSchema, updateResumeSchema } from "../validators/resume.validator";

const router = Router();

// All resume routes require authentication
router.use(isAuthenticated);

// ── Resume CRUD ───────────────────────────────────────────────────────────────
router.get("/", getAllResumes);
router.get("/:id", getResumeById);
router.post("/", validate(createResumeSchema), createResume);
router.post("/upload", uploadLimiter, uploadResume);
router.put("/:id", validate(updateResumeSchema), updateResume);
router.delete("/:id", deleteResume);

// ── Resume Actions & Exports ───────────────────────────────────────────────────
router.put("/:id/primary", setPrimaryResume);
router.get("/:id/versions", getResumeVersions);
router.post("/:id/duplicate", duplicateResume);
router.get("/:id/export/pdf", exportResumePDF);
router.get("/:id/export/docx", exportResumeDOCX);

export default router;

