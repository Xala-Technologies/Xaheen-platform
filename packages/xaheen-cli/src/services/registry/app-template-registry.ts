/**
 * App Template Registry
 *
 * Registry for full application templates copied from @xala-cli.
 * These templates are used for creating complete project structures.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-04
 */

import { fileURLToPath } from "node:url";
import { promises as fs, existsSync, mkdirSync } from "node:fs";
import * as path from "path";
import { logger } from "../../utils/logger";
import { templateLoader } from "../templates/template-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AppTemplate {
	name: string;
	framework: string;
	platform: "web" | "desktop" | "mobile";
	description: string;
	files: AppTemplateFile[];
}

export interface AppTemplateFile {
	path: string;
	content: string;
	isTemplate: boolean;
}

export class AppTemplateRegistry {
	private templatesPath: string;
	private templateCache: Map<string, AppTemplate> = new Map();

	constructor() {
		// In development: src/services/registry -> src/templates
		// In production (dist): dist -> src/templates
		const isDist = __dirname.includes("dist");
		this.templatesPath = isDist 
			? path.resolve(__dirname, "../src/templates") 
			: path.resolve(__dirname, "../templates");
	}

	/**
	 * Get app template by framework
	 */
	async getAppTemplate(framework: string): Promise<AppTemplate | null> {
		const cacheKey = framework;

		if (this.templateCache.has(cacheKey)) {
			return this.templateCache.get(cacheKey)!;
		}

		try {
			const template = await this.loadAppTemplate(framework);
			if (template) {
				this.templateCache.set(cacheKey, template);
			}
			return template;
		} catch (error) {
			logger.error(`Failed to load app template for ${framework}:`, error);
			return null;
		}
	}

	/**
	 * Load app template from filesystem
	 */
	private async loadAppTemplate(
		framework: string,
	): Promise<AppTemplate | null> {
		// Determine template path based on framework
		let templatePath: string;
		let platform: "web" | "desktop" | "mobile";

		if (framework === "electron") {
			templatePath = path.join(this.templatesPath, "platforms", framework);
			platform = "desktop";
		} else if (framework === "react-native") {
			templatePath = path.join(this.templatesPath, "platforms", framework);
			platform = "mobile";
		} else {
			// Map framework names to actual template directory names
			const templateMapping: Record<string, string> = {
				nextjs: "next", // "nextjs" framework uses "next" templates
				react: "react",
				vue: "vue", 
				angular: "angular",
				svelte: "svelte",
			};
			
			const templateDir = templateMapping[framework] || framework;
			templatePath = path.join(this.templatesPath, "frontend", templateDir);
			platform = "web";
		}

		if (!existsSync(templatePath)) {
			logger.warn(`App template not found: ${framework} at ${templatePath}`);
			return null;
		}

		const files: AppTemplateFile[] = [];

		await this.scanTemplateDirectory(templatePath, "", files);

		const template: AppTemplate = {
			name: framework,
			framework,
			platform,
			description: `${framework} application template with Xala UI System`,
			files,
		};

		return template;
	}

