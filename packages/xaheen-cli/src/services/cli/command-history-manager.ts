/**
 * Command History and Favorites Manager
 * 
 * Manages command history, favorites, and provides intelligent suggestions
 * based on usage patterns and context.
 * 
 * Part of EPIC 2, Story 2.1: Modern CLI Patterns Implementation
 */

import chalk from "chalk";
import { promises as fs } from "fs";
import { join } from "path";
import { homedir } from "os";
import { EventEmitter } from "events";
import type { CLICommand } from "../../types/index";
import { logger, cliLogger } from "../../utils/logger";

export interface CommandHistoryEntry {
	readonly id: string;
	readonly command: string;
	readonly fullCommand: string;
	readonly arguments: Record<string, any>;
	readonly options: Record<string, any>;
	readonly timestamp: Date;
	readonly executionTime: number;
	readonly success: boolean;
	readonly exitCode?: number;
	readonly workingDirectory: string;
	readonly projectContext?: ProjectContext;
	readonly tags: string[];
}

export interface ProjectContext {
	readonly name: string;
	readonly type: string;
	readonly framework?: string;
	readonly features: string[];
	readonly packageManager?: string;
}

export interface CommandFavorite {
	readonly command: string;
	readonly alias?: string;
	readonly description?: string;
	readonly category: string;
	readonly useCount: number;
	readonly lastUsed: Date;
	readonly averageExecutionTime: number;
	readonly successRate: number;
	readonly tags: string[];
}

export interface UsagePattern {
	readonly sequence: string[];
	readonly frequency: number;
	readonly avgTimeBetween: number;
	readonly context: string;
	readonly successRate: number;
}

export interface CommandSuggestion {
	readonly command: string;
	readonly reason: 'frequent' | 'recent' | 'pattern' | 'context' | 'favorite';
	readonly confidence: number;
	readonly metadata: Record<string, any>;
}

export interface HistorySearchOptions {
	readonly query?: string;
	readonly timeRange?: {
		readonly from: Date;
		readonly to: Date;
	};
	readonly successful?: boolean;
	readonly project?: string;
	readonly tags?: string[];
	readonly limit?: number;
}

/**
 * Command History and Favorites Manager
 */
export class CommandHistoryManager extends EventEmitter {
	private readonly historyFile: string;
	private readonly favoritesFile: string;
	private readonly configDir: string;
	private history: CommandHistoryEntry[] = [];
	private favorites: Map<string, CommandFavorite> = new Map();
	private usagePatterns: UsagePattern[] = [];
	private readonly maxHistorySize = 10000;
	private readonly maxFavorites = 50;

	constructor() {
		super();
		this.configDir = join(homedir(), '.xaheen');
		this.historyFile = join(this.configDir, 'command-history.json');
		this.favoritesFile = join(this.configDir, 'favorites.json');
	}

	/**
	 * Initialize the history manager
	 */
	public async initialize(): Promise<void> {
		try {
			await this.ensureConfigDirectory();
			await this.loadHistory();
			await this.loadFavorites();
			await this.analyzeUsagePatterns();
			
			logger.info(`Command history initialized with ${this.history.length} entries`);
		} catch (error) {
			logger.error('Failed to initialize command history manager:', error);
			throw error;
		}
	}

	/**
	 * Record a command execution
	 */
	public async recordCommand(
		command: CLICommand,
		executionTime: number,
		success: boolean,
		exitCode?: number
	): Promise<void> {
		const entry: CommandHistoryEntry = {
			id: this.generateId(),
			command: `${command.domain}:${command.action}`,
			fullCommand: this.buildFullCommand(command),
			arguments: command.arguments || {},
			options: command.options || {},
			timestamp: new Date(),
			executionTime,
			success,
			exitCode,
			workingDirectory: process.cwd(),
			projectContext: await this.detectProjectContext(),
			tags: this.generateTags(command)
		};

		this.history.unshift(entry);
		
		// Trim history if it gets too large
		if (this.history.length > this.maxHistorySize) {
			this.history = this.history.slice(0, this.maxHistorySize);
		}

		await this.saveHistory();
		await this.updateFavorites(entry);
		await this.analyzeUsagePatterns();

		this.emit('commandRecorded', entry);
		
		logger.debug(`Recorded command: ${entry.command} (${executionTime.toFixed(2)}ms)`);
	}

