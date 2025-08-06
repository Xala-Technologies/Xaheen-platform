#!/usr/bin/env node

import chalk from "chalk";
import { performance } from "perf_hooks";
import { CommandParser } from "./core/command-parser/index";
import { ConfigManager } from "./core/config-manager/index";
import { StackAdapterRegistry } from "./core/stack-adapters/index";
import { CLIError } from "./types/index";
import { cliLogger, logger } from "./utils/logger";
import { LicenseManager, CLILicenseIntegration, CLI_LICENSE_CONFIG } from "./licensing/index";
import { CommandHandlerFactory } from "./core/command-parser/factories/CommandHandlerFactory";
import { RouteRegistry } from "./core/command-parser/registry/RouteRegistry";
import { LicenseCommandHandler } from "./core/command-parser/handlers/LicenseCommandHandler";
import { LicenseRouteRegistrar } from "./core/command-parser/registrars/LicenseRouteRegistrar";
import { RegistryCommandHandler } from "./core/command-parser/handlers/RegistryCommandHandler";
import { RegistryRouteRegistrar } from "./core/command-parser/registrars/RegistryRouteRegistrar";

async function main(): Promise<void> {
	const startTime = performance.now();

	try {
		// Display banner
		displayBanner();

		// Initialize core systems
		logger.debug("Initializing Xaheen CLI...");

		// Initialize licensing system
		const licenseManager = new LicenseManager(CLI_LICENSE_CONFIG);
		const licenseIntegration = new CLILicenseIntegration(licenseManager);
		await licenseIntegration.initialize();

		// Display license status (only if not running a command that doesn't need it)
		const command = process.argv[2];
		if (!command || !['--help', '-h', 'help', '--version', '-v'].includes(command)) {
			await licenseIntegration.displayLicenseStatus();
		}

		// Initialize configuration manager
		const configManager = new ConfigManager();

		// Initialize stack adapter registry
		const stackRegistry = StackAdapterRegistry.getInstance();
		const detectedStack = await stackRegistry.detectStack();
		logger.debug(`Detected stack: ${detectedStack}`);

		// Initialize route registry
		const routeRegistry = new RouteRegistry();

		// Initialize command handler factory
		const handlerFactory = new CommandHandlerFactory();
		
		// Register domain handlers
		handlerFactory.registerHandler('license', LicenseCommandHandler);
		handlerFactory.registerHandler('registry', RegistryCommandHandler);

		// Initialize and register route registrars
		const licenseRegistrar = new LicenseRouteRegistrar();
		const licenseRoutes = licenseRegistrar.getRoutes();
		routeRegistry.registerRoutes(licenseRoutes);

		const registryRegistrar = new RegistryRouteRegistrar();
		const registryRoutes = registryRegistrar.getRoutes();
		routeRegistry.registerRoutes(registryRoutes);

		// Initialize command parser (legacy system)
		const commandParser = new CommandParser();

		// Make core systems available globally for domain handlers
		global.__xaheen_cli = {
			configManager,
			commandParser,
			stackRegistry,
			licenseManager,
			licenseIntegration,
			handlerFactory,
			routeRegistry,
		};

		// Parse and execute command
		await commandParser.parse(process.argv);

		const endTime = performance.now();
		const duration = Math.round(endTime - startTime);

		logger.debug(`Command completed in ${duration}ms`);
	} catch (error) {
		const endTime = performance.now();
		const duration = Math.round(endTime - startTime);

		if (error instanceof CLIError) {
			cliLogger.error(`${error.message} (${duration}ms)`);
			if (error.code === "COMMAND_NOT_FOUND") {
				cliLogger.info("Run `xaheen --help` to see available commands");
			}
			process.exit(1);
		} else if (error instanceof Error) {
			cliLogger.error(`Unexpected error: ${error.message} (${duration}ms)`);
			logger.debug("Stack trace:", error.stack);
			process.exit(1);
		} else {
			cliLogger.error(`Unknown error occurred (${duration}ms)`);
			process.exit(1);
		}
	}
}

function displayBanner(): void {
	if (process.env.XAHEEN_NO_BANNER === "true") return;

	const version = "3.0.0";
	const banner = `
${chalk.cyan("╭─────────────────────────────────────────────────────────────╮")}
${chalk.cyan("│")}  ${chalk.bold.white("Xaheen CLI")} ${chalk.gray(`v${version}`)}                                     ${chalk.cyan("│")}
${chalk.cyan("│")}  ${chalk.gray("Service-based architecture + AI-powered components")}     ${chalk.cyan("│")}
${chalk.cyan("│")}                                                             ${chalk.cyan("│")}
${chalk.cyan("│")}  ${chalk.green("✓")} Laravel Artisan-inspired commands                        ${chalk.cyan("│")}
${chalk.cyan("│")}  ${chalk.green("✓")} AI-powered component generation                       ${chalk.cyan("│")}
${chalk.cyan("│")}  ${chalk.green("✓")} Multi-platform support (web, mobile, desktop)        ${chalk.cyan("│")}
${chalk.cyan("│")}  ${chalk.green("✓")} Monorepo-ready with apps & packages                  ${chalk.cyan("│")}
${chalk.cyan("│")}  ${chalk.green("✓")} Norwegian compliance & WCAG AAA accessibility        ${chalk.cyan("│")}
${chalk.cyan("╰─────────────────────────────────────────────────────────────╯")}
`;

	console.log(banner);
}

// Global CLI context interface
declare global {
	var __xaheen_cli: {
		configManager: ConfigManager;
		commandParser: CommandParser;
		stackRegistry: StackAdapterRegistry;
		licenseManager: LicenseManager;
		licenseIntegration: CLILicenseIntegration;
		handlerFactory: CommandHandlerFactory;
		routeRegistry: RouteRegistry;
	};
}

// Handle graceful shutdown
process.on("SIGINT", () => {
	cliLogger.info("CLI interrupted by user");
	process.exit(0);
});

process.on("SIGTERM", () => {
	cliLogger.info("CLI terminated");
	process.exit(0);
});

// Start the CLI
main().catch((error) => {
	cliLogger.error("Failed to start CLI:", error);
	process.exit(1);
});
