import type { FastifyPluginAsync } from 'fastify';
import { prisma, type Prisma } from '@agentic/db';
import {
  createAutomationSchema,
  workflowDefinitionSchema,
  rollbackSchema,
  type WorkflowDefinition,
} from '@agentic/schemas';
import { ValidationError, NotFoundError, ForbiddenError } from '@agentic/shared';
import {
  validateWorkflow,
  analyzeWorkflowRisk,
  computeWorkflowDiff,
} from '@agentic/workflow-engine';
import { recordAuditLog } from '../audit/auditService.js';

export const automationRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /v1/workspaces/:workspaceId/automations
   * Create an automation with initial Draft version 1.
   */
  fastify.post('/v1/workspaces/:workspaceId/automations', {
    preHandler: [fastify.enforceTenancy('automation.create')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parsed = createAutomationSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid automation data', parsed.error.format());
      }

      const { name, description } = parsed.data;

      // Initial baseline draft workflow definition
      const initialDefinition: WorkflowDefinition = {
        schemaVersion: '1.0.0',
        name,
        description: description || '',
        triggers: [
          {
            id: 'node_trigger_init',
            name: 'Manual / API Trigger',
            category: 'TRIGGER',
            config: { type: 'manual' },
          },
        ],
        nodes: [
          {
            id: 'node_action_init',
            name: 'Initial Step',
            category: 'ACTION',
            config: { description: 'Configure action parameters' },
          },
        ],
        edges: [
          {
            id: 'edge_init_1',
            sourceNodeId: 'node_trigger_init',
            targetNodeId: 'node_action_init',
          },
        ],
        variables: {},
        limits: {
          maxExecutionTimeMs: 86400000,
          maxSteps: 100,
          maxCostUsd: 25.0,
        },
      };

      const automation = await prisma.automation.create({
        data: {
          workspaceId: tenancy.workspaceId,
          name,
          description: description ?? null,
          status: 'DRAFT',
          versions: {
            create: {
              versionNumber: 1,
              definition: initialDefinition as unknown as Prisma.InputJsonValue,
              changeSummary: 'Initial automation draft created',
              authorId: tenancy.userId,
            },
          },
        },
        include: {
          versions: true,
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'automation.created',
        targetType: 'automation',
        targetId: automation.id,
        afterState: { name: automation.name, status: automation.status },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.status(201).send({
        automation: {
          id: automation.id,
          name: automation.name,
          description: automation.description,
          status: automation.status,
          currentVersion: automation.versions[0]?.versionNumber,
          createdAt: automation.createdAt.toISOString(),
        },
      });
    },
  });

  /**
   * GET /v1/workspaces/:workspaceId/automations
   * List automations in workspace with active version metadata.
   */
  fastify.get('/v1/workspaces/:workspaceId/automations', {
    preHandler: [fastify.enforceTenancy('automation.read')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;

      const automations = await prisma.automation.findMany({
        where: { workspaceId: tenancy.workspaceId },
        include: {
          activeVersion: {
            select: {
              id: true,
              versionNumber: true,
              changeSummary: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              versions: true,
              runs: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return reply.send({
        automations: automations.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          status: a.status,
          activeVersion: a.activeVersion
            ? {
                id: a.activeVersion.id,
                versionNumber: a.activeVersion.versionNumber,
                changeSummary: a.activeVersion.changeSummary,
                createdAt: a.activeVersion.createdAt.toISOString(),
              }
            : null,
          totalVersions: a._count.versions,
          totalRuns: a._count.runs,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        })),
      });
    },
  });

  /**
   * GET /v1/workspaces/:workspaceId/automations/:id
   * Get single automation with its active and latest draft versions.
   */
  fastify.get('/v1/workspaces/:workspaceId/automations/:id', {
    preHandler: [fastify.enforceTenancy('automation.read')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const automation = await prisma.automation.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
        include: {
          activeVersion: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!automation) {
        throw new NotFoundError(`Automation '${id}' not found`);
      }

      return reply.send({
        automation: {
          id: automation.id,
          name: automation.name,
          description: automation.description,
          status: automation.status,
          activeVersion: automation.activeVersion,
          latestVersion: automation.versions[0] ?? null,
          createdAt: automation.createdAt.toISOString(),
          updatedAt: automation.updatedAt.toISOString(),
        },
      });
    },
  });

  /**
   * PUT /v1/workspaces/:workspaceId/automations/:id/definition
   * Save a draft workflow definition, running validation and diff against active version.
   */
  fastify.put('/v1/workspaces/:workspaceId/automations/:id/definition', {
    preHandler: [fastify.enforceTenancy('automation.edit')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const parsed = workflowDefinitionSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid workflow definition AST', parsed.error.format());
      }

      const automation = await prisma.automation.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
        include: {
          activeVersion: true,
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!automation) {
        throw new NotFoundError(`Automation '${id}' not found`);
      }

      const newDefinition = parsed.data;

      // Run graph validation
      const validation = validateWorkflow(newDefinition);

      // Compute diff against active version or previous draft version
      const baseVersion = automation.activeVersion ?? automation.versions[0];
      let diff = null;
      if (baseVersion) {
        diff = computeWorkflowDiff(
          baseVersion.definition as unknown as WorkflowDefinition,
          newDefinition,
        );
      }

      // Next version number is latest + 1
      const latestVersionNum = automation.versions[0]?.versionNumber ?? 0;
      const nextVersionNum = latestVersionNum + 1;

      const changeSummary = diff ? diff.humanReadableSummary : 'Draft workflow updated';

      const newVersion = await prisma.automationVersion.create({
        data: {
          automationId: automation.id,
          versionNumber: nextVersionNum,
          definition: newDefinition as unknown as Prisma.InputJsonValue,
          changeSummary,
          authorId: tenancy.userId,
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'automation.draft_updated',
        targetType: 'automation_version',
        targetId: newVersion.id,
        afterState: { versionNumber: nextVersionNum, summary: changeSummary },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.send({
        version: {
          id: newVersion.id,
          versionNumber: newVersion.versionNumber,
          changeSummary: newVersion.changeSummary,
          validation,
          diff,
          createdAt: newVersion.createdAt.toISOString(),
        },
      });
    },
  });

  /**
   * POST /v1/workspaces/:workspaceId/automations/:id/publish
   * Section 76 Activation Flow:
   * Validation -> Policy & Risk Analysis -> Publish Version Snapshot -> Activate
   */
  fastify.post('/v1/workspaces/:workspaceId/automations/:id/publish', {
    preHandler: [fastify.enforceTenancy('automation.publish')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const automation = await prisma.automation.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
          activeVersion: true,
        },
      });

      if (!automation) {
        throw new NotFoundError(`Automation '${id}' not found`);
      }

      const draftVersion = automation.versions[0];
      if (!draftVersion) {
        throw new ValidationError('No draft version found to publish');
      }

      const definition = draftVersion.definition as unknown as WorkflowDefinition;

      // Step 1: Structural Validation
      const validation = validateWorkflow(definition);
      if (!validation.valid) {
        throw new ValidationError('Cannot publish structurally invalid workflow', {
          errors: validation.errors,
        });
      }

      // Step 2: Static Risk Analysis (Section 78)
      const risk = analyzeWorkflowRisk(definition);
      if (risk.blockedFromActivation) {
        throw new ForbiddenError(
          `Workflow activation blocked by security policy due to CRITICAL risk: ${risk.findings
            .map((f) => f.title)
            .join(', ')}`,
        );
      }

      // Step 3: Promote draft version to active and mark automation ACTIVE
      const updated = await prisma.automation.update({
        where: { id: automation.id },
        data: {
          activeVersionId: draftVersion.id,
          status: 'ACTIVE',
        },
        include: {
          activeVersion: true,
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'automation.published',
        targetType: 'automation',
        targetId: automation.id,
        beforeState: {
          status: automation.status,
          activeVersionId: automation.activeVersionId,
        },
        afterState: {
          status: updated.status,
          activeVersionId: updated.activeVersionId,
          versionNumber: draftVersion.versionNumber,
        },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.send({
        automation: {
          id: updated.id,
          name: updated.name,
          status: updated.status,
          activeVersion: {
            id: draftVersion.id,
            versionNumber: draftVersion.versionNumber,
            changeSummary: draftVersion.changeSummary,
          },
          riskAssessment: {
            highestRisk: risk.highestRisk,
            findings: risk.findings,
          },
        },
      });
    },
  });

  /**
   * PATCH /v1/workspaces/:workspaceId/automations/:id/status
   * Update automation status (e.g. ACTIVE, PAUSED, ARCHIVED).
   */
  fastify.patch('/v1/workspaces/:workspaceId/automations/:id/status', {
    preHandler: [fastify.enforceTenancy('automation.edit')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };
      const { status } = (request.body as { status?: string }) || {};

      if (!status || !['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'].includes(status)) {
        throw new ValidationError('Invalid status. Must be DRAFT, ACTIVE, PAUSED, or ARCHIVED.');
      }

      const automation = await prisma.automation.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
      });

      if (!automation) {
        throw new NotFoundError(`Automation '${id}' not found`);
      }

      const updated = await prisma.automation.update({
        where: { id },
        data: { status: status as any },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'automation.status_updated',
        targetType: 'automation',
        targetId: id,
        beforeState: { status: automation.status },
        afterState: { status: updated.status },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.send({ automation: updated });
    },
  });

  /**
   * POST /v1/workspaces/:workspaceId/automations/:id/rollback
   * Rollback to a previous immutable version snapshot.
   */
  fastify.post('/v1/workspaces/:workspaceId/automations/:id/rollback', {
    preHandler: [fastify.enforceTenancy('automation.publish')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const parsed = rollbackSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid rollback parameters', parsed.error.format());
      }

      const { targetVersionNumber, reason } = parsed.data;

      const targetVersion = await prisma.automationVersion.findFirst({
        where: {
          automationId: id,
          versionNumber: targetVersionNumber,
          automation: { workspaceId: tenancy.workspaceId },
        },
      });

      if (!targetVersion) {
        throw new NotFoundError(
          `Version ${targetVersionNumber} not found for automation '${id}' in this workspace`,
        );
      }

      // Find latest version number to create a new immutable rollback version snapshot
      const latest = await prisma.automationVersion.findFirst({
        where: { automationId: id },
        orderBy: { versionNumber: 'desc' },
      });

      const nextVersionNum = (latest?.versionNumber ?? 0) + 1;
      const rollbackSummary = `Rolled back to version ${targetVersionNumber}${
        reason ? `: ${reason}` : ''
      }`;

      // Create new version snapshot and set as active
      const rolledBackVersion = await prisma.automationVersion.create({
        data: {
          automationId: id,
          versionNumber: nextVersionNum,
          definition: targetVersion.definition as Prisma.InputJsonValue,
          changeSummary: rollbackSummary,
          authorId: tenancy.userId,
        },
      });

      await prisma.automation.update({
        where: { id },
        data: {
          activeVersionId: rolledBackVersion.id,
          status: 'ACTIVE',
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'automation.rollback',
        targetType: 'automation',
        targetId: id,
        afterState: {
          activeVersionId: rolledBackVersion.id,
          versionNumber: nextVersionNum,
          rolledBackFromVersion: targetVersionNumber,
          reason,
        },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.send({
        automationId: id,
        activeVersion: {
          id: rolledBackVersion.id,
          versionNumber: rolledBackVersion.versionNumber,
          changeSummary: rollbackSummary,
        },
      });
    },
  });

  /**
   * GET /v1/workspaces/:workspaceId/automations/:id/versions
   * List all historical immutable versions.
   */
  fastify.get('/v1/workspaces/:workspaceId/automations/:id/versions', {
    preHandler: [fastify.enforceTenancy('automation.read')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const versions = await prisma.automationVersion.findMany({
        where: {
          automationId: id,
          automation: { workspaceId: tenancy.workspaceId },
        },
        orderBy: { versionNumber: 'desc' },
        include: {
          automation: {
            select: { activeVersionId: true },
          },
        },
      });

      return reply.send({
        versions: versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
          isActive: v.id === v.automation.activeVersionId,
          changeSummary: v.changeSummary,
          authorId: v.authorId,
          createdAt: v.createdAt.toISOString(),
        })),
      });
    },
  });
};
