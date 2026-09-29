import { type ServerConfig } from "@agentic/config";
import { prisma, checkDatabaseHealth } from "@agentic/db";
import { createLogger, type Logger } from "@agentic/logger";
import { Redis } from "ioredis";
import net from "node:net";

export type WorkerLifecycleState =
  "INITIALIZING" | "RUNNING" | "STOPPING" | "STOPPED";

export class WorkerService {
  private state: WorkerLifecycleState = "INITIALIZING";
  private logger: Logger;
  private redisClient: Redis | null = null;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.logger = createLogger({
      service: "agentic-worker",
      environment: config.NODE_ENV,
      level: config.LOG_LEVEL,
    });
  }

  public getState(): WorkerLifecycleState {
    return this.state;
  }

  /**
   * Probes Temporal gRPC server endpoint
   */
  private async probeTemporal(address: string): Promise<boolean> {
    const [host = "localhost", portStr = "7233"] = address.split(":");
    const port = parseInt(portStr, 10);

    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);

      socket.on("connect", () => {
        socket.destroy();
        resolve(true);
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });

      socket.on("error", () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });
  }

  /**
   * Initializes connections and starts the worker process.
   */
  public async start(): Promise<void> {
    this.logger.info("Starting Agentic Worker service...");

    // 1. Check database connectivity
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.status === "up") {
      this.logger.info(
        { latencyMs: dbHealth.latencyMs },
        "Database connected successfully.",
      );
    } else {
      this.logger.warn(
        { error: dbHealth.error },
        "Database connection currently unreachable.",
      );
    }

    // 2. Initialize Redis connection
    try {
      this.redisClient = new Redis(this.config.REDIS_URL, {
        lazyConnect: true,
        connectTimeout: 2000,
        maxRetriesPerRequest: 1,
      });
      await this.redisClient.connect();
      await this.redisClient.ping();
      this.logger.info("Redis connected successfully.");
    } catch (err) {
      this.logger.warn({ err }, "Redis connection failed during startup.");
    }

    // 3. Probe Temporal endpoint
    const temporalReady = await this.probeTemporal(
      this.config.TEMPORAL_ADDRESS,
    );
    if (temporalReady) {
      this.logger.info(
        {
          address: this.config.TEMPORAL_ADDRESS,
          namespace: this.config.TEMPORAL_NAMESPACE,
        },
        "Temporal service verified and ready for durable workflows.",
      );
    } else {
      this.logger.warn(
        { address: this.config.TEMPORAL_ADDRESS },
        "Temporal server endpoint is not currently reachable.",
      );
    }

    this.state = "RUNNING";
    this.logger.info(
      "Agentic Worker service is now RUNNING and ready for background activities.",
    );
  }

  /**
   * Gracefully shuts down the worker process and active connections.
   */
  public async stop(): Promise<void> {
    if (this.state === "STOPPING" || this.state === "STOPPED") {
      return;
    }

    this.state = "STOPPING";
    this.logger.info("Shutting down Agentic Worker service gracefully...");

    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        this.logger.info("Redis connection closed.");
      }

      await prisma.$disconnect();
      this.logger.info("Database connection closed.");

      this.state = "STOPPED";
      this.logger.info("Agentic Worker service stopped successfully.");
    } catch (err) {
      this.logger.error({ err }, "Error during worker shutdown.");
      this.state = "STOPPED";
      throw err;
    }
  }
}
