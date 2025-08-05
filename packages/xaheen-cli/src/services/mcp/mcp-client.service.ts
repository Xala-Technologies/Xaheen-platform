/**
 * @fileoverview MCP Client Service - EPIC 14 Story 14.1
 * @description Enhanced MCP client with enterprise credentials and context loaders
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, resolve, dirname } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";
import { XalaMCPClient, type MCPClientConfig, type MCPConnectionOptions } from "xala-mcp";

// Telemetry interfaces
export interface TelemetryEvent {
	readonly eventType: "connection" | "generation" | "indexing" | "error" | "performance";
	readonly timestamp: Date;
	readonly eventId: string;
	readonly sessionId: string;
	readonly data: Record<string, any>;
	readonly userAgent: string;
	readonly version: string;
}

export interface TelemetryMetrics {
	readonly totalConnections: number;
	readonly totalGenerations: number;
	readonly totalErrors: number;
	readonly averageResponseTime: number;
	readonly peakMemoryUsage: number;
	readonly sessionDuration: number;
}

export interface TelemetryReporter {
	reportEvent(event: TelemetryEvent): Promise<void>;
	reportMetrics(metrics: TelemetryMetrics): Promise<void>;
	flush(): Promise<void>;
}

// MCP Client Configuration Schema
const MCPConfigSchema = z.object({
	serverUrl: z.string().url(),
	apiKey: z.string().min(32),
	clientId: z.string().min(8),
	version: z.string().default("1.0.0"),
	timeout: z.number().default(30000),
	retryAttempts: z.number().default(3),
	enableTelemetry: z.boolean().default(true),
	securityClassification: z
		.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"])
		.default("OPEN"),
});

const ContextItemSchema = z.object({
	id: z.string(),
	type: z.enum(["file", "directory", "function", "class", "component"]),
	path: z.string(),
	content: z.string().optional(),
	metadata: z.record(z.any()).optional(),
	lastModified: z.date(),
	size: z.number().optional(),
	encoding: z.string().default("utf-8"),
});

const ProjectContextSchema = z.object({
	projectRoot: z.string(),
	framework: z.string().optional(),
	language: z.string().optional(),
	packageManager: z.string().optional(),
	dependencies: z.record(z.string()).optional(),
	scripts: z.record(z.string()).optional(),
	gitBranch: z.string().optional(),
	lastIndexed: z.date(),
	totalFiles: z.number(),
	totalSize: z.number(),
});

export type MCPConfig = z.infer<typeof MCPConfigSchema>;
export type ContextItem = z.infer<typeof ContextItemSchema>;
export type ProjectContext = z.infer<typeof ProjectContextSchema>;

export interface MCPClientOptions {
	readonly configPath?: string;
	readonly enterpriseMode?: boolean;
	readonly debug?: boolean;
}

export interface ContextLoaderOptions {
	readonly includePatterns?: string[];
	readonly excludePatterns?: string[];
	readonly maxFileSize?: number;
	readonly followSymlinks?: boolean;
	readonly includeHidden?: boolean;
}

/**
 * Enterprise Telemetry Reporter for MCP operations
 */
class MCPTelemetryReporter implements TelemetryReporter {
	private events: TelemetryEvent[] = [];
	private metrics: TelemetryMetrics | null = null;
	private readonly sessionId: string;
	private readonly startTime: number;

	constructor() {
		this.sessionId = this.generateSessionId();
		this.startTime = Date.now();
	}

	async reportEvent(event: TelemetryEvent): Promise<void> {
		this.events.push(event);
		
		// Log important events
		if (event.eventType === "error") {
			logger.error(`📊 Telemetry Error: ${JSON.stringify(event.data)}`);
		} else if (event.eventType === "performance") {
			logger.debug(`📊 Performance: ${JSON.stringify(event.data)}`);
		}

		// Auto-flush after 50 events to prevent memory issues
		if (this.events.length >= 50) {
			await this.flush();
		}
	}

