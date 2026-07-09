import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
export declare const SearchAgentsSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    query?: string | undefined;
}, {
    query?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type SearchAgentsArgs = z.infer<typeof SearchAgentsSchema>;
export declare function searchAgents(client: FunctionFlyClient, args: SearchAgentsArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const ExecuteAgentSchema: z.ZodObject<{
    agentId: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    input: Record<string, unknown>;
    agentId: string;
}, {
    input: Record<string, unknown>;
    agentId: string;
}>;
export type ExecuteAgentArgs = z.infer<typeof ExecuteAgentSchema>;
export declare function executeAgent(client: FunctionFlyClient, args: ExecuteAgentArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=agents.d.ts.map