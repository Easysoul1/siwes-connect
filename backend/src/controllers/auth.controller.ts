import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/database";
import { AppError } from "../utils/errors";
import { AuthService } from "../services/auth.service";

const studentRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  department: z.string().trim().min(2),
  level: z.string().trim().min(2),
  cgpa: z.number().min(0).max(5).optional(),
  currentState: z.string().trim().min(2),
  preferredStates: z.array(z.string().trim().min(2)).default([])
});

const organizationRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().trim().min(2)
});

const coordinatorRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().trim().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(16)
});

export async function registerStudent(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = studentRegistrationSchema.parse(req.body);
    const result = await AuthService.registerStudent(payload);
    res.status(201).json({ message: "Student registration successful", data: result });
  } catch (error) {
    next(error);
  }
}

export async function registerOrganization(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = organizationRegistrationSchema.parse(req.body);
    const result = await AuthService.registerOrganization(payload);
    res.status(201).json({ message: "Organization registration successful", data: result });
  } catch (error) {
    next(error);
  }
}

export async function registerCoordinator(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = coordinatorRegistrationSchema.parse(req.body);
    const result = await AuthService.registerCoordinator(payload);
    res.status(201).json({ message: "Coordinator registration successful", data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await AuthService.login(payload.email, payload.password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = refreshSchema.parse(req.body);
    const result = await AuthService.refresh(payload.refreshToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  res.status(200).json({ message: "Logout successful" });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    const user = await prisma.user.findUnique({
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
      throw new AppError(404, "User not found");
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}