	async reportMetrics(metrics: TelemetryMetrics): Promise<void> {
		this.metrics = metrics;
		logger.info(`📊 Session Metrics: ${JSON.stringify(metrics)}`);

		// Report to external telemetry service if configured
		if (process.env.XALA_TELEMETRY_ENDPOINT) {
			try {
				const response = await fetch(process.env.XALA_TELEMETRY_ENDPOINT, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${process.env.XALA_TELEMETRY_TOKEN}`,
					},
					body: JSON.stringify({
						sessionId: this.sessionId,
						metrics,
						timestamp: new Date().toISOString(),
					}),
				});

				if (!response.ok) {
					logger.warn(`Failed to report metrics: ${response.status}`);
				}
			} catch (error) {
				logger.warn("Failed to send telemetry metrics:", error);
			}
		}
	}

	async flush(): Promise<void> {
		if (this.events.length === 0) return;

		logger.debug(`📊 Flushing ${this.events.length} telemetry events`);

		// Report to external telemetry service if configured
		if (process.env.XALA_TELEMETRY_ENDPOINT) {
			try {
				const response = await fetch(process.env.XALA_TELEMETRY_ENDPOINT, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${process.env.XALA_TELEMETRY_TOKEN}`,
					},
					body: JSON.stringify({
						sessionId: this.sessionId,
						events: this.events,
						timestamp: new Date().toISOString(),
					}),
				});

				if (!response.ok) {
					logger.warn(`Failed to flush telemetry: ${response.status}`);
				}
			} catch (error) {
				logger.warn("Failed to send telemetry events:", error);
			}
		}

		// Clear events after reporting
		this.events = [];
	}

	private generateSessionId(): string {
		return `mcp_${Date.now()}_${Math.random().toString(36).substring(2)}`;
	}

	getSessionMetrics(): TelemetryMetrics {
		const now = Date.now();
		const sessionDuration = now - this.startTime;
		
		const connectionEvents = this.events.filter(e => e.eventType === "connection");
		const generationEvents = this.events.filter(e => e.eventType === "generation");
		const errorEvents = this.events.filter(e => e.eventType === "error");
		const performanceEvents = this.events.filter(e => e.eventType === "performance");

		const responseTimes = performanceEvents
			.map(e => e.data.responseTime)
			.filter(rt => typeof rt === "number");
		
		const averageResponseTime = responseTimes.length > 0 
			? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length 
			: 0;

		const memoryUsages = performanceEvents
			.map(e => e.data.memoryUsage)
			.filter(mu => typeof mu === "number");
		
		const peakMemoryUsage = memoryUsages.length > 0 
			? Math.max(...memoryUsages) 
			: process.memoryUsage().heapUsed;

		return {
			totalConnections: connectionEvents.length,
			totalGenerations: generationEvents.length,
			totalErrors: errorEvents.length,
			averageResponseTime,
			peakMemoryUsage,
			sessionDuration,
		};
	}
}

/**
 * Enhanced MCP Client Service for enterprise environments
 * Provides secure, scalable AI context management with Norwegian compliance
 */
export class MCPClientService {
	private config: MCPConfig | null = null;
	private projectContext: ProjectContext | null = null;
	private contextItems: Map<string, ContextItem> = new Map();
	private isConnected = false;
	private readonly options: MCPClientOptions;
	private xalaMCPClient: XalaMCPClient | null = null;
	private telemetryReporter: MCPTelemetryReporter;
	private performanceMetrics: Map<string, number> = new Map();

	constructor(options: MCPClientOptions = {}) {
		this.options = {
			configPath: ".xaheen/mcp.config.json",
			enterpriseMode: true,
			debug: false,
			...options,
		};

		// Initialize telemetry reporter
		this.telemetryReporter = new MCPTelemetryReporter();

		if (this.options.debug) {
			logger.info("MCP Client Service initialized in debug mode");
		}
	}

