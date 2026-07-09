"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.resetConfigCache = resetConfigCache;
const zod_1 = require("zod");
const configSchema = zod_1.z.object({
    apiKey: zod_1.z.string().min(1, 'FUNCTIONFLY_API_KEY is required'),
    apiUrl: zod_1.z
        .string()
        .url()
        .default('https://api.functionfly.com'),
    executionTimeoutMs: zod_1.z
        .number()
        .int()
        .min(1000)
        .max(300_000)
        .default(30_000),
});
function getEnv(key) {
    return process.env[key];
}
function getEnvNumber(key, fallback) {
    const val = getEnv(key);
    if (!val)
        return fallback;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? fallback : parsed;
}
let cachedConfig = null;
function loadConfig() {
    if (cachedConfig)
        return cachedConfig;
    const raw = {
        apiKey: getEnv('FUNCTIONFLY_API_KEY') ?? '',
        apiUrl: getEnv('FUNCTIONFLY_API_URL'),
        executionTimeoutMs: getEnvNumber('FUNCTIONFLY_EXECUTION_TIMEOUT_MS', 30_000),
    };
    const result = configSchema.safeParse(raw);
    if (!result.success) {
        const errors = result.error.errors
            .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
            .join('\n');
        console.error(`[config] Invalid configuration:\n${errors}`);
        process.exit(1);
    }
    cachedConfig = result.data;
    return cachedConfig;
}
function resetConfigCache() {
    cachedConfig = null;
}
//# sourceMappingURL=config.js.map