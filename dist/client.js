"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPError = exports.FunctionFlyClient = void 0;
const axios_1 = __importStar(require("axios"));
const config_js_1 = require("./config.js");
const logger_js_1 = require("./logger.js");
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE_MS = 1000;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
class FunctionFlyClient {
    client;
    timeout;
    constructor() {
        const config = (0, config_js_1.loadConfig)();
        this.timeout = config.executionTimeoutMs;
        this.client = axios_1.default.create({
            baseURL: config.apiUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': '@functionfly/mcp-server v1.3.0',
            },
        });
        this.client.interceptors.request.use((req) => {
            req.headers['Authorization'] = `Bearer ${config.apiKey}`;
            return req;
        });
    }
    async executeWithRetry(method, path, data, attempt = 1) {
        try {
            const response = await this.client.request({
                method,
                url: path,
                data,
                signal: AbortSignal.timeout(this.timeout),
            });
            return response.data;
        }
        catch (err) {
            if (!(err instanceof axios_1.AxiosError))
                throw err;
            const status = err.response?.status;
            const retryAfter = err.response?.headers['retry-after'];
            if (status === 429 && attempt <= MAX_RETRIES) {
                const delay = retryAfter
                    ? parseInt(retryAfter, 10) * 1000
                    : RETRY_DELAY_BASE_MS * attempt;
                logger_js_1.logger.warn(`Rate limited, retrying in ${delay}ms`, {
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
                const msg = err.response?.data?.error?.message ??
                    'Payment required';
                throw new MCPError('PAYMENT_REQUIRED', msg, -32005);
            }
            throw new MCPError('REQUEST_FAILED', `API request failed: ${err.message}`, -32004);
        }
    }
    async searchFunctions(params) {
        return this.executeWithRetry('get', '/v1/functions', { params });
    }
    async getFunction(author, name) {
        return this.executeWithRetry('get', `/v1/${author}/${name}`);
    }
    async executeFunction(author, name, input, version) {
        const path = version
            ? `/v1/${author}/${name}@${version}`
            : `/v1/${author}/${name}`;
        return this.executeWithRetry('post', path, { input });
    }
    async searchAgents(params) {
        return this.executeWithRetry('get', '/v1/marketplace/agents', { params });
    }
    async executeAgent(agentId, input) {
        return this.executeWithRetry('post', `/v1/agents/execute/${agentId}`, { input });
    }
    async getUsage(params) {
        return this.executeWithRetry('get', '/v1/analytics/usage', { params });
    }
    async getCosts(params) {
        return this.executeWithRetry('get', '/v1/analytics/costs', { params });
    }
    async publishFunction(author, name, version, manifest, source, changelog) {
        const body = {
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
    async listSecrets(params) {
        return this.executeWithRetry('get', '/v1/vault/secrets', { params });
    }
    async getSecret(id) {
        return this.executeWithRetry('get', `/v1/vault/secrets/${id}`);
    }
    async createSecret(body) {
        return this.executeWithRetry('post', '/v1/vault/secrets', body);
    }
    async updateSecret(id, body) {
        return this.executeWithRetry('patch', `/v1/vault/secrets/${id}`, body);
    }
    async deleteSecret(id) {
        return this.executeWithRetry('delete', `/v1/vault/secrets/${id}`);
    }
    async listStateFabrics(params) {
        return this.executeWithRetry('get', '/v1/state-fabrics', { params });
    }
    async getStateFabric(id) {
        return this.executeWithRetry('get', `/v1/state-fabrics/${id}`);
    }
    async listStateFabricPipelines(fabricId, params) {
        return this.executeWithRetry('get', `/v1/state-fabrics/${fabricId}/pipelines`, { params });
    }
    async executeStateFabricPipeline(fabricId, pipelineId, input) {
        return this.executeWithRetry('post', `/v1/state-fabrics/${fabricId}/pipelines/${pipelineId}/execute`, { input });
    }
}
exports.FunctionFlyClient = FunctionFlyClient;
class MCPError extends Error {
    code;
    mcpCode;
    constructor(code, message, mcpCode) {
        super(message);
        this.code = code;
        this.mcpCode = mcpCode;
        this.name = 'MCPError';
    }
}
exports.MCPError = MCPError;
//# sourceMappingURL=client.js.map