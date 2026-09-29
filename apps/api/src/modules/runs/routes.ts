import type { FastifyPluginAsync } from 'fastify';
import { prisma, type Prisma } from '@agentic/db';
import {
  startRunSchema,
  approvalDecisionSchema,
  queryRunsSchema,
  type WorkflowDefinition,
} from '@agentic/schemas';
import { ValidationError, NotFoundError, ForbiddenError, generateUUID } from '@agentic/shared';
import { WorkflowExecutor } from '@agentic/workflow-engine';
import { recordAuditLog } from '../audit/auditService.js';

export const runRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /v1/workspaces/:workspaceId/automations/:id/runs
   * Trigger a new execution run.
   */
  fastify.post('/v1/workspaces/:workspaceId/automations/:id/runs', {
    preHandler: [fastify.enforceTenancy('run.start')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id: automationId } = request.params as { id: string };

      const parsed = startRunSchema.safeParse({
        ...((request.body as Record<string, unknown>) || {}),
        automationId,
      });
      if (!parsed.success) {
        throw new ValidationError('Invalid run trigger parameters', parsed.error.format());
      }

      const { triggerType, triggerPayload, correlationId } = parsed.data;

      // Retrieve automation and its active version
      const automation = await prisma.automation.findFirst({
        where: { id: automationId, workspaceId: tenancy.workspaceId },
        include: {
          activeVersion: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!automation) {
        throw new NotFoundError(`Automation '${automationId}' not found in workspace`);
      }

      // Use active version, or fallback to latest draft version in non-production
      const executableVersion = automation.activeVersion ?? automation.versions[0];
      if (!executableVersion) {
        throw new ValidationError('Automation has no executable workflow version');
      }

      // Create Run Record
      const run = await prisma.run.create({
        data: {
          workspaceId: tenancy.workspaceId,
          automationId: automation.id,
          automationVersionId: executableVersion.id,
          status: 'CREATED',
          triggerType,
          triggerInput: triggerPayload as Prisma.InputJsonValue,
          correlationId: correlationId || generateUUID(),
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'run.started',
        targetType: 'run',
        targetId: run.id,
        afterState: {
          triggerType,
          versionNumber: executableVersion.versionNumber,
        },
        ipAddress: request.ip,
        correlationId: run.correlationId,
      });

      // Execute Workflow asynchronously or step synchronously to initial checkpoint
      const result = await WorkflowExecutor.executeRun(run.id, triggerPayload);

      return reply.status(201).send({
        run: {
          id: run.id,
          automationId: run.automationId,
          versionNumber: executableVersion.versionNumber,
          status: result.status,
          completedNodes: result.completedNodes,
          pendingApprovalId: result.pendingApprovalId,
          error: result.error,
          createdAt: run.createdAt.toISOString(),
        },
      });
    },
  });

  /**
   * GET /v1/workspaces/:workspaceId/runs
   * List runs with status, duration, and error filters.
   */
  fastify.get('/v1/workspaces/:workspaceId/runs', {
    preHandler: [fastify.enforceTenancy('run.view')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parsed = queryRunsSchema.safeParse(request.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', parsed.error.format());
      }

      const { automationId, status, limit, cursor } = parsed.data;

      const runs = await prisma.run.findMany({
        where: {
          workspaceId: tenancy.workspaceId,
          ...(automationId ? { automationId } : {}),
          ...(status ? { status: status as any } : {}),
        },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          automation: {
            select: { name: true },
          },
          version: {
            select: { versionNumber: true },
          },
          _count: {
            select: { steps: true },
          },
        },
      });

      return reply.send({
        runs: runs.map((r) => ({
          id: r.id,
          automationId: r.automationId,
          automationName: r.automation.name,
          versionNumber: r.version.versionNumber,
          status: r.status,
          triggerType: r.triggerType,
          stepsCount: r._count.steps,
          startedAt: r.startedAt?.toISOString() || null,
          completedAt: r.completedAt?.toISOString() || null,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    },
  });

  /**
   * GET /v1/workspaces/:workspaceId/runs/:id
   * Get complete execution timeline with steps, input/output data, and errors.
   */
  fastify.get('/v1/workspaces/:workspaceId/runs/:id', {
    preHandler: [fastify.enforceTenancy('run.view')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const run = await prisma.run.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
        include: {
          automation: {
            select: { name: true },
          },
          version: {
            select: { versionNumber: true },
          },
          steps: {
            orderBy: { startedAt: 'asc' },
          },
          approvals: {
            include: {
              decisions: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          },
        },
      });

      if (!run) {
        throw new NotFoundError(`Run '${id}' not found`);
      }

      return reply.send({
        run: {
          id: run.id,
          automationId: run.automationId,
          automationName: run.automation.name,
          versionNumber: run.version.versionNumber,
          status: run.status,
          triggerType: run.triggerType,
          triggerInput: run.triggerInput,
          output: run.output,
          error: run.error,
          timeline: run.steps.map((s) => ({
            id: s.id,
            nodeId: s.nodeId,
            nodeName: s.nodeName,
            nodeType: s.nodeType,
            status: s.status,
            input: s.input,
            output: s.output,
            error: s.error,
            startedAt: s.startedAt?.toISOString() || null,
            completedAt: s.completedAt?.toISOString() || null,
          })),
          approvals: run.approvals.map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            riskLevel: a.riskLevel,
            contextData: a.contextData,
            decisions: a.decisions.map((d) => ({
              decision: d.decision,
              comment: d.comment,
              decidedAt: d.decidedAt.toISOString(),
              user: d.user,
            })),
          })),
          startedAt: run.startedAt?.toISOString() || null,
          completedAt: run.completedAt?.toISOString() || null,
          createdAt: run.createdAt.toISOString(),
        },
      });
    },
  });

  /**
   * POST /v1/workspaces/:workspaceId/runs/:id/signals/approve
   * Submit Human-in-the-Loop approval decision.
   */
  fastify.post('/v1/workspaces/:workspaceId/runs/:id/signals/approve', {
    preHandler: [fastify.enforceTenancy('approval.decide')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id: runId } = request.params as { id: string };

      const parsed = approvalDecisionSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid approval decision data', parsed.error.format());
      }

      const { decision, comments } = parsed.data;

      // Find pending approval for this run
      const pendingApproval = await prisma.approval.findFirst({
        where: {
          runId,
          workspaceId: tenancy.workspaceId,
          status: 'PENDING',
        },
      });

      if (!pendingApproval) {
        throw new NotFoundError(`No pending approval found for run '${runId}'`);
      }

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: `approval.${decision.toLowerCase()}`,
        targetType: 'approval',
        targetId: pendingApproval.id,
        afterState: { decision, comments },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      // Signal Approval to Workflow Engine and resume DAG execution
      const result = await WorkflowExecutor.signalApproval(
        runId,
        pendingApproval.id,
        decision,
        tenancy.userId,
        comments,
      );

      return reply.send({
        runId,
        decision,
        status: result.status,
        completedNodes: result.completedNodes,
      });
    },
  });

  /**
   * POST /v1/workspaces/:workspaceId/runs/:id/cancel
   * Cancel an active or waiting run.
   */
  fastify.post('/v1/workspaces/:workspaceId/runs/:id/cancel', {
    preHandler: [fastify.enforceTenancy('run.cancel')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id: runId } = request.params as { id: string };

      const run = await prisma.run.findFirst({
        where: { id: runId, workspaceId: tenancy.workspaceId },
      });

      if (!run) {
        throw new NotFoundError(`Run '${runId}' not found`);
      }

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(run.status)) {
        throw new ValidationError(`Run '${runId}' is already in terminal state '${run.status}'`);
      }

      await prisma.run.update({
        where: { id: runId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'run.cancelled',
        targetType: 'run',
        targetId: runId,
        afterState: { status: 'CANCELLED' },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.send({
        runId,
        status: 'CANCELLED',
      });
    },
  });
};
