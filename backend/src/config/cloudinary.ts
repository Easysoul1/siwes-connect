import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { AppError } from "../utils/errors";

let configured = false;

export function ensureCloudinaryConfigured() {
  if (configured) return;

  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(500, "Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
  configured = true;
}

export { cloudinary };
