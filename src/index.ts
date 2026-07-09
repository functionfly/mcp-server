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
import {
  ListSecretsSchema,
  ListSecretsArgs,
  GetSecretSchema,
  GetSecretArgs,
  SetSecretSchema,
  SetSecretArgs,
  DeleteSecretSchema,
  DeleteSecretArgs,
  listSecrets,
  getSecret,
  setSecret,
  deleteSecret,
} from './tools/vault.js';
import {
  ListStateFabricsSchema,
  ListStateFabricsArgs,
  GetStateFabricSchema,
  GetStateFabricArgs,
  ListPipelinesSchema,
  ListPipelinesArgs,
  ExecutePipelineSchema,
  ExecutePipelineArgs,
  listStateFabrics,
  getStateFabric,
  listStateFabricPipelines,
  executeStateFabricPipeline,
} from './tools/statefabric.js';
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
  {
    name: 'vault_list_secrets',
    description:
      'List secrets in the vault. Returns secret metadata (id, name, type, namespace, timestamps) without encrypted values. Requires Pro+ plan for namespaces.',
    inputSchema: ListSecretsSchema,
    handler: async (cli, args) => listSecrets(cli, args as ListSecretsArgs),
  },
  {
    name: 'vault_get_secret',
    description:
      'Get a secret by ID and decrypt it. Uses VAULT_PASSPHRASE env var (or passphrase argument) to decrypt client-side. Returns decrypted value. Zero-knowledge: the server never sees the plaintext.',
    inputSchema: GetSecretSchema,
    handler: async (cli, args) => getSecret(cli, args as GetSecretArgs),
  },
  {
    name: 'vault_set_secret',
    description:
      'Create a new secret in the vault. The secret value is encrypted client-side using VAULT_PASSPHRASE env var (or passphrase argument) with AES-256-GCM + PBKDF2 before being sent. Zero-knowledge: the server never sees the plaintext.',
    inputSchema: SetSecretSchema,
    handler: async (cli, args) => setSecret(cli, args as SetSecretArgs),
  },
  {
    name: 'vault_delete_secret',
    description:
      'Delete a secret from the vault by ID. This action is irreversible.',
    inputSchema: DeleteSecretSchema,
    handler: async (cli, args) => deleteSecret(cli, args as DeleteSecretArgs),
  },
  {
    name: 'statefabric_list_fabrics',
    description:
      'List all stateful workflows (StateFabrics) for the authenticated tenant.',
    inputSchema: ListStateFabricsSchema,
    handler: async (cli, args) => listStateFabrics(cli, args as ListStateFabricsArgs),
  },
  {
    name: 'statefabric_get_fabric',
    description:
      'Get details of a specific StateFabric including its stores and pipelines.',
    inputSchema: GetStateFabricSchema,
    handler: async (cli, args) => getStateFabric(cli, args as GetStateFabricArgs),
  },
  {
    name: 'statefabric_list_pipelines',
    description:
      'List all pipelines within a StateFabric.',
    inputSchema: ListPipelinesSchema,
    handler: async (cli, args) => listStateFabricPipelines(cli, args as ListPipelinesArgs),
  },
  {
    name: 'statefabric_execute_pipeline',
    description:
      'Execute a pipeline within a StateFabric and return its result.',
    inputSchema: ExecutePipelineSchema,
    handler: async (cli, args) => executeStateFabricPipeline(cli, args as ExecutePipelineArgs),
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
    version: '1.3.0',
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
      version: '1.3.0',
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