	/**
	 * Get command history with optional filtering
	 */
	public getHistory(options: HistorySearchOptions = {}): CommandHistoryEntry[] {
		let filteredHistory = this.history;

		// Apply query filter
		if (options.query) {
			const query = options.query.toLowerCase();
			filteredHistory = filteredHistory.filter(entry =>
				entry.command.toLowerCase().includes(query) ||
				entry.fullCommand.toLowerCase().includes(query) ||
				entry.tags.some(tag => tag.toLowerCase().includes(query))
			);
		}

		// Apply time range filter
		if (options.timeRange) {
			filteredHistory = filteredHistory.filter(entry =>
				entry.timestamp >= options.timeRange!.from &&
				entry.timestamp <= options.timeRange!.to
			);
		}

		// Apply success filter
		if (options.successful !== undefined) {
			filteredHistory = filteredHistory.filter(entry =>
				entry.success === options.successful
			);
		}

		// Apply project filter
		if (options.project) {
			filteredHistory = filteredHistory.filter(entry =>
				entry.projectContext?.name === options.project
			);
		}

		// Apply tags filter
		if (options.tags && options.tags.length > 0) {
			filteredHistory = filteredHistory.filter(entry =>
				options.tags!.some(tag => entry.tags.includes(tag))
			);
		}

		// Apply limit
		if (options.limit) {
			filteredHistory = filteredHistory.slice(0, options.limit);
		}

		return filteredHistory;
	}

	/**
	 * Get favorite commands
	 */
	public getFavorites(): CommandFavorite[] {
		return Array.from(this.favorites.values())
			.sort((a, b) => {
				// Sort by use count, then by recency
				if (a.useCount !== b.useCount) {
					return b.useCount - a.useCount;
				}
				return b.lastUsed.getTime() - a.lastUsed.getTime();
			});
	}

	/**
	 * Add command to favorites
	 */
	public async addToFavorites(
		command: string,
		alias?: string,
		description?: string,
		category: string = 'general'
	): Promise<void> {
		const existing = this.favorites.get(command);
		const historyEntries = this.history.filter(entry => entry.command === command);
		
		const favorite: CommandFavorite = {
			command,
			alias,
			description,
			category,
			useCount: existing?.useCount || historyEntries.length,
			lastUsed: existing?.lastUsed || new Date(),
			averageExecutionTime: this.calculateAverageExecutionTime(historyEntries),
			successRate: this.calculateSuccessRate(historyEntries),
			tags: existing?.tags || this.getCommandTags(command)
		};

		this.favorites.set(command, favorite);
		await this.saveFavorites();

		this.emit('favoriteAdded', favorite);
		logger.debug(`Added favorite: ${command}`);
	}

	/**
	 * Remove command from favorites
	 */
	public async removeFromFavorites(command: string): Promise<void> {
		if (this.favorites.has(command)) {
			const favorite = this.favorites.get(command)!;
			this.favorites.delete(command);
			await this.saveFavorites();

			this.emit('favoriteRemoved', favorite);
			logger.debug(`Removed favorite: ${command}`);
		}
	}

	/**
	 * Get intelligent command suggestions
	 */
	public getSuggestions(
		context?: {
			recentCommands?: string[];
			currentProject?: ProjectContext;
			timeOfDay?: 'morning' | 'afternoon' | 'evening';
		}
	): CommandSuggestion[] {
		const suggestions: CommandSuggestion[] = [];

		// Recent commands
		const recentCommands = this.history.slice(0, 10);
		recentCommands.forEach((entry, index) => {
			suggestions.push({
				command: entry.command,
				reason: 'recent',
				confidence: Math.max(0.3, 1 - (index * 0.1)),
				metadata: { lastUsed: entry.timestamp, success: entry.success }
			});
		});

		// Frequent commands
		const commandCounts = new Map<string, number>();
		this.history.forEach(entry => {
			if (entry.success) {
				const count = commandCounts.get(entry.command) || 0;
				commandCounts.set(entry.command, count + 1);
			}
		});

		Array.from(commandCounts.entries())
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5)
			.forEach(([command, count]) => {
				suggestions.push({
					command,
					reason: 'frequent',
					confidence: Math.min(0.9, count / this.history.length * 10),
					metadata: { useCount: count }
				});
			});

