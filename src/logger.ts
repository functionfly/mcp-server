const SENSITIVE_PATTERNS = [
  'authorization',
  'apikey',
  'api_key',
  'token',
  'secret',
  'password',
  'credential',
  'private',
  'ciphertext',
  'encrypted',
  'decrypted',
  'session',
  'bearer',
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}

function redactValue(_key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length <= 4) return '[REDACTED]';
    return value.slice(0, 2) + '***' + value.slice(-2);
  }
  return '[REDACTED]';
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      result[key] = redactValue(key, value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) =>
        typeof v === 'object' && v !== null
          ? redactObject(v as Record<string, unknown>)
          : v
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const minLevel = (process.env['LOG_LEVEL'] ?? 'info') as LogLevel;
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return;

  const timestamp = new Date().toISOString();
  const metaStr = meta ? ' ' + JSON.stringify(redactObject(meta)) : '';
  const prefix = level === 'error' ? '[ERROR]' : `[${level.toUpperCase()}]`;
  console.error(`${timestamp} ${prefix} ${message}${metaStr}`);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
};
