"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWeeklyDigestJob = startWeeklyDigestJob;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const notification_service_1 = require("../services/notification.service");
function startWeeklyDigestJob() {
    node_cron_1.default.schedule("0 21 * * 0", async () => {
        try {
            const [totalStudents, totalOrganizations, totalPlacements, totalApplications] = await database_1.prisma.$transaction([
                database_1.prisma.student.count(),
                database_1.prisma.organization.count(),
                database_1.prisma.placement.count(),
                database_1.prisma.application.count()
            ]);
            const coordinators = await database_1.prisma.user.findMany({
                where: {
                    role: client_1.UserRole.COORDINATOR,
                    isActive: true
                },
                select: { id: true }
            });
            await notification_service_1.NotificationService.createMany(coordinators.map((coordinator) => ({
                userId: coordinator.id,
                type: client_1.NotificationType.ANNOUNCEMENT,
                title: "Weekly SIWES digest",
                message: `Students: ${totalStudents}, Organizations: ${totalOrganizations}, Placements: ${totalPlacements}, Applications: ${totalApplications}`,
                data: { totalStudents, totalOrganizations, totalPlacements, totalApplications }
            })));
        }
        catch (error) {
            console.error("weekly-digest-job failed", error);
        }
    });
}
