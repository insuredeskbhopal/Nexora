declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
  }
}

export interface ReadyDependencyReport {
  status: "up" | "down" | "skipped";
  latencyMs?: number;
  error?: string;
}
