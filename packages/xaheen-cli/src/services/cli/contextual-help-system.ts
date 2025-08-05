/**
 * Contextual Help System for Xaheen CLI
 * Provides intelligent help suggestions, documentation, and guidance
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { readFile, readdir, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";
import { z } from "zod";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * Help content schema
 */
const HelpContentSchema = z.object({
	title: z.string(),
	description: z.string(),
	usage: z.string().optional(),
	examples: z.array(
		z.object({
			description: z.string(),
			command: z.string(),
			output: z.string().optional(),
		}),
	).default([]),
	options: z.array(
		z.object({
			flag: z.string(),
			description: z.string(),
			type: z.string().optional(),
			default: z.any().optional(),
			required: z.boolean().default(false),
		}),
	).default([]),
	subcommands: z.array(
		z.object({
			name: z.string(),
			description: z.string(),
			aliases: z.array(z.string()).default([]),
		}),
	).default([]),
	relatedCommands: z.array(z.string()).default([]),
	tips: z.array(z.string()).default([]),
	troubleshooting: z.array(
		z.object({
			issue: z.string(),
			solution: z.string(),
		}),
	).default([]),
	links: z.array(
		z.object({
			title: z.string(),
			url: z.string(),
		}),
	).default([]),
});

export type HelpContent = z.infer<typeof HelpContentSchema>;

/**
 * Help context
 */
export interface HelpContext {
	readonly command: string[];
	readonly currentArg?: string;
	readonly projectPath: string;
	readonly errorContext?: string;
	readonly projectType?: string;
	readonly availableCommands?: string[];
}

/**
 * Smart suggestion
 */
export interface SmartSuggestion {
	readonly type: "command" | "option" | "fix" | "tip" | "example";
	readonly title: string;
	readonly description: string;
	readonly command?: string;
	readonly priority: number;
	readonly category?: string;
}

/**
 * Help formatting options
 */
export interface HelpFormattingOptions {
	readonly colors?: boolean;
	readonly maxWidth?: number;
	readonly compact?: boolean;
	readonly showExamples?: boolean;
	readonly showTips?: boolean;
	readonly showTroubleshooting?: boolean;
}

/**
 * Contextual help system
 */
export class ContextualHelpSystem {
	private readonly projectPath: string;
	private readonly helpCache: Map<string, HelpContent> = new Map();
	private readonly commandDocs: Map<string, HelpContent> = new Map();

	constructor(projectPath: string) {
		this.projectPath = projectPath;
		this.initializeBuiltInHelp();
	}

