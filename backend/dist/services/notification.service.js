"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
exports.setNotificationSocket = setNotificationSocket;
const database_1 = require("../config/database");
let io = null;
function setNotificationSocket(socketServer) {
    io = socketServer;
}
class NotificationService {
    static async create(data) {
        const notification = await database_1.prisma.notification.create({ data });
        if (io) {
            io.to(`user:${data.userId}`).emit("notification", notification);
        }
        return notification;
    }
    static async createMany(payloads) {
        if (payloads.length === 0)
            return { count: 0 };
        const result = await database_1.prisma.notification.createMany({ data: payloads });
        if (io) {
            for (const payload of payloads) {
                io.to(`user:${payload.userId}`).emit("notification", payload);
            }
        }
        return result;
    }
}
exports.NotificationService = NotificationService;
