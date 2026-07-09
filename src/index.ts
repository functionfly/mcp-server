import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './config.js';
import { logger } from './logger.js';
import { FunctionFlyClient, MCPError } from './client.js';
import {
  SearchFunctionsSchema,
  SearchFunctionsArgs,
  GetFunctionSchema,
  GetFunctionArgs,
  ExecuteFunctionSchema,
  ExecuteFunctionArgs,
  PublishFunctionSchema,
  PublishFunctionArgs,
  searchFunctions,
  getFunction,
  executeFunction,
  publishFunction,
} from './tools/registry.js';
import {
  SearchAgentsSchema,
  SearchAgentsArgs,
  ExecuteAgentSchema,
  ExecuteAgentArgs,
  searchAgents,
  executeAgent,
} from './tools/agents.js';
import {
  GetUsageSchema,
  GetUsageArgs,
  GetCostsSchema,
  GetCostsArgs,
  getUsage,
  getCosts,
} from './tools/analytics.js';
import { z } from 'zod';

const config = loadConfig();
const client = new FunctionFlyClient();

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (
    client: FunctionFlyClient,
    args: unknown
  ) => Promise<{ content: { type: 'text'; text: string }[]; isError?: boolean }>;
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'registry_search_functions',
    description:
      'Search the public FunctionFly function registry. Returns a list of functions matching the query with metadata like author, runtime, trust score, and price.',
    inputSchema: SearchFunctionsSchema,
    handler: async (cli, args) => searchFunctions(cli, args as SearchFunctionsArgs),
  },
  {
    name: 'registry_get_function',
    description:
      'Get detailed metadata for a specific FunctionFly function by its author and name. Returns version, runtime, trust score, pricing, and verification status.',
    inputSchema: GetFunctionSchema,
    handler: async (cli, args) => getFunction(cli, args as GetFunctionArgs),
  },
  {
    name: 'registry_execute_function',
    description:
      'Execute a published FunctionFly function and return its result. Works with public and private functions. Supports version pinning via the version argument.',
    inputSchema: ExecuteFunctionSchema,
    handler: async (cli, args) => executeFunction(cli, args as ExecuteFunctionArgs),
  },
  {
    name: 'registry_publish_function',
    description:
      'Publish a new function or function version to the FunctionFly registry. Requires authentication. Supports source code upload, manifest configuration, and optional changelog.',
    inputSchema: PublishFunctionSchema,
    handler: async (cli, args) => publishFunction(cli, args as PublishFunctionArgs),
  },
  {
    name: 'agents_search',
    description:
      'Search the FunctionFly agent marketplace. Returns agents with ratings, pricing, and download counts.',
    inputSchema: SearchAgentsSchema,
    handler: async (cli, args) => searchAgents(cli, args as SearchAgentsArgs),
  },
  {
    name: 'agents_execute',
    description:
      "Execute a FunctionFly agent by ID. Pass an input payload that the agent will process. Returns the agent's output.",
    inputSchema: ExecuteAgentSchema,
    handler: async (cli, args) => executeAgent(cli, args as ExecuteAgentArgs),
  },
  {
    name: 'analytics_get_usage',
    description:
      'Get usage metrics for the authenticated tenant. Returns total calls and compute time broken down by function for the specified period.',
    inputSchema: GetUsageSchema,
    handler: async (cli, args) => getUsage(cli, args as GetUsageArgs),
  },
  {
    name: 'analytics_get_costs',
    description:
      'Get cost breakdown for the authenticated tenant. Returns total USD spent broken down by function for the specified period.',
    inputSchema: GetCostsSchema,
    handler: async (cli, args) => getCosts(cli, args as GetCostsArgs),
  },
];

function buildToolSchema(def: ToolDefinition): Tool {
  return {
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema as unknown as Tool['inputSchema'],
  };
}

const server = new Server(
  {
    name: 'functionfly-mcp-server',
    version: '1.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_DEFINITIONS.map(buildToolSchema),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  const def = TOOL_DEFINITIONS.find((t) => t.name === name);
  if (!def) {
    logger.warn(`Unknown tool called: ${name}`);
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error: Unknown tool "${name}"`,
        },
      ],
      isError: true,
    };
  }

  try {
    logger.info(`Calling tool: ${name}`);
    const parsed = def.inputSchema.safeParse(args);
    if (!parsed.success) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Invalid arguments: ${parsed.error.message}`,
          },
        ],
        isError: true,
      };
    }
    return await def.handler(client, parsed.data);
  } catch (err) {
    if (err instanceof MCPError) {
      logger.warn(`Tool ${name} returned MCP error: ${err.message}`);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${err.message}`,
          },
        ],
        isError: true,
      };
    }

    logger.error(`Tool ${name} threw unexpected error`, {
      error: String(err),
    });
    return {
      content: [
        {
          type: 'text' as const,
          text: `Internal error: ${String(err)}`,
        },
      ],
      isError: true,
    };
  }
});

server.setRequestHandler(InitializeRequestSchema, async (request) => {
  const { protocolVersion } = request.params;
  logger.debug('MCP client initializing', { protocolVersion });
  return {
    protocolVersion,
    capabilities: { tools: {} },
    serverInfo: {
      name: 'functionfly-mcp-server',
      version: '1.1.0',
    },
  };
});

async function main() {
  logger.info('Starting FunctionFly MCP server', {
    apiUrl: config.apiUrl,
    executionTimeoutMs: config.executionTimeoutMs,
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('FunctionFly MCP server connected');
}

main().catch((err) => {
  logger.error('Fatal error', { error: String(err) });
  process.exit(1);
});
