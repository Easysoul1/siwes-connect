import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../utils/errors";
import { EmailService } from "./email.service";

type RegisterBasePayload = {
  email: string;
  password: string;
};

type RegisterStudentPayload = RegisterBasePayload & {
  firstName: string;
  lastName: string;
  department: string;
  level: string;
  cgpa?: number;
  currentState: string;
  preferredStates: string[];
};

type RegisterOrganizationPayload = RegisterBasePayload & {
  companyName: string;
};

type RegisterCoordinatorPayload = RegisterBasePayload & {
  fullName: string;
};

type TokenPayload = {
  userId: string;
  role: UserRole;
  type: "access" | "refresh";
};

function signAccessToken(payload: TokenPayload, expiresIn: string) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
  });
}

function signRefreshToken(payload: TokenPayload, expiresIn: string) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
  });
}

function expiryDateFromNow(spec: string) {
  const normalized = spec.trim().toLowerCase();
  const match = normalized.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new AppError(500, `Invalid expiry config: ${spec}`);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multiplier =
    unit === "s" ? 1000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return new Date(Date.now() + value * multiplier);
}

export class AuthService {
  static async registerStudent(payload: RegisterStudentPayload) {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new AppError(409, "Email is already in use");

    const hash = await bcrypt.hash(payload.password, 12);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: payload.email, password: hash, role: UserRole.STUDENT },
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

      const verificationToken = crypto.randomUUID();
      await tx.emailVerificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return { user, student, verificationToken };
    });

    await EmailService.sendVerificationEmail(result.user.email, result.verificationToken);
    return {
      user: result.user,
      student: result.student
    };
  }

  static async registerOrganization(payload: RegisterOrganizationPayload) {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new AppError(409, "Email is already in use");

    const hash = await bcrypt.hash(payload.password, 12);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: payload.email, password: hash, role: UserRole.ORGANIZATION },
        select: { id: true, email: true, role: true, createdAt: true }
      });

      const organization = await tx.organization.create({
        data: {
          userId: user.id,
          companyName: payload.companyName
        }
      });

      const verificationToken = crypto.randomUUID();
      await tx.emailVerificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return { user, organization, verificationToken };
    });

    await EmailService.sendVerificationEmail(result.user.email, result.verificationToken);
    return {
      user: result.user,
      organization: result.organization
    };
  }

  static async registerCoordinator(payload: RegisterCoordinatorPayload) {
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) throw new AppError(409, "Email is already in use");

    const hash = await bcrypt.hash(payload.password, 12);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email: payload.email, password: hash, role: UserRole.COORDINATOR },
        select: { id: true, email: true, role: true, createdAt: true }
      });

      const coordinator = await tx.coordinator.create({
        data: { userId: user.id, fullName: payload.fullName }
      });

      const verificationToken = crypto.randomUUID();
      await tx.emailVerificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      return { user, coordinator, verificationToken };
    });

    await EmailService.sendVerificationEmail(result.user.email, result.verificationToken);
    return {
      user: result.user,
      coordinator: result.coordinator
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, "Invalid credentials");
    if (!user.isActive) throw new AppError(403, "Account is inactive");
    if (!user.isEmailVerified) throw new AppError(403, "Please verify your email before login");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const accessToken = signAccessToken(
      { userId: user.id, role: user.role, type: "access" },
      env.JWT_EXPIRES_IN
    );
    const refreshToken = signRefreshToken(
      { userId: user.id, role: user.role, type: "refresh" },
      env.JWT_REFRESH_EXPIRES_IN
    );
    const refreshExpiresAt = expiryDateFromNow(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.refreshToken.create({
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

  static async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      throw new AppError(401, "Invalid refresh token");
    }

    if (payload.type !== "refresh") {
      throw new AppError(401, "Invalid refresh token");
    }

    const [tokenRecord, user] = await Promise.all([
      prisma.refreshToken.findUnique({ where: { token: refreshToken } }),
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isActive: true, isEmailVerified: true }
      })
    ]);

    if (!tokenRecord) throw new AppError(401, "Invalid refresh token");
    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new AppError(401, "Refresh token has expired");
    }

    if (!user || !user.isActive || !user.isEmailVerified) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new AppError(401, "Unauthorized");
    }

    const accessToken = signAccessToken(
      { userId: user.id, role: user.role, type: "access" },
      env.JWT_EXPIRES_IN
    );
    const newRefreshToken = signRefreshToken(
      { userId: user.id, role: user.role, type: "refresh" },
      env.JWT_REFRESH_EXPIRES_IN
    );
    const refreshExpiresAt = expiryDateFromNow(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
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

  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId
        }
      });
      return;
    }

    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  static async verifyEmail(token: string) {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!record || record.used) {
      throw new AppError(400, "Invalid verification token");
    }
    if (record.expiresAt < new Date()) {
      throw new AppError(400, "Verification token has expired");
    }

    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
        select: { id: true, email: true, role: true }
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { used: true }
      })
    ]);

    const accessToken = signAccessToken(
      { userId: user.id, role: user.role, type: "access" },
      env.JWT_EXPIRES_IN
    );
    const refreshToken = signRefreshToken(
      { userId: user.id, role: user.role, type: "refresh" },
      env.JWT_REFRESH_EXPIRES_IN
    );
    const refreshExpiresAt = expiryDateFromNow(env.JWT_REFRESH_EXPIRES_IN);

    await prisma.refreshToken.create({
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

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return;
    }

    const token = crypto.randomUUID();
    await prisma.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    await EmailService.sendPasswordResetEmail(email, token);
  }

  static async resetPassword(token: string, password: string) {
    const record = await prisma.passwordReset.findUnique({
      where: { token }
    });

    if (!record || record.used) {
      throw new AppError(400, "Invalid reset token");
    }
    if (record.expiresAt < new Date()) {
      throw new AppError(400, "Reset token has expired");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { used: true }
      }),
      prisma.refreshToken.deleteMany({
        where: { userId: record.userId }
      })
    ]);
  }
}
