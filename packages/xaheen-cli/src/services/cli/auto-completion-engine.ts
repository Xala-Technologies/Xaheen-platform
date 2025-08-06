/**
 * Auto-Completion Engine for Xaheen CLI
 * Provides intelligent command completion with fuzzy matching and contextual suggestions
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { readdir, readFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, basename, dirname } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger";

/**
 * Completion item schema
 */
const CompletionItemSchema = z.object({
	label: z.string(),
	value: z.string(),
	description: z.string().optional(),
	detail: z.string().optional(),
	kind: z.enum([
		"command",
		"subcommand",
		"option",
		"argument",
		"file",
		"directory",
		"plugin",
		"generator",
		"template",
		"project-type",
	]),
	score: z.number().default(0),
	prefix: z.string().optional(),
	suffix: z.string().optional(),
	insertText: z.string().optional(),
	filterText: z.string().optional(),
	sortText: z.string().optional(),
	deprecated: z.boolean().default(false),
	priority: z.number().default(0),
});

export type CompletionItem = z.infer<typeof CompletionItemSchema>;

/**
 * Completion context
 */
export interface CompletionContext {
	readonly command: string[];
	readonly currentArg: string;
	readonly position: number;
	readonly line: string;
	readonly projectPath: string;
	readonly isOption: boolean;
	readonly optionName?: string;
}

/**
 * Fuzzy matching options
 */
export interface FuzzyMatchOptions {
	readonly caseSensitive?: boolean;
	readonly includeScore?: boolean;
	readonly includeMatches?: boolean;
	readonly threshold?: number;
	readonly distance?: number;
	readonly minMatchCharLength?: number;
}

/**
 * Fuzzy match result
 */
export interface FuzzyMatchResult {
	readonly item: CompletionItem;
	readonly score: number;
	readonly matches: Array<{
		readonly indices: [number, number][];
		readonly value: string;
		readonly key: string;
	}>;
}

/**
 * Command completion provider
 */
export interface CompletionProvider {
	readonly name: string;
	readonly priority: number;
	readonly canComplete: (context: CompletionContext) => boolean;
	readonly getCompletions: (
		context: CompletionContext,
	) => Promise<CompletionItem[]>;
}

/**
 * Auto-completion engine
 */
export class AutoCompletionEngine {
	private readonly providers: CompletionProvider[] = [];
	private readonly commandTree: Map<string, any> = new Map();
	private readonly projectPath: string;

	constructor(projectPath: string) {
		this.projectPath = projectPath;
		this.initializeBuiltInProviders();
	}

	/**
	 * Initialize built-in completion providers
	 */
	private initializeBuiltInProviders(): void {
		// Register built-in providers
		this.registerProvider(new CommandCompletionProvider());
		this.registerProvider(new FileCompletionProvider());
		this.registerProvider(new ProjectTypeCompletionProvider());
		this.registerProvider(new GeneratorCompletionProvider());
		this.registerProvider(new PluginCompletionProvider());
		this.registerProvider(new OptionCompletionProvider());
	}

	/**
	 * Register completion provider
	 */
	public registerProvider(provider: CompletionProvider): void {
		this.providers.push(provider);
		this.providers.sort((a, b) => b.priority - a.priority);
	}

	/**
	 * Unregister completion provider
	 */
	public unregisterProvider(providerName: string): boolean {
		const index = this.providers.findIndex((p) => p.name === providerName);
		if (index !== -1) {
			this.providers.splice(index, 1);
			return true;
		}
		return false;
	}

	/**
	 * Get completions for given context
	 */
	public async getCompletions(
		context: CompletionContext,
	): Promise<CompletionItem[]> {
		const allCompletions: CompletionItem[] = [];

		try {
			// Get completions from all applicable providers
			for (const provider of this.providers) {
				if (provider.canComplete(context)) {
					try {
						const completions = await provider.getCompletions(context);
						allCompletions.push(...completions);
					} catch (error) {
						logger.warn(
							`Completion provider ${provider.name} failed:`,
							error,
						);
					}
				}
			}

			// Apply fuzzy matching if there's a current argument
			let filteredCompletions = allCompletions;
			if (context.currentArg) {
				filteredCompletions = this.fuzzyFilter(
					allCompletions,
					context.currentArg,
				);
			}

			// Sort by priority and score
			filteredCompletions.sort((a, b) => {
				if (a.priority !== b.priority) {
					return b.priority - a.priority;
				}
				return b.score - a.score;
			});

			// Remove duplicates
			const uniqueCompletions = this.removeDuplicates(filteredCompletions);

			// Limit results
			return uniqueCompletions.slice(0, 50);
		} catch (error) {
			logger.error("Failed to get completions:", error);
			return [];
		}
	}

