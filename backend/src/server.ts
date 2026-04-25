import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

async function bootstrap() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`SIWES API running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
