import { z } from "zod";
import "dotenv/config";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  JWT_SECRET: z.string().min(32).default("change-this-super-secret-jwt-key-32-chars"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  DATABASE_URL: z.string().default("postgresql://siwes:siwes123@localhost:5432/siwes_connect"),
  FRONTEND_URL: z.string().default("http://localhost:3000")
});

export const env = schema.parse(process.env);
