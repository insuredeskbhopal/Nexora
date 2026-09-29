import type { WorkflowDefinition, WorkflowNode, WorkflowEdge } from '@agentic/schemas';

export interface NodeDiff {
  type: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
  nodeId: string;
  nodeName: string;
  category: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

export interface EdgeDiff {
  type: 'ADDED' | 'REMOVED' | 'UNCHANGED';
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface WorkflowDiffResult {
  hasChanges: boolean;
  nodesAdded: NodeDiff[];
  nodesRemoved: NodeDiff[];
  nodesModified: NodeDiff[];
  nodesUnchanged: NodeDiff[];
  edgesAdded: EdgeDiff[];
  edgesRemoved: EdgeDiff[];
  humanReadableSummary: string;
  potentialImpact: string[];
}

/**
 * Computes structural differences between two canonical workflow AST versions.
 * Section 22 & 75: Provides machine patch analysis and human-readable explanation of changes.
 */
export function computeWorkflowDiff(
  base: WorkflowDefinition,
  target: WorkflowDefinition,
): WorkflowDiffResult {
  const baseNodes = new Map<string, WorkflowNode>(
    [...base.triggers, ...base.nodes].map((n) => [n.id, n]),
  );
  const targetNodes = new Map<string, WorkflowNode>(
    [...target.triggers, ...target.nodes].map((n) => [n.id, n]),
  );

  const nodesAdded: NodeDiff[] = [];
  const nodesRemoved: NodeDiff[] = [];
  const nodesModified: NodeDiff[] = [];
  const nodesUnchanged: NodeDiff[] = [];

  // Detect Added & Modified & Unchanged
  for (const [id, tNode] of targetNodes.entries()) {
    const bNode = baseNodes.get(id);
    if (!bNode) {
      nodesAdded.push({
        type: 'ADDED',
        nodeId: id,
        nodeName: tNode.name,
        category: tNode.category,
      });
    } else {
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (bNode.name !== tNode.name) {
        changes.name = { from: bNode.name, to: tNode.name };
      }
      if (bNode.category !== tNode.category) {
        changes.category = { from: bNode.category, to: tNode.category };
      }
      if (JSON.stringify(bNode.config) !== JSON.stringify(tNode.config)) {
        changes.config = { from: bNode.config, to: tNode.config };
      }
      if (bNode.timeoutMs !== tNode.timeoutMs) {
        changes.timeoutMs = { from: bNode.timeoutMs, to: tNode.timeoutMs };
      }
      if (JSON.stringify(bNode.retryPolicy) !== JSON.stringify(tNode.retryPolicy)) {
        changes.retryPolicy = { from: bNode.retryPolicy, to: tNode.retryPolicy };
      }

      if (Object.keys(changes).length > 0) {
        nodesModified.push({
          type: 'MODIFIED',
          nodeId: id,
          nodeName: tNode.name,
          category: tNode.category,
          changes,
        });
      } else {
        nodesUnchanged.push({
          type: 'UNCHANGED',
          nodeId: id,
          nodeName: tNode.name,
          category: tNode.category,
        });
      }
    }
  }

  // Detect Removed
  for (const [id, bNode] of baseNodes.entries()) {
    if (!targetNodes.has(id)) {
      nodesRemoved.push({
        type: 'REMOVED',
        nodeId: id,
        nodeName: bNode.name,
        category: bNode.category,
      });
    }
  }

  // Edge Diffs
  const baseEdges = new Map<string, WorkflowEdge>(base.edges.map((e) => [e.id, e]));
  const targetEdges = new Map<string, WorkflowEdge>(target.edges.map((e) => [e.id, e]));

  const edgesAdded: EdgeDiff[] = [];
  const edgesRemoved: EdgeDiff[] = [];

  for (const [id, tEdge] of targetEdges.entries()) {
    if (!baseEdges.has(id)) {
      edgesAdded.push({
        type: 'ADDED',
        edgeId: id,
        sourceNodeId: tEdge.sourceNodeId,
        targetNodeId: tEdge.targetNodeId,
      });
    }
  }

  for (const [id, bEdge] of baseEdges.entries()) {
    if (!targetEdges.has(id)) {
      edgesRemoved.push({
        type: 'REMOVED',
        edgeId: id,
        sourceNodeId: bEdge.sourceNodeId,
        targetNodeId: bEdge.targetNodeId,
      });
    }
  }

  const hasChanges =
    nodesAdded.length > 0 ||
    nodesRemoved.length > 0 ||
    nodesModified.length > 0 ||
    edgesAdded.length > 0 ||
    edgesRemoved.length > 0;

  // Generate Human-Readable Summary & Impact
  const summaryParts: string[] = [];
  const potentialImpact: string[] = [];

  if (nodesAdded.length > 0) {
    summaryParts.push(
      `Added ${nodesAdded.length} node(s): ${nodesAdded.map((n) => `'${n.nodeName}' (${n.category})`).join(', ')}.`,
    );
    if (nodesAdded.some((n) => n.category === 'HUMAN_APPROVAL')) {
      potentialImpact.push('Average execution duration may increase due to awaiting human approval gates.');
    }
    if (nodesAdded.some((n) => n.category === 'AGENT')) {
      potentialImpact.push('AI token consumption and processing latency will increase.');
    }
  }

  if (nodesRemoved.length > 0) {
    summaryParts.push(
      `Removed ${nodesRemoved.length} node(s): ${nodesRemoved.map((n) => `'${n.nodeName}'`).join(', ')}.`,
    );
  }

  if (nodesModified.length > 0) {
    summaryParts.push(
      `Modified ${nodesModified.length} node(s): ${nodesModified.map((n) => `'${n.nodeName}'`).join(', ')}.`,
    );
  }

  if (!hasChanges) {
    summaryParts.push('No functional differences detected between workflow versions.');
  }

  return {
    hasChanges,
    nodesAdded,
    nodesRemoved,
    nodesModified,
    nodesUnchanged,
    edgesAdded,
    edgesRemoved,
    humanReadableSummary: summaryParts.join(' '),
    potentialImpact,
  };
}
