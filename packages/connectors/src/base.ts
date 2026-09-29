import {
  ConnectorManifest,
  ConnectorAction,
  ConnectorTrigger,
  TestConnectionResult,
  ConnectorError,
  NormalizedErrorCategory,
  ActionExecutionContext,
} from './types.js';

export abstract class BaseConnector {
  public abstract readonly manifest: ConnectorManifest;

  public get id(): string {
    return this.manifest.id;
  }

  public get name(): string {
    return this.manifest.name;
  }

  public getAction(actionId: string): ConnectorAction | undefined {
    return this.manifest.actions.find((a) => a.id === actionId);
  }

  public getTrigger(triggerId: string): ConnectorTrigger | undefined {
    return this.manifest.triggers.find((t) => t.id === triggerId);
  }

  /**
   * Safe execution wrapper that validates input schema, handles rate limits,
   * catches raw exceptions, and normalizes them into structured ConnectorError instances.
   */
  public async executeAction(
    actionId: string,
    context: ActionExecutionContext
  ): Promise<Record<string, unknown>> {
    const action = this.getAction(actionId);
    if (!action) {
      throw new ConnectorError(
        `Action "${actionId}" not found on connector "${this.id}"`,
        'INVALID_INPUT'
      );
    }

    // 1. Validate Input Schema
    const parseResult = action.inputSchema.safeParse(context.input);
    if (!parseResult.success) {
      throw new ConnectorError(
        `Invalid input for action "${actionId}": ${parseResult.error.message}`,
        'INVALID_INPUT',
        { details: parseResult.error.issues }
      );
    }

    const validatedContext = {
      ...context,
      input: parseResult.data as Record<string, unknown>,
    };

    // 2. Execute Action with normalized error handling
    try {
      const output = await action.execute(validatedContext);
      
      // 3. Validate Output Schema if provided
      const outputParse = action.outputSchema.safeParse(output);
      if (!outputParse.success) {
        throw new ConnectorError(
          `Action "${actionId}" produced invalid output schema: ${outputParse.error.message}`,
          'TRANSIENT',
          { details: outputParse.error.issues }
        );
      }

      return outputParse.data as Record<string, unknown>;
    } catch (err: unknown) {
      if (err instanceof ConnectorError) {
        throw err;
      }
      throw this.normalizeError(err);
    }
  }

  /**
   * Healthcheck method to verify credentials against external API.
   */
  public abstract testConnection(
    credentials: Record<string, unknown>
  ): Promise<TestConnectionResult>;

  /**
   * Error normalizer converts raw fetch/network/HTTP/API errors into typed ConnectorError.
   */
  public normalizeError(error: unknown): ConnectorError {
    if (error instanceof ConnectorError) {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Rate limit
      if (message.includes('rate limit') || message.includes('429') || message.includes('too many requests')) {
        return new ConnectorError(error.message, 'RATE_LIMIT', { cause: error });
      }

      // Authentication / Authorization
      if (message.includes('unauthorized') || message.includes('401') || message.includes('invalid credentials') || message.includes('token expired')) {
        return new ConnectorError(error.message, 'AUTHENTICATION', { cause: error });
      }
      if (message.includes('forbidden') || message.includes('403') || message.includes('permission denied')) {
        return new ConnectorError(error.message, 'AUTHORIZATION', { cause: error });
      }

      // Timeout / Transient
      if (message.includes('timeout') || message.includes('econnreset') || message.includes('503') || message.includes('502') || message.includes('gateway')) {
        return new ConnectorError(error.message, 'TRANSIENT', { cause: error });
      }

      return new ConnectorError(error.message, 'PERMANENT', { cause: error });
    }

    return new ConnectorError('Unknown external error occurred', 'PERMANENT', { details: error });
  }
}