	/**
	 * Fuzzy filter completions
	 */
	public fuzzyFilter(
		items: CompletionItem[],
		query: string,
		options: FuzzyMatchOptions = {},
	): CompletionItem[] {
		if (!query) {
			return items;
		}

		const {
			caseSensitive = false,
			threshold = 0.3,
			distance = 100,
			minMatchCharLength = 1,
		} = options;

		const normalizedQuery = caseSensitive ? query : query.toLowerCase();

		const matches: FuzzyMatchResult[] = [];

		for (const item of items) {
			const searchText = caseSensitive
				? item.filterText || item.label
				: (item.filterText || item.label).toLowerCase();

			const score = this.calculateFuzzyScore(normalizedQuery, searchText, {
				threshold,
				distance,
				minMatchCharLength,
			});

			if (score > threshold) {
				matches.push({
					item: { ...item, score },
					score,
					matches: [], // Could implement match highlighting here
				});
			}
		}

		// Sort by score descending
		matches.sort((a, b) => b.score - a.score);

		return matches.map((match) => match.item);
	}

	/**
	 * Calculate fuzzy match score
	 */
	private calculateFuzzyScore(
		query: string,
		text: string,
		options: FuzzyMatchOptions,
	): number {
		if (query === text) {
			return 1.0;
		}

		if (text.includes(query)) {
			// Exact substring match gets high score
			const position = text.indexOf(query);
			const positionScore = 1 - position / text.length;
			return 0.8 + positionScore * 0.2;
		}

		// Fuzzy matching using Levenshtein distance
		const distance = this.levenshteinDistance(query, text);
		const maxLength = Math.max(query.length, text.length);

		if (maxLength === 0) {
			return 1.0;
		}

		const similarity = 1 - distance / maxLength;

		// Bonus for matching first characters
		const firstCharMatch = query[0] === text[0] ? 0.1 : 0;

		// Bonus for matching word boundaries
		const wordBoundaryBonus = this.calculateWordBoundaryBonus(query, text);

		return Math.min(1.0, similarity + firstCharMatch + wordBoundaryBonus);
	}

	/**
	 * Calculate Levenshtein distance
	 */
	private levenshteinDistance(a: string, b: string): number {
		const matrix: number[][] = [];

		for (let i = 0; i <= b.length; i++) {
			matrix[i] = [i];
		}

		for (let j = 0; j <= a.length; j++) {
			matrix[0][j] = j;
		}

		for (let i = 1; i <= b.length; i++) {
			for (let j = 1; j <= a.length; j++) {
				if (b.charAt(i - 1) === a.charAt(j - 1)) {
					matrix[i][j] = matrix[i - 1][j - 1];
				} else {
					matrix[i][j] = Math.min(
						matrix[i - 1][j - 1] + 1, // substitution
						matrix[i][j - 1] + 1, // insertion
						matrix[i - 1][j] + 1, // deletion
					);
				}
			}
		}

		return matrix[b.length][a.length];
	}

	/**
	 * Calculate word boundary bonus
	 */
	private calculateWordBoundaryBonus(query: string, text: string): number {
		let bonus = 0;
		const words = text.split(/[-_\s]/);

		for (const word of words) {
			if (word.toLowerCase().startsWith(query.toLowerCase())) {
				bonus += 0.1;
			}
		}

		return Math.min(0.3, bonus);
	}

	/**
	 * Remove duplicate completions
	 */
	private removeDuplicates(items: CompletionItem[]): CompletionItem[] {
		const seen = new Set<string>();
		const unique: CompletionItem[] = [];

		for (const item of items) {
			const key = `${item.kind}:${item.value}`;
			if (!seen.has(key)) {
				seen.add(key);
				unique.push(item);
			}
		}

		return unique;
	}

