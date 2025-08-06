/**
 * Plugin Manager for Xaheen CLI
 * Manages community generators, plugins, and extensibility
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * Plugin metadata schema
 */
const PluginMetadataSchema = z.object({
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
});

export type PluginMetadata = z.infer<typeof PluginMetadataSchema>;

/**
 * Plugin installation result
 */
export interface PluginInstallResult {
	readonly success: boolean;
	readonly plugin: PluginMetadata;
	readonly installedPath: string;
	readonly errors: string[];
	readonly warnings: string[];
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
	readonly metadata: PluginMetadata;
	readonly downloadUrl: string;
	readonly checksum: string;
	readonly verified: boolean;
	readonly featured: boolean;
}

/**
 * Plugin search filters
 */
export interface PluginSearchFilters {
	readonly category?: string;
	readonly keyword?: string;
	readonly author?: string;
	readonly certified?: boolean;
	readonly minRating?: number;
	readonly sortBy?: "downloads" | "rating" | "updated" | "name";
	readonly sortOrder?: "asc" | "desc";
	readonly limit?: number;
}

/**
 * Plugin manager for handling community extensions
 */
export class PluginManager {
	private readonly projectPath: string;
	private readonly pluginsPath: string;
	private readonly registryUrl: string;
	private readonly installedPlugins: Map<string, PluginMetadata> = new Map();

	constructor(
		projectPath: string,
		registryUrl: string = "https://registry.xaheen.com/plugins",
	) {
		this.projectPath = projectPath;
		this.pluginsPath = join(projectPath, ".xaheen", "plugins");
		this.registryUrl = registryUrl;
	}

	/**
	 * Initialize plugin system
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure plugins directory exists
			if (!existsSync(this.pluginsPath)) {
				await mkdir(this.pluginsPath, { recursive: true });
			}

			// Load installed plugins
			await this.loadInstalledPlugins();

			logger.info(
				`Plugin system initialized with ${this.installedPlugins.size} plugins`,
			);
		} catch (error) {
			logger.error("Failed to initialize plugin system:", error);
			throw error;
		}
	}

	/**
	 * Search for plugins in the registry
	 */
	public async searchPlugins(
		filters: PluginSearchFilters = {},
	): Promise<PluginRegistryEntry[]> {
		try {
			const queryParams = new URLSearchParams();

			if (filters.category) queryParams.set("category", filters.category);
			if (filters.keyword) queryParams.set("q", filters.keyword);
			if (filters.author) queryParams.set("author", filters.author);
			if (filters.certified !== undefined)
				queryParams.set("certified", filters.certified.toString());
			if (filters.minRating)
				queryParams.set("minRating", filters.minRating.toString());
			if (filters.sortBy) queryParams.set("sortBy", filters.sortBy);
			if (filters.sortOrder) queryParams.set("sortOrder", filters.sortOrder);
			if (filters.limit) queryParams.set("limit", filters.limit.toString());

			const url = `${this.registryUrl}/search?${queryParams}`;

			// In a real implementation, this would make an HTTP request
			// For now, we'll return mock data
			return this.getMockPluginRegistry(filters);
		} catch (error) {
			logger.error("Failed to search plugins:", error);
			return [];
		}
	}

	/**
	 * Install a plugin from the registry
	 */
	public async installPlugin(
		pluginName: string,
		version?: string,
	): Promise<PluginInstallResult> {
		const result: PluginInstallResult = {
			success: false,
			plugin: {} as PluginMetadata,
			installedPath: "",
			errors: [],
			warnings: [],
		};

		try {
			// Check if plugin is already installed
			if (this.installedPlugins.has(pluginName)) {
				result.warnings.push(`Plugin ${pluginName} is already installed`);
				result.plugin = this.installedPlugins.get(pluginName)!;
				result.success = true;
				return result;
			}

			// Search for plugin in registry
			const searchResults = await this.searchPlugins({ keyword: pluginName });
			const pluginEntry = searchResults.find(
				(p) => p.metadata.name === pluginName,
			);

			if (!pluginEntry) {
				result.errors.push(`Plugin ${pluginName} not found in registry`);
				return result;
			}

			// Validate version compatibility
			if (version && pluginEntry.metadata.version !== version) {
				result.errors.push(
					`Version ${version} not available. Available: ${pluginEntry.metadata.version}`,
				);
				return result;
			}

			// Check Xaheen CLI compatibility
			if (!this.isVersionCompatible(pluginEntry.metadata.xaheenVersion)) {
				result.warnings.push(
					`Plugin may not be compatible with current Xaheen CLI version`,
				);
			}

			// Create plugin directory
			const pluginPath = join(this.pluginsPath, pluginName);
			await mkdir(pluginPath, { recursive: true });

			// Download and extract plugin
			await this.downloadPlugin(pluginEntry, pluginPath);

			// Validate plugin structure
			await this.validatePluginStructure(pluginPath);

			// Install plugin dependencies
			await this.installPluginDependencies(pluginPath, pluginEntry.metadata);

			// Register plugin
			this.installedPlugins.set(pluginName, pluginEntry.metadata);
			await this.saveInstalledPlugins();

			result.success = true;
			result.plugin = pluginEntry.metadata;
			result.installedPath = pluginPath;

			logger.info(
				`Successfully installed plugin: ${pluginName}@${pluginEntry.metadata.version}`,
			);
		} catch (error) {
			result.errors.push(`Installation failed: ${error}`);
			logger.error(`Failed to install plugin ${pluginName}:`, error);
		}

		return result;
	}

