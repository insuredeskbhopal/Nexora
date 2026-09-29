import { BaseConnector } from './base.js';
import { HttpConnector } from './builtins/http.js';
import { WebhookConnector } from './builtins/webhook.js';
import { SlackConnector } from './builtins/slack.js';
import { GmailConnector } from './builtins/gmail.js';
import { GoogleSheetsConnector } from './builtins/googleSheets.js';
import { PostgresConnector } from './builtins/postgres.js';

export class ConnectorRegistry {
  private static instance: ConnectorRegistry | null = null;
  private readonly connectors: Map<string, BaseConnector> = new Map();

  constructor() {
    this.registerBuiltins();
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  private registerBuiltins(): void {
    this.register(new HttpConnector());
    this.register(new WebhookConnector());
    this.register(new SlackConnector());
    this.register(new GmailConnector());
    this.register(new GoogleSheetsConnector());
    this.register(new PostgresConnector());
  }

  public register(connector: BaseConnector): void {
    this.connectors.set(connector.id, connector);
  }

  public get(connectorId: string): BaseConnector | undefined {
    return this.connectors.get(connectorId);
  }

  public list(): BaseConnector[] {
    return Array.from(this.connectors.values());
  }

  public has(connectorId: string): boolean {
    return this.connectors.has(connectorId);
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
