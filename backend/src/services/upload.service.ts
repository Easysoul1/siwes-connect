import { AppError } from "../utils/errors";
import { cloudinary, ensureCloudinaryConfigured } from "../config/cloudinary";

type UploadOptions = {
  folder: string;
  resourceType?: "raw" | "image" | "auto";
};

export class UploadService {
  static async uploadBuffer(fileBuffer: Buffer, options: UploadOptions) {
    ensureCloudinaryConfigured();

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resourceType ?? "auto"
        },
        (error, result) => {
          if (error || !result) {
            reject(new AppError(500, "File upload failed"));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );

      stream.end(fileBuffer);
    });
  }
}
