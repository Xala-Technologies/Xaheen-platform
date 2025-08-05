/**
 * Fuzzy Command Matcher
 * 
 * Provides fuzzy matching for CLI commands to handle typos and suggest alternatives.
 * Implements Levenshtein distance and contextual suggestions.
 * 
 * Part of EPIC 2, Story 2.1: Modern CLI Patterns Implementation
 */

import chalk from "chalk";
import type { CommandRoute } from "../../types/index.js";
import { cliLogger } from "../../utils/logger.js";

export interface CommandSuggestion {
	readonly command: string;
	readonly description: string;
	readonly similarity: number;
	readonly category: string;
	readonly usage: string;
	readonly aliases: string[];
}

export interface FuzzyMatchOptions {
	readonly maxSuggestions?: number;
	readonly minSimilarity?: number;
	readonly includeAliases?: boolean;
	readonly contextualBoost?: boolean;
	readonly categoryWeights?: Record<string, number>;
}

export interface CommandContext {
	readonly recentCommands: string[];
	readonly currentProject?: {
		readonly type: string;
		readonly framework: string;
		readonly features: string[];
	};
	readonly userPreferences?: {
		readonly preferredCommands: string[];
		readonly avoidedCommands: string[];
	};
}

/**
 * Advanced fuzzy command matcher with contextual suggestions
 */
export class FuzzyCommandMatcher {
	private readonly commands: Map<string, CommandRoute> = new Map();
	private readonly aliases: Map<string, string> = new Map();
	private readonly commandCategories: Map<string, string> = new Map();
	private readonly commandUsageStats: Map<string, number> = new Map();

	constructor() {
		this.initializeCommandCategories();
		this.loadCommandAliases();
	}

	/**
	 * Register available commands for fuzzy matching
	 */
	public registerCommands(routes: Map<string, CommandRoute>): void {
		this.commands.clear();
		routes.forEach((route, pattern) => {
			this.commands.set(pattern, route);
			
			// Extract command name for easier matching
			const commandName = `${route.domain}:${route.action}`;
			this.commands.set(commandName, route);
			
			// Register legacy mappings
			if (route.legacy) {
				Object.entries(route.legacy).forEach(([cli, legacyCommands]) => {
					legacyCommands.forEach(legacyCmd => {
						this.aliases.set(legacyCmd, commandName);
					});
				});
			}
		});
	}

