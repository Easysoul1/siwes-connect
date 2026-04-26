"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizations = getOrganizations;
exports.approveOrganization = approveOrganization;
exports.rejectOrganization = rejectOrganization;
exports.suspendOrganization = suspendOrganization;
exports.getPendingOrganizations = getPendingOrganizations;
exports.getOrganizationById = getOrganizationById;
exports.getStudents = getStudents;
exports.getStudentById = getStudentById;
exports.getPlacements = getPlacements;
exports.getApplications = getApplications;
exports.getDashboardStats = getDashboardStats;
exports.getAnalytics = getAnalytics;
exports.exportAnalytics = exportAnalytics;
exports.createAnnouncement = createAnnouncement;
exports.getAnnouncements = getAnnouncements;
exports.deleteAnnouncement = deleteAnnouncement;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const notification_service_1 = require("../services/notification.service");
const moderationSchema = zod_1.z.object({
    reason: zod_1.z.string().trim().min(3).optional()
});
const announcementSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3),
    message: zod_1.z.string().trim().min(3),
    targetRole: zod_1.z.enum(["ALL", "STUDENT", "ORGANIZATION"]).default("ALL")
});
async function getOrganizations(req, res, next) {
    try {
        const status = req.query.status;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const organizations = await database_1.prisma.organization.findMany({
            where: {
                ...(status ? { verificationStatus: status } : {}),
                ...(search
                    ? {
                        companyName: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                    : {})
            },
            include: {
                user: { select: { id: true, email: true, isActive: true } }
            },
            orderBy: { companyName: "asc" }
        });
        res.json({ data: organizations });
    }
    catch (error) {
        next(error);
    }
}
async function approveOrganization(req, res, next) {
    try {
        const org = await database_1.prisma.organization.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });
        if (!org)
            throw new errors_1.AppError(404, "Organization not found");
        const [updated] = await database_1.prisma.$transaction([
            database_1.prisma.organization.update({
                where: { id: org.id },
                data: { verificationStatus: client_1.VerificationStatus.APPROVED }
            })
        ]);
        await notification_service_1.NotificationService.create({
            userId: org.userId,
            type: client_1.NotificationType.ORGANIZATION_APPROVED,
            title: "Organization Approved",
            message: "Your organization has been approved and can now post placements.",
            data: { organizationId: org.id }
        });
        res.json({ message: "Organization approved", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function rejectOrganization(req, res, next) {
    try {
        const { reason } = moderationSchema.parse(req.body);
        const org = await database_1.prisma.organization.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });
        if (!org)
            throw new errors_1.AppError(404, "Organization not found");
        const [updated] = await database_1.prisma.$transaction([
            database_1.prisma.organization.update({
                where: { id: org.id },
                data: { verificationStatus: client_1.VerificationStatus.REJECTED }
            })
        ]);
        await notification_service_1.NotificationService.create({
            userId: org.userId,
            type: client_1.NotificationType.ORGANIZATION_REJECTED,
            title: "Organization Rejected",
            message: reason
                ? `Your organization verification was rejected. Reason: ${reason}`
                : "Your organization verification was rejected.",
            data: { organizationId: org.id, reason: reason ?? null }
        });
        res.json({ message: "Organization rejected", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function suspendOrganization(req, res, next) {
    try {
        const { reason } = moderationSchema.parse(req.body);
        const org = await database_1.prisma.organization.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });
        if (!org)
            throw new errors_1.AppError(404, "Organization not found");
        const [updatedOrg] = await database_1.prisma.$transaction([
            database_1.prisma.organization.update({
                where: { id: org.id },
                data: { verificationStatus: client_1.VerificationStatus.REJECTED }
            }),
            database_1.prisma.user.update({
                where: { id: org.userId },
                data: { isActive: false }
            })
        ]);
        await notification_service_1.NotificationService.create({
            userId: org.userId,
            type: client_1.NotificationType.ORGANIZATION_REJECTED,
            title: "Organization Suspended",
            message: reason
                ? `Your organization account has been suspended. Reason: ${reason}`
                : "Your organization account has been suspended.",
            data: { organizationId: org.id, reason: reason ?? null }
        });
        res.json({ message: "Organization suspended", data: updatedOrg });
    }
    catch (error) {
        next(error);
    }
}
async function getPendingOrganizations(req, res, next) {
    try {
        req.query.status = client_1.VerificationStatus.PENDING;
        await getOrganizations(req, res, next);
    }
    catch (error) {
        next(error);
    }
}
async function getOrganizationById(req, res, next) {
    try {
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, email: true, isActive: true, createdAt: true } },
                placements: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });
        if (!organization)
            throw new errors_1.AppError(404, "Organization not found");
        res.json({ data: organization });
    }
    catch (error) {
        next(error);
    }
}
async function getStudents(req, res, next) {
    try {
        const department = typeof req.query.department === "string" ? req.query.department : undefined;
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        const students = await database_1.prisma.student.findMany({
            where: {
                ...(department
                    ? {
                        department: {
                            equals: department,
                            mode: "insensitive"
                        }
                    }
                    : {}),
                ...(state ? { currentState: state } : {})
            },
            include: {
                user: { select: { id: true, email: true, isActive: true, createdAt: true } },
                applications: {
                    select: { id: true, status: true, createdAt: true }
                }
            },
            orderBy: { firstName: "asc" }
        });
        res.json({ data: students });
    }
    catch (error) {
        next(error);
    }
}
async function getStudentById(req, res, next) {
    try {
        const student = await database_1.prisma.student.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { id: true, email: true, isActive: true, createdAt: true } },
                applications: {
                    include: {
                        placement: {
                            include: {
                                organization: {
                                    select: { id: true, companyName: true, verificationStatus: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        });
        if (!student)
            throw new errors_1.AppError(404, "Student not found");
        res.json({ data: student });
    }
    catch (error) {
        next(error);
    }
}
async function getPlacements(req, res, next) {
    try {
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const placements = await database_1.prisma.placement.findMany({
            where: status ? { status } : undefined,
            include: {
                organization: {
                    select: { id: true, companyName: true, verificationStatus: true }
                },
                _count: { select: { applications: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ data: placements });
    }
    catch (error) {
        next(error);
    }
}
async function getApplications(req, res, next) {
    try {
        const status = typeof req.query.status === "string"
            ? req.query.status
            : undefined;
        const applications = await database_1.prisma.application.findMany({
            where: status ? { status } : undefined,
            include: {
                student: { select: { id: true, firstName: true, lastName: true, department: true, level: true } },
                placement: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        state: true,
                        organization: { select: { id: true, companyName: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ data: applications });
    }
    catch (error) {
        next(error);
    }
}
async function buildAnalytics() {
    const [totalStudents, totalOrganizations, pendingOrganizations, totalPlacements, activePlacements, totalApplications, confirmedApplications] = await database_1.prisma.$transaction([
        database_1.prisma.student.count(),
        database_1.prisma.organization.count(),
        database_1.prisma.organization.count({ where: { verificationStatus: client_1.VerificationStatus.PENDING } }),
        database_1.prisma.placement.count(),
        database_1.prisma.placement.count({ where: { status: "ACTIVE" } }),
        database_1.prisma.application.count(),
        database_1.prisma.application.count({ where: { status: client_1.ApplicationStatus.PLACEMENT_CONFIRMED } })
    ]);
    const placementByState = await database_1.prisma.placement.groupBy({
        by: ["state"],
        _count: { state: true },
        orderBy: { _count: { state: "desc" } }
    });
    const applicationByStatus = await database_1.prisma.application.groupBy({
        by: ["status"],
        _count: { status: true }
    });
    return {
        overview: {
            totalStudents,
            totalOrganizations,
            pendingOrganizations,
            totalPlacements,
            activePlacements,
            totalApplications,
            confirmedApplications
        },
        placementByState: placementByState.map((item) => ({
            state: item.state,
            count: item._count.state
        })),
        applicationByStatus: applicationByStatus.map((item) => ({
            status: item.status,
            count: item._count.status
        }))
    };
}
async function getDashboardStats(_req, res, next) {
    try {
        const analytics = await buildAnalytics();
        res.json({ data: analytics.overview });
    }
    catch (error) {
        next(error);
    }
}
async function getAnalytics(_req, res, next) {
    try {
        const analytics = await buildAnalytics();
        res.json({ data: analytics });
    }
    catch (error) {
        next(error);
    }
}
async function exportAnalytics(_req, res, next) {
    try {
        const analytics = await buildAnalytics();
        const lines = [
            "metric,value",
            `total_students,${analytics.overview.totalStudents}`,
            `total_organizations,${analytics.overview.totalOrganizations}`,
            `pending_organizations,${analytics.overview.pendingOrganizations}`,
            `total_placements,${analytics.overview.totalPlacements}`,
            `active_placements,${analytics.overview.activePlacements}`,
            `total_applications,${analytics.overview.totalApplications}`,
            `confirmed_applications,${analytics.overview.confirmedApplications}`
        ];
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="siwes-analytics-${new Date().toISOString().slice(0, 10)}.csv"`);
        res.send(lines.join("\n"));
    }
    catch (error) {
        next(error);
    }
}
async function createAnnouncement(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const payload = announcementSchema.parse(req.body);
        const targetRoles = payload.targetRole === "ALL"
            ? [client_1.UserRole.STUDENT, client_1.UserRole.ORGANIZATION]
            : [payload.targetRole];
        const targetUsers = await database_1.prisma.user.findMany({
            where: {
                role: { in: targetRoles },
                isActive: true
            },
            select: { id: true }
        });
        if (targetUsers.length === 0) {
            return res.status(200).json({ message: "No users to notify", data: { sent: 0 } });
        }
        const tag = `ANN:${req.user.id}:${Date.now()}`;
        await notification_service_1.NotificationService.createMany(targetUsers.map((user) => ({
            userId: user.id,
            type: client_1.NotificationType.ANNOUNCEMENT,
            title: `${tag}:${payload.title}`,
            message: payload.message,
            data: { targetRole: payload.targetRole }
        })));
        res.status(201).json({
            message: "Announcement created",
            data: { sent: targetUsers.length, tag }
        });
    }
    catch (error) {
        next(error);
    }
}
async function getAnnouncements(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const prefix = `ANN:${req.user.id}:`;
        const records = await database_1.prisma.notification.findMany({
            where: {
                title: { startsWith: prefix }
            },
            orderBy: { createdAt: "desc" }
        });
        const grouped = new Map();
        for (const item of records) {
            const parts = item.title.split(":");
            const announcementTitle = parts.slice(3).join(":");
            const key = `${parts.slice(0, 3).join(":")}|${announcementTitle}|${item.message}`;
            const existing = grouped.get(key);
            if (!existing) {
                grouped.set(key, {
                    id: item.id,
                    title: announcementTitle,
                    message: item.message,
                    createdAt: item.createdAt,
                    recipients: 1
                });
            }
            else {
                existing.recipients += 1;
            }
        }
        res.json({ data: Array.from(grouped.values()) });
    }
    catch (error) {
        next(error);
    }
}
async function deleteAnnouncement(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const record = await database_1.prisma.notification.findUnique({ where: { id: req.params.id } });
        if (!record)
            throw new errors_1.AppError(404, "Announcement not found");
        const tag = record.title.split(":").slice(0, 3).join(":");
        if (!tag.startsWith(`ANN:${req.user.id}:`)) {
            throw new errors_1.AppError(403, "You cannot delete this announcement");
        }
        await database_1.prisma.notification.deleteMany({
            where: {
                title: { startsWith: tag }
            }
        });
        res.json({ message: "Announcement deleted" });
    }
    catch (error) {
        next(error);
    }
}
