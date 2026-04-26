import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../utils/errors";

type UploadConfig = {
  maxBytes: number;
  allowedMimeTypes: string[];
};

function createUploader(config: UploadConfig) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxBytes },
    fileFilter: (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
      if (!config.allowedMimeTypes.includes(file.mimetype)) {
        callback(new AppError(400, "Invalid file type"));
        return;
      }
      callback(null, true);
    }
  });
}

export const resumeUpload = createUploader({
  maxBytes: 5_000_000,
  allowedMimeTypes: ["application/pdf"]
});

export const documentUpload = createUploader({
  maxBytes: 10_000_000,
  allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"]
});

export const avatarUpload = createUploader({
  maxBytes: 2_000_000,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
});
