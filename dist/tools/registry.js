"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishFunctionSchema = exports.ExecuteFunctionSchema = exports.GetFunctionSchema = exports.SearchFunctionsSchema = void 0;
exports.searchFunctions = searchFunctions;
exports.getFunction = getFunction;
exports.executeFunction = executeFunction;
exports.publishFunction = publishFunction;
const zod_1 = require("zod");
const logger_js_1 = require("../logger.js");
exports.SearchFunctionsSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    runtime: zod_1.z.string().optional(),
    page: zod_1.z.number().int().min(1).optional().default(1),
    limit: zod_1.z.number().int().min(1).max(100).optional().default(20),
});
async function searchFunctions(client, args) {
    logger_js_1.logger.debug('searchFunctions called', args);
    const result = await client.searchFunctions({
        query: args.query,
        author: args.author,
        runtime: args.runtime,
        page: args.page,
        limit: args.limit,
    });
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
exports.GetFunctionSchema = zod_1.z.object({
    author: zod_1.z.string(),
    name: zod_1.z.string(),
});
async function getFunction(client, args) {
    logger_js_1.logger.debug('getFunction called', args);
    const fn = await client.getFunction(args.author, args.name);
    return {
        content: [{ type: 'text', text: JSON.stringify(fn, null, 2) }],
    };
}
exports.ExecuteFunctionSchema = zod_1.z.object({
    author: zod_1.z.string(),
    name: zod_1.z.string(),
    version: zod_1.z.string().optional(),
    input: zod_1.z.record(zod_1.z.unknown()),
});
async function executeFunction(client, args) {
    logger_js_1.logger.debug('executeFunction called', { author: args.author, name: args.name });
    const result = await client.executeFunction(args.author, args.name, args.input, args.version);
    if (!result.ok) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Execution error: ${result.error?.message ?? 'unknown error'}`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    result: result.data,
                    durationMs: result.durationMs,
                    version: result.version,
                    executionID: result.executionID,
                    cached: result.cached,
                }, null, 2),
            },
        ],
    };
}
exports.PublishFunctionSchema = zod_1.z.object({
    author: zod_1.z.string().describe('Author username'),
    name: zod_1.z
        .string()
        .regex(/^[a-z0-9-]+$/, 'Name must be lowercase letters, numbers, and hyphens only')
        .describe('Function name'),
    version: zod_1.z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, 'Version must be valid semver (e.g. 1.2.3)')
        .describe('Version to publish (semver)'),
    manifest: zod_1.z.object({
        runtime: zod_1.z.string().describe('Runtime: node22, python3.11, python3.12, bun, deno, wasm, etc.'),
        entry: zod_1.z.string().optional().describe('Entry file path'),
        public: zod_1.z.boolean().optional().default(true).describe('Whether function is publicly discoverable'),
        deterministic: zod_1.z.boolean().optional().describe('Whether function is deterministic (enables caching)'),
        cache_ttl: zod_1.z.number().int().optional().describe('Cache TTL in seconds'),
        timeout_ms: zod_1.z.number().int().optional().describe('Execution timeout in milliseconds'),
        memory_mb: zod_1.z.number().int().optional().describe('Memory limit in MB'),
        description: zod_1.z.string().optional().describe('Function description'),
        dependencies: zod_1.z.record(zod_1.z.string()).optional().describe('npm/pip dependencies'),
        env: zod_1.z.record(zod_1.z.string()).optional().describe('Environment variables'),
        input_schema: zod_1.z.record(zod_1.z.unknown()).optional().describe('JSON Schema for input validation'),
        output_schema: zod_1.z.record(zod_1.z.unknown()).optional().describe('JSON Schema for output validation'),
        idempotent: zod_1.z.boolean().optional().describe('Whether function is idempotent'),
        side_effects: zod_1.z.string().optional().describe('Side effects description'),
        capabilities: zod_1.z.array(zod_1.z.string()).optional().describe('Capabilities (e.g. ["browser","network"])'),
    }),
    source: zod_1.z
        .object({
        code: zod_1.z.string().describe('Source code for the function'),
        files: zod_1.z.record(zod_1.z.string()).optional().describe('Additional files (e.g. package.json)'),
        runtime: zod_1.z.string().describe('Runtime: node22, python3.11, python3.12, bun, deno, wasm'),
        wasm_binary: zod_1.z.string().optional().describe('Base64-encoded WASM binary for wasm runtime'),
        readme: zod_1.z.string().optional().describe('README documentation'),
    })
        .optional(),
    changelog: zod_1.z
        .object({
        category: zod_1.z.enum(['feature', 'bug_fix', 'performance', 'breaking', 'docs', 'other']),
        title: zod_1.z.string().describe('Short summary of changes'),
        description: zod_1.z.string().describe('Detailed description'),
        changes: zod_1.z
            .array(zod_1.z.object({
            component: zod_1.z.string().describe('Component changed (e.g. input schema, output schema)'),
            field: zod_1.z.string().describe('Field changed (e.g. timeout, memory)'),
            before: zod_1.z.unknown().optional(),
            after: zod_1.z.unknown().optional(),
            description: zod_1.z.string().describe('Human-readable description of the change'),
        }))
            .optional(),
    })
        .optional(),
});
async function publishFunction(client, args) {
    logger_js_1.logger.debug('publishFunction called', { author: args.author, name: args.name, version: args.version });
    const result = await client.publishFunction(args.author, args.name, args.version, args.manifest, args.source, args.changelog);
    if (!result.ok) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Publish failed: ${result.message ?? 'unknown error'}`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=registry.js.map