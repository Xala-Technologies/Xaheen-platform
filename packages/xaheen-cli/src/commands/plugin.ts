/**
 * Plugin Management Command
 * Manage community generators, templates, and extensions
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import inquirer from "inquirer";
import {
	createPluginManager,
	PluginSearchFilters,
} from "../services/plugins/plugin-manager.js";
import { logger } from "../utils/logger";
import { validateProject } from "../utils/project-validator";

/**
 * Plugin command options interface
 */
interface PluginOptions {
	readonly global?: boolean;
	readonly force?: boolean;
	readonly dryRun?: boolean;
	readonly verbose?: boolean;
}

/**
 * Create plugin command with subcommands
 */
export function createPluginCommand(): Command {
	const command = new Command("plugin");

	command
		.description("Manage community generators and plugins")
		.option("-g, --global", "Install plugin globally")
		.option("-f, --force", "Force operation without confirmation")
		.option("--dry-run", "Show what would be done without executing")
		.option("-v, --verbose", "Verbose output");

	// Search subcommand
	command
		.command("search [query]")
		.description("Search for plugins in the registry")
		.option(
			"-c, --category <category>",
			"Filter by category (generator, template, integration, tool, theme)",
		)
		.option("-a, --author <author>", "Filter by author")
		.option("--certified", "Show only certified plugins")
		.option("--min-rating <rating>", "Minimum rating (0-5)", "0")
		.option(
			"--sort <field>",
			"Sort by field (downloads, rating, updated, name)",
			"downloads",
		)
		.option("--order <order>", "Sort order (asc, desc)", "desc")
		.option("--limit <number>", "Limit results", "20")
		.action(async (query, options) => {
			await handleSearchCommand(query, options);
		});

	// Install subcommand
	command
		.command("install <plugin>")
		.description("Install a plugin from the registry")
		.option("--version <version>", "Specific version to install")
		.action(async (plugin, options) => {
			await handleInstallCommand(plugin, options);
		});

	// Uninstall subcommand
	command
		.command("uninstall <plugin>")
		.description("Uninstall a plugin")
		.action(async (plugin, options) => {
			await handleUninstallCommand(plugin, options);
		});

	// List subcommand
	command
		.command("list")
		.description("List installed plugins")
		.option("--detailed", "Show detailed information")
		.action(async (options) => {
			await handleListCommand(options);
		});

	// Update subcommand
	command
		.command("update [plugin]")
		.description("Update plugins (all if no plugin specified)")
		.action(async (plugin, options) => {
			await handleUpdateCommand(plugin, options);
		});

	// Info subcommand
	command
		.command("info <plugin>")
		.description("Show detailed information about a plugin")
		.action(async (plugin, options) => {
			await handleInfoCommand(plugin, options);
		});

	// Validate subcommand
	command
		.command("validate [plugin]")
		.description("Validate plugins (all if no plugin specified)")
		.action(async (plugin, options) => {
			await handleValidateCommand(plugin, options);
		});

	return command;
}

/**
 * Handle search command
 */
