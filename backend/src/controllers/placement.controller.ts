import { NextFunction, Request, Response } from "express";
import { PlacementStatus } from "@prisma/client";
import { prisma } from "../config/database";

export async function getPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const department =
      typeof req.query.department === "string" ? req.query.department : undefined;
    const remote = req.query.remote === "true" ? true : undefined;
    const status =
      typeof req.query.status === "string"
        ? (req.query.status as PlacementStatus)
        : PlacementStatus.ACTIVE;

    const placements = await prisma.placement.findMany({
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
  } catch (error) {
    next(error);
  }
}

export async function getPlacementById(req: Request, res: Response, next: NextFunction) {
  try {
    const placement = await prisma.placement.findUnique({
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
  } catch (error) {
    next(error);
  }
}
