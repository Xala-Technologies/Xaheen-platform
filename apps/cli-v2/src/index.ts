/**
 * Xaheen CLI v2 - Enterprise Development Platform
 *
 * Next-generation CLI with service-based architecture,
 * intelligent bundling, and AI-powered scaffolding.
 *
 * @author Xala Technologies
 * @since 2025-01-03
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { Command } from "commander";
import { consola } from "consola";
import { addCommand } from "./commands/add.js";
import { bundleCommand } from "./commands/bundle.js";
// Commands
import { createCommand } from "./commands/create.js";
import { doctorCommand } from "./commands/doctor.js";
import { removeCommand } from "./commands/remove.js";
import { upgradeCommand } from "./commands/upgrade.js";
import { validateCommand } from "./commands/validate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json for version
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

// Create main program
const program = new Command();

program
	.name("xaheen")
	.description(chalk.cyan("Xaheen CLI - Enterprise Development Platform"))
	.version(packageJson.version, "-v, --version", "Display version number")
	.option("--debug", "Enable debug mode")
	.option("--no-telemetry", "Disable anonymous telemetry")
	.option("--config <path>", "Path to configuration file")
	.hook("preAction", (thisCommand) => {
		const options = thisCommand.opts();
		if (options.debug) {
			consola.level = 4; // Debug level
			consola.debug("Debug mode enabled");
		}
	});

// Add commands
program.addCommand(createCommand);
program.addCommand(addCommand);
program.addCommand(removeCommand);
program.addCommand(validateCommand);
program.addCommand(bundleCommand);
program.addCommand(upgradeCommand);
program.addCommand(doctorCommand);

// Handle unknown commands
program.on("command:*", () => {
	consola.error(`Invalid command: ${program.args.join(" ")}`);
	consola.info('Run "xaheen --help" for a list of available commands.');
	process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
	program.outputHelp();
}

// Parse arguments
program.parse(process.argv);

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
	consola.error("Unhandled error:", error);
	process.exit(1);
});
