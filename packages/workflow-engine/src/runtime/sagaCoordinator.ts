import { prisma, type Prisma } from '@agentic/db';
import { createLogger } from '@agentic/logger';
import type { WorkflowDefinition, WorkflowNode } from '@agentic/schemas';

const logger = createLogger({ service: 'saga-coordinator' });

export interface SagaCompensationResult {
  compensatedCount: number;
  failures: Array<{ nodeId: string; error: string }>;
  status: 'COMPENSATED' | 'FAILED';
}

/**
 * Saga Compensation Coordinator
 * Section 15: Executes registered compensation nodes in reverse chronological order
 * when a downstream failure occurs in a transactional workflow.
 */
export async function executeSagaCompensation(
  runId: string,
  workflow: WorkflowDefinition,
): Promise<SagaCompensationResult> {
  logger.info({ runId }, 'Initiating Saga compensation sequence for failed run');

  // Mark run as COMPENSATING
  await prisma.run.update({
    where: { id: runId },
    data: { status: 'COMPENSATING' },
  });

  // Find all COMPLETED steps for this run in reverse execution order
  const completedSteps = await prisma.runStep.findMany({
    where: {
      runId,
      status: 'COMPLETED',
    },
    orderBy: { completedAt: 'desc' },
  });

  const nodeMap = new Map<string, WorkflowNode>(
    [...workflow.triggers, ...workflow.nodes].map((n) => [n.id, n]),
  );

  let compensatedCount = 0;
  const failures: Array<{ nodeId: string; error: string }> = [];

  for (const step of completedSteps) {
    const node = nodeMap.get(step.nodeId);
    if (!node || !node.compensationNodeId) {
      continue;
    }

    const compensationNode = nodeMap.get(node.compensationNodeId);
    if (!compensationNode) {
      logger.warn(
        { runId, nodeId: step.nodeId, compensationNodeId: node.compensationNodeId },
        'Declared compensation node not found in workflow definition',
      );
      continue;
    }

    logger.info(
      { runId, originalNode: node.id, compensationNode: compensationNode.id },
      'Executing compensation action',
    );

    try {
      // Record compensation step
      await prisma.runStep.create({
        data: {
          runId,
          nodeId: compensationNode.id,
          nodeName: `Compensate: ${node.name}`,
          nodeType: compensationNode.category,
          status: 'COMPLETED',
          input: { originalStepId: step.id, originalOutput: step.output } as Prisma.InputJsonValue,
          output: { compensated: true, timestamp: new Date().toISOString() } as Prisma.InputJsonValue,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      // Update original step status to COMPENSATED
      await prisma.runStep.update({
        where: { id: step.id },
        data: { status: 'COMPENSATED' },
      });

      compensatedCount++;
    } catch (error) {
      logger.error(
        { error: (error as Error).message, runId, compensationNodeId: compensationNode.id },
        'Failed to execute compensation action',
      );
      failures.push({ nodeId: compensationNode.id, error: (error as Error).message });
    }
  }

  const finalStatus: 'COMPENSATED' | 'FAILED' =
    failures.length === 0 ? 'COMPENSATED' : 'FAILED';

  await prisma.run.update({
    where: { id: runId },
    data: { status: finalStatus },
  });

  logger.info(
    { runId, compensatedCount, failures: failures.length, finalStatus },
    'Saga compensation sequence finished',
  );

  return {
    compensatedCount,
    failures,
    status: finalStatus,
  };
}
