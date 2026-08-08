import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";

async function getCoordByUserId(userId: string) {
  const coord = await prisma.coordinator.findUnique({ where: { userId } });
  if (!coord) throw new AppError(404, "Coordinator profile not found");
  return coord;
}

export async function getCoordStudents(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const coord = await getCoordByUserId(req.user.id);

    if (!coord.institutionId) {
      return res.json({ data: [] });
    }

    const students = await prisma.student.findMany({
      where: { institutionId: coord.institutionId },
      include: {
        user: { select: { email: true, isActive: true } },
        institution: { select: { name: true, shortName: true } },
        applications: {
          select: { id: true, status: true, createdAt: true },
          orderBy: { createdAt: "desc" }
        }
      },
      orderBy: { firstName: "asc" }
    });

    res.json({ data: students });
  } catch (error) {
    next(error);
  }
}

export async function getStudentLogbook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const coord = await getCoordByUserId(req.user.id);
    const { studentId } = req.params;

    if (!coord.institutionId) {
      throw new AppError(403, "No institution linked to your account");
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { email: true } },
        institution: { select: { name: true, shortName: true } }
      }
    });

    if (!student || student.institutionId !== coord.institutionId) {
      throw new AppError(404, "Student not found in your institution");
    }

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

export async function addCoordComment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const coord = await getCoordByUserId(req.user.id);
    const { entryId } = req.params;
    const payload = commentSchema.parse(req.body);

    if (!coord.institutionId) {
      throw new AppError(403, "No institution linked to your account");
    }

    const entry = await prisma.logbookEntry.findUnique({
      where: { id: entryId },
      include: { student: true }
    });

    if (!entry || entry.student.institutionId !== coord.institutionId) {
      throw new AppError(404, "Logbook entry not found");
    }

    const updated = await prisma.logbookEntry.update({
      where: { id: entryId },
      data: {
        coordinatorComment: payload.comment,
        coordinatorSignature: payload.signature,
        coordinatorReviewedAt: new Date()
      }
    });

    res.json({ message: "Comment added", data: updated });
  } catch (error) {
    next(error);
  }
}
