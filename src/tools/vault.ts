import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
import { logger } from '../logger.js';
import {
  encryptWithPassphrase,
  decryptWithPassphrase,
  getPassphrase,
  toPayload,
} from '../vault-crypto.js';

export const ListSecretsSchema = z.object({
  namespace: z.string().optional().describe('Namespace path (e.g. "production/secrets"). Requires Pro+ plan.'),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type ListSecretsArgs = z.infer<typeof ListSecretsSchema>;

export async function listSecrets(
  client: FunctionFlyClient,
  args: ListSecretsArgs
) {
  logger.debug('listSecrets called', args);
  const result = await client.listSecrets({
    namespace: args.namespace,
    limit: args.limit,
    offset: args.offset,
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export const GetSecretSchema = z.object({
  id: z.string().uuid().describe('Secret ID (UUID)'),
  passphrase: z.string().optional().describe('Passphrase to decrypt the secret. Uses VAULT_PASSPHRASE env var if not provided.'),
});

export type GetSecretArgs = z.infer<typeof GetSecretSchema>;

export async function getSecret(
  client: FunctionFlyClient,
  args: GetSecretArgs
) {
  logger.debug('getSecret called', { id: args.id });
  const secret = await client.getSecret(args.id);

  const passphrase = args.passphrase ?? getPassphrase();
  let plaintext: string | undefined;
  try {
    plaintext = await decryptWithPassphrase(
      {
        ciphertext: secret.encrypted_data.ciphertext,
        iv: secret.encrypted_data.iv,
        salt: secret.encrypted_data.salt,
        tag: secret.encrypted_data.tag,
        keyVersion: secret.encrypted_data.key_version,
      },
      passphrase
    );
  } catch (err) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Failed to decrypt secret: ${String(err)}. The secret value is encrypted and requires the correct passphrase.`,
        },
      ],
      isError: true,
    };
  }

  const result = {
    ...secret,
    decrypted_value: plaintext,
  };
  delete (result as Record<string, unknown>)['encrypted_data'];

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export const SetSecretSchema = z.object({
  name: z.string().min(1).max(255).describe('Secret name (unique within namespace)'),
  value: z.string().describe('Plaintext secret value to encrypt and store'),
  secret_type: z.enum(['api_key', 'oauth_token', 'password', 'certificate']).optional().default('api_key'),
  description: z.string().optional().describe('Description of the secret'),
  passphrase: z.string().optional().describe('Passphrase for encryption. Uses VAULT_PASSPHRASE env var if not provided.'),
  namespace: z.string().optional().default('default').describe('Namespace path (Pro+ plan required for non-default)'),
  scopes: z.array(z.string()).optional().describe('Access scopes for the secret'),
  metadata: z.record(z.string(), z.unknown()).optional().describe('Custom metadata'),
});

export type SetSecretArgs = z.infer<typeof SetSecretSchema>;

export async function setSecret(
  client: FunctionFlyClient,
  args: SetSecretArgs
) {
  logger.debug('setSecret called', { name: args.name, secret_type: args.secret_type });

  const passphrase = args.passphrase ?? getPassphrase();

  const encrypted = await encryptWithPassphrase(args.value, passphrase);

  const result = await client.createSecret({
    name: args.name,
    description: args.description,
    secret_type: args.secret_type,
    encrypted_data: toPayload(encrypted),
    scopes: args.scopes,
    metadata: args.metadata,
    namespace: args.namespace,
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export const DeleteSecretSchema = z.object({
  id: z.string().uuid().describe('Secret ID (UUID) to delete'),
});

export type DeleteSecretArgs = z.infer<typeof DeleteSecretSchema>;

export async function deleteSecret(
  client: FunctionFlyClient,
  args: DeleteSecretArgs
) {
  logger.debug('deleteSecret called', { id: args.id });
  await client.deleteSecret(args.id);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ message: `Secret ${args.id} deleted successfully` }, null, 2),
      },
    ],
  };
}
