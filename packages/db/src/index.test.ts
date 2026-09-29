import { describe, expect, it } from 'vitest';
import { verifyAndPrintTarget } from '../scripts/safe-migrate.js';

describe('@agentic/db migration safety', () => {
  it('correctly accepts the dedicated project database agentic_dev on localhost', () => {
    const target = verifyAndPrintTarget('postgresql://agentic:secret@localhost:5433/agentic_dev', 'development');
    expect(target.host).toBe('localhost');
    expect(target.database).toBe('agentic_dev');
  });

  it('correctly accepts the dedicated Nexora Neon cloud database', () => {
    const target = verifyAndPrintTarget(
      'postgresql://neondb_owner:secret@ep-lively-cake-b40xdxkl-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require',
      'development'
    );
    expect(target.host).toContain('ep-lively-cake');
    expect(target.database).toBe('neondb');
  });
});
