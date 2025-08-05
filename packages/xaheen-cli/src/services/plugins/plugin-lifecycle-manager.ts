/**
 * Plugin Lifecycle Manager for Xaheen CLI
 * Manages plugin installation, activation, deactivation, and lifecycle events
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";
import type { PluginMetadata } from "./plugin-manager.js";

/**
 * Plugin lifecycle state schema
 */
const PluginStateSchema = z.object({
	name: z.string(),
	version: z.string(),
	status: z.enum(["installed", "active", "inactive", "error", "updating"]),
	installedAt: z.string(),
	lastActivated: z.string().optional(),
	lastDeactivated: z.string().optional(),
	activationCount: z.number().default(0),
	errorMessage: z.string().optional(),
	dependencies: z.array(z.string()).default([]),
	dependents: z.array(z.string()).default([]),
});

export type PluginState = z.infer<typeof PluginStateSchema>;

/**
 * Plugin lifecycle events
 */
export interface PluginLifecycleEvents {
	readonly pluginInstalled: (plugin: PluginMetadata) => void;
	readonly pluginUninstalled: (pluginName: string) => void;
	readonly pluginActivated: (pluginName: string) => void;
	readonly pluginDeactivated: (pluginName: string) => void;
	readonly pluginError: (pluginName: string, error: Error) => void;
	readonly dependencyResolved: (pluginName: string, dependencies: string[]) => void;
}

/**
 * Plugin activation options
 */
export interface PluginActivationOptions {
	readonly skipDependencyCheck?: boolean;
	readonly force?: boolean;
	readonly dryRun?: boolean;
}

/**
 * Plugin lifecycle result
 */
export interface PluginLifecycleResult {
	readonly success: boolean;
	readonly plugin?: PluginMetadata;
	readonly errors: string[];
	readonly warnings: string[];
	readonly dependenciesResolved?: string[];
}

/**
 * Plugin lifecycle manager
 */
export class PluginLifecycleManager extends EventEmitter {
	private readonly projectPath: string;
	private readonly lifecyclePath: string;
	private readonly pluginStates: Map<string, PluginState> = new Map();
	private readonly activationOrder: string[] = [];

	constructor(projectPath: string) {
		super();
		this.projectPath = projectPath;
		this.lifecyclePath = join(projectPath, ".xaheen", "plugins", "lifecycle.json");
	}

	/**
	 * Initialize lifecycle manager
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure lifecycle directory exists
			const lifecycleDir = join(this.projectPath, ".xaheen", "plugins");
			if (!existsSync(lifecycleDir)) {
				await mkdir(lifecycleDir, { recursive: true });
			}

			// Load plugin states
			await this.loadPluginStates();

			logger.info(
				`Plugin lifecycle manager initialized with ${this.pluginStates.size} plugins`,
			);
		} catch (error) {
			logger.error("Failed to initialize plugin lifecycle manager:", error);
			throw error;
		}
	}

	/**
	 * Register plugin installation
	 */
	public async registerPluginInstallation(
		plugin: PluginMetadata,
	): Promise<PluginLifecycleResult> {
		const result: PluginLifecycleResult = {
			success: false,
			errors: [],
			warnings: [],
		};

		try {
			// Check if plugin is already registered
			if (this.pluginStates.has(plugin.name)) {
				result.warnings.push(`Plugin ${plugin.name} is already registered`);
			}

			// Create plugin state
			const pluginState: PluginState = {
				name: plugin.name,
				version: plugin.version,
				status: "installed",
				installedAt: new Date().toISOString(),
				activationCount: 0,
				dependencies: this.extractDependencies(plugin),
				dependents: [],
			};

			// Register state
			this.pluginStates.set(plugin.name, pluginState);
			await this.savePluginStates();

			// Emit event
			this.emit("pluginInstalled", plugin);

			result.success = true;
			result.plugin = plugin;

			logger.info(`Plugin ${plugin.name} registered successfully`);
		} catch (error) {
			result.errors.push(`Failed to register plugin: ${error}`);
			logger.error(`Failed to register plugin ${plugin.name}:`, error);
		}

		return result;
	}

