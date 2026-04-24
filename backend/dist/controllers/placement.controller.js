"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlacements = getPlacements;
exports.getPlacementById = getPlacementById;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
async function getPlacements(req, res, next) {
    try {
        const state = typeof req.query.state === "string" ? req.query.state : undefined;
        const department = typeof req.query.department === "string" ? req.query.department : undefined;
        const remote = req.query.remote === "true" ? true : undefined;
        const status = typeof req.query.status === "string"
            ? req.query.status
            : client_1.PlacementStatus.ACTIVE;
        const placements = await database_1.prisma.placement.findMany({
            where: {
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
            },
            include: {
                organization: {
                    select: { id: true, companyName: true, verificationStatus: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({
            data: placements,
            total: placements.length
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