	/**
	 * Uninstall a plugin
	 */
	public async uninstallPlugin(pluginName: string): Promise<boolean> {
		try {
			if (!this.installedPlugins.has(pluginName)) {
				logger.warn(`Plugin ${pluginName} is not installed`);
				return false;
			}

			const pluginPath = join(this.pluginsPath, pluginName);

			// Remove plugin directory
			if (existsSync(pluginPath)) {
				execSync(`rm -rf "${pluginPath}"`);
			}

			// Unregister plugin
			this.installedPlugins.delete(pluginName);
			await this.saveInstalledPlugins();

			logger.info(`Successfully uninstalled plugin: ${pluginName}`);
			return true;
		} catch (error) {
			logger.error(`Failed to uninstall plugin ${pluginName}:`, error);
			return false;
		}
	}

	/**
	 * List installed plugins
	 */
	public getInstalledPlugins(): PluginMetadata[] {
		return Array.from(this.installedPlugins.values());
	}

	/**
	 * Get plugin details
	 */
	public getPlugin(pluginName: string): PluginMetadata | undefined {
		return this.installedPlugins.get(pluginName);
	}

	/**
	 * Update all plugins
	 */
	public async updateAllPlugins(): Promise<void> {
		const updatePromises = Array.from(this.installedPlugins.keys()).map(
			async (pluginName) => {
				try {
					await this.updatePlugin(pluginName);
				} catch (error) {
					logger.error(`Failed to update plugin ${pluginName}:`, error);
				}
			},
		);

		await Promise.all(updatePromises);
	}

	/**
	 * Update specific plugin
	 */
	public async updatePlugin(pluginName: string): Promise<boolean> {
		try {
			const currentPlugin = this.installedPlugins.get(pluginName);
			if (!currentPlugin) {
				logger.warn(`Plugin ${pluginName} is not installed`);
				return false;
			}

			// Check for updates in registry
			const searchResults = await this.searchPlugins({ keyword: pluginName });
			const latestEntry = searchResults.find(
				(p) => p.metadata.name === pluginName,
			);

			if (!latestEntry) {
				logger.warn(`Plugin ${pluginName} not found in registry`);
				return false;
			}

			// Compare versions
			if (
				this.compareVersions(
					latestEntry.metadata.version,
					currentPlugin.version,
				) <= 0
			) {
				logger.info(`Plugin ${pluginName} is already up to date`);
				return true;
			}

			// Uninstall current version
			await this.uninstallPlugin(pluginName);

			// Install latest version
			const result = await this.installPlugin(pluginName);

			return result.success;
		} catch (error) {
			logger.error(`Failed to update plugin ${pluginName}:`, error);
			return false;
		}
	}

	/**
	 * Validate plugin compatibility
	 */
	public async validatePlugin(pluginName: string): Promise<boolean> {
		try {
			const plugin = this.installedPlugins.get(pluginName);
			if (!plugin) {
				return false;
			}

			const pluginPath = join(this.pluginsPath, pluginName);

			// Check plugin structure
			await this.validatePluginStructure(pluginPath);

			// Check version compatibility
			if (!this.isVersionCompatible(plugin.xaheenVersion)) {
				logger.warn(
					`Plugin ${pluginName} may not be compatible with current Xaheen CLI version`,
				);
			}

			return true;
		} catch (error) {
			logger.error(`Plugin validation failed for ${pluginName}:`, error);
			return false;
		}
	}

	/**
	 * Load plugin generators
	 */
	public async loadPluginGenerators(pluginName: string): Promise<any[]> {
		try {
			const pluginPath = join(this.pluginsPath, pluginName);
			const generatorsPath = join(pluginPath, "generators");

			if (!existsSync(generatorsPath)) {
				return [];
			}

			const generators = [];
			const files = await readdir(generatorsPath);

			for (const file of files) {
				if (file.endsWith(".js") || file.endsWith(".ts")) {
					const generatorPath = join(generatorsPath, file);
					const generator = await import(generatorPath);
					generators.push(generator.default || generator);
				}
			}

			return generators;
		} catch (error) {
			logger.error(
				`Failed to load generators for plugin ${pluginName}:`,
				error,
			);
			return [];
		}
	}

