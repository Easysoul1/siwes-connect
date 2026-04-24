import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  confirmPlacement,
  createPlacement,
  deletePlacement,
  getOrganizationApplicationById,
  getOrganizationApplications,
  getOrganizationDashboardStats,
  getOrganizationProfile,
  getOrganizationPlacements,
  getPlacementById,
  updateOrganizationProfile,
  updatePlacement,
  updateApplicationStatus,
  updatePlacementStatus,
  uploadOrganizationDocuments
} from "../controllers/organization.controller";

export const organizationRouter = Router();

organizationRouter.use(authenticate, authorize(UserRole.ORGANIZATION));

organizationRouter.get("/profile", getOrganizationProfile);
organizationRouter.put("/profile", updateOrganizationProfile);
organizationRouter.post("/profile/documents", uploadOrganizationDocuments);

organizationRouter.get("/placements", getOrganizationPlacements);
organizationRouter.post("/placements", createPlacement);
organizationRouter.get("/placements/:id", getPlacementById);
organizationRouter.put("/placements/:id", updatePlacement);
organizationRouter.patch("/placements/:id/status", updatePlacementStatus);
organizationRouter.delete("/placements/:id", deletePlacement);

organizationRouter.get("/applications", getOrganizationApplications);
organizationRouter.get("/applications/:id", getOrganizationApplicationById);
organizationRouter.patch("/applications/:id/status", updateApplicationStatus);
organizationRouter.post("/applications/:id/confirm", confirmPlacement);

organizationRouter.get("/dashboard/stats", getOrganizationDashboardStats);
