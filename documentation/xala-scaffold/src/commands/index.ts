import { Command } from "commander";
import { logger } from "../utils/logger.js";

// Command interface for all commands
export interface CommandInterface {
	name: string;
	description: string;
	alias?: string;
	execute: (options: any) => Promise<void>;
}

// Command metadata for registration
export interface CommandMetadata {
	name: string;
	description: string;
	alias?: string;
	options?: Array<{
		flags: string;
		description: string;
		defaultValue?: any;
	}>;
	arguments?: Array<{
		name: string;
		description: string;
		required?: boolean;
	}>;
	action: (...args: any[]) => Promise<void>;
}

// Map of registered commands
const commandRegistry = new Map<string, CommandMetadata>();

// Register a command
export function registerCommand(metadata: CommandMetadata): void {
	if (commandRegistry.has(metadata.name)) {
		logger.warn(
			`Command "${metadata.name}" is already registered. Overwriting...`,
		);
	}
	commandRegistry.set(metadata.name, metadata);
	logger.debug(`Registered command: ${metadata.name}`);
}

// Register all commands with the program
export async function registerCommands(program: Command): Promise<void> {
	logger.debug("Loading commands...");

	// Dynamically import command modules
	try {
		// Import init command
		const { default: initCommand } = await import("./init.js").catch(() => ({
			default: null,
		}));
		if (initCommand) registerCommand(initCommand);

		// Import migrate command
		const { default: migrateCommand } = await import("./migrate.js").catch(
			() => ({ default: null }),
		);
		if (migrateCommand) registerCommand(migrateCommand);

		// Import generate command with subcommands
		const { default: generateCommand, registerGenerateSubcommands } =
			await import("./generate/index.js").catch(() => ({
				default: null,
				registerGenerateSubcommands: null,
			}));
		if (generateCommand) {
			registerCommand(generateCommand);
			// Register subcommands after all commands are registered
			if (registerGenerateSubcommands) {
				setTimeout(() => registerGenerateSubcommands(program), 0);
			}
		}

		// Import config command
		const { default: configCommand } = await import("./config.js").catch(
			() => ({ default: null }),
		);
		if (configCommand) registerCommand(configCommand);

		// Import and configure AI command (different architecture)
		const { AICommand } = await import("./ai.js").catch(() => ({
			AICommand: null,
		}));
		if (AICommand) {
			try {
				// Create mock services for AI command (in production, use proper DI)
				const mockLogger = logger;
				const mockConfig = {
					get: (key: string, defaultValue?: any) => defaultValue,
				};
				const mockLocalization = {
					t: (key: string, defaultValue?: string) => defaultValue || key,
				};
				const mockFileSystem = {
					writeFile: async (path: string, content: string) => {
						const fs = await import("fs/promises");
						await fs.writeFile(path, content, "utf-8");
					},
					readFile: async (path: string) => {
						const fs = await import("fs/promises");
						return fs.readFile(path, "utf-8");
					},
					exists: async (path: string) => {
						const fs = await import("fs/promises");
						try {
							await fs.access(path);
							return true;
						} catch {
							return false;
						}
					},
					readDirectory: async (path: string) => {
						const fs = await import("fs/promises");
						return fs.readdir(path);
					},
				};

				const aiCommandInstance = new AICommand(
					mockLogger as any,
					mockConfig as any,
					mockLocalization as any,
					mockFileSystem as any,
				);

				// Configure AI command with the program
				aiCommandInstance.configureCommand(program);
				logger.debug("AI command configured successfully");
			} catch (error) {
				logger.warn("Failed to configure AI command:", error);
			}
		}
	} catch (error) {
		logger.error("Failed to load commands:", error);
	}

	// Register loaded commands with Commander
	for (const [name, metadata] of commandRegistry) {
		const command = program.command(name);

		if (metadata.alias) {
			command.alias(metadata.alias);
		}

		command.description(metadata.description);

		// Add arguments
		if (metadata.arguments) {
			for (const arg of metadata.arguments) {
				const argString = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
				command.argument(argString, arg.description);
			}
		}

		// Add options
		if (metadata.options) {
			for (const option of metadata.options) {
				command.option(option.flags, option.description, option.defaultValue);
			}
		}

		// Set action handler
		command.action(async (...args) => {
			try {
				await metadata.action(...args);
			} catch (error) {
				logger.error(`Command "${name}" failed:`, error);
				process.exit(1);
			}
		});
	}

	logger.debug(`Registered ${commandRegistry.size} commands`);
}

// Command validation helper
export function validateCommand(name: string): boolean {
	return commandRegistry.has(name);
}

// Get command suggestions for typos
export function getCommandSuggestions(input: string): string[] {
	const commands = Array.from(commandRegistry.keys());
	const suggestions: Array<{ command: string; distance: number }> = [];

	for (const command of commands) {
		const distance = levenshteinDistance(
			input.toLowerCase(),
			command.toLowerCase(),
		);
		if (distance <= 2) {
			suggestions.push({ command, distance });
		}
	}

	return suggestions
		.sort((a, b) => a.distance - b.distance)
		.map((s) => s.command)
		.slice(0, 3);
}

// Levenshtein distance for command suggestions
function levenshteinDistance(a: string, b: string): number {
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
					matrix[i - 1][j - 1] + 1,
					matrix[i][j - 1] + 1,
					matrix[i - 1][j] + 1,
				);
			}
		}
	}

	return matrix[b.length][a.length];
}
