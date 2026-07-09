import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().min(1, 'FUNCTIONFLY_API_KEY is required'),
  apiUrl: z
    .string()
    .url()
    .default('https://api.functionfly.com'),
  executionTimeoutMs: z
    .number()
    .int()
    .min(1000)
    .max(300_000)
    .default(30_000),
});

export type Config = z.infer<typeof configSchema>;

function getEnv(key: string): string | undefined {
  return process.env[key];
}

function getEnvNumber(key: string, fallback: number): number {
  const val = getEnv(key);
  if (!val) return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

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

export function resetConfigCache(): void {
  cachedConfig = null;
}
