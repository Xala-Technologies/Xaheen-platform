/**
 * Command Validation and Error Handling System
 * Provides comprehensive validation, error recovery, and user-friendly error messages
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { EventEmitter } from "events";
import { z } from "zod";
import chalk from "chalk";
import { logger } from "../../utils/logger.js";

/**
 * Validation rule types
 */
export enum ValidationRuleType {
	REQUIRED = "required",
	FORMAT = "format",
	RANGE = "range",
	CUSTOM = "custom",
	DEPENDENCY = "dependency",
	MUTUALLY_EXCLUSIVE = "mutually_exclusive",
	FILE_EXISTS = "file_exists",
	DIRECTORY_EXISTS = "directory_exists",
	REGEX = "regex",
	ENUM = "enum",
}

/**
 * Validation rule schema
 */
const ValidationRuleSchema = z.object({
	field: z.string(),
	type: z.nativeEnum(ValidationRuleType),
	message: z.string(),
	severity: z.enum(['error', 'warning', 'info']).default('error'),
	condition: z.any().optional(),
	dependencies: z.array(z.string()).optional(),
	customValidator: z.function().optional(),
	metadata: z.record(z.any()).optional(),
});

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

/**
 * Validation result
 */
export interface ValidationResult {
	readonly isValid: boolean;
	readonly errors: ValidationError[];
	readonly warnings: ValidationWarning[];
	readonly suggestions: ValidationSuggestion[];
}

/**
 * Validation error
 */
export interface ValidationError {
	readonly field: string;
	readonly type: ValidationRuleType;
	readonly message: string;
	readonly actualValue?: any;
	readonly expectedValue?: any;
	readonly suggestions: string[];
}

/**
 * Validation warning
 */
export interface ValidationWarning {
	readonly field: string;
	readonly message: string;
	readonly recommendation?: string;
}

/**
 * Validation suggestion
 */
export interface ValidationSuggestion {
	readonly field: string;
	readonly message: string;
	readonly suggestedValue?: any;
	readonly action?: 'fix' | 'improve' | 'optimize';
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
	readonly canRecover: boolean;
	readonly recoverySteps: string[];
	readonly automaticFix?: () => Promise<boolean>;
	readonly requiresUserInput?: boolean;
	readonly severity: 'low' | 'medium' | 'high';
}

/**
 * Command context for validation
 */
export interface CommandContext {
	readonly command: string;
	readonly args: Record<string, any>;
	readonly options: Record<string, any>;
	readonly environment: Record<string, string>;
	readonly workingDirectory: string;
	readonly projectType?: string;
}

/**
 * Validation options
 */
export interface ValidationOptions {
	readonly strict?: boolean;
	readonly skipWarnings?: boolean;
	readonly enableRecovery?: boolean;
	readonly interactive?: boolean;
	readonly continueOnError?: boolean;
}

/**
 * Performance monitoring data
 */
export interface PerformanceMetrics {
	readonly validationTime: number;
	readonly rulesEvaluated: number;
	readonly errorsFound: number;
	readonly warningsFound: number;
	readonly suggestionsGenerated: number;
}

/**
 * Command Validation and Error Handling System
 */
export class CommandValidationSystem extends EventEmitter {
	private validationRules: Map<string, ValidationRule[]> = new Map();
	private customValidators: Map<string, (value: any, context: CommandContext) => Promise<boolean>> = new Map();
	private errorRecoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map();
	private performanceMetrics: PerformanceMetrics[] = [];

	constructor() {
		super();
		this.initializeBuiltinRules();
		this.initializeRecoveryStrategies();
	}

	/**
	 * Initialize validation system
	 */
	public async initialize(): Promise<void> {
		try {
			await this.loadCustomValidationRules();
			logger.info("Command validation system initialized");
		} catch (error) {
			logger.error("Failed to initialize validation system:", error);
			throw error;
		}
	}

