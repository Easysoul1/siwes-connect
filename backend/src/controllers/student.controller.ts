import { NextFunction, Request, Response } from "express";
import { ApplicationStatus, NotificationType, PlacementStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";
import { MatchingService } from "../services/matching.service";
import { UploadService } from "../services/upload.service";
import { NotificationService } from "../services/notification.service";
import { parsePagination } from "../utils/pagination";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  department: z.string().trim().min(2).optional(),
  level: z.string().trim().min(2).optional(),
  cgpa: z.number().min(0).max(5).nullable().optional(),
  currentState: z.string().trim().min(2).optional(),
  institutionId: z.string().trim().optional()
});

const updatePreferencesSchema = z.object({
  currentState: z.string().trim().min(2),
  preferredStates: z.array(z.string().trim().min(2)).default([])
});

const applySchema = z.object({
  placementId: z.string().min(1),
  coverLetter: z.string().trim().min(10).optional(),
  resumeUrl: z.string().url().optional(),
  additionalDocs: z.array(z.string().url()).optional()
});

async function getStudentByUserId(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, email: true, role: true } },
      institution: { select: { name: true, shortName: true } }
    }
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

    const updateData: Record<string, unknown> = { ...payload };
    if (payload.institutionId) {
      const inst = await prisma.institution.findFirst({
        where: { shortName: payload.institutionId.toUpperCase() }
      });
      updateData.institutionId = inst?.id ?? null;
    }

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: updateData
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

export async function uploadResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    if (!req.file) throw new AppError(400, "No file uploaded");

    const student = await getStudentByUserId(req.user.id);
    const uploaded = await UploadService.uploadBuffer(req.file.buffer, {
      folder: "siwes/resumes",
      resourceType: "raw"
    });

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { resumeUrl: uploaded.url }
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      data: { resumeUrl: updated.resumeUrl }
    });
  } catch (error) {
    next(error);
  }
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

export async function getAllPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");

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
        organization: { select: { id: true, companyName: true, verificationStatus: true, logoUrl: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json({ data: placements });
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
    const { placementId, coverLetter, resumeUrl, additionalDocs } = applySchema.parse(req.body);

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
            data: {
              status: ApplicationStatus.SUBMITTED,
              coverLetter,
              resumeUrl,
              additionalDocs: additionalDocs ?? []
            }
          })
        : await prisma.application.create({
            data: {
              studentId: student.id,
              placementId: placement.id,
              organizationId: placement.organizationId,
              status: ApplicationStatus.SUBMITTED,
              coverLetter,
              resumeUrl,
              additionalDocs: additionalDocs ?? []
            }
          });

    const organization = await prisma.organization.findUnique({
      where: { id: placement.organizationId },
      select: { userId: true }
    });
    if (organization) {
      await NotificationService.create({
        userId: organization.userId,
        type: NotificationType.APPLICATION_SUBMITTED,
        title: "New Application",
        message: `A student applied for ${placement.title}`,
        data: { placementId: placement.id }
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
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);

    const where = { studentId: student.id };
    const [applications, total] = await prisma.$transaction([
      prisma.application.findMany({
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

import { generateLogbookPDF } from "../services/logbook-pdf.service";
import { generateAcceptanceLetterPDF } from "../services/acceptance-letter-pdf.service";

export async function downloadLogbookPDF(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const entries = await prisma.logbookEntry.findMany({
      where: { studentId: student.id },
      orderBy: [{ weekNumber: "asc" }, { date: "asc" }]
    });

    if (entries.length === 0) {
      throw new AppError(400, "No logbook entries to download");
    }

    const confirmedApp = await prisma.application.findFirst({
      where: {
        studentId: student.id,
        status: { in: ["ACCEPTED", "PLACEMENT_CONFIRMED"] }
      },
      include: {
        placement: {
          include: { organization: true }
        }
      }
    });

    const organization = confirmedApp?.placement?.organization;
    if (!organization) {
      throw new AppError(400, "No confirmed placement found");
    }

    const pdfBuffer = await generateLogbookPDF(
      {
        firstName: student.firstName,
        lastName: student.lastName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        institution: student.institution
      },
      {
        companyName: organization.companyName,
        address: organization.address,
        state: organization.state
      },
      entries
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="logbook-${student.firstName}-${student.lastName}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

export async function downloadAcceptanceLetter(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);
    const { id: applicationId } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        studentId: student.id,
        status: { in: ["ACCEPTED", "PLACEMENT_CONFIRMED"] }
      },
      include: {
        placement: true,
        organization: {
          include: { user: { select: { email: true } } }
        }
      }
    });

    if (!application || !application.placement || !application.organization) {
      throw new AppError(404, "Application not found or not accepted");
    }

    let coordinator = null;
    if (student.institutionId) {
      coordinator = await prisma.coordinator.findFirst({
        where: { institutionId: student.institutionId },
        include: { institution: { select: { name: true } } }
      });
    }

    const pdfBuffer = await generateAcceptanceLetterPDF({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        matricNumber: student.matricNumber,
        department: student.department,
        level: student.level,
        institution: student.institution
      },
      organization: {
        companyName: application.organization.companyName,
        contactPersonName: application.organization.contactPersonName,
        contactPersonTitle: application.organization.contactPersonTitle,
        contactEmail: application.organization.contactEmail || application.organization.user?.email,
        contactPhone: application.organization.contactPhone,
        address: application.organization.address,
        state: application.organization.state
      },
      placement: {
        title: application.placement.title,
        durationWeeks: application.placement.durationWeeks,
        startDate: application.placement.startDate,
        state: application.placement.state
      },
      coordinator: coordinator
        ? {
            fullName: coordinator.fullName,
            institution: coordinator.institution
          }
        : null
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="acceptance-letter-${student.firstName}-${student.lastName}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}
