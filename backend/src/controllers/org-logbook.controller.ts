import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";

async function getOrgByUserId(userId: string) {
  const org = await prisma.organization.findUnique({ where: { userId } });
  if (!org) throw new AppError(404, "Organization profile not found");
  return org;
}

export async function getOrgStudents(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const org = await getOrgByUserId(req.user.id);

    const applications = await prisma.application.findMany({
      where: {
        placement: { organizationId: org.id },
        status: { in: ["ACCEPTED", "PLACEMENT_CONFIRMED"] }
      },
      include: {
        student: {
          include: {
            user: { select: { email: true, isActive: true } },
            institution: { select: { name: true, shortName: true } }
          }
        },
        placement: { select: { id: true, title: true } }
      }
    });

    const seen = new Set<string>();
    const students = applications
      .map((app) => ({
        student: app.student,
        applicationId: app.id,
        placement: app.placement,
        status: app.status
      }))
      .filter((item) => {
        if (seen.has(item.student.id)) return false;
        seen.add(item.student.id);
        return true;
      });

    res.json({ data: students });
  } catch (error) {
    next(error);
  }
}

export async function getStudentLogbook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const org = await getOrgByUserId(req.user.id);
    const { studentId } = req.params;

    const application = await prisma.application.findFirst({
      where: {
        studentId,
        placement: { organizationId: org.id },
        status: { in: ["ACCEPTED", "PLACEMENT_CONFIRMED"] }
      }
    });
    if (!application) {
      throw new AppError(404, "Student not found or not placed with your organization");
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { email: true } },
        institution: { select: { name: true, shortName: true } }
      }
    });

    const entries = await prisma.logbookEntry.findMany({
      where: { studentId },
      orderBy: [{ weekNumber: "asc" }, { date: "asc" }]
    });

    res.json({ data: { student, entries } });
  } catch (error) {
    next(error);
  }
}

const commentSchema = z.object({
  comment: z.string().trim().min(1),
  signature: z.string().trim().min(1)
});

export async function addOrgComment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const org = await getOrgByUserId(req.user.id);
    const { entryId } = req.params;
    const payload = commentSchema.parse(req.body);

    const entry = await prisma.logbookEntry.findUnique({
      where: { id: entryId },
      include: {
        student: {
          include: {
            applications: {
              where: {
                placement: { organizationId: org.id },
                status: { in: ["ACCEPTED", "PLACEMENT_CONFIRMED"] }
              }
            }
          }
        }
      }
    });

    if (!entry || entry.student.applications.length === 0) {
      throw new AppError(404, "Logbook entry not found");
    }

    const updated = await prisma.logbookEntry.update({
      where: { id: entryId },
      data: {
        organizationComment: payload.comment,
        organizationSignature: payload.signature,
        organizationReviewedAt: new Date()
      }
    });

    res.json({ message: "Comment added", data: updated });
  } catch (error) {
    next(error);
  }
}