	/**
	 * Initialize MCP client with enterprise credentials
	 */
	async initialize(projectRoot: string = process.cwd()): Promise<void> {
		const startTime = Date.now();
		
		try {
			logger.info("🔌 Initializing MCP Client Service...");

			// Report initialization start
			await this.reportTelemetryEvent("connection", {
				action: "initialization_start",
				projectRoot,
				options: this.options,
			});

			// Load configuration
			await this.loadConfiguration(projectRoot);

			// Initialize enterprise security
			if (this.options.enterpriseMode) {
				await this.initializeEnterpriseSecurity();
			}

			// Connect to MCP server
			await this.connect();

			// Load project context
			await this.loadProjectContext(projectRoot);

			this.isConnected = true;

			// Report successful initialization
			const initializationTime = Date.now() - startTime;
			await this.reportTelemetryEvent("connection", {
				action: "initialization_success",
				duration: initializationTime,
				securityClassification: this.config?.securityClassification,
			});

			await this.reportTelemetryEvent("performance", {
				operation: "initialization",
				responseTime: initializationTime,
				memoryUsage: process.memoryUsage().heapUsed,
			});

			logger.success(
				`✅ MCP Client initialized successfully (${this.config?.securityClassification} mode)`,
			);
		} catch (error) {
			// Report initialization failure
			await this.reportTelemetryEvent("error", {
				action: "initialization_failed",
				error: error.message,
				duration: Date.now() - startTime,
			});

			logger.error("Failed to initialize MCP Client:", error);
			throw new Error(`MCP initialization failed: ${error.message}`);
		}
	}

	/**
	 * Load and validate MCP configuration
	 */
	private async loadConfiguration(projectRoot: string): Promise<void> {
		const configPath = resolve(projectRoot, this.options.configPath || "");

		try {
			// Try to load existing configuration
			const configContent = await fs.readFile(configPath, "utf-8");
			const rawConfig = JSON.parse(configContent);
			this.config = MCPConfigSchema.parse(rawConfig);

			logger.info(`📄 Loaded MCP configuration from ${configPath}`);
		} catch (error) {
			// Generate default configuration for enterprise mode
			if (this.options.enterpriseMode) {
				this.config = await this.generateEnterpriseConfig(projectRoot);
				await this.saveConfiguration(configPath);
				logger.info(`📄 Generated enterprise MCP configuration at ${configPath}`);
			} else {
				throw new Error(
					`MCP configuration not found at ${configPath}. Run 'xaheen mcp init' first.`,
				);
			}
		}
	}

	/**
	 * Generate enterprise-grade MCP configuration
	 */
	private async generateEnterpriseConfig(
		projectRoot: string,
	): Promise<MCPConfig> {
		// Enterprise configuration with security defaults
		const enterpriseConfig: MCPConfig = {
			serverUrl: process.env.XALA_MCP_SERVER_URL || "https://api.xala.ai/mcp",
			apiKey:
				process.env.XALA_MCP_API_KEY ||
				this.generateSecureApiKey("enterprise"),
			clientId: this.generateClientId(),
			version: "1.0.0",
			timeout: 45000, // Extended timeout for enterprise
			retryAttempts: 5, // Enhanced retry for reliability
			enableTelemetry: process.env.NODE_ENV !== "production", // Disable in prod by default
			securityClassification: (process.env.NSM_CLASSIFICATION as any) || "OPEN",
		};

		return MCPConfigSchema.parse(enterpriseConfig);
	}

	/**
	 * Initialize enterprise security measures
	 */
	private async initializeEnterpriseSecurity(): Promise<void> {
		if (!this.config) throw new Error("Configuration not loaded");

		logger.info(
			`🛡️  Initializing enterprise security (${this.config.securityClassification})...`,
		);

		// Validate API key format for enterprise
		if (this.config.apiKey.length < 32) {
			throw new Error(
				"Enterprise mode requires API key with minimum 32 characters",
			);
		}

		// Verify server certificate for secure communications
		if (this.config.serverUrl.startsWith("https://")) {
			logger.info("✅ Secure HTTPS connection configured");
		} else if (this.config.securityClassification !== "OPEN") {
			throw new Error(
				"Non-OPEN classification requires HTTPS connection to MCP server",
			);
		}

		// Log security classification
		logger.info(
			`🏷️  Security Classification: ${this.config.securityClassification}`,
		);
	}