	// Private helper methods

	private async loadInstalledPlugins(): Promise<void> {
		try {
			const pluginListPath = join(this.pluginsPath, "installed.json");

			if (existsSync(pluginListPath)) {
				const content = await readFile(pluginListPath, "utf-8");
				const plugins = JSON.parse(content);

				for (const [name, metadata] of Object.entries(plugins)) {
					const validatedMetadata = PluginMetadataSchema.parse(metadata);
					this.installedPlugins.set(name, validatedMetadata);
				}
			}
		} catch (error) {
			logger.warn("Failed to load installed plugins list:", error);
		}
	}

	private async saveInstalledPlugins(): Promise<void> {
		try {
			const pluginListPath = join(this.pluginsPath, "installed.json");
			const plugins = Object.fromEntries(this.installedPlugins);

			await writeFile(pluginListPath, JSON.stringify(plugins, null, 2));
		} catch (error) {
			logger.error("Failed to save installed plugins list:", error);
		}
	}

	private async downloadPlugin(
		entry: PluginRegistryEntry,
		targetPath: string,
	): Promise<void> {
		// In a real implementation, this would download and extract the plugin
		// For now, we'll create a mock plugin structure
		await this.createMockPlugin(entry.metadata, targetPath);
	}

	private async createMockPlugin(
		metadata: PluginMetadata,
		targetPath: string,
	): Promise<void> {
		// Create package.json
		const packageJson = {
			name: metadata.name,
			version: metadata.version,
			description: metadata.description,
			author: metadata.author,
			license: metadata.license,
			keywords: metadata.keywords,
			xaheen: {
				category: metadata.category,
				version: metadata.xaheenVersion,
			},
		};

		await writeFile(
			join(targetPath, "package.json"),
			JSON.stringify(packageJson, null, 2),
		);

		// Create basic generator structure
		if (metadata.category === "generator") {
			const generatorsPath = join(targetPath, "generators");
			await mkdir(generatorsPath, { recursive: true });

			const sampleGenerator = `
export default class ${metadata.name.replace(/[^a-zA-Z0-9]/g, "")}Generator {
  async generate(context) {
    return {
      success: true,
      files: [],
      message: 'Generated by ${metadata.name} plugin'
    };
  }
}
      `.trim();

			await writeFile(join(generatorsPath, "index.js"), sampleGenerator);
		}

		// Create README
		const readme = `
# ${metadata.name}

${metadata.description}

## Installation

\`\`\`bash
xaheen plugin install ${metadata.name}
\`\`\`

## Usage

This plugin adds ${metadata.category} functionality to Xaheen CLI.

## Author

${metadata.author}

## License

${metadata.license}
    `.trim();

		await writeFile(join(targetPath, "README.md"), readme);
	}

