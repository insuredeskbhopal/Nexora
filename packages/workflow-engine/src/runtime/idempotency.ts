import { prisma } from '@agentic/db';
import { createLogger } from '@agentic/logger';

const logger = createLogger({ service: 'workflow-idempotency' });

export interface IdempotencyCheckParams {
  workspaceId: string;
  automationId: string;
  runId: string;
  nodeId: string;
  operation?: string;
}

export interface IdempotencyRecord {
  isDuplicate: boolean;
  previousOutput?: unknown;
  stepId?: string;
}

/**
 * Computes a canonical idempotency key for external side effects.
 * Section 13: workspace + automation + run + node + logical-operation
 */
export function generateIdempotencyKey(params: IdempotencyCheckParams): string {
  const op = params.operation || 'execute';
  return `idem:${params.workspaceId}:${params.automationId}:${params.runId}:${params.nodeId}:${op}`;
}

/**
 * Checks whether this step/operation has already completed in the database.
 * If completed, returns previous output to prevent duplicate external side-effects.
 */
export async function checkIdempotency(params: IdempotencyCheckParams): Promise<IdempotencyRecord> {
  try {
    const existingStep = await prisma.runStep.findFirst({
      where: {
        runId: params.runId,
        nodeId: params.nodeId,
        status: 'COMPLETED',
      },
      select: {
        id: true,
        output: true,
      },
    });

    if (existingStep && existingStep.output !== null) {
      logger.info(
        { runId: params.runId, nodeId: params.nodeId, stepId: existingStep.id },
        'Idempotency match: Reusing previous execution result without repeating side effect',
      );
      return {
        isDuplicate: true,
        previousOutput: existingStep.output,
        stepId: existingStep.id,
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    logger.warn(
      { error: (error as Error).message, runId: params.runId, nodeId: params.nodeId },
      'Idempotency check query failed, proceeding with execution',
    );
    return { isDuplicate: false };
  }
}
