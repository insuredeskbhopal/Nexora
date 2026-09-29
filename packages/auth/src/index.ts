import { ForbiddenError, UnauthorizedError } from "@agentic/shared";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  activeWorkspaceId: string;
  expiresAt: Date;
}

/**
 * Context passed into all tenant-scoped API handlers and workflow triggers.
 */
export interface AuthContext {
  user: User;
  workspace: Workspace;
  membership: Membership;
}

/**
 * Enforces that all database operations on domain entities are scoped to a workspaceId.
 */
export interface WorkspaceScopedQuery {
  workspaceId: string;
}

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

/**
 * Verifies if the user's role satisfies the minimum required workspace role.
 */
export function hasWorkspaceRole(
  userRole: WorkspaceRole,
  requiredRole: WorkspaceRole,
): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * Guard that throws ForbiddenError if current membership lacks required role.
 */
export function requireWorkspaceRole(
  membership: Membership,
  requiredRole: WorkspaceRole,
): void {
  if (!hasWorkspaceRole(membership.role, requiredRole)) {
    throw new ForbiddenError(
      `Insufficient permissions. Required role: ${requiredRole}, current role: ${membership.role}`,
    );
  }
}

/**
 * Guard that verifies authentication context exists.
 */
export function requireAuth(
  context?: AuthContext | null,
): asserts context is AuthContext {
  if (!context) {
    throw new UnauthorizedError("Authentication required");
  }
}
