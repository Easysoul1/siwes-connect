import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { resumeUpload } from "../middleware/upload";
import {
  getApplicationById,
  getAllPlacements,
  getDashboardStats,
  getMatchedPlacements,
  getMyApplications,
  getProfile,
  getRecommendedPlacements,
  submitApplication,
  updatePreferences,
  updateProfile,
  uploadResume,
  withdrawApplication,
  downloadLogbookPDF,
  downloadAcceptanceLetter
} from "../controllers/student.controller";
import {
  createLogbookEntry,
  deleteLogbookEntry,
  getLogbookEntryById,
  getMyLogbook,
  submitLogbook,
  updateLogbookEntry
} from "../controllers/logbook.controller";

export const studentRouter = Router();

studentRouter.use(authenticate, authorize(UserRole.STUDENT));

studentRouter.get("/profile", getProfile);
studentRouter.put("/profile", updateProfile);
studentRouter.put("/profile/preferences", updatePreferences);
studentRouter.post("/profile/resume", resumeUpload.single("file"), uploadResume);

studentRouter.get("/placements", getMatchedPlacements);
studentRouter.get("/placements/all", getAllPlacements);
studentRouter.get("/placements/recommended", getRecommendedPlacements);

studentRouter.get("/applications", getMyApplications);
studentRouter.post("/applications", submitApplication);
studentRouter.get("/applications/:id", getApplicationById);
studentRouter.delete("/applications/:id", withdrawApplication);

studentRouter.get("/dashboard/stats", getDashboardStats);

studentRouter.get("/logbook", getMyLogbook);
studentRouter.post("/logbook", createLogbookEntry);
studentRouter.get("/logbook/download", downloadLogbookPDF);
studentRouter.get("/logbook/:id", getLogbookEntryById);
studentRouter.put("/logbook/:id", updateLogbookEntry);
studentRouter.delete("/logbook/:id", deleteLogbookEntry);
studentRouter.patch("/logbook/:id/submit", submitLogbook);

studentRouter.get("/applications/:id/acceptance-letter", downloadAcceptanceLetter);
