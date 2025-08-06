/**
 * Xala MCP Client
 * Client interface for interacting with Xala UI System MCP Server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type {
  MCPClientConfig,
  MCPConnectionOptions,
  MCPToolRequest,
  MCPToolResponse,
  MCPGenerateComponentRequest,
  MCPGeneratePageRequest,
  MCPAnalysisRequest,
  MCPClientState,
  MCPToolMetadata
} from './types.js';
import {
  MCPError,
  MCPConnectionError,
  MCPToolError,
  MCPValidationError,
  MCPTimeoutError
} from './errors.js';
import type { SupportedPlatform, IndustryTheme } from '../types/index.js';

/**
 * Xala MCP Client for component generation and project analysis
 */
export class XalaMCPClient {
  private client: Client | null = null;
  private config: {
    serverName: string;
    serverVersion: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    debug: boolean;
    defaultPlatform: SupportedPlatform;
    defaultTheme: IndustryTheme;
  };
  private connectionOptions?: MCPConnectionOptions;
  private state: MCPClientState = { connected: false };
  private availableTools: MCPToolMetadata[] = [];

  constructor(config: MCPClientConfig = {}, connectionOptions?: MCPConnectionOptions) {
    this.config = {
      serverName: config.serverName || 'xala-ui-system-mcp',
      serverVersion: config.serverVersion || '6.5.0',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      debug: config.debug || false,
      defaultPlatform: config.defaultPlatform || 'react',
      defaultTheme: config.defaultTheme || 'enterprise'
    };
    this.connectionOptions = connectionOptions;
  }

  /**
   * Connect to the MCP server
   */
  async connect(): Promise<void> {
    try {
      this.client = new Client(
        {
          name: 'xala-ui-client',
          version: '1.0.0'
        },
        {
          capabilities: {
            tools: {},
          }
        }
      );

      // Default to stdio transport if no options provided
      const transport = new StdioClientTransport({
        command: 'xala-ui-mcp',
        args: []
      });

      await this.client.connect(transport);
      
      // Get server info and available tools
      await this.refreshServerInfo();
      
      this.state = {
        connected: true,
        lastActivity: new Date(),
        serverInfo: {
          name: this.config.serverName,
          version: this.config.serverVersion
        },
        availableTools: this.availableTools.map(tool => tool.name)
      };

      if (this.config.debug) {
        console.log('XalaMCPClient: Connected successfully');
      }
    } catch (error) {
      throw new MCPConnectionError(
        `Failed to connect to MCP server: ${error instanceof Error ? error.message : String(error)}`,
        { originalError: error }
      );
    }
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        this.client = null;
        this.state = { connected: false };
        
        if (this.config.debug) {
          console.log('XalaMCPClient: Disconnected successfully');
        }
      } catch (error) {
        throw new MCPConnectionError(
          `Failed to disconnect from MCP server: ${error instanceof Error ? error.message : String(error)}`,
          { originalError: error }
        );
      }
    }
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.state.connected && this.client !== null;
  }

  /**
   * Get client state
   */
  getState(): MCPClientState {
    return { ...this.state };
  }

  /**
   * Get available tools
   */
  getAvailableTools(): MCPToolMetadata[] {
    return [...this.availableTools];
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(request: MCPToolRequest): Promise<MCPToolResponse> {
    if (!this.client || !this.isConnected()) {
      throw new MCPConnectionError('Not connected to MCP server');
    }

    try {
      const response = await this.client.callTool({
        name: request.name,
        arguments: request.arguments
      });

      this.state.lastActivity = new Date();

      return {
        content: response.content as Array<{
          type: 'text' | 'image' | 'resource';
          text?: string;
          data?: string;
          mimeType?: string;
        }>
      };
    } catch (error) {
      throw new MCPToolError(
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`,
        request.name,
        { originalError: error, request }
      );
    }
  }

  /**
   * Generate a component using the MCP server
   */
  async generateComponent(request: MCPGenerateComponentRequest): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'generate_component',
      arguments: {
        name: request.name,
        type: request.type || 'component',
        platform: request.platform || this.config.defaultPlatform,
        category: request.category || 'components',
        theme: request.theme || this.config.defaultTheme,
        features: request.features || {},
        styling: request.styling || {},
        customizations: request.customizations || {}
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Generate a page using the MCP server
   */
  async generatePage(request: MCPGeneratePageRequest): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'generate_page',
      arguments: {
        pageName: request.pageName,
        pageType: request.pageType || 'dashboard',
        platform: request.platform || this.config.defaultPlatform,
        theme: request.theme || this.config.defaultTheme,
        options: request.options || {}
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Analyze a project using the MCP server
   */
  async analyzeProject(request: MCPAnalysisRequest): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'analyse_code',
      arguments: {
        projectPath: request.projectPath || process.cwd(),
        analysisType: request.analysisType || 'structure',
        options: request.options || {}
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Get component library information
   */
  async getComponents(platform?: SupportedPlatform): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'get_components',
      arguments: {
        platform: platform || this.config.defaultPlatform
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Get component blocks/patterns
   */
  async getBlocks(category?: string): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'get_blocks',
      arguments: {
        category: category || 'all'
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Get generation rules and guidelines
   */
  async getRules(platform?: SupportedPlatform): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'get_rules',
      arguments: {
        platform: platform || this.config.defaultPlatform
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Check Norwegian compliance for a project
   */
  async checkNorwegianCompliance(projectPath?: string): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'norwegian_compliance',
      arguments: {
        projectPath: projectPath || process.cwd(),
        checkType: 'full'
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Initialize a new project
   */
  async initProject(
    projectName: string,
    options: {
      platform?: SupportedPlatform;
      theme?: IndustryTheme;
      features?: string[];
    } = {}
  ): Promise<MCPToolResponse> {
    const toolRequest: MCPToolRequest = {
      name: 'init_project',
      arguments: {
        projectName,
        platform: options.platform || this.config.defaultPlatform,
        theme: options.theme || this.config.defaultTheme,
        features: options.features || []
      }
    };

    return this.callTool(toolRequest);
  }

  /**
   * Refresh server information and available tools
   */
  private async refreshServerInfo(): Promise<void> {
    if (!this.client) {
      throw new MCPConnectionError('Client not initialized');
    }

    try {
      const toolsResponse = await this.client.listTools();
      this.availableTools = toolsResponse.tools.map(tool => ({
        name: tool.name,
        description: tool.description || '',
        inputSchema: tool.inputSchema as Record<string, unknown>,
        category: undefined,
        version: undefined
      }));
    } catch (error) {
      if (this.config.debug) {
        console.warn('XalaMCPClient: Failed to refresh server info:', error);
      }
      // Don't throw here, just log the warning
    }
  }

  /**
   * Set debug mode
   */
  setDebugMode(debug: boolean): void {
    this.config.debug = debug;
  }

  /**
   * Set default platform
   */
  setDefaultPlatform(platform: SupportedPlatform): void {
    this.config.defaultPlatform = platform;
  }

  /**
   * Set default theme
   */
  setDefaultTheme(theme: IndustryTheme): void {
    this.config.defaultTheme = theme;
  }
}