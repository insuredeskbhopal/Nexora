import { z } from 'zod';

export type AuthStrategyType = 'OAUTH2' | 'API_KEY' | 'BEARER' | 'BASIC' | 'CUSTOM';

export type NormalizedErrorCategory =
  | 'TRANSIENT'
  | 'PERMANENT'
  | 'RATE_LIMIT'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'INVALID_INPUT'
  | 'TIMEOUT'
  | 'POLICY_BLOCK';

export class ConnectorError extends Error {
  public readonly category: NormalizedErrorCategory;
  public readonly isRetryable: boolean;
  public readonly statusCode: number | undefined;
  public readonly details: unknown | undefined;

  constructor(message: string, category: NormalizedErrorCategory, options?: { statusCode?: number; details?: unknown; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'ConnectorError';
    this.category = category;
    this.statusCode = options?.statusCode;
    this.details = options?.details;
    this.isRetryable = category === 'TRANSIENT' || category === 'RATE_LIMIT' || category === 'TIMEOUT';
  }
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  burstLimit?: number;
  concurrentLimit?: number;
}

export interface ActionExecutionContext {
  workspaceId: string;
  runId: string;
  nodeId: string;
  idempotencyKey: string;
  credentials: Record<string, unknown>;
  input: Record<string, unknown>;
}

export interface ConnectorAction {
  id: string;
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  outputSchema: z.ZodTypeAny;
  isIdempotent: boolean;
  isDestructive?: boolean;
  execute: (context: ActionExecutionContext) => Promise<Record<string, unknown>>;
  compensationAction?: string;
}

export interface ConnectorTrigger {
  id: string;
  name: string;
  description: string;
  type: 'WEBHOOK' | 'POLLING' | 'EVENT';
  outputSchema: z.ZodTypeAny;
}

export interface ConnectorManifest {
  id: string;
  name: string;
  description: string;
  category: 'CRM' | 'COMMUNICATION' | 'PRODUCTIVITY' | 'DATABASE' | 'GENERIC' | 'ECOMMERCE' | 'DEV';
  icon: string;
  authTypes: AuthStrategyType[];
  rateLimit: RateLimitConfig;
  actions: ConnectorAction[];
  triggers: ConnectorTrigger[];
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  latencyMs?: number;
  details?: Record<string, unknown>;
}
