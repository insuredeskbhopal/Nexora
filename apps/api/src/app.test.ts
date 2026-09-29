import { describe, expect, it } from "vitest";
import { buildApp } from "./app.js";

describe("Fastify API Application", () => {
  it("GET /health returns 200 with structured JSON and request ID", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("api");
    expect(typeof body.uptime).toBe("number");
    expect(res.headers["x-request-id"]).toBeDefined();

    await app.close();
  });

  it("GET /non-existent returns 404 with structured error envelope", async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: "GET",
      url: "/non-existent-route",
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("NOT_FOUND");
    expect(res.headers["x-request-id"]).toBeDefined();

    await app.close();
  });
});
