"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const prismaErrorMessages = {
    P1000: "Database authentication failed. Please check your database credentials.",
    P1001: "Cannot reach database server. Please ensure PostgreSQL is running.",
    P1002: "Database server timed out. Please try again later.",
    P1003: "Database does not exist.",
    P1004: "Database operation failed. Please try again.",
    P2002: "A record with this value already exists",
    P2003: "Foreign key constraint failed. The referenced record does not exist.",
    P2004: "A database constraint failed.",
    P2015: "Could not find referenced record.",
    P2025: "Record not found.",
    P2026: "Database query failed. Please check your data.",
};
function errorHandler(err, _req, res, _next) {
    console.error("Error:", err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ status: "error", message: err.message });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const message = prismaErrorMessages[err.code] || "Database operation failed. Please try again.";
        return res.status(err.code === "P2002" ? 409 : 400).json({ status: "error", message });
    }
    if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        return res.status(503).json({
            status: "error",
            message: "Database is unavailable. Please try again later."
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientRustPanicError) {
        return res.status(503).json({
            status: "error",
            message: "Database connection error. Please contact support."
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        return res.status(400).json({
            status: "error",
            message: "An unexpected database error occurred. Please try again."
        });
    }
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ status: "error", message: "Invalid token" });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({ status: "error", message: "Token has expired" });
    }
    return res.status(500).json({ status: "error", message: "Something went wrong. Please try again later." });
}
