export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export interface SerializedError {
  code: ErrorCode;
  message: string;
  requestId?: string;
  details?: unknown;
  stack?: string;
}

export interface ErrorResponseEnvelope {
  error: SerializedError;
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(options: {
    message: string;
    code: ErrorCode;
    statusCode: number;
    details?: unknown;
    isOperational?: boolean;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = options.code;
    this.statusCode = options.statusCode;
    if (options.details !== undefined) {
      this.details = options.details;
    }
    this.isOperational = options.isOperational ?? true;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super({
      message,
      code: "VALIDATION_ERROR",
      statusCode: 400,
      details,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super({
      message,
      code: "UNAUTHORIZED",
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super({
      message,
      code: "FORBIDDEN",
      statusCode: 403,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super({
      message,
      code: "NOT_FOUND",
      statusCode: 404,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super({
      message,
      code: "CONFLICT",
      statusCode: 409,
    });
  }
}

export class InternalError extends AppError {
  constructor(
    message = "An unexpected internal error occurred",
    cause?: unknown,
  ) {
    super({
      message,
      code: "INTERNAL_ERROR",
      statusCode: 500,
      isOperational: false,
      cause,
    });
  }
}

/**
 * Consistent error response formatter ensuring no stack traces leak in production.
 */
export function formatErrorResponse(
  error: unknown,
  requestId?: string,
  isProduction = process.env.NODE_ENV === "production",
): { statusCode: number; payload: ErrorResponseEnvelope } {
  if (error instanceof AppError) {
    const serialized: SerializedError = {
      code: error.code,
      message: error.message,
    };
    if (requestId) serialized.requestId = requestId;
    if (error.details !== undefined) serialized.details = error.details;
    if (!isProduction && error.stack) serialized.stack = error.stack;

    return {
      statusCode: error.statusCode,
      payload: { error: serialized },
    };
  }

  // Handle unexpected generic errors
  const fallbackMessage = isProduction
    ? "Internal Server Error"
    : (error as Error)?.message || "Unknown error";
  const serialized: SerializedError = {
    code: "INTERNAL_ERROR",
    message: fallbackMessage,
  };
  if (requestId) serialized.requestId = requestId;
  if (!isProduction && error instanceof Error && error.stack) {
    serialized.stack = error.stack;
  }

  return {
    statusCode: 500,
    payload: { error: serialized },
  };
}

/**
 * Universal UUID generator compatible with both Node.js and browser environments
 */
export function generateUUID(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Standard prefixed ID generator
 */
export function generateId(prefix?: string): string {
  const uuid = generateUUID();
  return prefix ? `${prefix}_${uuid.replace(/-/g, "")}` : uuid;
}
