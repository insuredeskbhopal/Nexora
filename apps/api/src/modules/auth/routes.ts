import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@agentic/db';
import { createAuthToken } from '@agentic/auth';
import { config } from '@agentic/config';
import { ValidationError, NotFoundError } from '@agentic/shared';
import { recordAuditLog } from '../audit/auditService.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /v1/auth/register
   * Real user self-registration in PostgreSQL database.
   */
  fastify.post('/v1/auth/register', async (request, reply) => {
    const { email, name, workspaceName } = (request.body as {
      email?: string;
      name?: string;
      workspaceName?: string;
    }) || {};

    if (!email || !email.includes('@')) {
      throw new ValidationError('A valid work email is required for registration');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0] || 'User').trim();
    const cleanWorkspaceName = (workspaceName || `${cleanName}'s Workspace`).trim();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    let workspace: any = null;

    if (user) {
      // User already exists, log them into their first workspace
      workspace = user.memberships[0]?.workspace;
    } else {
      // Create fresh user in PostgreSQL
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
        },
        include: {
          memberships: {
            include: {
              workspace: true,
            },
          },
        },
      });

      // Generate unique slug
      const slug =
        cleanWorkspaceName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') +
        '-' +
        Math.random().toString(36).substring(2, 6);

      // Create primary Workspace for this new user
      workspace = await prisma.workspace.create({
        data: {
          name: cleanWorkspaceName,
          slug,
          plan: 'ENTERPRISE',
          memberships: {
            create: {
              userId: user.id,
              role: 'OWNER',
            },
          },
        },
      });

      await recordAuditLog({
        workspaceId: workspace.id,
        actorId: user.id,
        action: 'user.registered',
        targetType: 'user',
        targetId: user.id,
        afterState: { email: user.email, name: user.name, workspaceId: workspace.id },
        ipAddress: request.ip,
        correlationId: request.requestId,
      });
    }

    // Generate real cryptographic JWT token
    const token = await createAuthToken(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      '30d',
    );

    return reply.status(201).send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspace: workspace
        ? {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            plan: workspace.plan,
          }
        : null,
    });
  });

  /**
   * POST /v1/auth/login
   * Real user sign-in using their registered email.
   */
  fastify.post('/v1/auth/login', async (request, reply) => {
    const { email } = (request.body as { email?: string }) || {};

    if (!email || !email.includes('@')) {
      throw new ValidationError('A valid email is required to sign in');
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError(
        `No account found with email "${cleanEmail}". Please register your account.`,
      );
    }

    const token = await createAuthToken(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      '30d',
    );

    const workspaces = user.memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      plan: m.workspace.plan,
      role: m.role,
    }));

    return reply.send({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspaces,
      activeWorkspace: workspaces[0] || null,
    });
  });

  /**
   * GET /v1/auth/me
   * Return authenticated user profile and workspaces from database.
   */
  fastify.get('/v1/auth/me', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const auth = request.auth!;

      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        include: {
          memberships: {
            include: {
              workspace: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('User record not found in database');
      }

      const workspaces = user.memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        plan: m.workspace.plan,
        role: m.role,
      }));

      return reply.send({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        workspaces,
      });
    },
  });
};
