export interface EncryptedData {
    ciphertext: string;
    iv: string;
    salt: string;
    tag: string;
    keyVersion: number;
}
export declare function generateSalt(): Buffer;
export declare function generateIV(): Buffer;
export declare function encryptWithPassphrase(plaintext: string, passphrase: string): Promise<EncryptedData>;
export declare function decryptWithPassphrase(data: EncryptedData, passphrase: string): Promise<string>;
export interface VaultEncryptedPayload {
    ciphertext: string;
    iv: string;
    salt: string;
    tag: string;
    key_version: number;
}
export declare function toPayload(data: EncryptedData): VaultEncryptedPayload;
export declare function getPassphrase(): string;
//# sourceMappingURL=vault-crypto.d.ts.map