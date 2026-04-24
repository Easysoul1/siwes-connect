"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotifications = getNotifications;
exports.markNotificationAsRead = markNotificationAsRead;
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
exports.deleteNotification = deleteNotification;
exports.getUnreadCount = getUnreadCount;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
async function getAuthUserId(req) {
    if (!req.user)
        throw new errors_1.AppError(401, "Unauthorized");
    return req.user.id;
}
async function getNotifications(req, res, next) {
    try {
        const userId = await getAuthUserId(req);
        const notifications = await database_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });
        const unreadCount = notifications.filter((item) => !item.isRead).length;
        res.json({ data: notifications, unreadCount });
    }
    catch (error) {
        next(error);
    }
}
async function markNotificationAsRead(req, res, next) {
    try {
        const userId = await getAuthUserId(req);
        const notification = await database_1.prisma.notification.findUnique({
            where: { id: req.params.id }
        });
        if (!notification || notification.userId !== userId) {
            throw new errors_1.AppError(404, "Notification not found");
        }
        const updated = await database_1.prisma.notification.update({
            where: { id: notification.id },
            data: { isRead: true }
        });
        res.json({ message: "Notification marked as read", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function markAllNotificationsAsRead(req, res, next) {
    try {
        const userId = await getAuthUserId(req);
        const result = await database_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
        res.json({ message: "All notifications marked as read", data: { count: result.count } });
    }
    catch (error) {
        next(error);
    }
}
async function deleteNotification(req, res, next) {
    try {
        const userId = await getAuthUserId(req);
        const notification = await database_1.prisma.notification.findUnique({
            where: { id: req.params.id }
        });
        if (!notification || notification.userId !== userId) {
            throw new errors_1.AppError(404, "Notification not found");
        }
        await database_1.prisma.notification.delete({ where: { id: notification.id } });
        res.json({ message: "Notification deleted" });
    }
    catch (error) {
        next(error);
    }
}
async function getUnreadCount(req, res, next) {
    try {
        const userId = await getAuthUserId(req);
        const count = await database_1.prisma.notification.count({
            where: { userId, isRead: false }
        });
        res.json({ data: { unreadCount: count } });
    }
    catch (error) {
        next(error);
    }
}
