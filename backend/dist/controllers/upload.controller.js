"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResume = uploadResume;
exports.uploadDocument = uploadDocument;
exports.uploadAvatar = uploadAvatar;
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const upload_service_1 = require("../services/upload.service");
async function uploadResume(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        if (!req.file)
            throw new errors_1.AppError(400, "No file uploaded");
        const student = await database_1.prisma.student.findUnique({ where: { userId: req.user.id } });
        if (!student)
            throw new errors_1.AppError(404, "Student profile not found");
        const uploaded = await upload_service_1.UploadService.uploadBuffer(req.file.buffer, {
            folder: "siwes/resumes",
            resourceType: "raw"
        });
        const updated = await database_1.prisma.student.update({
            where: { id: student.id },
            data: { resumeUrl: uploaded.url }
        });
        res.status(201).json({
            message: "Resume uploaded successfully",
            data: { resumeUrl: updated.resumeUrl }
        });
    }
    catch (error) {
        next(error);
    }
}
async function uploadDocument(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        if (!req.file)
            throw new errors_1.AppError(400, "No file uploaded");
        const documentTypeRaw = typeof req.body.documentType === "string" ? req.body.documentType : "";
        const documentType = documentTypeRaw.trim().toLowerCase();
        if (!["cac", "itf", "logo"].includes(documentType)) {
            throw new errors_1.AppError(400, "documentType must be one of: cac, itf, logo");
        }
        const organization = await database_1.prisma.organization.findUnique({ where: { userId: req.user.id } });
        if (!organization)
            throw new errors_1.AppError(404, "Organization profile not found");
        const uploaded = await upload_service_1.UploadService.uploadBuffer(req.file.buffer, {
            folder: documentType === "logo" ? "siwes/logos" : "siwes/documents",
            resourceType: "auto"
        });
        const data = documentType === "cac"
            ? { cacDocumentUrl: uploaded.url }
            : documentType === "itf"
                ? { itfDocumentUrl: uploaded.url }
                : { logoUrl: uploaded.url };
        const updated = await database_1.prisma.organization.update({
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
    }
    catch (error) {
        next(error);
    }
}
async function uploadAvatar(req, res, next) {
    try {
        if (!req.user)
            throw new errors_1.AppError(401, "Unauthorized");
        if (!req.file)
            throw new errors_1.AppError(400, "No file uploaded");
        const uploaded = await upload_service_1.UploadService.uploadBuffer(req.file.buffer, {
            folder: "siwes/avatars",
            resourceType: "image"
        });
        if (req.user.role === client_1.UserRole.STUDENT) {
            const student = await database_1.prisma.student.findUnique({ where: { userId: req.user.id } });
            if (!student)
                throw new errors_1.AppError(404, "Student profile not found");
            await database_1.prisma.student.update({
                where: { id: student.id },
                data: { profilePhoto: uploaded.url }
            });
        }
        if (req.user.role === client_1.UserRole.ORGANIZATION) {
            const organization = await database_1.prisma.organization.findUnique({ where: { userId: req.user.id } });
            if (!organization)
                throw new errors_1.AppError(404, "Organization profile not found");
            await database_1.prisma.organization.update({
                where: { id: organization.id },
                data: { logoUrl: uploaded.url }
            });
        }
        res.status(201).json({
            message: "Avatar uploaded successfully",
            data: { url: uploaded.url }
        });
    }
    catch (error) {
        next(error);
    }
}
