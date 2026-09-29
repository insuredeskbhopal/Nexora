import { describe, expect, it, vi } from "vitest";
import { ApiClient } from "./client.js";
import { ValidationError, NotFoundError } from "@agentic/shared";

describe("ApiClient", () => {
  it("sends request with x-request-id and parses JSON response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ status: "ok", service: "api" }),
    });
    globalThis.fetch = mockFetch;

    const client = new ApiClient({ baseUrl: "http://localhost:4000" });
    const res = await client.request<{ status: string }>("/health");

    expect(res.status).toBe("ok");
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const callHeaders = mockFetch.mock.calls[0]![1].headers as Headers;
    expect(callHeaders.get("x-request-id")).toBeDefined();
  });

  it("normalizes 400 HTTP errors into ValidationError", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: { message: "Invalid field" } }),
    });

    const client = new ApiClient({ baseUrl: "http://localhost:4000" });
    await expect(client.request("/test")).rejects.toThrow(ValidationError);
  });

  it("normalizes 404 HTTP errors into NotFoundError", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: { message: "Resource missing" } }),
    });

    const client = new ApiClient({ baseUrl: "http://localhost:4000" });
    await expect(client.request("/missing")).rejects.toThrow(NotFoundError);
  });
});
