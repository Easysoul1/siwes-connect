"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function errorHandler(err, _req, res, _next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: "error",
            message: "Validation failed",
            errors: err.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message
            }))
        });
    }
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({ status: "error", message: err.message });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            return res.status(409).json({ status: "error", message: "A record with this value already exists" });
        }
        return res.status(400).json({ status: "error", message: "Database request failed" });
    }
    if (err instanceof client_1.Prisma.PrismaClientInitializationError) {
        return res.status(503).json({
            status: "error",
            message: "Database is unavailable. Ensure PostgreSQL is running and accessible."
        });
    }
    console.error(err);
    return res.status(500).json({ status: "error", message: "Internal server error" });
}
