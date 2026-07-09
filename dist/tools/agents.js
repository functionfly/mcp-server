"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteAgentSchema = exports.SearchAgentsSchema = void 0;
exports.searchAgents = searchAgents;
exports.executeAgent = executeAgent;
const zod_1 = require("zod");
const logger_js_1 = require("../logger.js");
exports.SearchAgentsSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    page: zod_1.z.number().int().min(1).optional().default(1),
    limit: zod_1.z.number().int().min(1).max(100).optional().default(20),
});
async function searchAgents(client, args) {
    logger_js_1.logger.debug('searchAgents called', args);
    const result = await client.searchAgents({
        query: args.query,
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
exports.ExecuteAgentSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
    input: zod_1.z.record(zod_1.z.unknown()),
});
async function executeAgent(client, args) {
    logger_js_1.logger.debug('executeAgent called', { agentId: args.agentId });
    const result = await client.executeAgent(args.agentId, args.input);
    return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
}
//# sourceMappingURL=agents.js.map