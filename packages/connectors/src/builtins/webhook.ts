import crypto from 'node:crypto';
import { z } from 'zod';
import { BaseConnector } from '../base.js';
import { ConnectorManifest, TestConnectionResult, ConnectorError } from '../types.js';

const WebhookEmitInputSchema = z.object({
  targetUrl: z.string().url(),
  payload: z.record(z.any()),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
});

export class WebhookConnector extends BaseConnector {
  public readonly manifest: ConnectorManifest = {
    id: 'webhook',
    name: 'Webhook',
    description: 'Receive webhook events from external platforms or emit outgoing signed webhook payloads',
    category: 'GENERIC',
    icon: 'webhook',
    authTypes: ['CUSTOM', 'BEARER', 'API_KEY'],
    rateLimit: {
      requestsPerMinute: 1200,
      burstLimit: 100,
    },
    actions: [
      {
        id: 'emit',
        name: 'Emit Webhook',
        description: 'Dispatch an outgoing HTTP POST webhook payload with optional HMAC signature',
        inputSchema: WebhookEmitInputSchema,
        outputSchema: z.object({
          success: z.boolean(),
          statusCode: z.number(),
          deliveryTimestamp: z.string(),
        }),
        isIdempotent: false,
        execute: async (context) => {
          const input = WebhookEmitInputSchema.parse(context.input);
          const bodyStr = JSON.stringify(input.payload);

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Nexora-Webhook-Dispatcher/1.0',
            'X-Nexora-Delivery-Id': context.runId,
            ...(input.headers || {}),
          };

          // If secret is configured, generate HMAC-SHA256 signature
          const secret = input.secret || (context.credentials?.secret as string);
          if (secret) {
            const hmac = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
            headers['X-Nexora-Signature'] = `sha256=${hmac}`;
          }

          try {
            const res = await fetch(input.targetUrl, {
              method: 'POST',
              headers,
              body: bodyStr,
            });

            if (!res.ok) {
              throw new ConnectorError(
                `Webhook delivery failed with status ${res.status}: ${res.statusText}`,
                res.status >= 500 ? 'TRANSIENT' : 'PERMANENT',
                { statusCode: res.status }
              );
            }

            return {
              success: true,
              statusCode: res.status,
              deliveryTimestamp: new Date().toISOString(),
            };
          } catch (err: unknown) {
            if (err instanceof ConnectorError) throw err;
            throw new ConnectorError(`Webhook delivery failed: ${(err as Error).message}`, 'TRANSIENT', { cause: err });
          }
        },
      },
    ],
    triggers: [
      {
        id: 'receive',
        name: 'Receive Webhook',
        description: 'Triggers when an external webhook payload is received and verified',
        type: 'WEBHOOK',
        outputSchema: z.record(z.any()),
      },
    ],
  };

  /**
   * Helper utility for verifying incoming HMAC signatures.
   */
  public verifySignature(payload: string, signature: string, secret: string): boolean {
    const cleanSig = signature.replace(/^sha256=/, '');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(cleanSig, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
      return false;
    }
  }

  public async testConnection(_credentials: Record<string, unknown>): Promise<TestConnectionResult> {
    return { success: true, message: 'Webhook endpoint generator ready' };
  }
}
