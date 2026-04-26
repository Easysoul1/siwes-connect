"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const auditLogger_1 = require("./middleware/auditLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiters_1 = require("./middleware/rateLimiters");
const routes_1 = require("./routes");
exports.app = (0, express_1.default)();
const allowedOrigin = env_1.env.FRONTEND_URL.replace(/\/$/, "");
exports.app.use((0, cors_1.default)({
    origin: [allowedOrigin, "http://localhost:3000"],
    credentials: true
}));
exports.app.use((0, helmet_1.default)());
exports.app.use(rateLimiters_1.generalRateLimiter);
exports.app.use(express_1.default.json({ limit: "1mb" }));
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use("/api/v1/auth", rateLimiters_1.authRateLimiter);
exports.app.use(auditLogger_1.auditLogger);
exports.app.use("/api/v1", routes_1.router);
exports.app.use(errorHandler_1.errorHandler);
