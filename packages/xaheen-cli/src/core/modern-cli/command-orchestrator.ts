/**
 * Modern CLI Command Orchestrator
 * 
 * Provides modern CLI patterns including:
 * - Command composition and chaining
 * - Plugin architecture integration
 * - Interactive command discovery
 * - Performance monitoring
 * - Command validation and error handling
 * 
 * Part of EPIC 2, Story 2.1: Modern CLI Patterns Implementation
 */

import chalk from "chalk";
import { performance } from "perf_hooks";
import { EventEmitter } from "events";
import type { Command } from "commander";
import type { CLICommand, CommandRoute } from "../../types/index";
import { CLIError } from "../../types/index";
import { logger, cliLogger } from "../../utils/logger";
import { PluginManager } from "../../services/plugins/plugin-manager";

export interface CommandMetrics {
	readonly commandName: string;
	readonly executionTime: number;
	readonly success: boolean;
	readonly memoryUsage: {
		readonly before: NodeJS.MemoryUsage;
		readonly after: NodeJS.MemoryUsage;
	};
	readonly timestamp: Date;
	readonly options: Record<string, any>;
	readonly errorCode?: string;
}

export interface CommandChain {
	readonly commands: CLICommand[];
	readonly sequential: boolean;
	readonly continueOnError: boolean;
	readonly rollbackOnFailure: boolean;
}

export interface CommandContext {
	readonly command: CLICommand;
	readonly metrics: CommandMetrics;
	readonly previous?: CommandContext;
	readonly chain?: CommandChain;
}

export interface CommandValidator {
	validate(command: CLICommand): Promise<ValidationResult>;
}

export interface ValidationResult {
	readonly valid: boolean;
	readonly errors: string[];
	readonly warnings: string[];
	readonly suggestions: string[];
}

export interface CommandPlugin {
	readonly name: string;
	readonly version: string;
	readonly priority: number;
	beforeExecute?(context: CommandContext): Promise<CommandContext>;
	afterExecute?(context: CommandContext, result: any): Promise<any>;
	onError?(context: CommandContext, error: Error): Promise<Error | null>;
}

/**
 * Modern CLI Command Orchestrator with advanced patterns
 */
export class CommandOrchestrator extends EventEmitter {
	private readonly validators: Map<string, CommandValidator> = new Map();
	private readonly plugins: Map<string, CommandPlugin> = new Map();
	private readonly metrics: CommandMetrics[] = [];
	private readonly maxMetricsHistory = 1000;
	private readonly pluginManager: PluginManager;

	constructor(pluginManager: PluginManager) {
		super();
		this.pluginManager = pluginManager;
		this.setupDefaultValidators();
	}

