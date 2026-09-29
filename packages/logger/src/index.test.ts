import { describe, expect, it } from "vitest";
import { createLogger, DEFAULT_REDACT_KEYS } from "./index.js";

describe("@agentic/logger", () => {
  it("creates a logger instance with configured service and environment", () => {
    const logger = createLogger({
      service: "test-service",
      environment: "test",
    });
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
  });

  it("includes default sensitive keys in redaction list", () => {
    expect(DEFAULT_REDACT_KEYS).toContain("password");
    expect(DEFAULT_REDACT_KEYS).toContain("token");
    expect(DEFAULT_REDACT_KEYS).toContain("authorization");
    expect(DEFAULT_REDACT_KEYS).toContain("apiKey");
  });

  it("can create a child logger with correlation attributes", () => {
    const logger = createLogger({ service: "test-service" });
    const child = logger.child({ requestId: "req-123", workspaceId: "ws-456" });
    expect(child).toBeDefined();
    expect(typeof child.info).toBe("function");
  });
});
