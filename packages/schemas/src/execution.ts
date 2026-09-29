import { z } from 'zod';
import { idSchema, workspaceIdSchema } from './common.js';
import { environmentSchema } from './workflow.js';

export const runStatusSchema = z.enum([
  'CREATED',
  'QUEUED',
  'RUNNING',
  'WAITING',
  'WAITING_FOR_EVENT',
  'WAITING_FOR_APPROVAL',
  'WAITING_FOR_HUMAN',
  'RETRYING',
  'PAUSED',
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'FAILED',
  'CANCELLED',
  'COMPENSATING',
  'COMPENSATED',
]);
export type RunStatus = z.infer<typeof runStatusSchema>;

export const runTriggerTypeSchema = z.enum([
  'MANUAL',
  'WEBHOOK',
  'SCHEDULE',
  'EVENT',
  'API',
  'SUBWORKFLOW',
]);
export type RunTriggerType = z.infer<typeof runTriggerTypeSchema>;

export const runStepStatusSchema = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'SKIPPED',
  'CANCELLED',
  'WAITING_APPROVAL',
  'COMPENSATED',
]);
export type RunStepStatus = z.infer<typeof runStepStatusSchema>;

export const startRunSchema = z.object({
  automationId: idSchema,
  environment: environmentSchema.default('PRODUCTION'),
  triggerType: runTriggerTypeSchema.default('MANUAL'),
  triggerPayload: z.record(z.unknown()).default({}),
  correlationId: z.string().optional(),
});
export type StartRunInput = z.infer<typeof startRunSchema>;

export const retryRunSchema = z.object({
  fromStepId: z.string().optional(),
  overrideInputs: z.record(z.unknown()).optional(),
});
export type RetryRunInput = z.infer<typeof retryRunSchema>;