async function handleSearchCommand(query: string, options: any): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		const filters: PluginSearchFilters = {
			keyword: query,
			category: options.category,
			author: options.author,
			certified: options.certified,
			minRating: parseFloat(options.minRating),
			sortBy: options.sort,
			sortOrder: options.order,
			limit: parseInt(options.limit),
		};

		logger.info("Searching plugin registry...");
		const results = await pluginManager.searchPlugins(filters);

		if (results.length === 0) {
			logger.info("No plugins found matching your criteria.");
			return;
		}

		console.log(chalk.cyan(`\nFound ${results.length} plugins:\n`));

		// Create table for results
		const table = new Table({
			head: [
				"Name",
				"Version",
				"Category",
				"Author",
				"Rating",
				"Downloads",
				"Certified",
			],
			colWidths: [30, 10, 12, 20, 8, 12, 10],
		});

		for (const result of results) {
			const { metadata } = result;
			table.push([
				metadata.name,
				metadata.version,
				metadata.category,
				metadata.author,
				`${metadata.rating.toFixed(1)}/5`,
				metadata.downloads.toLocaleString(),
				metadata.certified ? chalk.green("✓") : chalk.gray("✗"),
			]);
		}

		console.log(table.toString());

		// Show detailed info for top results
		if (results.length > 0) {
			console.log(chalk.cyan("\nTop results:"));

			for (const result of results.slice(0, 3)) {
				const { metadata } = result;
				console.log(chalk.blue(`\n${metadata.name}@${metadata.version}`));
				console.log(chalk.gray(`  ${metadata.description}`));
				console.log(chalk.gray(`  Keywords: ${metadata.keywords.join(", ")}`));

				if (metadata.repository) {
					console.log(chalk.gray(`  Repository: ${metadata.repository}`));
				}

				if (result.featured) {
					console.log(chalk.yellow("  ⭐ Featured plugin"));
				}
			}
		}

		// Interactive installation prompt
		if (results.length > 0) {
			const { shouldInstall } = await inquirer.prompt([
				{
					type: "confirm",
					name: "shouldInstall",
					message: "Would you like to install any of these plugins?",
					default: false,
				},
			]);

			if (shouldInstall) {
				const { selectedPlugin } = await inquirer.prompt([
					{
						type: "list",
						name: "selectedPlugin",
						message: "Select a plugin to install:",
						choices: results.map((r) => ({
							name: `${r.metadata.name} - ${r.metadata.description}`,
							value: r.metadata.name,
						})),
					},
				]);

				await handleInstallCommand(selectedPlugin, {});
			}
		}
	} catch (error) {
		logger.error("Search failed:", error);
		process.exit(1);
	}
}

/**
 * Handle install command
 */
async function handleInstallCommand(
	pluginName: string,
	options: any,
): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		logger.info(
			`Installing plugin: ${pluginName}${options.version ? `@${options.version}` : ""}...`,
		);

		const result = await pluginManager.installPlugin(
			pluginName,
			options.version,
		);

		if (result.success) {
			console.log(
				chalk.green(
					`✓ Successfully installed ${pluginName}@${result.plugin.version}`,
				),
			);
			console.log(chalk.gray(`  Installed to: ${result.installedPath}`));

			if (result.warnings.length > 0) {
				console.log(chalk.yellow("\nWarnings:"));
				result.warnings.forEach((warning) =>
					console.log(chalk.yellow(`  - ${warning}`)),
				);
			}

			// Show usage information
			console.log(chalk.cyan("\nUsage:"));
			console.log(
				chalk.cyan(`  xaheen generate --help  # See available generators`),
			);

			if (result.plugin.category === "generator") {
				console.log(
					chalk.cyan(
						`  xaheen generate ${pluginName.replace("xaheen-", "").replace("-generator", "")} <name>`,
					),
				);
			}
		} else {
			console.log(chalk.red(`✗ Failed to install ${pluginName}`));

			if (result.errors.length > 0) {
				console.log(chalk.red("\nErrors:"));
				result.errors.forEach((error) =>
					console.log(chalk.red(`  - ${error}`)),
				);
			}

			process.exit(1);
		}
	} catch (error) {
		logger.error("Installation failed:", error);
		process.exit(1);
	}
}

/**
 * Handle uninstall command
 */
async function handleUninstallCommand(
	pluginName: string,
	options: any,
): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		const plugin = pluginManager.getPlugin(pluginName);
		if (!plugin) {
			logger.error(`Plugin ${pluginName} is not installed`);
			process.exit(1);
		}

		// Confirmation prompt
		const { confirmed } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirmed",
				message: `Are you sure you want to uninstall ${pluginName}@${plugin.version}?`,
				default: false,
			},
		]);

		if (!confirmed) {
			logger.info("Uninstallation cancelled");
			return;
		}

		logger.info(`Uninstalling plugin: ${pluginName}...`);

		const success = await pluginManager.uninstallPlugin(pluginName);

		if (success) {
			console.log(chalk.green(`✓ Successfully uninstalled ${pluginName}`));
		} else {
			console.log(chalk.red(`✗ Failed to uninstall ${pluginName}`));
			process.exit(1);
		}
	} catch (error) {
		logger.error("Uninstallation failed:", error);
		process.exit(1);
	}
}

