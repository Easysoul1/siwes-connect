import { NextFunction, Request, Response } from "express";
import { ApplicationStatus, PlacementStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";
import { MatchingService } from "../services/matching.service";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  department: z.string().trim().min(2).optional(),
  level: z.string().trim().min(2).optional(),
  cgpa: z.number().min(0).max(5).nullable().optional(),
  currentState: z.string().trim().min(2).optional()
});

const updatePreferencesSchema = z.object({
  currentState: z.string().trim().min(2),
  preferredStates: z.array(z.string().trim().min(2)).default([])
});

const applySchema = z.object({
  placementId: z.string().min(1)
});

async function getStudentByUserId(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { user: { select: { id: true, email: true, role: true } } }
  });

  if (!student) throw new AppError(404, "Student profile not found");
  return student;
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);
    res.json({ data: student });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const payload = updateProfileSchema.parse(req.body);
    const student = await getStudentByUserId(req.user.id);

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: payload
    });

    res.json({ message: "Profile updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const payload = updatePreferencesSchema.parse(req.body);
    const student = await getStudentByUserId(req.user.id);

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: {
        currentState: payload.currentState,
        preferredStates: payload.preferredStates
      }
    });

    res.json({ message: "Preferences updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function uploadResume(_req: Request, res: Response) {
  res.status(202).json({
    message: "Resume upload endpoint is ready for Cloudinary integration",
    data: null
  });
}

export async function getMatchedPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

    const student = await getStudentByUserId(req.user.id);
    const stateFilter = typeof req.query.state === "string" ? req.query.state : undefined;
    const remoteOnly = req.query.remote === "true";

    const placements = await prisma.placement.findMany({
      where: {
        status: PlacementStatus.ACTIVE,
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
      .map((placement) => MatchingService.calculate(student, placement))
      .filter((entry) => entry.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ data: scored });
  } catch (error) {
    next(error);
  }
}

export async function getRecommendedPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const placements = await prisma.placement.findMany({
      where: {
        status: PlacementStatus.ACTIVE,
        applicationDeadline: { gte: new Date() }
      },
      include: {
        organization: { select: { id: true, companyName: true, verificationStatus: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const top = placements
      .map((placement) => MatchingService.calculate(student, placement))
      .filter((entry) => entry.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    res.json({ data: top });
  } catch (error) {
    next(error);
  }
}

export async function submitApplication(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const { placementId } = applySchema.parse(req.body);

    const student = await getStudentByUserId(req.user.id);

    const placement = await prisma.placement.findUnique({ where: { id: placementId } });
    if (!placement || placement.status !== PlacementStatus.ACTIVE) {
      throw new AppError(404, "Placement not available");
    }
    if (placement.applicationDeadline < new Date()) {
      throw new AppError(409, "Application deadline has passed");
    }
    if (placement.totalSlots <= placement.filledSlots) {
      throw new AppError(409, "Placement has no available slot");
    }

    const existing = await prisma.application.findUnique({
      where: {
        studentId_placementId: {
          studentId: student.id,
          placementId: placement.id
        }
      }
    });
    if (existing && existing.status !== ApplicationStatus.WITHDRAWN) {
      throw new AppError(409, "You have already applied for this placement");
    }

    const application =
      existing && existing.status === ApplicationStatus.WITHDRAWN
        ? await prisma.application.update({
            where: { id: existing.id },
            data: { status: ApplicationStatus.SUBMITTED }
          })
        : await prisma.application.create({
            data: {
              studentId: student.id,
              placementId: placement.id,
              status: ApplicationStatus.SUBMITTED
            }
          });

    const organization = await prisma.organization.findUnique({
      where: { id: placement.organizationId },
      select: { userId: true }
    });
    if (organization) {
      await prisma.notification.create({
        data: {
          userId: organization.userId,
          title: "New Application",
          message: `A student applied for ${placement.title}`
        }
      });
    }

    res.status(201).json({ message: "Application submitted", data: application });
  } catch (error) {
    next(error);
  }
}

export async function getMyApplications(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        placement: {
          include: {
            organization: { select: { id: true, companyName: true, verificationStatus: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ data: applications });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const application = await prisma.application.findUnique({
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
      throw new AppError(404, "Application not found");
    }

    res.json({ data: application });
  } catch (error) {
    next(error);
  }
}

export async function withdrawApplication(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const application = await prisma.application.findUnique({
      where: { id: req.params.id }
    });

    if (!application || application.studentId !== student.id) {
      throw new AppError(404, "Application not found");
    }

    if (
      application.status === ApplicationStatus.PLACEMENT_CONFIRMED ||
      application.status === ApplicationStatus.ACCEPTED
    ) {
      throw new AppError(409, "Cannot withdraw an accepted or confirmed application");
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.WITHDRAWN }
    });

    res.json({ message: "Application withdrawn", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const [total, submitted, underReview, accepted, rejected, confirmed] =
      await prisma.$transaction([
        prisma.application.count({ where: { studentId: student.id } }),
        prisma.application.count({
          where: { studentId: student.id, status: ApplicationStatus.SUBMITTED }
        }),
        prisma.application.count({
          where: { studentId: student.id, status: ApplicationStatus.UNDER_REVIEW }
        }),
        prisma.application.count({
          where: { studentId: student.id, status: ApplicationStatus.ACCEPTED }
        }),
        prisma.application.count({
          where: { studentId: student.id, status: ApplicationStatus.REJECTED }
        }),
        prisma.application.count({
          where: { studentId: student.id, status: ApplicationStatus.PLACEMENT_CONFIRMED }
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
  } catch (error) {
    next(error);
  }
}
