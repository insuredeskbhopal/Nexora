import { prisma, Prisma } from '@agentic/db';
import { createLogger } from '@agentic/logger';

const logger = createLogger({ service: 'audit-service' });

export interface RecordAuditParams {
  workspaceId: string;
  actorId: string;
  actorType?: string;
  action: string;
  targetType: string;
  targetId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string;
  correlationId?: string;
}

/**
 * Creates an immutable audit log record.
 * Section 48: Audit records track operational events, changes, approvals, and mutations.
 */
export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId,
        actorId: params.actorId,
        actorType: params.actorType ?? 'USER',
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        beforeState: (params.beforeState as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        afterState: (params.afterState as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        ipAddress: params.ipAddress ?? null,
        correlationId: params.correlationId ?? null,
      },
    });
  } catch (error) {
    // Audit logs must not crash the primary operational transaction, but must be reported
    logger.error(
      {
        error: (error as Error).message,
        action: params.action,
        workspaceId: params.workspaceId,
        actorId: params.actorId,
      },
      'Failed to persist audit log entry',
    );
  }
}
