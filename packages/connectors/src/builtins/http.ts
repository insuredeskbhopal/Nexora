import { z } from 'zod';
import { BaseConnector } from '../base.js';
import { ConnectorManifest, TestConnectionResult, ConnectorError } from '../types.js';

const HttpRequestInputSchema = z.object({
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']).default('GET'),
  headers: z.record(z.string()).optional(),
  queryParams: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  body: z.any().optional(),
  timeoutMs: z.number().int().positive().max(60000).default(30000),
});

const HttpResponseSchema = z.object({
  status: z.number().int(),
  statusText: z.string(),
  headers: z.record(z.string()),
  data: z.any().optional(),
});

export class HttpConnector extends BaseConnector {
  public readonly manifest: ConnectorManifest = {
    id: 'http',
    name: 'HTTP / REST API',
    description: 'Execute arbitrary HTTP/REST API requests with custom authentication, headers, and payload',
    category: 'GENERIC',
    icon: 'globe',
    authTypes: ['BEARER', 'API_KEY', 'BASIC', 'CUSTOM'],
    rateLimit: {
      requestsPerMinute: 600,
      burstLimit: 50,
      concurrentLimit: 20,
    },
    actions: [
      {
        id: 'request',
        name: 'HTTP Request',
        description: 'Send an HTTP request to any API endpoint',
        inputSchema: HttpRequestInputSchema,
        outputSchema: HttpResponseSchema,
        isIdempotent: false,
        execute: async (context) => {
          const input = HttpRequestInputSchema.parse(context.input);
          const url = new URL(input.url);

          if (input.queryParams) {
            for (const [key, value] of Object.entries(input.queryParams)) {
              url.searchParams.append(key, String(value));
            }
          }

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Nexora-Agentic-Platform/1.0',
            ...(input.headers || {}),
          };

          // Apply credentials if provided
          if (context.credentials) {
            if (context.credentials.token) {
              headers['Authorization'] = `Bearer ${context.credentials.token}`;
            } else if (context.credentials.apiKey && context.credentials.apiKeyHeader) {
              headers[String(context.credentials.apiKeyHeader)] = String(context.credentials.apiKey);
            } else if (context.credentials.username && context.credentials.password) {
              const authString = Buffer.from(
                `${context.credentials.username}:${context.credentials.password}`
              ).toString('base64');
              headers['Authorization'] = `Basic ${authString}`;
            }
          }

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

          try {
            const hasBody = input.method !== 'GET' && input.method !== 'HEAD' && input.body !== undefined;
            const requestInit: RequestInit = {
              method: input.method,
              headers,
              signal: controller.signal,
            };
            if (hasBody) {
              requestInit.body = typeof input.body === 'string' ? input.body : JSON.stringify(input.body);
            }

            const response = await fetch(url.toString(), requestInit);

            clearTimeout(timeout);

            let data: unknown;
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              data = await response.json();
            } else {
              data = await response.text();
            }

            const responseHeaders: Record<string, string> = {};
            response.headers.forEach((val, key) => {
              responseHeaders[key] = val;
            });

            if (!response.ok) {
              throw new ConnectorError(
                `HTTP Request failed with status ${response.status}: ${response.statusText}`,
                response.status >= 500 || response.status === 429 ? 'TRANSIENT' : 'PERMANENT',
                { statusCode: response.status, details: data }
              );
            }

            return {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              data,
            };
          } catch (err: unknown) {
            clearTimeout(timeout);
            if (err instanceof ConnectorError) throw err;
            if (err instanceof Error && err.name === 'AbortError') {
              throw new ConnectorError(`HTTP request timed out after ${input.timeoutMs}ms`, 'TIMEOUT');
            }
            throw new ConnectorError(`Network connection failed: ${(err as Error).message}`, 'TRANSIENT', { cause: err });
          }
        },
      },
    ],
    triggers: [],
  };

  public async testConnection(credentials: Record<string, unknown>): Promise<TestConnectionResult> {
    const testUrl = (credentials.testUrl as string) || (credentials.baseUrl as string);
    if (!testUrl) {
      return { success: true, message: 'HTTP connector configured without static test endpoint' };
    }

    const start = Date.now();
    try {
      const res = await fetch(testUrl, { method: 'HEAD' });
      return {
        success: res.ok,
        message: `HTTP endpoint responded with status ${res.status}`,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        message: `Connection failed: ${(err as Error).message}`,
        latencyMs: Date.now() - start,
      };
    }
  }
}
