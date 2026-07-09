"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCostsSchema = exports.GetUsageSchema = void 0;
exports.getUsage = getUsage;
exports.getCosts = getCosts;
const zod_1 = require("zod");
const logger_js_1 = require("../logger.js");
exports.GetUsageSchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    granularity: zod_1.z.enum(['day', 'week', 'month']).optional(),
});
async function getUsage(client, args) {
    logger_js_1.logger.debug('getUsage called', args);
    const result = await client.getUsage({
        startDate: args.startDate,
        endDate: args.endDate,
        granularity: args.granularity,
    });
    return {
        content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
        ],
    };
}
exports.GetCostsSchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    groupBy: zod_1.z.enum(['function', 'day']).optional(),
});
async function getCosts(client, args) {
    logger_js_1.logger.debug('getCosts called', args);
    const result = await client.getCosts({
        startDate: args.startDate,
        endDate: args.endDate,
        groupBy: args.groupBy,
    });
    return {
        content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
        ],
    };
}
//# sourceMappingURL=analytics.js.map