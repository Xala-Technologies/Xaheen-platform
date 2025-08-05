/**
 * CLI Help and Examples Service
 * Comprehensive in-CLI help system with interactive examples and contextual guidance
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import chalk from "chalk";
import { existsSync } from "fs";
import { mkdir, writeFile, readFile, readdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import { logger } from "../../utils/logger.js";

/**
 * Help content types
 */
export enum HelpContentType {
	COMMAND = "command",
	CONCEPT = "concept",
	TUTORIAL = "tutorial",
	EXAMPLE = "example",
	TROUBLESHOOTING = "troubleshooting",
	REFERENCE = "reference",
}

/**
 * Help content difficulty
 */
export enum HelpDifficulty {
	BEGINNER = "beginner",
	INTERMEDIATE = "intermediate",
	ADVANCED = "advanced",
}

/**
 * Example types
 */
export enum ExampleType {
	BASIC = "basic",
	ADVANCED = "advanced",
	REAL_WORLD = "real-world",
	INTERACTIVE = "interactive",
	STEP_BY_STEP = "step-by-step",
}

/**
 * Help content schema
 */
const HelpContentSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	type: z.nativeEnum(HelpContentType),
	difficulty: z.nativeEnum(HelpDifficulty),
	category: z.string(),
	tags: z.array(z.string()),
	command: z.string().optional(),
	aliases: z.array(z.string()).optional(),
	usage: z.array(z.string()),
	synopsis: z.string(),
	content: z.object({
		overview: z.string(),
		syntax: z.string().optional(),
		parameters: z.array(z.object({
			name: z.string(),
			type: z.string(),
			required: z.boolean(),
			description: z.string(),
			default: z.string().optional(),
			examples: z.array(z.string()).optional(),
		})).optional(),
		options: z.array(z.object({
			short: z.string().optional(),
			long: z.string(),
			description: z.string(),
			type: z.string().optional(),
			default: z.string().optional(),
			examples: z.array(z.string()).optional(),
		})).optional(),
		examples: z.array(z.object({
			title: z.string(),
			description: z.string(),
			type: z.nativeEnum(ExampleType),
			command: z.string(),
			output: z.string().optional(),
			explanation: z.string().optional(),
			prerequisites: z.array(z.string()).optional(),
			followUp: z.array(z.string()).optional(),
		})),
		notes: z.array(z.string()).optional(),
		warnings: z.array(z.string()).optional(),
		tips: z.array(z.string()).optional(),
		relatedCommands: z.array(z.string()).optional(),
		troubleshooting: z.array(z.object({
			issue: z.string(),
			solution: z.string(),
			command: z.string().optional(),
		})).optional(),
	}),
	metadata: z.object({
		lastUpdated: z.string(),
		version: z.string(),
		author: z.string(),
		reviewedBy: z.array(z.string()).optional(),
	}),
});

export type HelpContent = z.infer<typeof HelpContentSchema>;

/**
 * Search filters for help content
 */
export interface HelpSearchFilters {
	readonly query?: string;
	readonly type?: HelpContentType;
	readonly difficulty?: HelpDifficulty;
	readonly category?: string;
	readonly tags?: string[];
	readonly command?: string;
	readonly includeExamples?: boolean;
	readonly limit?: number;
}

/**
 * Interactive example session
 */
export interface InteractiveExampleSession {
	readonly sessionId: string;
	readonly exampleId: string;
	readonly userId: string;
	readonly startedAt: string;
	readonly currentStep: number;
	readonly totalSteps: number;
	readonly workspacePath: string;
	readonly status: "active" | "completed" | "failed";
	readonly results: Array<{
		readonly step: number;
		readonly command: string;
		readonly output: string;
		readonly success: boolean;
		readonly timestamp: string;
	}>;
}

/**
 * Help usage statistics
 */
export interface HelpUsageStats {
	readonly contentId: string;
	readonly views: number;
	readonly searches: number;
	readonly exampleRuns: number;
	readonly ratings: Array<{
		readonly rating: number;
		readonly feedback: string;
		readonly timestamp: string;
	}>;
	readonly commonQueries: string[];
	readonly dropOffPoints: string[];
}

/**
 * CLI Help service
 */