	/**
	 * Initialize built-in help content
	 */
	private initializeBuiltInHelp(): void {
		// Define built-in help content for core commands
		this.commandDocs.set("generate", {
			title: "Generate Components and Code",
			description:
				"Generate components, pages, APIs, and other code scaffolding with intelligent templates",
			usage: "xaheen generate <type> <name> [options]",
			examples: [
				{
					description: "Generate a React component",
					command: "xaheen generate component Button",
				},
				{
					description: "Generate a page with routing",
					command: "xaheen generate page dashboard --with-layout",
				},
				{
					description: "Generate an API endpoint",
					command: "xaheen generate api users --with-validation",
				},
				{
					description: "Generate a form with validation",
					command: "xaheen generate form ContactForm --fields=name,email,message",
				},
			],
			options: [
				{
					flag: "--output, -o",
					description: "Output directory for generated files",
					type: "string",
				},
				{
					flag: "--template, -t",
					description: "Template to use for generation",
					type: "string",
				},
				{
					flag: "--dry-run",
					description: "Preview changes without creating files",
					type: "boolean",
				},
				{
					flag: "--force",
					description: "Overwrite existing files",
					type: "boolean",
				},
				{
					flag: "--skip-tests",
					description: "Skip test file generation",
					type: "boolean",
				},
			],
			subcommands: [
				{ name: "component", description: "Generate UI components" },
				{ name: "page", description: "Generate pages with routing" },
				{ name: "layout", description: "Generate layout components" },
				{ name: "form", description: "Generate forms with validation" },
				{ name: "table", description: "Generate data tables" },
				{ name: "api", description: "Generate API endpoints" },
				{ name: "model", description: "Generate data models" },
				{ name: "service", description: "Generate service classes" },
			],
			relatedCommands: ["create", "plugin install"],
			tips: [
				"Use --dry-run to preview changes before generating",
				"Custom templates can be added via plugins",
				"Generated components follow accessibility best practices",
				"TypeScript is enabled by default for better development experience",
			],
			troubleshooting: [
				{
					issue: "Generated files are overwritten",
					solution: "Use --no-overwrite flag or backup your changes first",
				},
				{
					issue: "Template not found",
					solution:
						"Check available templates with 'xaheen generate --list-templates'",
				},
			],
		});

		this.commandDocs.set("create", {
			title: "Create New Projects",
			description:
				"Create new applications and projects with pre-configured templates and best practices",
			usage: "xaheen create <project-name> [options]",
			examples: [
				{
					description: "Create a Next.js web application",
					command: "xaheen create my-app --template nextjs",
					output: "✓ Project created successfully in ./my-app",
				},
				{
					description: "Create a full-stack application",
					command: "xaheen create api-app --template fullstack --database postgresql",
				},
				{
					description: "Create with custom configuration",
					command: "xaheen create enterprise-app --interactive",
				},
			],
			options: [
				{
					flag: "--template, -t",
					description: "Project template to use",
					type: "string",
					required: false,
				},
				{
					flag: "--database",
					description: "Database to configure",
					type: "string",
				},
				{
					flag: "--auth",
					description: "Authentication provider",
					type: "string",
				},
				{
					flag: "--interactive, -i",
					description: "Interactive project setup",
					type: "boolean",
				},
				{
					flag: "--path",
					description: "Custom project path",
					type: "string",
				},
			],
			relatedCommands: ["init", "generate", "doctor"],
			tips: [
				"Use --interactive for guided project setup",
				"Templates include TypeScript configuration by default",
				"Projects are created with Git initialization and best practices",
			],
		});

		this.commandDocs.set("plugin", {
			title: "Plugin Management",
			description:
				"Discover, install, and manage community plugins and extensions",
			usage: "xaheen plugin <command> [options]",
			subcommands: [
				{ name: "search", description: "Search plugin registry" },
				{ name: "install", description: "Install a plugin" },
				{ name: "uninstall", description: "Remove a plugin" },
				{ name: "list", description: "List installed plugins" },
				{ name: "update", description: "Update plugins" },
				{ name: "info", description: "Show plugin information" },
			],
			examples: [
				{
					description: "Search for React plugins",
					command: "xaheen plugin search react",
				},
				{
					description: "Install a specific plugin",
					command: "xaheen plugin install xaheen-tailwind-generator",
				},
				{
					description: "List all installed plugins",
					command: "xaheen plugin list --detailed",
				},
			],
			tips: [
				"Certified plugins are verified for security and quality",
				"Plugins can add new generators, templates, and commands",
				"Use 'xaheen plugin validate' to check plugin health",
			],
		});

		// Add more command documentation...
		this.addCommonCommandDocs();
	}

	/**
	 * Add common command documentation
	 */
	private addCommonCommandDocs(): void {
		this.commandDocs.set("doctor", {
			title: "Health Check and Diagnostics",
			description: "Analyze project health and identify potential issues",
			usage: "xaheen doctor [options]",
			examples: [
				{
					description: "Run full health check",
					command: "xaheen doctor",
				},
				{
					description: "Check specific category",
					command: "xaheen doctor --category dependencies",
				},
			],
			options: [
				{
					flag: "--category",
					description: "Check specific category (dependencies, config, security)",
					type: "string",
				},
				{
					flag: "--fix",
					description: "Automatically fix issues where possible",
					type: "boolean",
				},
			],
			tips: [
				"Run doctor after major changes to verify project health",
				"Use --fix to automatically resolve common issues",
			],
		});

		this.commandDocs.set("init", {
			title: "Initialize Xaheen Project",
			description: "Initialize Xaheen CLI in an existing project",
			usage: "xaheen init [options]",
			examples: [
				{
					description: "Initialize with default configuration",
					command: "xaheen init",
				},
				{
					description: "Initialize with interactive setup",
					command: "xaheen init --interactive",
				},
			],
			options: [
				{
					flag: "--interactive, -i",
					description: "Interactive configuration setup",
					type: "boolean",
				},
				{
					flag: "--force",
					description: "Force initialization even if config exists",
					type: "boolean",
				},
			],
		});
	}

