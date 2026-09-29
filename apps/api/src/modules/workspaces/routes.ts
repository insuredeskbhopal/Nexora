import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@agentic/db';
import {
  createWorkspaceSchema,
  addMemberSchema,
  queryAuditLogsSchema,
} from '@agentic/schemas';
import { ValidationError, NotFoundError, ForbiddenError } from '@agentic/shared';
import { recordAuditLog } from '../audit/auditService.js';

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /v1/workspaces
   * Create a new workspace and automatically establish the creator as OWNER.
   */
  fastify.post('/v1/workspaces', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const parsed = createWorkspaceSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid workspace data', parsed.error.format());
      }

      const { name, description } = parsed.data;
      const userId = request.auth!.userId;

      // Auto-generate clean slug if not explicitly given
      const slug =
        parsed.data.slug ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') +
          '-' +
          Math.random().toString(36).substring(2, 6);

      // Verify user exists in database or create provisioned user record
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: request.auth!.email,
            name: request.auth!.email.split('@')[0] || 'User',
          },
        });
      }

      const workspace = await prisma.workspace.create({
        data: {
          name,
          slug,
          description: description ?? null,
          memberships: {
            create: {
              userId,
              role: 'OWNER',
            },
          },
        },
        include: {
          memberships: true,
        },
      });

      await recordAuditLog({
        workspaceId: workspace.id,
        actorId: userId,
        action: 'workspace.created',
        targetType: 'workspace',
        targetId: workspace.id,
        afterState: { name: workspace.name, slug: workspace.slug },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.status(201).send({
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
          role: 'OWNER',
          createdAt: workspace.createdAt.toISOString(),
        },
      });
    },
  });

  /**
   * GET /v1/workspaces
   * List all workspaces where the authenticated user is an active member.
   */
  fastify.get('/v1/workspaces', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const userId = request.auth!.userId;

      const memberships = await prisma.membership.findMany({
        where: { userId },
        include: {
          workspace: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const workspaces = memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        description: m.workspace.description,
        role: m.role,
        createdAt: m.workspace.createdAt.toISOString(),
      }));

      return reply.send({ workspaces });
    },
  });

  /**
   * GET /v1/workspaces/:id
   * Get single workspace details with strict tenancy check.
   */
  fastify.get('/v1/workspaces/:id', {
    preHandler: [fastify.enforceTenancy('workspace.read')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;

      const workspace = await prisma.workspace.findUnique({
        where: { id: tenancy.workspaceId },
        include: {
          _count: {
            select: {
              memberships: true,
              automations: true,
              agents: true,
              runs: true,
            },
          },
        },
      });

      if (!workspace) {
        throw new NotFoundError(`Workspace '${tenancy.workspaceId}' not found`);
      }

      return reply.send({
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          description: workspace.description,
          plan: workspace.plan,
          active: workspace.active,
          currentUserRole: tenancy.role,
          counts: workspace._count,
          createdAt: workspace.createdAt.toISOString(),
          updatedAt: workspace.updatedAt.toISOString(),
        },
      });
    },
  });

  /**
   * GET /v1/workspaces/:id/members
   * List members of a workspace.
   */
  fastify.get('/v1/workspaces/:id/members', {
    preHandler: [fastify.enforceTenancy('workspace.read')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;

      const members = await prisma.membership.findMany({
        where: { workspaceId: tenancy.workspaceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return reply.send({
        members: members.map((m) => ({
          id: m.id,
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          role: m.role,
          createdAt: m.createdAt.toISOString(),
        })),
      });
    },
  });

  /**
   * POST /v1/workspaces/:id/members
   * Add or invite a member to the workspace with specified role.
   */
  fastify.post('/v1/workspaces/:id/members', {
    preHandler: [fastify.enforceTenancy('workspace.member.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parsed = addMemberSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid member invitation', parsed.error.format());
      }

      const { email, role } = parsed.data;

      // Owners can only be assigned by Owner
      if (role === 'OWNER' && tenancy.role !== 'OWNER') {
        throw new ForbiddenError('Only the workspace Owner can grant Owner role');
      }

      // Find user by email or create placeholder
      let targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) {
        targetUser = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0] || 'Invited User',
          },
        });
      }

      // Check if already a member
      const existing = await prisma.membership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: tenancy.workspaceId,
            userId: targetUser.id,
          },
        },
      });

      if (existing) {
        throw new ValidationError(`User with email '${email}' is already a member of this workspace`);
      }

      const membership = await prisma.membership.create({
        data: {
          workspaceId: tenancy.workspaceId,
          userId: targetUser.id,
          role,
        },
        include: {
          user: true,
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        action: 'workspace.member.added',
        targetType: 'membership',
        targetId: membership.id,
        afterState: { userId: targetUser.id, email: targetUser.email, role },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });

      return reply.status(201).send({
        member: {
          id: membership.id,
          userId: membership.user.id,
          name: membership.user.name,
          email: membership.user.email,
          role: membership.role,
          createdAt: membership.createdAt.toISOString(),
        },
      });
    },
  });

  /**
   * GET /v1/workspaces/:id/audit-logs
   * View immutable audit trail for the workspace.
   */
  fastify.get('/v1/workspaces/:id/audit-logs', {
    preHandler: [fastify.enforceTenancy('audit.view')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parsed = queryAuditLogsSchema.safeParse(request.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', parsed.error.format());
      }

      const { targetType, targetId, action, actorId, limit, cursor } = parsed.data;

      const logs = await prisma.auditLog.findMany({
        where: {
          workspaceId: tenancy.workspaceId,
          ...(targetType ? { targetType } : {}),
          ...(targetId ? { targetId } : {}),
          ...(action ? { action } : {}),
          ...(actorId ? { actorId } : {}),
        },
        take: limit,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return reply.send({
        auditLogs: logs.map((log) => ({
          id: log.id,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          actor: log.user
            ? {
                id: log.user.id,
                name: log.user.name,
                email: log.user.email,
              }
            : null,
          beforeState: log.beforeState,
          afterState: log.afterState,
          ipAddress: log.ipAddress,
          correlationId: log.correlationId,
          createdAt: log.createdAt.toISOString(),
        })),
      });
    },
  });
};
