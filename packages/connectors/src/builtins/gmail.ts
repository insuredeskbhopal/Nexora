import { z } from 'zod';
import { BaseConnector } from '../base.js';
import { ConnectorManifest, TestConnectionResult, ConnectorError } from '../types.js';

const GmailSendInputSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  isHtml: z.boolean().default(false),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export class GmailConnector extends BaseConnector {
  public readonly manifest: ConnectorManifest = {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send emails, drafts, and read message threads via Google Workspace Gmail API',
    category: 'COMMUNICATION',
    icon: 'mail',
    authTypes: ['OAUTH2'],
    rateLimit: {
      requestsPerMinute: 250,
      burstLimit: 25,
    },
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        description: 'Send an email message via Gmail',
        inputSchema: GmailSendInputSchema,
        outputSchema: z.object({
          id: z.string(),
          threadId: z.string(),
          sentAt: z.string(),
        }),
        isIdempotent: false,
        execute: async (context) => {
          const input = GmailSendInputSchema.parse(context.input);
          const accessToken = (context.credentials?.accessToken || context.credentials?.token) as string;

          if (!accessToken) {
            throw new ConnectorError('Gmail OAuth accessToken is missing', 'AUTHENTICATION');
          }

          const recipients = Array.isArray(input.to) ? input.to.join(', ') : input.to;
          const mimeLines = [
            `To: ${recipients}`,
            `Subject: =?utf-8?B?${Buffer.from(input.subject).toString('base64')}?=`,
            `Content-Type: ${input.isHtml ? 'text/html' : 'text/plain'}; charset=utf-8`,
            '',
            input.body,
          ];

          const rawMime = Buffer.from(mimeLines.join('\r\n'))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw: rawMime }),
          });

          const data = (await res.json()) as { id?: string; threadId?: string; error?: { message: string; code: number } };

          if (!res.ok) {
            if (res.status === 401) {
              throw new ConnectorError('Gmail access token expired', 'AUTHENTICATION');
            }
            if (res.status === 429) {
              throw new ConnectorError('Gmail quota exceeded', 'RATE_LIMIT');
            }
            throw new ConnectorError(`Gmail API error: ${data.error?.message || res.statusText}`, 'PERMANENT', { details: data });
          }

          return {
            id: data.id ?? `msg_${Date.now()}`,
            threadId: data.threadId ?? `th_${Date.now()}`,
            sentAt: new Date().toISOString(),
          };
        },
      },
    ],
    triggers: [],
  };

  public async testConnection(credentials: Record<string, unknown>): Promise<TestConnectionResult> {
    const token = (credentials.accessToken || credentials.token) as string;
    if (!token) {
      return { success: false, message: 'Missing OAuth access token' };
    }

    const start = Date.now();
    try {
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { emailAddress?: string; error?: { message: string } };
      if (res.ok && data.emailAddress) {
        return {
          success: true,
          message: `Connected to Gmail account: ${data.emailAddress}`,
          latencyMs: Date.now() - start,
          details: { email: data.emailAddress },
        };
      }
      return {
        success: false,
        message: `Gmail profile check failed: ${data.error?.message || res.statusText}`,
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
