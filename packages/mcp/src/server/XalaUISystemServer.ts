/**
 * Streamlined Xala UI System MCP Server
 * Refactored to follow SOLID principles with proper separation of concerns
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { ComponentGenerator } from "../generators/ComponentGenerator.js";
import { TemplateManager } from "../templates/TemplateManager.js";
import { AITemplateSystem } from "../ai/index.js";
import { NorwegianComplianceGenerator } from "../generators/NorwegianComplianceGenerator.js";
import { NorwegianComplianceTemplateManager } from "../templates/NorwegianComplianceTemplateManager.js";
import { NorwegianComplianceValidator } from "../utils/norwegian-compliance-validation.js";

import { CoreToolHandlers } from "../handlers/CoreToolHandlers.js";
import { CORE_TOOLS } from "../tools/CoreTools.js";
import type { MCPToolResult } from "../types/index.js";

/**
 * Main MCP Server class following Single Responsibility Principle
 * Handles server setup, tool registration, and request routing
 */
export class XalaUISystemServer {
	private server: Server;
	private coreHandlers!: CoreToolHandlers;

	constructor() {
		this.server = new Server(
			{
				name: "xala-ui-system-mcp",
				version: "6.5.0",
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.initializeDependencies();
		this.setupToolHandlers();
	}

	/**
	 * Initialize all dependencies following Dependency Injection principle
	 */
	private initializeDependencies(): void {
		const componentGenerator = new ComponentGenerator();
		const templateManager = new TemplateManager();
		const aiTemplateSystem = new AITemplateSystem({
			enableMCPIntegration: true,
			enablePerformanceOptimization: true,
			enableNorwegianCompliance: true,
			defaultPlatform: 'react',
			defaultTheme: 'enterprise',
			cacheEnabled: true,
			debugMode: false
		});
		const norwegianComplianceGenerator = new NorwegianComplianceGenerator();
		const norwegianComplianceValidator = new NorwegianComplianceValidator();

		this.coreHandlers = new CoreToolHandlers(
			componentGenerator,
			templateManager,
			aiTemplateSystem,
			norwegianComplianceValidator
		);
	}

	/**
	 * Setup tool handlers following Open/Closed Principle
	 */
	private setupToolHandlers(): void {
		// Register core tools
		this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
			tools: CORE_TOOLS.map(t => ({
				name: t.name,
				description: t.description,
				inputSchema: t.inputSchema
			}))
		}));

		// Register call tool handler
		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			try {
				const result = await this.routeToolCall(request);
				return result as any; // Type assertion to satisfy MCP SDK requirements
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: `Error calling tool ${request.params.name}: ${error instanceof Error ? error.message : String(error)}`
					}]
				} as any;
			}
		});
	}

	/**
	 * Route tool calls to appropriate handlers
	 * Following Single Responsibility and Open/Closed principles
	 */
	private async routeToolCall(request: any): Promise<MCPToolResult> {
		switch (request.params.name) {
			case 'get_components':
				return await this.coreHandlers.handleGetComponents(request.params.arguments as any);
			case 'get_blocks':
				return await this.coreHandlers.handleGetBlocks(request.params.arguments as any);
			case 'get_rules':
				return await this.coreHandlers.handleGetRules(request.params.arguments as any);
			case 'generate_component':
				return await this.coreHandlers.handleGenerateComponent(request.params.arguments as any);
			case 'generate_page':
				return await this.coreHandlers.handleGeneratePage(request.params.arguments as any);
			case 'norwegian_compliance':
				return await this.coreHandlers.handleNorwegianCompliance(request.params.arguments as any);
			case 'gdpr_compliance':
				return await this.coreHandlers.handleGDPRCompliance(request.params.arguments as any);
			case 'transform_code':
				return await this.coreHandlers.handleTransformCode(request.params.arguments as any);
			case 'analyse_code':
				return await this.coreHandlers.handleAnalyseCode(request.params.arguments as any);
			case 'init_project':
				return await this.coreHandlers.handleInitProject(request.params.arguments as any);
			default:
				throw new Error(`Unknown tool: ${request.params.name}`);
		}
	}

	/**
	 * Start the MCP server
	 */
	async run(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.error("Xala UI System MCP Server v6.3.0 running on stdio");
	}
}
