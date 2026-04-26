import { NotificationType, Prisma } from "@prisma/client";
import { Server } from "socket.io";
import { prisma } from "../config/database";

let io: Server | null = null;

export function setNotificationSocket(socketServer: Server) {
  io = socketServer;
}

export class NotificationService {
  static async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Prisma.InputJsonValue;
  }) {
    const notification = await prisma.notification.create({ data });
    if (io) {
      io.to(`user:${data.userId}`).emit("notification", notification);
    }
    return notification;
  }

  static async createMany(
    payloads: Array<{
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      data?: Prisma.InputJsonValue;
    }>
  ) {
    if (payloads.length === 0) return { count: 0 };
    const result = await prisma.notification.createMany({ data: payloads });
    if (io) {
      for (const payload of payloads) {
        io.to(`user:${payload.userId}`).emit("notification", payload);
      }
    }
    return result;
  }
}