	private async validatePluginStructure(pluginPath: string): Promise<void> {
		const packageJsonPath = join(pluginPath, "package.json");

		if (!existsSync(packageJsonPath)) {
			throw new Error("Plugin must contain package.json");
		}

		const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));

		if (!packageJson.xaheen) {
			throw new Error(
				"Plugin must contain xaheen configuration in package.json",
			);
		}
	}

	private async installPluginDependencies(
		pluginPath: string,
		metadata: PluginMetadata,
	): Promise<void> {
		if (
			!metadata.dependencies ||
			Object.keys(metadata.dependencies).length === 0
		) {
			return;
		}

		try {
			execSync("npm install", { cwd: pluginPath, stdio: "inherit" });
		} catch (error) {
			logger.warn("Failed to install plugin dependencies:", error);
		}
	}

	private isVersionCompatible(requiredVersion: string): boolean {
		// Simple version compatibility check
		// In a real implementation, this would use semver
		return true;
	}

	private compareVersions(version1: string, version2: string): number {
		// Simple version comparison
		// In a real implementation, this would use semver
		const v1Parts = version1.split(".").map(Number);
		const v2Parts = version2.split(".").map(Number);

		for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
			const v1Part = v1Parts[i] || 0;
			const v2Part = v2Parts[i] || 0;

			if (v1Part > v2Part) return 1;
			if (v1Part < v2Part) return -1;
		}

		return 0;
	}

	private getMockPluginRegistry(
		filters: PluginSearchFilters,
	): PluginRegistryEntry[] {
		// Mock plugin registry data
		const mockPlugins: PluginRegistryEntry[] = [
			{
				metadata: {
					name: "xaheen-react-native-generator",
					version: "1.2.0",
					description: "Advanced React Native generator with Expo support",
					author: "Xala Technologies",
					keywords: ["react-native", "mobile", "expo", "generator"],
					category: "generator",
					xaheenVersion: "^2.0.0",
					repository:
						"https://github.com/xala-technologies/xaheen-react-native-generator",
					homepage: "https://xaheen.com/plugins/react-native-generator",
					license: "MIT",
					certified: true,
					downloads: 15420,
					rating: 4.8,
					lastUpdated: new Date().toISOString(),
					dependencies: {
						"@react-native-community/cli": "^12.0.0",
						expo: "^49.0.0",
					},
				},
				downloadUrl:
					"https://registry.xaheen.com/plugins/xaheen-react-native-generator/1.2.0.tgz",
				checksum: "sha256:abc123...",
				verified: true,
				featured: true,
			},
			{
				metadata: {
					name: "xaheen-graphql-generator",
					version: "2.1.0",
					description: "GraphQL API generator with Apollo Server integration",
					author: "Community",
					keywords: ["graphql", "apollo", "api", "generator"],
					category: "generator",
					xaheenVersion: "^2.0.0",
					repository: "https://github.com/community/xaheen-graphql-generator",
					license: "MIT",
					certified: false,
					downloads: 8930,
					rating: 4.5,
					lastUpdated: new Date().toISOString(),
					dependencies: {
						"apollo-server-express": "^3.0.0",
						graphql: "^16.0.0",
					},
				},
				downloadUrl:
					"https://registry.xaheen.com/plugins/xaheen-graphql-generator/2.1.0.tgz",
				checksum: "sha256:def456...",
				verified: true,
				featured: false,
			},
			{
				metadata: {
					name: "xaheen-microservices-template",
					version: "1.0.5",
					description:
						"Microservices architecture templates with Docker and Kubernetes",
					author: "Enterprise Solutions",
					keywords: ["microservices", "docker", "kubernetes", "template"],
					category: "template",
					xaheenVersion: "^2.0.0",
					license: "MIT",
					certified: true,
					downloads: 12100,
					rating: 4.7,
					lastUpdated: new Date().toISOString(),
				},
				downloadUrl:
					"https://registry.xaheen.com/plugins/xaheen-microservices-template/1.0.5.tgz",
				checksum: "sha256:ghi789...",
				verified: true,
				featured: true,
			},
		];

		// Apply filters
		let filteredPlugins = mockPlugins;

		if (filters.category) {
			filteredPlugins = filteredPlugins.filter(
				(p) => p.metadata.category === filters.category,
			);
		}

		if (filters.keyword) {
			const keyword = filters.keyword.toLowerCase();
			filteredPlugins = filteredPlugins.filter(
				(p) =>
					p.metadata.name.toLowerCase().includes(keyword) ||
					p.metadata.description.toLowerCase().includes(keyword) ||
					p.metadata.keywords.some((k) => k.toLowerCase().includes(keyword)),
			);
		}

		if (filters.author) {
			filteredPlugins = filteredPlugins.filter((p) =>
				p.metadata.author.toLowerCase().includes(filters.author.toLowerCase()),
			);
		}

		if (filters.certified !== undefined) {
			filteredPlugins = filteredPlugins.filter(
				(p) => p.metadata.certified === filters.certified,
			);
		}

		if (filters.minRating) {
			filteredPlugins = filteredPlugins.filter(
				(p) => p.metadata.rating >= filters.minRating!,
			);
		}

		// Apply sorting
		if (filters.sortBy) {
			filteredPlugins.sort((a, b) => {
				let aValue: any, bValue: any;

				switch (filters.sortBy) {
					case "downloads":
						aValue = a.metadata.downloads;
						bValue = b.metadata.downloads;
						break;
					case "rating":
						aValue = a.metadata.rating;
						bValue = b.metadata.rating;
						break;
					case "updated":
						aValue = new Date(a.metadata.lastUpdated);
						bValue = new Date(b.metadata.lastUpdated);
						break;
					case "name":
						aValue = a.metadata.name;
						bValue = b.metadata.name;
						break;
					default:
						return 0;
				}

				if (filters.sortOrder === "desc") {
					return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
				} else {
					return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
				}
			});
		}

		// Apply limit
		if (filters.limit) {
			filteredPlugins = filteredPlugins.slice(0, filters.limit);
		}

		return filteredPlugins;
	}
}

/**
 * Create plugin manager instance
 */
export function createPluginManager(
	projectPath: string,
	registryUrl?: string,
): PluginManager {
	return new PluginManager(projectPath, registryUrl);
}

/**
 * Default export
 */
export default PluginManager;
