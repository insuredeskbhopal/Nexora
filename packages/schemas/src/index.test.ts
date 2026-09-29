import { describe, expect, it } from 'vitest';
import {
  healthResponseSchema,
  readyResponseSchema,
  errorEnvelopeSchema,
  workspaceRoleSchema,
  workspacePermissionSchema,
  workflowDefinitionSchema,
  runStatusSchema,
  approvalDecisionSchema,
  auditLogEntrySchema,
} from './index.js';

describe('@agentic/schemas', () => {
  it('validates a correct HealthResponse payload', () => {
    const valid = {
      status: 'ok',
      service: 'agentic-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: 42.5,
    };
    expect(healthResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('validates a valid ReadyResponse payload', () => {
    const valid = {
      status: 'ok',
      service: 'agentic-api',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: { status: 'up', latencyMs: 5 },
        redis: { status: 'up', latencyMs: 2 },
      },
    };
    expect(readyResponseSchema.safeParse(valid).success).toBe(true);
  });

  it('validates canonical RBAC roles and permissions', () => {
    expect(workspaceRoleSchema.safeParse('OWNER').success).toBe(true);
    expect(workspaceRoleSchema.safeParse('AUTOMATION_DEVELOPER').success).toBe(true);
    expect(workspaceRoleSchema.safeParse('UNKNOWN_ROLE').success).toBe(false);

    expect(workspacePermissionSchema.safeParse('automation.publish').success).toBe(true);
    expect(workspacePermissionSchema.safeParse('approval.decide').success).toBe(true);
    expect(workspacePermissionSchema.safeParse('invalid.permission').success).toBe(false);
  });

  it('validates canonical workflow definition with nodes, triggers, and edges', () => {
    const validWorkflow = {
      schemaVersion: '1.0.0',
      name: 'Lead Qualification & CRM Sync',
      description: 'Automatically verifies leads and updates CRM',
      triggers: [
        {
          id: 'node_trigger_1',
          name: 'Website Lead Webhook',
          category: 'TRIGGER',
          config: { path: '/leads' },
        },
      ],
      nodes: [
        {
          id: 'node_action_verify',
          name: 'Verify Lead Email',
          category: 'ACTION',
          config: { service: 'lead_verifier' },
          retryPolicy: {
            maxAttempts: 3,
            initialDelayMs: 1000,
            maxDelayMs: 30000,
            backoffMultiplier: 2,
            jitter: true,
            retryableErrors: ['TRANSIENT'],
            nonRetryableErrors: ['INVALID_INPUT'],
          },
        },
      ],
      edges: [
        {
          id: 'edge_1',
          sourceNodeId: 'node_trigger_1',
          targetNodeId: 'node_action_verify',
        },
      ],
    };

    const parsed = workflowDefinitionSchema.safeParse(validWorkflow);
    expect(parsed.success).toBe(true);
  });

  it('validates run statuses and approval decisions', () => {
    expect(runStatusSchema.safeParse('RUNNING').success).toBe(true);
    expect(runStatusSchema.safeParse('WAITING_FOR_APPROVAL').success).toBe(true);
    expect(runStatusSchema.safeParse('COMPENSATING').success).toBe(true);

    const approveDecision = { decision: 'APPROVE', comments: 'Approved by CFO' };
    expect(approvalDecisionSchema.safeParse(approveDecision).success).toBe(true);
  });
});
