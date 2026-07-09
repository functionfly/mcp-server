"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteFunctionSchema = exports.GetFunctionSchema = exports.SearchFunctionsSchema = void 0;
exports.searchFunctions = searchFunctions;
exports.getFunction = getFunction;
exports.executeFunction = executeFunction;
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
//# sourceMappingURL=registry.js.map