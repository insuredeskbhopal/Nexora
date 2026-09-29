import type { FastifyInstance } from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";

export async function registerSecurityPlugins(app: FastifyInstance) {
  // 1. HTTP Security Headers
  await app.register(helmet, {
    contentSecurityPolicy: process.env.NODE_ENV === "production",
    crossOriginEmbedderPolicy: false,
  });

  // 2. CORS configuration (no wildcard in production)
  const isProduction = process.env.NODE_ENV === "production";
  await app.register(cors, {
    origin: (origin, cb) => {
      // In development allow localhost origins
      if (!isProduction) {
        cb(null, true);
        return;
      }

      // In production enforce specific configured origins
      const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim());
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  });

  // 3. Rate limiting baseline
  await app.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });
}
