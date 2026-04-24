"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = exports.notificationRouter = exports.placementRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authenticate_1 = require("../middleware/authenticate");
const authorize_1 = require("../middleware/authorize");
const placement_controller_1 = require("../controllers/placement.controller");
const notification_controller_1 = require("../controllers/notification.controller");
exports.placementRouter = (0, express_1.Router)();
exports.notificationRouter = (0, express_1.Router)();
exports.uploadRouter = (0, express_1.Router)();
exports.placementRouter.get("/", placement_controller_1.getPlacements);
exports.placementRouter.get("/:id", placement_controller_1.getPlacementById);
exports.notificationRouter.use(authenticate_1.authenticate);
exports.notificationRouter.get("/", notification_controller_1.getNotifications);
exports.notificationRouter.patch("/:id/read", notification_controller_1.markNotificationAsRead);
exports.notificationRouter.patch("/read-all", notification_controller_1.markAllNotificationsAsRead);
exports.notificationRouter.delete("/:id", notification_controller_1.deleteNotification);
exports.notificationRouter.get("/unread-count", notification_controller_1.getUnreadCount);
exports.uploadRouter.post("/resume", authenticate_1.authenticate, (0, authorize_1.authorize)(client_1.UserRole.STUDENT), (_req, res) => {
    res.status(202).json({ message: "Resume upload wired for Cloudinary integration" });
});
exports.uploadRouter.post("/document", authenticate_1.authenticate, (0, authorize_1.authorize)(client_1.UserRole.ORGANIZATION), (_req, res) => {
    res.status(202).json({ message: "Organization document upload wired for Cloudinary integration" });
});
exports.uploadRouter.post("/avatar", authenticate_1.authenticate, (_req, res) => {
    res.status(202).json({ message: "Avatar upload wired for Cloudinary integration" });
});
