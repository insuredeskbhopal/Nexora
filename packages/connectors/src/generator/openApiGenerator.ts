import { z } from 'zod';
import { BaseConnector } from '../base.js';
import {
  ConnectorManifest,
  ConnectorAction,
  TestConnectionResult,
  ConnectorError,
  AuthStrategyType,
} from '../types.js';

export interface OpenApiSpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths: Record<
    string,
    Record<
      string,
      {
        summary?: string;
        description?: string;
        operationId?: string;
        parameters?: Array<{
          name: string;
          in: 'query' | 'header' | 'path' | 'cookie';
          required?: boolean;
          description?: string;
        }>;
        requestBody?: {
          required?: boolean;
          content?: Record<string, { schema?: unknown }>;
        };
        responses?: Record<string, { description?: string }>;
      }
    >
  >;
  components?: {
    securitySchemes?: Record<string, { type: string; scheme?: string; name?: string; in?: string }>;
  };
}

export class GeneratedOpenApiConnector extends BaseConnector {
  public readonly manifest: ConnectorManifest;
  private readonly baseUrl: string;

  constructor(manifest: ConnectorManifest, baseUrl: string) {
    super();
    this.manifest = manifest;
    this.baseUrl = baseUrl;
  }

  public async testConnection(credentials: Record<string, unknown>): Promise<TestConnectionResult> {
    const start = Date.now();
    try {
      const headers: Record<string, string> = {};
      if (credentials.token) {
        headers['Authorization'] = `Bearer ${credentials.token}`;
      } else if (credentials.apiKey && credentials.apiKeyHeader) {
        headers[String(credentials.apiKeyHeader)] = String(credentials.apiKey);
      }

      const res = await fetch(this.baseUrl, {
        method: 'HEAD',
        headers,
      });

      return {
        success: res.status < 500,
        message: `API base endpoint responded with status ${res.status}`,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        message: `Endpoint probe failed: ${(err as Error).message}`,
        latencyMs: Date.now() - start,
      };
    }
  }
}

/**
 * Generator that inspects an OpenAPI v3 spec and creates a custom, strongly typed Connector.
 */
export function generateConnectorFromOpenApi(spec: OpenApiSpec, connectorIdPrefix = 'custom'): BaseConnector {
  if (!spec.info || !spec.paths) {
    throw new Error('Invalid OpenAPI specification: missing info or paths');
  }

  const rawId = spec.info.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const connectorId = `${connectorIdPrefix}_${rawId}`;
  const baseUrl = spec.servers?.[0]?.url || 'https://api.example.com';

  // Discover Auth Strategy
  const authTypes: AuthStrategyType[] = ['BEARER', 'API_KEY'];
  if (spec.components?.securitySchemes) {
    for (const scheme of Object.values(spec.components.securitySchemes)) {
      if (scheme.type === 'oauth2') authTypes.push('OAUTH2');
      if (scheme.type === 'http' && scheme.scheme === 'basic') authTypes.push('BASIC');
    }
  }

  const actions: ConnectorAction[] = [];

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    for (const [httpMethod, op] of Object.entries(pathItem)) {
      const method = httpMethod.toUpperCase();
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) continue;

      const actionId = op.operationId || `${method.toLowerCase()}_${pathStr.replace(/[^a-zA-Z0-9]+/g, '_')}`;
      const actionName = op.summary || `${method} ${pathStr}`;

      actions.push({
        id: actionId,
        name: actionName,
        description: op.description || op.summary || `Execute ${method} request to ${pathStr}`,
        inputSchema: z.object({
          pathParams: z.record(z.union([z.string(), z.number()])).optional(),
          queryParams: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
          body: z.any().optional(),
          headers: z.record(z.string()).optional(),
        }),
        outputSchema: z.record(z.any()),
        isIdempotent: method === 'GET' || method === 'PUT' || method === 'DELETE',
        execute: async (context) => {
          let resolvedPath = pathStr;
          const input = context.input as {
            pathParams?: Record<string, string | number>;
            queryParams?: Record<string, string | number | boolean>;
            body?: unknown;
            headers?: Record<string, string>;
          };

          if (input.pathParams) {
            for (const [paramName, paramVal] of Object.entries(input.pathParams)) {
              resolvedPath = resolvedPath.replace(`{${paramName}}`, encodeURIComponent(String(paramVal)));
            }
          }

          const targetUrl = new URL(resolvedPath, baseUrl);
          if (input.queryParams) {
            for (const [qKey, qVal] of Object.entries(input.queryParams)) {
              targetUrl.searchParams.append(qKey, String(qVal));
            }
          }

          const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Nexora-OpenApi-Connector/1.0',
            ...(input.headers || {}),
          };

          if (context.credentials?.token) {
            requestHeaders['Authorization'] = `Bearer ${context.credentials.token}`;
          } else if (context.credentials?.apiKey) {
            const headerName = (context.credentials.apiKeyHeader as string) || 'X-API-Key';
            requestHeaders[headerName] = String(context.credentials.apiKey);
          }

          const hasBody = method !== 'GET' && input.body !== undefined;
          const requestInit: RequestInit = {
            method,
            headers: requestHeaders,
          };
          if (hasBody) {
            requestInit.body = JSON.stringify(input.body);
          }
          const res = await fetch(targetUrl.toString(), requestInit);

          if (!res.ok) {
            throw new ConnectorError(
              `API call to ${method} ${pathStr} failed with status ${res.status}: ${res.statusText}`,
              res.status >= 500 ? 'TRANSIENT' : 'PERMANENT',
              { statusCode: res.status }
            );
          }

          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return (await res.json()) as Record<string, unknown>;
          }
          const text = await res.text();
          return { data: text };
        },
      });
    }
  }

  const manifest: ConnectorManifest = {
    id: connectorId,
    name: spec.info.title,
    description: spec.info.description || `Auto-generated connector for ${spec.info.title}`,
    category: 'GENERIC',
    icon: 'puzzle',
    authTypes,
    rateLimit: {
      requestsPerMinute: 300,
      burstLimit: 30,
    },
    actions,
    triggers: [],
  };

  return new GeneratedOpenApiConnector(manifest, baseUrl);
}
