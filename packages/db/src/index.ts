import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaClientInstance: PrismaClient | undefined;
}

/**
 * Creates or retrieves the singleton PrismaClient instance.
 */
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({
      log: ["error", "warn"],
    });
  }

  if (!globalThis.__prismaClientInstance) {
    globalThis.__prismaClientInstance = new PrismaClient({
      log: ["error", "warn"],
    });
  }

  return globalThis.__prismaClientInstance;
}

export const prisma = getPrismaClient();

export interface DbHealthResult {
  status: "up" | "down";
  latencyMs: number;
  error?: string;
}

/**
 * Health check probe for database connectivity
 */
export async function checkDatabaseHealth(): Promise<DbHealthResult> {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "up",
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      status: "down",
      latencyMs,
      error: (error as Error).message,
    };
  }
}

export * from "@prisma/client";