	/**
	 * Register validation rule
	 */
	public registerRule(command: string, rule: ValidationRule): void {
		const rules = this.validationRules.get(command) || [];
		rules.push(rule);
		this.validationRules.set(command, rules);
		
		logger.debug(`Registered validation rule for ${command}: ${rule.field}`);
	}

	/**
	 * Register custom validator
	 */
	public registerCustomValidator(
		name: string,
		validator: (value: any, context: CommandContext) => Promise<boolean>
	): void {
		this.customValidators.set(name, validator);
		logger.debug(`Registered custom validator: ${name}`);
	}

	/**
	 * Validate command
	 */
	public async validateCommand(
		context: CommandContext,
		options: ValidationOptions = {}
	): Promise<ValidationResult> {
		const startTime = Date.now();
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
			suggestions: [],
		};

		try {
			const rules = this.validationRules.get(context.command) || [];
			
			for (const rule of rules) {
				const ruleResult = await this.evaluateRule(rule, context, options);
				
				if (ruleResult.error) {
					result.errors.push(ruleResult.error);
					result.isValid = false;
				}
				
				if (ruleResult.warning) {
					result.warnings.push(ruleResult.warning);
				}
				
				if (ruleResult.suggestion) {
					result.suggestions.push(ruleResult.suggestion);
				}
			}

			// Generate additional suggestions based on context
			const contextSuggestions = await this.generateContextualSuggestions(context, result);
			result.suggestions.push(...contextSuggestions);

			// Record performance metrics
			this.recordPerformanceMetrics({
				validationTime: Date.now() - startTime,
				rulesEvaluated: rules.length,
				errorsFound: result.errors.length,
				warningsFound: result.warnings.length,
				suggestionsGenerated: result.suggestions.length,
			});

			this.emit('validationCompleted', context.command, result);
			
		} catch (error) {
			logger.error('Validation failed:', error);
			result.isValid = false;
			result.errors.push({
				field: 'system',
				type: ValidationRuleType.CUSTOM,
				message: `Validation system error: ${error}`,
				suggestions: ['Check system configuration', 'Try again with --verbose flag'],
			});
		}