	/**
	 * Parse command line for completion context
	 */
	public parseCommandLine(line: string, position: number): CompletionContext {
		const beforeCursor = line.slice(0, position);
		const parts = beforeCursor.split(/\s+/);

		// Remove the 'xaheen' part
		const command = parts.slice(1);
		const currentArg = parts[parts.length - 1] || "";

		// Check if current position is an option
		const isOption = currentArg.startsWith("-");
		const optionName = isOption ? currentArg : undefined;

		return {
			command,
			currentArg: isOption ? "" : currentArg,
			position,
			line,
			projectPath: this.projectPath,
			isOption,
			optionName,
		};
	}

	/**
	 * Build command tree from available commands
	 */
	public async buildCommandTree(): Promise<void> {
		// This would be populated from the CLI's command structure
		// For now, we'll use a static structure
		this.commandTree.set("generate", {
			description: "Generate components, pages, and other code",
			subcommands: ["component", "page", "layout", "form", "table", "api"],
			options: ["--help", "--dry-run", "--force", "--output"],
		});

		this.commandTree.set("create", {
			description: "Create new projects",
			subcommands: ["project", "app"],
			options: ["--help", "--template", "--name", "--path"],
		});

		this.commandTree.set("plugin", {
			description: "Manage plugins",
			subcommands: [
				"search",
				"install",
				"uninstall",
				"list",
				"update",
				"info",
				"validate",
			],
			options: ["--help", "--global", "--force", "--dry-run", "--verbose"],
		});

		// Add more commands...
	}
}

/**
 * Built-in completion providers
 */

class CommandCompletionProvider implements CompletionProvider {
	readonly name = "command";
	readonly priority = 100;

	canComplete(context: CompletionContext): boolean {
		return context.command.length <= 1 && !context.isOption;
	}

	async getCompletions(context: CompletionContext): Promise<CompletionItem[]> {
		const commands = [
			"generate",
			"create",
			"init",
			"build",
			"dev",
			"plugin",
			"doctor",
			"upgrade",
			"help",
		];

		return commands.map((cmd) => ({
			label: cmd,
			value: cmd,
			description: this.getCommandDescription(cmd),
			kind: "command" as const,
			priority: 100,
		}));
	}

	private getCommandDescription(command: string): string {
		const descriptions: Record<string, string> = {
			generate: "Generate components, pages, and other code",
			create: "Create new projects and applications",
			init: "Initialize a new Xaheen project",
			build: "Build the project for production",
			dev: "Start development server",
			plugin: "Manage plugins and extensions",
			doctor: "Check project health and configuration",
			upgrade: "Upgrade CLI and dependencies",
			help: "Show help information",
		};

		return descriptions[command] || "";
	}
}

class FileCompletionProvider implements CompletionProvider {
	readonly name = "file";
	readonly priority = 50;

	canComplete(context: CompletionContext): boolean {
		// Complete files for certain commands and options
		const fileCommands = ["init"];
		const fileOptions = ["--output", "--config", "--template"];

		return (
			fileCommands.includes(context.command[0]) ||
			(context.optionName && fileOptions.includes(context.optionName))
		);
	}

	async getCompletions(context: CompletionContext): Promise<CompletionItem[]> {
		try {
			const currentDir = context.currentArg
				? dirname(context.currentArg)
				: ".";
			const searchDir = join(context.projectPath, currentDir);

			if (!existsSync(searchDir)) {
				return [];
			}

			const entries = await readdir(searchDir);
			const completions: CompletionItem[] = [];

			for (const entry of entries) {
				const fullPath = join(searchDir, entry);
				const stats = await stat(fullPath);

				completions.push({
					label: entry,
					value: entry,
					kind: stats.isDirectory() ? "directory" : "file",
					priority: stats.isDirectory() ? 60 : 50,
					suffix: stats.isDirectory() ? "/" : "",
				});
			}

			return completions;
		} catch (error) {
			logger.warn("Failed to get file completions:", error);
			return [];
		}
	}
}

class ProjectTypeCompletionProvider implements CompletionProvider {
	readonly name = "project-type";
	readonly priority = 80;

	canComplete(context: CompletionContext): boolean {
		return (
			context.command[0] === "create" &&
			(context.optionName === "--type" || context.optionName === "-t")
		);
	}

