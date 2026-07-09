import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
export declare const ListSecretsSchema: z.ZodObject<{
    namespace: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    namespace?: string | undefined;
}, {
    limit?: number | undefined;
    namespace?: string | undefined;
    offset?: number | undefined;
}>;
export type ListSecretsArgs = z.infer<typeof ListSecretsSchema>;
export declare function listSecrets(client: FunctionFlyClient, args: ListSecretsArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const GetSecretSchema: z.ZodObject<{
    id: z.ZodString;
    passphrase: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    passphrase?: string | undefined;
}, {
    id: string;
    passphrase?: string | undefined;
}>;
export type GetSecretArgs = z.infer<typeof GetSecretSchema>;
export declare function getSecret(client: FunctionFlyClient, args: GetSecretArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    isError?: undefined;
}>;
export declare const SetSecretSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodString;
    secret_type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["api_key", "oauth_token", "password", "certificate"]>>>;
    description: z.ZodOptional<z.ZodString>;
    passphrase: z.ZodOptional<z.ZodString>;
    namespace: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    scopes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    value: string;
    name: string;
    namespace: string;
    secret_type: "api_key" | "password" | "oauth_token" | "certificate";
    description?: string | undefined;
    passphrase?: string | undefined;
    scopes?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    value: string;
    name: string;
    description?: string | undefined;
    namespace?: string | undefined;
    passphrase?: string | undefined;
    secret_type?: "api_key" | "password" | "oauth_token" | "certificate" | undefined;
    scopes?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type SetSecretArgs = z.infer<typeof SetSecretSchema>;
export declare function setSecret(client: FunctionFlyClient, args: SetSecretArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const DeleteSecretSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type DeleteSecretArgs = z.infer<typeof DeleteSecretSchema>;
export declare function deleteSecret(client: FunctionFlyClient, args: DeleteSecretArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=vault.d.ts.map