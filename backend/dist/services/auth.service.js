"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const email_service_1 = require("./email.service");
function signAccessToken(payload, expiresIn) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: expiresIn
    });
}
function signRefreshToken(payload, expiresIn) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: expiresIn
    });
}
function expiryDateFromNow(spec) {
    const normalized = spec.trim().toLowerCase();
    const match = normalized.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new errors_1.AppError(500, `Invalid expiry config: ${spec}`);
    }
    const value = Number(match[1]);
    const unit = match[2];
    const multiplier = unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
    return new Date(Date.now() + value * multiplier);
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
            const verificationToken = crypto_1.default.randomUUID();
            await tx.emailVerificationToken.create({
                data: {
                    token: verificationToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
            return { user, student, verificationToken };
        });
        await email_service_1.EmailService.sendVerificationEmail(result.user.email, result.verificationToken);
        return {
            user: result.user,
            student: result.student
        };
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
            const verificationToken = crypto_1.default.randomUUID();
            await tx.emailVerificationToken.create({
                data: {
                    token: verificationToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
            return { user, organization, verificationToken };
        });
        await email_service_1.EmailService.sendVerificationEmail(result.user.email, result.verificationToken);
        return {
            user: result.user,
            organization: result.organization
        };
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
            const verificationToken = crypto_1.default.randomUUID();
            await tx.emailVerificationToken.create({
                data: {
                    token: verificationToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
            return { user, coordinator, verificationToken };
        });
        await email_service_1.EmailService.sendVerificationEmail(result.user.email, result.verificationToken);
        return {
            user: result.user,
            coordinator: result.coordinator
        };
    }
    static async login(email, password) {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new errors_1.AppError(401, "Invalid credentials");
        if (!user.isActive)
            throw new errors_1.AppError(403, "Account is inactive");
        if (!user.isEmailVerified)
            throw new errors_1.AppError(403, "Please verify your email before login");
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            throw new errors_1.AppError(401, "Invalid credentials");
        const accessToken = signAccessToken({ userId: user.id, role: user.role, type: "access" }, env_1.env.JWT_EXPIRES_IN);
        const refreshToken = signRefreshToken({ userId: user.id, role: user.role, type: "refresh" }, env_1.env.JWT_REFRESH_EXPIRES_IN);
        const refreshExpiresAt = expiryDateFromNow(env_1.env.JWT_REFRESH_EXPIRES_IN);
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: refreshExpiresAt
            }
        });
        return {
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, role: user.role }
        };
    }
    static async refresh(refreshToken) {
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
        }
        catch {
            throw new errors_1.AppError(401, "Invalid refresh token");
        }
        if (payload.type !== "refresh") {
            throw new errors_1.AppError(401, "Invalid refresh token");
        }
        const [tokenRecord, user] = await Promise.all([
            database_1.prisma.refreshToken.findUnique({ where: { token: refreshToken } }),
            database_1.prisma.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, email: true, role: true, isActive: true, isEmailVerified: true }
            })
        ]);
        if (!tokenRecord)
            throw new errors_1.AppError(401, "Invalid refresh token");
        if (tokenRecord.expiresAt < new Date()) {
            await database_1.prisma.refreshToken.delete({ where: { token: refreshToken } });
            throw new errors_1.AppError(401, "Refresh token has expired");
        }
        if (!user || !user.isActive || !user.isEmailVerified) {
            await database_1.prisma.refreshToken.delete({ where: { token: refreshToken } });
            throw new errors_1.AppError(401, "Unauthorized");
        }
        const accessToken = signAccessToken({ userId: user.id, role: user.role, type: "access" }, env_1.env.JWT_EXPIRES_IN);
        const newRefreshToken = signRefreshToken({ userId: user.id, role: user.role, type: "refresh" }, env_1.env.JWT_REFRESH_EXPIRES_IN);
        const refreshExpiresAt = expiryDateFromNow(env_1.env.JWT_REFRESH_EXPIRES_IN);
        await database_1.prisma.$transaction([
            database_1.prisma.refreshToken.delete({ where: { token: refreshToken } }),
            database_1.prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: user.id,
                    expiresAt: refreshExpiresAt
                }
            })
        ]);
        return {
            accessToken,
            refreshToken: newRefreshToken,
            user
        };
    }
    static async logout(userId, refreshToken) {
        if (refreshToken) {
            await database_1.prisma.refreshToken.deleteMany({
                where: {
                    token: refreshToken,
                    userId
                }
            });
            return;
        }
        await database_1.prisma.refreshToken.deleteMany({ where: { userId } });
    }
    static async verifyEmail(token) {
        const record = await database_1.prisma.emailVerificationToken.findUnique({
            where: { token },
            include: { user: true }
        });
        if (!record || record.used) {
            throw new errors_1.AppError(400, "Invalid verification token");
        }
        if (record.expiresAt < new Date()) {
            throw new errors_1.AppError(400, "Verification token has expired");
        }
        const [user] = await database_1.prisma.$transaction([
            database_1.prisma.user.update({
                where: { id: record.userId },
                data: { isEmailVerified: true },
                select: { id: true, email: true, role: true }
            }),
            database_1.prisma.emailVerificationToken.update({
                where: { id: record.id },
                data: { used: true }
            })
        ]);
        const accessToken = signAccessToken({ userId: user.id, role: user.role, type: "access" }, env_1.env.JWT_EXPIRES_IN);
        const refreshToken = signRefreshToken({ userId: user.id, role: user.role, type: "refresh" }, env_1.env.JWT_REFRESH_EXPIRES_IN);
        const refreshExpiresAt = expiryDateFromNow(env_1.env.JWT_REFRESH_EXPIRES_IN);
        await database_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: refreshExpiresAt
            }
        });
        return {
            accessToken,
            refreshToken,
            user
        };
    }
    static async forgotPassword(email) {
        const user = await database_1.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, isActive: true }
        });
        if (!user || !user.isActive) {
            return;
        }
        const token = crypto_1.default.randomUUID();
        await database_1.prisma.passwordReset.create({
            data: {
                token,
                userId: user.id,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            }
        });
        await email_service_1.EmailService.sendPasswordResetEmail(email, token);
    }
    static async resetPassword(token, password) {
        const record = await database_1.prisma.passwordReset.findUnique({
            where: { token }
        });
        if (!record || record.used) {
            throw new errors_1.AppError(400, "Invalid reset token");
        }
        if (record.expiresAt < new Date()) {
            throw new errors_1.AppError(400, "Reset token has expired");
        }
        const passwordHash = await bcrypt_1.default.hash(password, 12);
        await database_1.prisma.$transaction([
            database_1.prisma.user.update({
                where: { id: record.userId },
                data: { password: passwordHash }
            }),
            database_1.prisma.passwordReset.update({
                where: { id: record.id },
                data: { used: true }
            }),
            database_1.prisma.refreshToken.deleteMany({
                where: { userId: record.userId }
            })
        ]);
    }
}
exports.AuthService = AuthService;
