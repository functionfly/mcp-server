export declare class FunctionFlyClient {
    private readonly client;
    private readonly timeout;
    constructor();
    private executeWithRetry;
    searchFunctions(params: {
        query?: string;
        author?: string;
        runtime?: string;
        page?: number;
        limit?: number;
    }): Promise<SearchFunctionsResponse>;
    getFunction(author: string, name: string): Promise<FunctionflyFunction>;
    executeFunction(author: string, name: string, input: unknown, version?: string): Promise<ExecutionResponse>;
    searchAgents(params: {
        query?: string;
        page?: number;
        limit?: number;
    }): Promise<SearchAgentsResponse>;
    executeAgent(agentId: string, input: unknown): Promise<unknown>;
    getUsage(params: {
        startDate?: string;
        endDate?: string;
        granularity?: string;
    }): Promise<UsageResponse>;
    getCosts(params: {
        startDate?: string;
        endDate?: string;
        groupBy?: string;
    }): Promise<CostsResponse>;
    publishFunction(author: string, name: string, version: string, manifest: FunctionManifest, source?: FunctionSourceInput, changelog?: ChangelogInput): Promise<PublishFunctionResponse>;
}
export declare class MCPError extends Error {
    readonly code: string;
    readonly mcpCode: number;
    constructor(code: string, message: string, mcpCode: number);
}
export interface FunctionflyFunction {
    id: string;
    author: string;
    name: string;
    version: string;
    runtime: string;
    description?: string;
    pricePerCall: number;
    visibility: string;
    verified: boolean;
    trustScore: number;
    downloads: number;
    createdAt: string;
    updatedAt: string;
}
export interface SearchFunctionsResponse {
    functions: FunctionflyFunction[];
    total: number;
    page: number;
    limit: number;
}
export interface ExecutionResponse {
    ok: boolean;
    data: unknown;
    cached: boolean;
    durationMs: number;
    version: string;
    executionID?: string;
    error?: {
        code: string;
        message: string;
        type: string;
    };
}
export interface SearchAgentsResponse {
    agents: Agent[];
    total: number;
    page: number;
    limit: number;
}
export interface Agent {
    id: string;
    author: string;
    name: string;
    description: string;
    version: string;
    pricePerCall: number;
    rating: number;
    downloads: number;
}
export interface UsageResponse {
    totalCalls: number;
    totalComputeMs: number;
    period: {
        start: string;
        end: string;
    };
    byFunction: Record<string, {
        calls: number;
        computeMs: number;
    }>;
}
export interface CostsResponse {
    totalUSD: number;
    period: {
        start: string;
        end: string;
    };
    byFunction: Record<string, {
        costUSD: number;
        calls: number;
    }>;
}
export interface FunctionManifest {
    runtime: string;
    entry?: string;
    public?: boolean;
    deterministic?: boolean;
    cache_ttl?: number;
    timeout_ms?: number;
    memory_mb?: number;
    description?: string;
    dependencies?: Record<string, string>;
    env?: Record<string, string>;
    input_schema?: Record<string, unknown>;
    output_schema?: Record<string, unknown>;
    idempotent?: boolean;
    side_effects?: string;
    capabilities?: string[];
    main_file?: string;
    type_check?: boolean;
    ts_config?: string;
    strict_mode?: boolean;
    skip_type_check?: boolean;
    include_packages?: boolean;
    package_cache?: string;
}
export interface FunctionSourceInput {
    code: string;
    files?: Record<string, string>;
    runtime: string;
    wasm_binary?: string;
    readme?: string;
}
export interface ChangelogChangeInput {
    component: string;
    field: string;
    before?: unknown;
    after?: unknown;
    description: string;
}
export interface ChangelogInput {
    category: string;
    title: string;
    description: string;
    changes?: ChangelogChangeInput[];
}
export interface PublishFunctionResponse {
    ok: boolean;
    function: string;
    version: string;
    message?: string;
    verification_status?: string;
}
//# sourceMappingURL=client.d.ts.map