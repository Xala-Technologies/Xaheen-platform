import * as fs from "fs-extra";
import * as path from "path";
import { z } from "zod";
import type {
	LegacyXaheenConfig,
	MigrationResult,
	XaheenConfig,
	XalaConfig,
} from "../../types/index.js";
import { XaheenConfigSchema } from "../../types/index.js";
import { logger } from "../../utils/logger.js";

export interface ConfigPaths {
	unified: string;
	xaheen: string;
	xala: string;
	packageJson: string;
}

export class ConfigManager {
	private configPaths: ConfigPaths;
	private cachedConfig: XaheenConfig | null = null;

	constructor(projectRoot: string = process.cwd()) {
		this.configPaths = {
			unified: path.join(projectRoot, "xaheen.config.json"),
			xaheen: path.join(projectRoot, ".xaheen", "config.json"),
			xala: path.join(projectRoot, "xala.config.js"),
			packageJson: path.join(projectRoot, "package.json"),
		};
	}

	/**
	 * Load and merge configuration from all available sources
	 */
	public async loadConfig(): Promise<XaheenConfig> {
		if (this.cachedConfig) {
			return this.cachedConfig;
		}

		logger.debug("Loading CLI configuration...");

		// Check for existing unified config first
		if (await fs.pathExists(this.configPaths.unified)) {
			logger.debug("Found CLI configuration file");
			return this.loadUnifiedConfig();
		}

		// Check for legacy configurations and migrate
		const migrationResult = await this.detectAndMigrateLegacyConfigs();

		if (migrationResult.success) {
			logger.info(
				`Successfully migrated from ${migrationResult.source} to CLI config`,
			);
			this.cachedConfig = migrationResult.migratedConfig;
			await this.saveConfig(this.cachedConfig);
			return this.cachedConfig;
		}

		// Create default configuration
		logger.info("No existing configuration found, creating default config");
		return this.createDefaultConfig();
	}

	/**
	 * Save CLI configuration
	 */
	public async saveConfig(config: XaheenConfig): Promise<void> {
		try {
			// Validate configuration before saving
			const validatedConfig = XaheenConfigSchema.parse(config);

			// Ensure directory exists
			await fs.ensureDir(path.dirname(this.configPaths.unified));

			// Save unified config
			await fs.writeJson(this.configPaths.unified, validatedConfig, {
				spaces: 2,
			});

			this.cachedConfig = validatedConfig;
			logger.success("Configuration saved successfully");
		} catch (error) {
			logger.error("Failed to save configuration:", error);
			throw error;
		}
	}

	/**
	 * Update specific configuration sections
	 */
	public async updateConfig(
		updates: Partial<XaheenConfig>,
	): Promise<XaheenConfig> {
		const currentConfig = await this.loadConfig();
		const updatedConfig = this.mergeConfigs(currentConfig, updates);

		await this.saveConfig(updatedConfig);
		return updatedConfig;
	}

	/**
	 * Add a service to the configuration
	 */
	public async addService(
		serviceId: string,
		config: {
			provider: string;
			version?: string;
			config?: Record<string, any>;
		},
	): Promise<void> {
		const currentConfig = await this.loadConfig();

		if (!currentConfig.services) {
			currentConfig.services = {};
		}

		currentConfig.services[serviceId] = config;
		await this.saveConfig(currentConfig);

		logger.success(`Added service: ${serviceId}`);
	}

	/**
	 * Remove a service from the configuration
	 */
	public async removeService(serviceId: string): Promise<void> {
		const currentConfig = await this.loadConfig();

		if (currentConfig.services && currentConfig.services[serviceId]) {
			delete currentConfig.services[serviceId];
			await this.saveConfig(currentConfig);
			logger.success(`Removed service: ${serviceId}`);
		} else {
			logger.warn(`Service not found: ${serviceId}`);
		}
	}

	/**
	 * Update design system configuration
	 */
	public async updateDesignConfig(
		designConfig: Partial<XaheenConfig["design"]>,
	): Promise<void> {
		const currentConfig = await this.loadConfig();

		currentConfig.design = {
			...currentConfig.design,
			...designConfig,
		};

		await this.saveConfig(currentConfig);
		logger.success("Design configuration updated");
	}

	/**
	 * Update AI configuration
	 */
	public async updateAIConfig(
		aiConfig: Partial<XaheenConfig["ai"]>,
	): Promise<void> {
		const currentConfig = await this.loadConfig();

		currentConfig.ai = {
			...currentConfig.ai,
			...aiConfig,
		};

		await this.saveConfig(currentConfig);
		logger.success("AI configuration updated");
	}

