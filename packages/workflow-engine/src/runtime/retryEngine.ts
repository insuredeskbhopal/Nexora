import type { RetryPolicy } from '@agentic/schemas';

export type ErrorClassification =
  | 'TRANSIENT'
  | 'PERMANENT'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'RATE_LIMIT'
  | 'INVALID_INPUT'
  | 'PROVIDER_OUTAGE'
  | 'USER_ACTION_REQUIRED'
  | 'AGENT_FAILURE'
  | 'VALIDATION_FAILURE'
  | 'TIMEOUT'
  | 'POLICY_BLOCK';

export interface RetryEvaluation {
  shouldRetry: boolean;
  delayMs: number;
  attempt: number;
  maxAttempts: number;
  reason: string;
  errorClassification: ErrorClassification;
}

/**
 * Classifies an error into standardized platform error categories.
 * Section 14: Distinguishes between transient network/rate-limit errors and permanent auth/input errors.
 */
export function classifyError(error: unknown): ErrorClassification {
  if (!error) return 'TRANSIENT';

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const code = (error as { code?: string })?.code?.toUpperCase();

  if (code === 'UNAUTHORIZED' || message.includes('unauthorized') || message.includes('invalid credentials')) {
    return 'AUTHENTICATION';
  }
  if (code === 'FORBIDDEN' || message.includes('forbidden') || message.includes('permission denied')) {
    return 'AUTHORIZATION';
  }
  if (code === 'POLICY_BLOCK' || message.includes('policy block') || message.includes('blocked by policy')) {
    return 'POLICY_BLOCK';
  }
  if (code === 'VALIDATION_ERROR' || message.includes('validation failed') || message.includes('invalid input')) {
    return 'INVALID_INPUT';
  }
  if (code === 'RATE_LIMIT' || code === 'RATE_LIMITED' || message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
    return 'RATE_LIMIT';
  }
  if (code === 'TIMEOUT' || message.includes('timeout') || message.includes('timed out') || message.includes('etimedout')) {
    return 'TIMEOUT';
  }
  if (message.includes('econnrefused') || message.includes('econnreset') || message.includes('socket hang up') || message.includes('503') || message.includes('service unavailable')) {
    return 'PROVIDER_OUTAGE';
  }

  return 'TRANSIENT';
}

/**
 * Evaluates whether a failed execution attempt should be retried, computing exponential backoff delay with jitter.
 */
export function evaluateRetry(
  policy: RetryPolicy | undefined,
  currentAttempt: number,
  error: unknown,
): RetryEvaluation {
  const defaultPolicy: RetryPolicy = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitter: true,
    retryableErrors: ['TRANSIENT', 'RATE_LIMIT', 'TIMEOUT', 'PROVIDER_OUTAGE'],
    nonRetryableErrors: ['AUTHENTICATION', 'AUTHORIZATION', 'INVALID_INPUT', 'POLICY_BLOCK'],
  };

  const effectivePolicy = policy ?? defaultPolicy;
  const classification = classifyError(error);

  // 1. Check max attempts boundary
  if (currentAttempt >= effectivePolicy.maxAttempts) {
    return {
      shouldRetry: false,
      delayMs: 0,
      attempt: currentAttempt,
      maxAttempts: effectivePolicy.maxAttempts,
      reason: `Maximum retry attempts reached (${currentAttempt}/${effectivePolicy.maxAttempts})`,
      errorClassification: classification,
    };
  }

  // 2. Check if error is explicitly non-retryable
  if (effectivePolicy.nonRetryableErrors.includes(classification)) {
    return {
      shouldRetry: false,
      delayMs: 0,
      attempt: currentAttempt,
      maxAttempts: effectivePolicy.maxAttempts,
      reason: `Error classification '${classification}' is marked as non-retryable in retry policy`,
      errorClassification: classification,
    };
  }

  // 3. Check if error is in retryable list
  const isRetryable = effectivePolicy.retryableErrors.includes(classification);
  if (!isRetryable) {
    return {
      shouldRetry: false,
      delayMs: 0,
      attempt: currentAttempt,
      maxAttempts: effectivePolicy.maxAttempts,
      reason: `Error classification '${classification}' is not listed in retryableErrors`,
      errorClassification: classification,
    };
  }

  // 4. Calculate Exponential Backoff with Jitter
  // delay = min(maxDelay, initialDelay * (multiplier ^ (attempt - 1)))
  let delay = effectivePolicy.initialDelayMs * Math.pow(effectivePolicy.backoffMultiplier, currentAttempt - 1);
  delay = Math.min(delay, effectivePolicy.maxDelayMs);

  if (effectivePolicy.jitter) {
    // Full jitter between 0.5 * delay and 1.5 * delay
    const factor = 0.5 + Math.random();
    delay = Math.round(delay * factor);
  }

  return {
    shouldRetry: true,
    delayMs: Math.max(delay, 50),
    attempt: currentAttempt + 1,
    maxAttempts: effectivePolicy.maxAttempts,
    reason: `Retry attempt ${currentAttempt + 1}/${effectivePolicy.maxAttempts} scheduled after backoff`,
    errorClassification: classification,
  };
}
