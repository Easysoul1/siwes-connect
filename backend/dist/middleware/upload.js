"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avatarUpload = exports.documentUpload = exports.resumeUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
function createUploader(config) {
    return (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: { fileSize: config.maxBytes },
        fileFilter: (_req, file, callback) => {
            if (!config.allowedMimeTypes.includes(file.mimetype)) {
                callback(new errors_1.AppError(400, "Invalid file type"));
                return;
            }
            callback(null, true);
        }
    });
}
exports.resumeUpload = createUploader({
    maxBytes: 5_000_000,
    allowedMimeTypes: ["application/pdf"]
});
exports.documentUpload = createUploader({
    maxBytes: 10_000_000,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"]
});
exports.avatarUpload = createUploader({
    maxBytes: 2_000_000,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
});
