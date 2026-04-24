import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { getPlacementById, getPlacements } from "../controllers/placement.controller";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from "../controllers/notification.controller";

export const placementRouter = Router();
export const notificationRouter = Router();
export const uploadRouter = Router();

placementRouter.get("/", getPlacements);
placementRouter.get("/:id", getPlacementById);

notificationRouter.use(authenticate);
notificationRouter.get("/", getNotifications);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.patch("/read-all", markAllNotificationsAsRead);
notificationRouter.delete("/:id", deleteNotification);
notificationRouter.get("/unread-count", getUnreadCount);

uploadRouter.post("/resume", authenticate, authorize(UserRole.STUDENT), (_req, res) => {
  res.status(202).json({ message: "Resume upload wired for Cloudinary integration" });
});
uploadRouter.post("/document", authenticate, authorize(UserRole.ORGANIZATION), (_req, res) => {
  res.status(202).json({ message: "Organization document upload wired for Cloudinary integration" });
});
uploadRouter.post("/avatar", authenticate, (_req, res) => {
  res.status(202).json({ message: "Avatar upload wired for Cloudinary integration" });
});
