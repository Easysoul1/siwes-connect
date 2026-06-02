import { Request, Response, Router } from "express";
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

const methodNotAllowed = (allowedMethod: "POST" | "GET") => (_req: Request, res: Response) => {
  res
    .status(405)
    .json({ status: "error", message: `Method not allowed. Use ${allowedMethod} for this endpoint.` });
};

authRouter.post("/register/student", registerStudent);
authRouter.get("/register/student", methodNotAllowed("POST"));
authRouter.post("/register/organization", registerOrganization);
authRouter.get("/register/organization", methodNotAllowed("POST"));
authRouter.post("/register/coordinator", registerCoordinator);
authRouter.get("/register/coordinator", methodNotAllowed("POST"));
authRouter.post("/login", login);
authRouter.get("/login", methodNotAllowed("POST"));
authRouter.post("/refresh", refresh);
authRouter.get("/refresh", methodNotAllowed("POST"));
authRouter.post("/logout", authenticate, logout);
authRouter.get("/logout", methodNotAllowed("POST"));
authRouter.get("/me", authenticate, me);
