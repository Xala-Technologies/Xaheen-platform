import chalk from "chalk";
import { logger } from "./logger.js";

// Base error class for all scaffolding errors
export class ScaffoldError extends Error {
	public code: string;
	public details?: any;
	public suggestions?: string[];

	constructor(
		message: string,
		code: string,
		details?: any,
		suggestions?: string[],
	) {
		super(message);
		this.name = "ScaffoldError";
		this.code = code;
		this.details = details;
		this.suggestions = suggestions;

		// Capture stack trace
		Error.captureStackTrace(this, this.constructor);
	}
}

// Specific error classes
export class ConfigurationError extends ScaffoldError {
	constructor(message: string, details?: any) {
		super(message, "CONFIG_ERROR", details, [
			"Check your .xalarc.json configuration file",
			'Run "xala-scaffold config --init" to create a default config',
			"Verify environment variables are set correctly",
		]);
		this.name = "ConfigurationError";
	}
}

export class TemplateError extends ScaffoldError {
	constructor(message: string, templateName?: string, details?: any) {
		super(message, "TEMPLATE_ERROR", { templateName, ...details }, [
			"Verify the template exists in the templates directory",
			"Check template.json for correct metadata",
			"Ensure all template files are accessible",
		]);
		this.name = "TemplateError";
	}
}

export class ValidationError extends ScaffoldError {
	public validationErrors: Array<{ field: string; message: string }>;

	constructor(
		message: string,
		validationErrors: Array<{ field: string; message: string }>,
	) {
		super(message, "VALIDATION_ERROR", { validationErrors }, [
			"Review the validation errors above",
			"Check the field requirements",
			"Use --help to see valid options",
		]);
		this.name = "ValidationError";
		this.validationErrors = validationErrors;
	}
}

export class FileSystemError extends ScaffoldError {
	constructor(message: string, path?: string, operation?: string) {
		super(message, "FILESYSTEM_ERROR", { path, operation }, [
			"Check file/directory permissions",
			"Ensure the path is not locked by another process",
			"Verify you have write access to the directory",
		]);
		this.name = "FileSystemError";
	}
}

export class NetworkError extends ScaffoldError {
	constructor(message: string, url?: string, statusCode?: number) {
		super(message, "NETWORK_ERROR", { url, statusCode }, [
			"Check your internet connection",
			"Verify the URL is correct",
			"Try again later if the service is down",
		]);
		this.name = "NetworkError";
	}
}

export class DependencyError extends ScaffoldError {
	constructor(message: string, dependency?: string, details?: any) {
		super(message, "DEPENDENCY_ERROR", { dependency, ...details }, [
			'Run "npm install" or "pnpm install"',
			"Check if the dependency is in package.json",
			"Clear node_modules and reinstall",
		]);
		this.name = "DependencyError";
	}
}

export class GitError extends ScaffoldError {
	constructor(message: string, command?: string, exitCode?: number) {
		super(message, "GIT_ERROR", { command, exitCode }, [
			"Ensure Git is installed and in PATH",
			"Check if you're in a Git repository",
			"Verify you have the necessary Git permissions",
		]);
		this.name = "GitError";
	}
}

export class ComplianceError extends ScaffoldError {
	constructor(message: string, standard?: string, violations?: string[]) {
		super(message, "COMPLIANCE_ERROR", { standard, violations }, [
			"Review Norwegian compliance requirements",
			"Check WCAG AAA accessibility standards",
			"Ensure GDPR compliance in data handling",
		]);
		this.name = "ComplianceError";
	}
}

export class LocalizationError extends ScaffoldError {
	constructor(message: string, locale?: string, key?: string) {
		super(message, "LOCALIZATION_ERROR", { locale, key }, [
			"Check if translation key exists",
			"Verify locale is supported",
			"Add missing translations to locale files",
		]);
		this.name = "LocalizationError";
	}
}

// Error handler function
export function handleError(error: unknown, exitCode = 1): void {
	console.error(); // Empty line for spacing

	if (error instanceof ScaffoldError) {
		// Handle our custom errors
		logger.fail(`${error.name}: ${error.message}`);

		if (error.details) {
			console.error(chalk.gray("\nDetails:"));
			console.error(chalk.gray(JSON.stringify(error.details, null, 2)));
		}

		if (error.suggestions && error.suggestions.length > 0) {
			console.error(chalk.yellow("\nSuggestions:"));
			error.suggestions.forEach((suggestion) => {
				console.error(chalk.yellow(`  • ${suggestion}`));
			});
		}

		if (error instanceof ValidationError && error.validationErrors.length > 0) {
			console.error(chalk.red("\nValidation Errors:"));
			error.validationErrors.forEach(({ field, message }) => {
				console.error(chalk.red(`  • ${field}: ${message}`));
			});
		}
	} else if (error instanceof Error) {
		// Handle standard errors
		logger.fail(`Error: ${error.message}`);

		if (process.argv.includes("--verbose") || process.env.DEBUG) {
			console.error(chalk.gray("\nStack trace:"));
			console.error(chalk.gray(error.stack));
		}
	} else {
		// Handle unknown errors
		logger.fail("An unexpected error occurred");
		console.error(error);
	}

	console.error(chalk.gray("\nError code: " + exitCode));

	if (!process.argv.includes("--verbose") && !process.env.DEBUG) {
		console.error(chalk.gray("Run with --verbose for more details"));
	}

	process.exit(exitCode);
}