/**
 * Handle list command
 */
async function handleListCommand(options: any): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		const plugins = pluginManager.getInstalledPlugins();

		if (plugins.length === 0) {
			logger.info("No plugins installed");
			return;
		}

		console.log(chalk.cyan(`\nInstalled plugins (${plugins.length}):\n`));

		if (options.detailed) {
			// Detailed view
			for (const plugin of plugins) {
				console.log(chalk.blue(`${plugin.name}@${plugin.version}`));
				console.log(chalk.gray(`  Description: ${plugin.description}`));
				console.log(chalk.gray(`  Author: ${plugin.author}`));
				console.log(chalk.gray(`  Category: ${plugin.category}`));
				console.log(chalk.gray(`  License: ${plugin.license}`));
				console.log(chalk.gray(`  Keywords: ${plugin.keywords.join(", ")}`));

				if (plugin.certified) {
					console.log(chalk.green("  ✓ Certified"));
				}

				console.log("");
			}
		} else {
			// Table view
			const table = new Table({
				head: ["Name", "Version", "Category", "Author", "Certified"],
				colWidths: [30, 10, 12, 20, 10],
			});

			for (const plugin of plugins) {
				table.push([
					plugin.name,
					plugin.version,
					plugin.category,
					plugin.author,
					plugin.certified ? chalk.green("✓") : chalk.gray("✗"),
				]);
			}

			console.log(table.toString());
		}
	} catch (error) {
		logger.error("Failed to list plugins:", error);
		process.exit(1);
	}
}

/**
 * Handle update command
 */
async function handleUpdateCommand(
	pluginName: string | undefined,
	options: any,
): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		if (pluginName) {
			// Update specific plugin
			logger.info(`Updating plugin: ${pluginName}...`);

			const success = await pluginManager.updatePlugin(pluginName);

			if (success) {
				console.log(chalk.green(`✓ Successfully updated ${pluginName}`));
			} else {
				console.log(chalk.red(`✗ Failed to update ${pluginName}`));
				process.exit(1);
			}
		} else {
			// Update all plugins
			const plugins = pluginManager.getInstalledPlugins();

			if (plugins.length === 0) {
				logger.info("No plugins installed");
				return;
			}

			logger.info(`Updating ${plugins.length} plugins...`);

			await pluginManager.updateAllPlugins();

			console.log(chalk.green("✓ All plugins updated"));
		}
	} catch (error) {
		logger.error("Update failed:", error);
		process.exit(1);
	}
}

/**
 * Handle info command
 */
