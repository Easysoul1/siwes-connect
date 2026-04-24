import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  getApplicationById,
  getDashboardStats,
  getMatchedPlacements,
  getMyApplications,
  getProfile,
  getRecommendedPlacements,
  submitApplication,
  updatePreferences,
  updateProfile,
  uploadResume,
  withdrawApplication
} from "../controllers/student.controller";

export const studentRouter = Router();

studentRouter.use(authenticate, authorize(UserRole.STUDENT));

studentRouter.get("/profile", getProfile);
studentRouter.put("/profile", updateProfile);
studentRouter.put("/profile/preferences", updatePreferences);
studentRouter.post("/profile/resume", uploadResume);

studentRouter.get("/placements", getMatchedPlacements);
studentRouter.get("/placements/recommended", getRecommendedPlacements);

studentRouter.get("/applications", getMyApplications);
studentRouter.post("/applications", submitApplication);
studentRouter.get("/applications/:id", getApplicationById);
studentRouter.delete("/applications/:id", withdrawApplication);

studentRouter.get("/dashboard/stats", getDashboardStats);
