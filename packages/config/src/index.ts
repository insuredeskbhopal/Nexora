import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

// Determine root directory to guarantee we load the project's local .env
let rootEnvPath = path.resolve(process.cwd(), '.env');
try {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  rootEnvPath = path.resolve(currentDir, '../../../.env');
} catch {
  // Fallback to process.cwd()
}

// CRITICAL: Force override system/ambient environment variables with project's own .env
loadDotenv({ path: rootEnvPath, override: true });

export const EnvironmentEnum = z.enum(['development', 'test', 'staging', 'production']);
export type Environment = z.infer<typeof EnvironmentEnum>;

export const LogLevelEnum = z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
export type LogLevel = z.infer<typeof LogLevelEnum>;

const FORBIDDEN_DB_SIGNATURES = [
  'ep-gentle-king',
  'bima',
  'sunlife',
  'insuredesk',
];

const ALLOWED_CLOUD_HOSTS = [
  'ep-lively-cake-b40xdxkl-pooler.c-6.us-east-2.aws.neon.tech',
];

/**
 * Zod schema defining all required environment variables for the platform services.
 */
export const serverConfigSchema = z
  .object({
    NODE_ENV: EnvironmentEnum.default('development'),
    APP_ENV: EnvironmentEnum.default('development'),

    WEB_PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
    API_PORT: z.coerce.number().int().min(1024).max(65535).default(4000),

    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

    TEMPORAL_ADDRESS: z.string().min(1, 'TEMPORAL_ADDRESS is required').default('localhost:7233'),
    TEMPORAL_NAMESPACE: z.string().min(1, 'TEMPORAL_NAMESPACE is required').default('default'),

    S3_ENDPOINT: z.string().min(1, 'S3_ENDPOINT is required').default('http://localhost:9000'),
    S3_REGION: z.string().min(1, 'S3_REGION is required').default('us-east-1'),
    S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
    S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),
    S3_BUCKET: z.string().min(1, 'S3_BUCKET is required').default('agentic-artifacts'),

    LOG_LEVEL: LogLevelEnum.default('info'),
  })
  .superRefine((data, ctx) => {
    // CRITICAL DATABASE SAFETY SAFEGUARDS
    const dbUrlLower = data.DATABASE_URL.toLowerCase();

    // 1. Guard against external project databases (Bima Headquarter, Sunlife Solar, ep-gentle-king, etc.)
    for (const signature of FORBIDDEN_DB_SIGNATURES) {
      if (dbUrlLower.includes(signature)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `CRITICAL DATABASE MISMATCH: Target DATABASE_URL matches forbidden external project signature "${signature}". One project = one database. Refusing to connect to an external database.`,
          path: ['DATABASE_URL'],
        });
        return;
      }
    }

    // 2. Validate database name and host in development/test
    if (data.NODE_ENV === 'test' || data.NODE_ENV === 'development') {
      try {
        const parsedUrl = new URL(data.DATABASE_URL);
        const host = parsedUrl.hostname.toLowerCase();
        const dbName = parsedUrl.pathname.replace(/^\//, '').toLowerCase();

        const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === 'postgres' || host.endsWith('.local');
        const isAuthorizedCloudHost = ALLOWED_CLOUD_HOSTS.some((h) => host === h || host.endsWith(h));

        if (!isLocalHost && !isAuthorizedCloudHost) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `FATAL ENVIRONMENT SAFETY VIOLATION: Host "${host}" is not an authorized database host for this project.`,
            path: ['DATABASE_URL'],
          });
        }

        const allowedDbs = ['agentic_dev', 'agentic_test', 'neondb'];
        if (!allowedDbs.includes(dbName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `CRITICAL DATABASE MISMATCH: Target database is "${dbName}". Must be one of [${allowedDbs.join(', ')}] for this project.`,
            path: ['DATABASE_URL'],
          });
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'DATABASE_URL is not a valid URL format.',
          path: ['DATABASE_URL'],
        });
      }
    }
  });

export type ServerConfig = z.infer<typeof serverConfigSchema>;

/**
 * Loads and validates configuration against the schema.
 * Throws a formatted error if validation fails.
 */
export function loadConfig(envInput: Record<string, string | undefined> = process.env): ServerConfig {
  const result = serverConfigSchema.safeParse(envInput);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - [${issue.path.join('.') || 'root'}]: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n❌ [CONFIGURATION ERROR] Invalid or dangerous environment configuration:\n${issues}\n`
    );
  }

  return Object.freeze(result.data);
}

let cachedConfig: ServerConfig | null = null;

export function getConfig(): ServerConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}