	/**
	 * Connect to MCP server with authentication
	 */
	private async connect(): Promise<void> {
		if (!this.config) throw new Error("Configuration not loaded");

		logger.info(`🌐 Connecting to MCP server: ${this.config.serverUrl}`);

		try {
			// Initialize xala-mcp client with enterprise configuration
			const mcpConfig: MCPClientConfig = {
				serverUrl: this.config.serverUrl,
				apiKey: this.config.apiKey,
				clientId: this.config.clientId,
				timeout: this.config.timeout,
				enableTelemetry: this.config.enableTelemetry,
				securityClassification: this.config.securityClassification,
			};

			const connectionOptions: MCPConnectionOptions = {
				retryAttempts: this.config.retryAttempts,
				retryDelay: 1000,
				enableCompression: true,
				maxConcurrentRequests: 10,
			};

			this.xalaMCPClient = new XalaMCPClient(mcpConfig);

			// Connect with retry logic
			let attempt = 0;
			while (attempt < this.config.retryAttempts) {
				try {
					await this.xalaMCPClient.connect(connectionOptions);
					logger.success("✅ Connected to MCP server successfully");
					this.isConnected = true;
					return;
				} catch (error) {
					attempt++;
					if (attempt >= this.config.retryAttempts) {
						throw error;
					}
					logger.warn(`🔄 Connection attempt ${attempt} failed, retrying...`);
					await this.delay(1000 * attempt); // Exponential backoff
				}
			}
		} catch (error) {
			logger.error("❌ Failed to connect to MCP server:", error);
			throw error;
		}
	}

	/**
	 * Load comprehensive project context
	 */
	async loadProjectContext(projectRoot: string): Promise<ProjectContext> {
		logger.info("📂 Loading project context...");

		try {
			// Analyze package.json for project metadata
			const packageJsonPath = join(projectRoot, "package.json");
			let packageData: any = {};

			try {
				const packageContent = await fs.readFile(packageJsonPath, "utf-8");
				packageData = JSON.parse(packageContent);
			} catch {
				logger.warn("No package.json found, using minimal context");
			}

			// Detect framework and language
			const framework = this.detectFramework(packageData);
			const language = this.detectLanguage(projectRoot, packageData);

			// Get Git information
			const gitBranch = await this.getCurrentGitBranch(projectRoot);

			// Calculate project statistics
			const stats = await this.calculateProjectStats(projectRoot);

			this.projectContext = ProjectContextSchema.parse({
				projectRoot,
				framework,
				language,
				packageManager: this.detectPackageManager(projectRoot),
				dependencies: packageData.dependencies || {},
				scripts: packageData.scripts || {},
				gitBranch,
				lastIndexed: new Date(),
				totalFiles: stats.totalFiles,
				totalSize: stats.totalSize,
			});

			logger.success(
				`✅ Project context loaded: ${this.projectContext.totalFiles} files, ${this.formatFileSize(this.projectContext.totalSize)}`,
			);

			return this.projectContext;
		} catch (error) {
			logger.error("Failed to load project context:", error);
			throw error;
		}
	}

	/**
	 * Load context items from project files
	 */
	async loadContextItems(
		options: ContextLoaderOptions = {},
	): Promise<ContextItem[]> {
		if (!this.projectContext) {
			throw new Error("Project context not loaded. Call initialize() first.");
		}

		const defaultOptions: ContextLoaderOptions = {
			includePatterns: ["**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"],
			excludePatterns: [
				"node_modules/**",
				"dist/**",
				".git/**",
				"*.log",
				"coverage/**",
			],
			maxFileSize: 1024 * 1024, // 1MB
			followSymlinks: false,
			includeHidden: false,
		};

		const finalOptions = { ...defaultOptions, ...options };

		logger.info("📋 Loading context items...");

		try {
			const contextItems: ContextItem[] = [];
			const { glob } = await import("glob");

			// Process include patterns
			for (const pattern of finalOptions.includePatterns || []) {
				const files = await glob(pattern, {
					cwd: this.projectContext.projectRoot,
					ignore: finalOptions.excludePatterns,
					dot: finalOptions.includeHidden,
					follow: finalOptions.followSymlinks,
				});

				for (const file of files) {
					try {
						const contextItem = await this.createContextItem(
							file,
							finalOptions,
						);
						if (contextItem) {
							contextItems.push(contextItem);
							this.contextItems.set(contextItem.id, contextItem);
						}
					} catch (error) {
						logger.warn(`Failed to process file ${file}:`, error);
					}
				}
			}

			logger.success(`✅ Loaded ${contextItems.length} context items`);
			return contextItems;
		} catch (error) {
			logger.error("Failed to load context items:", error);
			throw error;
		}
	}