export class CLIHelpService {
	private readonly helpPath: string;
	private readonly examplesPath: string;
	private readonly sessionsPath: string;
	private readonly helpCache: Map<string, HelpContent> = new Map();
	private readonly commandMap: Map<string, string> = new Map(); // command -> help content id
	private readonly aliasMap: Map<string, string> = new Map(); // alias -> command
	private readonly activeSessions: Map<string, InteractiveExampleSession> = new Map();

	constructor(basePath: string = join(process.cwd(), ".xaheen", "help")) {
		this.helpPath = join(basePath, "content");
		this.examplesPath = join(basePath, "examples");
		this.sessionsPath = join(basePath, "sessions");
	}

	/**
	 * Initialize CLI help service
	 */
	public async initialize(): Promise<void> {
		try {
			// Ensure directories exist
			const directories = [this.helpPath, this.examplesPath, this.sessionsPath];
			
			for (const dir of directories) {
				if (!existsSync(dir)) {
					await mkdir(dir, { recursive: true });
				}
			}

			// Load help content cache
			await this.loadHelpCache();

			// Build command and alias maps
			this.buildCommandMaps();

			logger.info("CLI help service initialized");
		} catch (error) {
			logger.error("Failed to initialize CLI help service:", error);
			throw error;
		}
	}

	/**
	 * Get help for a specific command
	 */
	public async getCommandHelp(
		command: string,
		options: {
			includeExamples?: boolean;
			difficulty?: HelpDifficulty;
			format?: "text" | "json" | "markdown";
		} = {}
	): Promise<{
		content: HelpContent | null;
		formatted: string;
		relatedContent: HelpContent[];
	}> {
		try {
			// Resolve command through aliases
			const resolvedCommand = this.resolveCommand(command);
			const contentId = this.commandMap.get(resolvedCommand);

			if (!contentId) {
				return {
					content: null,
					formatted: this.formatNotFound(command),
					relatedContent: [],
				};
			}

			const content = this.helpCache.get(contentId);
			if (!content) {
				return {
					content: null,
					formatted: this.formatNotFound(command),
					relatedContent: [],
				};
			}

			// Get related content
			const relatedContent = await this.getRelatedContent(content);

			// Format content based on requested format
			const formatted = await this.formatHelpContent(content, options);

			// Record usage for analytics
			await this.recordHelpUsage(contentId, "view");

			return {
				content,
				formatted,
				relatedContent,
			};

		} catch (error) {
			logger.error(`Failed to get help for command ${command}:`, error);
			return {
				content: null,
				formatted: this.formatError(command),
				relatedContent: [],
			};
		}
	}

	/**
	 * Search help content
	 */
	public async searchHelp(
		filters: HelpSearchFilters
	): Promise<{
		results: HelpContent[];
		total: number;
		suggestions: string[];
	}> {
		try {
			let results = Array.from(this.helpCache.values());

			// Apply filters
			if (filters.query) {
				const query = filters.query.toLowerCase();
				results = results.filter(content =>
					content.title.toLowerCase().includes(query) ||
					content.description.toLowerCase().includes(query) ||
					content.content.overview.toLowerCase().includes(query) ||
					content.tags.some(tag => tag.toLowerCase().includes(query)) ||
					(content.command && content.command.toLowerCase().includes(query))
				);
			}

			if (filters.type) {
				results = results.filter(content => content.type === filters.type);
			}

			if (filters.difficulty) {
				results = results.filter(content => content.difficulty === filters.difficulty);
			}

			if (filters.category) {
				results = results.filter(content => content.category === filters.category);
			}

			if (filters.tags && filters.tags.length > 0) {
				results = results.filter(content =>
					filters.tags!.some(tag => content.tags.includes(tag))
				);
			}

			if (filters.command) {
				const resolvedCommand = this.resolveCommand(filters.command);
				results = results.filter(content => content.command === resolvedCommand);
			}

			// Filter examples if requested
			if (filters.includeExamples === false) {
				results = results.filter(content => content.type !== HelpContentType.EXAMPLE);
			}

			// Sort by relevance and popularity
			results = this.sortByRelevance(results, filters.query);

			// Apply limit
			const limit = filters.limit || 10;
			const total = results.length;
			results = results.slice(0, limit);

			// Generate search suggestions
			const suggestions = this.generateSearchSuggestions(filters.query);

			// Record search for analytics
			if (filters.query) {
				await this.recordHelpUsage("search", "search", filters.query);
			}

			return {
				results,
				total,
				suggestions,
			};

		} catch (error) {
			logger.error("Help search failed:", error);
			return {
				results: [],
				total: 0,
				suggestions: [],
			};
		}
	}

