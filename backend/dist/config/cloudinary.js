"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
exports.ensureCloudinaryConfigured = ensureCloudinaryConfigured;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const env_1 = require("./env");
const errors_1 = require("../utils/errors");
let configured = false;
function ensureCloudinaryConfigured() {
    if (configured)
        return;
    if (!env_1.env.CLOUDINARY_CLOUD_NAME || !env_1.env.CLOUDINARY_API_KEY || !env_1.env.CLOUDINARY_API_SECRET) {
        throw new errors_1.AppError(500, "Cloudinary is not configured");
    }
    cloudinary_1.v2.config({
        cloud_name: env_1.env.CLOUDINARY_CLOUD_NAME,
        api_key: env_1.env.CLOUDINARY_API_KEY,
        api_secret: env_1.env.CLOUDINARY_API_SECRET
    });
    configured = true;
}
