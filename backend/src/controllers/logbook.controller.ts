import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";

const createEntrySchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  date: z.string().refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  activity: z.string().trim().min(3),
  description: z.string().trim().min(10),
  supervisorComment: z.string().trim().optional()
});

const updateEntrySchema = z.object({
  weekNumber: z.number().int().min(1).max(52).optional(),
  date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Invalid date")
    .optional(),
  activity: z.string().trim().min(3).optional(),
  description: z.string().trim().min(10).optional(),
  supervisorComment: z.string().trim().optional()
});

async function getStudentByUserId(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId }
  });
  if (!student) throw new AppError(404, "Student profile not found");
  return student;
}

export async function getMyLogbook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const entries = await prisma.logbookEntry.findMany({
      where: { studentId: student.id },
      orderBy: [{ weekNumber: "asc" }, { date: "asc" }]
    });

    res.json({ data: entries });
  } catch (error) {
    next(error);
  }
}

export async function getLogbookEntryById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const entry = await prisma.logbookEntry.findUnique({
      where: { id: req.params.id }
    });

    if (!entry || entry.studentId !== student.id) {
      throw new AppError(404, "Logbook entry not found");
    }

    res.json({ data: entry });
  } catch (error) {
    next(error);
  }
}

export async function createLogbookEntry(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);
    const payload = createEntrySchema.parse(req.body);

    const entry = await prisma.logbookEntry.create({
      data: {
        studentId: student.id,
        weekNumber: payload.weekNumber,
        date: new Date(payload.date),
        activity: payload.activity,
        description: payload.description,
        supervisorComment: payload.supervisorComment
      }
    });

    res.status(201).json({ message: "Logbook entry created", data: entry });
  } catch (error) {
    next(error);
  }
}

export async function updateLogbookEntry(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const existing = await prisma.logbookEntry.findUnique({
      where: { id: req.params.id }
    });

    if (!existing || existing.studentId !== student.id) {
      throw new AppError(404, "Logbook entry not found");
    }
    if (existing.status !== "DRAFT") {
      throw new AppError(409, "Cannot edit a submitted logbook entry");
    }

    const payload = updateEntrySchema.parse(req.body);
    const updateData: Record<string, unknown> = {};
    if (payload.weekNumber !== undefined) updateData.weekNumber = payload.weekNumber;
    if (payload.date !== undefined) updateData.date = new Date(payload.date);
    if (payload.activity !== undefined) updateData.activity = payload.activity;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.supervisorComment !== undefined) updateData.supervisorComment = payload.supervisorComment;

    const updated = await prisma.logbookEntry.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: "Logbook entry updated", data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteLogbookEntry(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const existing = await prisma.logbookEntry.findUnique({
      where: { id: req.params.id }
    });

    if (!existing || existing.studentId !== student.id) {
      throw new AppError(404, "Logbook entry not found");
    }
    if (existing.status !== "DRAFT") {
      throw new AppError(409, "Cannot delete a submitted logbook entry");
    }

    await prisma.logbookEntry.delete({ where: { id: req.params.id } });
    res.json({ message: "Logbook entry deleted" });
  } catch (error) {
    next(error);
  }
}

export async function submitLogbook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    const student = await getStudentByUserId(req.user.id);

    const entry = await prisma.logbookEntry.findUnique({
      where: { id: req.params.id }
    });

    if (!entry || entry.studentId !== student.id) {
      throw new AppError(404, "Logbook entry not found");
    }
    if (entry.status !== "DRAFT") {
      throw new AppError(409, "Entry already submitted");
    }

    const updated = await prisma.logbookEntry.update({
      where: { id: req.params.id },
      data: { status: "SUBMITTED" }
    });

    res.json({ message: "Logbook entry submitted", data: updated });
  } catch (error) {
    next(error);
  }
}
