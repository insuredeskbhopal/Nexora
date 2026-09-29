import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { createAuthToken } from '@agentic/auth';
import { config } from '@agentic/config';

describe('Fastify API Application', () => {
  it('GET /health returns 200 with structured JSON and request ID', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api');
    expect(typeof body.uptime).toBe('number');
    expect(res.headers['x-request-id']).toBeDefined();

    await app.close();
  });

  it('GET /non-existent returns 404 with structured error envelope', async () => {
    const app = await buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/non-existent-route',
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('NOT_FOUND');
    expect(res.headers['x-request-id']).toBeDefined();

    await app.close();
  });

  describe('Workspaces & Multi-Tenant RBAC Enforcement', () => {
    it('rejects unauthenticated requests to /v1/workspaces with 401', async () => {
      const app = await buildApp();
      const res = await app.inject({
        method: 'GET',
        url: '/v1/workspaces',
      });

      expect(res.statusCode).toBe(401);
      const body = res.json();
      expect(body.error.code).toBe('UNAUTHORIZED');

      await app.close();
    });

    it('creates workspace, assigns OWNER role, and enforces server-side tenancy boundary', async () => {
      const app = await buildApp();
      const userToken = await createAuthToken(
        { userId: 'usr_test_owner', email: 'owner@example.com' },
        config.JWT_SECRET,
      );

      // 1. Create a new workspace
      const createRes = await app.inject({
        method: 'POST',
        url: '/v1/workspaces',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
        payload: {
          name: 'Acme Enterprise',
          description: 'Production workspace for automated workflows',
        },
      });

      expect(createRes.statusCode).toBe(201);
      const createdBody = createRes.json();
      const workspaceId = createdBody.workspace.id;
      expect(workspaceId).toBeDefined();
      expect(createdBody.workspace.role).toBe('OWNER');

      // 2. Fetch workspace details as owner (allowed)
      const getRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}`,
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(getRes.statusCode).toBe(200);
      const getBody = getRes.json();
      expect(getBody.workspace.name).toBe('Acme Enterprise');
      expect(getBody.workspace.currentUserRole).toBe('OWNER');

      // 3. Attempt access from an unauthorized stranger (must fail with 403)
      const strangerToken = await createAuthToken(
        { userId: 'usr_stranger', email: 'stranger@example.com' },
        config.JWT_SECRET,
      );

      const strangerRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}`,
        headers: {
          authorization: `Bearer ${strangerToken}`,
        },
      });

      expect(strangerRes.statusCode).toBe(403);
      expect(strangerRes.json().error.code).toBe('FORBIDDEN');

      // 4. Invite a new member as VIEWER
      const inviteRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/members`,
        headers: {
          authorization: `Bearer ${userToken}`,
        },
        payload: {
          email: 'colleague@example.com',
          role: 'VIEWER',
        },
      });

      expect(inviteRes.statusCode).toBe(201);
      const inviteBody = inviteRes.json();
      expect(inviteBody.member.email).toBe('colleague@example.com');
      expect(inviteBody.member.role).toBe('VIEWER');

      // 5. Query immutable audit logs
      const auditRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}/audit-logs`,
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(auditRes.statusCode).toBe(200);
      const auditBody = auditRes.json();
      expect(auditBody.auditLogs.length).toBeGreaterThanOrEqual(1);

      await app.close();
    });
  });
});
