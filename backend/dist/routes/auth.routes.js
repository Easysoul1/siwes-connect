"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.authRouter = (0, express_1.Router)();
const methodNotAllowed = (allowedMethod) => (_req, res) => {
    res
        .status(405)
        .json({ status: "error", message: `Method not allowed. Use ${allowedMethod} for this endpoint.` });
};
exports.authRouter.post("/register/student", auth_controller_1.registerStudent);
exports.authRouter.get("/register/student", methodNotAllowed("POST"));
exports.authRouter.post("/register/organization", auth_controller_1.registerOrganization);
exports.authRouter.get("/register/organization", methodNotAllowed("POST"));
exports.authRouter.post("/register/coordinator", auth_controller_1.registerCoordinator);
exports.authRouter.get("/register/coordinator", methodNotAllowed("POST"));
exports.authRouter.post("/login", auth_controller_1.login);
exports.authRouter.get("/login", methodNotAllowed("POST"));
exports.authRouter.post("/refresh", auth_controller_1.refresh);
exports.authRouter.get("/refresh", methodNotAllowed("POST"));
exports.authRouter.post("/verify-email", auth_controller_1.verifyEmail);
exports.authRouter.get("/verify-email", methodNotAllowed("POST"));
exports.authRouter.post("/forgot-password", auth_controller_1.forgotPassword);
exports.authRouter.get("/forgot-password", methodNotAllowed("POST"));
exports.authRouter.post("/reset-password", auth_controller_1.resetPassword);
exports.authRouter.get("/reset-password", methodNotAllowed("POST"));
exports.authRouter.post("/logout", authenticate_1.authenticate, auth_controller_1.logout);
exports.authRouter.get("/logout", methodNotAllowed("POST"));
exports.authRouter.get("/me", authenticate_1.authenticate, auth_controller_1.me);