	/**
	 * Get contextual help for command
	 */
	public async getContextualHelp(
		context: HelpContext,
		options: HelpFormattingOptions = {},
	): Promise<string> {
		try {
			const commandPath = context.command.join(" ");
			const helpContent = await this.getHelpContent(context.command);

			if (!helpContent) {
				return this.generateNotFoundHelp(context, options);
			}

			return this.formatHelpContent(helpContent, options);
		} catch (error) {
			logger.error("Failed to get contextual help:", error);
			return this.generateErrorHelp(context, error, options);
		}
	}

	/**
	 * Get smart suggestions based on context
	 */
	public async getSmartSuggestions(
		context: HelpContext,
	): Promise<SmartSuggestion[]> {
		const suggestions: SmartSuggestion[] = [];

		try {
			// Command-specific suggestions
			if (context.command.length === 0) {
				suggestions.push(...this.getGettingStartedSuggestions());
			} else {
				suggestions.push(...(await this.getCommandSpecificSuggestions(context)));
			}

			// Error-context suggestions
			if (context.errorContext) {
				suggestions.push(...this.getErrorBasedSuggestions(context));
			}

			// Project-context suggestions
			suggestions.push(...(await this.getProjectBasedSuggestions(context)));

			// Sort by priority
			suggestions.sort((a, b) => b.priority - a.priority);

			return suggestions.slice(0, 10); // Limit to top 10
		} catch (error) {
			logger.error("Failed to get smart suggestions:", error);
			return [];
		}
	}

	/**
	 * Get inline help for specific command part
	 */
	public async getInlineHelp(
		command: string[],
		position: number,
	): Promise<string | null> {
		try {
			const helpContent = await this.getHelpContent(command);
			if (!helpContent) {
				return null;
			}

			// Return brief description for inline display
			return helpContent.description;
		} catch (error) {
			logger.warn("Failed to get inline help:", error);
			return null;
		}
	}

	/**
	 * Search help content
	 */
	public async searchHelp(query: string): Promise<HelpContent[]> {
		const results: HelpContent[] = [];
		const normalizedQuery = query.toLowerCase();

		try {
			for (const [command, content] of this.commandDocs) {
				if (
					command.toLowerCase().includes(normalizedQuery) ||
					content.title.toLowerCase().includes(normalizedQuery) ||
					content.description.toLowerCase().includes(normalizedQuery) ||
					content.examples.some((ex) =>
						ex.description.toLowerCase().includes(normalizedQuery),
					)
				) {
					results.push(content);
				}
			}

			return results;
		} catch (error) {
			logger.error("Failed to search help:", error);
			return [];
		}
	}

	/**
	 * Get command examples
	 */
	public async getCommandExamples(command: string[]): Promise<string[]> {
		try {
			const helpContent = await this.getHelpContent(command);
			if (!helpContent) {
				return [];
			}

			return helpContent.examples.map((ex) => ex.command);
		} catch (error) {
			logger.error("Failed to get command examples:", error);
			return [];
		}
	}

	// Private helper methods

	private async getHelpContent(command: string[]): Promise<HelpContent | null> {
		const commandKey = command[0] || "";
		
		// Check cache first
		if (this.helpCache.has(commandKey)) {
			return this.helpCache.get(commandKey)!;
		}

		// Check built-in docs
		if (this.commandDocs.has(commandKey)) {
			const content = this.commandDocs.get(commandKey)!;
			this.helpCache.set(commandKey, content);
			return content;
		}

		// Try to load from plugin or external sources
		const pluginHelp = await this.loadPluginHelp(commandKey);
		if (pluginHelp) {
			this.helpCache.set(commandKey, pluginHelp);
			return pluginHelp;
		}

		return null;
	}