	/**
	 * Get monorepo structure information
	 */
	public async getMonorepoInfo(): Promise<{
		isMonorepo: boolean;
		structure: "apps-packages" | "workspaces" | "nx" | null;
		apps: string[];
		packages: string[];
	}> {
		try {
			const packageJson = await fs.readJson(this.configPaths.packageJson);

			// Check for workspaces (lerna/yarn/npm workspaces)
			if (packageJson.workspaces) {
				const apps = await this.getDirectoryContents("apps");
				const packages = await this.getDirectoryContents("packages");

				return {
					isMonorepo: true,
					structure:
						apps.length > 0 && packages.length > 0
							? "apps-packages"
							: "workspaces",
					apps,
					packages,
				};
			}

			// Check for nx
			if (
				await fs.pathExists(
					path.join(path.dirname(this.configPaths.packageJson), "nx.json"),
				)
			) {
				return {
					isMonorepo: true,
					structure: "nx",
					apps: await this.getDirectoryContents("apps"),
					packages: await this.getDirectoryContents("libs"),
				};
			}

			return {
				isMonorepo: false,
				structure: null,
				apps: [],
				packages: [],
			};
		} catch (error) {
			logger.warn("Could not determine monorepo structure:", error);
			return {
				isMonorepo: false,
				structure: null,
				apps: [],
				packages: [],
			};
		}
	}

	private async loadUnifiedConfig(): Promise<XaheenConfig> {
		try {
			const config = await fs.readJson(this.configPaths.unified);
			const validatedConfig = XaheenConfigSchema.parse(config);
			this.cachedConfig = validatedConfig;
			return validatedConfig;
		} catch (error) {
			logger.error("Failed to load CLI configuration:", error);
			throw error;
		}
	}

	private async detectAndMigrateLegacyConfigs(): Promise<MigrationResult> {
		// Check for xaheen-cli config
		if (await fs.pathExists(this.configPaths.xaheen)) {
			return this.migrateFromXaheen();
		}

		// Check for xala-cli config
		if (await fs.pathExists(this.configPaths.xala)) {
			return this.migrateFromXala();
		}

		return {
			success: false,
			source: "xaheen-cli",
			migratedConfig: await this.createDefaultConfig(),
			warnings: ["No legacy configuration files found"],
			errors: [],
		};
	}

	private async migrateFromXaheen(): Promise<MigrationResult> {
		try {
			logger.info("Migrating from xaheen-cli configuration...");

			const xaheenConfig: LegacyXaheenConfig = await fs.readJson(
				this.configPaths.xaheen,
			);

			const unifiedConfig: XaheenConfig = {
				version: "3.0.0",
				project: {
					name: xaheenConfig.project.name,
					framework: xaheenConfig.project.framework,
					packageManager: xaheenConfig.project.packageManager as any,
				},
				services: xaheenConfig.services,
				design: {
					platform: this.inferPlatformFromFramework(
						xaheenConfig.project.framework,
					),
				},
				compliance: {
					accessibility: "AAA" as const,
					norwegian: true, // xaheen-cli has Norwegian compliance by default
					gdpr: true,
				},
			};

			return {
				success: true,
				source: "xaheen-cli",
				migratedConfig: unifiedConfig,
				warnings: ["Migrated from xaheen-cli configuration"],
				errors: [],
			};
		} catch (error) {
			return {
				success: false,
				source: "xaheen-cli",
				migratedConfig: await this.createDefaultConfig(),
				warnings: [],
				errors: [`Failed to migrate xaheen-cli config: ${error}`],
			};
		}
	}

	private async migrateFromXala(): Promise<MigrationResult> {
		try {
			logger.info("Migrating from xala-cli configuration...");

			// Load xala config (JavaScript file)
			const configPath = this.configPaths.xala;
			delete require.cache[require.resolve(configPath)];
			const xalaConfig: XalaConfig = require(configPath);

			const projectInfo = await this.extractProjectInfoFromPackageJson();

			const unifiedConfig: XaheenConfig = {
				version: "3.0.0",
				project: {
					name: projectInfo.name,
					framework: projectInfo.framework || "react",
					packageManager: (projectInfo.packageManager as any) || "bun",
				},
				design: {
					platform: xalaConfig.platform as any,
					theme: xalaConfig.theme,
					tokens: xalaConfig.tokens,
				},
				ai: xalaConfig.ai
					? {
							provider: xalaConfig.ai.provider as any,
							model: xalaConfig.ai.model,
						}
					: undefined,
				compliance: {
					accessibility: "AAA" as const, // xala-cli enforces AAA by default
					norwegian: false,
					gdpr: false,
				},
			};

			return {
				success: true,
				source: "xala-cli",
				migratedConfig: unifiedConfig,
				warnings: ["Migrated from xala-cli configuration"],
				errors: [],
			};
		} catch (error) {
			return {
				success: false,
				source: "xala-cli",
				migratedConfig: await this.createDefaultConfig(),
				warnings: [],
				errors: [`Failed to migrate xala-cli config: ${error}`],
			};
		}
	}

