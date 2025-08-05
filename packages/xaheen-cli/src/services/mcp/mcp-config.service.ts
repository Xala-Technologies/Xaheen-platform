/**
 * @fileoverview MCP Configuration Service - EPIC 14 Story 14.4
 * @description Advanced MCP configuration with hierarchical inheritance and validation
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, resolve, dirname } from "path";
import { homedir } from "os";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

// MCP Configuration Schema with comprehensive validation
const MCPServerConfigSchema = z.object({
	url: z.string().url("Invalid MCP server URL"),
	apiKey: z.string().min(32, "API key must be at least 32 characters"),
	clientId: z.string().min(8, "Client ID must be at least 8 characters"),
	timeout: z.number().int().min(1000).max(300000).default(30000),
	retryAttempts: z.number().int().min(1).max(10).default(3),
	retryDelay: z.number().int().min(100).max(10000).default(1000),
	enableCompression: z.boolean().default(true),
	maxConcurrentRequests: z.number().int().min(1).max(100).default(10),
});

const MCPSecurityConfigSchema = z.object({
	enableTelemetry: z.boolean().default(true),
	securityClassification: z
		.enum(["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"])
		.default("OPEN"),
	enableEncryption: z.boolean().default(true),
	certificatePath: z.string().optional(),
	privateKeyPath: z.string().optional(),
	caCertPath: z.string().optional(),
	enableMutualTLS: z.boolean().default(false),
});

const MCPIndexingConfigSchema = z.object({
	maxFileSize: z.number().int().min(1024).max(104857600).default(1048576), // 1MB default, 100MB max
	includePatterns: z.array(z.string()).default([
		"**/*.{ts,tsx,js,jsx,json,md,yml,yaml}",
	]),
	excludePatterns: z.array(z.string()).default([
		"node_modules/**",
		"dist/**",
		".git/**",
		"*.log",
		"coverage/**",
		".next/**",
		"build/**",
	]),
	followSymlinks: z.boolean().default(false),
	includeHidden: z.boolean().default(false),
	enableDeepAnalysis: z.boolean().default(true),
	analyzeTests: z.boolean().default(true),
	analyzeDependencies: z.boolean().default(true),
	generateMetrics: z.boolean().default(true),
	maxTokensPerFile: z.number().int().min(1000).max(100000).default(10000),
});

const MCPPluginConfigSchema = z.object({
	enabled: z.boolean().default(true),
	path: z.string(),
	version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in semver format"),
	config: z.record(z.any()).default({}),
	dependencies: z.array(z.string()).default([]),
	permissions: z.array(z.enum([
		"read:project",
		"write:project",
		"execute:commands",
		"network:external",
		"filesystem:full",
	])).default([]),
});

const MCPNorwegianComplianceSchema = z.object({
	enableGDPRCompliance: z.boolean().default(true),
	enableNSMCompliance: z.boolean().default(true),
	dataProcessingBasis: z.enum([
		"consent",
		"contract",
		"legal_obligation",
		"vital_interests",
		"public_task",
		"legitimate_interests",
	]).default("legitimate_interests"),
	dataRetentionPeriod: z.number().int().min(1).max(2555).default(365), // days
	enableAuditLogging: z.boolean().default(true),
	auditLogPath: z.string().optional(),
	enableDataMinimization: z.boolean().default(true),
	enableRightToErasure: z.boolean().default(true),
});

const MCPConfigSchema = z.object({
	version: z.string().default("1.0.0"),
	environment: z.enum(["development", "staging", "production"]).default("development"),
	server: MCPServerConfigSchema,
	security: MCPSecurityConfigSchema.default({}),
	indexing: MCPIndexingConfigSchema.default({}),
	plugins: z.record(MCPPluginConfigSchema).default({}),
	norwegianCompliance: MCPNorwegianComplianceSchema.default({}),
	customPatterns: z.record(z.array(z.string())).default({}),
	features: z.object({
		aiGeneration: z.boolean().default(true),
		contextIndexing: z.boolean().default(true),
		qualityAnalysis: z.boolean().default(true),
		securityScanning: z.boolean().default(true),
		performanceMonitoring: z.boolean().default(true),
	}).default({}),
	metadata: z.object({
		createdAt: z.date().default(() => new Date()),
		updatedAt: z.date().default(() => new Date()),
		createdBy: z.string().default("xaheen-cli"),
		configVersion: z.string().default("1.0.0"),
	}).default({}),
});

