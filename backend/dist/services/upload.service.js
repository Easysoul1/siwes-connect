"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const errors_1 = require("../utils/errors");
const cloudinary_1 = require("../config/cloudinary");
class UploadService {
    static async uploadBuffer(fileBuffer, options) {
        (0, cloudinary_1.ensureCloudinaryConfigured)();
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.cloudinary.uploader.upload_stream({
                folder: options.folder,
                resource_type: options.resourceType ?? "auto"
            }, (error, result) => {
                if (error || !result) {
                    reject(new errors_1.AppError(500, "File upload failed"));
                    return;
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            });
            stream.end(fileBuffer);
        });
    }
}
exports.UploadService = UploadService;
