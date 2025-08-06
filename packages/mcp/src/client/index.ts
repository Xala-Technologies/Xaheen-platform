/**
 * Xala MCP Client Module
 * Client-side interfaces for interacting with Xala UI System MCP Server
 */

export { XalaMCPClient } from './XalaMCPClient.js';
export {
  MCPError,
  MCPConnectionError,
  MCPToolError,
  MCPValidationError,
  MCPTimeoutError
} from './errors.js';
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
} from './types.js';