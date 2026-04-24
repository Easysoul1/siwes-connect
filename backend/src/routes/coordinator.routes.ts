import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  approveOrganization,
  createAnnouncement,
  deleteAnnouncement,
  exportAnalytics,
  getAnalytics,
  getAnnouncements,
  getApplications,
  getDashboardStats,
  getOrganizationById,
  getOrganizations,
  getPendingOrganizations,
  getPlacements,
  getStudentById,
  getStudents,
  rejectOrganization,
  suspendOrganization
} from "../controllers/coordinator.controller";

export const coordinatorRouter = Router();

coordinatorRouter.use(authenticate, authorize(UserRole.COORDINATOR));

coordinatorRouter.get("/dashboard/stats", getDashboardStats);

coordinatorRouter.get("/organizations", getOrganizations);
coordinatorRouter.get("/organizations/pending", getPendingOrganizations);
coordinatorRouter.get("/organizations/:id", getOrganizationById);
coordinatorRouter.patch("/organizations/:id/approve", approveOrganization);
coordinatorRouter.patch("/organizations/:id/reject", rejectOrganization);
coordinatorRouter.patch("/organizations/:id/suspend", suspendOrganization);

coordinatorRouter.get("/students", getStudents);
coordinatorRouter.get("/students/:id", getStudentById);

coordinatorRouter.get("/placements", getPlacements);
coordinatorRouter.get("/applications", getApplications);

coordinatorRouter.get("/analytics", getAnalytics);
coordinatorRouter.get("/analytics/export", exportAnalytics);

coordinatorRouter.post("/announcements", createAnnouncement);
coordinatorRouter.get("/announcements", getAnnouncements);
coordinatorRouter.delete("/announcements/:id", deleteAnnouncement);
