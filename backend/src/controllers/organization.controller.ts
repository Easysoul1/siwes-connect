import { NextFunction, Request, Response } from "express";
import {
  ApplicationStatus,
  NotificationType,
  PlacementStatus,
  VerificationStatus
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";
import { UploadService } from "../services/upload.service";
import { NotificationService } from "../services/notification.service";
import { parsePagination } from "../utils/pagination";

const updateOrganizationSchema = z.object({
  companyName: z.string().trim().min(2)
});

const createPlacementSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  requiredDepartment: z.string().optional(),
  state: z.string().min(2),
  isRemote: z.boolean().default(false),
  totalSlots: z.number().int().positive(),
  applicationDeadline: z.string().datetime()
});

const updatePlacementSchema = createPlacementSchema.partial();

const updatePlacementStatusSchema = z.object({
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"])
});

const updateApplicationStatusSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "ACCEPTED", "REJECTED", "PLACEMENT_CONFIRMED"])
});

async function getOrganizationByUserId(userId: string) {
  const organization = await prisma.organization.findUnique({
    where: { userId },
    include: { user: { select: { id: true, email: true, isActive: true } } }
  });
  if (!organization) throw new AppError(404, "Organization profile not found");
  return organization;
}

export async function getOrganizationProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);
    res.json({ data: organization });
  } catch (error) {
    next(error);
  }
}

export async function updateOrganizationProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const payload = updateOrganizationSchema.parse(req.body);
    const organization = await getOrganizationByUserId(req.user.id);

    const updated = await prisma.organization.update({
      where: { id: organization.id },
      data: payload
    });

    res.json({ message: "Organization profile updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function uploadOrganizationDocuments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    if (!req.file) throw new AppError(400, "No file uploaded");

    const documentTypeRaw = typeof req.body.documentType === "string" ? req.body.documentType : "";
    const documentType = documentTypeRaw.trim().toLowerCase();
    if (!["cac", "itf", "logo"].includes(documentType)) {
      throw new AppError(400, "documentType must be one of: cac, itf, logo");
    }

    const organization = await getOrganizationByUserId(req.user.id);

    const uploaded = await UploadService.uploadBuffer(req.file.buffer, {
      folder: documentType === "logo" ? "siwes/logos" : "siwes/documents",
      resourceType: "auto"
    });

    const data =
      documentType === "cac"
        ? { cacDocumentUrl: uploaded.url }
        : documentType === "itf"
          ? { itfDocumentUrl: uploaded.url }
          : { logoUrl: uploaded.url };

    const updated = await prisma.organization.update({
      where: { id: organization.id },
      data
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      data: {
        cacDocumentUrl: updated.cacDocumentUrl,
        itfDocumentUrl: updated.itfDocumentUrl,
        logoUrl: updated.logoUrl
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const where = { organizationId: organization.id };
    const [placements, total] = await prisma.$transaction([
      prisma.placement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.placement.count({ where })
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
  } catch (error) {
    next(error);
  }
}

export async function getPlacementById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);

    const placement = await prisma.placement.findUnique({
      where: { id: req.params.id }
    });

    if (!placement || placement.organizationId !== organization.id) {
      throw new AppError(404, "Placement not found");
    }

    res.json({ data: placement });
  } catch (error) {
    next(error);
  }
}

export async function createPlacement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);

    if (organization.verificationStatus !== VerificationStatus.APPROVED) {
      throw new AppError(403, "Organization must be approved before posting placements");
    }
    const payload = createPlacementSchema.parse(req.body);

    const placement = await prisma.placement.create({
      data: {
        organizationId: organization.id,
        title: payload.title,
        description: payload.description,
        requiredDepartment: payload.requiredDepartment,
        state: payload.state,
        isRemote: payload.isRemote,
        totalSlots: payload.totalSlots,
        applicationDeadline: new Date(payload.applicationDeadline),
        status: PlacementStatus.DRAFT
      }
    });

    res.status(201).json({ message: "Placement created", data: placement });
  } catch (error) {
    next(error);
  }
}

