import { z } from 'zod';
import { BaseConnector } from '../base.js';
import { ConnectorManifest, TestConnectionResult, ConnectorError } from '../types.js';

const SheetsAppendInputSchema = z.object({
  spreadsheetId: z.string().min(1, 'Spreadsheet ID is required'),
  range: z.string().default('Sheet1!A1'),
  values: z.array(z.array(z.any())).min(1, 'At least one row of values required'),
});

const SheetsReadInputSchema = z.object({
  spreadsheetId: z.string().min(1, 'Spreadsheet ID is required'),
  range: z.string().min(1, 'Range is required, e.g. Sheet1!A1:E10'),
});

export class GoogleSheetsConnector extends BaseConnector {
  public readonly manifest: ConnectorManifest = {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Read and append rows, update tables, and automate spreadsheets in Google Sheets',
    category: 'PRODUCTIVITY',
    icon: 'table',
    authTypes: ['OAUTH2'],
    rateLimit: {
      requestsPerMinute: 300,
      burstLimit: 30,
    },
    actions: [
      {
        id: 'append_row',
        name: 'Append Rows',
        description: 'Append rows to a Google Spreadsheet table',
        inputSchema: SheetsAppendInputSchema,
        outputSchema: z.object({
          spreadsheetId: z.string(),
          updatedRange: z.string(),
          updatedRows: z.number(),
        }),
        isIdempotent: false,
        execute: async (context) => {
          const input = SheetsAppendInputSchema.parse(context.input);
          const accessToken = (context.credentials?.accessToken || context.credentials?.token) as string;

          if (!accessToken) {
            throw new ConnectorError('Google Sheets OAuth accessToken is missing', 'AUTHENTICATION');
          }

          const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
            input.spreadsheetId
          )}/values/${encodeURIComponent(input.range)}:append?valueInputOption=USER_ENTERED`;

          const res = await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ values: input.values }),
          });

          const data = (await res.json()) as { updates?: { updatedRange?: string; updatedRows?: number }; error?: { message: string } };

          if (!res.ok) {
            if (res.status === 401) throw new ConnectorError('Google token expired', 'AUTHENTICATION');
            if (res.status === 429) throw new ConnectorError('Google Sheets quota exceeded', 'RATE_LIMIT');
            throw new ConnectorError(`Google Sheets error: ${data.error?.message || res.statusText}`, 'PERMANENT', { details: data });
          }

          return {
            spreadsheetId: input.spreadsheetId,
            updatedRange: data.updates?.updatedRange ?? input.range,
            updatedRows: data.updates?.updatedRows ?? input.values.length,
          };
        },
      },
      {
        id: 'read_range',
        name: 'Read Range',
        description: 'Read cell values from a specified sheet and range',
        inputSchema: SheetsReadInputSchema,
        outputSchema: z.object({
          range: z.string(),
          values: z.array(z.array(z.any())),
        }),
        isIdempotent: true,
        execute: async (context) => {
          const input = SheetsReadInputSchema.parse(context.input);
          const accessToken = (context.credentials?.accessToken || context.credentials?.token) as string;

          if (!accessToken) {
            throw new ConnectorError('Google Sheets OAuth accessToken is missing', 'AUTHENTICATION');
          }

          const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
            input.spreadsheetId
          )}/values/${encodeURIComponent(input.range)}`;

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const data = (await res.json()) as { range?: string; values?: any[][]; error?: { message: string } };

          if (!res.ok) {
            if (res.status === 401) throw new ConnectorError('Google token expired', 'AUTHENTICATION');
            throw new ConnectorError(`Google Sheets error: ${data.error?.message || res.statusText}`, 'PERMANENT', { details: data });
          }

          return {
            range: data.range ?? input.range,
            values: data.values ?? [],
          };
        },
      },
    ],
    triggers: [],
  };

  public async testConnection(credentials: Record<string, unknown>): Promise<TestConnectionResult> {
    const token = (credentials.accessToken || credentials.token) as string;
    if (!token) return { success: false, message: 'Missing OAuth access token' };

    const start = Date.now();
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { scope?: string; error_description?: string };
      if (res.ok && data.scope?.includes('spreadsheets')) {
        return {
          success: true,
          message: 'Google Sheets permissions verified successfully',
          latencyMs: Date.now() - start,
        };
      }
      return {
        success: false,
        message: data.error_description || 'Token lacks spreadsheets permission scope',
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
