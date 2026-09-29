export type {
  HealthResponse,
  ReadyResponse,
  ErrorEnvelope,
} from "@agentic/schemas";

export interface ApiClientOptions {
  baseUrl?: string | undefined;
  getAuthToken?: (() => string | null | Promise<string | null>) | undefined;
}

export interface RequestOptions extends RequestInit {
  requestId?: string | undefined;
}
