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

  describe('Automations, Canonical Versioning & Activation Engine', () => {
    it('creates an automation, updates definition with diff, enforces safety checks on publish, and supports rollback', async () => {
      const app = await buildApp();
      const userToken = await createAuthToken(
        { userId: 'usr_dev_architect', email: 'architect@example.com' },
        config.JWT_SECRET,
      );

      // 1. Create a workspace
      const wsRes = await app.inject({
        method: 'POST',
        url: '/v1/workspaces',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { name: 'Automation Studio' },
      });
      const workspaceId = wsRes.json().workspace.id;

      // 2. Create Automation (Draft)
      const autoRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/automations`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          name: 'Invoice Processing Pipeline',
          description: 'Extracts invoices and coordinates approval',
        },
      });

      expect(autoRes.statusCode).toBe(201);
      const autoBody = autoRes.json();
      const automationId = autoBody.automation.id;
      expect(autoBody.automation.status).toBe('DRAFT');
      expect(autoBody.automation.currentVersion).toBe(1);

      // 3. Update definition to include an Agent and Human Approval gate
      const updatedAst = {
        schemaVersion: '1.0.0',
        name: 'Invoice Processing Pipeline',
        description: 'Extracts invoices and coordinates approval',
        triggers: [
          {
            id: 'trig_email',
            name: 'Invoice Email Received',
            category: 'TRIGGER',
            config: { type: 'email' },
          },
        ],
        nodes: [
          {
            id: 'node_agent_extract',
            name: 'Document Intelligence Agent',
            category: 'AGENT',
            config: { model: 'gemini-1.5-pro' },
            timeoutMs: 30000,
          },
          {
            id: 'node_approval_cfo',
            name: 'CFO Invoice Approval',
            category: 'HUMAN_APPROVAL',
            config: { approverRole: 'OWNER' },
          },
          {
            id: 'node_erp_post',
            name: 'Post to Accounting ERP',
            category: 'ACTION',
            config: { service: 'erp_connector' },
          },
        ],
        edges: [
          {
            id: 'e1',
            sourceNodeId: 'trig_email',
            targetNodeId: 'node_agent_extract',
          },
          {
            id: 'e2',
            sourceNodeId: 'node_agent_extract',
            targetNodeId: 'node_approval_cfo',
          },
          {
            id: 'e3',
            sourceNodeId: 'node_approval_cfo',
            targetNodeId: 'node_erp_post',
          },
        ],
        variables: {},
        limits: {
          maxExecutionTimeMs: 86400000,
          maxSteps: 50,
          maxCostUsd: 10,
        },
      };

      const putRes = await app.inject({
        method: 'PUT',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/definition`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: updatedAst,
      });

      expect(putRes.statusCode).toBe(200);
      const putBody = putRes.json();
      expect(putBody.version.versionNumber).toBe(2);
      expect(putBody.version.validation.valid).toBe(true);
      expect(putBody.version.diff.hasChanges).toBe(true);

      // 4. Publish Version 2 to ACTIVE
      const publishRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/publish`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(publishRes.statusCode).toBe(200);
      const publishBody = publishRes.json();
      expect(publishBody.automation.status).toBe('ACTIVE');
      expect(publishBody.automation.activeVersion.versionNumber).toBe(2);

      // 5. Rollback to Version 1
      const rollbackRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/rollback`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          targetVersionNumber: 1,
          reason: 'Emergency rollback to initial baseline',
        },
      });

      expect(rollbackRes.statusCode).toBe(200);
      const rollbackBody = rollbackRes.json();
      expect(rollbackBody.activeVersion.versionNumber).toBe(3);
      expect(rollbackBody.activeVersion.changeSummary).toContain('Rolled back to version 1');

      // 6. View all immutable historical versions
      const versionsRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/versions`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(versionsRes.statusCode).toBe(200);
      const versionsBody = versionsRes.json();
      expect(versionsBody.versions.length).toBe(3);
      // v3 is active, v2 and v1 are historical
      expect(versionsBody.versions[0].versionNumber).toBe(3);
      expect(versionsBody.versions[0].isActive).toBe(true);

      await app.close();
    });
  });

  describe('Durable Execution Runtime, Timeline & Human-in-the-Loop Signals', () => {
    it('executes a workflow with agent reasoning, pauses at approval, resumes on signal, and records full timeline', async () => {
      const app = await buildApp();
      const userToken = await createAuthToken(
        { userId: 'usr_ops_lead', email: 'ops@example.com' },
        config.JWT_SECRET,
      );

      // 1. Create workspace
      const wsRes = await app.inject({
        method: 'POST',
        url: '/v1/workspaces',
        headers: { authorization: `Bearer ${userToken}` },
        payload: { name: 'Operations Center' },
      });
      const workspaceId = wsRes.json().workspace.id;

      // 2. Create Automation
      const autoRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/automations`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: { name: 'Automated Purchase Approval' },
      });
      const automationId = autoRes.json().automation.id;

      // 3. Define multi-step workflow with Human Approval
      const pipelineAst = {
        schemaVersion: '1.0.0',
        name: 'Automated Purchase Approval',
        description: 'Verifies purchase request, obtains approval, and posts purchase',
        triggers: [
          {
            id: 'trig_po',
            name: 'PO Webhook Trigger',
            category: 'TRIGGER',
            config: { type: 'webhook' },
          },
        ],
        nodes: [
          {
            id: 'node_risk_check',
            name: 'Risk Evaluation Agent',
            category: 'AGENT',
            config: { model: 'gemini-1.5-flash' },
            timeoutMs: 15000,
          },
          {
            id: 'node_approval_lead',
            name: 'Team Lead Approval',
            category: 'HUMAN_APPROVAL',
            config: { approverRole: 'OWNER' },
          },
          {
            id: 'node_issue_po',
            name: 'Issue Purchase Order',
            category: 'ACTION',
            config: { action: 'issue_order' },
          },
        ],
        edges: [
          {
            id: 'e1',
            sourceNodeId: 'trig_po',
            targetNodeId: 'node_risk_check',
          },
          {
            id: 'e2',
            sourceNodeId: 'node_risk_check',
            targetNodeId: 'node_approval_lead',
          },
          {
            id: 'e3',
            sourceNodeId: 'node_approval_lead',
            targetNodeId: 'node_issue_po',
          },
        ],
        variables: {},
        limits: {
          maxExecutionTimeMs: 86400000,
          maxSteps: 50,
          maxCostUsd: 10,
        },
      };

      await app.inject({
        method: 'PUT',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/definition`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: pipelineAst,
      });

      await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/publish`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      // 4. Trigger Run Execution
      const triggerRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/automations/${automationId}/runs`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          triggerType: 'WEBHOOK',
          triggerPayload: { poId: 'PO-2026-001', vendor: 'Global Cloud Services', amount: 15000 },
        },
      });

      expect(triggerRes.statusCode).toBe(201);
      const runData = triggerRes.json().run;
      const runId = runData.id;
      // Workflow must pause at WAITING_FOR_APPROVAL
      expect(runData.status).toBe('WAITING_FOR_APPROVAL');
      expect(runData.pendingApprovalId).toBeDefined();

      // 5. Query Run Details & Execution Timeline
      const detailRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}/runs/${runId}`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(detailRes.statusCode).toBe(200);
      const detailBody = detailRes.json().run;
      expect(detailBody.status).toBe('WAITING_FOR_APPROVAL');
      expect(detailBody.timeline.length).toBeGreaterThanOrEqual(2);
      expect(detailBody.approvals.length).toBe(1);
      expect(detailBody.approvals[0].status).toBe('PENDING');

      // 6. Approver submits APPROVAL Signal
      const signalRes = await app.inject({
        method: 'POST',
        url: `/v1/workspaces/${workspaceId}/runs/${runId}/signals/approve`,
        headers: { authorization: `Bearer ${userToken}` },
        payload: {
          decision: 'APPROVE',
          comments: 'Approved purchase budget for Q3',
        },
      });

      expect(signalRes.statusCode).toBe(200);
      const signalBody = signalRes.json();
      expect(signalBody.status).toBe('COMPLETED');
      expect(signalBody.decision).toBe('APPROVE');

      // 7. Verify Completed State & Timeline after resumption
      const finalRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}/runs/${runId}`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      const finalBody = finalRes.json().run;
      expect(finalBody.status).toBe('COMPLETED');
      expect(finalBody.timeline.some((s: any) => s.nodeId === 'node_issue_po' && s.status === 'COMPLETED')).toBe(true);

      // 8. List Runs
      const listRes = await app.inject({
        method: 'GET',
        url: `/v1/workspaces/${workspaceId}/runs`,
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(listRes.statusCode).toBe(200);
      const listBody = listRes.json();
      expect(listBody.runs.length).toBeGreaterThanOrEqual(1);
      expect(listBody.runs[0].status).toBe('COMPLETED');

      await app.close();
    });
  });
});
