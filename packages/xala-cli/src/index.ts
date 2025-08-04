#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { createRequire } from "module";
import { registerCommands } from "./commands/index.js";
import { displayBanner } from "./utils/banner.js";
import { getExitCode, handleError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";
import { configureGlobalOptions } from "./utils/options.js";
import { checkForUpdates } from "./utils/updates.js";

const require = createRequire(import.meta.url);
const { version, description } = require("../package.json");

// Create main program instance
export const program = new Command();

// Configure program metadata
program
	.name("xala")
	.description(description)
	.version(version, "-v, --version", "Display version number")
	.helpOption("-h, --help", "Display help for command");

// Configure global options
configureGlobalOptions(program);

// Setup error handling
process.on("uncaughtException", (error) => {
	handleError(error, getExitCode(error));
});

process.on("unhandledRejection", (error) => {
	handleError(error, getExitCode(error));
});

// Add custom help text with examples
program.configureHelp({
	sortSubcommands: true,
	subcommandTerm: (cmd) => cmd.name() + " " + cmd.alias(),
});

program.addHelpText("before", "\n");

program.addHelpText(
	"after",
	`
${chalk.bold("Examples:")}
  ${chalk.gray("# Install UI system in existing application")}
  $ xala install --platform react --setup-providers

  ${chalk.gray("# Analyze existing code for migration compatibility")}
  $ xala migrate analyze --report

  ${chalk.gray("# Quick check component against UI system standards")}
  $ xala check src/components/Button.tsx --verbose

  ${chalk.gray("# Integrate with Xaheen full-stack project")}
  $ xala xaheen init --theme enterprise --compliance gdpr,wcag-aaa

  ${chalk.gray("# Initialize design system in new project")}
  $ xala init saas-dashboard --template enterprise --platform react

  ${chalk.gray("# Generate component from natural language")}
  $ xala ai generate "user management dashboard with data table and filters"

  ${chalk.gray("# Create custom theme")}
  $ xala themes create healthcare --brand "Medical Corp" --colors primary=#0891b2

  ${chalk.gray("# Build for multiple platforms")}
  $ xala build all --optimize

  ${chalk.gray("# Start development server with hot-reload")}
  $ xala dev --port 3001 --platform react

  ${chalk.gray("# Analyze performance and accessibility")}
  $ xala analyze --performance --accessibility --compliance

${chalk.bold("Command Categories:")}
  ${chalk.cyan("Setup:")}       install, migrate, check
  ${chalk.cyan("Integration:")} xaheen init|sync
  ${chalk.cyan("Project:")}     init, create
  ${chalk.cyan("Tokens:")}      tokens generate|validate|sync
  ${chalk.cyan("Themes:")}      themes create|apply|customize
  ${chalk.cyan("Components:")}  components scaffold|update|validate
  ${chalk.cyan("AI:")}          ai generate|suggest|validate
  ${chalk.cyan("Build:")}       build, deploy, sync
  ${chalk.cyan("Dev Tools:")}   dev, preview, analyze
  ${chalk.cyan("Help:")}        docs, examples, help

${chalk.bold("Documentation:")}
  ${chalk.cyan("https://github.com/xala-technologies/ui-system/docs")}
`,
);

// Register all commands
registerCommands(program);

// Add command middleware for logging and analytics
program.hook("preAction", (_, actionCommand) => {
	const commandPath: string[] = [];
	let cmd: Command | null = actionCommand;

	while (cmd) {
		commandPath.unshift(cmd.name());
		cmd = cmd.parent as Command | null;
	}

	logger.debug(`Executing command: ${commandPath.join(" ")}`);
});

program.hook("postAction", () => {
	logger.debug("Command completed successfully");
});

// Main execution function
export async function run(): Promise<void> {
	try {
		// Check for updates (non-blocking)
		checkForUpdates(version).catch(() => {
			// Silently ignore update check failures
		});

		// Display banner for help command or no arguments
		if (
			process.stdout.isTTY &&
			!process.argv.includes("--no-banner") &&
			(process.argv.includes("--help") ||
				process.argv.includes("-h") ||
				process.argv.length === 2)
		) {
			await displayBanner();
		}

		await registerCommands(program);
		await program.parseAsync(process.argv);

		// Show help if no command provided
		if (!process.argv.slice(2).length) {
			program.help();
		}
	} catch (error) {
		handleError(error, getExitCode(error));
	}
}

// Parse and execute if running as main module
if (import.meta.url.startsWith("file:")) {
	run();
}
