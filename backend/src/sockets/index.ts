import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { setNotificationSocket } from "../services/notification.service";

type SocketPayload = {
  userId: string;
  role: string;
  type: "access" | "refresh";
};

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.FRONTEND_URL, credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token || typeof token !== "string") {
        next(new Error("Unauthorized"));
        return;
      }

      const payload = jwt.verify(token, env.JWT_SECRET) as SocketPayload;
      if (payload.type !== "access") {
        next(new Error("Unauthorized"));
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, isActive: true }
      });
      if (!user || !user.isActive) {
        next(new Error("Unauthorized"));
        return;
      }

      socket.data.user = { id: user.id };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.user?.id as string | undefined;
    if (!userId) {
      socket.disconnect();
      return;
    }
    socket.join(`user:${userId}`);
    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  setNotificationSocket(io);
  return io;
}
