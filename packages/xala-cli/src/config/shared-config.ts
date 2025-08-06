/**
 * @fileoverview Shared Configuration System
 * @description Unified configuration management for Xala UI CLI and external tool integrations
 */

import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { logger } from "../utils/logger.js";

export interface SharedProjectConfig {
	// Project identification
	name: string;
	version: string;
	type: "standalone" | "xaheen-integrated" | "custom";

	// UI System configuration
	ui: {
		system: "xala";
		version: string;
		theme: string;
		platform: "react" | "nextjs" | "vue" | "nuxt" | "angular";
		compliance: string[];
		customizations: Record<string, any>;
	};

	// Integration settings
	integrations: {
		xaheen?: {
			enabled: boolean;
			version: string;
			features: string[];
			autoSync: boolean;
			hooks: {
				preBuild?: string;
				postGenerate?: string;
				preDeployment?: string;
			};
		};
		// Future integrations
		storybook?: { enabled: boolean; version: string };
		figma?: { enabled: boolean; token?: string };
		contentful?: { enabled: boolean; spaceId?: string };
	};

	// Development settings
	development: {
		hotReload: boolean;
		linting: boolean;
		testing: boolean;
		accessibility: boolean;
	};

	// Build and deployment
	build: {
		outputDir: string;
		optimization: boolean;
		bundleAnalysis: boolean;
		sourceMap: boolean;
	};

	// Compliance and standards
	compliance: {
		norwegian: boolean;
		gdpr: boolean;
		wcag: "A" | "AA" | "AAA";
		security: {
			csp: boolean;
			sanitization: boolean;
			audit: boolean;
		};
	};
}

export class SharedConfigManager {
	private configPath: string;
	private config: SharedProjectConfig | null = null;

	constructor(projectPath: string = process.cwd()) {
		this.configPath = path.join(projectPath, "xala.config.json");
	}

	/**
	 * Load configuration from file or create default
	 */
	async loadConfig(): Promise<SharedProjectConfig> {
		try {
			if (existsSync(this.configPath)) {
				const configContent = await fs.readFile(this.configPath, "utf-8");
				this.config = JSON.parse(configContent);
				await this.migrateConfig(); // Handle version migrations
				return this.config!;
			} else {
				this.config = this.createDefaultConfig();
				await this.saveConfig();
				return this.config;
			}
		} catch (error) {
			logger.error("Failed to load configuration:", error);
			throw error;
		}
	}

	/**
	 * Save configuration to file
	 */
	async saveConfig(): Promise<void> {
		if (!this.config) {
			throw new Error("No configuration to save");
		}

		try {
			await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
			logger.debug("Configuration saved successfully");
		} catch (error) {
			logger.error("Failed to save configuration:", error);
			throw error;
		}
	}

	/**
	 * Update configuration values
	 */
	async updateConfig(updates: Partial<SharedProjectConfig>): Promise<void> {
		if (!this.config) {
			await this.loadConfig();
		}

		this.config = this.deepMerge(this.config!, updates);
		await this.saveConfig();
	}

	/**
	 * Get current configuration
	 */
	getConfig(): SharedProjectConfig {
		if (!this.config) {
			throw new Error("Configuration not loaded. Call loadConfig() first.");
		}
		return this.config;
	}

	/**
	 * Check if Xaheen integration is enabled
	 */
	isXaheenIntegrated(): boolean {
		return this.config?.integrations.xaheen?.enabled === true;
	}

	/**
	 * Enable Xaheen integration
	 */
	async enableXaheenIntegration(xaheenConfig: {
		version: string;
		features: string[];
		autoSync?: boolean;
	}): Promise<void> {
		await this.updateConfig({
			type: "xaheen-integrated",
			integrations: {
				xaheen: {
					enabled: true,
					version: xaheenConfig.version,
					features: xaheenConfig.features,
					autoSync: xaheenConfig.autoSync || true,
					hooks: {
						preBuild: ".xaheen/hooks/pre-build.sh",
						postGenerate: ".xaheen/hooks/post-generate.sh",
						preDeployment: ".xaheen/hooks/pre-deployment.sh",
					},
				},
			},
		});
	}

	/**
	 * Create default configuration
	 */
	private createDefaultConfig(): SharedProjectConfig {
		return {
			name: "untitled-project",
			version: "1.0.0",
			type: "standalone",
			ui: {
				system: "xala",
				version: "1.0.0",
				theme: "enterprise",
				platform: "react",
				compliance: ["wcag-aaa"],
				customizations: {},
			},
			integrations: {
				xaheen: {
					enabled: false,
					version: "1.0.0",
					features: [],
					autoSync: true,
					hooks: {},
				},
			},
			development: {
				hotReload: true,
				linting: true,
				testing: true,
				accessibility: true,
			},
			build: {
				outputDir: "dist",
				optimization: true,
				bundleAnalysis: false,
				sourceMap: true,
			},
			compliance: {
				norwegian: false,
				gdpr: false,
				wcag: "AAA",
				security: {
					csp: true,
					sanitization: true,
					audit: true,
				},
			},
		};
	}

	/**
	 * Handle configuration version migrations
	 */
	private async migrateConfig(): Promise<void> {
		if (!this.config) return;

		// Add migration logic for future versions
		const currentVersion = "1.0.0";
		if (!this.config.ui.version || this.config.ui.version !== currentVersion) {
			logger.info("Migrating configuration to latest version...");
			this.config.ui.version = currentVersion;
			await this.saveConfig();
		}
	}

