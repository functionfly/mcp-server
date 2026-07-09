import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'crypto';

const PBKDF2_ITERATIONS_V1 = 100_000;
const PBKDF2_ITERATIONS_V2 = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  keyVersion: number;
}

function toBase64(buf: Buffer | Uint8Array): string {
  return buf.toString('base64');
}

function fromBase64(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

function deriveKey(
  passphrase: string,
  salt: Buffer,
  iterations: number
): Buffer {
  return pbkdf2Sync(passphrase, salt, iterations, KEY_LENGTH, 'sha256');
}

export function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

export function generateIV(): Buffer {
  return randomBytes(IV_LENGTH);
}

export async function encryptWithPassphrase(
  plaintext: string,
  passphrase: string
): Promise<EncryptedData> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = deriveKey(passphrase, salt, PBKDF2_ITERATIONS_V2);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const ciphertextBytes = encrypted.slice(0, encrypted.length - TAG_LENGTH);
  const tagBytes = encrypted.slice(encrypted.length - TAG_LENGTH);

  return {
    ciphertext: toBase64(ciphertextBytes),
    iv: toBase64(iv),
    salt: toBase64(salt),
    tag: toBase64(tagBytes),
    keyVersion: 2,
  };
}

export async function decryptWithPassphrase(
  data: EncryptedData,
  passphrase: string
): Promise<string> {
  const iterations =
    data.keyVersion === 2 ? PBKDF2_ITERATIONS_V2 : PBKDF2_ITERATIONS_V1;
  const salt = fromBase64(data.salt);
  const iv = fromBase64(data.iv);
  const ciphertext = fromBase64(data.ciphertext);
  const tag = fromBase64(data.tag);

  const key = deriveKey(passphrase, salt, iterations);

  const combined = Buffer.concat([ciphertext, tag]);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(combined),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

export interface VaultEncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  key_version: number;
}

export function toPayload(data: EncryptedData): VaultEncryptedPayload {
  return {
    ciphertext: data.ciphertext,
    iv: data.iv,
    salt: data.salt,
    tag: data.tag,
    key_version: data.keyVersion,
  };
}

export function getPassphrase(): string {
  const passphrase = process.env['VAULT_PASSPHRASE'];
  if (!passphrase) {
    throw new Error(
      'VAULT_PASSPHRASE environment variable is required for vault operations'
    );
  }
  return passphrase;
}