	/**
	 * Get interactive examples for a command
	 */
	public async getInteractiveExamples(
		command: string
	): Promise<{
		examples: Array<{
			id: string;
			title: string;
			description: string;
			difficulty: HelpDifficulty;
			estimatedTime: number;
			prerequisites: string[];
		}>;
		count: number;
	}> {
		try {
			const resolvedCommand = this.resolveCommand(command);
			const contentId = this.commandMap.get(resolvedCommand);

			if (!contentId) {
				return { examples: [], count: 0 };
			}

			const content = this.helpCache.get(contentId);
			if (!content) {
				return { examples: [], count: 0 };
			}

			// Filter interactive examples
			const interactiveExamples = content.content.examples
				.filter(example => example.type === ExampleType.INTERACTIVE || example.type === ExampleType.STEP_BY_STEP)
				.map(example => ({
					id: `${contentId}_${example.title.toLowerCase().replace(/\s+/g, "-")}`,
					title: example.title,
					description: example.description,
					difficulty: content.difficulty,
					estimatedTime: this.estimateExampleTime(example),
					prerequisites: example.prerequisites || [],
				}));

			return {
				examples: interactiveExamples,
				count: interactiveExamples.length,
			};

		} catch (error) {
			logger.error(`Failed to get interactive examples for ${command}:`, error);
			return { examples: [], count: 0 };
		}
	}

