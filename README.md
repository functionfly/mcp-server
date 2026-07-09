# @functionfly/mcp-server

MCP server for FunctionFly — enables AI agents (Claude Desktop, Cursor, etc.) to interact with the FunctionFly platform directly.

## Features

- **Registry search** — Find functions by name, author, runtime, or keyword
- **Function execution** — Execute any public or private function with JSON input
- **Function publishing** — Publish new functions or versions with source code and manifest
- **Agent marketplace** — Search and execute AI agents
- **Usage analytics** — View call counts and compute usage for your tenant
- **Cost analytics** — View cost breakdown by function
- **Vault secrets** — Zero-knowledge secret storage with client-side AES-256-GCM encryption

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "functionfly": {
      "command": "npx",
      "args": ["-y", "@functionfly/mcp-server"],
      "env": {
        "FUNCTIONFLY_API_KEY": "ffp_your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`Settings → MCP → Add new server`):

```json
{
  "mcpServers": {
    "functionfly": {
      "command": "npx",
      "args": ["-y", "@functionfly/mcp-server"],
      "env": {
        "FUNCTIONFLY_API_KEY": "ffp_your_api_key_here"
      }
    }
  }
}
```

## Configuration

| Environment Variable | Required | Default | Description |
|---------------------|----------|---------|-------------|
| `FUNCTIONFLY_API_KEY` | Yes | — | Your FunctionFly API key (starts with `ffp_`) |
| `FUNCTIONFLY_API_URL` | No | `https://api.functionfly.com` | API base URL |
| `FUNCTIONFLY_EXECUTION_TIMEOUT_MS` | No | `30000` | Execution timeout (ms, max 300000) |
| `LOG_LEVEL` | No | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `VAULT_PASSPHRASE` | For vault tools | — | Passphrase for AES-256-GCM vault encryption/decryption |

## Available Tools

### Registry Tools

#### `registry_search_functions`
Search the public function registry.

```json
{
  "query": "image processing",
  "runtime": "python",
  "page": 1,
  "limit": 20
}
```

#### `registry_get_function`
Get metadata for a specific function.

```json
{
  "author": "acme",
  "name": "resize-image"
}
```

#### `registry_execute_function`
Execute a function and get its result.

```json
{
  "author": "acme",
  "name": "resize-image",
  "input": { "url": "https://example.com/image.jpg", "width": 800 },
  "version": "1.2.3"
}
```

#### `registry_publish_function`
Publish a new function or version to the registry. Requires authentication.

```json
{
  "author": "acme",
  "name": "resize-image",
  "version": "1.2.3",
  "manifest": {
    "runtime": "python3.12",
    "description": "Resize an image to specified dimensions",
    "timeout_ms": 10000,
    "memory_mb": 256,
    "public": true,
    "deterministic": false,
    "input_schema": {
      "type": "object",
      "properties": {
        "url": { "type": "string", "description": "Image URL" },
        "width": { "type": "integer", "description": "Target width" }
      },
      "required": ["url"]
    }
  },
  "source": {
    "code": "import requests\nfrom PIL import Image\n...\nreturn {'url': output_url}",
    "runtime": "python3.12"
  },
  "changelog": {
    "category": "feature",
    "title": "Add width-only resize support",
    "description": "Image can now be resized by width alone while preserving aspect ratio",
    "changes": [
      {
        "component": "input schema",
        "field": "height",
        "description": "Made height optional"
      }
    ]
  }
}
```

### Agent Tools

#### `agents_search`
Search the agent marketplace.

```json
{
  "query": "data analysis",
  "page": 1,
  "limit": 20
}
```

#### `agents_execute`
Execute an agent by ID.

```json
{
  "agentId": "agent_abc123",
  "input": { "data": "some input data" }
}
```

### Analytics Tools

#### `analytics_get_usage`
Get usage metrics for your tenant.

```json
{
  "startDate": "2024-06-01",
  "endDate": "2024-06-30",
  "granularity": "day"
}
```

#### `analytics_get_costs`
Get cost breakdown for your tenant.

```json
{
  "startDate": "2024-06-01",
  "endDate": "2024-06-30",
  "groupBy": "function"
}
```

### Vault Tools (Zero-Knowledge)

> **Zero-knowledge architecture**: Secrets are encrypted client-side before leaving your machine. The FunctionFly server stores only ciphertext. Set `VAULT_PASSPHRASE` to control encryption.

#### `vault_list_secrets`
List secrets in your vault (metadata only, no values).

```json
{
  "namespace": "production",
  "limit": 20,
  "offset": 0
}
```

#### `vault_get_secret`
Get and decrypt a secret. Uses `VAULT_PASSPHRASE` env var for decryption.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### `vault_set_secret`
Create a new secret. The value is encrypted client-side before upload. Uses `VAULT_PASSPHRASE` env var.

```json
{
  "name": "github-api-key",
  "value": "ghp_xxxx",
  "secret_type": "api_key",
  "description": "GitHub personal access token",
  "namespace": "production"
}
```

#### `vault_delete_secret`
Permanently delete a secret by ID.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Codes

| MCP Code | Meaning |
|----------|---------|
| `-32001` | Invalid API key |
| `-32002` | Function not found or execution error |
| `-32003` | Rate limited (after retry exhaustion) |
| `-32004` | Network or timeout error |
| `-32005` | Payment required (insufficient balance) |
| `-32006` | Quota exceeded |

## Security

> **MVP limitation**: The MCP server uses a single API key for all operations. Any AI agent with access to the MCP server can perform any action your API key allows (publish functions, execute paid functions, spend credits, etc.). Use a scoped API key with minimal permissions for MCP integrations. A future release will introduce MCP-scoped API keys with restricted permissions.

All API keys are redacted from logs. Sensitive fields (`secret`, `token`, `ciphertext`, etc.) are also redacted.

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Lint
npm run lint

# Test
npm test

# Build
npm run build

# Run locally
FUNCTIONFLY_API_KEY=ffp_test ./dist/index.js
```

## Publishing

Create a git tag to trigger an npm release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The release workflow will build, publish to npm, and create a GitHub release automatically.

## License

MIT