		// Pattern-based suggestions
		this.usagePatterns.forEach(pattern => {
			if (context?.recentCommands) {
				const lastCommand = context.recentCommands[context.recentCommands.length - 1];
				const commandIndex = pattern.sequence.indexOf(lastCommand);
				
				if (commandIndex >= 0 && commandIndex < pattern.sequence.length - 1) {
					const nextCommand = pattern.sequence[commandIndex + 1];
					suggestions.push({
						command: nextCommand,
						reason: 'pattern',
						confidence: pattern.frequency / 100 * pattern.successRate,
						metadata: { pattern: pattern.sequence, frequency: pattern.frequency }
					});
				}
			}
		});

		// Favorites
		this.getFavorites().slice(0, 5).forEach(favorite => {
			suggestions.push({
				command: favorite.command,
				reason: 'favorite',
				confidence: Math.min(0.8, favorite.useCount / 50),
				metadata: { 
					useCount: favorite.useCount, 
					successRate: favorite.successRate,
					alias: favorite.alias
				}
			});
		});

		// Context-based suggestions
		if (context?.currentProject) {
			const projectCommands = this.history
				.filter(entry => 
					entry.projectContext?.type === context.currentProject?.type ||
					entry.projectContext?.framework === context.currentProject?.framework
				)
				.slice(0, 3);

			projectCommands.forEach(entry => {
				suggestions.push({
					command: entry.command,
					reason: 'context',
					confidence: 0.6,
					metadata: { 
						projectType: entry.projectContext?.type,
						framework: entry.projectContext?.framework
					}
				});
			});
		}

		// Remove duplicates and sort by confidence
		const uniqueSuggestions = new Map<string, CommandSuggestion>();
		suggestions.forEach(suggestion => {
			const existing = uniqueSuggestions.get(suggestion.command);
			if (!existing || suggestion.confidence > existing.confidence) {
				uniqueSuggestions.set(suggestion.command, suggestion);
			}
		});