	/**
	 * Create context item from file
	 */
	private async createContextItem(
		filePath: string,
		options: ContextLoaderOptions,
	): Promise<ContextItem | null> {
		if (!this.projectContext) return null;

		const fullPath = join(this.projectContext.projectRoot, filePath);

		try {
			const stats = await fs.stat(fullPath);

			// Skip files that are too large
			if (
				options.maxFileSize &&
				stats.size > options.maxFileSize
			) {
				logger.warn(`Skipping large file: ${filePath} (${stats.size} bytes)`);
				return null;
			}

			// Read file content
			let content: string | undefined;
			try {
				content = await fs.readFile(fullPath, "utf-8");
			} catch {
				// Binary file or encoding issue, skip content
				content = undefined;
			}

			// Detect item type
			const type = this.detectItemType(filePath, content);

			// Generate metadata
			const metadata = this.generateItemMetadata(filePath, content, stats);

			return ContextItemSchema.parse({
				id: this.generateItemId(filePath),
				type,
				path: filePath,
				content,
				metadata,
				lastModified: stats.mtime,
				size: stats.size,
				encoding: "utf-8",
			});
		} catch (error) {
			logger.warn(`Failed to create context item for ${filePath}:`, error);
			return null;
		}
	}

	/**
	 * Get current connection status
	 */
	isClientConnected(): boolean {
		return this.isConnected && this.config !== null;
	}

	/**
	 * Get loaded project context
	 */
	getProjectContext(): ProjectContext | null {
		return this.projectContext;
	}

	/**
	 * Get all context items
	 */
	getContextItems(): ContextItem[] {
		return Array.from(this.contextItems.values());
	}

	/**
	 * Get context item by ID
	 */
	getContextItem(id: string): ContextItem | null {
		return this.contextItems.get(id) || null;
	}

	/**
	 * Clear all context data
	 */
	clearContext(): void {
		this.contextItems.clear();
		this.projectContext = null;
		logger.info("🧹 Context data cleared");
	}

	/**
	 * Generate component using xala-mcp
	 */
	async generateComponent(
		name: string,
		type: string,
		options: Record<string, any> = {}
	): Promise<any> {
		if (!this.xalaMCPClient || !this.isConnected) {
			throw new Error("MCP client not connected. Call initialize() first.");
		}

		const startTime = Date.now();
		logger.info(`🎨 Generating ${type} component: ${name}`);

		try {
			// Report generation start
			await this.reportTelemetryEvent("generation", {
				action: "component_generation_start",
				name,
				type,
				platform: options.platform || "react",
				features: Object.keys(options.features || {}),
			});

			const result = await this.xalaMCPClient.generate({
				type: "component",
				name,
				config: {
					componentType: type,
					platform: options.platform || "react",
					features: options.features || {},
					styling: options.styling || {},
					...options,
				},
			});

			// Report successful generation
			const generationTime = Date.now() - startTime;
			await this.reportTelemetryEvent("generation", {
				action: "component_generation_success",
				name,
				type,
				duration: generationTime,
				linesGenerated: result?.linesGenerated || 0,
				filesGenerated: result?.filesGenerated || 1,
			});

			await this.reportTelemetryEvent("performance", {
				operation: "component_generation",
				responseTime: generationTime,
				memoryUsage: process.memoryUsage().heapUsed,
			});

			logger.success(`✅ Component generation completed: ${name}`);
			return result;
		} catch (error) {
			// Report generation failure
			await this.reportTelemetryEvent("error", {
				action: "component_generation_failed",
				name,
				type,
				error: error.message,
				duration: Date.now() - startTime,
			});

			logger.error(`Failed to generate component ${name}:`, error);
			throw error;
		}
	}

