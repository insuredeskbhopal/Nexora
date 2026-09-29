import { getConfig } from "@agentic/config";
import { WorkerService } from "./service.js";

async function main() {
  const config = getConfig();
  const worker = new WorkerService(config);

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down worker...`);
    await worker.stop();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  await worker.start();
}

void main();
