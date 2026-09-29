import { z } from 'zod';
import { BaseConnector } from '../base.js';
import { ConnectorManifest, TestConnectionResult, ConnectorError } from '../types.js';

const SlackSendMessageInputSchema = z.object({
  channel: z.string().min(1, 'Channel ID or name is required'),
  text: z.string().min(1, 'Message text is required'),
  blocks: z.array(z.record(z.any())).optional(),
  threadTs: z.string().optional(),
});

export class SlackConnector extends BaseConnector {
  public readonly manifest: ConnectorManifest = {
    id: 'slack',
    name: 'Slack',
    description: 'Post messages, alerts, and interactive blocks to Slack channels and users',
    category: 'COMMUNICATION',
    icon: 'slack',
    authTypes: ['OAUTH2', 'BEARER'],
    rateLimit: {
      requestsPerMinute: 60,
      burstLimit: 10,
    },
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        description: 'Post a message to a Slack channel or direct message thread',
        inputSchema: SlackSendMessageInputSchema,
        outputSchema: z.object({
          ok: z.boolean(),
          channel: z.string(),
          ts: z.string(),
          message: z.any().optional(),
        }),
        isIdempotent: false,
        execute: async (context) => {
          const input = SlackSendMessageInputSchema.parse(context.input);
          const token = (context.credentials?.token || context.credentials?.accessToken) as string;

          if (!token) {
            throw new ConnectorError('Slack token is missing from credentials', 'AUTHENTICATION');
          }

          const response = await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              channel: input.channel,
              text: input.text,
              blocks: input.blocks,
              thread_ts: input.threadTs,
            }),
          });

          const data = (await response.json()) as { ok: boolean; error?: string; channel?: string; ts?: string; message?: unknown };

          if (!data.ok) {
            if (data.error === 'rate_limited') {
              throw new ConnectorError(`Slack API rate limited`, 'RATE_LIMIT');
            }
            if (data.error === 'invalid_auth' || data.error === 'token_expired') {
              throw new ConnectorError(`Slack authentication failed: ${data.error}`, 'AUTHENTICATION');
            }
            throw new ConnectorError(`Slack error: ${data.error}`, 'PERMANENT', { details: data });
          }

          return {
            ok: true,
            channel: data.channel ?? input.channel,
            ts: data.ts ?? String(Date.now()),
            message: data.message,
          };
        },
      },
    ],
    triggers: [],
  };

  public async testConnection(credentials: Record<string, unknown>): Promise<TestConnectionResult> {
    const token = (credentials.token || credentials.accessToken) as string;
    if (!token) {
      return { success: false, message: 'Missing bot or user OAuth token' };
    }

    const start = Date.now();
    if (token.startsWith('xoxb-mock')) {
      return {
        success: true,
        message: 'Mock Slack bot connection verified',
        latencyMs: 1,
        details: { team: 'Mock Workspace', user: 'Mock Bot' },
      };
    }

    try {
      const res = await fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { ok: boolean; error?: string; team?: string; user?: string };
      if (data.ok) {
        return {
          success: true,
          message: `Connected to Slack team "${data.team}" as user "${data.user}"`,
          latencyMs: Date.now() - start,
          details: { team: data.team, user: data.user },
        };
      }
      return {
        success: false,
        message: `Slack auth check failed: ${data.error}`,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        success: false,
        message: `Network error: ${(err as Error).message}`,
        latencyMs: Date.now() - start,
      };
    }
  }
}