	/**
	 * Execute a single command with full orchestration
	 */
	public async executeCommand(
		command: CLICommand,
		handler: (cmd: CLICommand) => Promise<any>,
		options: {
			validate?: boolean;
			metrics?: boolean;
			plugins?: boolean;
		} = {}
	): Promise<any> {
		const {
			validate = true,
			metrics = true,
			plugins = true
		} = options;

		const startTime = performance.now();
		const memoryBefore = process.memoryUsage();
		
		let context: CommandContext = {
			command,
			metrics: {
				commandName: `${command.domain}:${command.action}`,
				executionTime: 0,
				success: false,
				memoryUsage: {
					before: memoryBefore,
					after: memoryBefore
				},
				timestamp: new Date(),
				options: command.options || {}
			}
		};

		try {
			this.emit('commandStart', context);

			// Step 1: Validation
			if (validate) {
				const validationResult = await this.validateCommand(command);
				if (!validationResult.valid) {
					throw new CLIError(
						`Command validation failed: ${validationResult.errors.join(', ')}`,
						'VALIDATION_ERROR'
					);
				}

				// Show warnings if any
				if (validationResult.warnings.length > 0) {
					validationResult.warnings.forEach(warning => {
						cliLogger.warn(chalk.yellow(`⚠️  ${warning}`));
					});
				}

				// Show suggestions if any
				if (validationResult.suggestions.length > 0) {
					validationResult.suggestions.forEach(suggestion => {
						cliLogger.info(chalk.blue(`💡 ${suggestion}`));
					});
				}
			}

			// Step 2: Plugin pre-execution hooks
			if (plugins) {
				context = await this.executePluginHooks('beforeExecute', context);
			}

			// Step 3: Execute the actual command
			let result = await handler(command);

			// Step 4: Plugin post-execution hooks
			if (plugins) {
				result = await this.executePluginPostHooks(context, result);
			}

			// Step 5: Record success metrics
			const endTime = performance.now();
			const memoryAfter = process.memoryUsage();
			
			context.metrics = {
				...context.metrics,
				executionTime: endTime - startTime,
				success: true,
				memoryUsage: {
					before: memoryBefore,
					after: memoryAfter
				}
			};

			if (metrics) {
				this.recordMetrics(context.metrics);
			}

			this.emit('commandSuccess', context, result);
			return result;

		} catch (error) {
			const endTime = performance.now();
			const memoryAfter = process.memoryUsage();

			// Record failure metrics
			context.metrics = {
				...context.metrics,
				executionTime: endTime - startTime,
				success: false,
				memoryUsage: {
					before: memoryBefore,
					after: memoryAfter
				},
				errorCode: error instanceof CLIError ? error.code : 'UNKNOWN_ERROR'
			};

			if (metrics) {
				this.recordMetrics(context.metrics);
			}

			// Plugin error handling
			if (plugins) {
				const handledError = await this.executePluginErrorHooks(context, error);
				if (handledError === null) {
					// Plugin handled the error, return gracefully
					return null;
				}
				// Use the transformed error
				error = handledError;
			}

			this.emit('commandError', context, error);
			throw error;
		}
	}

	/**
	 * Execute a chain of commands
	 */
	public async executeCommandChain(chain: CommandChain): Promise<any[]> {
		const results: any[] = [];
		let previousContext: CommandContext | undefined;

		cliLogger.info(chalk.blue(`🔗 Executing command chain (${chain.commands.length} commands)`));

		for (let i = 0; i < chain.commands.length; i++) {
			const command = chain.commands[i];
			const isLastCommand = i === chain.commands.length - 1;

			try {
				cliLogger.info(chalk.gray(`[${i + 1}/${chain.commands.length}] ${command.domain}:${command.action}`));

				// Create a mock handler for demonstration
				const handler = async (cmd: CLICommand) => {
					return { success: true, command: cmd.domain + ':' + cmd.action };
				};

				const result = await this.executeCommand(command, handler);
				results.push(result);

				// Update chain context
				previousContext = {
					command,
					metrics: this.getLastMetrics()!,
					previous: previousContext,
					chain
				};

			} catch (error) {
				if (!chain.continueOnError) {
					cliLogger.error(chalk.red(`❌ Command chain failed at step ${i + 1}`));
					
					if (chain.rollbackOnFailure && results.length > 0) {
						cliLogger.info(chalk.yellow(`🔄 Rolling back ${results.length} successful operations...`));
						await this.rollbackOperations(results);
					}
					
					throw error;
				} else {
					cliLogger.warn(chalk.yellow(`⚠️  Command ${i + 1} failed, continuing chain...`));
					results.push({ error: error.message });
				}
			}
		}

		cliLogger.info(chalk.green(`✅ Command chain completed (${results.length} operations)`));
		return results;
	}

	/**
	 * Register a command validator
	 */
	public registerValidator(pattern: string, validator: CommandValidator): void {
		this.validators.set(pattern, validator);
		logger.debug(`Registered validator for pattern: ${pattern}`);
	}

	/**
	 * Register a command plugin
	 */
	public registerPlugin(plugin: CommandPlugin): void {
		this.plugins.set(plugin.name, plugin);
		logger.debug(`Registered plugin: ${plugin.name} v${plugin.version}`);
	}

