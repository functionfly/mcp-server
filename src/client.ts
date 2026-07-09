import axios, { AxiosInstance, AxiosError } from 'axios';
import { loadConfig } from './config.js';
import { logger } from './logger.js';

const MAX_RETRIES = 2;
const RETRY_DELAY_BASE_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class FunctionFlyClient {
  private readonly client: AxiosInstance;
  private readonly timeout: number;

  constructor() {
    const config = loadConfig();
    this.timeout = config.executionTimeoutMs;

    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '@functionfly/mcp-server v1.2.0',
      },
    });

    this.client.interceptors.request.use((req) => {
      req.headers['Authorization'] = `Bearer ${config.apiKey}`;
      return req;
    });
  }

  private async executeWithRetry<T>(
    method: 'get' | 'post' | 'delete' | 'patch',
    path: string,
    data?: unknown,
    attempt = 1
  ): Promise<T> {
    try {
      const response = await this.client.request<T>({
        method,
        url: path,
        data,
        signal: AbortSignal.timeout(this.timeout),
      });
      return response.data;
    } catch (err) {
      if (!(err instanceof AxiosError)) throw err;
      const status = err.response?.status;
      const retryAfter = err.response?.headers['retry-after'];

      if (status === 429 && attempt <= MAX_RETRIES) {
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAY_BASE_MS * attempt;
        logger.warn(`Rate limited, retrying in ${delay}ms`, {
          attempt,
          maxRetries: MAX_RETRIES,
          path,
        });
        await sleep(delay);
        return this.executeWithRetry(method, path, data, attempt + 1);
      }

      if (status === 401) {
        throw new MCPError('UNAUTHORIZED', 'Invalid API key', -32001);
      }
      if (status === 404) {
        throw new MCPError('NOT_FOUND', `Resource not found: ${path}`, -32002);
      }
      if (status === 402) {
        const msg =
          (err.response?.data as { error?: { message?: string } })?.error?.message ??
          'Payment required';
        throw new MCPError('PAYMENT_REQUIRED', msg, -32005);
      }

      throw new MCPError(
        'REQUEST_FAILED',
        `API request failed: ${err.message}`,
        -32004
      );
    }
  }

  async searchFunctions(params: {
    query?: string;
    author?: string;
    runtime?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchFunctionsResponse> {
    return this.executeWithRetry('get', '/v1/functions', { params });
  }

  async getFunction(author: string, name: string): Promise<FunctionflyFunction> {
    return this.executeWithRetry('get', `/v1/${author}/${name}`);
  }

  async executeFunction(
    author: string,
    name: string,
    input: unknown,
    version?: string
  ): Promise<ExecutionResponse> {
    const path = version
      ? `/v1/${author}/${name}@${version}`
      : `/v1/${author}/${name}`;
    return this.executeWithRetry('post', path, { input });
  }

  async searchAgents(params: {
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<SearchAgentsResponse> {
    return this.executeWithRetry('get', '/v1/marketplace/agents', { params });
  }

  async executeAgent(agentId: string, input: unknown): Promise<unknown> {
    return this.executeWithRetry('post', `/v1/agents/execute/${agentId}`, { input });
  }

  async getUsage(params: {
    startDate?: string;
    endDate?: string;
    granularity?: string;
  }): Promise<UsageResponse> {
    return this.executeWithRetry('get', '/v1/analytics/usage', { params });
  }

  async getCosts(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<CostsResponse> {
    return this.executeWithRetry('get', '/v1/analytics/costs', { params });
  }

  async publishFunction(
    author: string,
    name: string,
    version: string,
    manifest: FunctionManifest,
    source?: FunctionSourceInput,
    changelog?: ChangelogInput
  ): Promise<PublishFunctionResponse> {
    const body: Record<string, unknown> = {
      author,
      name,
      version,
      manifest,
    };
    if (source) {
      body.source = source;
    }
    if (changelog) {
      body.changelog = changelog;
    }
    return this.executeWithRetry('post', '/v1/registry/publish', body);
  }

  async listSecrets(params?: {
    namespace?: string;
    limit?: number;
    offset?: number;
  }): Promise<VaultListSecretsResponse> {
    return this.executeWithRetry('get', '/v1/vault/secrets', { params });
  }

  async getSecret(id: string): Promise<VaultSecretResponse> {
    return this.executeWithRetry('get', `/v1/vault/secrets/${id}`);
  }

  async createSecret(body: VaultCreateSecretRequest): Promise<VaultSecretResponse> {
    return this.executeWithRetry('post', '/v1/vault/secrets', body);
  }

  async updateSecret(id: string, body: VaultUpdateSecretRequest): Promise<VaultSecretResponse> {
    return this.executeWithRetry('patch', `/v1/vault/secrets/${id}`, body);
  }

  async deleteSecret(id: string): Promise<void> {
    return this.executeWithRetry('delete', `/v1/vault/secrets/${id}`);
  }
}

export class MCPError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly mcpCode: number
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export interface FunctionflyFunction {
  id: string;
  author: string;
  name: string;
  version: string;
  runtime: string;
  description?: string;
  pricePerCall: number;
  visibility: string;
  verified: boolean;
  trustScore: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFunctionsResponse {
  functions: FunctionflyFunction[];
  total: number;
  page: number;
  limit: number;
}

export interface ExecutionResponse {
  ok: boolean;
  data: unknown;
  cached: boolean;
  durationMs: number;
  version: string;
  executionID?: string;
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

export interface SearchAgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
}

export interface Agent {
  id: string;
  author: string;
  name: string;
  description: string;
  version: string;
  pricePerCall: number;
  rating: number;
  downloads: number;
}

export interface UsageResponse {
  totalCalls: number;
  totalComputeMs: number;
  period: { start: string; end: string };
  byFunction: Record<string, { calls: number; computeMs: number }>;
}

export interface CostsResponse {
  totalUSD: number;
  period: { start: string; end: string };
  byFunction: Record<string, { costUSD: number; calls: number }>;
}

export interface FunctionManifest {
  runtime: string;
  entry?: string;
  public?: boolean;
  deterministic?: boolean;
  cache_ttl?: number;
  timeout_ms?: number;
  memory_mb?: number;
  description?: string;
  dependencies?: Record<string, string>;
  env?: Record<string, string>;
  input_schema?: Record<string, unknown>;
  output_schema?: Record<string, unknown>;
  idempotent?: boolean;
  side_effects?: string;
  capabilities?: string[];
  main_file?: string;
  type_check?: boolean;
  ts_config?: string;
  strict_mode?: boolean;
  skip_type_check?: boolean;
  include_packages?: boolean;
  package_cache?: string;
}

export interface FunctionSourceInput {
  code: string;
  files?: Record<string, string>;
  runtime: string;
  wasm_binary?: string;
  readme?: string;
}

export interface ChangelogChangeInput {
  component: string;
  field: string;
  before?: unknown;
  after?: unknown;
  description: string;
}

export interface ChangelogInput {
  category: string;
  title: string;
  description: string;
  changes?: ChangelogChangeInput[];
}

export interface PublishFunctionResponse {
  ok: boolean;
  function: string;
  version: string;
  message?: string;
  verification_status?: string;
}

export interface VaultEncryptedPayload {
  ciphertext: string;
  iv: string;
  salt: string;
  tag: string;
  key_version: number;
}

export interface VaultSecretMetadata {
  id: string;
  name: string;
  description?: string;
  secret_type: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  namespace: string;
  last_accessed_at?: string;
  access_count: number;
  created_at: string;
  updated_at: string;
  current_version?: number;
  last_modified_at?: string;
}

export interface VaultSecretResponse extends VaultSecretMetadata {
  encrypted_data: VaultEncryptedPayload;
}

export interface VaultListSecretsResponse {
  secrets: VaultSecretMetadata[];
  total: number;
  limit: number;
  offset: number;
}

export interface VaultCreateSecretRequest {
  name: string;
  description?: string;
  secret_type: string;
  encrypted_data: VaultEncryptedPayload;
  scopes?: string[];
  metadata?: Record<string, unknown>;
  namespace?: string;
}

export interface VaultUpdateSecretRequest {
  name?: string;
  description?: string;
  scopes?: string[];
}
