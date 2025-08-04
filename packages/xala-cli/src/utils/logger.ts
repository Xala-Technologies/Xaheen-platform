import chalk from "chalk";

export interface Logger {
	readonly debug: (message: string, ...args: any[]) => void;
	readonly info: (message: string, ...args: any[]) => void;
	readonly warn: (message: string, ...args: any[]) => void;
	readonly error: (message: string, ...args: any[]) => void;
	readonly success: (message: string, ...args: any[]) => void;
}

class CLILogger implements Logger {
	private readonly isDebug: boolean;

	constructor(isDebug = false) {
		this.isDebug = isDebug || process.env.DEBUG === "true";
	}

	debug(message: string, ...args: any[]): void {
		if (this.isDebug) {
			console.log(chalk.gray(`[DEBUG] ${message}`), ...args);
		}
	}

	info(message: string, ...args: any[]): void {
		console.log(chalk.blue(`[INFO] ${message}`), ...args);
	}

	warn(message: string, ...args: any[]): void {
		console.warn(chalk.yellow(`[WARN] ${message}`), ...args);
	}

	error(message: string, ...args: any[]): void {
		console.error(chalk.red(`[ERROR] ${message}`), ...args);
	}

	success(message: string, ...args: any[]): void {
		console.log(chalk.green(`[SUCCESS] ${message}`), ...args);
	}
}

export const logger: Logger = new CLILogger();
