import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
export declare const ListStateFabricsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
}, {
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListStateFabricsArgs = z.infer<typeof ListStateFabricsSchema>;
export declare function listStateFabrics(client: FunctionFlyClient, args: ListStateFabricsArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const GetStateFabricSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type GetStateFabricArgs = z.infer<typeof GetStateFabricSchema>;
export declare function getStateFabric(client: FunctionFlyClient, args: GetStateFabricArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const ListPipelinesSchema: z.ZodObject<{
    fabricId: z.ZodString;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    fabricId: string;
}, {
    fabricId: string;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListPipelinesArgs = z.infer<typeof ListPipelinesSchema>;
export declare function listStateFabricPipelines(client: FunctionFlyClient, args: ListPipelinesArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const ExecutePipelineSchema: z.ZodObject<{
    fabricId: z.ZodString;
    pipelineId: z.ZodString;
    input: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, "strip", z.ZodTypeAny, {
    input: Record<string, unknown>;
    fabricId: string;
    pipelineId: string;
}, {
    fabricId: string;
    pipelineId: string;
    input?: Record<string, unknown> | undefined;
}>;
export type ExecutePipelineArgs = z.infer<typeof ExecutePipelineSchema>;
export declare function executeStateFabricPipeline(client: FunctionFlyClient, args: ExecutePipelineArgs): Promise<{
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
//# sourceMappingURL=statefabric.d.ts.map