	/**
	 * Start interactive example session
	 */
	public async startInteractiveExample(
		exampleId: string,
		userId: string = "anonymous"
	): Promise<{
		success: boolean;
		sessionId?: string;
		session?: InteractiveExampleSession;
		errors: string[];
	}> {
		const result = {
			success: false,
			sessionId: undefined as string | undefined,
			session: undefined as InteractiveExampleSession | undefined,
			errors: [] as string[],
		};

		try {
			// Find the example
			const example = this.findExampleById(exampleId);
			if (!example.found) {
				result.errors.push("Interactive example not found");
				return result;
			}

			// Create session
			const sessionId = `help_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const workspacePath = join(this.sessionsPath, sessionId);

			await mkdir(workspacePath, { recursive: true });

			const session: InteractiveExampleSession = {
				sessionId,
				exampleId,
				userId,
				startedAt: new Date().toISOString(),
				currentStep: 0,
				totalSteps: this.countExampleSteps(example.example),
				workspacePath,
				status: "active",
				results: [],
			};

			// Save session
			this.activeSessions.set(sessionId, session);
			await this.saveSession(session);

			result.success = true;
			result.sessionId = sessionId;
			result.session = session;

			logger.info(`Interactive example session started: ${sessionId}`);
		} catch (error) {
			result.errors.push(`Failed to start interactive example: ${error}`);
			logger.error(`Failed to start interactive example ${exampleId}:`, error);
		}

		return result;
	}

	/**
	 * Get contextual help based on current CLI state
	 */
	public async getContextualHelp(context: {
		currentCommand?: string;
		workingDirectory: string;
		projectType?: string;
		lastCommand?: string;
		errorMessage?: string;
	}): Promise<{
		suggestions: Array<{
			type: "command" | "example" | "tutorial" | "troubleshooting";
			title: string;
			description: string;
			action: string;
			priority: number;
		}>;
		quickActions: Array<{
			title: string;
			command: string;
			description: string;
		}>;
	}> {
		try {
			const suggestions: Array<{
				type: "command" | "example" | "tutorial" | "troubleshooting";
				title: string;
				description: string;
				action: string;
				priority: number;
			}> = [];

			const quickActions: Array<{
				title: string;
				command: string;
				description: string;
			}> = [];

			// Error-based suggestions
			if (context.errorMessage) {
				const troubleshootingSuggestions = await this.getTroubleshootingSuggestions(context.errorMessage);
				suggestions.push(...troubleshootingSuggestions);
			}

			// Command-based suggestions
			if (context.currentCommand) {
				const commandSuggestions = await this.getCommandSuggestions(context.currentCommand);
				suggestions.push(...commandSuggestions);
			}

			// Project-based suggestions
			if (context.projectType) {
				const projectSuggestions = await this.getProjectTypeSuggestions(context.projectType);
				suggestions.push(...projectSuggestions);
			}

			// General quick actions
			quickActions.push(
				{
					title: "Create New Project",
					command: "xaheen create",
					description: "Start a new project with templates",
				},
				{
					title: "Generate Component",
					command: "xaheen generate component",
					description: "Create a new component",
				},
				{
					title: "Get Help",
					command: "xaheen help",
					description: "Show available commands",
				},
				{
					title: "Check Version",
					command: "xaheen --version",
					description: "Show CLI version information",
				}
			);

			// Sort suggestions by priority
			suggestions.sort((a, b) => b.priority - a.priority);

			return {
				suggestions: suggestions.slice(0, 10),
				quickActions,
			};

		} catch (error) {
			logger.error("Failed to get contextual help:", error);
			return {
				suggestions: [],
				quickActions: [],
			};
		}
	}

	/**
	 * Generate formatted help output
	 */
	public async formatHelpContent(
		content: HelpContent,
		options: {
			includeExamples?: boolean;
			difficulty?: HelpDifficulty;
			format?: "text" | "json" | "markdown";
		} = {}
	): Promise<string> {
		const format = options.format || "text";

		switch (format) {
			case "json":
				return JSON.stringify(content, null, 2);
			case "markdown":
				return this.formatAsMarkdown(content, options);
			default:
				return this.formatAsText(content, options);
		}
	}

	// Private helper methods

	private async loadHelpCache(): Promise<void> {
		try {
			if (existsSync(this.helpPath)) {
				const helpFiles = await readdir(this.helpPath);

				for (const file of helpFiles) {
					if (file.endsWith(".json")) {
						const content = await readFile(join(this.helpPath, file), "utf-8");
						const helpContent = HelpContentSchema.parse(JSON.parse(content));
						this.helpCache.set(helpContent.id, helpContent);
					}
				}
			}

			// Load mock data if cache is empty
			if (this.helpCache.size === 0) {
				await this.loadMockHelpContent();
			}

		} catch (error) {
			logger.warn("Failed to load help cache:", error);
			await this.loadMockHelpContent();
		}
	}

	private buildCommandMaps(): void {
		for (const content of this.helpCache.values()) {
			if (content.command) {
				this.commandMap.set(content.command, content.id);

				// Map aliases
				if (content.aliases) {
					for (const alias of content.aliases) {
						this.aliasMap.set(alias, content.command);
					}
				}
			}
		}
	}

	private resolveCommand(command: string): string {
		// Check if it's an alias first
		const resolvedFromAlias = this.aliasMap.get(command);
		if (resolvedFromAlias) {
			return resolvedFromAlias;
		}

		return command;
	}

	private async getRelatedContent(content: HelpContent): Promise<HelpContent[]> {
		const related: HelpContent[] = [];

		// Get related commands
		if (content.content.relatedCommands) {
			for (const relatedCommand of content.content.relatedCommands) {
				const contentId = this.commandMap.get(relatedCommand);
				if (contentId) {
					const relatedContent = this.helpCache.get(contentId);
					if (relatedContent) {
						related.push(relatedContent);
					}
				}
			}
		}

		// Get content with similar tags
		const similarContent = Array.from(this.helpCache.values()).filter(otherContent => {
			if (otherContent.id === content.id) return false;
			
			const commonTags = content.tags.filter(tag => otherContent.tags.includes(tag));
			return commonTags.length >= 2 || otherContent.category === content.category;
		});

		related.push(...similarContent.slice(0, 3));

		return related;
	}

	private sortByRelevance(results: HelpContent[], query?: string): HelpContent[] {
		if (!query) {
			// Sort by popularity/usage when no query
			return results.sort((a, b) => {
				// Prioritize commands over other content
				if (a.type === HelpContentType.COMMAND && b.type !== HelpContentType.COMMAND) return -1;
				if (b.type === HelpContentType.COMMAND && a.type !== HelpContentType.COMMAND) return 1;
				
				// Then by difficulty (beginner first)
				const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
				return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
			});
		}

		const queryLower = query.toLowerCase();
		
		return results.sort((a, b) => {
			let scoreA = 0;
			let scoreB = 0;

			// Title matches
			if (a.title.toLowerCase().includes(queryLower)) scoreA += 10;
			if (b.title.toLowerCase().includes(queryLower)) scoreB += 10;

			// Command matches
			if (a.command && a.command.toLowerCase().includes(queryLower)) scoreA += 8;
			if (b.command && b.command.toLowerCase().includes(queryLower)) scoreB += 8;

			// Description matches
			if (a.description.toLowerCase().includes(queryLower)) scoreA += 5;
			if (b.description.toLowerCase().includes(queryLower)) scoreB += 5;

			// Tag matches
			const aTagMatches = a.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
			const bTagMatches = b.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
			scoreA += aTagMatches * 3;
			scoreB += bTagMatches * 3;

			return scoreB - scoreA;
		});
	}

	private generateSearchSuggestions(query?: string): string[] {
		if (!query) {
			return ["create", "generate", "help", "version", "init"];
		}

		const suggestions: string[] = [];
		const queryLower = query.toLowerCase();

		// Find partial matches in commands
		for (const [command] of this.commandMap) {
			if (command.includes(queryLower)) {
				suggestions.push(command);
			}
		}

		// Find partial matches in titles and tags
		for (const content of this.helpCache.values()) {
			if (content.title.toLowerCase().includes(queryLower)) {
				suggestions.push(content.title);
			}

			for (const tag of content.tags) {
				if (tag.toLowerCase().includes(queryLower)) {
					suggestions.push(tag);
				}
			}
		}

		return [...new Set(suggestions)].slice(0, 5);
	}

	private formatAsText(content: HelpContent, options: any): string {
		let output = "";

		// Header
		output += chalk.cyan.bold(`${content.title}\n`);
		output += chalk.gray(`${content.description}\n\n`);

		// Usage
		if (content.usage.length > 0) {
			output += chalk.yellow.bold("USAGE:\n");
			content.usage.forEach(usage => {
				output += `  ${chalk.green(usage)}\n`;
			});
			output += "\n";
		}

		// Synopsis
		if (content.synopsis) {
			output += chalk.yellow.bold("SYNOPSIS:\n");
			output += `  ${content.synopsis}\n\n`;
		}

		// Parameters
		if (content.content.parameters && content.content.parameters.length > 0) {
			output += chalk.yellow.bold("PARAMETERS:\n");
			content.content.parameters.forEach(param => {
				const required = param.required ? chalk.red("*") : " ";
				output += `  ${required}${chalk.cyan(param.name)} ${chalk.gray(`<${param.type}>`)}\n`;
				output += `    ${param.description}\n`;
				if (param.default) {
					output += `    ${chalk.gray(`Default: ${param.default}`)}\n`;
				}
				output += "\n";
			});
		}

		// Options
		if (content.content.options && content.content.options.length > 0) {
			output += chalk.yellow.bold("OPTIONS:\n");
			content.content.options.forEach(option => {
				let optionStr = "  ";
				if (option.short) {
					optionStr += chalk.cyan(`-${option.short}`);
					if (option.long) {
						optionStr += chalk.gray(", ");
					}
				}
				if (option.long) {
					optionStr += chalk.cyan(`--${option.long}`);
				}
				if (option.type) {
					optionStr += chalk.gray(` <${option.type}>`);
				}
				output += `${optionStr}\n`;
				output += `    ${option.description}\n`;
				if (option.default) {
					output += `    ${chalk.gray(`Default: ${option.default}`)}\n`;
				}
				output += "\n";
			});
		}

		// Examples
		if (options.includeExamples !== false && content.content.examples.length > 0) {
			output += chalk.yellow.bold("EXAMPLES:\n");
			content.content.examples.forEach((example, index) => {
				if (index > 0) output += "\n";
				output += `  ${chalk.blue.bold(example.title)}\n`;
				output += `  ${example.description}\n`;
				output += `  ${chalk.green(`$ ${example.command}`)}\n`;
				if (example.explanation) {
					output += `  ${chalk.gray(example.explanation)}\n`;
				}
			});
			output += "\n";
		}

		// Tips
		if (content.content.tips && content.content.tips.length > 0) {
			output += chalk.yellow.bold("TIPS:\n");
			content.content.tips.forEach(tip => {
				output += `  ${chalk.green("💡")} ${tip}\n`;
			});
			output += "\n";
		}

		// Warnings
		if (content.content.warnings && content.content.warnings.length > 0) {
			output += chalk.red.bold("WARNINGS:\n");
			content.content.warnings.forEach(warning => {
				output += `  ${chalk.red("⚠️")} ${warning}\n`;
			});
			output += "\n";
		}

		// Related commands
		if (content.content.relatedCommands && content.content.relatedCommands.length > 0) {
			output += chalk.yellow.bold("SEE ALSO:\n");
			content.content.relatedCommands.forEach(command => {
				output += `  ${chalk.cyan(`xaheen help ${command}`)}\n`;
			});
			output += "\n";
		}

		return output;
	}

	private formatAsMarkdown(content: HelpContent, options: any): string {
		let output = "";

		// Header
		output += `# ${content.title}\n\n`;
		output += `${content.description}\n\n`;

		// Usage
		if (content.usage.length > 0) {
			output += "## Usage\n\n";
			content.usage.forEach(usage => {
				output += `\`\`\`bash\n${usage}\n\`\`\`\n\n`;
			});
		}

		// Synopsis
		if (content.synopsis) {
			output += "## Synopsis\n\n";
			output += `${content.synopsis}\n\n`;
		}

		// Parameters
		if (content.content.parameters && content.content.parameters.length > 0) {
			output += "## Parameters\n\n";
			content.content.parameters.forEach(param => {
				const required = param.required ? " (required)" : "";
				output += `### \`${param.name}\` \`<${param.type}>\`${required}\n\n`;
				output += `${param.description}\n\n`;
				if (param.default) {
					output += `**Default:** \`${param.default}\`\n\n`;
				}
			});
		}

		// Examples
		if (options.includeExamples !== false && content.content.examples.length > 0) {
			output += "## Examples\n\n";
			content.content.examples.forEach(example => {
				output += `### ${example.title}\n\n`;
				output += `${example.description}\n\n`;
				output += `\`\`\`bash\n${example.command}\n\`\`\`\n\n`;
				if (example.explanation) {
					output += `${example.explanation}\n\n`;
				}
			});
		}

		return output;
	}

	private formatNotFound(command: string): string {
		return `${chalk.red("Command not found:")} ${chalk.yellow(command)}\n\n` +
			   `${chalk.gray("Try:")} ${chalk.cyan("xaheen help")} ${chalk.gray("to see available commands")}\n` +
			   `${chalk.gray("Or:")} ${chalk.cyan(`xaheen help search ${command}`)} ${chalk.gray("to search for similar commands")}`;
	}

	private formatError(command: string): string {
		return `${chalk.red("Error getting help for:")} ${chalk.yellow(command)}\n\n` +
			   `${chalk.gray("Please try again or contact support if the issue persists.")}`;
	}

	private findExampleById(exampleId: string): { found: boolean; example?: any; content?: HelpContent } {
		for (const content of this.helpCache.values()) {
			for (const example of content.content.examples) {
				const id = `${content.id}_${example.title.toLowerCase().replace(/\s+/g, "-")}`;
				if (id === exampleId) {
					return { found: true, example, content };
				}
			}
		}
		return { found: false };
	}

	private countExampleSteps(example: any): number {
		// Count steps in example (simplified)
		return example.command.split("&&").length;
	}

	private estimateExampleTime(example: any): number {
		// Estimate time based on example complexity (simplified)
		const baseTime = 5; // 5 minutes base
		const commandComplexity = example.command.length / 50; // 1 minute per 50 characters
		const hasPrerequisites = example.prerequisites ? example.prerequisites.length * 2 : 0;
		
		return Math.round(baseTime + commandComplexity + hasPrerequisites);
	}

	private async saveSession(session: InteractiveExampleSession): Promise<void> {
		const sessionPath = join(this.sessionsPath, `${session.sessionId}.json`);
		await writeFile(sessionPath, JSON.stringify(session, null, 2));
	}

	private async recordHelpUsage(contentId: string, action: string, query?: string): Promise<void> {
		// Record usage for analytics (simplified implementation)
		logger.debug(`Help usage recorded: ${contentId} - ${action}`, query ? { query } : {});
	}

	private async getTroubleshootingSuggestions(errorMessage: string): Promise<Array<{
		type: "troubleshooting";
		title: string;
		description: string;
		action: string;
		priority: number;
	}>> {
		const suggestions = [];

		// Common error patterns
		if (errorMessage.includes("command not found")) {
			suggestions.push({
				type: "troubleshooting" as const,
				title: "Command Not Found",
				description: "The command you're trying to use doesn't exist",
				action: "xaheen help",
				priority: 10,
			});
		}

		if (errorMessage.includes("permission denied")) {
			suggestions.push({
				type: "troubleshooting" as const,
				title: "Permission Denied",
				description: "You don't have the necessary permissions",
				action: "Check file permissions or use sudo",
				priority: 9,
			});
		}

		return suggestions;
	}

	private async getCommandSuggestions(command: string): Promise<Array<{
		type: "command" | "example";
		title: string;
		description: string;
		action: string;
		priority: number;
	}>> {
		const suggestions = [];

		// Suggest related commands
		const contentId = this.commandMap.get(command);
		if (contentId) {
			const content = this.helpCache.get(contentId);
			if (content && content.content.relatedCommands) {
				for (const relatedCommand of content.content.relatedCommands.slice(0, 3)) {
					suggestions.push({
						type: "command" as const,
						title: `Learn about ${relatedCommand}`,
						description: `Get help for the ${relatedCommand} command`,
						action: `xaheen help ${relatedCommand}`,
						priority: 7,
					});
				}
			}
		}

		return suggestions;
	}

	private async getProjectTypeSuggestions(projectType: string): Promise<Array<{
		type: "tutorial" | "example";
		title: string;
		description: string;
		action: string;
		priority: number;
	}>> {
		const suggestions = [];

		// Project-specific suggestions
		if (projectType.includes("react")) {
			suggestions.push({
				type: "tutorial" as const,
				title: "React Development Guide",
				description: "Learn React development best practices",
				action: "xaheen tutorial react-basics",
				priority: 8,
			});
		}

		if (projectType.includes("nextjs")) {
			suggestions.push({
				type: "example" as const,
				title: "Next.js Examples",
				description: "Explore Next.js project examples",
				action: "xaheen examples nextjs",
				priority: 8,
			});
		}

		return suggestions;
	}

	private async loadMockHelpContent(): Promise<void> {
		// Load comprehensive mock help content
		const mockContent: HelpContent[] = [
			{
				id: "create-command",
				title: "xaheen create",
				description: "Create a new project from templates",
				type: HelpContentType.COMMAND,
				difficulty: HelpDifficulty.BEGINNER,
				category: "project",
				tags: ["create", "project", "template", "new"],
				command: "create",
				aliases: ["new", "init"],
				usage: [
					"xaheen create [project-name]",
					"xaheen create [project-name] --template <template>",
					"xaheen create [project-name] --template <template> --no-git",
				],
				synopsis: "Creates a new project using the specified template or an interactive template selection.",
				content: {
					overview: "The create command helps you start new projects quickly using pre-built templates. It supports various frameworks including React, Next.js, Vue, Angular, and more.",
					syntax: "xaheen create [options] [project-name]",
					parameters: [
						{
							name: "project-name",
							type: "string",
							required: false,
							description: "Name of the project to create. If not provided, you'll be prompted to enter one.",
							examples: ["my-app", "my-react-project", "awesome-nextjs-app"],
						},
					],
					options: [
						{
							short: "t",
							long: "template",
							description: "Specify the template to use",
							type: "string",
							examples: ["react", "nextjs", "vue", "angular"],
						},
						{
							long: "no-git",
							description: "Skip git repository initialization",
							type: "boolean",
						},
						{
							short: "f",
							long: "force",
							description: "Overwrite existing directory if it exists",
							type: "boolean",
						},
						{
							short: "v",
							long: "verbose",
							description: "Enable verbose output",
							type: "boolean",
						},
					],
					examples: [
						{
							title: "Create a React project",
							description: "Create a new React application with TypeScript",
							type: ExampleType.BASIC,
							command: "xaheen create my-react-app --template react",
							explanation: "This creates a new React project with TypeScript, Tailwind CSS, and modern tooling setup.",
						},
						{
							title: "Interactive project creation",
							description: "Use the interactive mode to choose template and options",
							type: ExampleType.INTERACTIVE,
							command: "xaheen create",
							explanation: "Running create without arguments opens an interactive wizard to guide you through project setup.",
						},
						{
							title: "Create Next.js project with custom options",
							description: "Create a Next.js project without git initialization",
							type: ExampleType.ADVANCED,
							command: "xaheen create my-nextjs-app --template nextjs --no-git --verbose",
							explanation: "This creates a Next.js project, skips git initialization, and shows detailed output.",
						},
					],
					tips: [
						"Use `xaheen templates` to see all available templates",
						"The interactive mode (`xaheen create`) is great for beginners",
						"You can customize templates after creation to fit your needs",
					],
					warnings: [
						"Creating a project in an existing directory will prompt for confirmation",
						"Some templates require specific Node.js versions",
					],
					relatedCommands: ["templates", "generate", "help"],
					troubleshooting: [
						{
							issue: "Permission denied when creating project",
							solution: "Make sure you have write permissions in the target directory",
							command: "ls -la",
						},
						{
							issue: "Template not found error",
							solution: "Check available templates with the templates command",
							command: "xaheen templates",
						},
					],
				},
				metadata: {
					lastUpdated: new Date().toISOString(),
					version: "3.0.0",
					author: "Xala Technologies",
					reviewedBy: ["dev-team", "docs-team"],
				},
			},
			{
				id: "generate-command",
				title: "xaheen generate",
				description: "Generate components, pages, and other code artifacts",
				type: HelpContentType.COMMAND,
				difficulty: HelpDifficulty.INTERMEDIATE,
				category: "generation",
				tags: ["generate", "component", "page", "scaffold"],
				command: "generate",
				aliases: ["g"],
				usage: [
					"xaheen generate <type> <name>",
					"xaheen generate component <component-name>",
					"xaheen generate page <page-name> --template <template>",
				],
				synopsis: "Generates various types of code artifacts including components, pages, services, and more.",
				content: {
					overview: "The generate command is a powerful tool for scaffolding code. It can create components, pages, services, and other artifacts with proper TypeScript types, tests, and documentation.",
					syntax: "xaheen generate <type> <name> [options]",
					parameters: [
						{
							name: "type",
							type: "string",
							required: true,
							description: "Type of artifact to generate",
							examples: ["component", "page", "service", "hook", "layout"],
						},
						{
							name: "name",
							type: "string",
							required: true,
							description: "Name of the artifact to generate",
							examples: ["Button", "HomePage", "UserService"],
						},
					],
					options: [
						{
							short: "t",
							long: "template",
							description: "Specify the template variant to use",
							type: "string",
						},
						{
							long: "no-test",
							description: "Skip generating test files",
							type: "boolean",
						},
						{
							long: "no-story",
							description: "Skip generating Storybook stories",
							type: "boolean",
						},
						{
							short: "d",
							long: "directory",
							description: "Specify the output directory",
							type: "string",
						},
					],
					examples: [
						{
							title: "Generate a React component",
							description: "Create a new React component with TypeScript and tests",
							type: ExampleType.BASIC,
							command: "xaheen generate component Button",
							explanation: "Creates Button.tsx, Button.test.tsx, and Button.stories.tsx in the components directory.",
						},
						{
							title: "Generate a page component",
							description: "Create a new page with routing setup",
							type: ExampleType.INTERMEDIATE,
							command: "xaheen generate page About --template landing",
							explanation: "Creates an About page using the landing page template with proper routing configuration.",
						},
						{
							title: "Generate without tests",
							description: "Create a component without test files",
							type: ExampleType.ADVANCED,
							command: "xaheen generate component Header --no-test --no-story",
							explanation: "Creates only the component file without tests or Storybook stories.",
						},
					],
					tips: [
						"Use PascalCase for component names (e.g., MyComponent)",
						"The generated code follows your project's existing patterns",
						"You can customize generation templates in .xaheen/templates/",
					],
					relatedCommands: ["create", "templates", "refactor"],
				},
				metadata: {
					lastUpdated: new Date().toISOString(),
					version: "3.0.0",
					author: "Xala Technologies",
				},
			},
		];

		// Load mock content into cache
		for (const content of mockContent) {
			this.helpCache.set(content.id, content);
		}

		// Save mock content to storage
		for (const content of mockContent) {
			const contentPath = join(this.helpPath, `${content.id}.json`);
			await writeFile(contentPath, JSON.stringify(content, null, 2));
		}

		logger.info("Mock help content loaded");
	}
}

/**
 * Create CLI help service instance
 */
export function createCLIHelpService(basePath?: string): CLIHelpService {
	return new CLIHelpService(basePath);
}

/**
 * Default export
 */
export default CLIHelpService;