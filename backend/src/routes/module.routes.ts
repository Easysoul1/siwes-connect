import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { avatarUpload, documentUpload, resumeUpload } from "../middleware/upload";
import {
  getPlacementById,
  getPlacementOrganization,
  getPlacements
} from "../controllers/placement.controller";
import {
  getOrganizationPublicPlacements,
  listApprovedOrganizations
} from "../controllers/organization.controller";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../controllers/notification.controller";
import { uploadAvatar, uploadDocument, uploadResume } from "../controllers/upload.controller";

export const placementRouter = Router();
export const publicOrgRouter = Router();
export const notificationRouter = Router();
export const uploadRouter = Router();

placementRouter.get("/", getPlacements);
placementRouter.get("/:id", getPlacementById);
placementRouter.get("/:id/organization", getPlacementOrganization);

publicOrgRouter.get("/", listApprovedOrganizations);
publicOrgRouter.get("/:id/placements", getOrganizationPublicPlacements);

notificationRouter.use(authenticate);
notificationRouter.get("/", getNotifications);
notificationRouter.get("/unread-count", getUnreadCount);
notificationRouter.patch("/read-all", markAllNotificationsAsRead);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.delete("/:id", deleteNotification);

uploadRouter.post(
  "/resume",
  authenticate,
  authorize(UserRole.STUDENT),
  resumeUpload.single("file"),
  uploadResume
);
uploadRouter.post(
  "/document",
  authenticate,
  authorize(UserRole.ORGANIZATION),
  documentUpload.single("file"),
  uploadDocument
);
uploadRouter.post("/avatar", authenticate, avatarUpload.single("file"), uploadAvatar);