	private async loadPluginHelp(command: string): Promise<HelpContent | null> {
		try {
			// Look for plugin help files
			const pluginsPath = join(this.projectPath, ".xaheen", "plugins");
			if (!existsSync(pluginsPath)) {
				return null;
			}

			const pluginDirs = await readdir(pluginsPath);
			
			for (const pluginDir of pluginDirs) {
				const helpPath = join(pluginsPath, pluginDir, "help", `${command}.json`);
				
				if (existsSync(helpPath)) {
					const helpData = await readFile(helpPath, "utf8");
					const parsedHelp = JSON.parse(helpData);
					return HelpContentSchema.parse(parsedHelp);
				}
			}

			return null;
		} catch (error) {
			logger.warn(`Failed to load plugin help for ${command}:`, error);
			return null;
		}
	}

	private formatHelpContent(
		content: HelpContent,
		options: HelpFormattingOptions,
	): string {
		const { colors = true, maxWidth = 80, compact = false } = options;
		const output: string[] = [];

		// Title and description
		if (colors) {
			output.push(chalk.cyan.bold(content.title));
			output.push(chalk.gray(content.description));
		} else {
			output.push(content.title);
			output.push(content.description);
		}

		if (!compact) {
			output.push("");
		}

		// Usage
		if (content.usage) {
			output.push(colors ? chalk.yellow("USAGE:") : "USAGE:");
			output.push(`  ${content.usage}`);
			if (!compact) output.push("");
		}

		// Options
		if (content.options.length > 0) {
			output.push(colors ? chalk.yellow("OPTIONS:") : "OPTIONS:");
			for (const option of content.options) {
				const flag = colors ? chalk.green(option.flag) : option.flag;
				const required = option.required
					? colors
						? chalk.red(" (required)")
						: " (required)"
					: "";
				output.push(`  ${flag}${required}`);
				output.push(`    ${option.description}`);
				if (option.default !== undefined) {
					const defaultValue = colors
						? chalk.dim(`(default: ${option.default})`)
						: `(default: ${option.default})`;
					output.push(`    ${defaultValue}`);
				}
			}
			if (!compact) output.push("");
		}

		// Subcommands
		if (content.subcommands.length > 0) {
			output.push(colors ? chalk.yellow("COMMANDS:") : "COMMANDS:");
			for (const subcmd of content.subcommands) {
				const name = colors ? chalk.green(subcmd.name) : subcmd.name;
				output.push(`  ${name.padEnd(20)} ${subcmd.description}`);
			}
			if (!compact) output.push("");
		}

		// Examples
		if (options.showExamples !== false && content.examples.length > 0) {
			output.push(colors ? chalk.yellow("EXAMPLES:") : "EXAMPLES:");
			for (const example of content.examples) {
				output.push(`  ${example.description}:`);
				const command = colors
					? chalk.cyan(`  $ ${example.command}`)
					: `  $ ${example.command}`;
				output.push(command);
				if (example.output) {
					output.push(`  ${example.output}`);
				}
				if (!compact) output.push("");
			}
		}

		// Tips
		if (options.showTips !== false && content.tips.length > 0) {
			output.push(colors ? chalk.yellow("TIPS:") : "TIPS:");
			for (const tip of content.tips) {
				const bullet = colors ? chalk.dim("  •") : "  •";
				output.push(`${bullet} ${tip}`);
			}
			if (!compact) output.push("");
		}

		// Related commands
		if (content.relatedCommands.length > 0) {
			output.push(colors ? chalk.yellow("SEE ALSO:") : "SEE ALSO:");
			const commands = content.relatedCommands
				.map((cmd) => (colors ? chalk.cyan(cmd) : cmd))
				.join(", ");
			output.push(`  ${commands}`);
		}

		return output.join("\n");
	}

	private generateNotFoundHelp(
		context: HelpContext,
		options: HelpFormattingOptions,
	): string {
		const { colors = true } = options;
		const command = context.command.join(" ");

		const suggestions = [
			"xaheen --help                 Show general help",
			"xaheen generate --help        Show generator help", 
			"xaheen create --help          Show project creation help",
			"xaheen plugin search <query>  Search for plugins",
		];

		const output = [
			colors
				? chalk.red(`Command "${command}" not found`)
				: `Command "${command}" not found`,
			"",
			colors ? chalk.yellow("Try these commands:") : "Try these commands:",
			...suggestions.map((s) => `  ${s}`),
		];

		return output.join("\n");
	}

