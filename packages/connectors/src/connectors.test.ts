import { describe, it, expect } from 'vitest';
import { connectorRegistry } from './registry.js';
import { WebhookConnector } from './builtins/webhook.js';
import { generateConnectorFromOpenApi, OpenApiSpec } from './generator/openApiGenerator.js';
import { ConnectorError } from './types.js';

describe('Connector Framework & Built-in Connectors', () => {
  it('should initialize registry with all primary built-in connectors', () => {
    const list = connectorRegistry.list();
    expect(list.length).toBeGreaterThanOrEqual(6);
    expect(connectorRegistry.has('http')).toBe(true);
    expect(connectorRegistry.has('webhook')).toBe(true);
    expect(connectorRegistry.has('slack')).toBe(true);
    expect(connectorRegistry.has('gmail')).toBe(true);
    expect(connectorRegistry.has('google_sheets')).toBe(true);
    expect(connectorRegistry.has('postgres')).toBe(true);
  });

  it('should reject invalid input against action schema', async () => {
    const slack = connectorRegistry.get('slack')!;
    await expect(
      slack.executeAction('send_message', {
        workspaceId: 'ws-123',
        runId: 'run-123',
        nodeId: 'node-1',
        idempotencyKey: 'idem-1',
        credentials: { token: 'mock-token' },
        input: { channel: '' }, // missing text
      })
    ).rejects.toThrow(ConnectorError);
  });

  it('should verify HMAC signatures in WebhookConnector', () => {
    const webhook = new WebhookConnector();
    const payload = JSON.stringify({ event: 'lead.created', email: 'alex@example.com' });
    const secret = 'whsec_test_secret_key_12345';

    // Generate expected signature
    const crypto = require('node:crypto');
    const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    expect(webhook.verifySignature(payload, validSig, secret)).toBe(true);
    expect(webhook.verifySignature(payload, `sha256=${validSig}`, secret)).toBe(true);
    expect(webhook.verifySignature(payload, 'wrong-signature', secret)).toBe(false);
  });

  it('should generate a typed connector dynamically from an OpenAPI spec', async () => {
    const spec: OpenApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Petstore Inventory',
        version: '1.0.0',
        description: 'Test API for pets',
      },
      servers: [{ url: 'https://petstore.example.com/api' }],
      paths: {
        '/pets': {
          get: {
            operationId: 'listPets',
            summary: 'List all pets',
          },
          post: {
            operationId: 'createPet',
            summary: 'Create a pet',
          },
        },
        '/pets/{id}': {
          get: {
            operationId: 'getPetById',
            summary: 'Get pet by ID',
          },
        },
      },
      components: {
        securitySchemes: {
          apiKeyAuth: {
            type: 'apiKey',
            name: 'X-API-KEY',
            in: 'header',
          },
        },
      },
    };

    const generated = generateConnectorFromOpenApi(spec);
    expect(generated.id).toBe('custom_petstore_inventory');
    expect(generated.manifest.actions.length).toBe(3);
    expect(generated.getAction('listPets')).toBeDefined();
    expect(generated.getAction('createPet')).toBeDefined();
    expect(generated.getAction('getPetById')).toBeDefined();
  });
});
