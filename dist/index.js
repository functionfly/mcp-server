"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const config_js_1 = require("./config.js");
const logger_js_1 = require("./logger.js");
const client_js_1 = require("./client.js");
const registry_js_1 = require("./tools/registry.js");
const agents_js_1 = require("./tools/agents.js");
const analytics_js_1 = require("./tools/analytics.js");
const config = (0, config_js_1.loadConfig)();
const client = new client_js_1.FunctionFlyClient();
const TOOL_DEFINITIONS = [
    {
        name: 'registry_search_functions',
        description: 'Search the public FunctionFly function registry. Returns a list of functions matching the query with metadata like author, runtime, trust score, and price.',
        inputSchema: registry_js_1.SearchFunctionsSchema,
        handler: async (cli, args) => (0, registry_js_1.searchFunctions)(cli, args),
    },
    {
        name: 'registry_get_function',
        description: 'Get detailed metadata for a specific FunctionFly function by its author and name. Returns version, runtime, trust score, pricing, and verification status.',
        inputSchema: registry_js_1.GetFunctionSchema,
        handler: async (cli, args) => (0, registry_js_1.getFunction)(cli, args),
    },
    {
        name: 'registry_execute_function',
        description: 'Execute a published FunctionFly function and return its result. Works with public and private functions. Supports version pinning via the version argument.',
        inputSchema: registry_js_1.ExecuteFunctionSchema,
        handler: async (cli, args) => (0, registry_js_1.executeFunction)(cli, args),
    },
    {
        name: 'agents_search',
        description: 'Search the FunctionFly agent marketplace. Returns agents with ratings, pricing, and download counts.',
        inputSchema: agents_js_1.SearchAgentsSchema,
        handler: async (cli, args) => (0, agents_js_1.searchAgents)(cli, args),
    },
    {
        name: 'agents_execute',
        description: "Execute a FunctionFly agent by ID. Pass an input payload that the agent will process. Returns the agent's output.",
        inputSchema: agents_js_1.ExecuteAgentSchema,
        handler: async (cli, args) => (0, agents_js_1.executeAgent)(cli, args),
    },
    {
        name: 'analytics_get_usage',
        description: 'Get usage metrics for the authenticated tenant. Returns total calls and compute time broken down by function for the specified period.',
        inputSchema: analytics_js_1.GetUsageSchema,
        handler: async (cli, args) => (0, analytics_js_1.getUsage)(cli, args),
    },
    {
        name: 'analytics_get_costs',
        description: 'Get cost breakdown for the authenticated tenant. Returns total USD spent broken down by function for the specified period.',
        inputSchema: analytics_js_1.GetCostsSchema,
        handler: async (cli, args) => (0, analytics_js_1.getCosts)(cli, args),
    },
];
function buildToolSchema(def) {
    return {
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema,
    };
}
const server = new index_js_1.Server({
    name: 'functionfly-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: TOOL_DEFINITIONS.map(buildToolSchema),
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    const def = TOOL_DEFINITIONS.find((t) => t.name === name);
    if (!def) {
        logger_js_1.logger.warn(`Unknown tool called: ${name}`);
        return {
            content: [
                {
                    type: 'text',
                    text: `Error: Unknown tool "${name}"`,
                },
            ],
            isError: true,
        };
    }
    try {
        logger_js_1.logger.info(`Calling tool: ${name}`);
        const parsed = def.inputSchema.safeParse(args);
        if (!parsed.success) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Invalid arguments: ${parsed.error.message}`,
                    },
                ],
                isError: true,
            };
        }
        return await def.handler(client, parsed.data);
    }
    catch (err) {
        if (err instanceof client_js_1.MCPError) {
            logger_js_1.logger.warn(`Tool ${name} returned MCP error: ${err.message}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${err.message}`,
                    },
                ],
                isError: true,
            };
        }
        logger_js_1.logger.error(`Tool ${name} threw unexpected error`, {
            error: String(err),
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Internal error: ${String(err)}`,
                },
            ],
            isError: true,
        };
    }
});
server.setRequestHandler(types_js_1.InitializeRequestSchema, async (request) => {
    const { protocolVersion } = request.params;
    logger_js_1.logger.debug('MCP client initializing', { protocolVersion });
    return {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: {
            name: 'functionfly-mcp-server',
            version: '1.0.0',
        },
    };
});
async function main() {
    logger_js_1.logger.info('Starting FunctionFly MCP server', {
        apiUrl: config.apiUrl,
        executionTimeoutMs: config.executionTimeoutMs,
    });
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    logger_js_1.logger.info('FunctionFly MCP server connected');
}
main().catch((err) => {
    logger_js_1.logger.error('Fatal error', { error: String(err) });
    process.exit(1);
});
//# sourceMappingURL=index.js.map