"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSalt = generateSalt;
exports.generateIV = generateIV;
exports.encryptWithPassphrase = encryptWithPassphrase;
exports.decryptWithPassphrase = decryptWithPassphrase;
exports.toPayload = toPayload;
exports.getPassphrase = getPassphrase;
const crypto_1 = require("crypto");
const PBKDF2_ITERATIONS_V1 = 100_000;
const PBKDF2_ITERATIONS_V2 = 600_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;
function toBase64(buf) {
    return buf.toString('base64');
}
function fromBase64(base64) {
    return Buffer.from(base64, 'base64');
}
function deriveKey(passphrase, salt, iterations) {
    return (0, crypto_1.pbkdf2Sync)(passphrase, salt, iterations, KEY_LENGTH, 'sha256');
}
function generateSalt() {
    return (0, crypto_1.randomBytes)(SALT_LENGTH);
}
function generateIV() {
    return (0, crypto_1.randomBytes)(IV_LENGTH);
}
async function encryptWithPassphrase(plaintext, passphrase) {
    const salt = generateSalt();
    const iv = generateIV();
    const key = deriveKey(passphrase, salt, PBKDF2_ITERATIONS_V2);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
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
async function decryptWithPassphrase(data, passphrase) {
    const iterations = data.keyVersion === 2 ? PBKDF2_ITERATIONS_V2 : PBKDF2_ITERATIONS_V1;
    const salt = fromBase64(data.salt);
    const iv = fromBase64(data.iv);
    const ciphertext = fromBase64(data.ciphertext);
    const tag = fromBase64(data.tag);
    const key = deriveKey(passphrase, salt, iterations);
    const combined = Buffer.concat([ciphertext, tag]);
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([
        decipher.update(combined),
        decipher.final(),
    ]);
    return plaintext.toString('utf8');
}
function toPayload(data) {
    return {
        ciphertext: data.ciphertext,
        iv: data.iv,
        salt: data.salt,
        tag: data.tag,
        key_version: data.keyVersion,
    };
}
function getPassphrase() {
    const passphrase = process.env['VAULT_PASSPHRASE'];
    if (!passphrase) {
        throw new Error('VAULT_PASSPHRASE environment variable is required for vault operations');
    }
    return passphrase;
}
//# sourceMappingURL=vault-crypto.js.map