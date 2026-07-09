"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
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
function isSensitiveKey(key) {
    const lower = key.toLowerCase();
    return SENSITIVE_PATTERNS.some((p) => lower.includes(p));
}
function redactValue(_key, value) {
    if (typeof value === 'string') {
        if (value.length <= 4)
            return '[REDACTED]';
        return value.slice(0, 2) + '***' + value.slice(-2);
    }
    return '[REDACTED]';
}
function redactObject(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        if (isSensitiveKey(key)) {
            result[key] = redactValue(key, value);
        }
        else if (Array.isArray(value)) {
            result[key] = value.map((v) => typeof v === 'object' && v !== null
                ? redactObject(v)
                : v);
        }
        else if (typeof value === 'object' && value !== null) {
            result[key] = redactObject(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
function log(level, message, meta) {
    const minLevel = (process.env['LOG_LEVEL'] ?? 'info');
    if (LOG_LEVELS[level] < LOG_LEVELS[minLevel])
        return;
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ' ' + JSON.stringify(redactObject(meta)) : '';
    const prefix = level === 'error' ? '[ERROR]' : `[${level.toUpperCase()}]`;
    console.error(`${timestamp} ${prefix} ${message}${metaStr}`);
}
exports.logger = {
    debug: (msg, meta) => log('debug', msg, meta),
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
};
//# sourceMappingURL=logger.js.map