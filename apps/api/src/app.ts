import fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { createLogger, createChildLogger } from "@agentic/logger";
import { formatErrorResponse, NotFoundError } from "@agentic/shared";
import { registerSecurityPlugins } from "./plugins/security.js";
import { tenancyPlugin } from "./plugins/tenancy.js";
import { errorHandler } from "./errors/errorHandler.js";
import { healthRoutes } from "./modules/health/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import { workspaceRoutes } from "./modules/workspaces/routes.js";
import { automationRoutes } from "./modules/automations/routes.js";
import { runRoutes } from "./modules/runs/routes.js";
import { connectorRoutes } from "./modules/connectors/routes.js";
import { secretRoutes } from "./modules/secrets/routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const rootLogger = createLogger({
    service: "agentic-api",
  });

  const app = fastify({
    bodyLimit: 1048576, // 1MB payload size limit
    genReqId: (req) => {
      const existingId = req.headers["x-request-id"];
      if (typeof existingId === "string" && existingId.trim().length > 0) {
        return existingId;
      }
      return `req_${randomUUID().replace(/-/g, "")}`;
    },
  });

  // Attach correlated request logger and response header
  app.addHook("onRequest", async (request, reply) => {
    request.requestId = request.id;
    reply.header("x-request-id", request.requestId);
    request.log = createChildLogger(rootLogger, {
      requestId: request.requestId,
    });
    request.log.info(
      { method: request.method, url: request.url },
      "Incoming HTTP Request",
    );
  });

  app.addHook("onResponse", async (request, reply) => {
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: Math.round(reply.elapsedTime),
      },
      "Completed HTTP Request",
    );
  });

  // Register security & tenancy plugins
  await registerSecurityPlugins(app);
  await app.register(tenancyPlugin);

  // Set centralized not found handler for consistent 404 responses
  app.setNotFoundHandler((request, reply) => {
    const requestId =
      request.requestId ||
      (request.headers["x-request-id"] as string) ||
      "unknown";
    const notFound = new NotFoundError(
      `Route ${request.method} ${request.url} not found`,
    );
    const { statusCode, payload } = formatErrorResponse(
      notFound,
      requestId,
      process.env.NODE_ENV === "production",
    );
    return reply.status(statusCode).send(payload);
  });

  // Set centralized error handler
  app.setErrorHandler(errorHandler);

  // Register route modules
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(workspaceRoutes);
  await app.register(automationRoutes);
  await app.register(runRoutes);
  await app.register(connectorRoutes);
  await app.register(secretRoutes);

  return app;
}
