import { describe, expect, it, vi } from 'vitest';
import {
  hasPermission,
  hasWorkspaceRole,
  verifyWorkspaceAccess,
  createAuthToken,
  verifyAuthToken,
  requireAuth,
  ROLE_PERMISSIONS,
} from './index.js';

describe('@agentic/auth RBAC Matrix & Tenancy', () => {
  it('correctly grants OWNER all permissions', () => {
    expect(hasPermission('OWNER', 'workspace.manage')).toBe(true);
    expect(hasPermission('OWNER', 'automation.delete')).toBe(true);
    expect(hasPermission('OWNER', 'credential.manage')).toBe(true);
    expect(hasPermission('OWNER', 'approval.decide')).toBe(true);
  });

  it('restricts VIEWER to read-only permissions', () => {
    expect(hasPermission('VIEWER', 'automation.read')).toBe(true);
    expect(hasPermission('VIEWER', 'run.view')).toBe(true);
    expect(hasPermission('VIEWER', 'automation.create')).toBe(false);
    expect(hasPermission('VIEWER', 'approval.decide')).toBe(false);
    expect(hasPermission('VIEWER', 'credential.manage')).toBe(false);
  });

  it('allows APPROVER to decide approvals but not edit automations', () => {
    expect(hasPermission('APPROVER', 'approval.decide')).toBe(true);
    expect(hasPermission('APPROVER', 'automation.edit')).toBe(false);
  });

  it('allows OPERATOR to start/retry runs but not modify automations', () => {
    expect(hasPermission('OPERATOR', 'run.start')).toBe(true);
    expect(hasPermission('OPERATOR', 'run.retry')).toBe(true);
    expect(hasPermission('OPERATOR', 'automation.create')).toBe(false);
  });

  it('correctly compares hierarchical workspace roles', () => {
    expect(hasWorkspaceRole('OWNER', 'ADMIN')).toBe(true);
    expect(hasWorkspaceRole('ADMIN', 'AUTOMATION_DEVELOPER')).toBe(true);
    expect(hasWorkspaceRole('VIEWER', 'OPERATOR')).toBe(false);
  });

  describe('verifyWorkspaceAccess', () => {
    it('throws ForbiddenError when user is not a member of the workspace', async () => {
      const mockPrisma = {
        membership: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      } as any;

      await expect(
        verifyWorkspaceAccess(mockPrisma, 'usr_stranger', 'ws_target', 'automation.read'),
      ).rejects.toThrow(/User 'usr_stranger' is not a member of workspace 'ws_target'/);
    });

    it('throws ForbiddenError when member role lacks the required permission', async () => {
      const mockPrisma = {
        membership: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'mem_1',
            role: 'VIEWER',
            user: { id: 'usr_viewer', email: 'viewer@example.com', name: 'Viewer User' },
            workspace: { id: 'ws_target', name: 'Target Workspace', slug: 'target' },
          }),
        },
      } as any;

      await expect(
        verifyWorkspaceAccess(mockPrisma, 'usr_viewer', 'ws_target', 'automation.create'),
      ).rejects.toThrow(/Role 'VIEWER' lacks required permission 'automation.create'/);
    });

    it('returns verified tenancy context when membership and permission are valid', async () => {
      const mockPrisma = {
        membership: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'mem_1',
            role: 'AUTOMATION_DEVELOPER',
            user: { id: 'usr_dev', email: 'dev@example.com', name: 'Dev User' },
            workspace: { id: 'ws_target', name: 'Target Workspace', slug: 'target' },
          }),
        },
      } as any;

      const context = await verifyWorkspaceAccess(
        mockPrisma,
        'usr_dev',
        'ws_target',
        'automation.create',
      );

      expect(context.userId).toBe('usr_dev');
      expect(context.workspaceId).toBe('ws_target');
      expect(context.role).toBe('AUTOMATION_DEVELOPER');
      expect(context.permissions.has('automation.create')).toBe(true);
      expect(context.permissions.has('automation.delete')).toBe(true);
    });
  });

  describe('JWT Auth Tokens', () => {
    const testSecret = 'super-secret-test-key-must-be-long-enough-32-chars';

    it('signs and verifies valid JWT auth tokens', async () => {
      const token = await createAuthToken(
        { userId: 'usr_123', email: 'alice@example.com' },
        testSecret,
        '1h',
      );

      const payload = await verifyAuthToken(token, testSecret);
      expect(payload.userId).toBe('usr_123');
      expect(payload.email).toBe('alice@example.com');
    });

    it('rejects tampered or mismatched secrets', async () => {
      const token = await createAuthToken(
        { userId: 'usr_123', email: 'alice@example.com' },
        testSecret,
        '1h',
      );

      await expect(
        verifyAuthToken(token, 'different-secret-key-32-chars-long-abc'),
      ).rejects.toThrow(/signature verification failed|Invalid authentication token/i);
    });
  });

  describe('requireAuth guard', () => {
    it('throws UnauthorizedError when context is null or undefined', () => {
      expect(() => requireAuth(null)).toThrow(/Authentication required/);
      expect(() => requireAuth(undefined)).toThrow(/Authentication required/);
    });

    it('passes when context is present', () => {
      expect(() => requireAuth({ userId: 'usr_1' })).not.toThrow();
    });
  });
});
