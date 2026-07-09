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
//# sourceMappingURL=registry.d.ts.map