async function handleInfoCommand(
	pluginName: string,
	options: any,
): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		// Check if plugin is installed
		const installedPlugin = pluginManager.getPlugin(pluginName);

		if (installedPlugin) {
			console.log(chalk.cyan(`\nInstalled Plugin Information:\n`));
			console.log(chalk.blue(`Name: ${installedPlugin.name}`));
			console.log(chalk.blue(`Version: ${installedPlugin.version}`));
			console.log(chalk.blue(`Description: ${installedPlugin.description}`));
			console.log(chalk.blue(`Author: ${installedPlugin.author}`));
			console.log(chalk.blue(`Category: ${installedPlugin.category}`));
			console.log(chalk.blue(`License: ${installedPlugin.license}`));
			console.log(
				chalk.blue(`Keywords: ${installedPlugin.keywords.join(", ")}`),
			);
			console.log(
				chalk.blue(`Certified: ${installedPlugin.certified ? "Yes" : "No"}`),
			);
			console.log(chalk.blue(`Last Updated: ${installedPlugin.lastUpdated}`));

			if (installedPlugin.repository) {
				console.log(chalk.blue(`Repository: ${installedPlugin.repository}`));
			}

			if (installedPlugin.homepage) {
				console.log(chalk.blue(`Homepage: ${installedPlugin.homepage}`));
			}

			return;
		}

		// Search in registry
		logger.info(`Searching for plugin: ${pluginName}...`);

		const results = await pluginManager.searchPlugins({ keyword: pluginName });
		const plugin = results.find((p) => p.metadata.name === pluginName);

		if (!plugin) {
			logger.error(`Plugin ${pluginName} not found`);
			process.exit(1);
		}

		const { metadata } = plugin;

		console.log(chalk.cyan(`\nPlugin Information:\n`));
		console.log(chalk.blue(`Name: ${metadata.name}`));
		console.log(chalk.blue(`Version: ${metadata.version}`));
		console.log(chalk.blue(`Description: ${metadata.description}`));
		console.log(chalk.blue(`Author: ${metadata.author}`));
		console.log(chalk.blue(`Category: ${metadata.category}`));
		console.log(chalk.blue(`License: ${metadata.license}`));
		console.log(chalk.blue(`Keywords: ${metadata.keywords.join(", ")}`));
		console.log(chalk.blue(`Rating: ${metadata.rating.toFixed(1)}/5`));
		console.log(
			chalk.blue(`Downloads: ${metadata.downloads.toLocaleString()}`),
		);
		console.log(chalk.blue(`Certified: ${metadata.certified ? "Yes" : "No"}`));
		console.log(chalk.blue(`Last Updated: ${metadata.lastUpdated}`));

		if (metadata.repository) {
			console.log(chalk.blue(`Repository: ${metadata.repository}`));
		}

		if (metadata.homepage) {
			console.log(chalk.blue(`Homepage: ${metadata.homepage}`));
		}

		if (plugin.featured) {
			console.log(chalk.yellow("\n⭐ Featured plugin"));
		}

		// Installation prompt
		const { shouldInstall } = await inquirer.prompt([
			{
				type: "confirm",
				name: "shouldInstall",
				message: `Would you like to install ${pluginName}?`,
				default: false,
			},
		]);

		if (shouldInstall) {
			await handleInstallCommand(pluginName, {});
		}
	} catch (error) {
		logger.error("Failed to get plugin info:", error);
		process.exit(1);
	}
}

/**
 * Handle validate command
 */
async function handleValidateCommand(
	pluginName: string | undefined,
	options: any,
): Promise<void> {
	try {
		const projectPath = process.cwd();
		const pluginManager = createPluginManager(projectPath);

		await pluginManager.initialize();

		if (pluginName) {
			// Validate specific plugin
			logger.info(`Validating plugin: ${pluginName}...`);

			const isValid = await pluginManager.validatePlugin(pluginName);

			if (isValid) {
				console.log(chalk.green(`✓ Plugin ${pluginName} is valid`));
			} else {
				console.log(chalk.red(`✗ Plugin ${pluginName} validation failed`));
				process.exit(1);
			}
		} else {
			// Validate all plugins
			const plugins = pluginManager.getInstalledPlugins();

			if (plugins.length === 0) {
				logger.info("No plugins installed");
				return;
			}

			logger.info(`Validating ${plugins.length} plugins...`);

			let validCount = 0;
			let invalidCount = 0;

			for (const plugin of plugins) {
				const isValid = await pluginManager.validatePlugin(plugin.name);

				if (isValid) {
					console.log(chalk.green(`✓ ${plugin.name}`));
					validCount++;
				} else {
					console.log(chalk.red(`✗ ${plugin.name}`));
					invalidCount++;
				}
			}

			console.log(chalk.cyan(`\nValidation complete:`));
			console.log(chalk.green(`  Valid: ${validCount}`));
			console.log(chalk.red(`  Invalid: ${invalidCount}`));
		}
	} catch (error) {
		logger.error("Validation failed:", error);
		process.exit(1);
	}
}

/**
 * Default export
 */
export default createPluginCommand;
