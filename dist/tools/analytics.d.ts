import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
export declare const GetUsageSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    granularity: z.ZodOptional<z.ZodEnum<["day", "week", "month"]>>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    granularity?: "day" | "week" | "month" | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    granularity?: "day" | "week" | "month" | undefined;
}>;
export type GetUsageArgs = z.infer<typeof GetUsageSchema>;
export declare function getUsage(client: FunctionFlyClient, args: GetUsageArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export declare const GetCostsSchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    groupBy: z.ZodOptional<z.ZodEnum<["function", "day"]>>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    groupBy?: "function" | "day" | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    groupBy?: "function" | "day" | undefined;
}>;
export type GetCostsArgs = z.infer<typeof GetCostsSchema>;
export declare function getCosts(client: FunctionFlyClient, args: GetCostsArgs): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
//# sourceMappingURL=analytics.d.ts.map