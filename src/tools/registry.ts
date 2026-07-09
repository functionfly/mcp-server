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
