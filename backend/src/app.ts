import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { router } from "./routes";

export const app = express();

const allowedOrigin = env.FRONTEND_URL.replace(/\/$/, "");

app.use(
  cors({
    origin: [allowedOrigin, "http://localhost:3000"],
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);
app.use(errorHandler);
