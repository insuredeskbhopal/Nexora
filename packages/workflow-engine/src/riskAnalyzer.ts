import type { WorkflowDefinition } from '@agentic/schemas';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskAnalysisFinding {
  code: string;
  level: RiskLevel;
  title: string;
  description: string;
  remediation: string;
  sourceNodeId?: string;
  targetNodeId?: string;
}

export interface RiskAnalysisReport {
  highestRisk: RiskLevel;
  blockedFromActivation: boolean;
  findings: RiskAnalysisFinding[];
}

/**
 * Static Risk Analyzer
 * Section 78: Before activation detect dangerous combinations.
 * Examples:
 * - AI output -> direct payment without human approval
 * - AI output -> destructive database operation
 * - Unvalidated document extraction -> financial transfer
 * - Public webhook -> privileged action
 */
export function analyzeWorkflowRisk(workflow: WorkflowDefinition): RiskAnalysisReport {
  const findings: RiskAnalysisFinding[] = [];
  const nodeMap = new Map(
    [...workflow.triggers, ...workflow.nodes].map((n) => [n.id, n]),
  );

  // Build forward graph
  const targetsOf = new Map<string, string[]>();
  for (const edge of workflow.edges) {
    if (!targetsOf.has(edge.sourceNodeId)) {
      targetsOf.set(edge.sourceNodeId, []);
    }
    targetsOf.get(edge.sourceNodeId)!.push(edge.targetNodeId);
  }

  // 1. Check for AI / Model output flowing directly into Financial / Destructive actions
  for (const node of workflow.nodes) {
    if (['AGENT', 'MODEL'].includes(node.category)) {
      const immediateTargets = targetsOf.get(node.id) || [];
      for (const targetId of immediateTargets) {
        const targetNode = nodeMap.get(targetId);
        if (!targetNode) continue;

        // Check financial action
        const isFinancial =
          targetNode.name.toLowerCase().includes('payment') ||
          targetNode.name.toLowerCase().includes('transfer') ||
          targetNode.name.toLowerCase().includes('payout') ||
          targetNode.config.action === 'execute_payment' ||
          targetNode.config.type === 'financial';

        if (isFinancial) {
          findings.push({
            code: 'AI_DIRECT_PAYMENT',
            level: 'CRITICAL',
            title: 'AI Output Directly Executing Payment',
            description: `Agent/Model node '${node.name}' (${node.id}) directly executes financial operation '${targetNode.name}' (${targetNode.id}) without an intervening Human Approval gate.`,
            remediation: 'Insert a HUMAN_APPROVAL node between the AI model and the payment execution.',
            sourceNodeId: node.id,
            targetNodeId: targetNode.id,
          });
        }

        // Check destructive database action
        const isDestructiveDb =
          targetNode.category === 'DATABASE' &&
          (typeof targetNode.config.query === 'string' &&
            /delete\s+|drop\s+|truncate\s+/i.test(targetNode.config.query));

        if (isDestructiveDb) {
          findings.push({
            code: 'AI_DESTRUCTIVE_DATABASE',
            level: 'CRITICAL',
            title: 'AI Output Directly Triggering Destructive Database Operation',
            description: `Agent/Model node '${node.name}' directly triggers destructive database command on node '${targetNode.name}'.`,
            remediation: 'Require administrative approval or restrict DB action to read-only/prepared safe updates.',
            sourceNodeId: node.id,
            targetNodeId: targetNode.id,
          });
        }
      }
    }

    // 2. Check for unauthenticated triggers to sensitive operations
    if (node.category === 'TRIGGER') {
      const config = node.config as Record<string, unknown>;
      const isPublicWebhook = config.type === 'webhook' && !config.verifySignature && !config.secret;
      if (isPublicWebhook) {
        const immediateTargets = targetsOf.get(node.id) || [];
        for (const targetId of immediateTargets) {
          const targetNode = nodeMap.get(targetId);
          if (targetNode && ['DATABASE', 'CODE', 'HTTP'].includes(targetNode.category)) {
            findings.push({
              code: 'PUBLIC_WEBHOOK_TO_PRIVILEGED_ACTION',
              level: 'HIGH',
              title: 'Unauthenticated Webhook Triggering Privileged Node',
              description: `Webhook trigger '${node.name}' has no signature verification or secret configured, but immediately triggers '${targetNode.name}'.`,
              remediation: 'Enable cryptographic HMAC signature verification on the webhook trigger.',
              sourceNodeId: node.id,
              targetNodeId: targetNode.id,
            });
          }
        }
      }
    }

    // 3. Check for external side-effect nodes lacking saga compensation
    const isExternalSideEffect =
      ['HTTP', 'ACTION'].includes(node.category) &&
      (node.name.toLowerCase().includes('create') ||
        node.name.toLowerCase().includes('provision') ||
        node.name.toLowerCase().includes('charge'));

    if (isExternalSideEffect && !node.compensationNodeId) {
      findings.push({
        code: 'MISSING_SAGA_COMPENSATION',
        level: 'MEDIUM',
        title: 'Side-Effect Node Without Compensation Action',
        description: `Node '${node.name}' performs external state mutation but declares no compensationNodeId for saga rollback in case of downstream failures.`,
        remediation: 'Declare a compensationNodeId pointing to a rollback action.',
        sourceNodeId: node.id,
      });
    }
  }

  // Determine highest risk level
  const levels: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let highestIndex = 0;
  for (const f of findings) {
    const idx = levels.indexOf(f.level);
    if (idx > highestIndex) {
      highestIndex = idx;
    }
  }

  const highestRisk = levels[highestIndex] ?? 'LOW';
  const blockedFromActivation = highestRisk === 'CRITICAL';

  return {
    highestRisk,
    blockedFromActivation,
    findings,
  };
}
