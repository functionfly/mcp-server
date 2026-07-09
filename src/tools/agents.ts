import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
import { logger } from '../logger.js';

export const SearchAgentsSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

export type SearchAgentsArgs = z.infer<typeof SearchAgentsSchema>;

export async function searchAgents(
  client: FunctionFlyClient,
  args: SearchAgentsArgs
) {
  logger.debug('searchAgents called', args);
  const result = await client.searchAgents({
    query: args.query,
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

export const ExecuteAgentSchema = z.object({
  agentId: z.string(),
  input: z.record(z.unknown()),
});

export type ExecuteAgentArgs = z.infer<typeof ExecuteAgentSchema>;

export async function executeAgent(
  client: FunctionFlyClient,
  args: ExecuteAgentArgs
) {
  logger.debug('executeAgent called', { agentId: args.agentId });

  const result = await client.executeAgent(args.agentId, args.input);

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
  };
}
