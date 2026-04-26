"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDeadlineReminderJob = startDeadlineReminderJob;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const notification_service_1 = require("../services/notification.service");
function startDeadlineReminderJob() {
    node_cron_1.default.schedule("0 8 * * *", async () => {
        try {
            const now = new Date();
            const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            const expiringPlacements = await database_1.prisma.placement.findMany({
                where: {
                    status: client_1.PlacementStatus.ACTIVE,
                    applicationDeadline: {
                        gte: now,
                        lte: inThreeDays
                    }
                },
                select: { id: true, title: true, state: true, applicationDeadline: true }
            });
            if (expiringPlacements.length === 0)
                return;
            const students = await database_1.prisma.student.findMany({
                select: { userId: true, preferredStates: true, currentState: true }
            });
            for (const placement of expiringPlacements) {
                const targets = students.filter((student) => student.preferredStates.includes(placement.state) || student.currentState === placement.state);
                await notification_service_1.NotificationService.createMany(targets.map((student) => ({
                    userId: student.userId,
                    type: client_1.NotificationType.DEADLINE_REMINDER,
                    title: "Placement deadline reminder",
                    message: `${placement.title} closes on ${placement.applicationDeadline.toDateString()}`,
                    data: { placementId: placement.id }
                })));
            }
        }
        catch (error) {
            console.error("deadline-reminder-job failed", error);
        }
    });
}