export type MCPConfig = z.infer<typeof MCPConfigSchema>;
export type MCPServerConfig = z.infer<typeof MCPServerConfigSchema>;
export type MCPSecurityConfig = z.infer<typeof MCPSecurityConfigSchema>;
export type MCPIndexingConfig = z.infer<typeof MCPIndexingConfigSchema>;
export type MCPPluginConfig = z.infer<typeof MCPPluginConfigSchema>;
export type MCPNorwegianComplianceConfig = z.infer<typeof MCPNorwegianComplianceSchema>;

export interface MCPConfigServiceOptions {
	readonly projectRoot?: string;
	readonly globalConfigPath?: string;
	readonly debug?: boolean;
	readonly validateOnLoad?: boolean;
}

export interface ConfigHierarchy {
	readonly global: MCPConfig | null;
	readonly project: MCPConfig | null;
	readonly merged: MCPConfig;
	readonly sources: string[];
}

/**
 * Advanced MCP Configuration Service with hierarchical inheritance
 * Supports .xaheenrc files at global and project levels with CLI overrides
 */
export class MCPConfigService {
	private readonly options: MCPConfigServiceOptions;
	private readonly globalConfigPath: string;
	private readonly projectConfigPath: string;
	private cachedConfig: MCPConfig | null = null;
	private hierarchy: ConfigHierarchy | null = null;

	constructor(options: MCPConfigServiceOptions = {}) {
		this.options = {
			projectRoot: process.cwd(),
			globalConfigPath: join(homedir(), ".xaheenrc"),
			debug: false,
			validateOnLoad: true,
			...options,
		};

		this.globalConfigPath = this.options.globalConfigPath!;
		this.projectConfigPath = join(this.options.projectRoot!, ".xaheenrc");
	}

	/**
	 * Load and merge configuration from all sources with hierarchical inheritance
	 * Priority: CLI flags > Project .xaheenrc > Global .xaheenrc > Defaults
	 */
	async loadConfig(cliOverrides: Partial<MCPConfig> = {}): Promise<MCPConfig> {
		try {
			logger.info("🔧 Loading MCP configuration with hierarchical inheritance...");

			// Load configurations from all sources
			const globalConfig = await this.loadGlobalConfig();
			const projectConfig = await this.loadProjectConfig();

			// Create hierarchy information
			const sources: string[] = [];
			if (globalConfig) sources.push("global");
			if (projectConfig) sources.push("project");
			if (Object.keys(cliOverrides).length > 0) sources.push("cli");

			// Merge configurations with proper hierarchy
			let mergedConfig = this.createDefaultConfig();

			// Apply global config
			if (globalConfig) {
				mergedConfig = this.mergeConfigs(mergedConfig, globalConfig);
			}

			// Apply project config (overrides global)
			if (projectConfig) {
				mergedConfig = this.mergeConfigs(mergedConfig, projectConfig);
			}

			// Apply CLI overrides (highest priority)
			if (Object.keys(cliOverrides).length > 0) {
				mergedConfig = this.mergeConfigs(mergedConfig, cliOverrides);
			}

			// Validate merged configuration
			if (this.options.validateOnLoad) {
				mergedConfig = await this.validateConfig(mergedConfig);
			}

			// Cache configuration and hierarchy
			this.cachedConfig = mergedConfig;
			this.hierarchy = {
				global: globalConfig,
				project: projectConfig,
				merged: mergedConfig,
				sources,
			};

			logger.success(`✅ MCP configuration loaded from: ${sources.join(" → ")}`);
			
			if (this.options.debug) {
				logger.debug("Configuration hierarchy:", this.hierarchy);
			}

			return mergedConfig;
		} catch (error) {
			logger.error("Failed to load MCP configuration:", error);
			throw new Error(`MCP configuration loading failed: ${error.message}`);
		}
	}

	/**
	 * Get cached configuration or load if not cached
	 */
	async getConfig(cliOverrides: Partial<MCPConfig> = {}): Promise<MCPConfig> {
		if (!this.cachedConfig || Object.keys(cliOverrides).length > 0) {
			return await this.loadConfig(cliOverrides);
		}
		return this.cachedConfig;
	}

	/**
	 * Get configuration hierarchy information
	 */
	getConfigHierarchy(): ConfigHierarchy | null {
		return this.hierarchy;
	}

