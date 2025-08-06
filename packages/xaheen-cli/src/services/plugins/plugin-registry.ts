/**
 * Plugin Registry Service for Xaheen CLI
 * Handles plugin discovery, registration, and extensibility APIs
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { existsSync } from "fs";
import { readdir, readFile, stat } from "fs/promises";
import { dirname, join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";
import type { PluginMetadata } from "./plugin-manager";

/**
 * Plugin registry entry schema
 */
const PluginRegistryEntrySchema = z.object({
	metadata: z.object({
		name: z.string(),
		version: z.string(),
		description: z.string(),
		author: z.string(),
		keywords: z.array(z.string()),
		category: z.enum(["generator", "template", "integration", "tool", "theme"]),
		xaheenVersion: z.string(),
		repository: z.string().optional(),
		homepage: z.string().optional(),
		license: z.string().default("MIT"),
		certified: z.boolean().default(false),
		downloads: z.number().default(0),
		rating: z.number().min(0).max(5).default(0),
		lastUpdated: z.string(),
		dependencies: z.record(z.string()).optional(),
		peerDependencies: z.record(z.string()).optional(),
	}),
	pluginPath: z.string(),
	manifestPath: z.string(),
	generators: z.array(z.string()).default([]),
	templates: z.array(z.string()).default([]),
	hooks: z.array(z.string()).default([]),
	commands: z.array(z.string()).default([]),
	api: z.any().optional(),
});

export type PluginRegistryEntry = z.infer<typeof PluginRegistryEntrySchema>;

/**
 * Plugin API interface
 */
export interface PluginAPI {
	readonly version: string;
	readonly generators?: Record<string, any>;
	readonly commands?: Record<string, any>;
	readonly hooks?: Record<string, any>;
	readonly templates?: Record<string, any>;
	readonly middleware?: any[];
	readonly initialize?: (context: PluginContext) => Promise<void>;
	readonly destroy?: () => Promise<void>;
}

/**
 * Plugin context interface
 */
export interface PluginContext {
	readonly projectPath: string;
	readonly pluginPath: string;
	readonly logger: typeof logger;
	readonly emitter: EventEmitter;
	readonly utils: {
		readonly readFile: typeof readFile;
		readonly existsSync: typeof existsSync;
		readonly join: typeof join;
	};
}

/**
 * Plugin discovery options
 */
export interface PluginDiscoveryOptions {
	readonly deep?: boolean;
	readonly includeInactive?: boolean;
	readonly includeBuiltIn?: boolean;
	readonly categories?: string[];
}

/**
 * Plugin registry events
 */
export interface PluginRegistryEvents {
	readonly pluginRegistered: (entry: PluginRegistryEntry) => void;
	readonly pluginUnregistered: (pluginName: string) => void;
	readonly pluginDiscovered: (pluginPath: string) => void;
	readonly registryUpdated: () => void;
}

/**
 * Plugin registry service
 */
export class PluginRegistry extends EventEmitter {
	private readonly projectPath: string;
	private readonly pluginsPath: string;
	private readonly registry: Map<string, PluginRegistryEntry> = new Map();
	private readonly pluginAPIs: Map<string, PluginAPI> = new Map();
	private initialized = false;

	constructor(projectPath: string) {
		super();
		this.projectPath = projectPath;
		this.pluginsPath = join(projectPath, ".xaheen", "plugins");
	}

	/**
	 * Initialize plugin registry
	 */
	public async initialize(): Promise<void> {
		try {
			if (this.initialized) {
				return;
			}

			// Discover and register plugins
			await this.discoverPlugins();

			// Load plugin APIs
			await this.loadPluginAPIs();

			this.initialized = true;

			logger.info(
				`Plugin registry initialized with ${this.registry.size} plugins`,
			);

			this.emit("registryUpdated");
		} catch (error) {
			logger.error("Failed to initialize plugin registry:", error);
			throw error;
		}
	}

