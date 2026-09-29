import { pino, type Logger, type LoggerOptions } from "pino";

export type { Logger } from "pino";

export interface CreateLoggerOptions {
  service: string;
  environment?: string;
  level?: string;
  redactPaths?: string[];
}

export const DEFAULT_REDACT_KEYS = [
  "authorization",
  "cookie",
  "password",
  "token",
  "secret",
  "apiKey",
  "accessToken",
  "refreshToken",
  "headers.authorization",
  "headers.cookie",
  "req.headers.authorization",
  "req.headers.cookie",
  "*.password",
  "*.token",
  "*.secret",
  "*.apiKey",
  "*.accessToken",
  "*.refreshToken",
];

/**
 * Creates a structured JSON logger with sensible security redaction and metadata.
 */
export function createLogger(options: CreateLoggerOptions): Logger {
  const {
    service,
    environment = process.env.NODE_ENV || "development",
    level = process.env.LOG_LEVEL || "info",
    redactPaths = [],
  } = options;

  const pinoOptions: LoggerOptions = {
    level,
    base: {
      service,
      environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    redact: {
      paths: [...DEFAULT_REDACT_KEYS, ...redactPaths],
      censor: "[REDACTED]",
    },
  };

  return pino(pinoOptions);
}

/**
 * Creates a correlated child logger bound to a specific request ID or workflow execution ID.
 */
export function createChildLogger(
  parent: Logger,
  bindings: {
    requestId?: string;
    workflowId?: string;
    workspaceId?: string;
    [key: string]: unknown;
  },
): Logger {
  return parent.child(bindings);
}
