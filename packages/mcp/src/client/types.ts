/**
 * MCP Client Configuration Types
 */

import type { SupportedPlatform, IndustryTheme, ComponentCategory } from '../types/index.js';

/**
 * MCP Client Configuration
 */
export interface MCPClientConfig {
  readonly serverName?: string;
  readonly serverVersion?: string;
  readonly timeout?: number;
  readonly retryAttempts?: number;
  readonly retryDelay?: number;
  readonly debug?: boolean;
  readonly defaultPlatform?: SupportedPlatform;
  readonly defaultTheme?: IndustryTheme;
}

/**
 * MCP Connection Options
 */
export interface MCPConnectionOptions {
  readonly transport?: 'stdio' | 'websocket' | 'http';
  readonly endpoint?: string;
  readonly headers?: Record<string, string>;
  readonly auth?: {
    readonly type: 'bearer' | 'apikey';
    readonly token: string;
  };
}

/**
 * MCP Tool Request
 */
export interface MCPToolRequest {
  readonly name: string;
  readonly arguments: Record<string, unknown>;
}

/**
 * MCP Tool Response
 */
export interface MCPToolResponse {
  readonly content: Array<{
    readonly type: 'text' | 'image' | 'resource';
    readonly text?: string;
    readonly data?: string;
    readonly mimeType?: string;
  }>;
}

/**
 * MCP Component Generation Request
 */
export interface MCPGenerateComponentRequest {
  readonly name: string;
  readonly type?: string;
  readonly platform?: SupportedPlatform;
  readonly category?: ComponentCategory;
  readonly theme?: IndustryTheme;
  readonly features?: Record<string, boolean>;
  readonly styling?: Record<string, unknown>;
  readonly customizations?: Record<string, unknown>;
}

/**
 * MCP Page Generation Request
 */
export interface MCPGeneratePageRequest {
  readonly pageName: string;
  readonly pageType?: string;
  readonly platform?: SupportedPlatform;
  readonly theme?: IndustryTheme;
  readonly options?: Record<string, unknown>;
}

/**
 * MCP Analysis Request
 */
export interface MCPAnalysisRequest {
  readonly projectPath?: string;
  readonly analysisType?: 'structure' | 'compliance' | 'performance' | 'accessibility';
  readonly options?: Record<string, unknown>;
}

/**
 * MCP Client State
 */
export interface MCPClientState {
  readonly connected: boolean;
  readonly serverInfo?: {
    readonly name: string;
    readonly version: string;
  };
  readonly availableTools?: string[];
  lastActivity?: Date;
}

/**
 * MCP Event Types
 */
export type MCPClientEvents = {
  connected: () => void;
  disconnected: (error?: Error) => void;
  error: (error: Error) => void;
  toolResponse: (response: MCPToolResponse) => void;
};

/**
 * MCP Tool Metadata
 */
export interface MCPToolMetadata {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
  readonly category?: string;
  readonly version?: string;
}