	/**
	 * Discover plugins in the plugins directory
	 */
	public async discoverPlugins(
		options: PluginDiscoveryOptions = {},
	): Promise<PluginRegistryEntry[]> {
		const discoveredPlugins: PluginRegistryEntry[] = [];

		try {
			if (!existsSync(this.pluginsPath)) {
				return discoveredPlugins;
			}

			// Scan plugins directory
			const pluginDirs = await readdir(this.pluginsPath);

			for (const pluginDir of pluginDirs) {
				if (pluginDir.startsWith(".")) {
					continue; // Skip hidden files/directories
				}

				const pluginPath = join(this.pluginsPath, pluginDir);
				const pluginStat = await stat(pluginPath);

				if (!pluginStat.isDirectory()) {
					continue;
				}

				try {
					const entry = await this.analyzePlugin(pluginPath);
					if (entry) {
						// Apply filters
						if (
							options.categories &&
							!options.categories.includes(entry.metadata.category)
						) {
							continue;
						}

						discoveredPlugins.push(entry);
						this.registry.set(entry.metadata.name, entry);

						this.emit("pluginDiscovered", pluginPath);
						this.emit("pluginRegistered", entry);
					}
				} catch (error) {
					logger.warn(`Failed to analyze plugin in ${pluginPath}:`, error);
				}
			}

			// Discover built-in plugins if requested
			if (options.includeBuiltIn) {
				const builtInPlugins = await this.discoverBuiltInPlugins();
				discoveredPlugins.push(...builtInPlugins);
			}

			logger.info(`Discovered ${discoveredPlugins.length} plugins`);
		} catch (error) {
			logger.error("Failed to discover plugins:", error);
		}

		return discoveredPlugins;
	}

	/**
	 * Register a plugin
	 */
	public async registerPlugin(
		pluginPath: string,
	): Promise<PluginRegistryEntry | null> {
		try {
			const entry = await this.analyzePlugin(pluginPath);
			if (!entry) {
				return null;
			}

			// Check if plugin is already registered
			if (this.registry.has(entry.metadata.name)) {
				logger.warn(`Plugin ${entry.metadata.name} is already registered`);
				return this.registry.get(entry.metadata.name)!;
			}

			// Register plugin
			this.registry.set(entry.metadata.name, entry);

			// Load plugin API
			await this.loadPluginAPI(entry);

			this.emit("pluginRegistered", entry);

			logger.info(`Plugin ${entry.metadata.name} registered successfully`);

			return entry;
		} catch (error) {
			logger.error(`Failed to register plugin at ${pluginPath}:`, error);
			return null;
		}
	}

	/**
	 * Unregister a plugin
	 */
	public unregisterPlugin(pluginName: string): boolean {
		try {
			if (!this.registry.has(pluginName)) {
				logger.warn(`Plugin ${pluginName} is not registered`);
				return false;
			}

			const entry = this.registry.get(pluginName)!;

			// Cleanup plugin API
			const api = this.pluginAPIs.get(pluginName);
			if (api && api.destroy) {
				api.destroy().catch((error) => {
					logger.warn(`Failed to cleanup plugin ${pluginName}:`, error);
				});
			}

			// Remove from registry
			this.registry.delete(pluginName);
			this.pluginAPIs.delete(pluginName);

			this.emit("pluginUnregistered", pluginName);

			logger.info(`Plugin ${pluginName} unregistered successfully`);

			return true;
		} catch (error) {
			logger.error(`Failed to unregister plugin ${pluginName}:`, error);
			return false;
		}
	}

	/**
	 * Get plugin registry entry
	 */
	public getPlugin(pluginName: string): PluginRegistryEntry | undefined {
		return this.registry.get(pluginName);
	}

	/**
	 * Get all registered plugins
	 */
	public getAllPlugins(): readonly PluginRegistryEntry[] {
		return Array.from(this.registry.values());
	}

	/**
	 * Get plugins by category
	 */
	public getPluginsByCategory(
		category: string,
	): readonly PluginRegistryEntry[] {
		return Array.from(this.registry.values()).filter(
			(entry) => entry.metadata.category === category,
		);
	}

	/**
	 * Get plugin API
	 */
	public getPluginAPI(pluginName: string): PluginAPI | undefined {
		return this.pluginAPIs.get(pluginName);
	}

