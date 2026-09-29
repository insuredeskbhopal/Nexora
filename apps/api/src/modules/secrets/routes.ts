import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@agentic/db';
import { encryptEnvelope, maskSecret } from '@agentic/crypto';
import { ValidationError, NotFoundError } from '@agentic/shared';
import { recordAuditLog } from '../audit/auditService.js';

const SetSecretBodySchema = z.object({
  key: z.string().min(1).regex(/^[A-Z0-9_]+$/, 'Secret keys must be UPPERCASE_ALPHANUMERIC'),
  value: z.string().min(1),
  environment: z.enum(['DEVELOPMENT', 'TEST', 'STAGING', 'PRODUCTION']).default('DEVELOPMENT'),
});

export const secretRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. Create or update an encrypted secret in an environment
  fastify.post('/v1/workspaces/:workspaceId/secrets', {
    preHandler: [fastify.enforceTenancy('credential.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parseResult = SetSecretBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        throw new ValidationError('Invalid secret payload', parseResult.error.format());
      }
      const body = parseResult.data;

      // Envelope encrypt the secret value
      const encryptedValue = encryptEnvelope(body.value);

      const secret = await prisma.secret.upsert({
        where: {
          workspaceId_key_environment: {
            workspaceId: tenancy.workspaceId,
            key: body.key,
            environment: body.environment,
          },
        },
        create: {
          workspaceId: tenancy.workspaceId,
          key: body.key,
          encryptedValue,
          keyId: 'kms-primary-v1',
          environment: body.environment,
        },
        update: {
          encryptedValue,
          updatedAt: new Date(),
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        actorType: 'USER',
        action: 'secret.set',
        targetType: 'Secret',
        targetId: secret.id,
        afterState: {
          key: secret.key,
          environment: secret.environment,
          maskedValue: maskSecret(body.value),
        },
      });

      return reply.status(201).send({
        secret: {
          id: secret.id,
          key: secret.key,
          environment: secret.environment,
          maskedValue: maskSecret(body.value),
          updatedAt: secret.updatedAt,
        },
      });
    },
  });

  // 2. List secrets for a workspace & environment (masked values only)
  fastify.get('/v1/workspaces/:workspaceId/secrets', {
    preHandler: [fastify.enforceTenancy('credential.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const query = request.query as { environment?: string };
      const env = query.environment || 'DEVELOPMENT';

      const secrets = await prisma.secret.findMany({
        where: {
          workspaceId: tenancy.workspaceId,
          environment: env,
        },
        orderBy: { key: 'asc' },
      });

      const safeSecrets = secrets.map((s) => ({
        id: s.id,
        key: s.key,
        environment: s.environment,
        maskedValue: '••••••••',
        updatedAt: s.updatedAt,
      }));

      return reply.send({ secrets: safeSecrets });
    },
  });

  // 3. Delete a secret
  fastify.delete('/v1/workspaces/:workspaceId/secrets/:key', {
    preHandler: [fastify.enforceTenancy('credential.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { key } = request.params as { key: string };
      const query = request.query as { environment?: string };
      const env = query.environment || 'DEVELOPMENT';

      const existing = await prisma.secret.findUnique({
        where: {
          workspaceId_key_environment: {
            workspaceId: tenancy.workspaceId,
            key,
            environment: env,
          },
        },
      });

      if (!existing) {
        throw new NotFoundError('Secret not found');
      }

      await prisma.secret.delete({
        where: { id: existing.id },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        actorType: 'USER',
        action: 'secret.delete',
        targetType: 'Secret',
        targetId: existing.id,
        beforeState: { key: existing.key, environment: existing.environment },
      });

      return reply.send({ success: true });
    },
  });
};