	/**
	 * Find the best matching commands for a given input
	 */
	public findMatches(
		input: string,
		context?: CommandContext,
		options: FuzzyMatchOptions = {}
	): CommandSuggestion[] {
		const {
			maxSuggestions = 5,
			minSimilarity = 0.3,
			includeAliases = true,
			contextualBoost = true,
			categoryWeights = {}
		} = options;

		const suggestions: CommandSuggestion[] = [];
		const inputLower = input.toLowerCase().trim();

		// Direct alias match
		if (includeAliases && this.aliases.has(inputLower)) {
			const aliasTarget = this.aliases.get(inputLower)!;
			const route = this.findRouteByCommand(aliasTarget);
			if (route) {
				suggestions.push(this.createSuggestion(aliasTarget, route, 1.0));
			}
		}

		// Fuzzy matching against all commands
		for (const [commandKey, route] of this.commands) {
			const similarity = this.calculateSimilarity(inputLower, commandKey.toLowerCase());
			
			if (similarity >= minSimilarity) {
				let adjustedSimilarity = similarity;

				// Apply contextual boost
				if (contextualBoost && context) {
					adjustedSimilarity = this.applyContextualBoost(
						commandKey,
						similarity,
						context,
						categoryWeights
					);
				}

				const suggestion = this.createSuggestion(commandKey, route, adjustedSimilarity);
				suggestions.push(suggestion);
			}
		}

		// Sort by similarity (descending) and limit results
		return suggestions
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, maxSuggestions);
	}

	/**
	 * Get contextual command suggestions based on project state
	 */
	public getContextualSuggestions(context: CommandContext): CommandSuggestion[] {
		const suggestions: CommandSuggestion[] = [];

		// Project-specific suggestions
		if (context.currentProject) {
			const projectSuggestions = this.getProjectSpecificSuggestions(context.currentProject);
			suggestions.push(...projectSuggestions);
		}

		// Workflow-based suggestions
		if (context.recentCommands.length > 0) {
			const workflowSuggestions = this.getWorkflowSuggestions(context.recentCommands);
			suggestions.push(...workflowSuggestions);
		}

		// Popular commands
		const popularSuggestions = this.getPopularCommands();
		suggestions.push(...popularSuggestions);

		return suggestions
			.sort((a, b) => b.similarity - a.similarity)
			.slice(0, 10);
	}

	/**
	 * Display command suggestions in a user-friendly format
	 */
	public displaySuggestions(
		originalInput: string,
		suggestions: CommandSuggestion[],
		options: { showDescription?: boolean; showUsage?: boolean } = {}
	): void {
		if (suggestions.length === 0) {
			cliLogger.info(chalk.yellow(`No similar commands found for: ${chalk.white(originalInput)}`));
			return;
		}

		cliLogger.info(chalk.blue(`\n🔍 Did you mean one of these commands?\n`));

		suggestions.forEach((suggestion, index) => {
			const confidence = Math.round(suggestion.similarity * 100);
			const confidenceColor = confidence >= 80 ? 'green' : confidence >= 60 ? 'yellow' : 'gray';
			
			cliLogger.info(
				`  ${chalk.cyan((index + 1).toString())}. ${chalk.white(suggestion.command)} ` +
				`${chalk[confidenceColor](`(${confidence}% match)`)}`
			);

			if (options.showDescription && suggestion.description) {
				cliLogger.info(`     ${chalk.gray(suggestion.description)}`);
			}

			if (options.showUsage && suggestion.usage) {
				cliLogger.info(`     ${chalk.dim(`Usage: ${suggestion.usage}`)}`);
			}

			if (suggestion.aliases.length > 0) {
				cliLogger.info(`     ${chalk.dim(`Aliases: ${suggestion.aliases.join(', ')}`)}`);
			}
		});

		cliLogger.info(chalk.gray(`\n💡 Try: ${chalk.white(`xaheen ${suggestions[0].command}`)}`));
	}

	/**
	 * Record command usage for improving future suggestions
	 */
	public recordCommandUsage(command: string): void {
		const currentCount = this.commandUsageStats.get(command) || 0;
		this.commandUsageStats.set(command, currentCount + 1);
	}

	/**
	 * Get command usage statistics
	 */
	public getUsageStats(): Map<string, number> {
		return new Map(this.commandUsageStats);
	}

	// Private helper methods

	private calculateSimilarity(input: string, target: string): number {
		// Handle exact matches
		if (input === target) return 1.0;

		// Handle prefix matches (high priority)
		if (target.startsWith(input)) {
			return 0.9 + (input.length / target.length) * 0.1;
		}

		// Handle substring matches
		if (target.includes(input)) {
			return 0.7 + (input.length / target.length) * 0.2;
		}

		// Levenshtein distance-based similarity
		const distance = this.levenshteinDistance(input, target);
		const maxLength = Math.max(input.length, target.length);
		
		if (maxLength === 0) return 1.0;
		
		const similarity = 1 - (distance / maxLength);
		
		// Boost for similar word patterns
		const wordSimilarity = this.calculateWordSimilarity(input, target);
		
		return Math.max(similarity, wordSimilarity);
	}

	private levenshteinDistance(str1: string, str2: string): number {
		const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

		for (let i = 0; i <= str1.length; i++) {
			matrix[0][i] = i;
		}

		for (let j = 0; j <= str2.length; j++) {
			matrix[j][0] = j;
		}

		for (let j = 1; j <= str2.length; j++) {
			for (let i = 1; i <= str1.length; i++) {
				const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
				matrix[j][i] = Math.min(
					matrix[j][i - 1] + 1, // deletion
					matrix[j - 1][i] + 1, // insertion
					matrix[j - 1][i - 1] + indicator // substitution
				);
			}
		}

		return matrix[str2.length][str1.length];
	}

	private calculateWordSimilarity(input: string, target: string): number {
		const inputWords = input.split(/[:\-_\s]+/);
		const targetWords = target.split(/[:\-_\s]+/);
		
		let matches = 0;
		
		for (const inputWord of inputWords) {
			for (const targetWord of targetWords) {
				if (inputWord === targetWord || 
					targetWord.startsWith(inputWord) || 
					inputWord.startsWith(targetWord)) {
					matches++;
					break;
				}
			}
		}
		
		return matches / Math.max(inputWords.length, targetWords.length);
	}

	private applyContextualBoost(
		command: string,
		baseSimilarity: number,
		context: CommandContext,
		categoryWeights: Record<string, number>
	): number {
		let boost = 0;

		// Recent command boost
		if (context.recentCommands.includes(command)) {
			boost += 0.1;
		}

		// Usage frequency boost
		const usageCount = this.commandUsageStats.get(command) || 0;
		if (usageCount > 0) {
			boost += Math.min(0.15, usageCount * 0.01);
		}

		// Category weight boost
		const category = this.commandCategories.get(command);
		if (category && categoryWeights[category]) {
			boost += categoryWeights[category] * 0.1;
		}

		// Project context boost
		if (context.currentProject) {
			boost += this.getProjectContextBoost(command, context.currentProject);
		}

		// User preference boost
		if (context.userPreferences?.preferredCommands.includes(command)) {
			boost += 0.2;
		}

		return Math.min(1.0, baseSimilarity + boost);
	}

	private getProjectContextBoost(command: string, project: any): number {
		const commandLower = command.toLowerCase();
		
		// Framework-specific boosts
		if (project.framework === 'react' && commandLower.includes('component')) {
			return 0.1;
		}
		
		if (project.framework === 'nextjs' && commandLower.includes('page')) {
			return 0.1;
		}
		
		// Feature-specific boosts
		if (project.features.includes('auth') && commandLower.includes('auth')) {
			return 0.15;
		}
		
		if (project.features.includes('database') && commandLower.includes('model')) {
			return 0.15;
		}
		
		return 0;
	}

	private createSuggestion(commandKey: string, route: CommandRoute, similarity: number): CommandSuggestion {
		const aliases = this.getCommandAliases(commandKey);
		const category = this.commandCategories.get(commandKey) || 'general';
		
		return {
			command: commandKey,
			description: `Execute ${route.domain} ${route.action}`,
			similarity,
			category,
			usage: route.pattern,
			aliases
		};
	}

	private getCommandAliases(command: string): string[] {
		const aliases: string[] = [];
		
		for (const [alias, target] of this.aliases) {
			if (target === command) {
				aliases.push(alias);
			}
		}
		
		return aliases;
	}

	private findRouteByCommand(command: string): CommandRoute | undefined {
		return this.commands.get(command);
	}

	private getProjectSpecificSuggestions(project: any): CommandSuggestion[] {
		const suggestions: CommandSuggestion[] = [];
		
		// Add project-specific suggestions based on framework
		switch (project.framework) {
			case 'react':
			case 'nextjs':
				suggestions.push({
					command: 'make:component',
					description: 'Create a new React component',
					similarity: 0.9,
					category: 'component',
					usage: 'xaheen make:component <name>',
					aliases: ['mc', 'component']
				});
				break;
				
			case 'nestjs':
				suggestions.push({
					command: 'make:service',
					description: 'Create a new NestJS service',
					similarity: 0.9,
					category: 'service',
					usage: 'xaheen make:service <name>',
					aliases: ['ms', 'service']
				});
				break;
		}
		
		return suggestions;
	}

	private getWorkflowSuggestions(recentCommands: string[]): CommandSuggestion[] {
		const suggestions: CommandSuggestion[] = [];
		
		// Analyze workflow patterns
		const lastCommand = recentCommands[recentCommands.length - 1];
		
		if (lastCommand?.includes('make:model')) {
			suggestions.push({
				command: 'make:controller',
				description: 'Create controller for the model',
				similarity: 0.85,
				category: 'workflow',
				usage: 'xaheen make:controller <name>',
				aliases: ['mc:ctrl']
			});
		}
		
		if (lastCommand?.includes('project:create')) {
			suggestions.push({
				command: 'make:model',
				description: 'Create your first model',
				similarity: 0.8,
				category: 'workflow',
				usage: 'xaheen make:model <name>',
				aliases: ['mm']
			});
		}
		
		return suggestions;
	}

	private getPopularCommands(): CommandSuggestion[] {
		const popularCommands = [
			'project:create',
			'make:model',
			'make:component',
			'make:controller',
			'mcp:connect'
		];
		
		return popularCommands.map((cmd, index) => ({
			command: cmd,
			description: `Popular command #${index + 1}`,
			similarity: 0.7 - (index * 0.1),
			category: 'popular',
			usage: `xaheen ${cmd} <name>`,
			aliases: []
		}));
	}

	private initializeCommandCategories(): void {
		// Initialize command categories for better organization
		const categories = {
			'project:create': 'project',
			'project:validate': 'project',
			'make:model': 'database',
			'make:controller': 'api',
			'make:component': 'frontend',
			'make:service': 'backend',
			'mcp:connect': 'ai',
			'mcp:generate': 'ai',
			'security:audit': 'security',
			'docs:generate': 'documentation'
		};
		
		Object.entries(categories).forEach(([command, category]) => {
			this.commandCategories.set(command, category);
		});
	}

	private loadCommandAliases(): void {
		// Initialize common aliases
		const aliases = {
			'new': 'project:create',
			'create': 'project:create',
			'init': 'project:create',
			'mm': 'make:model',
			'mc': 'make:component',
			'ms': 'make:service',
			'ai': 'mcp:connect',
			'connect': 'mcp:connect',
			'gen': 'mcp:generate',
			'audit': 'security:audit',
			'docs': 'docs:generate'
		};
		
		Object.entries(aliases).forEach(([alias, command]) => {
			this.aliases.set(alias, command);
		});
	}
}

export default FuzzyCommandMatcher;