	/**
	 * Execute plugin generator
	 */
	public async executePluginGenerator(
		pluginName: string,
		generatorName: string,
		context: any,
	): Promise<any> {
		try {
			const api = this.pluginAPIs.get(pluginName);
			if (!api || !api.generators) {
				throw new Error(
					`Plugin ${pluginName} does not have generator ${generatorName}`,
				);
			}

			const generator = api.generators[generatorName];
			if (!generator) {
				throw new Error(
					`Generator ${generatorName} not found in plugin ${pluginName}`,
				);
			}

			if (typeof generator.generate === "function") {
				return await generator.generate(context);
			} else {
				throw new Error(
					`Generator ${generatorName} does not have a generate method`,
				);
			}
		} catch (error) {
			logger.error(
				`Failed to execute generator ${generatorName} from plugin ${pluginName}:`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Get available generators from all plugins
	 */
	public getAvailableGenerators(): Record<string, string[]> {
		const generators: Record<string, string[]> = {};

		for (const [pluginName, api] of this.pluginAPIs) {
			if (api.generators) {
				generators[pluginName] = Object.keys(api.generators);
			}
		}

		return generators;
	}

	/**
	 * Get available commands from all plugins
	 */
	public getAvailableCommands(): Record<string, string[]> {
		const commands: Record<string, string[]> = {};

		for (const [pluginName, api] of this.pluginAPIs) {
			if (api.commands) {
				commands[pluginName] = Object.keys(api.commands);
			}
		}

		return commands;
	}

	/**
	 * Search plugins
	 */
	public searchPlugins(query: string): readonly PluginRegistryEntry[] {
		const normalizedQuery = query.toLowerCase();

		return Array.from(this.registry.values()).filter((entry) => {
			return (
				entry.metadata.name.toLowerCase().includes(normalizedQuery) ||
				entry.metadata.description.toLowerCase().includes(normalizedQuery) ||
				entry.metadata.keywords.some((keyword) =>
					keyword.toLowerCase().includes(normalizedQuery),
				) ||
				entry.metadata.author.toLowerCase().includes(normalizedQuery)
			);
		});
	}

	// Private helper methods

	private async analyzePlugin(
		pluginPath: string,
	): Promise<PluginRegistryEntry | null> {
		try {
			// Check for package.json
			const packageJsonPath = join(pluginPath, "package.json");
			if (!existsSync(packageJsonPath)) {
				return null;
			}

			// Read and parse package.json
			const packageJsonContent = await readFile(packageJsonPath, "utf-8");
			const packageJson = JSON.parse(packageJsonContent);

			// Validate plugin structure
			if (!packageJson.xaheen) {
				return null;
			}

			// Extract metadata
			const metadata: PluginMetadata = {
				name: packageJson.name,
				version: packageJson.version,
				description: packageJson.description || "",
				author: packageJson.author || "Unknown",
				keywords: packageJson.keywords || [],
				category: packageJson.xaheen.category || "tool",
				xaheenVersion: packageJson.xaheen.version || "^2.0.0",
				repository: packageJson.repository?.url || packageJson.repository,
				homepage: packageJson.homepage,
				license: packageJson.license || "MIT",
				certified: packageJson.xaheen.certified || false,
				downloads: 0,
				rating: 0,
				lastUpdated: new Date().toISOString(),
				dependencies: packageJson.dependencies,
				peerDependencies: packageJson.peerDependencies,
			};

			// Discover plugin components
			const generators = await this.discoverPluginGenerators(pluginPath);
			const templates = await this.discoverPluginTemplates(pluginPath);
			const hooks = await this.discoverPluginHooks(pluginPath);
			const commands = await this.discoverPluginCommands(pluginPath);

			const entry: PluginRegistryEntry = {
				metadata,
				pluginPath,
				manifestPath: packageJsonPath,
				generators,
				templates,
				hooks,
				commands,
			};

			return PluginRegistryEntrySchema.parse(entry);
		} catch (error) {
			logger.warn(`Failed to analyze plugin at ${pluginPath}:`, error);
			return null;
		}
	}

	private async discoverPluginGenerators(pluginPath: string): Promise<string[]> {
		const generators: string[] = [];

		try {
			const generatorsPath = join(pluginPath, "generators");
			if (existsSync(generatorsPath)) {
				const files = await readdir(generatorsPath);
				for (const file of files) {
					if (file.endsWith(".js") || file.endsWith(".ts")) {
						generators.push(file.replace(/\.(js|ts)$/, ""));
					}
				}
			}
		} catch (error) {
			logger.warn(`Failed to discover generators in ${pluginPath}:`, error);
		}

		return generators;
	}

	private async discoverPluginTemplates(pluginPath: string): Promise<string[]> {
		const templates: string[] = [];

		try {
			const templatesPath = join(pluginPath, "templates");
			if (existsSync(templatesPath)) {
				const files = await readdir(templatesPath);
				templates.push(...files);
			}
		} catch (error) {
			logger.warn(`Failed to discover templates in ${pluginPath}:`, error);
		}

		return templates;
	}

	private async discoverPluginHooks(pluginPath: string): Promise<string[]> {
		const hooks: string[] = [];

		try {
			const hooksPath = join(pluginPath, "hooks");
			if (existsSync(hooksPath)) {
				const files = await readdir(hooksPath);
				for (const file of files) {
					if (file.endsWith(".js") || file.endsWith(".ts")) {
						hooks.push(file.replace(/\.(js|ts)$/, ""));
					}
				}
			}
		} catch (error) {
			logger.warn(`Failed to discover hooks in ${pluginPath}:`, error);
		}

		return hooks;
	}

	private async discoverPluginCommands(pluginPath: string): Promise<string[]> {
		const commands: string[] = [];

		try {
			const commandsPath = join(pluginPath, "commands");
			if (existsSync(commandsPath)) {
				const files = await readdir(commandsPath);
				for (const file of files) {
					if (file.endsWith(".js") || file.endsWith(".ts")) {
						commands.push(file.replace(/\.(js|ts)$/, ""));
					}
				}
			}
		} catch (error) {
			logger.warn(`Failed to discover commands in ${pluginPath}:`, error);
		}

		return commands;
	}

	private async discoverBuiltInPlugins(): Promise<PluginRegistryEntry[]> {
		// Discover built-in generators, templates, etc.
		// This would scan the CLI's built-in components
		return [];
	}

	private async loadPluginAPIs(): Promise<void> {
		for (const entry of this.registry.values()) {
			await this.loadPluginAPI(entry);
		}
	}

	private async loadPluginAPI(entry: PluginRegistryEntry): Promise<void> {
		try {
			// Look for main entry point
			const mainPath = join(entry.pluginPath, "index.js");
			const tsMainPath = join(entry.pluginPath, "index.ts");

			let entryPoint: string | null = null;

			if (existsSync(mainPath)) {
				entryPoint = mainPath;
			} else if (existsSync(tsMainPath)) {
				entryPoint = tsMainPath;
			}

			if (!entryPoint) {
				logger.warn(`No main entry point found for plugin ${entry.metadata.name}`);
				return;
			}

			// Import plugin API
			const pluginModule = await import(entryPoint);
			const pluginAPI: PluginAPI = pluginModule.default || pluginModule;

			// Validate API structure
			if (typeof pluginAPI !== "object") {
				logger.warn(
					`Invalid plugin API structure for ${entry.metadata.name}`,
				);
				return;
			}

			// Initialize plugin if it has an initialize method
			if (pluginAPI.initialize) {
				const context: PluginContext = {
					projectPath: this.projectPath,
					pluginPath: entry.pluginPath,
					logger,
					emitter: this,
					utils: {
						readFile,
						existsSync,
						join,
					},
				};

				await pluginAPI.initialize(context);
			}

			// Store API
			this.pluginAPIs.set(entry.metadata.name, pluginAPI);

			logger.info(`Loaded API for plugin ${entry.metadata.name}`);
		} catch (error) {
			logger.error(
				`Failed to load API for plugin ${entry.metadata.name}:`,
				error,
			);
		}
	}
}

/**
 * Default export
 */
export default PluginRegistry;