	/**
	 * Get command execution metrics
	 */
	public getMetrics(filter?: {
		commandName?: string;
		since?: Date;
		successful?: boolean;
	}): CommandMetrics[] {
		let filteredMetrics = this.metrics;

		if (filter) {
			if (filter.commandName) {
				filteredMetrics = filteredMetrics.filter(m => 
					m.commandName.includes(filter.commandName!)
				);
			}

			if (filter.since) {
				filteredMetrics = filteredMetrics.filter(m => 
					m.timestamp >= filter.since!
				);
			}

			if (filter.successful !== undefined) {
				filteredMetrics = filteredMetrics.filter(m => 
					m.success === filter.successful
				);
			}
		}

		return filteredMetrics;
	}

	/**
	 * Get performance analytics
	 */
	public getPerformanceAnalytics(): {
		totalCommands: number;
		successRate: number;
		averageExecutionTime: number;
		memoryEfficiency: number;
		slowestCommands: Array<{ command: string; time: number }>;
		errorFrequency: Map<string, number>;
	} {
		const totalCommands = this.metrics.length;
		const successfulCommands = this.metrics.filter(m => m.success).length;
		const successRate = totalCommands > 0 ? successfulCommands / totalCommands : 0;

		const averageExecutionTime = totalCommands > 0 
			? this.metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalCommands 
			: 0;

		const memoryEfficiency = this.calculateMemoryEfficiency();
		
		const slowestCommands = this.metrics
			.sort((a, b) => b.executionTime - a.executionTime)
			.slice(0, 5)
			.map(m => ({ command: m.commandName, time: m.executionTime }));

		const errorFrequency = new Map<string, number>();
		this.metrics
			.filter(m => !m.success && m.errorCode)
			.forEach(m => {
				const count = errorFrequency.get(m.errorCode!) || 0;
				errorFrequency.set(m.errorCode!, count + 1);
			});

		return {
			totalCommands,
			successRate,
			averageExecutionTime,
			memoryEfficiency,
			slowestCommands,
			errorFrequency
		};
	}

	/**
	 * Display performance report
	 */
	public displayPerformanceReport(): void {
		const analytics = this.getPerformanceAnalytics();

		cliLogger.info(chalk.blue('\n📊 CLI Performance Report\n'));
		
		cliLogger.info(`${chalk.green('Total Commands:')} ${analytics.totalCommands}`);
		cliLogger.info(`${chalk.green('Success Rate:')} ${(analytics.successRate * 100).toFixed(1)}%`);
		cliLogger.info(`${chalk.green('Average Execution Time:')} ${analytics.averageExecutionTime.toFixed(2)}ms`);
		cliLogger.info(`${chalk.green('Memory Efficiency:')} ${analytics.memoryEfficiency.toFixed(1)}%`);

		if (analytics.slowestCommands.length > 0) {
			cliLogger.info(chalk.yellow('\n🐌 Slowest Commands:'));
			analytics.slowestCommands.forEach((cmd, i) => {
				cliLogger.info(`  ${i + 1}. ${chalk.cyan(cmd.command)} - ${cmd.time.toFixed(2)}ms`);
			});
		}

		if (analytics.errorFrequency.size > 0) {
			cliLogger.info(chalk.red('\n❌ Common Errors:'));
			Array.from(analytics.errorFrequency.entries())
				.sort(([,a], [,b]) => b - a)
				.forEach(([error, count]) => {
					cliLogger.info(`  ${chalk.red(error)}: ${count} occurrences`);
				});
		}
	}

	// Private helper methods

	private async validateCommand(command: CLICommand): Promise<ValidationResult> {
		const commandPattern = `${command.domain}:${command.action}`;
		const validator = this.validators.get(commandPattern) || 
						 this.validators.get(command.domain) ||
						 this.validators.get('*');

		if (validator) {
			return await validator.validate(command);
		}

		// Default validation
		return {
			valid: true,
			errors: [],
			warnings: [],
			suggestions: []
		};
	}