// Error recovery strategies
export interface RecoveryStrategy {
	canRecover(error: Error): boolean;
	recover(error: Error): Promise<void>;
}

export class ErrorRecovery {
	private strategies: RecoveryStrategy[] = [];

	addStrategy(strategy: RecoveryStrategy): void {
		this.strategies.push(strategy);
	}

	async tryRecover(error: Error): Promise<boolean> {
		for (const strategy of this.strategies) {
			if (strategy.canRecover(error)) {
				try {
					await strategy.recover(error);
					logger.success("Successfully recovered from error");
					return true;
				} catch (recoveryError) {
					logger.warn("Recovery strategy failed:", recoveryError);
				}
			}
		}
		return false;
	}
}

// Default error recovery instance
export const errorRecovery = new ErrorRecovery();

// Common recovery strategies
export const retryStrategy: RecoveryStrategy = {
	canRecover(error: Error): boolean {
		return error instanceof NetworkError;
	},

	async recover(error: Error): Promise<void> {
		logger.info("Retrying operation...");
		// Retry logic would go here
		throw new Error("Retry not implemented");
	},
};

export const cleanupStrategy: RecoveryStrategy = {
	canRecover(error: Error): boolean {
		return error instanceof FileSystemError;
	},

	async recover(error: Error): Promise<void> {
		const fsError = error as FileSystemError;
		if (fsError.details?.path) {
			logger.info(`Cleaning up: ${fsError.details.path}`);
			// Cleanup logic would go here
		}
		throw new Error("Cleanup not implemented");
	},
};

// Error code mappings for exit codes
export const ERROR_CODES = {
	SUCCESS: 0,
	GENERAL_ERROR: 1,
	MISUSE_SHELL_COMMAND: 2,
	CONFIGURATION_ERROR: 3,
	TEMPLATE_ERROR: 4,
	VALIDATION_ERROR: 5,
	FILESYSTEM_ERROR: 6,
	NETWORK_ERROR: 7,
	DEPENDENCY_ERROR: 8,
	GIT_ERROR: 9,
	COMPLIANCE_ERROR: 10,
	LOCALIZATION_ERROR: 11,
	UNKNOWN_ERROR: 99,
} as const;

// Get appropriate exit code for error
export function getExitCode(error: unknown): number {
	if (error instanceof ConfigurationError)
		return ERROR_CODES.CONFIGURATION_ERROR;
	if (error instanceof TemplateError) return ERROR_CODES.TEMPLATE_ERROR;
	if (error instanceof ValidationError) return ERROR_CODES.VALIDATION_ERROR;
	if (error instanceof FileSystemError) return ERROR_CODES.FILESYSTEM_ERROR;
	if (error instanceof NetworkError) return ERROR_CODES.NETWORK_ERROR;
	if (error instanceof DependencyError) return ERROR_CODES.DEPENDENCY_ERROR;
	if (error instanceof GitError) return ERROR_CODES.GIT_ERROR;
	if (error instanceof ComplianceError) return ERROR_CODES.COMPLIANCE_ERROR;
	if (error instanceof LocalizationError) return ERROR_CODES.LOCALIZATION_ERROR;

	return ERROR_CODES.GENERAL_ERROR;
}

// Wrap async functions with error handling
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	customHandler?: (error: unknown) => void,
): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			if (customHandler) {
				customHandler(error);
			} else {
				handleError(error, getExitCode(error));
			}
		}
	}) as T;
}

// Assert functions for validation
export function assert(
	condition: boolean,
	message: string,
	code?: string,
): asserts condition {
	if (!condition) {
		throw new ScaffoldError(message, code || "ASSERTION_ERROR");
	}
}

export function assertConfig(
	condition: boolean,
	message: string,
): asserts condition {
	if (!condition) {
		throw new ConfigurationError(message);
	}
}

export function assertTemplate(
	condition: boolean,
	message: string,
	templateName?: string,
): asserts condition {
	if (!condition) {
		throw new TemplateError(message, templateName);
	}
}

export function assertFileSystem(
	condition: boolean,
	message: string,
	path?: string,
): asserts condition {
	if (!condition) {
		throw new FileSystemError(message, path);
	}
}
