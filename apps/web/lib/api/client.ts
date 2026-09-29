import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  AppError,
} from "@agentic/shared";
import type {
  HealthResponse,
  ReadyResponse,
  ApiClientOptions,
  RequestOptions,
} from "./types.js";

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAuthToken?:
    (() => string | null | Promise<string | null>) | undefined;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl =
      options.baseUrl ??
      (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");
    this.getAuthToken = options.getAuthToken;
  }

  private normalizeError(status: number, data: unknown): AppError {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error: { message?: string } }).error?.message ===
        "string"
        ? (data as { error: { message: string } }).error.message
        : `Request failed with status ${status}`;

    switch (status) {
      case 400:
        return new ValidationError(message, data);
      case 401:
        return new UnauthorizedError(message);
      case 403:
        return new ForbiddenError(message);
      case 404:
        return new NotFoundError(message);
      case 409:
        return new ConflictError(message);
      default:
        return new InternalError(message);
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
    const headers = new Headers(options.headers || {});

    // Ensure JSON content type by default
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    // Attach request correlation ID
    const requestId =
      options.requestId || `cli_${crypto.randomUUID().replace(/-/g, "")}`;
    headers.set("x-request-id", requestId);

    // Attach auth token if available
    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw this.normalizeError(response.status, data);
    }

    return data as T;
  }

  public async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health", { method: "GET" });
  }

  public async getReady(): Promise<ReadyResponse> {
    return this.request<ReadyResponse>("/ready", { method: "GET" });
  }
}

export const api = new ApiClient();
