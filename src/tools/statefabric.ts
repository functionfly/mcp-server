import { z } from 'zod';
import { FunctionFlyClient } from '../client.js';
import { logger } from '../logger.js';

export const ListStateFabricsSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type ListStateFabricsArgs = z.infer<typeof ListStateFabricsSchema>;

export async function listStateFabrics(
  client: FunctionFlyClient,
  args: ListStateFabricsArgs
) {
  logger.debug('listStateFabrics called', args);
  const result = await client.listStateFabrics({
    limit: args.limit,
    offset: args.offset,
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

export const GetStateFabricSchema = z.object({
  id: z.string().uuid().describe('State Fabric ID (UUID)'),
});

export type GetStateFabricArgs = z.infer<typeof GetStateFabricSchema>;

export async function getStateFabric(
  client: FunctionFlyClient,
  args: GetStateFabricArgs
) {
  logger.debug('getStateFabric called', { id: args.id });
  const fabric = await client.getStateFabric(args.id);

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(fabric, null, 2),
      },
    ],
  };
}

export const ListPipelinesSchema = z.object({
  fabricId: z.string().uuid().describe('State Fabric ID (UUID)'),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

export type ListPipelinesArgs = z.infer<typeof ListPipelinesSchema>;

export async function listStateFabricPipelines(
  client: FunctionFlyClient,
  args: ListPipelinesArgs
) {
  logger.debug('listStateFabricPipelines called', { fabricId: args.fabricId });
  const result = await client.listStateFabricPipelines(args.fabricId, {
    limit: args.limit,
    offset: args.offset,
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

export const ExecutePipelineSchema = z.object({
  fabricId: z.string().uuid().describe('State Fabric ID (UUID)'),
  pipelineId: z.string().uuid().describe('Pipeline ID (UUID)'),
  input: z.record(z.unknown()).optional().default({}).describe('Input payload for the pipeline'),
});

export type ExecutePipelineArgs = z.infer<typeof ExecutePipelineSchema>;

export async function executeStateFabricPipeline(
  client: FunctionFlyClient,
  args: ExecutePipelineArgs
) {
  logger.debug('executeStateFabricPipeline called', {
    fabricId: args.fabricId,
    pipelineId: args.pipelineId,
  });

  const result = await client.executeStateFabricPipeline(
    args.fabricId,
    args.pipelineId,
    args.input
  );

  if (result['error']) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Pipeline execution error: ${result['error']}`,
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