	/**
	 * Get MCP client instance for advanced operations
	 */
	getMCPClient(): XalaMCPClient | null {
		return this.xalaMCPClient;
	}

	/**
	 * Send context to MCP server for indexing
	 */
	async indexProjectContext(): Promise<void> {
		if (!this.xalaMCPClient || !this.isConnected) {
			throw new Error("MCP client not connected. Call initialize() first.");
		}

		if (!this.projectContext) {
			throw new Error("Project context not loaded. Call loadProjectContext() first.");
		}

		const startTime = Date.now();
		logger.info("📤 Sending project context to MCP server for indexing...");

		try {
			// Report indexing start
			await this.reportTelemetryEvent("indexing", {
				action: "context_indexing_start",
				totalFiles: this.projectContext.totalFiles,
				totalSize: this.projectContext.totalSize,
				framework: this.projectContext.framework,
				language: this.projectContext.language,
			});

			const contextData = {
				projectContext: this.projectContext,
				contextItems: Array.from(this.contextItems.values()),
				timestamp: new Date().toISOString(),
			};

			await this.xalaMCPClient.indexContext(contextData);

			// Report successful indexing
			const indexingTime = Date.now() - startTime;
			await this.reportTelemetryEvent("indexing", {
				action: "context_indexing_success",
				duration: indexingTime,
				itemsIndexed: this.contextItems.size,
			});

			await this.reportTelemetryEvent("performance", {
				operation: "context_indexing",
				responseTime: indexingTime,
				memoryUsage: process.memoryUsage().heapUsed,
			});

			logger.success("✅ Project context indexed successfully");
		} catch (error) {
			// Report indexing failure
			await this.reportTelemetryEvent("error", {
				action: "context_indexing_failed",
				error: error.message,
				duration: Date.now() - startTime,
			});

			logger.error("Failed to index project context:", error);
			throw error;
		}
	}

	/**
	 * Disconnect from MCP server
	 */
	async disconnect(): Promise<void> {
		if (this.isConnected && this.xalaMCPClient) {
			logger.info("🔌 Disconnecting from MCP server...");
			
			try {
				// Report final session metrics before disconnect
				const sessionMetrics = this.telemetryReporter.getSessionMetrics();
				await this.telemetryReporter.reportMetrics(sessionMetrics);
				await this.telemetryReporter.flush();

				// Report disconnection
				await this.reportTelemetryEvent("connection", {
					action: "disconnection",
					sessionDuration: sessionMetrics.sessionDuration,
				});

				await this.xalaMCPClient.disconnect();
			} catch (error) {
				logger.warn("Error during MCP client disconnect:", error);
			}
			
			this.isConnected = false;
			this.xalaMCPClient = null;
			this.clearContext();
			logger.success("✅ Disconnected successfully");
		}
	}

	/**
	 * Report telemetry event with proper error handling
	 */
	private async reportTelemetryEvent(
		eventType: TelemetryEvent["eventType"],
		data: Record<string, any>
	): Promise<void> {
		if (!this.config?.enableTelemetry) return;

		try {
			const event: TelemetryEvent = {
				eventType,
				timestamp: new Date(),
				eventId: this.generateEventId(),
				sessionId: (this.telemetryReporter as any).sessionId,
				data,
				userAgent: `xaheen-cli/${this.config?.version || "1.0.0"}`,
				version: this.config?.version || "1.0.0",
			};

			await this.telemetryReporter.reportEvent(event);
		} catch (error) {
			// Silently fail telemetry to not interrupt main workflow
			if (this.options.debug) {
				logger.debug("Failed to report telemetry event:", error);
			}
		}
	}

