"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutePipelineSchema = exports.ListPipelinesSchema = exports.GetStateFabricSchema = exports.ListStateFabricsSchema = void 0;
exports.listStateFabrics = listStateFabrics;
exports.getStateFabric = getStateFabric;
exports.listStateFabricPipelines = listStateFabricPipelines;
exports.executeStateFabricPipeline = executeStateFabricPipeline;
const zod_1 = require("zod");
const logger_js_1 = require("../logger.js");
exports.ListStateFabricsSchema = zod_1.z.object({
    limit: zod_1.z.number().int().min(1).max(100).optional().default(20),
    offset: zod_1.z.number().int().min(0).optional().default(0),
});
async function listStateFabrics(client, args) {
    logger_js_1.logger.debug('listStateFabrics called', args);
    const result = await client.listStateFabrics({
        limit: args.limit,
        offset: args.offset,
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
exports.GetStateFabricSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().describe('State Fabric ID (UUID)'),
});
async function getStateFabric(client, args) {
    logger_js_1.logger.debug('getStateFabric called', { id: args.id });
    const fabric = await client.getStateFabric(args.id);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(fabric, null, 2),
            },
        ],
    };
}
exports.ListPipelinesSchema = zod_1.z.object({
    fabricId: zod_1.z.string().uuid().describe('State Fabric ID (UUID)'),
    limit: zod_1.z.number().int().min(1).max(100).optional().default(20),
    offset: zod_1.z.number().int().min(0).optional().default(0),
});
async function listStateFabricPipelines(client, args) {
    logger_js_1.logger.debug('listStateFabricPipelines called', { fabricId: args.fabricId });
    const result = await client.listStateFabricPipelines(args.fabricId, {
        limit: args.limit,
        offset: args.offset,
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
exports.ExecutePipelineSchema = zod_1.z.object({
    fabricId: zod_1.z.string().uuid().describe('State Fabric ID (UUID)'),
    pipelineId: zod_1.z.string().uuid().describe('Pipeline ID (UUID)'),
    input: zod_1.z.record(zod_1.z.unknown()).optional().default({}).describe('Input payload for the pipeline'),
});
async function executeStateFabricPipeline(client, args) {
    logger_js_1.logger.debug('executeStateFabricPipeline called', {
        fabricId: args.fabricId,
        pipelineId: args.pipelineId,
    });
    const result = await client.executeStateFabricPipeline(args.fabricId, args.pipelineId, args.input);
    if (result['error']) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Pipeline execution error: ${result['error']}`,
                },
            ],
            isError: true,
        };
    }
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2),
            },
        ],
    };
}
//# sourceMappingURL=statefabric.js.map