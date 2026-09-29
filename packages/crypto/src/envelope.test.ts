import { describe, it, expect } from 'vitest';
import {
  encryptEnvelope,
  decryptEnvelope,
  maskSecret,
  sanitizeObjectForAudit,
} from './envelope.js';

describe('Envelope Encryption & Credential Vault', () => {
  it('should encrypt and decrypt plaintext using envelope encryption', () => {
    const secret = 'super-secret-oauth-refresh-token-xyz-12345';
    const encrypted = encryptEnvelope(secret);

    expect(encrypted).toMatch(/^v1:kms-primary-v1:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
    expect(encrypted).not.toContain(secret);

    const decrypted = decryptEnvelope(encrypted);
    expect(decrypted).toBe(secret);
  });

  it('should throw error when decrypting with tampered ciphertext or auth tag', () => {
    const secret = 'stripe_live_sec_abcdef123456';
    const encrypted = encryptEnvelope(secret);

    // Tamper with the last character
    const tampered = encrypted.slice(0, -2) + (encrypted.slice(-1) === 'a' ? 'b' : 'a');
    expect(() => decryptEnvelope(tampered)).toThrow();
  });

  it('should correctly mask secrets', () => {
    expect(maskSecret('12345678')).toBe('••••••••');
    expect(maskSecret('ghp_abcdef1234567890xyz')).toBe('ghp_••••0xyz');
  });

  it('should sanitize sensitive properties in audit log objects', () => {
    const input = {
      username: 'lead_specialist',
      apiKey: 'sk-proj-9876543210',
      nested: {
        accessToken: 'oauth-bearer-token-123',
        description: 'Lead generation webhook',
      },
      tags: ['crm', 'salesforce'],
    };

    const sanitized = sanitizeObjectForAudit(input);

    expect(sanitized.username).toBe('lead_specialist');
    expect(sanitized.apiKey).toBe('sk-p••••3210');
    expect(sanitized.nested.accessToken).toBe('oaut••••-123');
    expect(sanitized.nested.description).toBe('Lead generation webhook');
    expect(sanitized.tags).toEqual(['crm', 'salesforce']);
  });
});
