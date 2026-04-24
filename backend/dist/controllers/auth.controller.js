"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerStudent = registerStudent;
exports.registerOrganization = registerOrganization;
exports.registerCoordinator = registerCoordinator;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.me = me;
const zod_1 = require("zod");
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const auth_service_1 = require("../services/auth.service");
const studentRegistrationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    firstName: zod_1.z.string().trim().min(2),
    lastName: zod_1.z.string().trim().min(2),
    department: zod_1.z.string().trim().min(2),
    level: zod_1.z.string().trim().min(2),
    cgpa: zod_1.z.number().min(0).max(5).optional(),
    currentState: zod_1.z.string().trim().min(2),
    preferredStates: zod_1.z.array(zod_1.z.string().trim().min(2)).default([])
});
const organizationRegistrationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    companyName: zod_1.z.string().trim().min(2)
});
const coordinatorRegistrationSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    fullName: zod_1.z.string().trim().min(2)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8)
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(16)
});
async function registerStudent(req, res, next) {
    try {
        const payload = studentRegistrationSchema.parse(req.body);
        const result = await auth_service_1.AuthService.registerStudent(payload);
        res.status(201).json({ message: "Student registration successful", data: result });
    }
    catch (error) {
        next(error);
    }
}
async function registerOrganization(req, res, next) {
    try {
        const payload = organizationRegistrationSchema.parse(req.body);
        const result = await auth_service_1.AuthService.registerOrganization(payload);
        res.status(201).json({ message: "Organization registration successful", data: result });
    }
    catch (error) {
        next(error);
    }
}
async function registerCoordinator(req, res, next) {
    try {
        const payload = coordinatorRegistrationSchema.parse(req.body);
        const result = await auth_service_1.AuthService.registerCoordinator(payload);
        res.status(201).json({ message: "Coordinator registration successful", data: result });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const payload = loginSchema.parse(req.body);
        const result = await auth_service_1.AuthService.login(payload.email, payload.password);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function refresh(req, res, next) {
    try {
        const payload = refreshSchema.parse(req.body);
        const result = await auth_service_1.AuthService.refresh(payload.refreshToken);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
}
async function logout(_req, res) {
    res.status(200).json({ message: "Logout successful" });
}
async function me(req, res, next) {
    try {
        if (!req.user) {
            throw new errors_1.AppError(401, "Unauthorized");
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                student: true,
                organization: true,
                coordinator: true
            }
        });
        if (!user) {
            throw new errors_1.AppError(404, "User not found");
        }
        res.status(200).json({ user });
    }
    catch (error) {
        next(error);
    }
}
