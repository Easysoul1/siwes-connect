import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";

const auditableMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function auditLogger(req: Request, _res: Response, next: NextFunction) {
  if (!auditableMethods.has(req.method)) {
    next();
    return;
  }

  const start = Date.now();
  const originalJson = _res.json.bind(_res);

  _res.json = ((body: unknown) => {
    const durationMs = Date.now() - start;
    void prisma.auditLog
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
  }) as Response["json"];

  next();
}
