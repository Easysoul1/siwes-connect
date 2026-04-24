import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";

async function getAuthUserId(req: Request) {
  if (!req.user) throw new AppError(401, "Unauthorized");
  return req.user.id;
}

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await getAuthUserId(req);

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    const unreadCount = notifications.filter((item) => !item.isRead).length;

    res.json({ data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = await getAuthUserId(req);

    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });
    if (!notification || notification.userId !== userId) {
      throw new AppError(404, "Notification not found");
    }

    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true }
    });

    res.json({ message: "Notification marked as read", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = await getAuthUserId(req);
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: "All notifications marked as read", data: { count: result.count } });
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await getAuthUserId(req);

    const notification = await prisma.notification.findUnique({
      where: { id: req.params.id }
    });
    if (!notification || notification.userId !== userId) {
      throw new AppError(404, "Notification not found");
    }

    await prisma.notification.delete({ where: { id: notification.id } });
    res.json({ message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = await getAuthUserId(req);
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    res.json({ data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
}
