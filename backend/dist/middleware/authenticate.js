"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = require("../config/database");
async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if ("type" in payload && payload.type === "refresh") {
            return res.status(401).json({ message: "Invalid token type" });
        }
        const user = await database_1.prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, role: true, email: true, isActive: true }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = { id: user.id, role: user.role, email: user.email };
        next();
    }
    catch {
        return res.status(401).json({ message: "Invalid token" });
    }
}
