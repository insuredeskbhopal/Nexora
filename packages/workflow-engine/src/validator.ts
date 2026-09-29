import {
  workflowDefinitionSchema,
  type WorkflowDefinition,
  type WorkflowNode,
} from '@agentic/schemas';

export interface ValidationErrorItem {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorItem[];
  warnings: ValidationErrorItem[];
}

/**
 * Validates a workflow definition against production correctness rules.
 * Section 77: Verifies reachability, dangling edges, loop boundaries, cycle safety, and timeouts.
 */
export function validateWorkflow(definition: unknown): ValidationResult {
  const errors: ValidationErrorItem[] = [];
  const warnings: ValidationErrorItem[] = [];

  // 1. Zod Schema Validation
  const parseResult = workflowDefinitionSchema.safeParse(definition);
  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      errors.push({
        code: 'SCHEMA_VALIDATION_ERROR',
        message: `${issue.path.join('.')}: ${issue.message}`,
        severity: 'ERROR',
      });
    }
    return { valid: false, errors, warnings };
  }

  const workflow = parseResult.data;

  // 2. Index all nodes
  const allNodesMap = new Map<string, WorkflowNode>();
  const triggerNodeIds = new Set<string>();

  for (const trigger of workflow.triggers) {
    if (allNodesMap.has(trigger.id)) {
      errors.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node ID detected: '${trigger.id}'`,
        nodeId: trigger.id,
        severity: 'ERROR',
      });
    }
    allNodesMap.set(trigger.id, trigger);
    triggerNodeIds.add(trigger.id);
  }

  for (const node of workflow.nodes) {
    if (allNodesMap.has(node.id)) {
      errors.push({
        code: 'DUPLICATE_NODE_ID',
        message: `Duplicate node ID detected: '${node.id}'`,
        nodeId: node.id,
        severity: 'ERROR',
      });
    }
    allNodesMap.set(node.id, node);
  }

  // 3. Edge Validity & Dangling Edge Checks
  const adjacencyList = new Map<string, string[]>();
  for (const nodeId of allNodesMap.keys()) {
    adjacencyList.set(nodeId, []);
  }

  for (const edge of workflow.edges) {
    if (!allNodesMap.has(edge.sourceNodeId)) {
      errors.push({
        code: 'DANGLING_EDGE_SOURCE',
        message: `Edge '${edge.id}' references non-existent source node '${edge.sourceNodeId}'`,
        edgeId: edge.id,
        severity: 'ERROR',
      });
    }

    if (!allNodesMap.has(edge.targetNodeId)) {
      errors.push({
        code: 'DANGLING_EDGE_TARGET',
        message: `Edge '${edge.id}' references non-existent target node '${edge.targetNodeId}'`,
        edgeId: edge.id,
        severity: 'ERROR',
      });
    }

    // Triggers cannot be target nodes
    if (triggerNodeIds.has(edge.targetNodeId)) {
      errors.push({
        code: 'INVALID_TRIGGER_TARGET',
        message: `Trigger node '${edge.targetNodeId}' cannot be the target of an incoming edge`,
        nodeId: edge.targetNodeId,
        edgeId: edge.id,
        severity: 'ERROR',
      });
    }

    if (allNodesMap.has(edge.sourceNodeId) && allNodesMap.has(edge.targetNodeId)) {
      adjacencyList.get(edge.sourceNodeId)?.push(edge.targetNodeId);
    }
  }

  // 4. Reachability Analysis (Orphan Nodes)
  const reachableNodes = new Set<string>();
  const queue = Array.from(triggerNodeIds);
  for (const tId of queue) {
    reachableNodes.add(tId);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      if (!reachableNodes.has(neighbor)) {
        reachableNodes.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  for (const node of workflow.nodes) {
    if (!reachableNodes.has(node.id)) {
      errors.push({
        code: 'ORPHAN_NODE',
        message: `Node '${node.name}' (${node.id}) is unreachable from any trigger`,
        nodeId: node.id,
        severity: 'ERROR',
      });
    }
  }

  // 5. Cycle Detection & Loop Boundary Verification
  // 3-color DFS: 0 = White (unvisited), 1 = Grey (visiting/in recursion stack), 2 = Black (visited)
  const color = new Map<string, number>();
  for (const nodeId of allNodesMap.keys()) {
    color.set(nodeId, 0);
  }

  const recursionStack: string[] = [];

  function dfs(nodeId: string): void {
    color.set(nodeId, 1);
    recursionStack.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      const neighborColor = color.get(neighbor) ?? 0;
      if (neighborColor === 1) {
        // Back-edge detected! Check if bounded loop
        const cycleStartIndex = recursionStack.indexOf(neighbor);
        const cycleNodes = recursionStack.slice(cycleStartIndex);
        const hasExplicitLoopNode = cycleNodes.some(
          (id) => allNodesMap.get(id)?.category === 'LOOP',
        );

        if (!hasExplicitLoopNode) {
          errors.push({
            code: 'CYCLE_DETECTED',
            message: `Illegal cycle detected without a formal LOOP node: ${cycleNodes.join(' -> ')} -> ${neighbor}`,
            nodeId,
            severity: 'ERROR',
          });
        }
      } else if (neighborColor === 0) {
        dfs(neighbor);
      }
    }

    recursionStack.pop();
    color.set(nodeId, 2);
  }

  for (const triggerId of triggerNodeIds) {
    if (color.get(triggerId) === 0) {
      dfs(triggerId);
    }
  }

  // 6. Node-Specific Configuration & Guardrails
  for (const node of allNodesMap.values()) {
    // LOOP nodes must declare safety boundaries (Section 17)
    if (node.category === 'LOOP') {
      const config = node.config as Record<string, unknown>;
      const maxIterations = config.maxIterations;
      if (typeof maxIterations !== 'number' || maxIterations <= 0 || maxIterations > 1000) {
        errors.push({
          code: 'UNBOUNDED_LOOP_ERROR',
          message: `LOOP node '${node.name}' (${node.id}) must declare a positive maxIterations (max 1000) to prevent unbounded loops`,
          nodeId: node.id,
          severity: 'ERROR',
        });
      }
    }

    // Long-running or external side-effect nodes should specify timeouts
    if (['HTTP', 'CODE', 'BROWSER', 'AGENT'].includes(node.category)) {
      if (!node.timeoutMs) {
        warnings.push({
          code: 'MISSING_TIMEOUT',
          message: `Node '${node.name}' (${node.id}) does not declare a timeout; system default (60s) will be applied`,
          nodeId: node.id,
          severity: 'WARNING',
        });
      }
    }

    // HUMAN_APPROVAL nodes must have approval criteria
    if (node.category === 'HUMAN_APPROVAL') {
      const config = node.config as Record<string, unknown>;
      const hasApprover = config.approverRole || config.approverUserId || config.policyId;
      if (!hasApprover) {
        errors.push({
          code: 'INVALID_APPROVAL_CONFIG',
          message: `HUMAN_APPROVAL node '${node.name}' (${node.id}) must specify at least one approverRole, approverUserId, or policyId`,
          nodeId: node.id,
          severity: 'ERROR',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
