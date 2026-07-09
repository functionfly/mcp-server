import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
export declare const SearchFunctionsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    runtime: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    query?: string | undefined;
    author?: string | undefined;
    runtime?: string | undefined;
}, {
    query?: string | undefined;
    author?: string | undefined;
    runtime?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type SearchFunctionsArgs = z.infer<typeof SearchFunctionsSchema>;
export declare function searchFunctions(client: FunctionFlyClient, args: SearchFunctionsArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const GetFunctionSchema: z.ZodObject<{
    author: z.ZodString;
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    author: string;
    name: string;
}, {
    author: string;
    name: string;
}>;
export type GetFunctionArgs = z.infer<typeof GetFunctionSchema>;
export declare function getFunction(client: FunctionFlyClient, args: GetFunctionArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const ExecuteFunctionSchema: z.ZodObject<{
    author: z.ZodString;
    name: z.ZodString;
    version: z.ZodOptional<z.ZodString>;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    author: string;
    name: string;
    input: Record<string, unknown>;
    version?: string | undefined;
}, {
    author: string;
    name: string;
    input: Record<string, unknown>;
    version?: string | undefined;
}>;
export type ExecuteFunctionArgs = z.infer<typeof ExecuteFunctionSchema>;
export declare function executeFunction(client: FunctionFlyClient, args: ExecuteFunctionArgs): Promise<{
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
export declare const PublishFunctionSchema: z.ZodObject<{
    author: z.ZodString;
    name: z.ZodString;
    version: z.ZodString;
    manifest: z.ZodObject<{
        runtime: z.ZodString;
        entry: z.ZodOptional<z.ZodString>;
        public: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        deterministic: z.ZodOptional<z.ZodBoolean>;
        cache_ttl: z.ZodOptional<z.ZodNumber>;
        timeout_ms: z.ZodOptional<z.ZodNumber>;
        memory_mb: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        input_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        output_schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        idempotent: z.ZodOptional<z.ZodBoolean>;
        side_effects: z.ZodOptional<z.ZodString>;
        capabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        runtime: string;
        public: boolean;
        env?: Record<string, string> | undefined;
        entry?: string | undefined;
        deterministic?: boolean | undefined;
        cache_ttl?: number | undefined;
        timeout_ms?: number | undefined;
        memory_mb?: number | undefined;
        description?: string | undefined;
        dependencies?: Record<string, string> | undefined;
        input_schema?: Record<string, unknown> | undefined;
        output_schema?: Record<string, unknown> | undefined;
        idempotent?: boolean | undefined;
        side_effects?: string | undefined;
        capabilities?: string[] | undefined;
    }, {
        runtime: string;
        env?: Record<string, string> | undefined;
        entry?: string | undefined;
        public?: boolean | undefined;
        deterministic?: boolean | undefined;
        cache_ttl?: number | undefined;
        timeout_ms?: number | undefined;
        memory_mb?: number | undefined;
        description?: string | undefined;
        dependencies?: Record<string, string> | undefined;
        input_schema?: Record<string, unknown> | undefined;
        output_schema?: Record<string, unknown> | undefined;
        idempotent?: boolean | undefined;
        side_effects?: string | undefined;
        capabilities?: string[] | undefined;
    }>;
    source: z.ZodOptional<z.ZodObject<{
        code: z.ZodString;
        files: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        runtime: z.ZodString;
        wasm_binary: z.ZodOptional<z.ZodString>;
        readme: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        runtime: string;
        files?: Record<string, string> | undefined;
        wasm_binary?: string | undefined;
        readme?: string | undefined;
    }, {
        code: string;
        runtime: string;
        files?: Record<string, string> | undefined;
        wasm_binary?: string | undefined;
        readme?: string | undefined;
    }>>;
    changelog: z.ZodOptional<z.ZodObject<{
        category: z.ZodEnum<["feature", "bug_fix", "performance", "breaking", "docs", "other"]>;
        title: z.ZodString;
        description: z.ZodString;
        changes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            component: z.ZodString;
            field: z.ZodString;
            before: z.ZodOptional<z.ZodUnknown>;
            after: z.ZodOptional<z.ZodUnknown>;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            component: string;
            field: string;
            before?: unknown;
            after?: unknown;
        }, {
            description: string;
            component: string;
            field: string;
            before?: unknown;
            after?: unknown;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        category: "feature" | "bug_fix" | "performance" | "breaking" | "docs" | "other";
        title: string;
        changes?: {
            description: string;
            component: string;
            field: string;
            before?: unknown;
            after?: unknown;
        }[] | undefined;
    }, {
        description: string;
        category: "feature" | "bug_fix" | "performance" | "breaking" | "docs" | "other";
        title: string;
        changes?: {
            description: string;
            component: string;
            field: string;
            before?: unknown;
            after?: unknown;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    author: string;
    name: string;
    version: string;
    manifest: {
        runtime: string;
        public: boolean;
        env?: Record<string, string> | undefined;
        entry?: string | undefined;
        deterministic?: boolean | undefined;
        cache_ttl?: number | undefined;
        timeout_ms?: number | undefined;
        memory_mb?: number | undefined;
        description?: string | undefined;
        dependencies?: Record<string, string> | undefined;
        input_schema?: Record<string, unknown> | undefined;
        output_schema?: Record<string, unknown> | undefined;
        idempotent?: boolean | undefined;
        side_effects?: string | undefined;
        capabilities?: string[] | undefined;
    };
    source?: {
        code: string;
        runtime: string;
        files?: Record<string, string> | undefined;
        wasm_binary?: string | undefined;
        readme?: string | undefined;
    } | undefined;
    changelog?: {
        description: string;
        category: "feature" | "bug_fix" | "performance" | "breaking" | "docs" | "other";
        title: string;
        changes?: {
            description: string;
            component: string;
            field: string;
            before?: unknown;
            after?: unknown;
        }[] | undefined;
    } | undefined;
}, {
    author: string;
    name: string;
    version: string;
    manifest: {
        runtime: string;
        env?: Record<string, string> | undefined;
        entry?: string | undefined;
        public?: boolean | undefined;
        deterministic?: boolean | undefined;
        cache_ttl?: number | undefined;
        timeout_ms?: number | undefined;
        memory_mb?: number | undefined;
        description?: string | undefined;
        dependencies?: Record<string, string> | undefined;
        input_schema?: Record<string, unknown> | undefined;
        output_schema?: Record<string, unknown> | undefined;
        idempotent?: boolean | undefined;
        side_effects?: string | undefined;
        capabilities?: string[] | undefined;
    };
    source?: {
        code: string;
        runtime: string;
        files?: Record<string, string> | undefined;
        wasm_binary?: string | undefined;
        readme?: string | undefined;
    } | undefined;
    changelog?: {
        description: string;
        category: "feature" | "bug_fix" | "performance" | "breaking" | "docs" | "other";
        title: string;
        changes?: {
            description: string;
            component: string;
            field: string;
            before?: unknown;
            after?: unknown;
        }[] | undefined;
    } | undefined;
}>;
export type PublishFunctionArgs = z.infer<typeof PublishFunctionSchema>;
export declare function publishFunction(client: FunctionFlyClient, args: PublishFunctionArgs): Promise<{
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
//# sourceMappingURL=registry.d.ts.map