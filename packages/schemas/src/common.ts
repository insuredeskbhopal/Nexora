import { z } from 'zod';

/**
 * Standard API Health Response Schema
 */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  version: z.string(),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

/**
 * Dependency Readiness Status Schema
 */
export const readyResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'unhealthy']),
  service: z.string(),
  timestamp: z.string().datetime(),
  dependencies: z.record(
    z.string(),
    z.object({
      status: z.enum(['up', 'down', 'skipped']),
      latencyMs: z.number().optional(),
      error: z.string().optional(),
    }),
  ),
});

export type ReadyResponse = z.infer<typeof readyResponseSchema>;

/**
 * Standard Error Envelope Schema
 */
export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

/**
 * Foundational IDs & Tenancy boundary schemas
 */
export const idSchema = z.string().min(1).max(128);
export const workspaceIdSchema = z.string().min(1).max(128);
export const userIdSchema = z.string().min(1).max(128);

/**
 * Standard Pagination Query Schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
