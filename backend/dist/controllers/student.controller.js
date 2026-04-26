"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.updatePreferences = updatePreferences;
exports.uploadResume = uploadResume;
exports.getMatchedPlacements = getMatchedPlacements;
exports.getRecommendedPlacements = getRecommendedPlacements;
exports.submitApplication = submitApplication;
exports.getMyApplications = getMyApplications;
exports.getApplicationById = getApplicationById;
exports.withdrawApplication = withdrawApplication;
exports.getDashboardStats = getDashboardStats;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const matching_service_1 = require("../services/matching.service");
const upload_service_1 = require("../services/upload.service");
const notification_service_1 = require("../services/notification.service");
const pagination_1 = require("../utils/pagination");
const updateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().trim().min(2).optional(),
    lastName: zod_1.z.string().trim().min(2).optional(),
    department: zod_1.z.string().trim().min(2).optional(),
    level: zod_1.z.string().trim().min(2).optional(),
    cgpa: zod_1.z.number().min(0).max(5).nullable().optional(),
    currentState: zod_1.z.string().trim().min(2).optional()
});
const updatePreferencesSchema = zod_1.z.object({
    currentState: zod_1.z.string().trim().min(2),
    preferredStates: zod_1.z.array(zod_1.z.string().trim().min(2)).default([])
});
const applySchema = zod_1.z.object({
    placementId: zod_1.z.string().min(1),
    coverLetter: zod_1.z.string().trim().min(10).optional(),
    resumeUrl: zod_1.z.string().url().optional(),
    additionalDocs: zod_1.z.array(zod_1.z.string().url()).optional()
});
async function getStudentByUserId(userId) {
    const student = await database_1.prisma.student.findUnique({
        where: { userId },
        include: { user: { select: { id: true, email: true, role: true } } }
    });
    if (!student)
        throw new errors_1.AppError(404, "Student profile not found");
    return student;
}
async function getProfile(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        res.json({ data: student });
    }
    catch (error) {
        next(error);
    }
}
async function updateProfile(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const payload = updateProfileSchema.parse(req.body);
        const student = await getStudentByUserId(req.user.id);
        const updated = await database_1.prisma.student.update({
            where: { id: student.id },
            data: payload
        });
        res.json({ message: "Profile updated", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function updatePreferences(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const payload = updatePreferencesSchema.parse(req.body);
        const student = await getStudentByUserId(req.user.id);
        const updated = await database_1.prisma.student.update({
            where: { id: student.id },
            data: {
                currentState: payload.currentState,
                preferredStates: payload.preferredStates
            }
        });
        res.json({ message: "Preferences updated", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function uploadResume(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        if (!req.file)
            throw new errors_1.AppError(400, "No file uploaded");
        const student = await getStudentByUserId(req.user.id);
        const uploaded = await upload_service_1.UploadService.uploadBuffer(req.file.buffer, {
            folder: "siwes/resumes",
            resourceType: "raw"
        });
        const updated = await database_1.prisma.student.update({
            where: { id: student.id },
            data: { resumeUrl: uploaded.url }
        });
        res.status(201).json({
            message: "Resume uploaded successfully",
            data: { resumeUrl: updated.resumeUrl }
        });
    }
    catch (error) {
        next(error);
    }
}
async function getMatchedPlacements(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        const stateFilter = typeof req.query.state === "string" ? req.query.state : undefined;
        const remoteOnly = req.query.remote === "true";
        const placements = await database_1.prisma.placement.findMany({
            where: {
                status: client_1.PlacementStatus.ACTIVE,
                applicationDeadline: { gte: new Date() },
                ...(stateFilter ? { state: stateFilter } : {}),
                ...(remoteOnly ? { isRemote: true } : {})
            },
            include: {
                organization: { select: { id: true, companyName: true, verificationStatus: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        const scored = placements
            .map((placement) => matching_service_1.MatchingService.calculate(student, placement))
            .filter((entry) => entry.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore);
        res.json({ data: scored });
    }
    catch (error) {
        next(error);
    }
}
async function getRecommendedPlacements(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        const placements = await database_1.prisma.placement.findMany({
            where: {
                status: client_1.PlacementStatus.ACTIVE,
                applicationDeadline: { gte: new Date() }
            },
            include: {
                organization: { select: { id: true, companyName: true, verificationStatus: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        const top = placements
            .map((placement) => matching_service_1.MatchingService.calculate(student, placement))
            .filter((entry) => entry.matchScore > 0)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);
        res.json({ data: top });
    }
    catch (error) {
        next(error);
    }
}
async function submitApplication(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const { placementId, coverLetter, resumeUrl, additionalDocs } = applySchema.parse(req.body);
        const student = await getStudentByUserId(req.user.id);
        const placement = await database_1.prisma.placement.findUnique({ where: { id: placementId } });
        if (!placement || placement.status !== client_1.PlacementStatus.ACTIVE) {
            throw new errors_1.AppError(404, "Placement not available");
        }
        if (placement.applicationDeadline < new Date()) {
            throw new errors_1.AppError(409, "Application deadline has passed");
        }
        if (placement.totalSlots <= placement.filledSlots) {
            throw new errors_1.AppError(409, "Placement has no available slot");
        }
        const existing = await database_1.prisma.application.findUnique({
            where: {
                studentId_placementId: {
                    studentId: student.id,
                    placementId: placement.id
                }
            }
        });
        if (existing && existing.status !== client_1.ApplicationStatus.WITHDRAWN) {
            throw new errors_1.AppError(409, "You have already applied for this placement");
        }
        const application = existing && existing.status === client_1.ApplicationStatus.WITHDRAWN
            ? await database_1.prisma.application.update({
                where: { id: existing.id },
                data: {
                    status: client_1.ApplicationStatus.SUBMITTED,
                    coverLetter,
                    resumeUrl,
                    additionalDocs: additionalDocs ?? []
                }
            })
            : await database_1.prisma.application.create({
                data: {
                    studentId: student.id,
                    placementId: placement.id,
                    organizationId: placement.organizationId,
                    status: client_1.ApplicationStatus.SUBMITTED,
                    coverLetter,
                    resumeUrl,
                    additionalDocs: additionalDocs ?? []
                }
            });
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: placement.organizationId },
            select: { userId: true }
        });
        if (organization) {
            await notification_service_1.NotificationService.create({
                userId: organization.userId,
                type: client_1.NotificationType.APPLICATION_SUBMITTED,
                title: "New Application",
                message: `A student applied for ${placement.title}`,
                data: { placementId: placement.id }
            });
        }
        res.status(201).json({ message: "Application submitted", data: application });
    }
    catch (error) {
        next(error);
    }
}
async function getMyApplications(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req.query);
        const where = { studentId: student.id };
        const [applications, total] = await database_1.prisma.$transaction([
            database_1.prisma.application.findMany({
                where,
                include: {
                    placement: {
                        include: {
                            organization: { select: { id: true, companyName: true, verificationStatus: true } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            database_1.prisma.application.count({ where })
        ]);
        res.json({
            data: applications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
}
async function getApplicationById(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        const application = await database_1.prisma.application.findUnique({
            where: { id: req.params.id },
            include: {
                placement: {
                    include: {
                        organization: { select: { id: true, companyName: true, verificationStatus: true } }
                    }
                }
            }
        });
        if (!application || application.studentId !== student.id) {
            throw new errors_1.AppError(404, "Application not found");
        }
        res.json({ data: application });
    }
    catch (error) {
        next(error);
    }
}
async function withdrawApplication(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        const application = await database_1.prisma.application.findUnique({
            where: { id: req.params.id }
        });
        if (!application || application.studentId !== student.id) {
            throw new errors_1.AppError(404, "Application not found");
        }
        if (application.status === client_1.ApplicationStatus.PLACEMENT_CONFIRMED ||
            application.status === client_1.ApplicationStatus.ACCEPTED) {
            throw new errors_1.AppError(409, "Cannot withdraw an accepted or confirmed application");
        }
        const updated = await database_1.prisma.application.update({
            where: { id: application.id },
            data: { status: client_1.ApplicationStatus.WITHDRAWN }
        });
        res.json({ message: "Application withdrawn", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function getDashboardStats(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const student = await getStudentByUserId(req.user.id);
        const [total, submitted, underReview, accepted, rejected, confirmed] = await database_1.prisma.$transaction([
            database_1.prisma.application.count({ where: { studentId: student.id } }),
            database_1.prisma.application.count({
                where: { studentId: student.id, status: client_1.ApplicationStatus.SUBMITTED }
            }),
            database_1.prisma.application.count({
                where: { studentId: student.id, status: client_1.ApplicationStatus.UNDER_REVIEW }
            }),
            database_1.prisma.application.count({
                where: { studentId: student.id, status: client_1.ApplicationStatus.ACCEPTED }
            }),
            database_1.prisma.application.count({
                where: { studentId: student.id, status: client_1.ApplicationStatus.REJECTED }
            }),
            database_1.prisma.application.count({
                where: { studentId: student.id, status: client_1.ApplicationStatus.PLACEMENT_CONFIRMED }
            })
        ]);
        res.json({
            data: {
                totalApplications: total,
                submitted,
                underReview,
                accepted,
                rejected,
                placementConfirmed: confirmed
            }
        });
    }
    catch (error) {
        next(error);
    }
}
