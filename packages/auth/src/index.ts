import { ForbiddenError, UnauthorizedError } from '@agentic/shared';
import type { PrismaClient, WorkspaceRole as PrismaWorkspaceRole } from '@agentic/db';
import { SignJWT, jwtVerify } from 'jose';

// Re-export role enum matching Prisma domain model
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'AUTOMATION_DEVELOPER' | 'OPERATOR' | 'APPROVER' | 'VIEWER';

export type WorkspacePermission =
  // Workspaces
  | 'workspace.manage'
  | 'workspace.read'
  | 'workspace.member.manage'
  // Automations
  | 'automation.create'
  | 'automation.edit'
  | 'automation.publish'
  | 'automation.pause'
  | 'automation.delete'
  | 'automation.read'
  // Runs
  | 'run.view'
  | 'run.start'
  | 'run.retry'
  | 'run.cancel'
  // Connectors & Credentials
  | 'connector.create'
  | 'connector.use'
  | 'connector.delete'
  | 'credential.manage'
  // Agents
  | 'agent.create'
  | 'agent.edit'
  | 'agent.delete'
  | 'agent.use'
  // Approvals
  | 'approval.decide'
  | 'approval.view'
  // Policies & Governance
  | 'policy.manage'
  | 'policy.view'
  // Auditing & Billing
  | 'audit.view'
  | 'billing.view';

/**
 * Granular Role-to-Permissions Matrix
 * Dictates strict zero-trust server-side access controls.
 */
export const ROLE_PERMISSIONS: Record<WorkspaceRole, readonly WorkspacePermission[]> = {
  OWNER: [
    'workspace.manage',
    'workspace.read',
    'workspace.member.manage',
    'automation.create',
    'automation.edit',
    'automation.publish',
    'automation.pause',
    'automation.delete',
    'automation.read',
    'run.view',
    'run.start',
    'run.retry',
    'run.cancel',
    'connector.create',
    'connector.use',
    'connector.delete',
    'credential.manage',
    'agent.create',
    'agent.edit',
    'agent.delete',
    'agent.use',
    'approval.decide',
    'approval.view',
    'policy.manage',
    'policy.view',
    'audit.view',
    'billing.view',
  ],
  ADMIN: [
    'workspace.read',
    'workspace.member.manage',
    'automation.create',
    'automation.edit',
    'automation.publish',
    'automation.pause',
    'automation.delete',
    'automation.read',
    'run.view',
    'run.start',
    'run.retry',
    'run.cancel',
    'connector.create',
    'connector.use',
    'connector.delete',
    'credential.manage',
    'agent.create',
    'agent.edit',
    'agent.delete',
    'agent.use',
    'approval.decide',
    'approval.view',
    'policy.manage',
    'policy.view',
    'audit.view',
    'billing.view',
  ],
  AUTOMATION_DEVELOPER: [
    'workspace.read',
    'automation.create',
    'automation.edit',
    'automation.publish',
    'automation.pause',
    'automation.delete',
    'automation.read',
    'run.view',
    'run.start',
    'run.retry',
    'run.cancel',
    'connector.create',
    'connector.use',
    'credential.manage',
    'agent.create',
    'agent.edit',
    'agent.use',
    'approval.view',
    'policy.view',
    'audit.view',
  ],
  OPERATOR: [
    'workspace.read',
    'automation.read',
    'run.view',
    'run.start',
    'run.retry',
    'run.cancel',
    'connector.use',
    'agent.use',
    'approval.view',
    'policy.view',
    'audit.view',
  ],
  APPROVER: [
    'workspace.read',
    'automation.read',
    'run.view',
    'approval.decide',
    'approval.view',
    'policy.view',
  ],
  VIEWER: [
    'workspace.read',
    'automation.read',
    'run.view',
    'approval.view',
    'policy.view',
  ],
} as const;

/**
 * Checks if a given role possesses the specified permission.
 */
export function hasPermission(role: WorkspaceRole, permission: WorkspacePermission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(permission) : false;
}

/**
 * Checks if the role meets or exceeds a baseline role in the hierarchy.
 */
const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  APPROVER: 2,
  OPERATOR: 3,
  AUTOMATION_DEVELOPER: 4,
  ADMIN: 5,
  OWNER: 6,
};

export function hasWorkspaceRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * Verified Tenancy Context returned after server-side authentication and membership validation.
 */
export interface VerifiedTenancyContext {
  userId: string;
  userEmail: string;
  userName: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: WorkspaceRole;
  permissions: ReadonlySet<WorkspacePermission>;
}

/**
 * STRICT SERVER-SIDE TENANCY VALIDATION
 * Section 5: All tenant-owned entities must contain workspace_id or an equivalent verified tenancy boundary.
 * Never trust a workspace_id coming directly from the client without validating membership server-side.
 */
export async function verifyWorkspaceAccess(
  prismaClient: PrismaClient,
  userId: string,
  workspaceId: string,
  requiredPermission?: WorkspacePermission,
): Promise<VerifiedTenancyContext> {
  if (!userId || !workspaceId) {
    throw new UnauthorizedError('Both userId and workspaceId are required for tenancy verification');
  }

  const membership = await prismaClient.membership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!membership) {
    throw new ForbiddenError(`Access denied: User '${userId}' is not a member of workspace '${workspaceId}'.`);
  }

  const role = membership.role as WorkspaceRole;
  const permissionsList = ROLE_PERMISSIONS[role] ?? [];
  const permissionsSet = new Set<WorkspacePermission>(permissionsList);

  if (requiredPermission && !permissionsSet.has(requiredPermission)) {
    throw new ForbiddenError(
      `Insufficient permissions: Role '${role}' lacks required permission '${requiredPermission}'.`,
    );
  }

  return {
    userId: membership.user.id,
    userEmail: membership.user.email,
    userName: membership.user.name,
    workspaceId: membership.workspace.id,
    workspaceName: membership.workspace.name,
    workspaceSlug: membership.workspace.slug,
    role,
    permissions: permissionsSet,
  };
}

/**
 * JWT Authentication Token Generator
 */
export async function createAuthToken(
  payload: { userId: string; email: string },
  secret: string,
  expiresIn = '7d',
): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  return new SignJWT({ sub: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretBytes);
}

/**
 * JWT Authentication Token Verifier
 */
export async function verifyAuthToken(
  token: string,
  secret: string,
): Promise<{ userId: string; email: string }> {
  try {
    const secretBytes = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretBytes, {
      algorithms: ['HS256'],
    });

    if (!payload.sub || typeof payload.email !== 'string') {
      throw new UnauthorizedError('Malformed authentication token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError(`Invalid authentication token: ${(error as Error).message}`);
  }
}

/**
 * Guard that verifies authentication context exists.
 */
export function requireAuth<T>(context?: T | null): asserts context is T {
  if (!context) {
    throw new UnauthorizedError('Authentication required');
  }
}
