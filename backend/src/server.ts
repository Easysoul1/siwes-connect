import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { initializeSocket } from "./sockets";
import { startJobs } from "./jobs";

async function bootstrap() {
  await prisma.$connect();
  const httpServer = createServer(app);
  initializeSocket(httpServer);
  startJobs();

  httpServer.listen(env.PORT, () => {
    console.log(`SIWES API running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