		return result;
	}

	/**
	 * Get error recovery strategy
	 */
	public getRecoveryStrategy(error: ValidationError): ErrorRecoveryStrategy | null {
		const strategyKey = `${error.field}:${error.type}`;
		return this.errorRecoveryStrategies.get(strategyKey) || 
			   this.errorRecoveryStrategies.get(error.type.toString()) ||
			   null;
	}

	/**
	 * Attempt automatic error recovery
	 */
	public async attemptRecovery(
		errors: ValidationError[],
		context: CommandContext,
		options: { interactive?: boolean } = {}
	): Promise<{
		readonly recovered: ValidationError[];
		readonly failed: ValidationError[];
		readonly requiresUserInput: ValidationError[];
	}> {
		const recovered: ValidationError[] = [];
		const failed: ValidationError[] = [];
		const requiresUserInput: ValidationError[] = [];

		for (const error of errors) {
			const strategy = this.getRecoveryStrategy(error);
			
			if (!strategy || !strategy.canRecover) {
				failed.push(error);
				continue;
			}

			if (strategy.requiresUserInput && !options.interactive) {
				requiresUserInput.push(error);
				continue;
			}

			try {
				if (strategy.automaticFix) {
					const success = await strategy.automaticFix();
					if (success) {
						recovered.push(error);
						logger.info(`Automatically recovered from error: ${error.message}`);
					} else {
						failed.push(error);
					}
				} else {
					// Manual recovery steps
					this.displayRecoverySteps(error, strategy);
					requiresUserInput.push(error);
				}
			} catch (recoveryError) {
				logger.error(`Recovery failed for ${error.field}:`, recoveryError);
				failed.push(error);
			}
		}

		return { recovered, failed, requiresUserInput };
	}

	/**
	 * Format validation result for display
	 */
	public formatValidationResult(result: ValidationResult, options: {
		readonly useColor?: boolean;
		readonly showSuggestions?: boolean;
		readonly compact?: boolean;
	} = {}): string {
		const lines: string[] = [];
		const useColor = options.useColor ?? true;

		// Errors
		if (result.errors.length > 0) {
			lines.push(useColor ? chalk.red.bold('❌ ERRORS:') : 'ERRORS:');
			for (const error of result.errors) {
				const message = `  • ${error.field}: ${error.message}`;
				lines.push(useColor ? chalk.red(message) : message);
				
				if (!options.compact && error.suggestions.length > 0) {
					lines.push(useColor ? chalk.yellow('    Suggestions:') : '    Suggestions:');
					for (const suggestion of error.suggestions) {
						lines.push(`      - ${suggestion}`);
					}
				}
			}
		}

		// Warnings
		if (result.warnings.length > 0) {
			lines.push(useColor ? chalk.yellow.bold('⚠️  WARNINGS:') : 'WARNINGS:');
			for (const warning of result.warnings) {
				const message = `  • ${warning.field}: ${warning.message}`;
				lines.push(useColor ? chalk.yellow(message) : message);
				
				if (warning.recommendation) {
					lines.push(`    Recommendation: ${warning.recommendation}`);
				}
			}
		}

		// Suggestions
		if (options.showSuggestions && result.suggestions.length > 0) {
			lines.push(useColor ? chalk.blue.bold('💡 SUGGESTIONS:') : 'SUGGESTIONS:');
			for (const suggestion of result.suggestions) {
				const message = `  • ${suggestion.field}: ${suggestion.message}`;
				lines.push(useColor ? chalk.blue(message) : message);
			}
		}

		// Summary
		if (result.isValid) {
			const summary = '✅ All validations passed';
			lines.push(useColor ? chalk.green.bold(summary) : summary);
		} else {
			const summary = `❌ Validation failed with ${result.errors.length} error(s)`;
			lines.push(useColor ? chalk.red.bold(summary) : summary);
		}

		return lines.join('\\n');
	}

	/**
	 * Get performance statistics
	 */
	public getPerformanceStats(): {
		readonly averageValidationTime: number;
		readonly totalValidations: number;
		readonly totalRulesEvaluated: number;
		readonly errorRate: number;
		readonly warningRate: number;
	} {
		if (this.performanceMetrics.length === 0) {
			return {
				averageValidationTime: 0,
				totalValidations: 0,
				totalRulesEvaluated: 0,
				errorRate: 0,
				warningRate: 0,
			};
		}

		const total = this.performanceMetrics.length;
		const totalTime = this.performanceMetrics.reduce((sum, m) => sum + m.validationTime, 0);
		const totalRules = this.performanceMetrics.reduce((sum, m) => sum + m.rulesEvaluated, 0);
		const totalErrors = this.performanceMetrics.reduce((sum, m) => sum + m.errorsFound, 0);
		const totalWarnings = this.performanceMetrics.reduce((sum, m) => sum + m.warningsFound, 0);

		return {
			averageValidationTime: totalTime / total,
			totalValidations: total,
			totalRulesEvaluated: totalRules,
			errorRate: totalErrors / total,
			warningRate: totalWarnings / total,
		};
	}

	// Private methods

	private async evaluateRule(
		rule: ValidationRule,
		context: CommandContext,
		options: ValidationOptions
	): Promise<{
		error?: ValidationError;
		warning?: ValidationWarning;
		suggestion?: ValidationSuggestion;
	}> {
		const fieldValue = this.getFieldValue(rule.field, context);
		const result: {
			error?: ValidationError;
			warning?: ValidationWarning;
			suggestion?: ValidationSuggestion;
		} = {};

		try {
			let isValid = true;
			let errorMessage = rule.message;

			switch (rule.type) {
				case ValidationRuleType.REQUIRED:
					isValid = fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
					break;

				case ValidationRuleType.FORMAT:
					if (fieldValue && rule.condition) {
						const format = rule.condition as RegExp | string;
						if (format instanceof RegExp) {
							isValid = format.test(String(fieldValue));
						} else {
							isValid = String(fieldValue).match(format) !== null;
						}
					}
					break;

				case ValidationRuleType.RANGE:
					if (typeof fieldValue === 'number' && rule.condition) {
						const { min, max } = rule.condition as { min?: number; max?: number };
						isValid = (min === undefined || fieldValue >= min) && 
								 (max === undefined || fieldValue <= max);
					}
					break;

				case ValidationRuleType.ENUM:
					if (rule.condition && Array.isArray(rule.condition)) {
						isValid = rule.condition.includes(fieldValue);
					}
					break;

				case ValidationRuleType.CUSTOM:
					if (rule.customValidator) {
						isValid = await rule.customValidator(fieldValue, context);
					}
					break;

				case ValidationRuleType.DEPENDENCY:
					if (rule.dependencies) {
						for (const dep of rule.dependencies) {
							const depValue = this.getFieldValue(dep, context);
							if (!depValue) {
								isValid = false;
								errorMessage = `${rule.field} requires ${dep} to be set`;
								break;
							}
						}
					}
					break;

				case ValidationRuleType.FILE_EXISTS:
					// Implementation would check if file exists
					isValid = true; // Simplified
					break;
			}

			if (!isValid) {
				if (rule.severity === 'error') {
					result.error = {
						field: rule.field,
						type: rule.type,
						message: errorMessage,
						actualValue: fieldValue,
						suggestions: this.generateErrorSuggestions(rule, fieldValue, context),
					};
				} else if (rule.severity === 'warning') {
					result.warning = {
						field: rule.field,
						message: errorMessage,
						recommendation: this.generateRecommendation(rule, fieldValue),
					};
				}
			}

		} catch (error) {
			result.error = {
				field: rule.field,
				type: ValidationRuleType.CUSTOM,
				message: `Validation error: ${error}`,
				suggestions: ['Check field value', 'Review validation rule'],
			};
		}

		return result;
	}

	private getFieldValue(fieldPath: string, context: CommandContext): any {
		// Simple field path resolution (could be enhanced for nested paths)
		if (fieldPath.startsWith('args.')) {
			const key = fieldPath.substring(5);
			return context.args[key];
		} else if (fieldPath.startsWith('options.')) {
			const key = fieldPath.substring(8);
			return context.options[key];
		} else if (fieldPath.startsWith('env.')) {
			const key = fieldPath.substring(4);
			return context.environment[key];
		}
		
		return context.args[fieldPath] || context.options[fieldPath];
	}

	private generateErrorSuggestions(rule: ValidationRule, value: any, context: CommandContext): string[] {
		const suggestions: string[] = [];

		switch (rule.type) {
			case ValidationRuleType.REQUIRED:
				suggestions.push(`Provide a value for ${rule.field}`);
				break;

			case ValidationRuleType.FORMAT:
				suggestions.push(`Check the format of ${rule.field}`);
				if (rule.condition && rule.condition instanceof RegExp) {
					suggestions.push(`Expected format: ${rule.condition.source}`);
				}
				break;

			case ValidationRuleType.ENUM:
				if (rule.condition && Array.isArray(rule.condition)) {
					suggestions.push(`Valid options: ${rule.condition.join(', ')}`);
				}
				break;

			case ValidationRuleType.RANGE:
				if (rule.condition) {
					const { min, max } = rule.condition as { min?: number; max?: number };
					if (min !== undefined && max !== undefined) {
						suggestions.push(`Value must be between ${min} and ${max}`);
					} else if (min !== undefined) {
						suggestions.push(`Value must be at least ${min}`);
					} else if (max !== undefined) {
						suggestions.push(`Value must be at most ${max}`);
					}
				}
				break;
		}

		return suggestions;
	}

	private generateRecommendation(rule: ValidationRule, value: any): string | undefined {
		switch (rule.type) {
			case ValidationRuleType.FORMAT:
				return 'Consider using a different format for better compatibility';
			case ValidationRuleType.RANGE:
				return 'Consider adjusting the value for optimal performance';
			default:
				return undefined;
		}
	}

	private async generateContextualSuggestions(
		context: CommandContext,
		result: ValidationResult
	): Promise<ValidationSuggestion[]> {
		const suggestions: ValidationSuggestion[] = [];

		// Add contextual suggestions based on command and errors
		if (context.command === 'generate' && result.errors.length === 0) {
			suggestions.push({
				field: 'optimization',
				message: 'Consider using --theme option for consistent styling',
				action: 'improve',
			});
		}

		// Add project-specific suggestions
		if (context.projectType === 'react' && !context.options.platform) {
			suggestions.push({
				field: 'platform',
				message: 'Specify platform for optimal React component generation',
				suggestedValue: 'react',
				action: 'optimize',
			});
		}

		return suggestions;
	}

	private displayRecoverySteps(error: ValidationError, strategy: ErrorRecoveryStrategy): void {
		console.log(chalk.yellow.bold(`\\n🔧 Recovery steps for: ${error.message}`));
		
		strategy.recoverySteps.forEach((step, index) => {
			console.log(chalk.cyan(`${index + 1}. ${step}`));
		});
		
		console.log();
	}

	private recordPerformanceMetrics(metrics: PerformanceMetrics): void {
		this.performanceMetrics.push(metrics);
		
		// Keep only last 100 metrics
		if (this.performanceMetrics.length > 100) {
			this.performanceMetrics.shift();
		}
	}

	private initializeBuiltinRules(): void {
		// Add common validation rules
		this.registerRule('generate', {
			field: 'args.type',
			type: ValidationRuleType.REQUIRED,
			message: 'Generation type is required',
			severity: 'error',
		});

		this.registerRule('generate', {
			field: 'args.type',
			type: ValidationRuleType.ENUM,
			message: 'Invalid generation type',
			severity: 'error',
			condition: ['component', 'page', 'layout', 'form', 'data-table', 'navigation'],
		});

		this.registerRule('generate', {
			field: 'args.name',
			type: ValidationRuleType.REQUIRED,
			message: 'Component name is required',
			severity: 'error',
		});

		this.registerRule('generate', {
			field: 'args.name',
			type: ValidationRuleType.FORMAT,
			message: 'Component name should be PascalCase',
			severity: 'warning',
			condition: /^[A-Z][a-zA-Z0-9]*$/,
		});
	}

	private initializeRecoveryStrategies(): void {
		// Required field recovery
		this.errorRecoveryStrategies.set(ValidationRuleType.REQUIRED, {
			canRecover: true,
			requiresUserInput: true,
			severity: 'medium',
			recoverySteps: [
				'Identify the missing required field',
				'Provide a value for the field',
				'Re-run the command with the correct parameters',
			],
		});

		// Format error recovery
		this.errorRecoveryStrategies.set(ValidationRuleType.FORMAT, {
			canRecover: true,
			requiresUserInput: true,
			severity: 'low',
			recoverySteps: [
				'Check the expected format for the field',
				'Correct the field value format',
				'Try the command again',
			],
		});

		// Enum error recovery
		this.errorRecoveryStrategies.set(ValidationRuleType.ENUM, {
			canRecover: true,
			requiresUserInput: true,
			severity: 'medium',
			recoverySteps: [
				'Review the list of valid options',
				'Choose a valid option from the list',
				'Update your command with the correct option',
			],
		});
	}

	private async loadCustomValidationRules(): Promise<void> {
		// Load custom validation rules from configuration
		// This would typically load from a config file or database
		logger.debug('Custom validation rules loaded');
	}
}

/**
 * Default export
 */
export default CommandValidationSystem;