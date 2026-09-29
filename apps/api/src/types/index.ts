import type { VerifiedTenancyContext } from '@agentic/auth';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
    auth?: {
      userId: string;
      email: string;
    };
    tenancy?: VerifiedTenancyContext;
  }
}

export interface ReadyDependencyReport {
  status: 'up' | 'down' | 'skipped';
  latencyMs?: number;
  error?: string;
}
