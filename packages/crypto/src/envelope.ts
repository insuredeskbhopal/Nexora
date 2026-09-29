import crypto from 'node:crypto';
import { config } from '@agentic/config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits
const DEK_LENGTH = 32; // 256 bits

export interface EncryptedEnvelope {
  version: 'v1';
  keyId: string;
  encryptedDek: string; // hex
  iv: string; // hex
  authTag: string; // hex
  ciphertext: string; // hex
}

/**
 * Derives a 32-byte key buffer from a master key string.
 */
function getMasterKeyBuffer(customMasterKey?: string): Buffer {
  const masterKey = customMasterKey || config.ENCRYPTION_MASTER_KEY;
  if (!masterKey || masterKey.length < 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 characters long');
  }
  // If master key is already 64-char hex (32 bytes), parse it directly; otherwise sha256 hash it
  if (/^[0-9a-fA-F]{64}$/.test(masterKey)) {
    return Buffer.from(masterKey, 'hex');
  }
  return crypto.createHash('sha256').update(masterKey, 'utf8').digest();
}

/**
 * Encrypts a plaintext string using Envelope Encryption:
 * 1. Generates a cryptographically random, ephemeral 256-bit Data Encryption Key (DEK).
 * 2. Encrypts the plaintext with DEK using AES-256-GCM.
 * 3. Encrypts the DEK with the Master Key using AES-256-GCM.
 * 4. Returns a serialized envelope string.
 */
export function encryptEnvelope(
  plaintext: string,
  options?: { masterKey?: string; keyId?: string }
): string {
  const masterKeyBuf = getMasterKeyBuffer(options?.masterKey);
  const keyId = options?.keyId || 'kms-primary-v1';

  // 1. Generate random ephemeral DEK
  const dek = crypto.randomBytes(DEK_LENGTH);

  // 2. Encrypt plaintext with DEK using AES-256-GCM
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, dek, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  // 3. Encrypt the DEK with the Master Key
  const dekIv = crypto.randomBytes(IV_LENGTH);
  const dekCipher = crypto.createCipheriv(ALGORITHM, masterKeyBuf, dekIv);
  let encDek = dekCipher.update(dek.toString('hex'), 'utf8', 'hex');
  encDek += dekCipher.final('hex');
  const dekTag = dekCipher.getAuthTag().toString('hex');

  // Pack the encrypted DEK with its IV and tag: dekIv:dekTag:encDek
  const packedEncDek = `${dekIv.toString('hex')}:${dekTag}:${encDek}`;

  // 4. Return serialized envelope: v1:keyId:packedEncDek:iv:authTag:ciphertext
  return `v1:${keyId}:${packedEncDek}:${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts a serialized envelope string back to plaintext.
 */
export function decryptEnvelope(
  envelopeString: string,
  options?: { masterKey?: string }
): string {
  const parts = envelopeString.split(':');
  if (parts.length !== 8) {
    throw new Error('Invalid envelope ciphertext format. Expected 8 segments.');
  }

  const version = parts[0]!;
  const _keyId = parts[1]!;
  const dekIvHex = parts[2]!;
  const dekTagHex = parts[3]!;
  const encDekHex = parts[4]!;
  const ivHex = parts[5]!;
  const authTagHex = parts[6]!;
  const ciphertextHex = parts[7]!;

  if (version !== 'v1') {
    throw new Error(`Unsupported envelope version: ${version}`);
  }

  const masterKeyBuf = getMasterKeyBuffer(options?.masterKey);

  // 1. Decrypt DEK using Master Key
  const dekIv = Buffer.from(dekIvHex, 'hex');
  const dekTag = Buffer.from(dekTagHex, 'hex');
  const dekDecipher = crypto.createDecipheriv(ALGORITHM, masterKeyBuf, dekIv);
  dekDecipher.setAuthTag(dekTag);
  const dekChunk1 = dekDecipher.update(encDekHex, 'hex', 'utf8');
  const dekChunk2 = dekDecipher.final('utf8');
  const dek = Buffer.from(dekChunk1 + dekChunk2, 'hex');

  // 2. Decrypt ciphertext using decrypted DEK
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, dek, iv);
  decipher.setAuthTag(authTag);
  const plain1 = decipher.update(ciphertextHex, 'hex', 'utf8');
  const plain2 = decipher.final('utf8');

  return plain1 + plain2;
}

/**
 * Masks a sensitive string for display or logging (e.g., "sk-live-123456789" -> "sk-live-••••6789")
 */
export function maskSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) {
    return '••••••••';
  }
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}••••${suffix}`;
}

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /apiKey/i,
  /api_key/i,
  /auth/i,
  /credential/i,
  /private_?key/i,
  /bearer/i,
  /access_?token/i,
  /refresh_?token/i,
  /webhook_?secret/i,
];

/**
 * Recursively sanitizes an object, replacing sensitive keys with masked values for audit logs & APIs.
 */
export function sanitizeObjectForAudit<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObjectForAudit(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(k));
      if (isSensitive) {
        if (typeof v === 'string') {
          sanitized[k] = maskSecret(v);
        } else if (v !== null && typeof v === 'object') {
          sanitized[k] = '[REDACTED_OBJECT]';
        } else {
          sanitized[k] = '[REDACTED]';
        }
      } else {
        sanitized[k] = sanitizeObjectForAudit(v);
      }
    }
    return sanitized as T;
  }

  return value;
}