	/**
	 * Save configuration to project .xaheenrc
	 */
	async saveProjectConfig(config: Partial<MCPConfig>): Promise<void> {
		try {
			// Ensure directory exists
			await fs.mkdir(dirname(this.projectConfigPath), { recursive: true });

			// Update metadata
			const configWithMetadata = {
				...config,
				metadata: {
					...config.metadata,
					updatedAt: new Date(),
					configVersion: "1.0.0",
				},
			};

			await fs.writeFile(
				this.projectConfigPath,
				JSON.stringify(configWithMetadata, null, 2),
				"utf-8",
			);

			// Clear cache to force reload
			this.cachedConfig = null;
			this.hierarchy = null;

			logger.success(`✅ Project configuration saved to ${this.projectConfigPath}`);
		} catch (error) {
			logger.error("Failed to save project configuration:", error);
			throw new Error(`Failed to save project configuration: ${error.message}`);
		}
	}

	/**
	 * Save configuration to global .xaheenrc
	 */
	async saveGlobalConfig(config: Partial<MCPConfig>): Promise<void> {
		try {
			// Ensure directory exists
			await fs.mkdir(dirname(this.globalConfigPath), { recursive: true });

			// Update metadata
			const configWithMetadata = {
				...config,
				metadata: {
					...config.metadata,
					updatedAt: new Date(),
					configVersion: "1.0.0",
				},
			};

			await fs.writeFile(
				this.globalConfigPath,
				JSON.stringify(configWithMetadata, null, 2),
				"utf-8",
			);

			// Clear cache to force reload
			this.cachedConfig = null;
			this.hierarchy = null;

			logger.success(`✅ Global configuration saved to ${this.globalConfigPath}`);
		} catch (error) {
			logger.error("Failed to save global configuration:", error);
			throw new Error(`Failed to save global configuration: ${error.message}`);
		}
	}

	/**
	 * Initialize default configuration files
	 */
	async initializeConfig(target: "global" | "project" | "both" = "project"): Promise<void> {
		try {
			const defaultConfig = this.createDefaultConfig();

			if (target === "global" || target === "both") {
				await this.saveGlobalConfig(defaultConfig);
			}

			if (target === "project" || target === "both") {
				await this.saveProjectConfig(defaultConfig);
			}

			logger.success("✅ MCP configuration initialized successfully");
		} catch (error) {
			logger.error("Failed to initialize MCP configuration:", error);
			throw error;
		}
	}

