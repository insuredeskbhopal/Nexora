import { describe, expect, it } from "vitest";
import {
  hasWorkspaceRole,
  requireWorkspaceRole,
  requireAuth,
} from "./index.js";

describe("@agentic/auth", () => {
  it("correctly compares hierarchical workspace roles", () => {
    expect(hasWorkspaceRole("owner", "admin")).toBe(true);
    expect(hasWorkspaceRole("admin", "member")).toBe(true);
    expect(hasWorkspaceRole("member", "admin")).toBe(false);
    expect(hasWorkspaceRole("viewer", "member")).toBe(false);
  });

  it("throws ForbiddenError when role requirement is not met", () => {
    const membership = {
      id: "mem-1",
      userId: "usr-1",
      workspaceId: "ws-1",
      role: "member" as const,
      createdAt: new Date(),
    };

    expect(() => requireWorkspaceRole(membership, "admin")).toThrow(
      /Insufficient permissions/,
    );
  });

  it("throws UnauthorizedError when auth context is missing", () => {
    expect(() => requireAuth(null)).toThrow(/Authentication required/);
  });
});
