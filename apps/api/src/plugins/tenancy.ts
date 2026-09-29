import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { UnauthorizedError, ForbiddenError } from '@agentic/shared';
import { verifyAuthToken, verifyWorkspaceAccess, type WorkspacePermission, type VerifiedTenancyContext } from '@agentic/auth';
import { prisma } from '@agentic/db';
import { config } from '@agentic/config';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    enforceTenancy: (
      requiredPermission?: WorkspacePermission,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const tenancyPluginAsync: FastifyPluginAsync = async (fastify) => {
  /**
   * Global Hook to resolve user identity from Authorization header or dev/test headers
   */
  fastify.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const payload = await verifyAuthToken(token, config.JWT_SECRET);
      request.auth = payload;
      return;
    }

    // In development and test environments, allow simulated user headers for seamless integration testing
    if (config.NODE_ENV === 'development' || config.NODE_ENV === 'test') {
      const devUserId = request.headers['x-user-id'] as string;
      const devEmail = request.headers['x-user-email'] as string;
      if (devUserId && devEmail) {
        request.auth = {
          userId: devUserId,
          email: devEmail,
        };
        return;
      }
    }

    throw new UnauthorizedError('Authentication required: Bearer token missing or invalid');
  });

  /**
   * Pre-handler hook to strictly enforce server-side tenancy boundary and RBAC permissions.
   * Section 5: "All tenant-owned entities must contain workspace_id or an equivalent verified tenancy boundary.
   * Never trust a workspace_id coming directly from the client without validating membership server-side."
   */
  fastify.decorate(
    'enforceTenancy',
    (requiredPermission?: WorkspacePermission) => {
      return async (request: FastifyRequest, _reply: FastifyReply) => {
        // Ensure user is authenticated first
        if (!request.auth) {
          await fastify.authenticate(request, _reply);
        }

        const userId = request.auth!.userId;
        const params = request.params as Record<string, string>;
        const query = request.query as Record<string, string>;
        const body = (request.body as Record<string, unknown>) || {};

        // Extract workspaceId from params, query, body, or headers
        const workspaceId =
          params.workspaceId ||
          params.id || // when route is /v1/workspaces/:id
          query.workspaceId ||
          (typeof body.workspaceId === 'string' ? body.workspaceId : undefined) ||
          (request.headers['x-workspace-id'] as string);

        if (!workspaceId) {
          throw new ForbiddenError('Workspace ID is required to verify tenancy context');
        }

        const verifiedContext = await verifyWorkspaceAccess(
          prisma,
          userId,
          workspaceId,
          requiredPermission,
        );

        request.tenancy = verifiedContext;
      };
    },
  );
};

export const tenancyPlugin = fp(tenancyPluginAsync, {
  name: 'tenancy-plugin',
});
