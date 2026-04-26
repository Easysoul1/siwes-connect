"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_io_1 = require("socket.io");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const notification_service_1 = require("../services/notification.service");
function initializeSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.FRONTEND_URL, credentials: true }
    });
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token || typeof token !== "string") {
                next(new Error("Unauthorized"));
                return;
            }
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            if (payload.type !== "access") {
                next(new Error("Unauthorized"));
                return;
            }
            const user = await database_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, isActive: true }
            });
            if (!user || !user.isActive) {
                next(new Error("Unauthorized"));
                return;
            }
            socket.data.user = { id: user.id };
            next();
        }
        catch {
            next(new Error("Unauthorized"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.data.user?.id;
        if (!userId) {
            socket.disconnect();
            return;
        }
        socket.join(`user:${userId}`);
        socket.on("disconnect", () => {
            socket.leave(`user:${userId}`);
        });
    });
    (0, notification_service_1.setNotificationSocket)(io);
    return io;
}
