import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { checkDatabaseHealth } from "@agentic/db";
import { Redis } from "ioredis";
import net from "node:net";

export const healthRoutes: FastifyPluginAsync = async (
  app: FastifyInstance,
) => {
  const serviceStartTime = Date.now();

  /**
   * GET /health - Liveness probe (process level)
   */
  app.get("/health", async (_req, reply) => {
    return reply.status(200).send({
      status: "ok",
      service: "api",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - serviceStartTime) / 1000),
    });
  });

  /**
   * Helper: checks if a host:port TCP address is reachable
   */
  async function checkTcp(
    hostPort: string,
  ): Promise<{ status: "up" | "down"; latencyMs: number; error?: string }> {
    const start = performance.now();
    const [host = "localhost", portStr = "7233"] = hostPort.split(":");
    const port = parseInt(portStr, 10);

    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500);

      socket.on("connect", () => {
        const latencyMs = Math.round(performance.now() - start);
        socket.destroy();
        resolve({ status: "up", latencyMs });
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve({
          status: "down",
          latencyMs: 1500,
          error: "Connection timed out",
        });
      });

      socket.on("error", (err) => {
        const latencyMs = Math.round(performance.now() - start);
        socket.destroy();
        resolve({ status: "down", latencyMs, error: err.message });
      });

      socket.connect(port, host);
    });
  }

  /**
   * GET /ready - Readiness probe (dependency level)
   */
  app.get("/ready", async (_req, reply) => {
    const dependencies: Record<
      string,
      { status: "up" | "down" | "skipped"; latencyMs?: number; error?: string }
    > = {};

    // 1. Database check
    try {
      const dbCheck = await checkDatabaseHealth();
      dependencies.database = dbCheck;
    } catch (err) {
      dependencies.database = { status: "down", error: (err as Error).message };
    }

    // 2. Redis check
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      const start = performance.now();
      try {
        const redisClient = new Redis(redisUrl, {
          connectTimeout: 1500,
          maxRetriesPerRequest: 1,
          lazyConnect: true,
        });
        await redisClient.connect();
        await redisClient.ping();
        await redisClient.quit();
        dependencies.redis = {
          status: "up",
          latencyMs: Math.round(performance.now() - start),
        };
      } catch (err) {
        dependencies.redis = {
          status: "down",
          latencyMs: Math.round(performance.now() - start),
          error: (err as Error).message,
        };
      }
    } else {
      dependencies.redis = {
        status: "skipped",
        error: "REDIS_URL not configured",
      };
    }

    // 3. Temporal TCP check
    const temporalAddress = process.env.TEMPORAL_ADDRESS || "localhost:7233";
    dependencies.temporal = await checkTcp(temporalAddress);

    // 4. MinIO check
    const s3Endpoint = process.env.S3_ENDPOINT || "http://localhost:9000";
    const s3Start = performance.now();
    try {
      const minioHealthUrl = `${s3Endpoint.replace(/\/$/, "")}/minio/health/live`;
      const res = await fetch(minioHealthUrl, {
        signal: AbortSignal.timeout(1500),
      });
      dependencies.minio = {
        status: res.ok ? "up" : "down",
        latencyMs: Math.round(performance.now() - s3Start),
      };
    } catch (err) {
      dependencies.minio = {
        status: "down",
        latencyMs: Math.round(performance.now() - s3Start),
        error: (err as Error).message,
      };
    }

    const allHealthy = Object.values(dependencies).every(
      (d) => d.status === "up" || d.status === "skipped",
    );
    const isDegraded =
      Object.values(dependencies).some((d) => d.status === "up") && !allHealthy;

    const overallStatus = allHealthy
      ? "ok"
      : isDegraded
        ? "degraded"
        : "unhealthy";
    const statusCode = overallStatus === "ok" ? 200 : 503;

    return reply.status(statusCode).send({
      status: overallStatus,
      service: "api",
      timestamp: new Date().toISOString(),
      dependencies,
    });
  });
};
