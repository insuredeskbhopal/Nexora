import { getConfig } from "@agentic/config";
import { prisma } from "@agentic/db";
import { createLogger } from "@agentic/logger";
import { buildApp } from "./app.js";

const logger = createLogger({ service: "agentic-api" });

async function main() {
  const config = getConfig();
  const app = await buildApp();

  const closeGracefully = async (signal: string) => {
    logger.info(
      { signal },
      "Received termination signal. Starting graceful shutdown...",
    );
    try {
      await app.close();
      logger.info("HTTP server closed.");

      await prisma.$disconnect();
      logger.info("Database connections closed.");

      logger.info("Graceful shutdown completed successfully.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error occurred during graceful shutdown.");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => void closeGracefully("SIGINT"));
  process.on("SIGTERM", () => void closeGracefully("SIGTERM"));

  try {
    const address = await app.listen({
      port: config.API_PORT,
      host: "0.0.0.0",
    });
    logger.info(
      {
        port: config.API_PORT,
        address,
        env: config.NODE_ENV,
      },
      "Agentic API server listening and ready.",
    );
  } catch (err) {
    logger.fatal({ err }, "Failed to start API server.");
    process.exit(1);
  }
}

void main();