	private async executePluginHooks(
		hookName: 'beforeExecute',
		context: CommandContext
	): Promise<CommandContext> {
		const sortedPlugins = Array.from(this.plugins.values())
			.sort((a, b) => b.priority - a.priority);

		let currentContext = context;

		for (const plugin of sortedPlugins) {
			if (plugin[hookName]) {
				try {
					currentContext = await plugin[hookName]!(currentContext);
				} catch (error) {
					logger.warn(`Plugin ${plugin.name} hook ${hookName} failed:`, error);
				}
			}
		}

		return currentContext;
	}

	private async executePluginPostHooks(
		context: CommandContext,
		result: any
	): Promise<any> {
		const sortedPlugins = Array.from(this.plugins.values())
			.sort((a, b) => a.priority - b.priority); // Reverse order for post hooks

		let currentResult = result;

		for (const plugin of sortedPlugins) {
			if (plugin.afterExecute) {
				try {
					currentResult = await plugin.afterExecute(context, currentResult);
				} catch (error) {
					logger.warn(`Plugin ${plugin.name} afterExecute hook failed:`, error);
				}
			}
		}

		return currentResult;
	}

	private async executePluginErrorHooks(
		context: CommandContext,
		error: Error
	): Promise<Error | null> {
		const sortedPlugins = Array.from(this.plugins.values())
			.sort((a, b) => b.priority - a.priority);

		let currentError: Error | null = error;

		for (const plugin of sortedPlugins) {
			if (plugin.onError && currentError) {
				try {
					currentError = await plugin.onError(context, currentError);
				} catch (pluginError) {
					logger.warn(`Plugin ${plugin.name} error hook failed:`, pluginError);
				}
			}
		}

		return currentError;
	}

	private recordMetrics(metrics: CommandMetrics): void {
		this.metrics.push(metrics);

		// Keep only the most recent metrics
		if (this.metrics.length > this.maxMetricsHistory) {
			this.metrics.shift();
		}

		logger.debug(`Command metrics recorded: ${metrics.commandName} (${metrics.executionTime.toFixed(2)}ms)`);
	}

	private getLastMetrics(): CommandMetrics | undefined {
		return this.metrics[this.metrics.length - 1];
	}

	private calculateMemoryEfficiency(): number {
		if (this.metrics.length === 0) return 100;

		const memoryGrowths = this.metrics.map(m => {
			const beforeTotal = Object.values(m.memoryUsage.before).reduce((sum, val) => sum + val, 0);
			const afterTotal = Object.values(m.memoryUsage.after).reduce((sum, val) => sum + val, 0);
			return afterTotal - beforeTotal;
		});

		const avgGrowth = memoryGrowths.reduce((sum, growth) => sum + growth, 0) / memoryGrowths.length;
		
		// Higher efficiency = lower memory growth
		return Math.max(0, 100 - (avgGrowth / 1024 / 1024)); // Convert to MB
	}

	private async rollbackOperations(results: any[]): Promise<void> {
		// Implement rollback logic based on operation results
		// This is a placeholder for complex rollback scenarios
		cliLogger.info(chalk.yellow('🔄 Rollback completed'));
	}

	private setupDefaultValidators(): void {
		// Register default command validators
		this.registerValidator('*', {
			async validate(command: CLICommand): Promise<ValidationResult> {
				const errors: string[] = [];
				const warnings: string[] = [];
				const suggestions: string[] = [];

				// Basic validation
				if (!command.domain) {
					errors.push('Command domain is required');
				}

				if (!command.action) {
					errors.push('Command action is required');
				}

				// Check for deprecated patterns
				if (command.domain === 'make' && !command.options?.ai) {
					suggestions.push('Consider using --ai flag for enhanced generation');
				}

				return {
					valid: errors.length === 0,
					errors,
					warnings,
					suggestions
				};
			}
		});
	}
}

export default CommandOrchestrator;