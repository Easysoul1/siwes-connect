import { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";
import { UploadService } from "../services/upload.service";

export async function uploadResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    if (!req.file) throw new AppError(400, "No file uploaded");

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) throw new AppError(404, "Student profile not found");

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

export async function uploadDocument(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    if (!req.file) throw new AppError(400, "No file uploaded");

    const documentTypeRaw = typeof req.body.documentType === "string" ? req.body.documentType : "";
    const documentType = documentTypeRaw.trim().toLowerCase();
    if (!["cac", "itf", "logo"].includes(documentType)) {
      throw new AppError(400, "documentType must be one of: cac, itf, logo");
    }

    const organization = await prisma.organization.findUnique({ where: { userId: req.user.id } });
    if (!organization) throw new AppError(404, "Organization profile not found");

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

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, "Unauthorized");
    if (!req.file) throw new AppError(400, "No file uploaded");

    const uploaded = await UploadService.uploadBuffer(req.file.buffer, {
      folder: "siwes/avatars",
      resourceType: "image"
    });

    if (req.user.role === UserRole.STUDENT) {
      const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) throw new AppError(404, "Student profile not found");
      await prisma.student.update({
        where: { id: student.id },
        data: { profilePhoto: uploaded.url }
      });
    }

    if (req.user.role === UserRole.ORGANIZATION) {
      const organization = await prisma.organization.findUnique({ where: { userId: req.user.id } });
      if (!organization) throw new AppError(404, "Organization profile not found");
      await prisma.organization.update({
        where: { id: organization.id },
        data: { logoUrl: uploaded.url }
      });
    }

    res.status(201).json({
      message: "Avatar uploaded successfully",
      data: { url: uploaded.url }
    });
  } catch (error) {
    next(error);
  }
}