	/**
	 * Activate plugin
	 */
	public async activatePlugin(
		pluginName: string,
		options: PluginActivationOptions = {},
	): Promise<PluginLifecycleResult> {
		const result: PluginLifecycleResult = {
			success: false,
			errors: [],
			warnings: [],
		};

		try {
			const pluginState = this.pluginStates.get(pluginName);
			if (!pluginState) {
				result.errors.push(`Plugin ${pluginName} is not installed`);
				return result;
			}

			// Check if already active
			if (pluginState.status === "active") {
				result.warnings.push(`Plugin ${pluginName} is already active`);
				result.success = true;
				return result;
			}

			// Resolve dependencies
			if (!options.skipDependencyCheck) {
				const dependencyResult = await this.resolveDependencies(
					pluginName,
					options,
				);
				if (!dependencyResult.success) {
					result.errors.push(...dependencyResult.errors);
					return result;
				}
				result.dependenciesResolved = dependencyResult.dependenciesResolved;
			}

			// Dry run check
			if (options.dryRun) {
				result.success = true;
				result.warnings.push("Dry run mode - no changes made");
				return result;
			}

			// Update plugin state
			pluginState.status = "active";
			pluginState.lastActivated = new Date().toISOString();
			pluginState.activationCount++;
			pluginState.errorMessage = undefined;

			// Add to activation order
			if (!this.activationOrder.includes(pluginName)) {
				this.activationOrder.push(pluginName);
			}

			// Save state
			await this.savePluginStates();

			// Emit event
			this.emit("pluginActivated", pluginName);

			result.success = true;

			logger.info(`Plugin ${pluginName} activated successfully`);
		} catch (error) {
			const errorMessage = `Failed to activate plugin: ${error}`;
			result.errors.push(errorMessage);

			// Update plugin state with error
			const pluginState = this.pluginStates.get(pluginName);
			if (pluginState) {
				pluginState.status = "error";
				pluginState.errorMessage = errorMessage;
				await this.savePluginStates();
			}

			this.emit("pluginError", pluginName, error as Error);
			logger.error(`Failed to activate plugin ${pluginName}:`, error);
		}

		return result;
	}

	/**
	 * Deactivate plugin
	 */
	public async deactivatePlugin(
		pluginName: string,
		options: PluginActivationOptions = {},
	): Promise<PluginLifecycleResult> {
		const result: PluginLifecycleResult = {
			success: false,
			errors: [],
			warnings: [],
		};

		try {
			const pluginState = this.pluginStates.get(pluginName);
			if (!pluginState) {
				result.errors.push(`Plugin ${pluginName} is not installed`);
				return result;
			}

			// Check if already inactive
			if (pluginState.status === "inactive") {
				result.warnings.push(`Plugin ${pluginName} is already inactive`);
				result.success = true;
				return result;
			}

			// Check for dependents
			const dependents = this.getDependents(pluginName);
			if (dependents.length > 0 && !options.force) {
				result.errors.push(
					`Cannot deactivate plugin ${pluginName}. The following plugins depend on it: ${dependents.join(", ")}`,
				);
				return result;
			}

			// Deactivate dependents first if forced
			if (dependents.length > 0 && options.force) {
				for (const dependent of dependents) {
					const dependentResult = await this.deactivatePlugin(dependent, {
						...options,
						force: true,
					});
					if (!dependentResult.success) {
						result.warnings.push(
							`Failed to deactivate dependent plugin ${dependent}`,
						);
					}
				}
			}

			// Dry run check
			if (options.dryRun) {
				result.success = true;
				result.warnings.push("Dry run mode - no changes made");
				return result;
			}

			// Update plugin state
			pluginState.status = "inactive";
			pluginState.lastDeactivated = new Date().toISOString();
			pluginState.errorMessage = undefined;

			// Remove from activation order
			const orderIndex = this.activationOrder.indexOf(pluginName);
			if (orderIndex !== -1) {
				this.activationOrder.splice(orderIndex, 1);
			}

			// Save state
			await this.savePluginStates();

			// Emit event
			this.emit("pluginDeactivated", pluginName);

			result.success = true;

			logger.info(`Plugin ${pluginName} deactivated successfully`);
		} catch (error) {
			const errorMessage = `Failed to deactivate plugin: ${error}`;
			result.errors.push(errorMessage);

			// Update plugin state with error
			const pluginState = this.pluginStates.get(pluginName);
			if (pluginState) {
				pluginState.status = "error";
				pluginState.errorMessage = errorMessage;
				await this.savePluginStates();
			}

			this.emit("pluginError", pluginName, error as Error);
			logger.error(`Failed to deactivate plugin ${pluginName}:`, error);
		}

		return result;
	}

	/**
	 * Unregister plugin
	 */
	public async unregisterPlugin(pluginName: string): Promise<boolean> {
		try {
			const pluginState = this.pluginStates.get(pluginName);
			if (!pluginState) {
				logger.warn(`Plugin ${pluginName} is not registered`);
				return false;
			}

			// Deactivate if active
			if (pluginState.status === "active") {
				const deactivationResult = await this.deactivatePlugin(pluginName, {
					force: true,
				});
				if (!deactivationResult.success) {
					logger.warn(
						`Failed to deactivate plugin ${pluginName} during unregistration`,
					);
				}
			}

			// Remove from state
			this.pluginStates.delete(pluginName);

			// Remove from activation order
			const orderIndex = this.activationOrder.indexOf(pluginName);
			if (orderIndex !== -1) {
				this.activationOrder.splice(orderIndex, 1);
			}

			// Update dependents
			for (const [, state] of this.pluginStates) {
				const depIndex = state.dependencies.indexOf(pluginName);
				if (depIndex !== -1) {
					state.dependencies.splice(depIndex, 1);
				}
			}

			// Save state
			await this.savePluginStates();

			// Emit event
			this.emit("pluginUninstalled", pluginName);

			logger.info(`Plugin ${pluginName} unregistered successfully`);
			return true;
		} catch (error) {
			logger.error(`Failed to unregister plugin ${pluginName}:`, error);
			return false;
		}
	}