	async getCompletions(): Promise<CompletionItem[]> {
		const projectTypes = [
			{ value: "web-app", description: "Modern web application" },
			{ value: "api", description: "REST API server" },
			{ value: "library", description: "Reusable library" },
			{ value: "monorepo", description: "Monorepo workspace" },
			{ value: "mobile", description: "Mobile application" },
			{ value: "desktop", description: "Desktop application" },
			{ value: "cli", description: "Command-line tool" },
		];

		return projectTypes.map((type) => ({
			label: type.value,
			value: type.value,
			description: type.description,
			kind: "project-type" as const,
			priority: 80,
		}));
	}
}

class GeneratorCompletionProvider implements CompletionProvider {
	readonly name = "generator";
	readonly priority = 90;

	canComplete(context: CompletionContext): boolean {
		return context.command[0] === "generate" && context.command.length === 1;
	}

	async getCompletions(): Promise<CompletionItem[]> {
		const generators = [
			{ value: "component", description: "React/Vue/Angular component" },
			{ value: "page", description: "Page with routing" },
			{ value: "layout", description: "Layout component" },
			{ value: "form", description: "Form with validation" },
			{ value: "table", description: "Data table component" },
			{ value: "api", description: "API endpoint" },
			{ value: "model", description: "Data model" },
			{ value: "service", description: "Service class" },
			{ value: "hook", description: "Custom React hook" },
			{ value: "store", description: "State management store" },
		];

		return generators.map((gen) => ({
			label: gen.value,
			value: gen.value,
			description: gen.description,
			kind: "generator" as const,
			priority: 90,
		}));
	}
}

class PluginCompletionProvider implements CompletionProvider {
	readonly name = "plugin";
	readonly priority = 85;

	canComplete(context: CompletionContext): boolean {
		return (
			context.command[0] === "plugin" &&
			["install", "uninstall", "info", "update"].includes(context.command[1])
		);
	}

	async getCompletions(context: CompletionContext): Promise<CompletionItem[]> {
		// This would integrate with the plugin registry
		// For now, return mock data
		const plugins = [
			{
				value: "xaheen-react-generator",
				description: "Enhanced React component generator",
			},
			{
				value: "xaheen-vue-generator",
				description: "Vue.js component generator",
			},
			{
				value: "xaheen-tailwind-theme",
				description: "Tailwind CSS theme generator",
			},
		];

		return plugins.map((plugin) => ({
			label: plugin.value,
			value: plugin.value,
			description: plugin.description,
			kind: "plugin" as const,
			priority: 85,
		}));
	}
}

class OptionCompletionProvider implements CompletionProvider {
	readonly name = "option";
	readonly priority = 70;

	canComplete(context: CompletionContext): boolean {
		return context.currentArg.startsWith("-") || context.isOption;
	}

	async getCompletions(context: CompletionContext): Promise<CompletionItem[]> {
		const commonOptions = [
			{ value: "--help", description: "Show help information" },
			{ value: "--version", description: "Show version number" },
			{ value: "--verbose", description: "Enable verbose output" },
			{ value: "--dry-run", description: "Show what would be done" },
			{ value: "--force", description: "Force operation" },
		];

		// Add command-specific options
		const commandOptions = this.getCommandSpecificOptions(context.command[0]);

		return [...commonOptions, ...commandOptions].map((option) => ({
			label: option.value,
			value: option.value,
			description: option.description,
			kind: "option" as const,
			priority: 70,
		}));
	}

	private getCommandSpecificOptions(command: string): Array<{
		value: string;
		description: string;
	}> {
		const options: Record<
			string,
			Array<{ value: string; description: string }>
		> = {
			generate: [
				{ value: "--output", description: "Output directory" },
				{ value: "--template", description: "Template to use" },
				{ value: "--skip-tests", description: "Skip test generation" },
			],
			create: [
				{ value: "--name", description: "Project name" },
				{ value: "--template", description: "Project template" },
				{ value: "--path", description: "Project path" },
			],
			plugin: [
				{ value: "--global", description: "Install globally" },
				{ value: "--version", description: "Plugin version" },
			],
		};

		return options[command] || [];
	}
}

/**
 * Default export
 */
export default AutoCompletionEngine;