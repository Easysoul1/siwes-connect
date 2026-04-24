import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

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

function signToken(payload: TokenPayload, expiresIn: string) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
  });
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

      return { user, student };
    });

    return result;
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

      return { user, organization };
    });

    return result;
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

      return { user, coordinator };
    });

    return result;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError(401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, "Invalid credentials");

    const accessToken = signToken(
      { userId: user.id, role: user.role, type: "access" },
      env.JWT_EXPIRES_IN
    );
    const refreshToken = signToken(
      { userId: user.id, role: user.role, type: "refresh" },
      env.JWT_REFRESH_EXPIRES_IN
    );

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role }
    };
  }

  static async refresh(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = jwt.verify(refreshToken, env.JWT_SECRET) as TokenPayload;
    } catch {
      throw new AppError(401, "Invalid refresh token");
    }

    if (payload.type !== "refresh") {
      throw new AppError(401, "Invalid refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, "Unauthorized");
    }

    const accessToken = signToken(
      { userId: user.id, role: user.role, type: "access" },
      env.JWT_EXPIRES_IN
    );
    const newRefreshToken = signToken(
      { userId: user.id, role: user.role, type: "refresh" },
      env.JWT_REFRESH_EXPIRES_IN
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user
    };
  }
}
