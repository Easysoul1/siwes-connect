import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ status: "error", message: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ status: "error", message: "A record with this value already exists" });
    }

    return res.status(400).json({ status: "error", message: "Database request failed" });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      status: "error",
      message: "Database is unavailable. Ensure PostgreSQL is running and accessible."
    });
  }

  console.error(err);
  return res.status(500).json({ status: "error", message: "Internal server error" });
}
