import { z } from 'zod';
import { idSchema, workspaceIdSchema } from './common.js';

export const automationStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED']);
export type AutomationStatus = z.infer<typeof automationStatusSchema>;

export const autonomyLevelSchema = z.enum([
  'LEVEL_0_OBSERVE',
  'LEVEL_1_SUGGEST',
  'LEVEL_2_PREPARE',
  'LEVEL_3_EXECUTE_WITH_APPROVAL',
  'LEVEL_4_EXECUTE_WITHIN_GUARDRAILS',
  'LEVEL_5_AUTONOMOUS',
]);
export type AutonomyLevel = z.infer<typeof autonomyLevelSchema>;

export const environmentSchema = z.enum(['DEVELOPMENT', 'TEST', 'STAGING', 'PRODUCTION']);
export type Environment = z.infer<typeof environmentSchema>;

export const nodeCategorySchema = z.enum([
  'TRIGGER',
  'ACTION',
  'AGENT',
  'CONDITION',
  'SWITCH',
  'LOOP',
  'PARALLEL',
  'JOIN',
  'WAIT',
  'SCHEDULE',
  'HUMAN_APPROVAL',
  'HUMAN_TASK',
  'SUBWORKFLOW',
  'TRANSFORM',
  'CODE',
  'HTTP',
  'DATABASE',
  'BROWSER',
  'COMPUTER',
  'DOCUMENT',
  'MODEL',
  'MEMORY',
  'NOTIFICATION',
  'END',
  'FAIL',
]);
export type NodeCategory = z.infer<typeof nodeCategorySchema>;

export const retryPolicySchema = z.object({
  maxAttempts: z.number().int().min(1).max(10).default(3),
  initialDelayMs: z.number().int().min(100).default(1000),
  maxDelayMs: z.number().int().min(1000).default(60000),
  backoffMultiplier: z.number().min(1).default(2),
  jitter: z.boolean().default(true),
  retryableErrors: z.array(z.string()).default(['TRANSIENT', 'RATE_LIMIT', 'TIMEOUT', 'PROVIDER_OUTAGE']),
  nonRetryableErrors: z.array(z.string()).default(['AUTHENTICATION', 'AUTHORIZATION', 'INVALID_INPUT', 'POLICY_BLOCK']),
});
export type RetryPolicy = z.infer<typeof retryPolicySchema>;

export const workflowNodeSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(255),
  category: nodeCategorySchema,
  description: z.string().optional(),
  config: z.record(z.unknown()).default({}),
  retryPolicy: retryPolicySchema.optional(),
  timeoutMs: z.number().int().positive().optional(),
  compensationNodeId: z.string().optional(),
});
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;

export const workflowEdgeSchema = z.object({
  id: idSchema,
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  condition: z.string().optional(),
  label: z.string().optional(),
});
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;

export const workflowDefinitionSchema = z.object({
  schemaVersion: z.literal('1.0.0').default('1.0.0'),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).default(''),
  triggers: z.array(workflowNodeSchema).min(1, 'Workflow must have at least one trigger node'),
  nodes: z.array(workflowNodeSchema).min(1, 'Workflow must have at least one execution node'),
  edges: z.array(workflowEdgeSchema),
  variables: z.record(z.unknown()).default({}),
  limits: z
    .object({
      maxExecutionTimeMs: z.number().int().positive().default(86400000), // 24 hours
      maxSteps: z.number().int().positive().default(1000),
      maxCostUsd: z.number().positive().default(50.0),
    })
    .default({}),
});
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export const createAutomationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  description: z.string().max(2000).optional(),
  autonomyLevel: autonomyLevelSchema.default('LEVEL_3_EXECUTE_WITH_APPROVAL'),
  environment: environmentSchema.default('DEVELOPMENT'),
});
export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
