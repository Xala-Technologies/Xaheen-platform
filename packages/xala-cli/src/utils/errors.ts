import chalk from "chalk";
import { logger } from "./logger.js";

export interface CLIError extends Error {
	readonly code?: string;
	readonly exitCode?: number;
}

export class ValidationError extends Error implements CLIError {
	readonly code = "VALIDATION_ERROR";
	readonly exitCode = 1;

	constructor(message: string) {
		super(message);
		this.name = "ValidationError";
	}
}

export class FileSystemError extends Error implements CLIError {
	readonly code = "FILESYSTEM_ERROR";
	readonly exitCode = 2;

	constructor(message: string) {
		super(message);
		this.name = "FileSystemError";
	}
}

export class NetworkError extends Error implements CLIError {
	readonly code = "NETWORK_ERROR";
	readonly exitCode = 3;

	constructor(message: string) {
		super(message);
		this.name = "NetworkError";
	}
}

export class ComplianceError extends Error implements CLIError {
	readonly code = "COMPLIANCE_ERROR";
	readonly exitCode = 4;

	constructor(message: string) {
		super(message);
		this.name = "ComplianceError";
	}
}

export function getExitCode(error: unknown): number {
	if (error && typeof error === "object" && "exitCode" in error) {
		return (error as CLIError).exitCode || 1;
	}
	return 1;
}

export function handleError(error: unknown, exitCode = 1): never {
	logger.error("An error occurred:");

	if (error instanceof Error) {
		logger.error(error.message);

		if (process.env.DEBUG === "true" && error.stack) {
			console.error(chalk.dim(error.stack));
		}
	} else {
		logger.error("Unknown error occurred");
		console.error(error);
	}

	console.error("\n" + chalk.dim("For help, run: xala --help"));
	console.error(
		chalk.dim(
			"For support, visit: https://github.com/xala-technologies/ui-system/issues",
		),
	);

	process.exit(exitCode);
}
