import { describe, expect, it } from "vitest";
import {
  ValidationError,
  NotFoundError,
  formatErrorResponse,
  generateId,
} from "./index.js";

describe("@agentic/shared", () => {
  it("formats AppErrors correctly with request IDs", () => {
    const err = new ValidationError("Invalid email format", { field: "email" });
    const { statusCode, payload } = formatErrorResponse(
      err,
      "req-abc-123",
      false,
    );

    expect(statusCode).toBe(400);
    expect(payload.error.code).toBe("VALIDATION_ERROR");
    expect(payload.error.message).toBe("Invalid email format");
    expect(payload.error.requestId).toBe("req-abc-123");
    expect(payload.error.details).toEqual({ field: "email" });
  });

  it("redacts stack traces in production mode", () => {
    const err = new NotFoundError("Workspace not found");
    const { payload } = formatErrorResponse(err, "req-abc-123", true);

    expect(payload.error.stack).toBeUndefined();
  });

  it("generates prefixed IDs correctly", () => {
    const id = generateId("ws");
    expect(id.startsWith("ws_")).toBe(true);
    expect(id.length).toBeGreaterThan(10);
  });
});
