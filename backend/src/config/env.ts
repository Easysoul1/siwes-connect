import { z } from "zod";
import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  JWT_SECRET: isProduction
    ? z.string().min(32)
    : z.string().min(32).default("change-this-super-secret-jwt-key-32-chars"),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  DATABASE_URL: z.string().default("postgresql://siwes:siwes123@localhost:5432/siwes_connect"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  APP_URL: z.string().default("http://localhost:3000"),
  COORDINATOR_INVITE_CODE: z.string().default("coord_2024_invite"),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default("noreply@siwesconnect.ng"),
  FROM_NAME: z.string().default("SIWES Connect"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const parsed = schema.parse(process.env);

export const env = {
  ...parsed,
  JWT_REFRESH_SECRET: parsed.JWT_REFRESH_SECRET ?? parsed.JWT_SECRET
};
