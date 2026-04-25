import { Router } from "express";
import { authRouter } from "./auth.routes";
import { coordinatorRouter } from "./coordinator.routes";
import { organizationRouter } from "./organization.routes";
import { studentRouter } from "./student.routes";
import {
  notificationRouter,
  placementRouter,
  uploadRouter
} from "./module.routes";

export const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    app: "siwes-connect-api",
    version: "v1",
    endpoints: {
      health: "/api/v1/health"
    }
  });
});

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", app: "siwes-connect-api" });
});

router.use("/auth", authRouter);
router.use("/students", studentRouter);
router.use("/organizations", organizationRouter);
router.use("/coordinator", coordinatorRouter);
router.use("/placements", placementRouter);
router.use("/notifications", notificationRouter);
router.use("/uploads", uploadRouter);
