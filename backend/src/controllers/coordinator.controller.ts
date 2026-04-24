import { NextFunction, Request, Response } from "express";
import { ApplicationStatus, PlacementStatus, UserRole, VerificationStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";

const moderationSchema = z.object({
  reason: z.string().trim().min(3).optional()
});

const announcementSchema = z.object({
  title: z.string().trim().min(3),
  message: z.string().trim().min(3),
  targetRole: z.enum(["ALL", "STUDENT", "ORGANIZATION"]).default("ALL")
});

export async function getOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as VerificationStatus | undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const organizations = await prisma.organization.findMany({
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
  } catch (error) {
    next(error);
  }
}

export async function approveOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!org) throw new AppError(404, "Organization not found");

    const [updated] = await prisma.$transaction([
      prisma.organization.update({
        where: { id: org.id },
        data: { verificationStatus: VerificationStatus.APPROVED }
      }),
      prisma.notification.create({
        data: {
          userId: org.userId,
          title: "Organization Approved",
          message: "Your organization has been approved and can now post placements."
        }
      })
    ]);

    res.json({ message: "Organization approved", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function rejectOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = moderationSchema.parse(req.body);
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!org) throw new AppError(404, "Organization not found");

    const [updated] = await prisma.$transaction([
      prisma.organization.update({
        where: { id: org.id },
        data: { verificationStatus: VerificationStatus.REJECTED }
      }),
      prisma.notification.create({
        data: {
          userId: org.userId,
          title: "Organization Rejected",
          message: reason
            ? `Your organization verification was rejected. Reason: ${reason}`
            : "Your organization verification was rejected."
        }
      })
    ]);

    res.json({ message: "Organization rejected", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function suspendOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = moderationSchema.parse(req.body);
    const org = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!org) throw new AppError(404, "Organization not found");

    const [updatedOrg] = await prisma.$transaction([
      prisma.organization.update({
        where: { id: org.id },
        data: { verificationStatus: VerificationStatus.REJECTED }
      }),
      prisma.user.update({
        where: { id: org.userId },
        data: { isActive: false }
      }),
      prisma.notification.create({
        data: {
          userId: org.userId,
          title: "Organization Suspended",
          message: reason
            ? `Your organization account has been suspended. Reason: ${reason}`
            : "Your organization account has been suspended."
        }
      })
    ]);

    res.json({ message: "Organization suspended", data: updatedOrg });
  } catch (error) {
    next(error);
  }
}

export async function getPendingOrganizations(req: Request, res: Response, next: NextFunction) {
  try {
    req.query.status = VerificationStatus.PENDING;
    await getOrganizations(req, res, next);
  } catch (error) {
    next(error);
  }
}

export async function getOrganizationById(req: Request, res: Response, next: NextFunction) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, email: true, isActive: true, createdAt: true } },
        placements: {
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!organization) throw new AppError(404, "Organization not found");
    res.json({ data: organization });
  } catch (error) {
    next(error);
  }
}

export async function getStudents(req: Request, res: Response, next: NextFunction) {
  try {
    const department = typeof req.query.department === "string" ? req.query.department : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;

    const students = await prisma.student.findMany({
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
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await prisma.student.findUnique({
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

    if (!student) throw new AppError(404, "Student not found");
    res.json({ data: student });
  } catch (error) {
    next(error);
  }
}

export async function getPlacements(req: Request, res: Response, next: NextFunction) {
  try {
    const status =
      typeof req.query.status === "string" ? (req.query.status as PlacementStatus) : undefined;

    const placements = await prisma.placement.findMany({
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
  } catch (error) {
    next(error);
  }
}

export async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const status =
      typeof req.query.status === "string"
        ? (req.query.status as ApplicationStatus)
        : undefined;

    const applications = await prisma.application.findMany({
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
  } catch (error) {
    next(error);
  }
}

async function buildAnalytics() {
  const [
    totalStudents,
    totalOrganizations,
    pendingOrganizations,
    totalPlacements,
    activePlacements,
    totalApplications,
    confirmedApplications
  ] = await prisma.$transaction([
    prisma.student.count(),
    prisma.organization.count(),
    prisma.organization.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
    prisma.placement.count(),
    prisma.placement.count({ where: { status: "ACTIVE" } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: ApplicationStatus.PLACEMENT_CONFIRMED } })
  ]);

  const placementByState = await prisma.placement.groupBy({
    by: ["state"],
    _count: { state: true },
    orderBy: { _count: { state: "desc" } }
  });

  const applicationByStatus = await prisma.application.groupBy({
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

export async function getDashboardStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await buildAnalytics();
    res.json({ data: analytics.overview });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await buildAnalytics();
    res.json({ data: analytics });
  } catch (error) {
    next(error);
  }
}

export async function exportAnalytics(_req: Request, res: Response, next: NextFunction) {
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
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="siwes-analytics-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const payload = announcementSchema.parse(req.body);

    const targetRoles =
      payload.targetRole === "ALL"
        ? [UserRole.STUDENT, UserRole.ORGANIZATION]
        : [payload.targetRole];

    const targetUsers = await prisma.user.findMany({
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
    await prisma.notification.createMany({
      data: targetUsers.map((user) => ({
        userId: user.id,
        title: `${tag}:${payload.title}`,
        message: payload.message
      }))
    });

    res.status(201).json({
      message: "Announcement created",
      data: { sent: targetUsers.length, tag }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const prefix = `ANN:${req.user.id}:`;

    const records = await prisma.notification.findMany({
      where: {
        title: { startsWith: prefix }
      },
      orderBy: { createdAt: "desc" }
    });

    const grouped = new Map<
      string,
      { id: string; title: string; message: string; createdAt: Date; recipients: number }
    >();
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
      } else {
        existing.recipients += 1;
      }
    }

    res.json({ data: Array.from(grouped.values()) });
  } catch (error) {
    next(error);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const record = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!record) throw new AppError(404, "Announcement not found");

    const tag = record.title.split(":").slice(0, 3).join(":");
    if (!tag.startsWith(`ANN:${req.user.id}:`)) {
      throw new AppError(403, "You cannot delete this announcement");
    }

    await prisma.notification.deleteMany({
      where: {
        title: { startsWith: tag }
      }
    });

    res.json({ message: "Announcement deleted" });
  } catch (error) {
    next(error);
  }
}
