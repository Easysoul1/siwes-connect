"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlacements = getPlacements;
exports.getPlacementById = getPlacementById;
exports.getPlacementOrganization = getPlacementOrganization;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const pagination_1 = require("../utils/pagination");
async function getPlacements(req, res, next) {
    try {
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        const department = typeof req.query.department === "string" ? req.query.department : undefined;
        const remote = req.query.remote === "true" ? true : undefined;
        const status = typeof req.query.status === "string"
            ? req.query.status
            : client_1.PlacementStatus.ACTIVE;
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req.query);
        const where = {
            status,
            applicationDeadline: { gte: new Date() },
            ...(state ? { state } : {}),
            ...(department
                ? {
                    OR: [
                        { requiredDepartment: null },
                        {
                            requiredDepartment: {
                                equals: department,
                                mode: "insensitive"
                            }
                        }
                    ]
                }
                : {}),
            ...(remote !== undefined ? { isRemote: remote } : {})
        };
        const [placements, total] = await database_1.prisma.$transaction([
            database_1.prisma.placement.findMany({
                where,
                include: {
                    organization: {
                        select: { id: true, companyName: true, verificationStatus: true }
                    }
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            database_1.prisma.placement.count({ where })
        ]);
        res.json({
            data: placements,
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
async function getPlacementById(req, res, next) {
    try {
        const placement = await database_1.prisma.placement.findUnique({
            where: { id: req.params.id },
            include: {
                organization: {
                    select: { id: true, companyName: true, verificationStatus: true }
                },
                _count: { select: { applications: true } }
            }
        });
        if (!placement) {
            return res.status(404).json({ status: "error", message: "Placement not found" });
        }
        res.json({ data: placement });
    }
    catch (error) {
        next(error);
    }
}
async function getPlacementOrganization(req, res, next) {
    try {
        const placement = await database_1.prisma.placement.findUnique({
            where: { id: req.params.id },
            select: { organizationId: true }
        });
        if (!placement) {
            return res.status(404).json({ status: "error", message: "Placement not found" });
        }
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: placement.organizationId },
            select: {
                id: true,
                companyName: true,
                description: true,
                industry: true,
                website: true,
                logoUrl: true,
                verificationStatus: true,
                state: true,
                address: true
            }
        });
        if (!organization) {
            return res.status(404).json({ status: "error", message: "Organization not found" });
        }
        res.json({ data: organization });
    }
    catch (error) {
        next(error);
    }
}
