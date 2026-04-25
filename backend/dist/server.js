"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
async function bootstrap() {
    await database_1.prisma.$connect();
    app_1.app.listen(env_1.env.PORT, () => {
        console.log(`SIWES API running on port ${env_1.env.PORT}`);
    });
}
bootstrap().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
