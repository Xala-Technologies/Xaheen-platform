/**
 * @fileoverview MCP Plugin Manager Service - EPIC 14 Story 14.4
 * @description Advanced plugin system with discovery, validation, and lifecycle management
 * @version 1.0.0
 * @compliance Enterprise Security, Norwegian NSM Standards
 */

import { promises as fs } from "fs";
import { join, resolve, dirname, basename, extname } from "path";
import { homedir } from "os";
import { z } from "zod";
import { EventEmitter } from "events";
import { logger } from "../../utils/logger";
import type { MCPConfig, MCPPluginConfig } from "./mcp-config.service";

// Plugin manifest schema
const PluginManifestSchema = z.object({
	name: z.string().min(1, "Plugin name is required"),
	version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in semver format"),
	description: z.string().min(1, "Plugin description is required"),
	author: z.string().optional(),
	license: z.string().default("MIT"),
	homepage: z.string().url().optional(),
	repository: z.string().optional(),
	keywords: z.array(z.string()).default([]),
	main: z.string().default("index.js"),
	type: z.enum(["generator", "transformer", "analyzer", "validator", "pattern"]),
	category: z.enum([
		"component",
		"page",
		"service",
		"architecture",
		"security",
		"performance",
		"accessibility",
		"norwegian-compliance",
		"quality-assurance",
	]),
	engines: z.object({
		node: z.string().default(">=18.0.0"),
		xaheen: z.string().default(">=3.0.0"),
	}).default({}),
	dependencies: z.record(z.string()).default({}),
	peerDependencies: z.record(z.string()).default({}),
	permissions: z.array(z.enum([
		"read:project",
		"write:project",
		"execute:commands",
		"network:external",
		"filesystem:full",
		"environment:read",
		"mcp:generate",
		"mcp:analyze",
	])).default([]),
	domainPatterns: z.record(z.array(z.string())).default({}),
	supportedPlatforms: z.array(z.enum([
		"react",
		"nextjs",
		"vue",
		"angular",
		"svelte",
		"electron",
		"react-native",
		"all",
	])).default(["all"]),
	config: z.object({
		schema: z.record(z.any()).optional(),
		defaults: z.record(z.any()).default({}),
		required: z.array(z.string()).default([]),
	}).default({}),
	hooks: z.object({
		beforeGenerate: z.string().optional(),
		afterGenerate: z.string().optional(),
		beforeAnalyze: z.string().optional(),
		afterAnalyze: z.string().optional(),
		validate: z.string().optional(),
	}).default({}),
	metadata: z.object({
		createdAt: z.string().optional(),
		updatedAt: z.string().optional(),
		downloadCount: z.number().default(0),
		rating: z.number().min(0).max(5).optional(),
		verified: z.boolean().default(false),
		norwegianCompliant: z.boolean().default(false),
		securityAudited: z.boolean().default(false),
	}).default({}),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

// Plugin runtime interface
export interface PluginRuntime {
	readonly manifest: PluginManifest;
	readonly path: string;
	readonly loaded: boolean;
	readonly instance: any;
	readonly config: Record<string, any>;
	readonly lastError?: Error;
}

// Plugin execution context
export interface PluginContext {
	readonly projectRoot: string;
	readonly config: MCPConfig;
	readonly logger: typeof logger;
	readonly platform: string;
	readonly metadata: Record<string, any>;
}

// Plugin hook result
export interface PluginHookResult {
	readonly success: boolean;
	readonly data?: any;
	readonly error?: Error;
	readonly metadata?: Record<string, any>;
}

// Plugin registry entry
export interface PluginRegistryEntry {
	readonly name: string;
	readonly version: string;
	readonly path: string;
	readonly manifest: PluginManifest;
	readonly registeredAt: Date;
	readonly source: "local" | "npm" | "git" | "registry";
	readonly verified: boolean;
	readonly enabled: boolean;
}

export interface PluginManagerOptions {
	readonly pluginDirectories?: string[];
	readonly enableAutoDiscovery?: boolean;
	readonly enableSandboxing?: boolean;
	readonly maxExecutionTime?: number;
	readonly debug?: boolean;
}

/**
 * Advanced MCP Plugin Manager with discovery, validation, and lifecycle management
 */
export class MCPPluginManager extends EventEmitter {
	private readonly options: PluginManagerOptions;
	private readonly pluginRegistry: Map<string, PluginRegistryEntry> = new Map();
	private readonly loadedPlugins: Map<string, PluginRuntime> = new Map();
	private readonly pluginDirectories: string[];
	private isInitialized = false;

	constructor(options: PluginManagerOptions = {}) {
		super();
		
		this.options = {
			enableAutoDiscovery: true,
			enableSandboxing: true,
			maxExecutionTime: 30000,
			debug: false,
			...options,
		};

		// Default plugin directories
		this.pluginDirectories = [
			join(homedir(), ".xaheen", "plugins"),
			join(process.cwd(), "node_modules", "@xaheen"),
			join(process.cwd(), ".xaheen", "plugins"),
			...(this.options.pluginDirectories || []),
		];

		if (this.options.debug) {
			logger.debug("MCP Plugin Manager initialized", {
				directories: this.pluginDirectories,
				options: this.options,
			});
		}
	}

	/**
	 * Initialize plugin manager and discover plugins
	 */
	async initialize(): Promise<void> {
		try {
			logger.info("🔌 Initializing MCP Plugin Manager...");

			// Ensure plugin directories exist
			await this.createPluginDirectories();

			// Discover and register plugins if auto-discovery is enabled
			if (this.options.enableAutoDiscovery) {
				await this.discoverPlugins();
			}

			this.isInitialized = true;
			this.emit("initialized");

			logger.success(`✅ Plugin Manager initialized with ${this.pluginRegistry.size} plugins discovered`);
		} catch (error) {
			logger.error("Failed to initialize Plugin Manager:", error);
			throw error;
		}
	}

	/**
	 * Register a plugin manually
	 */
	async registerPlugin(
		pluginPath: string,
		options: { force?: boolean; source?: "local" | "npm" | "git" | "registry" } = {}
	): Promise<PluginRegistryEntry> {
		try {
			const manifest = await this.loadPluginManifest(pluginPath);
			
			// Validate plugin
			await this.validatePlugin(manifest, pluginPath);

			// Check if plugin already exists
			if (this.pluginRegistry.has(manifest.name) && !options.force) {
				throw new Error(`Plugin ${manifest.name} is already registered`);
			}

			// Create registry entry
			const entry: PluginRegistryEntry = {
				name: manifest.name,
				version: manifest.version,
				path: pluginPath,
				manifest,
				registeredAt: new Date(),
				source: options.source || "local",
				verified: manifest.metadata.verified || false,
				enabled: true,
			};

			// Register plugin
			this.pluginRegistry.set(manifest.name, entry);
			this.emit("plugin:registered", entry);

			logger.success(`✅ Plugin registered: ${manifest.name}@${manifest.version}`);
			return entry;
		} catch (error) {
			logger.error(`Failed to register plugin at ${pluginPath}:`, error);
			throw error;
		}
	}

	/**
	 * Unregister a plugin
	 */
	async unregisterPlugin(pluginName: string): Promise<void> {
		try {
			const entry = this.pluginRegistry.get(pluginName);
			if (!entry) {
				throw new Error(`Plugin ${pluginName} is not registered`);
			}

			// Unload if loaded
			if (this.loadedPlugins.has(pluginName)) {
				await this.unloadPlugin(pluginName);
			}

			// Remove from registry
			this.pluginRegistry.delete(pluginName);
			this.emit("plugin:unregistered", entry);

			logger.success(`✅ Plugin unregistered: ${pluginName}`);
		} catch (error) {
			logger.error(`Failed to unregister plugin ${pluginName}:`, error);
			throw error;
		}
	}

	/**
	 * Load a plugin into runtime
	 */
	async loadPlugin(pluginName: string, config: Record<string, any> = {}): Promise<PluginRuntime> {
		try {
			const entry = this.pluginRegistry.get(pluginName);
			if (!entry) {
				throw new Error(`Plugin ${pluginName} is not registered`);
			}

			if (!entry.enabled) {
				throw new Error(`Plugin ${pluginName} is disabled`);
			}

			// Check if already loaded
			if (this.loadedPlugins.has(pluginName)) {
				return this.loadedPlugins.get(pluginName)!;
			}

			logger.info(`🔄 Loading plugin: ${pluginName}`);

			// Load plugin module
			const pluginMainPath = join(entry.path, entry.manifest.main);
			const pluginModule = await this.loadPluginModule(pluginMainPath);

			// Create plugin runtime
			const runtime: PluginRuntime = {
				manifest: entry.manifest,
				path: entry.path,
				loaded: true,
				instance: pluginModule,
				config: { ...entry.manifest.config.defaults, ...config },
			};

			// Store in loaded plugins
			this.loadedPlugins.set(pluginName, runtime);
			this.emit("plugin:loaded", runtime);

			logger.success(`✅ Plugin loaded: ${pluginName}`);
			return runtime;
		} catch (error) {
			logger.error(`Failed to load plugin ${pluginName}:`, error);
			
			// Store error in runtime for debugging
			const errorRuntime: PluginRuntime = {
				manifest: this.pluginRegistry.get(pluginName)?.manifest!,
				path: this.pluginRegistry.get(pluginName)?.path!,
				loaded: false,
				instance: null,
				config: {},
				lastError: error as Error,
			};
			
			this.loadedPlugins.set(pluginName, errorRuntime);
			throw error;
		}
	}

	/**
	 * Unload a plugin from runtime
	 */
	async unloadPlugin(pluginName: string): Promise<void> {
		try {
			const runtime = this.loadedPlugins.get(pluginName);
			if (!runtime) {
				return; // Already unloaded
			}

			// Call cleanup if available
			if (runtime.instance && typeof runtime.instance.cleanup === "function") {
				await runtime.instance.cleanup();
			}

			// Remove from loaded plugins
			this.loadedPlugins.delete(pluginName);
			this.emit("plugin:unloaded", runtime);

			logger.success(`✅ Plugin unloaded: ${pluginName}`);
		} catch (error) {
			logger.error(`Failed to unload plugin ${pluginName}:`, error);
			throw error;
		}
	}

	/**
	 * Execute a plugin hook
	 */
	async executeHook(
		hookName: string,
		context: PluginContext,
		data?: any
	): Promise<PluginHookResult[]> {
		const results: PluginHookResult[] = [];

		for (const [pluginName, runtime] of this.loadedPlugins) {
			if (!runtime.loaded || !runtime.instance) continue;

			try {
				const hookMethod = runtime.manifest.hooks[hookName as keyof typeof runtime.manifest.hooks];
				if (!hookMethod || typeof runtime.instance[hookMethod] !== "function") {
					continue;
				}

				logger.debug(`Executing hook ${hookName} for plugin ${pluginName}`);

				// Execute with timeout
				const result = await this.executeWithTimeout(
					() => runtime.instance[hookMethod](context, data),
					this.options.maxExecutionTime!
				);

				results.push({
					success: true,
					data: result,
					metadata: { plugin: pluginName, hook: hookName },
				});

				this.emit("hook:executed", { plugin: pluginName, hook: hookName, result });
			} catch (error) {
				logger.warn(`Hook ${hookName} failed for plugin ${pluginName}:`, error);
				
				results.push({
					success: false,
					error: error as Error,
					metadata: { plugin: pluginName, hook: hookName },
				});

				this.emit("hook:error", { plugin: pluginName, hook: hookName, error });
			}
		}

		return results;
	}

	/**
	 * Get all registered plugins
	 */
	getRegisteredPlugins(): PluginRegistryEntry[] {
		return Array.from(this.pluginRegistry.values());
	}

	/**
	 * Get all loaded plugins
	 */
	getLoadedPlugins(): PluginRuntime[] {
		return Array.from(this.loadedPlugins.values());
	}

	/**
	 * Get plugin by name
	 */
	getPlugin(pluginName: string): PluginRegistryEntry | null {
		return this.pluginRegistry.get(pluginName) || null;
	}

	/**
	 * Get loaded plugin runtime
	 */
	getPluginRuntime(pluginName: string): PluginRuntime | null {
		return this.loadedPlugins.get(pluginName) || null;
	}

	/**
	 * Enable or disable a plugin
	 */
	async setPluginEnabled(pluginName: string, enabled: boolean): Promise<void> {
		const entry = this.pluginRegistry.get(pluginName);
		if (!entry) {
			throw new Error(`Plugin ${pluginName} is not registered`);
		}

		// Update registry entry
		const updatedEntry: PluginRegistryEntry = { ...entry, enabled };
		this.pluginRegistry.set(pluginName, updatedEntry);

		// Unload if disabling
		if (!enabled && this.loadedPlugins.has(pluginName)) {
			await this.unloadPlugin(pluginName);
		}

		this.emit("plugin:toggled", { plugin: pluginName, enabled });
		logger.info(`Plugin ${pluginName} ${enabled ? "enabled" : "disabled"}`);
	}

	/**
	 * Get plugins by category
	 */
	getPluginsByCategory(category: PluginManifest["category"]): PluginRegistryEntry[] {
		return Array.from(this.pluginRegistry.values()).filter(
			entry => entry.manifest.category === category
		);
	}

	/**
	 * Get plugins by type
	 */
	getPluginsByType(type: PluginManifest["type"]): PluginRegistryEntry[] {
		return Array.from(this.pluginRegistry.values()).filter(
			entry => entry.manifest.type === type
		);
	}

	/**
	 * Search plugins by keyword
	 */
	searchPlugins(query: string): PluginRegistryEntry[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.pluginRegistry.values()).filter(entry => 
			entry.manifest.name.toLowerCase().includes(lowerQuery) ||
			entry.manifest.description.toLowerCase().includes(lowerQuery) ||
			entry.manifest.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
		);
	}

	/**
	 * Get domain patterns from all plugins
	 */
	getDomainPatterns(): Record<string, string[]> {
		const patterns: Record<string, string[]> = {};

		for (const entry of this.pluginRegistry.values()) {
			for (const [domain, domainPatterns] of Object.entries(entry.manifest.domainPatterns)) {
				if (!patterns[domain]) {
					patterns[domain] = [];
				}
				patterns[domain].push(...domainPatterns);
			}
		}

		return patterns;
	}

	// Private methods

	private async createPluginDirectories(): Promise<void> {
		for (const dir of this.pluginDirectories) {
			try {
				await fs.mkdir(dir, { recursive: true });
			} catch (error) {
				logger.debug(`Failed to create plugin directory ${dir}:`, error);
			}
		}
	}

	private async discoverPlugins(): Promise<void> {
		logger.info("🔍 Discovering plugins...");
		let discoveredCount = 0;

		for (const directory of this.pluginDirectories) {
			try {
				const entries = await fs.readdir(directory, { withFileTypes: true });
				
				for (const entry of entries) {
					if (entry.isDirectory()) {
						const pluginPath = join(directory, entry.name);
						try {
							await this.registerPlugin(pluginPath, { source: "local" });
							discoveredCount++;
						} catch (error) {
							logger.debug(`Skipping invalid plugin at ${pluginPath}:`, error);
						}
					}
				}
			} catch (error) {
				logger.debug(`Failed to scan plugin directory ${directory}:`, error);
			}
		}

		logger.info(`📦 Discovered ${discoveredCount} plugins`);
	}

	private async loadPluginManifest(pluginPath: string): Promise<PluginManifest> {
		const manifestPath = join(pluginPath, "plugin.json");
		
		try {
			const content = await fs.readFile(manifestPath, "utf-8");
			const rawManifest = JSON.parse(content);
			return PluginManifestSchema.parse(rawManifest);
		} catch (error) {
			throw new Error(`Invalid plugin manifest at ${manifestPath}: ${error.message}`);
		}
	}

	private async validatePlugin(manifest: PluginManifest, pluginPath: string): Promise<void> {
		// Check if main file exists
		const mainPath = join(pluginPath, manifest.main);
		try {
			await fs.access(mainPath);
		} catch {
			throw new Error(`Plugin main file not found: ${manifest.main}`);
		}

		// Validate Node.js version requirement
		const nodeVersion = process.version;
		// TODO: Add semver validation

		// Security validation for permissions
		if (manifest.permissions.includes("filesystem:full")) {
			logger.warn(`Plugin ${manifest.name} requests full filesystem access`);
		}

		if (manifest.permissions.includes("network:external")) {
			logger.warn(`Plugin ${manifest.name} requests external network access`);
		}
	}

	private async loadPluginModule(modulePath: string): Promise<any> {
		try {
			// Clear require cache to allow reloading
			delete require.cache[require.resolve(modulePath)];
			
			// Load the module
			const module = require(modulePath);
			
			// Support both CommonJS and ES modules
			return module.default || module;
		} catch (error) {
			throw new Error(`Failed to load plugin module ${modulePath}: ${error.message}`);
		}
	}

	private async executeWithTimeout<T>(
		fn: () => Promise<T>,
		timeout: number
	): Promise<T> {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new Error(`Plugin execution timed out after ${timeout}ms`));
			}, timeout);

			fn()
				.then(resolve)
				.catch(reject)
				.finally(() => clearTimeout(timer));
		});
	}
}

/**
 * Create singleton MCP plugin manager
 */
export const mcpPluginManager = new MCPPluginManager({
	debug: process.env.NODE_ENV === "development",
});