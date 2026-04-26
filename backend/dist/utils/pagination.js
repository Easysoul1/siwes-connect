"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePagination = parsePagination;
function parsePagination(query) {
    const rawPage = typeof query.page === "string" ? Number(query.page) : 1;
    const rawLimit = typeof query.limit === "string" ? Number(query.limit) : 20;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 100) : 20;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
