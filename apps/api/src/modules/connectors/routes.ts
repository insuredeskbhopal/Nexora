import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '@agentic/db';
import { encryptEnvelope, decryptEnvelope, sanitizeObjectForAudit } from '@agentic/crypto';
import {
  connectorRegistry,
  generateConnectorFromOpenApi,
  OpenApiSpec,
} from '@agentic/connectors';
import { ValidationError, NotFoundError } from '@agentic/shared';
import { recordAuditLog } from '../audit/auditService.js';

const ConnectAccountBodySchema = z.object({
  connectorId: z.string().min(1),
  name: z.string().min(1),
  authType: z.enum(['OAUTH2', 'API_KEY', 'BEARER', 'BASIC', 'CUSTOM']),
  credentials: z.record(z.any()),
  scopes: z.array(z.string()).optional(),
});

const GenerateConnectorBodySchema = z.object({
  spec: z.record(z.any()),
});

export const connectorRoutes: FastifyPluginAsync = async (fastify) => {
  // 1. List available connectors in registry
  fastify.get('/v1/workspaces/:workspaceId/connectors', {
    preHandler: [fastify.enforceTenancy('connector.use')],
    handler: async (_request, reply) => {
      const connectors = connectorRegistry.list().map((c) => ({
        id: c.manifest.id,
        name: c.manifest.name,
        description: c.manifest.description,
        category: c.manifest.category,
        icon: c.manifest.icon,
        authTypes: c.manifest.authTypes,
        rateLimit: c.manifest.rateLimit,
        actionsCount: c.manifest.actions.length,
        triggersCount: c.manifest.triggers.length,
        actions: c.manifest.actions.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          isIdempotent: a.isIdempotent,
        })),
      }));

      return reply.send({ connectors });
    },
  });

  // 2. Connect an account (encrypt credentials via envelope encryption)
  fastify.post('/v1/workspaces/:workspaceId/connectors/accounts', {
    preHandler: [fastify.enforceTenancy('credential.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parseResult = ConnectAccountBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        throw new ValidationError('Invalid connector account payload', parseResult.error.format());
      }
      const body = parseResult.data;

      // Verify connector exists
      if (!connectorRegistry.has(body.connectorId)) {
        throw new NotFoundError(`Connector "${body.connectorId}" is not registered in the system`);
      }

      // Envelope encrypt the credential payload
      const encryptedData = encryptEnvelope(JSON.stringify(body.credentials));

      const account = await prisma.connectorAccount.create({
        data: {
          workspaceId: tenancy.workspaceId,
          connectorId: body.connectorId,
          name: body.name,
          authType: body.authType,
          encryptedData,
          keyId: 'kms-primary-v1',
          scopes: body.scopes ?? [],
          status: 'CONNECTED',
        },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        actorType: 'USER',
        action: 'connector.account.connect',
        targetType: 'ConnectorAccount',
        targetId: account.id,
        afterState: {
          id: account.id,
          connectorId: account.connectorId,
          name: account.name,
          sanitizedCredentials: sanitizeObjectForAudit(body.credentials),
        },
      });

      return reply.status(201).send({
        account: {
          id: account.id,
          workspaceId: account.workspaceId,
          connectorId: account.connectorId,
          name: account.name,
          authType: account.authType,
          scopes: account.scopes,
          status: account.status,
          createdAt: account.createdAt,
        },
      });
    },
  });

  // 3. List connected accounts in workspace
  fastify.get('/v1/workspaces/:workspaceId/connectors/accounts', {
    preHandler: [fastify.enforceTenancy('connector.use')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;

      const accounts = await prisma.connectorAccount.findMany({
        where: { workspaceId: tenancy.workspaceId },
        orderBy: { createdAt: 'desc' },
      });

      // Never expose encryptedData or credentials to client
      const safeAccounts = accounts.map((acc) => ({
        id: acc.id,
        workspaceId: acc.workspaceId,
        connectorId: acc.connectorId,
        name: acc.name,
        authType: acc.authType,
        scopes: acc.scopes,
        status: acc.status,
        lastTestedAt: acc.lastTestedAt,
        createdAt: acc.createdAt,
      }));

      return reply.send({ accounts: safeAccounts });
    },
  });

  // 4. Test connection for an account
  fastify.post('/v1/workspaces/:workspaceId/connectors/accounts/:id/test', {
    preHandler: [fastify.enforceTenancy('credential.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const account = await prisma.connectorAccount.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
      });

      if (!account) {
        throw new NotFoundError('Connector account not found');
      }

      const connector = connectorRegistry.get(account.connectorId);
      if (!connector) {
        throw new NotFoundError(`Connector "${account.connectorId}" not found`);
      }

      let credentials: Record<string, unknown> = {};
      try {
        const decryptedJson = decryptEnvelope(account.encryptedData);
        credentials = JSON.parse(decryptedJson);
      } catch {
        return reply.status(500).send({
          error: 'DECRYPTION_FAILED',
          message: 'Failed to decrypt credential payload using envelope key',
        });
      }

      const testResult = await connector.testConnection(credentials);

      // Update database status
      await prisma.connectorAccount.update({
        where: { id: account.id },
        data: {
          lastTestedAt: new Date(),
          status: testResult.success ? 'CONNECTED' : 'ERROR',
        },
      });

      return reply.send({ testResult });
    },
  });

  // 5. Delete connected account
  fastify.delete('/v1/workspaces/:workspaceId/connectors/accounts/:id', {
    preHandler: [fastify.enforceTenancy('credential.manage')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const { id } = request.params as { id: string };

      const account = await prisma.connectorAccount.findFirst({
        where: { id, workspaceId: tenancy.workspaceId },
      });

      if (!account) {
        throw new NotFoundError('Connector account not found');
      }

      await prisma.connectorAccount.delete({
        where: { id: account.id },
      });

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        actorType: 'USER',
        action: 'connector.account.delete',
        targetType: 'ConnectorAccount',
        targetId: account.id,
      });

      return reply.send({ success: true });
    },
  });

  // 6. Section 31: Auto-generate connector from OpenAPI Specification
  fastify.post('/v1/workspaces/:workspaceId/connectors/generate', {
    preHandler: [fastify.enforceTenancy('connector.create')],
    handler: async (request, reply) => {
      const tenancy = request.tenancy!;
      const parseResult = GenerateConnectorBodySchema.safeParse(request.body);
      if (!parseResult.success) {
        throw new ValidationError('Invalid OpenAPI spec body', parseResult.error.format());
      }
      const body = parseResult.data;
      const generated = generateConnectorFromOpenApi(body.spec as unknown as OpenApiSpec);

      // Register the generated connector in memory
      connectorRegistry.register(generated);

      await recordAuditLog({
        workspaceId: tenancy.workspaceId,
        actorId: tenancy.userId,
        actorType: 'USER',
        action: 'connector.generate',
        targetType: 'Connector',
        targetId: generated.id,
        afterState: {
          connectorId: generated.id,
          name: generated.manifest.name,
          actionsCount: generated.manifest.actions.length,
        },
      });

      return reply.status(201).send({
        connector: {
          id: generated.manifest.id,
          name: generated.manifest.name,
          description: generated.manifest.description,
          actions: generated.manifest.actions.map((a) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            isIdempotent: a.isIdempotent,
          })),
        },
      });
    },
  });
};
