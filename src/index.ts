#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { loadConfig } from "./config.js";
import { GolemAPI } from "./api.js";
import { TOOLS, handleToolCall } from "./tools.js";
import { RESOURCE_TEMPLATES, handleResourceRead } from "./resources.js";

async function main() {
  const config = loadConfig();
  const api = new GolemAPI(config);

  const server = new Server(
    { name: "golem", version: "1.0.0" },
    { capabilities: { tools: {}, resources: {} } }
  );

  // ── Tools ──

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [...TOOLS],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      return await handleToolCall(api, name, args ?? {});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  // ── Resources ──

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [...RESOURCE_TEMPLATES],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    try {
      return await handleResourceRead(api, request.params.uri);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message);
    }
  });

  // ── Start ──

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // CRITICAL: Never use console.log — it pollutes the stdio JSON-RPC stream.
  console.error("Golem MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
