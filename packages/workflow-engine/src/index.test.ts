import { describe, expect, it } from 'vitest';
import {
  validateWorkflow,
  analyzeWorkflowRisk,
  computeWorkflowDiff,
} from './index.js';
import type { WorkflowDefinition } from '@agentic/schemas';

describe('@agentic/workflow-engine', () => {
  const baseValidWorkflow: WorkflowDefinition = {
    schemaVersion: '1.0.0',
    name: 'Customer Ingestion & Verification',
    description: 'Ingests new leads and verifies email',
    triggers: [
      {
        id: 'node_trigger',
        name: 'New Lead Webhook',
        category: 'TRIGGER',
        config: { type: 'webhook', path: '/webhook/lead' },
      },
    ],
    nodes: [
      {
        id: 'node_verify',
        name: 'Verify Lead Data',
        category: 'ACTION',
        config: { action: 'verify' },
        timeoutMs: 30000,
      },
      {
        id: 'node_db',
        name: 'Save to Database',
        category: 'DATABASE',
        config: { operation: 'insert' },
        timeoutMs: 5000,
      },
    ],
    edges: [
      {
        id: 'edge_1',
        sourceNodeId: 'node_trigger',
        targetNodeId: 'node_verify',
      },
      {
        id: 'edge_2',
        sourceNodeId: 'node_verify',
        targetNodeId: 'node_db',
      },
    ],
    variables: {},
    limits: {
      maxExecutionTimeMs: 3600000,
      maxSteps: 50,
      maxCostUsd: 10,
    },
  };

  describe('Workflow Validator', () => {
    it('validates a correct linear DAG workflow', () => {
      const result = validateWorkflow(baseValidWorkflow);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects dangling edges pointing to non-existent nodes', () => {
      const invalidWorkflow = {
        ...baseValidWorkflow,
        edges: [
          ...baseValidWorkflow.edges,
          {
            id: 'edge_broken',
            sourceNodeId: 'node_db',
            targetNodeId: 'node_ghost_unknown',
          },
        ],
      };

      const result = validateWorkflow(invalidWorkflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'DANGLING_EDGE_TARGET')).toBe(true);
    });

    it('detects orphan / unreachable nodes in the workflow', () => {
      const orphanWorkflow = {
        ...baseValidWorkflow,
        nodes: [
          ...baseValidWorkflow.nodes,
          {
            id: 'node_isolated',
            name: 'Forgotten Node',
            category: 'ACTION' as const,
            config: {},
          },
        ],
      };

      const result = validateWorkflow(orphanWorkflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'ORPHAN_NODE')).toBe(true);
    });

    it('detects illegal cycles when no formal LOOP node is declared', () => {
      const cyclicWorkflow = {
        ...baseValidWorkflow,
        edges: [
          ...baseValidWorkflow.edges,
          {
            id: 'edge_cycle_back',
            sourceNodeId: 'node_db',
            targetNodeId: 'node_verify',
          },
        ],
      };

      const result = validateWorkflow(cyclicWorkflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'CYCLE_DETECTED')).toBe(true);
    });

    it('rejects LOOP nodes lacking maxIterations safety boundaries', () => {
      const unboundedLoopWorkflow = {
        ...baseValidWorkflow,
        nodes: [
          ...baseValidWorkflow.nodes,
          {
            id: 'node_loop',
            name: 'Process Batch',
            category: 'LOOP' as const,
            config: {}, // Missing maxIterations!
          },
        ],
        edges: [
          ...baseValidWorkflow.edges,
          {
            id: 'edge_to_loop',
            sourceNodeId: 'node_db',
            targetNodeId: 'node_loop',
          },
        ],
      };

      const result = validateWorkflow(unboundedLoopWorkflow);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNBOUNDED_LOOP_ERROR')).toBe(true);
    });
  });

  describe('Static Risk Analyzer', () => {
    it('flags AI output directly executing a payment as CRITICAL', () => {
      const dangerousWorkflow: WorkflowDefinition = {
        ...baseValidWorkflow,
        nodes: [
          {
            id: 'node_ai_agent',
            name: 'Financial Decision Agent',
            category: 'AGENT',
            config: { model: 'gpt-4o' },
          },
          {
            id: 'node_payout',
            name: 'Execute Bank Transfer Payment',
            category: 'ACTION',
            config: { action: 'execute_payment' },
          },
        ],
        edges: [
          {
            id: 'edge_1',
            sourceNodeId: 'node_trigger',
            targetNodeId: 'node_ai_agent',
          },
          {
            id: 'edge_danger',
            sourceNodeId: 'node_ai_agent',
            targetNodeId: 'node_payout',
          },
        ],
      };

      const report = analyzeWorkflowRisk(dangerousWorkflow);
      expect(report.highestRisk).toBe('CRITICAL');
      expect(report.blockedFromActivation).toBe(true);
      expect(report.findings.some((f) => f.code === 'AI_DIRECT_PAYMENT')).toBe(true);
    });

    it('allows AI output when guarded by a HUMAN_APPROVAL gate', () => {
      const guardedWorkflow: WorkflowDefinition = {
        ...baseValidWorkflow,
        nodes: [
          {
            id: 'node_ai_agent',
            name: 'Financial Decision Agent',
            category: 'AGENT',
            config: { model: 'gpt-4o' },
          },
          {
            id: 'node_approval',
            name: 'CFO Approval Gate',
            category: 'HUMAN_APPROVAL',
            config: { approverRole: 'OWNER' },
          },
          {
            id: 'node_payout',
            name: 'Execute Bank Transfer Payment',
            category: 'ACTION',
            config: { action: 'execute_payment' },
          },
        ],
        edges: [
          {
            id: 'edge_1',
            sourceNodeId: 'node_trigger',
            targetNodeId: 'node_ai_agent',
          },
          {
            id: 'edge_2',
            sourceNodeId: 'node_ai_agent',
            targetNodeId: 'node_approval',
          },
          {
            id: 'edge_3',
            sourceNodeId: 'node_approval',
            targetNodeId: 'node_payout',
          },
        ],
      };

      const report = analyzeWorkflowRisk(guardedWorkflow);
      expect(report.findings.some((f) => f.code === 'AI_DIRECT_PAYMENT')).toBe(false);
      expect(report.blockedFromActivation).toBe(false);
    });
  });

  describe('Workflow Diff Engine', () => {
    it('detects added approval gate and notes impact on execution duration', () => {
      const targetWorkflow: WorkflowDefinition = {
        ...baseValidWorkflow,
        nodes: [
          ...baseValidWorkflow.nodes,
          {
            id: 'node_manager_approval',
            name: 'Manager Review',
            category: 'HUMAN_APPROVAL',
            config: { approverRole: 'ADMIN' },
          },
        ],
        edges: [
          baseValidWorkflow.edges[0]!,
          {
            id: 'edge_to_approval',
            sourceNodeId: 'node_verify',
            targetNodeId: 'node_manager_approval',
          },
          {
            id: 'edge_to_db',
            sourceNodeId: 'node_manager_approval',
            targetNodeId: 'node_db',
          },
        ],
      };

      const diff = computeWorkflowDiff(baseValidWorkflow, targetWorkflow);
      expect(diff.hasChanges).toBe(true);
      expect(diff.nodesAdded).toHaveLength(1);
      expect(diff.nodesAdded[0]!.nodeName).toBe('Manager Review');
      expect(diff.potentialImpact.some((i) => i.includes('human approval'))).toBe(true);
      expect(diff.humanReadableSummary).toContain('Manager Review');
    });
  });
});