export async function updatePlacement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);
    const payload = updatePlacementSchema.parse(req.body);

    const placement = await prisma.placement.findUnique({ where: { id: req.params.id } });
    if (!placement || placement.organizationId !== organization.id) {
      throw new AppError(404, "Placement not found");
    }

    const updated = await prisma.placement.update({
      where: { id: placement.id },
      data: {
        ...payload,
        ...(payload.applicationDeadline
          ? { applicationDeadline: new Date(payload.applicationDeadline) }
          : {})
      }
    });

    res.json({ message: "Placement updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function updatePlacementStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);
    const { status } = updatePlacementStatusSchema.parse(req.body);

    const placement = await prisma.placement.findUnique({ where: { id: req.params.id } });
    if (!placement || placement.organizationId !== organization.id) {
      throw new AppError(404, "Placement not found");
    }

    const updated = await prisma.placement.update({
      where: { id: placement.id },
      data: { status }
    });

    res.json({ message: "Placement status updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deletePlacement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);

    const placement = await prisma.placement.findUnique({
      where: { id: req.params.id },
      include: { applications: true }
    });
    if (!placement || placement.organizationId !== organization.id) {
      throw new AppError(404, "Placement not found");
    }
    if (placement.status !== PlacementStatus.DRAFT) {
      throw new AppError(409, "Only draft placements can be deleted");
    }
    if (placement.applications.length > 0) {
      throw new AppError(409, "Cannot delete placement with applications");
    }

    await prisma.placement.delete({ where: { id: placement.id } });
    res.json({ message: "Placement deleted" });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationApplications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const where = { placement: { organizationId: organization.id } };
    const [applications, total] = await prisma.$transaction([
      prisma.application.findMany({
        where,
        include: { placement: true, student: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
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
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationApplicationById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        student: true,
        placement: true
      }
    });
    if (!application || application.placement.organizationId !== organization.id) {
      throw new AppError(404, "Application not found");
    }

    res.json({ data: application });
  } catch (error) {
    next(error);
  }
}

export async function updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);
    const { status } = updateApplicationStatusSchema.parse(req.body);

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { placement: true }
    });
    if (!application || application.placement.organizationId !== organization.id) {
      throw new AppError(404, "Application not found");
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: status as ApplicationStatus }
    });

    const student = await prisma.student.findUnique({
      where: { id: application.studentId },
      select: { userId: true }
    });
    if (student) {
      await NotificationService.create({
        userId: student.userId,
        type:
          status === "ACCEPTED"
            ? NotificationType.APPLICATION_ACCEPTED
            : status === "REJECTED"
              ? NotificationType.APPLICATION_REJECTED
              : NotificationType.APPLICATION_REVIEWED,
        title: "Application status updated",
        message: `Your application for ${application.placement.title} is now ${status}.`,
        data: { applicationId: application.id, status }
      });
    }

    res.json({ message: "Application status updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function confirmPlacement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);

    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { placement: true }
    });
    if (!application || application.placement.organizationId !== organization.id) {
      throw new AppError(404, "Application not found");
    }

    if (
      application.status !== ApplicationStatus.ACCEPTED &&
      application.status !== ApplicationStatus.PLACEMENT_CONFIRMED
    ) {
      throw new AppError(409, "Only accepted applications can be confirmed");
    }

    if (
      application.status !== ApplicationStatus.PLACEMENT_CONFIRMED &&
      application.placement.filledSlots >= application.placement.totalSlots
    ) {
      throw new AppError(409, "No available slots for confirmation");
    }

    const [updated] = await prisma.$transaction([
      prisma.application.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.PLACEMENT_CONFIRMED,
          confirmedAt:
            application.status === ApplicationStatus.PLACEMENT_CONFIRMED ? application.confirmedAt : new Date()
        }
      }),
      ...(application.status === ApplicationStatus.PLACEMENT_CONFIRMED
        ? []
        : [
            prisma.placement.update({
              where: { id: application.placementId },
              data: { filledSlots: { increment: 1 } }
            })
          ])
    ]);

    const student = await prisma.student.findUnique({
      where: { id: application.studentId },
      select: { userId: true }
    });
    if (student) {
      await NotificationService.create({
        userId: student.userId,
        type: NotificationType.PLACEMENT_CONFIRMED,
        title: "Placement confirmed",
        message: `Your placement for ${application.placement.title} has been confirmed.`,
        data: { applicationId: application.id, placementId: application.placementId }
      });
    }

    res.json({ message: "Placement confirmed", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const organization = await getOrganizationByUserId(req.user.id);

    const [totalPlacements, activePlacements, totalApplications, acceptedStudents] =
      await prisma.$transaction([
        prisma.placement.count({ where: { organizationId: organization.id } }),
        prisma.placement.count({
          where: { organizationId: organization.id, status: PlacementStatus.ACTIVE }
        }),
        prisma.application.count({
          where: { placement: { organizationId: organization.id } }
        }),
        prisma.application.count({
          where: {
            placement: { organizationId: organization.id },
            status: ApplicationStatus.PLACEMENT_CONFIRMED
          }
        })
      ]);

    const slots = await prisma.placement.aggregate({
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
  } catch (error) {
    next(error);
  }
}
