import { describe, expect, it } from "vitest";
import { WorkerService } from "./service.js";
import type { ServerConfig } from "@agentic/config";

describe("WorkerService Lifecycle", () => {
  const mockConfig: ServerConfig = {
    NODE_ENV: "test",
    APP_ENV: "test",
    WEB_PORT: 3000,
    API_PORT: 4000,
    DATABASE_URL: "postgresql://agentic:agentic@localhost:5432/agentic_dev",
    REDIS_URL: "redis://localhost:6379",
    TEMPORAL_ADDRESS: "localhost:7233",
    TEMPORAL_NAMESPACE: "default",
    S3_ENDPOINT: "http://localhost:9000",
    S3_REGION: "us-east-1",
    S3_ACCESS_KEY: "test",
    S3_SECRET_KEY: "test",
    S3_BUCKET: "agentic-artifacts",
    LOG_LEVEL: "fatal", // keep test output clean
  };

  it("transitions state from INITIALIZING to RUNNING and cleanly to STOPPED", async () => {
    const worker = new WorkerService(mockConfig);
    expect(worker.getState()).toBe("INITIALIZING");

    await worker.start();
    expect(worker.getState()).toBe("RUNNING");

    await worker.stop();
    expect(worker.getState()).toBe("STOPPED");
  });
});
