#!/usr/bin/env node

/**
 * Xala UI System MCP Package v6.5.0
 * Multi-platform component generation with MCP server and client
 * 
 * This package provides both:
 * - Server: MCP server for component generation
 * - Client: Client interface for interacting with MCP servers
 */

// Export server classes
export { XalaUISystemServer } from './server/XalaUISystemServer.js';

// Export client classes and types
export {
  XalaMCPClient,
  MCPError,
  MCPConnectionError,
  MCPToolError,
  MCPValidationError,
  MCPTimeoutError
} from './client/index.js';

export type {
  MCPClientConfig,
  MCPConnectionOptions,
  MCPToolRequest,
  MCPToolResponse,
  MCPGenerateComponentRequest,
  MCPGeneratePageRequest,
  MCPAnalysisRequest,
  MCPClientState,
  MCPClientEvents,
  MCPToolMetadata
} from './client/index.js';

// Export core types
export type {
  SupportedPlatform,
  ComponentCategory,
  IndustryTheme,
  ComponentConfig,
  LayoutConfig,
  PageTemplateConfig,
  FormConfig,
  DataTableConfig,
  GeneratedComponent,
  MCPToolResult
} from './types/index.js';

// Export generators for advanced usage
export { ComponentGenerator } from './generators/ComponentGenerator.js';
export { TemplateManager } from './templates/TemplateManager.js';

// If running directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const { XalaUISystemServer } = await import('./server/XalaUISystemServer.js');
  const server = new XalaUISystemServer();
  server.run().catch(console.error);
}