		return Array.from(uniqueSuggestions.values())
			.sort((a, b) => b.confidence - a.confidence)
			.slice(0, 10);
	}

	/**
	 * Get usage statistics
	 */
	public getUsageStatistics(): {
		totalCommands: number;
		uniqueCommands: number;
		successRate: number;
		mostUsedCommands: Array<{ command: string; count: number }>;
		averageExecutionTime: number;
		commandsPerDay: number;
		projectDistribution: Record<string, number>;
		timeDistribution: Record<string, number>;
	} {
		const totalCommands = this.history.length;
		const uniqueCommands = new Set(this.history.map(entry => entry.command)).size;
		const successfulCommands = this.history.filter(entry => entry.success).length;
		const successRate = totalCommands > 0 ? successfulCommands / totalCommands : 0;

		// Most used commands
		const commandCounts = new Map<string, number>();
		this.history.forEach(entry => {
			const count = commandCounts.get(entry.command) || 0;
			commandCounts.set(entry.command, count + 1);
		});

		const mostUsedCommands = Array.from(commandCounts.entries())
			.sort(([,a], [,b]) => b - a)
			.slice(0, 10)
			.map(([command, count]) => ({ command, count }));

		// Average execution time
		const totalTime = this.history.reduce((sum, entry) => sum + entry.executionTime, 0);
		const averageExecutionTime = totalCommands > 0 ? totalTime / totalCommands : 0;

		// Commands per day
		const oldestEntry = this.history[this.history.length - 1];
		const daysSinceOldest = oldestEntry 
			? Math.max(1, Math.ceil((Date.now() - oldestEntry.timestamp.getTime()) / (1000 * 60 * 60 * 24)))
			: 1;
		const commandsPerDay = totalCommands / daysSinceOldest;

		// Project distribution
		const projectDistribution: Record<string, number> = {};
		this.history.forEach(entry => {
			if (entry.projectContext?.type) {
				projectDistribution[entry.projectContext.type] = (projectDistribution[entry.projectContext.type] || 0) + 1;
			}
		});

		// Time distribution
		const timeDistribution: Record<string, number> = {
			morning: 0,
			afternoon: 0,
			evening: 0,
			night: 0
		};

		this.history.forEach(entry => {
			const hour = entry.timestamp.getHours();
			if (hour >= 6 && hour < 12) {
				timeDistribution.morning++;
			} else if (hour >= 12 && hour < 18) {
				timeDistribution.afternoon++;
			} else if (hour >= 18 && hour < 22) {
				timeDistribution.evening++;
			} else {
				timeDistribution.night++;
			}
		});

		return {
			totalCommands,
			uniqueCommands,
			successRate,
			mostUsedCommands,
			averageExecutionTime,
			commandsPerDay,
			projectDistribution,
			timeDistribution
		};
	}

	/**
	 * Clear history
	 */
	public async clearHistory(): Promise<void> {
		this.history = [];
		await this.saveHistory();
		this.emit('historyCleared');
		logger.info('Command history cleared');
	}

	/**
	 * Export history to file
	 */
	public async exportHistory(filePath: string, format: 'json' | 'csv' = 'json'): Promise<void> {
		try {
			if (format === 'json') {
				await fs.writeFile(filePath, JSON.stringify(this.history, null, 2));
			} else if (format === 'csv') {
				const csvHeaders = 'ID,Command,Timestamp,Success,ExecutionTime,WorkingDirectory,Tags\n';
				const csvData = this.history.map(entry => 
					`${entry.id},"${entry.command}","${entry.timestamp.toISOString()}",${entry.success},${entry.executionTime},"${entry.workingDirectory}","${entry.tags.join(';')}"`
				).join('\n');
				
				await fs.writeFile(filePath, csvHeaders + csvData);
			}

			logger.info(`History exported to: ${filePath}`);
		} catch (error) {
			logger.error('Failed to export history:', error);
			throw error;
		}
	}

	/**
	 * Display history in a formatted way
	 */
	public displayHistory(options: HistorySearchOptions & { format?: 'table' | 'list' } = {}): void {
		const entries = this.getHistory(options);
		
		if (entries.length === 0) {
			cliLogger.info(chalk.yellow('No command history found matching your criteria'));
			return;
		}

		cliLogger.info(chalk.blue(`\n📜 Command History (${entries.length} entries)\n`));

		if (options.format === 'table') {
			this.displayHistoryTable(entries);
		} else {
			this.displayHistoryList(entries);
		}
	}

	/**
	 * Display favorites
	 */
	public displayFavorites(): void {
		const favorites = this.getFavorites();

		if (favorites.length === 0) {
			cliLogger.info(chalk.yellow('No favorite commands yet. Use frequently to see them here!'));
			return;
		}

		cliLogger.info(chalk.blue('\n⭐ Favorite Commands\n'));

		favorites.forEach((favorite, index) => {
			const alias = favorite.alias ? chalk.dim(` (${favorite.alias})`) : '';
			const stats = chalk.gray(`${favorite.useCount} uses, ${(favorite.successRate * 100).toFixed(1)}% success`);
			
			cliLogger.info(`${chalk.yellow((index + 1).toString().padStart(2))}. ${chalk.cyan(favorite.command)}${alias}`);
			if (favorite.description) {
				cliLogger.info(`    ${chalk.gray(favorite.description)}`);
			}
			cliLogger.info(`    ${stats}`);
			cliLogger.info('');
		});
	}

	// Private helper methods

	private async ensureConfigDirectory(): Promise<void> {
		try {
			await fs.access(this.configDir);
		} catch {
			await fs.mkdir(this.configDir, { recursive: true });
		}
	}

	private async loadHistory(): Promise<void> {
		try {
			const data = await fs.readFile(this.historyFile, 'utf-8');
			const parsed = JSON.parse(data);
			
			this.history = parsed.map((entry: any) => ({
				...entry,
				timestamp: new Date(entry.timestamp)
			}));
		} catch (error) {
			// File might not exist yet, which is fine
			this.history = [];
		}
	}

	private async saveHistory(): Promise<void> {
		try {
			await fs.writeFile(this.historyFile, JSON.stringify(this.history, null, 2));
		} catch (error) {
			logger.error('Failed to save command history:', error);
		}
	}

	private async loadFavorites(): Promise<void> {
		try {
			const data = await fs.readFile(this.favoritesFile, 'utf-8');
			const parsed = JSON.parse(data);
			
			this.favorites = new Map();
			Object.entries(parsed).forEach(([command, favorite]: [string, any]) => {
				this.favorites.set(command, {
					...favorite,
					lastUsed: new Date(favorite.lastUsed)
				});
			});
		} catch (error) {
			// File might not exist yet, which is fine
			this.favorites = new Map();
		}
	}

	private async saveFavorites(): Promise<void> {
		try {
			const favoritesObj = Object.fromEntries(this.favorites.entries());
			await fs.writeFile(this.favoritesFile, JSON.stringify(favoritesObj, null, 2));
		} catch (error) {
			logger.error('Failed to save favorites:', error);
		}
	}

	private async updateFavorites(entry: CommandHistoryEntry): Promise<void> {
		// Auto-add frequently used commands to favorites
		const commandEntries = this.history.filter(h => h.command === entry.command);
		
		if (commandEntries.length >= 5 && !this.favorites.has(entry.command)) {
			await this.addToFavorites(
				entry.command,
				undefined,
				`Frequently used ${entry.command}`,
				this.getCategoryFromCommand(entry.command)
			);
		}
	}

	private async analyzeUsagePatterns(): Promise<void> {
		const patterns = new Map<string, { count: number; times: number[] }>();
		
		// Look for command sequences
		for (let i = 0; i < this.history.length - 2; i++) {
			const sequence = [
				this.history[i].command,
				this.history[i + 1].command,
				this.history[i + 2].command
			];
			
			const key = sequence.join(' -> ');
			const existing = patterns.get(key) || { count: 0, times: [] };
			const timeBetween = this.history[i].timestamp.getTime() - this.history[i + 1].timestamp.getTime();
			
			patterns.set(key, {
				count: existing.count + 1,
				times: [...existing.times, timeBetween]
			});
		}

		// Convert to usage patterns
		this.usagePatterns = Array.from(patterns.entries())
			.filter(([, data]) => data.count >= 2) // Only patterns that occurred at least twice
			.map(([key, data]) => {
				const sequence = key.split(' -> ');
				const avgTimeBetween = data.times.reduce((sum, time) => sum + time, 0) / data.times.length;
				
				return {
					sequence,
					frequency: data.count,
					avgTimeBetween,
					context: 'sequence',
					successRate: 0.8 // Simplified success rate
				};
			})
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 20);
	}

	private async detectProjectContext(): Promise<ProjectContext | undefined> {
		try {
			const packageJsonPath = join(process.cwd(), 'package.json');
			const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
			
			const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
			
			let framework: string | undefined;
			if (dependencies.react) framework = 'react';
			else if (dependencies.next) framework = 'nextjs';
			else if (dependencies.vue) framework = 'vue';
			else if (dependencies['@nestjs/core']) framework = 'nestjs';

			return {
				name: packageJson.name,
				type: framework ? 'frontend' : 'backend',
				framework,
				features: Object.keys(dependencies),
				packageManager: 'npm' // Could be detected more precisely
			};
		} catch {
			return undefined;
		}
	}

	private buildFullCommand(command: CLICommand): string {
		let fullCommand = `xaheen ${command.domain}`;
		
		if (command.action !== 'create') {
			fullCommand += `:${command.action}`;
		}
		
		if (command.target) {
			fullCommand += ` ${command.target}`;
		}

		// Add options
		Object.entries(command.options || {}).forEach(([key, value]) => {
			if (value === true) {
				fullCommand += ` --${key}`;
			} else if (value !== false && value !== undefined) {
				fullCommand += ` --${key} ${value}`;
			}
		});

		return fullCommand;
	}

	private generateTags(command: CLICommand): string[] {
		const tags = [command.domain, command.action];
		
		// Add contextual tags
		if (command.domain === 'make') {
			tags.push('generation', 'scaffold');
		} else if (command.domain === 'security') {
			tags.push('audit', 'compliance');
		} else if (command.domain === 'docs') {
			tags.push('documentation');
		} else if (command.domain === 'mcp' || command.domain === 'ai') {
			tags.push('ai', 'intelligent');
		}

		// Add option-based tags
		if (command.options?.ai) tags.push('ai-enhanced');
		if (command.options?.test) tags.push('testing');
		if (command.options?.docker) tags.push('containerization');

		return tags;
	}

	private generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	private calculateAverageExecutionTime(entries: CommandHistoryEntry[]): number {
		if (entries.length === 0) return 0;
		const total = entries.reduce((sum, entry) => sum + entry.executionTime, 0);
		return total / entries.length;
	}

	private calculateSuccessRate(entries: CommandHistoryEntry[]): number {
		if (entries.length === 0) return 0;
		const successful = entries.filter(entry => entry.success).length;
		return successful / entries.length;
	}

	private getCommandTags(command: string): string[] {
		// Extract tags from command name
		const [domain, action] = command.split(':');
		return [domain, action || 'create'];
	}

	private getCategoryFromCommand(command: string): string {
		const [domain] = command.split(':');
		
		const categoryMap: Record<string, string> = {
			project: 'Project Management',
			app: 'Project Management',
			package: 'Project Management',
			make: 'Code Generation',
			ai: 'AI Tools',
			mcp: 'AI Tools',
			security: 'Security',
			docs: 'Documentation',
			devops: 'DevOps',
			theme: 'Customization'
		};

		return categoryMap[domain] || 'General';
	}

	private displayHistoryTable(entries: CommandHistoryEntry[]): void {
		// Simple table display
		cliLogger.info(chalk.gray('Time'.padEnd(20) + 'Command'.padEnd(30) + 'Status'.padEnd(10) + 'Duration'));
		cliLogger.info(chalk.gray('-'.repeat(80)));

		entries.slice(0, 20).forEach(entry => {
			const time = entry.timestamp.toLocaleString();
			const status = entry.success ? chalk.green('✓') : chalk.red('✗');
			const duration = `${entry.executionTime.toFixed(0)}ms`;
			
			cliLogger.info(
				time.padEnd(20) + 
				entry.command.padEnd(30) + 
				status.padEnd(10) + 
				duration
			);
		});
	}

	private displayHistoryList(entries: CommandHistoryEntry[]): void {
		entries.slice(0, 10).forEach((entry, index) => {
			const timeAgo = this.getTimeAgo(entry.timestamp);
			const status = entry.success ? chalk.green('✓') : chalk.red('✗');
			const duration = chalk.dim(`${entry.executionTime.toFixed(0)}ms`);
			
			cliLogger.info(`${chalk.gray((index + 1).toString().padStart(2))}. ${chalk.cyan(entry.command)} ${status} ${duration}`);
			cliLogger.info(`    ${chalk.gray(timeAgo)} in ${chalk.dim(entry.workingDirectory)}`);
			
			if (entry.tags.length > 0) {
				cliLogger.info(`    ${chalk.dim('Tags:')} ${entry.tags.map(tag => chalk.blue(`#${tag}`)).join(' ')}`);
			}
			
			cliLogger.info('');
		});
	}

	private getTimeAgo(timestamp: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - timestamp.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
		
		return timestamp.toLocaleDateString();
	}
}

export default CommandHistoryManager;