	/**
	 * Validate configuration against schema
	 */
	async validateConfig(config: any): Promise<MCPConfig> {
		try {
			// Convert date strings back to Date objects if needed
			if (config.metadata) {
				if (typeof config.metadata.createdAt === "string") {
					config.metadata.createdAt = new Date(config.metadata.createdAt);
				}
				if (typeof config.metadata.updatedAt === "string") {
					config.metadata.updatedAt = new Date(config.metadata.updatedAt);
				}
			}

			const validatedConfig = MCPConfigSchema.parse(config);
			
			// Additional custom validations
			await this.performCustomValidations(validatedConfig);

			return validatedConfig;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessages = error.errors.map(
					(err) => `${err.path.join(".")}: ${err.message}`,
				);
				throw new Error(`Configuration validation failed:\n${errorMessages.join("\n")}`);
			}
			throw error;
		}
	}

	/**
	 * Get configuration schema for documentation or tooling
	 */
	getConfigSchema(): z.ZodSchema {
		return MCPConfigSchema;
	}

	/**
	 * Check if configuration files exist
	 */
	async checkConfigFiles(): Promise<{
		globalExists: boolean;
		projectExists: boolean;
		globalPath: string;
		projectPath: string;
	}> {
		const [globalExists, projectExists] = await Promise.all([
			this.fileExists(this.globalConfigPath),
			this.fileExists(this.projectConfigPath),
		]);

		return {
			globalExists,
			projectExists,
			globalPath: this.globalConfigPath,
			projectPath: this.projectConfigPath,
		};
	}

	/**
	 * Reset configuration cache
	 */
	clearCache(): void {
		this.cachedConfig = null;
		this.hierarchy = null;
		logger.debug("Configuration cache cleared");
	}

	// Private methods

	private async loadGlobalConfig(): Promise<MCPConfig | null> {
		try {
			if (!(await this.fileExists(this.globalConfigPath))) {
				logger.debug("Global configuration file not found");
				return null;
			}

			const content = await fs.readFile(this.globalConfigPath, "utf-8");
			const config = JSON.parse(content);
			
			logger.debug(`Global configuration loaded from ${this.globalConfigPath}`);
			return config;
		} catch (error) {
			logger.warn(`Failed to load global configuration: ${error.message}`);
			return null;
		}
	}

	private async loadProjectConfig(): Promise<MCPConfig | null> {
		try {
			if (!(await this.fileExists(this.projectConfigPath))) {
				logger.debug("Project configuration file not found");
				return null;
			}

			const content = await fs.readFile(this.projectConfigPath, "utf-8");
			const config = JSON.parse(content);
			
			logger.debug(`Project configuration loaded from ${this.projectConfigPath}`);
			return config;
		} catch (error) {
			logger.warn(`Failed to load project configuration: ${error.message}`);
			return null;
		}
	}

	private createDefaultConfig(): MCPConfig {
		// Generate secure defaults
		const defaultApiKey = this.generateSecureApiKey();
		const defaultClientId = this.generateClientId();

		return {
			version: "1.0.0",
			environment: "development",
			server: {
				url: process.env.XALA_MCP_SERVER_URL || "https://api.xala.ai/mcp",
				apiKey: process.env.XALA_MCP_API_KEY || defaultApiKey,
				clientId: process.env.XALA_MCP_CLIENT_ID || defaultClientId,
				timeout: 30000,
				retryAttempts: 3,
				retryDelay: 1000,
				enableCompression: true,
				maxConcurrentRequests: 10,
			},
			security: {
				enableTelemetry: process.env.NODE_ENV !== "production",
				securityClassification: (process.env.NSM_CLASSIFICATION as any) || "OPEN",
				enableEncryption: true,
				enableMutualTLS: false,
			},
			indexing: {
				maxFileSize: 1048576, // 1MB
				includePatterns: ["**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"],
				excludePatterns: [
					"node_modules/**",
					"dist/**",
					".git/**",
					"*.log",
					"coverage/**",
					".next/**",
					"build/**",
				],
				followSymlinks: false,
				includeHidden: false,
				enableDeepAnalysis: true,
				analyzeTests: true,
				analyzeDependencies: true,
				generateMetrics: true,
				maxTokensPerFile: 10000,
			},
			plugins: {},
			norwegianCompliance: {
				enableGDPRCompliance: true,
				enableNSMCompliance: true,
				dataProcessingBasis: "legitimate_interests",
				dataRetentionPeriod: 365,
				enableAuditLogging: true,
				enableDataMinimization: true,
				enableRightToErasure: true,
			},
			customPatterns: {},
			features: {
				aiGeneration: true,
				contextIndexing: true,
				qualityAnalysis: true,
				securityScanning: true,
				performanceMonitoring: true,
			},
			metadata: {
				createdAt: new Date(),
				updatedAt: new Date(),
				createdBy: "xaheen-cli",
				configVersion: "1.0.0",
			},
		};
	}

	private mergeConfigs(base: any, override: any): any {
		const result = { ...base };

		for (const [key, value] of Object.entries(override)) {
			if (value === null || value === undefined) {
				continue;
			}

			if (
				typeof value === "object" &&
				!Array.isArray(value) &&
				!(value instanceof Date) &&
				typeof result[key] === "object" &&
				!Array.isArray(result[key]) &&
				!(result[key] instanceof Date)
			) {
				result[key] = this.mergeConfigs(result[key], value);
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	private async performCustomValidations(config: MCPConfig): Promise<void> {
		// Validate server URL accessibility (non-blocking)
		if (config.server.url.startsWith("https://")) {
			// HTTPS validation passed
		} else if (config.security.securityClassification !== "OPEN") {
			throw new Error(
				"Non-OPEN security classification requires HTTPS server URL",
			);
		}

		// Validate file size limits
		if (config.indexing.maxFileSize > 104857600) { // 100MB
			logger.warn("Large file size limit may impact performance");
		}

		// Validate Norwegian compliance settings
		if (config.norwegianCompliance.enableGDPRCompliance) {
			if (!config.norwegianCompliance.enableAuditLogging) {
				logger.warn("GDPR compliance recommended with audit logging enabled");
			}
		}

		// Validate plugin configurations
		for (const [pluginName, pluginConfig] of Object.entries(config.plugins)) {
			if (pluginConfig.enabled && !pluginConfig.path) {
				throw new Error(`Plugin ${pluginName} is enabled but has no path specified`);
			}
		}
	}

	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	private generateSecureApiKey(): string {
		const timestamp = Date.now().toString(36);
		const random = Math.random().toString(36).substring(2);
		const entropy = Math.random().toString(36).substring(2);
		return `xaheen_${timestamp}_${random}_${entropy}`.padEnd(64, "0");
	}

	private generateClientId(): string {
		const hostname = require("os").hostname();
		const timestamp = Date.now().toString(36);
		const random = Math.random().toString(36).substring(2);
		return `${hostname}_${timestamp}_${random}`.substring(0, 32);
	}
}

/**
 * Create singleton MCP configuration service
 */
export const mcpConfigService = new MCPConfigService({
	debug: process.env.NODE_ENV === "development",
});