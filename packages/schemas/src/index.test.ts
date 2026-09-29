import { describe, expect, it } from "vitest";
import { healthResponseSchema, readyResponseSchema } from "./index.js";

describe("@agentic/schemas", () => {
  it("validates a valid health response", () => {
    const valid = {
      status: "ok",
      service: "api",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
      uptime: 12.34,
    };
    const parsed = healthResponseSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it("validates a valid readiness response with dependencies", () => {
    const valid = {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
      dependencies: {
        database: { status: "up", latencyMs: 4 },
        redis: { status: "up", latencyMs: 1 },
      },
    };
    const parsed = readyResponseSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
