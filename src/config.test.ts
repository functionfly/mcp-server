import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, resetConfigCache } from './config.js';
import { logger } from './logger.js';

describe('config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    resetConfigCache();
  });

  it('loads config with valid env vars', () => {
    vi.stubEnv('FUNCTIONFLY_API_KEY', 'ffp_test_key');
    vi.stubEnv('FUNCTIONFLY_API_URL', 'https://api.test.com');
    vi.stubEnv('FUNCTIONFLY_EXECUTION_TIMEOUT_MS', '60000');

    const config = loadConfig();
    expect(config.apiKey).toBe('ffp_test_key');
    expect(config.apiUrl).toBe('https://api.test.com');
    expect(config.executionTimeoutMs).toBe(60000);
  });

  it('uses defaults for optional vars', () => {
    vi.stubEnv('FUNCTIONFLY_API_KEY', 'ffp_test_key');

    const config = loadConfig();
    expect(config.apiUrl).toBe('https://api.functionfly.com');
    expect(config.executionTimeoutMs).toBe(30000);
  });

  it('exits with error if API key is missing', () => {
    vi.stubEnv('FUNCTIONFLY_API_KEY', '');
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as () => never);
    loadConfig();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe('logger', () => {
  it('redacts sensitive fields', () => {
    vi.stubEnv('LOG_LEVEL', 'debug');
    const meta = {
      authorization: 'Bearer ffp_secret_key',
      token: 'my_token_1234',
      password: 'supersecret',
      normalField: 'public',
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.info('test message', meta);
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain('normalField');
    expect(output).not.toContain('ffp_secret');
    expect(output).not.toContain('supersecret');
    expect(output).not.toContain('my_token');
    consoleSpy.mockRestore();
  });
});