	private generateErrorHelp(
		context: HelpContext,
		error: any,
		options: HelpFormattingOptions,
	): string {
		const { colors = true } = options;

		return colors
			? chalk.red(`Error getting help: ${error.message}`)
			: `Error getting help: ${error.message}`;
	}

	private getGettingStartedSuggestions(): SmartSuggestion[] {
		return [
			{
				type: "tip",
				title: "Create your first project",
				description: "Start with a new project using built-in templates",
				command: "xaheen create my-app --interactive",
				priority: 100,
				category: "getting-started",
			},
			{
				type: "tip",
				title: "Initialize existing project",
				description: "Add Xaheen CLI to an existing project",
				command: "xaheen init --interactive",
				priority: 90,
				category: "getting-started",
			},
			{
				type: "tip",
				title: "Explore available generators",
				description: "See what you can generate with Xaheen",
				command: "xaheen generate --help",
				priority: 80,
				category: "getting-started",
			},
		];
	}

	private async getCommandSpecificSuggestions(
		context: HelpContext,
	): Promise<SmartSuggestion[]> {
		const suggestions: SmartSuggestion[] = [];
		const command = context.command[0];

		switch (command) {
			case "generate":
				suggestions.push({
					type: "tip",
					title: "Preview before generating",
					description: "Use --dry-run to see what will be created",
					command: "xaheen generate component Button --dry-run",
					priority: 70,
				});
				break;

			case "create":
				suggestions.push({
					type: "tip",
					title: "Interactive project setup",
					description: "Get guided help with project configuration",
					command: "xaheen create --interactive",
					priority: 75,
				});
				break;

			case "plugin":
				suggestions.push({
					type: "tip",
					title: "Discover community plugins",
					description: "Search the plugin registry for extensions",
					command: "xaheen plugin search",
					priority: 65,
				});
				break;
		}

		return suggestions;
	}

	private getErrorBasedSuggestions(context: HelpContext): SmartSuggestion[] {
		const suggestions: SmartSuggestion[] = [];

		// Parse common error patterns and suggest fixes
		if (context.errorContext?.includes("not found")) {
			suggestions.push({
				type: "fix",
				title: "Check available commands",
				description: "List all available commands and options",
				command: "xaheen --help",
				priority: 85,
				category: "troubleshooting",
			});
		}

		if (context.errorContext?.includes("permission")) {
			suggestions.push({
				type: "fix",
				title: "Check file permissions",
				description: "Ensure you have write permissions in the target directory",
				priority: 80,
				category: "troubleshooting",
			});
		}

		return suggestions;
	}

	private async getProjectBasedSuggestions(
		context: HelpContext,
	): Promise<SmartSuggestion[]> {
		const suggestions: SmartSuggestion[] = [];

		try {
			// Check if this is a Xaheen project
			const configPath = join(context.projectPath, "xaheen.config.json");
			const hasConfig = existsSync(configPath);

			if (!hasConfig) {
				suggestions.push({
					type: "tip",
					title: "Initialize Xaheen project",
					description: "Set up Xaheen CLI in this directory",
					command: "xaheen init",
					priority: 90,
					category: "setup",
				});
			} else {
				suggestions.push({
					type: "tip",
					title: "Run health check",
					description: "Verify your project configuration",
					command: "xaheen doctor",
					priority: 60,
					category: "maintenance",
				});
			}

			// Check for package.json to determine project type
			const packageJsonPath = join(context.projectPath, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageJson = JSON.parse(
					await readFile(packageJsonPath, "utf8"),
				);

				if (packageJson.dependencies?.react) {
					suggestions.push({
						type: "example",
						title: "Generate React component",
						description: "Create a new React component with TypeScript",
						command: "xaheen generate component MyComponent",
						priority: 70,
						category: "react",
					});
				}

				if (packageJson.dependencies?.vue) {
					suggestions.push({
						type: "example",
						title: "Generate Vue component",
						description: "Create a new Vue component with Composition API",
						command: "xaheen generate component MyComponent --vue",
						priority: 70,
						category: "vue",
					});
				}
			}
		} catch (error) {
			logger.warn("Failed to analyze project for suggestions:", error);
		}

		return suggestions;
	}
}

/**
 * Default export
 */
export default ContextualHelpSystem;