import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { auditLogger } from "./middleware/auditLogger";
import { errorHandler } from "./middleware/errorHandler";
import { authRateLimiter, generalRateLimiter } from "./middleware/rateLimiters";
import { router } from "./routes";

export const app = express();

const allowedOrigin = env.FRONTEND_URL.replace(/\/$/, "");
const isDev = env.NODE_ENV === "development";
const corsOrigins = isDev
  ? [allowedOrigin, "http://localhost:3000", "http://localhost:3001"]
  : [allowedOrigin];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true
  })
);
app.use(helmet());
app.use(generalRateLimiter);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRateLimiter);
app.use(auditLogger);
app.use("/api/v1", router);
app.use(errorHandler);
