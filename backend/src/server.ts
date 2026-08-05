import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { initializeSocket } from "./sockets";
import { startJobs } from "./jobs";

let httpServer: ReturnType<typeof createServer>;

async function bootstrap() {
  await prisma.$connect();
  httpServer = createServer(app);
  initializeSocket(httpServer);
  startJobs();

  httpServer.listen(env.PORT, () => {
    console.log(`SIWES API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (httpServer) {
    httpServer.close(() => {
      console.log("HTTP server closed");
    });
  }
  await prisma.$disconnect();
  console.log("Database disconnected");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