	/**
	 * Get plugin state
	 */
	public getPluginState(pluginName: string): PluginState | undefined {
		return this.pluginStates.get(pluginName);
	}

	/**
	 * Get all plugin states
	 */
	public getAllPluginStates(): readonly PluginState[] {
		return Array.from(this.pluginStates.values());
	}

	/**
	 * Get active plugins
	 */
	public getActivePlugins(): readonly PluginState[] {
		return Array.from(this.pluginStates.values()).filter(
			(state) => state.status === "active",
		);
	}

	/**
	 * Get plugin activation order
	 */
	public getActivationOrder(): readonly string[] {
		return [...this.activationOrder];
	}

	/**
	 * Get plugin dependencies
	 */
	public getPluginDependencies(pluginName: string): readonly string[] {
		const state = this.pluginStates.get(pluginName);
		return state ? state.dependencies : [];
	}

	/**
	 * Get plugins that depend on the given plugin
	 */
	public getDependents(pluginName: string): readonly string[] {
		const dependents: string[] = [];

		for (const [name, state] of this.pluginStates) {
			if (state.dependencies.includes(pluginName)) {
				dependents.push(name);
			}
		}

		return dependents;
	}

	// Private helper methods

	private async loadPluginStates(): Promise<void> {
		try {
			if (existsSync(this.lifecyclePath)) {
				const content = await readFile(this.lifecyclePath, "utf-8");
				const data = JSON.parse(content);

				// Load plugin states
				if (data.states) {
					for (const [name, stateData] of Object.entries(data.states)) {
						try {
							const state = PluginStateSchema.parse(stateData);
							this.pluginStates.set(name, state);
						} catch (error) {
							logger.warn(`Invalid plugin state for ${name}:`, error);
						}
					}
				}

				// Load activation order
				if (Array.isArray(data.activationOrder)) {
					this.activationOrder.push(...data.activationOrder);
				}
			}
		} catch (error) {
			logger.warn("Failed to load plugin states:", error);
		}
	}

	private async savePluginStates(): Promise<void> {
		try {
			const data = {
				states: Object.fromEntries(this.pluginStates),
				activationOrder: this.activationOrder,
				lastUpdated: new Date().toISOString(),
			};

			await writeFile(this.lifecyclePath, JSON.stringify(data, null, 2));
		} catch (error) {
			logger.error("Failed to save plugin states:", error);
		}
	}

	private extractDependencies(plugin: PluginMetadata): string[] {
		const dependencies: string[] = [];

		// Extract from peerDependencies (other plugins)
		if (plugin.peerDependencies) {
			for (const dep of Object.keys(plugin.peerDependencies)) {
				if (dep.startsWith("xaheen-")) {
					dependencies.push(dep);
				}
			}
		}

		return dependencies;
	}

	private async resolveDependencies(
		pluginName: string,
		options: PluginActivationOptions,
	): Promise<PluginLifecycleResult> {
		const result: PluginLifecycleResult = {
			success: false,
			errors: [],
			warnings: [],
			dependenciesResolved: [],
		};

		try {
			const pluginState = this.pluginStates.get(pluginName);
			if (!pluginState) {
				result.errors.push(`Plugin ${pluginName} not found`);
				return result;
			}

			const unresolvedDependencies: string[] = [];

			// Check each dependency
			for (const dependency of pluginState.dependencies) {
				const depState = this.pluginStates.get(dependency);

				if (!depState) {
					unresolvedDependencies.push(dependency);
					continue;
				}

				// Activate dependency if not active
				if (depState.status !== "active") {
					if (options.dryRun) {
						result.warnings.push(
							`Would activate dependency: ${dependency}`,
						);
					} else {
						const depResult = await this.activatePlugin(dependency, {
							...options,
							skipDependencyCheck: false,
						});

						if (!depResult.success) {
							result.errors.push(
								`Failed to activate dependency ${dependency}: ${depResult.errors.join(", ")}`,
							);
							continue;
						}
					}
				}

				result.dependenciesResolved!.push(dependency);
			}

			// Handle unresolved dependencies
			if (unresolvedDependencies.length > 0) {
				result.errors.push(
					`Unresolved dependencies: ${unresolvedDependencies.join(", ")}`,
				);
				return result;
			}

			result.success = true;

			// Emit dependency resolution event
			this.emit("dependencyResolved", pluginName, result.dependenciesResolved!);
		} catch (error) {
			result.errors.push(`Dependency resolution failed: ${error}`);
			logger.error(
				`Failed to resolve dependencies for ${pluginName}:`,
				error,
			);
		}

		return result;
	}
}

/**
 * Default export
 */
export default PluginLifecycleManager;