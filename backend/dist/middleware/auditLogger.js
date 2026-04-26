"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = auditLogger;
const database_1 = require("../config/database");
const auditableMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
function auditLogger(req, _res, next) {
    if (!auditableMethods.has(req.method)) {
        next();
        return;
    }
    const start = Date.now();
    const originalJson = _res.json.bind(_res);
    _res.json = ((body) => {
        const durationMs = Date.now() - start;
        void database_1.prisma.auditLog
            .create({
            data: {
                userId: req.user?.id,
                action: `${req.method} ${req.path}`,
                entityType: req.baseUrl || "api",
                entityId: typeof req.params.id === "string" ? req.params.id : null,
                metadata: {
                    statusCode: _res.statusCode,
                    durationMs
                },
                ipAddress: req.ip,
                userAgent: req.headers["user-agent"] ?? null
            }
        })
            .catch((error) => {
            console.error("audit-log-write-failed", error);
        });
        return originalJson(body);
    });
    next();
}
