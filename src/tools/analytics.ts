import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
import { logger } from '../logger.js';

export const GetUsageSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  granularity: z.enum(['day', 'week', 'month']).optional(),
});

export type GetUsageArgs = z.infer<typeof GetUsageSchema>;

export async function getUsage(
  client: FunctionFlyClient,
  args: GetUsageArgs
) {
  logger.debug('getUsage called', args);
  const result = await client.getUsage({
    startDate: args.startDate,
    endDate: args.endDate,
    granularity: args.granularity,
  });

  return {
    content: [
      { type: 'text' as const, text: JSON.stringify(result, null, 2) },
    ],
  };
}

export const GetCostsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['function', 'day']).optional(),
});

export type GetCostsArgs = z.infer<typeof GetCostsSchema>;

export async function getCosts(
  client: FunctionFlyClient,
  args: GetCostsArgs
) {
  logger.debug('getCosts called', args);
  const result = await client.getCosts({
    startDate: args.startDate,
    endDate: args.endDate,
    groupBy: args.groupBy,
  });

  return {
    content: [
      { type: 'text' as const, text: JSON.stringify(result, null, 2) },
    ],
  };
}
