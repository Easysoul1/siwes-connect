import { Router } from "express";
import {
  login,
  logout,
  me,
  refresh,
  registerCoordinator,
  registerOrganization,
  registerStudent
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";

export const authRouter = Router();

authRouter.post("/register/student", registerStudent);
authRouter.post("/register/organization", registerOrganization);
authRouter.post("/register/coordinator", registerCoordinator);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", authenticate, logout);
authRouter.get("/me", authenticate, me);
