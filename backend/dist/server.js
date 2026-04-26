"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const sockets_1 = require("./sockets");
const jobs_1 = require("./jobs");
async function bootstrap() {
    await database_1.prisma.$connect();
    const httpServer = (0, http_1.createServer)(app_1.app);
    (0, sockets_1.initializeSocket)(httpServer);
    (0, jobs_1.startJobs)();
    httpServer.listen(env_1.env.PORT, () => {
        console.log(`SIWES API running on port ${env_1.env.PORT}`);
    });
}
bootstrap().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