	/**
	 * Recursively scan template directory
	 */
	private async scanTemplateDirectory(
		dirPath: string,
		relativePath: string,
		files: AppTemplateFile[],
	): Promise<void> {
		const entries = await fs.readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const entryPath = path.join(dirPath, entry.name);
			const relativeEntryPath = path.join(relativePath, entry.name);

			if (entry.isDirectory()) {
				await this.scanTemplateDirectory(entryPath, relativeEntryPath, files);
			} else if (entry.isFile()) {
				const content = await fs.readFile(entryPath, "utf-8");
				const isTemplate = entry.name.endsWith(".hbs");

				// Remove .hbs extension for actual file creation
				const finalPath = isTemplate
					? relativeEntryPath.replace(/\.hbs$/, "")
					: relativeEntryPath;

				files.push({
					path: finalPath,
					content,
					isTemplate,
				});
			}
		}
	}

	/**
	 * Generate app from template
	 */
	async generateAppFromTemplate(
		targetPath: string,
		framework: string,
		variables: Record<string, any>,
	): Promise<void> {
		const template = await this.getAppTemplate(framework);

		if (!template) {
			throw new Error(`App template not found: ${framework}`);
		}

		if (!existsSync(targetPath)) {
			mkdirSync(targetPath, { recursive: true });
		}

		for (const file of template.files) {
			const filePath = path.join(targetPath, file.path);
			const dirPath = path.dirname(filePath);
			if (!existsSync(dirPath)) {
				mkdirSync(dirPath, { recursive: true });
			}

			let content = file.content;
			if (file.isTemplate) {
				// Use the template loader for proper Handlebars rendering
				try {
					// Determine the correct subdirectory and template name for the template
					let subdir: string;
					let templateDir: string;
					
					if (
						template.framework === "electron" ||
						template.framework === "react-native"
					) {
						subdir = "platforms";
						templateDir = template.framework;
					} else {
						subdir = "frontend";
						// Map framework names to actual template directory names
						const templateMapping: Record<string, string> = {
							nextjs: "next", // "nextjs" framework uses "next" templates
							react: "react",
							vue: "vue", 
							angular: "angular",
							svelte: "svelte",
						};
						templateDir = templateMapping[template.framework] || template.framework;
					}

					const relativePath = path.join(
						subdir,
						templateDir,
						file.path + ".hbs",
					);
					content = await templateLoader.renderTemplate(
						relativePath,
						variables,
					);
				} catch (error) {
					logger.warn(
						`Failed to render template ${file.path}, using simple replacement:`,
						error,
					);
					// Fallback to simple template replacement
					content = this.simpleTemplateReplace(content, variables);
				}
			}

			await fs.writeFile(filePath, content);
			logger.debug(`Generated file: ${file.path}`);
		}
	}

	/**
	 * Simple template replacement fallback
	 */
	private simpleTemplateReplace(
		content: string,
		variables: Record<string, any>,
	): string {
		let result = content;
		for (const [key, value] of Object.entries(variables)) {
			const regex = new RegExp(`{{${key}}}`, "g");
			result = result.replace(regex, String(value));
		}
		return result;
	}

	/**
	 * Get platform from framework name
	 */
	private getPlatformFromFramework(
		framework: string,
	): "web" | "desktop" | "mobile" {
		switch (framework) {
			case "electron":
				return "desktop";
			case "react-native":
				return "mobile";
			case "nextjs":
			case "react":
			case "vue":
			case "svelte":
			case "angular":
			default:
				return "web";
		}
	}

	/**
	 * List available app templates
	 */
	async listAvailableTemplates(): Promise<string[]> {
		try {
			const templates: string[] = [];

			// Check frontend templates
			const frontendPath = path.join(this.templatesPath, "frontend");
			if (existsSync(frontendPath)) {
				const frontendEntries = await fs.readdir(frontendPath, {
					withFileTypes: true,
				});
				templates.push(
					...frontendEntries
						.filter((entry) => entry.isDirectory())
						.map((entry) => entry.name),
				);
			}

			// Check platform templates (includes desktop and mobile)
			const platformsPath = path.join(this.templatesPath, "platforms");
			if (existsSync(platformsPath)) {
				const platformEntries = await fs.readdir(platformsPath, {
					withFileTypes: true,
				});
				templates.push(
					...platformEntries
						.filter((entry) => entry.isDirectory())
						.map((entry) => entry.name),
				);
			}

			return templates;
		} catch (error) {
			logger.error("Failed to list app templates:", error);
			return [];
		}
	}

	/**
	 * Clear template cache
	 */
	clearCache(): void {
		this.templateCache.clear();
	}
}

// Singleton instance
export const appTemplateRegistry = new AppTemplateRegistry();
