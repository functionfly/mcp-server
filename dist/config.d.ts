import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    apiKey: z.ZodString;
    apiUrl: z.ZodDefault<z.ZodString>;
    executionTimeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    apiKey: string;
    apiUrl: string;
    executionTimeoutMs: number;
}, {
    apiKey: string;
    apiUrl?: string | undefined;
    executionTimeoutMs?: number | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
export declare function loadConfig(): Config;
export declare function resetConfigCache(): void;
export {};
//# sourceMappingURL=config.d.ts.map