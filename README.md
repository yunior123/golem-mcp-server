# Golem MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server for [Golem Cloud](https://www.golem.cloud/) — manage agents, workers, components, and applications directly from AI assistants like Claude.

## Features

### Tools (AI-invoked actions)

| Tool | Description |
|------|-------------|
| `golem_list_workers` | List all workers for a component |
| `golem_get_worker` | Get worker details and status |
| `golem_create_worker` | Create a new worker instance |
| `golem_delete_worker` | Delete a worker |
| `golem_invoke_agent` | Invoke a function on a Golem agent |
| `golem_get_component` | Get component metadata and exports |
| `golem_list_applications` | List all applications in an account |
| `golem_get_application` | Get application details |
| `golem_get_worker_oplog` | Get worker execution logs |
| `golem_interrupt_worker` | Pause a running worker |
| `golem_resume_worker` | Resume an interrupted worker |

### Resources (read-only data)

| URI Pattern | Description |
|-------------|-------------|
| `golem://applications/{accountId}` | All applications |
| `golem://applications/{id}/details` | Application details |
| `golem://components/{id}` | Component info |
| `golem://components/{id}/workers` | Workers list |
| `golem://components/{id}/workers/{name}` | Worker details |
| `golem://components/{id}/workers/{name}/oplog` | Worker logs |

## Setup

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "golem": {
      "command": "npx",
      "args": ["-y", "@golem-cloud/mcp-server"],
      "env": {
        "GOLEM_API_TOKEN": "your-api-token",
        "GOLEM_API_URL": "https://release.api.golem.cloud"
      }
    }
  }
}
```

### VS Code + Claude Extension

Add to your VS Code settings or `.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "golem": {
      "command": "npx",
      "args": ["-y", "@golem-cloud/mcp-server"],
      "env": {
        "GOLEM_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOLEM_API_TOKEN` | Yes | — | Your Golem Cloud API token |
| `GOLEM_API_URL` | No | `https://release.api.golem.cloud` | Golem API base URL |

## Example Usage

```
User: "List all workers for my shopping cart component"
Claude: [Uses golem_list_workers] Found 3 workers: cart-user-1, cart-user-2, cart-user-3

User: "Invoke checkout on the shopping cart agent for user-123"
Claude: [Uses golem_invoke_agent] Checkout completed. Order ID: xyz789
```

## Development

```bash
npm install
npm run build
GOLEM_API_TOKEN=your-token node dist/index.js
```

## License

Apache-2.0
