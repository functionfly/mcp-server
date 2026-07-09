import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
import { logger } from '../logger.js';

export const SearchFunctionsSchema = z.object({
  query: z.string().optional(),
  author: z.string().optional(),
  runtime: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchFunctionsArgs = z.infer<typeof SearchFunctionsSchema>;

export async function searchFunctions(
  client: FunctionFlyClient,
  args: SearchFunctionsArgs
) {
  logger.debug('searchFunctions called', args);
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
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

export const GetFunctionSchema = z.object({
  author: z.string(),
  name: z.string(),
});

export type GetFunctionArgs = z.infer<typeof GetFunctionSchema>;

export async function getFunction(
  client: FunctionFlyClient,
  args: GetFunctionArgs
) {
  logger.debug('getFunction called', args);
  const fn = await client.getFunction(args.author, args.name);

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(fn, null, 2) }],
  };
}

export const ExecuteFunctionSchema = z.object({
  author: z.string(),
  name: z.string(),
  version: z.string().optional(),
  input: z.record(z.unknown()),
});

export type ExecuteFunctionArgs = z.infer<typeof ExecuteFunctionSchema>;

export async function executeFunction(
  client: FunctionFlyClient,
  args: ExecuteFunctionArgs
) {
  logger.debug('executeFunction called', { author: args.author, name: args.name });

  const result = await client.executeFunction(
    args.author,
    args.name,
    args.input,
    args.version
  );

  if (!result.ok) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Execution error: ${result.error?.message ?? 'unknown error'}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(
          {
            result: result.data,
            durationMs: result.durationMs,
            version: result.version,
            executionID: result.executionID,
            cached: result.cached,
          },
          null,
          2
        ),
      },
    ],
  };
}

export const PublishFunctionSchema = z.object({
  author: z.string().describe('Author username'),
  name: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase letters, numbers, and hyphens only')
    .describe('Function name'),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must be valid semver (e.g. 1.2.3)')
    .describe('Version to publish (semver)'),
  manifest: z.object({
    runtime: z.string().describe('Runtime: node22, python3.11, python3.12, bun, deno, wasm, etc.'),
    entry: z.string().optional().describe('Entry file path'),
    public: z.boolean().optional().default(true).describe('Whether function is publicly discoverable'),
    deterministic: z.boolean().optional().describe('Whether function is deterministic (enables caching)'),
    cache_ttl: z.number().int().optional().describe('Cache TTL in seconds'),
    timeout_ms: z.number().int().optional().describe('Execution timeout in milliseconds'),
    memory_mb: z.number().int().optional().describe('Memory limit in MB'),
    description: z.string().optional().describe('Function description'),
    dependencies: z.record(z.string()).optional().describe('npm/pip dependencies'),
    env: z.record(z.string()).optional().describe('Environment variables'),
    input_schema: z.record(z.unknown()).optional().describe('JSON Schema for input validation'),
    output_schema: z.record(z.unknown()).optional().describe('JSON Schema for output validation'),
    idempotent: z.boolean().optional().describe('Whether function is idempotent'),
    side_effects: z.string().optional().describe('Side effects description'),
    capabilities: z.array(z.string()).optional().describe('Capabilities (e.g. ["browser","network"])'),
  }),
  source: z
    .object({
      code: z.string().describe('Source code for the function'),
      files: z.record(z.string()).optional().describe('Additional files (e.g. package.json)'),
      runtime: z.string().describe('Runtime: node22, python3.11, python3.12, bun, deno, wasm'),
      wasm_binary: z.string().optional().describe('Base64-encoded WASM binary for wasm runtime'),
      readme: z.string().optional().describe('README documentation'),
    })
    .optional(),
  changelog: z
    .object({
      category: z.enum(['feature', 'bug_fix', 'performance', 'breaking', 'docs', 'other']),
      title: z.string().describe('Short summary of changes'),
      description: z.string().describe('Detailed description'),
      changes: z
        .array(
          z.object({
            component: z.string().describe('Component changed (e.g. input schema, output schema)'),
            field: z.string().describe('Field changed (e.g. timeout, memory)'),
            before: z.unknown().optional(),
            after: z.unknown().optional(),
            description: z.string().describe('Human-readable description of the change'),
          })
        )
        .optional(),
    })
    .optional(),
});

export type PublishFunctionArgs = z.infer<typeof PublishFunctionSchema>;

export async function publishFunction(
  client: FunctionFlyClient,
  args: PublishFunctionArgs
) {
  logger.debug('publishFunction called', { author: args.author, name: args.name, version: args.version });

  const result = await client.publishFunction(
    args.author,
    args.name,
    args.version,
    args.manifest,
    args.source,
    args.changelog
  );

  if (!result.ok) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Publish failed: ${result.message ?? 'unknown error'}`,
        },
      ],
      isError: true,
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