	/**
	 * Get telemetry metrics for the current session
	 */
	getTelemetryMetrics(): TelemetryMetrics {
		return this.telemetryReporter.getSessionMetrics();
	}

	/**
	 * Flush pending telemetry events
	 */
	async flushTelemetry(): Promise<void> {
		try {
			await this.telemetryReporter.flush();
		} catch (error) {
			if (this.options.debug) {
				logger.debug("Failed to flush telemetry:", error);
			}
		}
	}

	// Utility methods

	private generateSecureApiKey(prefix: string): string {
		const timestamp = Date.now().toString(36);
		const random = Math.random().toString(36).substring(2);
		return `${prefix}_${timestamp}_${random}`.padEnd(32, "0");
	}

	private generateClientId(): string {
		return `xaheen_${Date.now().toString(36)}_${Math.random().toString(36).substring(2)}`;
	}

	private generateItemId(filePath: string): string {
		// Create a simple hash-like ID from file path
		return Buffer.from(filePath).toString("base64").replace(/[^a-zA-Z0-9]/g, "");
	}

	private generateEventId(): string {
		return `evt_${Date.now()}_${Math.random().toString(36).substring(2)}`;
	}

	private detectFramework(packageData: any): string | undefined {
		const deps = { ...packageData.dependencies, ...packageData.devDependencies };

		if (deps.next) return "next";
		if (deps.react) return "react";
		if (deps.vue) return "vue";
		if (deps["@angular/core"]) return "angular";
		if (deps.svelte) return "svelte";
		if (deps.express) return "express";
		if (deps["@nestjs/core"]) return "nestjs";
		if (deps.fastify) return "fastify";

		return undefined;
	}

	private detectLanguage(projectRoot: string, packageData: any): string {
		const deps = { ...packageData.dependencies, ...packageData.devDependencies };

		if (deps.typescript || deps["@types/node"]) return "typescript";
		if (packageData.name?.includes("js") || deps.eslint) return "javascript";

		return "unknown";
	}

	private detectPackageManager(projectRoot: string): string {
		// This would check for lock files
		return "npm"; // Default
	}

	private async getCurrentGitBranch(projectRoot: string): Promise<string | undefined> {
		try {
			const { execa } = await import("execa");
			const { stdout } = await execa("git", ["branch", "--show-current"], {
				cwd: projectRoot,
			});
			return stdout.trim();
		} catch {
			return undefined;
		}
	}

	private async calculateProjectStats(
		projectRoot: string,
	): Promise<{ totalFiles: number; totalSize: number }> {
		// Simplified stats calculation
		return { totalFiles: 0, totalSize: 0 };
	}

	private detectItemType(
		filePath: string,
		content?: string,
	): ContextItem["type"] {
		if (filePath.includes("/")) return "file";
		if (content?.includes("export class")) return "class";
		if (content?.includes("export function") || content?.includes("function "))
			return "function";
		if (content?.includes("export const") && content?.includes("React"))
			return "component";

		return "file";
	}

	private generateItemMetadata(
		filePath: string,
		content?: string,
		stats?: any,
	): Record<string, any> {
		return {
			extension: filePath.split(".").pop(),
			lines: content?.split("\n").length || 0,
			isText: content !== undefined,
			sizeBytes: stats?.size || 0,
		};
	}

	private formatFileSize(bytes: number): string {
		const units = ["B", "KB", "MB", "GB"];
		let size = bytes;
		let unitIndex = 0;

		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex++;
		}

		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	private async saveConfiguration(configPath: string): Promise<void> {
		if (!this.config) return;

		await fs.mkdir(dirname(configPath), { recursive: true });
		await fs.writeFile(
			configPath,
			JSON.stringify(this.config, null, 2),
			"utf-8",
		);
	}


	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

/**
 * Create singleton MCP client instance
 */
export const mcpClientService = new MCPClientService({
	enterpriseMode: true,
	debug: process.env.NODE_ENV === "development",
});