	private async createDefaultConfig(): Promise<XaheenConfig> {
		const projectInfo = await this.extractProjectInfoFromPackageJson();
		const monorepoInfo = await this.getMonorepoInfo();

		const defaultConfig: XaheenConfig = {
			version: "3.0.0",
			project: {
				name: projectInfo.name,
				framework: projectInfo.framework || "nextjs",
				packageManager: (projectInfo.packageManager as any) || "bun",
			},
			design: {
				platform: "react",
				theme: "default",
			},
			compliance: {
				accessibility: "AAA" as const,
				norwegian: false,
				gdpr: false,
			},
		};

		this.cachedConfig = defaultConfig;
		return defaultConfig;
	}

	private async extractProjectInfoFromPackageJson(): Promise<{
		name: string;
		framework?: string;
		packageManager?: string;
	}> {
		try {
			const packageJson = await fs.readJson(this.configPaths.packageJson);

			return {
				name: packageJson.name || "my-app",
				framework: this.detectFrameworkFromDependencies(
					packageJson.dependencies || {},
				),
				packageManager: this.detectPackageManager(),
			};
		} catch (error) {
			return {
				name: "my-app",
				framework: "nextjs",
				packageManager: "bun",
			};
		}
	}

	private detectFrameworkFromDependencies(
		dependencies: Record<string, string>,
	): string {
		if (dependencies.next) return "nextjs";
		if (dependencies.react && dependencies["react-dom"]) return "react";
		if (dependencies.vue) return "vue";
		if (dependencies["@angular/core"]) return "angular";
		if (dependencies.svelte) return "svelte";

		return "nextjs"; // default
	}

	private detectPackageManager(): string {
		const rootDir = path.dirname(this.configPaths.packageJson);

		if (fs.existsSync(path.join(rootDir, "bun.lockb"))) return "bun";
		if (fs.existsSync(path.join(rootDir, "pnpm-lock.yaml"))) return "pnpm";
		if (fs.existsSync(path.join(rootDir, "yarn.lock"))) return "yarn";
		if (fs.existsSync(path.join(rootDir, "package-lock.json"))) return "npm";

		return "bun"; // default
	}

	private inferPlatformFromFramework(framework: string): any {
		const platformMap: Record<string, string> = {
			nextjs: "react",
			react: "react",
			vue: "vue",
			angular: "angular",
			svelte: "svelte",
		};

		return platformMap[framework] || "react";
	}

	private async getDirectoryContents(dirName: string): Promise<string[]> {
		try {
			const dirPath = path.join(
				path.dirname(this.configPaths.packageJson),
				dirName,
			);
			if (!(await fs.pathExists(dirPath))) return [];

			const items = await fs.readdir(dirPath, { withFileTypes: true });
			return items
				.filter((item) => item.isDirectory())
				.map((item) => item.name);
		} catch (error) {
			return [];
		}
	}

	private mergeConfigs(
		base: XaheenConfig,
		updates: Partial<XaheenConfig>,
	): XaheenConfig {
		return {
			...base,
			...updates,
			project: { ...base.project, ...updates.project },
			services: { ...base.services, ...updates.services },
			design: { ...base.design, ...updates.design },
			ai: { ...base.ai, ...updates.ai },
			compliance: updates.compliance
				? {
						accessibility:
							updates.compliance.accessibility ||
							base.compliance?.accessibility ||
							("AAA" as const),
						norwegian:
							updates.compliance.norwegian ??
							base.compliance?.norwegian ??
							false,
						gdpr: updates.compliance.gdpr ?? base.compliance?.gdpr ?? false,
					}
				: base.compliance,
		} as XaheenConfig;
	}

	/**
	 * Clear cached configuration
	 */
	public clearCache(): void {
		this.cachedConfig = null;
	}

	/**
	 * Validate current configuration
	 */
	public async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
		try {
			const config = await this.loadConfig();
			XaheenConfigSchema.parse(config);
			return { valid: true, errors: [] };
		} catch (error) {
			if (error instanceof z.ZodError) {
				return {
					valid: false,
					errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
				};
			}
			return {
				valid: false,
				errors: [
					error instanceof Error ? error.message : "Unknown validation error",
				],
			};
		}
	}

	/**
	 * Get configuration file paths
	 */
	public getConfigPaths(): ConfigPaths {
		return { ...this.configPaths };
	}
}
