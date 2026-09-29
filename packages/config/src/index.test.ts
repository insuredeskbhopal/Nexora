import { describe, expect, it } from 'vitest';
import { loadConfig } from './index.js';

describe('@agentic/config', () => {
  const validMockEnv = {
    NODE_ENV: 'development',
    APP_ENV: 'development',
    WEB_PORT: '3000',
    API_PORT: '4000',
    DATABASE_URL: 'postgresql://agentic:agentic@localhost:5433/agentic_dev',
    REDIS_URL: 'redis://localhost:6379',
    TEMPORAL_ADDRESS: 'localhost:7233',
    TEMPORAL_NAMESPACE: 'default',
    S3_ENDPOINT: 'http://localhost:9000',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY: 'agentic_minio_admin',
    S3_SECRET_KEY: 'agentic_minio_secret_key',
    S3_BUCKET: 'agentic-artifacts',
    LOG_LEVEL: 'info',
  };

  it('successfully loads and parses a valid environment', () => {
    const config = loadConfig(validMockEnv);
    expect(config.NODE_ENV).toBe('development');
    expect(config.WEB_PORT).toBe(3000);
    expect(config.API_PORT).toBe(4000);
    expect(config.DATABASE_URL).toBe('postgresql://agentic:agentic@localhost:5433/agentic_dev');
  });

  it('fails fast when required variables are missing', () => {
    expect(() => loadConfig({})).toThrow(/\[CONFIGURATION ERROR\]/);
  });

  it('triggers critical database safeguard if targeting external or unauthorized database', () => {
    const dangerousEnv = {
      ...validMockEnv,
      DATABASE_URL: 'postgresql://admin:secret@unknown-external-host.com:5432/agentic_prod',
    };

    expect(() => loadConfig(dangerousEnv)).toThrow(/FATAL ENVIRONMENT SAFETY VIOLATION/);
  });

  it('strictly blocks unauthorized external databases such as Bima or Sunlife or ep-gentle-king', () => {
    const externalEnv = {
      ...validMockEnv,
      DATABASE_URL: 'postgresql://neondb_owner:secret@ep-gentle-king.aws.neon.tech/neondb',
    };

    expect(() => loadConfig(externalEnv)).toThrow(/CRITICAL DATABASE MISMATCH/);
  });

  it('allows the dedicated Nexora Neon database', () => {
    const nexoraEnv = {
      ...validMockEnv,
      DATABASE_URL:
        'postgresql://neondb_owner:secret@ep-lively-cake-b40xdxkl-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require',
    };

    const config = loadConfig(nexoraEnv);
    expect(config.DATABASE_URL).toContain('ep-lively-cake');
  });
});