	/**
	 * Deep merge configuration objects
	 */
	private deepMerge(target: any, source: any): any {
		const result = { ...target };

		for (const key in source) {
			if (
				source[key] !== null &&
				typeof source[key] === "object" &&
				!Array.isArray(source[key])
			) {
				result[key] = this.deepMerge(result[key] || {}, source[key]);
			} else {
				result[key] = source[key];
			}
		}

		return result;
	}

	/**
	 * Export configuration for external tools
	 */
	async exportForTool(
		tool: "xaheen" | "storybook" | "figma",
	): Promise<Record<string, any>> {
		const config = this.getConfig();

		switch (tool) {
			case "xaheen":
				return {
					ui: {
						system: "xala" as const,
						version: config.ui.version,
						theme: config.ui.theme,
						platform: config.ui.platform,
						compliance: config.ui.compliance,
						customizations: config.ui.customizations,
					},
					development: config.development,
					build: config.build,
				};

			case "storybook":
				return {
					addons: ["@storybook/addon-accessibility"],
					framework: config.ui.platform,
					features: {
						buildStoriesJson: true,
					},
				};

			case "figma":
				return {
					theme: config.ui.theme,
					tokens: config.ui.customizations,
				};

			default:
				return {};
		}
	}

	/**
	 * Validate configuration
	 */
	async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
		const errors: string[] = [];

		if (!this.config) {
			errors.push("Configuration not loaded");
			return { valid: false, errors };
		}

		// Validate required fields
		if (!this.config.name) errors.push("Project name is required");
		if (!this.config.ui.platform) errors.push("UI platform is required");
		if (!this.config.ui.theme) errors.push("UI theme is required");

		// Validate platform support
		const supportedPlatforms = ["react", "nextjs", "vue", "nuxt", "angular"];
		if (!supportedPlatforms.includes(this.config.ui.platform)) {
			errors.push(`Unsupported platform: ${this.config.ui.platform}`);
		}

		// Validate Xaheen integration if enabled
		if (this.config.integrations.xaheen?.enabled) {
			if (!this.config.integrations.xaheen.version) {
				errors.push("Xaheen version is required when integration is enabled");
			}
		}

		return { valid: errors.length === 0, errors };
	}
}

/**
 * Global configuration instance
 */
export const sharedConfig = new SharedConfigManager();

/**
 * Configuration utilities
 */
export class ConfigUtils {
	/**
	 * Detect project type from existing files
	 */
	static async detectProjectType(
		projectPath: string = process.cwd(),
	): Promise<"standalone" | "xaheen-integrated" | "custom"> {
		// Check for Xaheen project
		if (existsSync(path.join(projectPath, "xaheen.config.json"))) {
			return "xaheen-integrated";
		}

		// Check for package.json with Xaheen dependency
		const packageJsonPath = path.join(projectPath, "package.json");
		if (existsSync(packageJsonPath)) {
			const packageContent = await fs.readFile(packageJsonPath, "utf-8");
			const packageJson = JSON.parse(packageContent);

			if (
				packageJson.dependencies?.["@xaheen-ai/cli"] ||
				packageJson.devDependencies?.["@xaheen-ai/cli"]
			) {
				return "xaheen-integrated";
			}
		}

		// Check for Xala config
		if (existsSync(path.join(projectPath, "xala.config.json"))) {
			return "standalone";
		}

		return "custom";
	}

	/**
	 * Initialize configuration for specific project type
	 */
	static async initializeConfig(
		projectType: "standalone" | "xaheen-integrated",
		projectPath: string = process.cwd(),
	): Promise<SharedConfigManager> {
		const configManager = new SharedConfigManager(projectPath);
		await configManager.loadConfig();

		if (projectType === "xaheen-integrated") {
			await configManager.updateConfig({
				type: "xaheen-integrated",
				integrations: {
					xaheen: {
						enabled: true,
						version: "1.0.0",
						features: [],
						autoSync: true,
						hooks: {},
					},
				},
			});
		}

		return configManager;
	}

	/**
	 * Sync configuration between tools
	 */
	static async syncWithXaheen(
		xaheenConfigPath: string,
		xalaConfigManager: SharedConfigManager,
	): Promise<void> {
		if (!existsSync(xaheenConfigPath)) {
			throw new Error("Xaheen configuration not found");
		}

		const xaheenConfigContent = await fs.readFile(xaheenConfigPath, "utf-8");
		const xaheenConfig = JSON.parse(xaheenConfigContent);

		// Update Xala config based on Xaheen config
		await xalaConfigManager.updateConfig({
			name: xaheenConfig.name || "xaheen-project",
			ui: {
				system: "xala" as const,
				version: "1.0.0",
				platform: xaheenConfig.stack?.frontend || "react",
				compliance: xaheenConfig.compliance || [],
				theme: xaheenConfig.ui?.theme || "enterprise",
				customizations: {},
			},
			integrations: {
				xaheen: {
					enabled: true,
					version: xaheenConfig.version || "1.0.0",
					features: xaheenConfig.features || [],
					autoSync: true,
					hooks: xaheenConfig.ui?.hooks || {},
				},
			},
		});
	}
}
