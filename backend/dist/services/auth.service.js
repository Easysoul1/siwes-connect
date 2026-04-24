"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function signToken(payload, expiresIn) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: expiresIn
    });
}
class AuthService {
    static async registerStudent(payload) {
        const existing = await database_1.prisma.user.findUnique({ where: { email: payload.email } });
        if (existing)
            throw new errors_1.AppError(409, "Email is already in use");
        const hash = await bcrypt_1.default.hash(payload.password, 12);
        const result = await database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email: payload.email, password: hash, role: client_1.UserRole.STUDENT },
                select: { id: true, email: true, role: true, createdAt: true }
            });
            const student = await tx.student.create({
                data: {
                    userId: user.id,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    department: payload.department,
                    level: payload.level,
                    cgpa: payload.cgpa,
                    currentState: payload.currentState,
                    preferredStates: payload.preferredStates
                }
            });
            return { user, student };
        });
        return result;
    }
    static async registerOrganization(payload) {
        const existing = await database_1.prisma.user.findUnique({ where: { email: payload.email } });
        if (existing)
            throw new errors_1.AppError(409, "Email is already in use");
        const hash = await bcrypt_1.default.hash(payload.password, 12);
        const result = await database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email: payload.email, password: hash, role: client_1.UserRole.ORGANIZATION },
                select: { id: true, email: true, role: true, createdAt: true }
            });
            const organization = await tx.organization.create({
                data: {
                    userId: user.id,
                    companyName: payload.companyName
                }
            });
            return { user, organization };
        });
        return result;
    }
    static async registerCoordinator(payload) {
        const existing = await database_1.prisma.user.findUnique({ where: { email: payload.email } });
        if (existing)
            throw new errors_1.AppError(409, "Email is already in use");
        const hash = await bcrypt_1.default.hash(payload.password, 12);
        const result = await database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email: payload.email, password: hash, role: client_1.UserRole.COORDINATOR },
                select: { id: true, email: true, role: true, createdAt: true }
            });
            const coordinator = await tx.coordinator.create({
                data: { userId: user.id, fullName: payload.fullName }
            });
            return { user, coordinator };
        });
        return result;
    }
    static async login(email, password) {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new errors_1.AppError(401, "Invalid credentials");
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            throw new errors_1.AppError(401, "Invalid credentials");
        const accessToken = signToken({ userId: user.id, role: user.role, type: "access" }, env_1.env.JWT_EXPIRES_IN);
        const refreshToken = signToken({ userId: user.id, role: user.role, type: "refresh" }, env_1.env.JWT_REFRESH_EXPIRES_IN);
        return {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, role: user.role }
        };
    }
    static async refresh(refreshToken) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
        }
        catch {
            throw new errors_1.AppError(401, "Invalid refresh token");
        }
        if (payload.type !== "refresh") {
            throw new errors_1.AppError(401, "Invalid refresh token");
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, email: true, role: true, isActive: true }
        });
        if (!user || !user.isActive) {
            throw new errors_1.AppError(401, "Unauthorized");
        }
        const accessToken = signToken({ userId: user.id, role: user.role, type: "access" }, env_1.env.JWT_EXPIRES_IN);
        const newRefreshToken = signToken({ userId: user.id, role: user.role, type: "refresh" }, env_1.env.JWT_REFRESH_EXPIRES_IN);
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user
        };
    }
}
exports.AuthService = AuthService;
