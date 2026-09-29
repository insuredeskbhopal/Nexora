import { z } from 'zod';
import { idSchema, userIdSchema, workspaceIdSchema } from './common.js';

export const auditActionSchema = z.string().min(1).max(100);

export const auditLogEntrySchema = z.object({
  id: idSchema,
  workspaceId: workspaceIdSchema,
  actorId: userIdSchema,
  action: auditActionSchema,
  targetType: z.string().min(1).max(100),
  targetId: z.string().min(1).max(128),
  beforeState: z.record(z.unknown()).nullable().optional(),
  afterState: z.record(z.unknown()).nullable().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  correlationId: z.string().optional(),
  createdAt: z.date().or(z.string().datetime()),
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;

export const queryAuditLogsSchema = z.object({
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  action: z.string().optional(),
  actorId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export type QueryAuditLogsInput = z.infer<typeof queryAuditLogsSchema>;
