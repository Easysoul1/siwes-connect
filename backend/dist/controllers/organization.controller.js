"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationProfile = getOrganizationProfile;
exports.updateOrganizationProfile = updateOrganizationProfile;
exports.uploadOrganizationDocuments = uploadOrganizationDocuments;
exports.getOrganizationPlacements = getOrganizationPlacements;
exports.getPlacementById = getPlacementById;
exports.createPlacement = createPlacement;
exports.updatePlacement = updatePlacement;
exports.updatePlacementStatus = updatePlacementStatus;
exports.deletePlacement = deletePlacement;
exports.getOrganizationApplications = getOrganizationApplications;
exports.getOrganizationApplicationById = getOrganizationApplicationById;
exports.updateApplicationStatus = updateApplicationStatus;
exports.confirmPlacement = confirmPlacement;
exports.getOrganizationDashboardStats = getOrganizationDashboardStats;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const updateOrganizationSchema = zod_1.z.object({
    companyName: zod_1.z.string().trim().min(2)
});
const createPlacementSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(20),
    requiredDepartment: zod_1.z.string().optional(),
    state: zod_1.z.string().min(2),
    isRemote: zod_1.z.boolean().default(false),
    totalSlots: zod_1.z.number().int().positive(),
    applicationDeadline: zod_1.z.string().datetime()
});
const updatePlacementSchema = createPlacementSchema.partial();
const updatePlacementStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["DRAFT", "ACTIVE", "CLOSED"])
});
const updateApplicationStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["UNDER_REVIEW", "ACCEPTED", "REJECTED", "PLACEMENT_CONFIRMED"])
});
async function getOrganizationByUserId(userId) {
    const organization = await database_1.prisma.organization.findUnique({
        where: { userId },
        include: { user: { select: { id: true, email: true, isActive: true } } }
    });
    if (!organization)
        throw new errors_1.AppError(404, "Organization profile not found");
    return organization;
}
async function getOrganizationProfile(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        res.json({ data: organization });
    }
    catch (error) {
        next(error);
    }
}
async function updateOrganizationProfile(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const payload = updateOrganizationSchema.parse(req.body);
        const organization = await getOrganizationByUserId(req.user.id);
        const updated = await database_1.prisma.organization.update({
            where: { id: organization.id },
            data: payload
        });
        res.json({ message: "Organization profile updated", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function uploadOrganizationDocuments(_req, res) {
    res.status(202).json({
        message: "Document upload endpoint is ready for Cloudinary integration",
        data: null
    });
}
async function getOrganizationPlacements(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const placements = await database_1.prisma.placement.findMany({
            where: { organizationId: organization.id },
            orderBy: { createdAt: "desc" }
        });
        res.json({ data: placements });
    }
    catch (error) {
        next(error);
    }
}
async function getPlacementById(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const placement = await database_1.prisma.placement.findUnique({
            where: { id: req.params.id }
        });
        if (!placement || placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Placement not found");
        }
        res.json({ data: placement });
    }
    catch (error) {
        next(error);
    }
}
async function createPlacement(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        if (organization.verificationStatus !== client_1.VerificationStatus.APPROVED) {
            throw new errors_1.AppError(403, "Organization must be approved before posting placements");
        }
        const payload = createPlacementSchema.parse(req.body);
        const placement = await database_1.prisma.placement.create({
            data: {
                organizationId: organization.id,
                title: payload.title,
                description: payload.description,
                requiredDepartment: payload.requiredDepartment,
                state: payload.state,
                isRemote: payload.isRemote,
                totalSlots: payload.totalSlots,
                applicationDeadline: new Date(payload.applicationDeadline),
                status: client_1.PlacementStatus.DRAFT
            }
        });
        res.status(201).json({ message: "Placement created", data: placement });
    }
    catch (error) {
        next(error);
    }
}
async function updatePlacement(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const payload = updatePlacementSchema.parse(req.body);
        const placement = await database_1.prisma.placement.findUnique({ where: { id: req.params.id } });
        if (!placement || placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Placement not found");
        }
        const updated = await database_1.prisma.placement.update({
            where: { id: placement.id },
            data: {
                ...payload,
                ...(payload.applicationDeadline
                    ? { applicationDeadline: new Date(payload.applicationDeadline) }
                    : {})
            }
        });
        res.json({ message: "Placement updated", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function updatePlacementStatus(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const { status } = updatePlacementStatusSchema.parse(req.body);
        const placement = await database_1.prisma.placement.findUnique({ where: { id: req.params.id } });
        if (!placement || placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Placement not found");
        }
        const updated = await database_1.prisma.placement.update({
            where: { id: placement.id },
            data: { status }
        });
        res.json({ message: "Placement status updated", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function deletePlacement(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const placement = await database_1.prisma.placement.findUnique({
            where: { id: req.params.id },
            include: { applications: true }
        });
        if (!placement || placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Placement not found");
        }
        if (placement.status !== client_1.PlacementStatus.DRAFT) {
            throw new errors_1.AppError(409, "Only draft placements can be deleted");
        }
        if (placement.applications.length > 0) {
            throw new errors_1.AppError(409, "Cannot delete placement with applications");
        }
        await database_1.prisma.placement.delete({ where: { id: placement.id } });
        res.json({ message: "Placement deleted" });
    }
    catch (error) {
        next(error);
    }
}
async function getOrganizationApplications(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const applications = await database_1.prisma.application.findMany({
            where: { placement: { organizationId: organization.id } },
            include: { placement: true, student: true },
            orderBy: { createdAt: "desc" }
        });
        res.json({ data: applications });
    }
    catch (error) {
        next(error);
    }
}
async function getOrganizationApplicationById(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const application = await database_1.prisma.application.findUnique({
            where: { id: req.params.id },
            include: {
                student: true,
                placement: true
            }
        });
        if (!application || application.placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Application not found");
        }
        res.json({ data: application });
    }
    catch (error) {
        next(error);
    }
}
async function updateApplicationStatus(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const { status } = updateApplicationStatusSchema.parse(req.body);
        const application = await database_1.prisma.application.findUnique({
            where: { id: req.params.id },
            include: { placement: true }
        });
        if (!application || application.placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Application not found");
        }
        const updated = await database_1.prisma.application.update({
            where: { id: application.id },
            data: { status: status }
        });
        res.json({ message: "Application status updated", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function confirmPlacement(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const application = await database_1.prisma.application.findUnique({
            where: { id: req.params.id },
            include: { placement: true }
        });
        if (!application || application.placement.organizationId !== organization.id) {
            throw new errors_1.AppError(404, "Application not found");
        }
        if (application.status !== client_1.ApplicationStatus.ACCEPTED &&
            application.status !== client_1.ApplicationStatus.PLACEMENT_CONFIRMED) {
            throw new errors_1.AppError(409, "Only accepted applications can be confirmed");
        }
        if (application.status !== client_1.ApplicationStatus.PLACEMENT_CONFIRMED &&
            application.placement.filledSlots >= application.placement.totalSlots) {
            throw new errors_1.AppError(409, "No available slots for confirmation");
        }
        const [updated] = await database_1.prisma.$transaction([
            database_1.prisma.application.update({
                where: { id: application.id },
                data: { status: client_1.ApplicationStatus.PLACEMENT_CONFIRMED }
            }),
            ...(application.status === client_1.ApplicationStatus.PLACEMENT_CONFIRMED
                ? []
                : [
                    database_1.prisma.placement.update({
                        where: { id: application.placementId },
                        data: { filledSlots: { increment: 1 } }
                    })
                ])
        ]);
        res.json({ message: "Placement confirmed", data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function getOrganizationDashboardStats(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        const organization = await getOrganizationByUserId(req.user.id);
        const [totalPlacements, activePlacements, totalApplications, acceptedStudents] = await database_1.prisma.$transaction([
            database_1.prisma.placement.count({ where: { organizationId: organization.id } }),
            database_1.prisma.placement.count({
                where: { organizationId: organization.id, status: client_1.PlacementStatus.ACTIVE }
            }),
            database_1.prisma.application.count({
                where: { placement: { organizationId: organization.id } }
            }),
            database_1.prisma.application.count({
                where: {
                    placement: { organizationId: organization.id },
                    status: client_1.ApplicationStatus.PLACEMENT_CONFIRMED
                }
            })
        ]);
        const slots = await database_1.prisma.placement.aggregate({
            where: { organizationId: organization.id },
            _sum: { totalSlots: true, filledSlots: true }
        });
        res.json({
            data: {
                verificationStatus: organization.verificationStatus,
                totalPlacements,
                activePlacements,
                totalApplications,
                acceptedStudents,
                totalSlots: slots._sum.totalSlots ?? 0,
                filledSlots: slots._sum.filledSlots ?? 0
            }
        });
    }
    catch (error) {
        next(error);
    }
}
