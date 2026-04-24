"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
require("dotenv/config");
const schema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(5000),
    JWT_SECRET: zod_1.z.string().min(32).default("change-this-super-secret-jwt-key-32-chars"),
    JWT_EXPIRES_IN: zod_1.z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default("7d"),
    DATABASE_URL: zod_1.z.string().default("postgresql://siwes:siwes123@localhost:5432/siwes_connect"),
    FRONTEND_URL: zod_1.z.string().default("http://localhost:3000")
});
exports.env = schema.parse(process.env);
