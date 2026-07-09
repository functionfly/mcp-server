"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSecretSchema = exports.SetSecretSchema = exports.GetSecretSchema = exports.ListSecretsSchema = void 0;
exports.listSecrets = listSecrets;
exports.getSecret = getSecret;
exports.setSecret = setSecret;
exports.deleteSecret = deleteSecret;
const zod_1 = require("zod");
const logger_js_1 = require("../logger.js");
const vault_crypto_js_1 = require("../vault-crypto.js");
exports.ListSecretsSchema = zod_1.z.object({
    namespace: zod_1.z.string().optional().describe('Namespace path (e.g. "production/secrets"). Requires Pro+ plan.'),
    limit: zod_1.z.number().int().min(1).max(100).optional().default(20),
    offset: zod_1.z.number().int().min(0).optional().default(0),
});
async function listSecrets(client, args) {
    logger_js_1.logger.debug('listSecrets called', args);
    const result = await client.listSecrets({
        namespace: args.namespace,
        limit: args.limit,
        offset: args.offset,
    });
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
exports.GetSecretSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().describe('Secret ID (UUID)'),
    passphrase: zod_1.z.string().optional().describe('Passphrase to decrypt the secret. Uses VAULT_PASSPHRASE env var if not provided.'),
});
async function getSecret(client, args) {
    logger_js_1.logger.debug('getSecret called', { id: args.id });
    const secret = await client.getSecret(args.id);
    const passphrase = args.passphrase ?? (0, vault_crypto_js_1.getPassphrase)();
    let plaintext;
    try {
        plaintext = await (0, vault_crypto_js_1.decryptWithPassphrase)({
            ciphertext: secret.encrypted_data.ciphertext,
            iv: secret.encrypted_data.iv,
            salt: secret.encrypted_data.salt,
            tag: secret.encrypted_data.tag,
            keyVersion: secret.encrypted_data.key_version,
        }, passphrase);
    }
    catch (err) {
        return {
            content: [
                {
                    type: 'text',
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
    delete result['encrypted_data'];
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
exports.SetSecretSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).describe('Secret name (unique within namespace)'),
    value: zod_1.z.string().describe('Plaintext secret value to encrypt and store'),
    secret_type: zod_1.z.enum(['api_key', 'oauth_token', 'password', 'certificate']).optional().default('api_key'),
    description: zod_1.z.string().optional().describe('Description of the secret'),
    passphrase: zod_1.z.string().optional().describe('Passphrase for encryption. Uses VAULT_PASSPHRASE env var if not provided.'),
    namespace: zod_1.z.string().optional().default('default').describe('Namespace path (Pro+ plan required for non-default)'),
    scopes: zod_1.z.array(zod_1.z.string()).optional().describe('Access scopes for the secret'),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional().describe('Custom metadata'),
});
async function setSecret(client, args) {
    logger_js_1.logger.debug('setSecret called', { name: args.name, secret_type: args.secret_type });
    const passphrase = args.passphrase ?? (0, vault_crypto_js_1.getPassphrase)();
    const encrypted = await (0, vault_crypto_js_1.encryptWithPassphrase)(args.value, passphrase);
    const result = await client.createSecret({
        name: args.name,
        description: args.description,
        secret_type: args.secret_type,
        encrypted_data: (0, vault_crypto_js_1.toPayload)(encrypted),
        scopes: args.scopes,
        metadata: args.metadata,
        namespace: args.namespace,
    });
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
exports.DeleteSecretSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().describe('Secret ID (UUID) to delete'),
});
async function deleteSecret(client, args) {
    logger_js_1.logger.debug('deleteSecret called', { id: args.id });
    await client.deleteSecret(args.id);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({ message: `Secret ${args.id} deleted successfully` }, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=vault.js.map