/**
 * Community Command
 * Comprehensive community and ecosystem features command
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import chalk from "chalk";
import Table from "cli-table3";
import { Command } from "commander";
import inquirer from "inquirer";
import { createCommunityHubService } from "../services/community/community-hub.service";
import { logger } from "../utils/logger";

/**
 * Community command options interface
 */
interface CommunityOptions {
	readonly interactive?: boolean;
	readonly verbose?: boolean;
	readonly json?: boolean;
}

/**
 * Create community command with comprehensive subcommands
 */
export function createCommunityCommand(): Command {
	const command = new Command("community");

	command
		.description("Access community features, plugins, templates, and tutorials")
		.option("-i, --interactive", "Launch interactive community explorer")
		.option("-v, --verbose", "Verbose output")
		.option("--json", "Output in JSON format")
		.action(async (options) => {
			if (options.interactive) {
				await handleInteractiveMode();
			} else {
				await handleCommunityOverview(options);
			}
		});

	// Dashboard subcommand
	command
		.command("dashboard")
		.description("Show community dashboard with statistics and trending content")
		.action(async () => {
			await handleDashboardCommand();
		});

	// Search subcommand
	command
		.command("search [query]")
		.description("Search across all community content")
		.option("-t, --type <type>", "Content type (plugins, templates, tutorials, help, all)", "all")
		.option("-c, --category <category>", "Filter by category")
		.option("--difficulty <level>", "Filter by difficulty (beginner, intermediate, advanced)")
		.option("--featured", "Show only featured content")
		.option("--trending", "Show only trending content")
		.option("--limit <number>", "Limit results", "20")
		.action(async (query, options) => {
			await handleSearchCommand(query, options);
		});

	// Plugins subcommand group
	const pluginsCommand = command
		.command("plugins")
		.description("Plugin marketplace and development tools");

	pluginsCommand
		.command("search [query]")
		.description("Search for plugins in the marketplace")
		.option("-c, --category <category>", "Filter by category")
		.option("-a, --author <author>", "Filter by author")
		.option("--certified", "Show only certified plugins")
		.action(async (query, options) => {
			await handlePluginSearchCommand(query, options);
		});

	pluginsCommand
		.command("create <name>")
		.description("Create a new plugin using the development toolkit")
		.option("-t, --type <type>", "Plugin type (generator, template, integration, tool, theme)")
		.option("--typescript", "Use TypeScript")
		.option("--testing", "Include testing setup")
		.action(async (name, options) => {
			await handlePluginCreateCommand(name, options);
		});

	pluginsCommand
		.command("test <plugin-path>")
		.description("Run comprehensive tests on a plugin")
		.option("--security", "Include security tests")
		.option("--performance", "Include performance tests")
		.option("--compatibility", "Include compatibility tests")
		.action(async (pluginPath, options) => {
			await handlePluginTestCommand(pluginPath, options);
		});

	// Templates subcommand group
	const templatesCommand = command
		.command("templates")
		.description("Template sharing platform");

	templatesCommand
		.command("search [query]")
		.description("Search for templates in the community")
		.option("-c, --category <category>", "Filter by category")
		.option("-f, --framework <framework>", "Filter by framework")
		.option("--complexity <level>", "Filter by complexity")
		.action(async (query, options) => {
			await handleTemplateSearchCommand(query, options);
		});

	templatesCommand
		.command("share <template-path>")
		.description("Share a template with the community")
		.option("-n, --name <name>", "Template name")
		.option("-d, --description <description>", "Template description")
		.option("-c, --category <category>", "Template category")
		.action(async (templatePath, options) => {
			await handleTemplateShareCommand(templatePath, options);
		});

	templatesCommand
		.command("collections")
		.description("Browse featured template collections")
		.action(async () => {
			await handleTemplateCollectionsCommand();
		});

	// Tutorials subcommand group
	const tutorialsCommand = command
		.command("tutorials")
		.description("Interactive tutorials and learning paths");

	tutorialsCommand
		.command("list")
		.description("List available tutorials")
		.option("-d, --difficulty <level>", "Filter by difficulty")
		.option("-c, --category <category>", "Filter by category")
		.action(async (options) => {
			await handleTutorialListCommand(options);
		});

	tutorialsCommand
		.command("start <tutorial-id>")
		.description("Start an interactive tutorial")
		.action(async (tutorialId) => {
			await handleTutorialStartCommand(tutorialId);
		});

	tutorialsCommand
		.command("progress")
		.description("Show your tutorial progress")
		.action(async () => {
			await handleTutorialProgressCommand();
		});

	// Help subcommand group
	const helpCommand = command
		.command("help-enhanced [command]")
		.description("Get enhanced help with examples and context")
		.option("-e, --examples", "Include interactive examples")
		.option("-f, --format <format>", "Output format (text, markdown, json)", "text")
		.action(async (commandName, options) => {
			await handleEnhancedHelpCommand(commandName, options);
		});

	// Profile subcommand
	command
		.command("profile [user-id]")
		.description("View user contributions and achievements")
		.action(async (userId) => {
			await handleProfileCommand(userId);
		});

	// Recommendations subcommand
	command
		.command("recommendations")
		.description("Get personalized content recommendations")
		.option("--interests <interests>", "Comma-separated interests")
		.option("--skill-level <level>", "Your skill level (beginner, intermediate, advanced)")
		.option("--time <minutes>", "Available time in minutes")
		.action(async (options) => {
			await handleRecommendationsCommand(options);
		});

	return command;
}

/**
 * Handle interactive community mode
 */
async function handleInteractiveMode(): Promise<void> {
	try {
		console.log(chalk.cyan.bold("\n🌟 Welcome to the Xaheen Community Hub! 🌟\n"));

		const { action } = await inquirer.prompt([
			{
				type: "list",
				name: "action",
				message: "What would you like to explore?",
				choices: [
					{ name: "🔍 Search Community Content", value: "search" },
					{ name: "📊 View Dashboard", value: "dashboard" },
					{ name: "🔌 Browse Plugins", value: "plugins" },
					{ name: "📋 Explore Templates", value: "templates" },
					{ name: "🎓 Start Learning", value: "tutorials" },
					{ name: "❓ Get Help", value: "help" },
					{ name: "👤 View Profile", value: "profile" },
					{ name: "🎯 Get Recommendations", value: "recommendations" },
				],
			},
		]);

		switch (action) {
			case "search":
				await handleInteractiveSearch();
				break;
			case "dashboard":
				await handleDashboardCommand();
				break;
			case "plugins":
				await handleInteractivePlugins();
				break;
			case "templates":
				await handleInteractiveTemplates();
				break;
			case "tutorials":
				await handleInteractiveTutorials();
				break;
			case "help":
				await handleInteractiveHelp();
				break;
			case "profile":
				await handleProfileCommand();
				break;
			case "recommendations":
				await handleRecommendationsCommand({});
				break;
		}

	} catch (error) {
		logger.error("Interactive mode failed:", error);
		console.log(chalk.red("Interactive mode failed. Please try again."));
	}
}

/**
 * Handle community overview
 */
async function handleCommunityOverview(options: CommunityOptions): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const dashboard = await communityHub.getCommunityDashboard();

		if (options.json) {
			console.log(JSON.stringify(dashboard, null, 2));
			return;
		}

		// Display overview
		console.log(chalk.cyan.bold("\n🌟 Xaheen Community Overview 🌟\n"));

		// Community stats
		console.log(chalk.yellow.bold("Community Statistics:"));
		console.log(`${chalk.green("👥")} Active Users: ${chalk.white.bold(dashboard.community.activeUsers.toLocaleString())}`);
		console.log(`${chalk.green("🤝")} Contributions: ${chalk.white.bold(dashboard.community.contributions.toLocaleString())}`);
		console.log(`${chalk.green("💬")} Discussions: ${chalk.white.bold(dashboard.community.discussions.toLocaleString())}\n`);

		// Content stats
		console.log(chalk.yellow.bold("Content Library:"));
		console.log(`${chalk.blue("🔌")} Plugins: ${chalk.white.bold(dashboard.plugins.total)} (${dashboard.plugins.featured} featured)`);
		console.log(`${chalk.blue("📋")} Templates: ${chalk.white.bold(dashboard.templates.total)} (${dashboard.templates.featured} featured)`);
		console.log(`${chalk.blue("🎓")} Tutorials: ${chalk.white.bold(dashboard.tutorials.total)} (${dashboard.tutorials.completions.toLocaleString()} completions)\n`);

		// Recent activity
		console.log(chalk.yellow.bold("Recent Activity:"));
		dashboard.community.recentActivity.forEach(activity => {
			const icon = activity.type === "plugin" ? "🔌" : activity.type === "template" ? "📋" : "🎓";
			const timeAgo = formatTimeAgo(activity.timestamp);
			console.log(`${icon} ${activity.title} ${chalk.gray(`by ${activity.author} • ${timeAgo}`)}`);
		});

		console.log(chalk.cyan("\n💡 Use 'xaheen community --interactive' for an interactive experience"));
		console.log(chalk.cyan("💡 Use 'xaheen community search <query>' to find specific content"));

	} catch (error) {
		logger.error("Community overview failed:", error);
		console.log(chalk.red("Failed to load community overview. Please try again."));
	}
}

/**
 * Handle dashboard command
 */
async function handleDashboardCommand(): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const dashboard = await communityHub.getCommunityDashboard();

		console.log(chalk.cyan.bold("\n📊 Community Dashboard 📊\n"));

		// Trending plugins
		if (dashboard.plugins.trending.length > 0) {
			console.log(chalk.yellow.bold("🔥 Trending Plugins:"));
			const pluginTable = new Table({
				head: ["Plugin", "Downloads", "Rating"],
				colWidths: [30, 15, 10],
			});

			dashboard.plugins.trending.forEach(plugin => {
				pluginTable.push([
					plugin.name,
					plugin.downloads.toLocaleString(),
					`${plugin.rating.toFixed(1)}/5 ⭐`,
				]);
			});

			console.log(pluginTable.toString() + "\n");
		}

		// Trending templates
		if (dashboard.templates.trending.length > 0) {
			console.log(chalk.yellow.bold("🔥 Trending Templates:"));
			const templateTable = new Table({
				head: ["Template", "Downloads", "Rating"],
				colWidths: [30, 15, 10],
			});

			dashboard.templates.trending.forEach(template => {
				templateTable.push([
					template.name,
					template.downloads.toLocaleString(),
					`${template.rating.toFixed(1)}/5 ⭐`,
				]);
			});

			console.log(templateTable.toString() + "\n");
		}

		// Popular tutorials
		if (dashboard.tutorials.popular.length > 0) {
			console.log(chalk.yellow.bold("📚 Popular Tutorials:"));
			const tutorialTable = new Table({
				head: ["Tutorial", "Completions", "Rating"],
				colWidths: [35, 15, 10],
			});

			dashboard.tutorials.popular.forEach(tutorial => {
				tutorialTable.push([
					tutorial.title,
					tutorial.completions.toLocaleString(),
					`${tutorial.rating.toFixed(1)}/5 ⭐`,
				]);
			});

			console.log(tutorialTable.toString());
		}

	} catch (error) {
		logger.error("Dashboard command failed:", error);
		console.log(chalk.red("Failed to load dashboard. Please try again."));
	}
}

/**
 * Handle search command
 */
async function handleSearchCommand(query: string, options: any): Promise<void> {
	try {
		if (!query) {
			const { searchQuery } = await inquirer.prompt([
				{
					type: "input",
					name: "searchQuery",
					message: "What are you looking for?",
					validate: (input) => input.trim().length > 0 || "Please enter a search query",
				},
			]);
			query = searchQuery;
		}

		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const searchResults = await communityHub.searchCommunity({
			query,
			type: options.type,
			category: options.category,
			difficulty: options.difficulty,
			featured: options.featured,
			trending: options.trending,
			limit: parseInt(options.limit),
		});

		console.log(chalk.cyan.bold(`\n🔍 Search Results for "${query}" (${searchResults.total} found)\n`));

		// Display results by type
		if (searchResults.plugins.length > 0) {
			console.log(chalk.yellow.bold("🔌 Plugins:"));
			searchResults.plugins.forEach((plugin: any) => {
				console.log(`  ${chalk.blue(plugin.metadata.name)} ${chalk.gray(`v${plugin.metadata.version}`)}`);
				console.log(`    ${plugin.metadata.description}`);
				console.log(`    ${chalk.green(`${plugin.metadata.downloads.toLocaleString()} downloads`)} • ${chalk.yellow(`${plugin.metadata.rating.toFixed(1)}/5 ⭐`)}`);
				console.log();
			});
		}

		if (searchResults.templates.length > 0) {
			console.log(chalk.yellow.bold("📋 Templates:"));
			searchResults.templates.forEach((template: any) => {
				console.log(`  ${chalk.blue(template.name)} ${chalk.gray(`v${template.version}`)}`);
				console.log(`    ${template.description}`);
				console.log(`    ${chalk.green(`${template.stats.downloads.toLocaleString()} downloads`)} • ${chalk.yellow(`${template.stats.rating.toFixed(1)}/5 ⭐`)}`);
				console.log();
			});
		}

		if (searchResults.tutorials.length > 0) {
			console.log(chalk.yellow.bold("🎓 Tutorials:"));
			searchResults.tutorials.forEach((tutorial: any) => {
				console.log(`  ${chalk.blue(tutorial.title)}`);
				console.log(`    ${tutorial.description}`);
				console.log(`    ${chalk.green(`${tutorial.estimatedDuration} min`)} • ${chalk.cyan(tutorial.difficulty)} • ${chalk.yellow(`${tutorial.stats.averageRating.toFixed(1)}/5 ⭐`)}`);
				console.log();
			});
		}

		if (searchResults.help.length > 0) {
			console.log(chalk.yellow.bold("❓ Help Topics:"));
			searchResults.help.forEach((help: any) => {
				console.log(`  ${chalk.blue(help.title)}`);
				console.log(`    ${help.description}`);
				console.log(`    ${chalk.cyan(help.type)} • ${chalk.green(help.category)}`);
				console.log();
			});
		}

		// Show suggestions if available
		if (searchResults.suggestions.length > 0) {
			console.log(chalk.gray.bold("💡 Related searches:"));
			console.log(chalk.gray(`  ${searchResults.suggestions.join(", ")}`));
		}

	} catch (error) {
		logger.error("Search command failed:", error);
		console.log(chalk.red("Search failed. Please try again."));
	}
}

/**
 * Handle plugin search command
 */
async function handlePluginSearchCommand(query: string, options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const plugins = await communityHub.plugins.searchPlugins({
			keyword: query,
			category: options.category,
			author: options.author,
			certified: options.certified,
		});

		console.log(chalk.cyan.bold(`\n🔌 Plugin Search Results (${plugins.length} found)\n`));

		if (plugins.length === 0) {
			console.log(chalk.yellow("No plugins found matching your criteria."));
			return;
		}

		const table = new Table({
			head: ["Name", "Version", "Category", "Author", "Downloads", "Rating"],
			colWidths: [25, 10, 15, 20, 12, 10],
		});

		plugins.forEach(plugin => {
			table.push([
				plugin.metadata.name,
				plugin.metadata.version,
				plugin.metadata.category,
				plugin.metadata.author,
				plugin.metadata.downloads.toLocaleString(),
				`${plugin.metadata.rating.toFixed(1)}/5`,
			]);
		});

		console.log(table.toString());

		// Interactive installation
		const { shouldInstall } = await inquirer.prompt([
			{
				type: "confirm",
				name: "shouldInstall",
				message: "Would you like to install any of these plugins?",
				default: false,
			},
		]);

		if (shouldInstall && plugins.length > 0) {
			const { selectedPlugin } = await inquirer.prompt([
				{
					type: "list",
					name: "selectedPlugin",
					message: "Select a plugin to install:",
					choices: plugins.map(p => ({
						name: `${p.metadata.name} - ${p.metadata.description}`,
						value: p.metadata.name,
					})),
				},
			]);

			console.log(chalk.green(`Installing ${selectedPlugin}...`));
			console.log(chalk.gray("Plugin installation would be handled by the plugin manager."));
		}

	} catch (error) {
		logger.error("Plugin search failed:", error);
		console.log(chalk.red("Plugin search failed. Please try again."));
	}
}

/**
 * Handle plugin create command
 */
async function handlePluginCreateCommand(name: string, options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		// Get plugin type if not provided
		let pluginType = options.type;
		if (!pluginType) {
			const { type } = await inquirer.prompt([
				{
					type: "list",
					name: "type",
					message: "What type of plugin would you like to create?",
					choices: [
						{ name: "Generator - Creates code and files", value: "generator" },
						{ name: "Template - Project scaffolding", value: "template" },
						{ name: "Integration - Third-party service integration", value: "integration" },
						{ name: "Tool - Utility and helper functions", value: "tool" },
						{ name: "Theme - CLI theme and styling", value: "theme" },
					],
				},
			]);
			pluginType = type;
		}

		console.log(chalk.cyan(`\n🔧 Creating ${pluginType} plugin: ${name}\n`));

		const config = {
			name,
			type: pluginType,
			description: `A ${pluginType} plugin for Xaheen CLI`,
			author: "Developer", // In practice, this would come from user config
			version: "1.0.0",
			license: "MIT",
			keywords: [pluginType, "xaheen", "cli"],
			xaheenVersion: "^3.0.0",
			features: {
				typescript: options.typescript !== false,
				testing: options.testing !== false,
				documentation: true,
				ci: true,
				publishing: true,
				examples: true,
			},
			dependencies: {},
			devDependencies: {},
		};

		const result = await communityHub.devToolkit.scaffoldPlugin(config);

		if (result.success) {
			console.log(chalk.green(`✅ Plugin created successfully at: ${result.pluginPath}`));
			console.log(chalk.cyan("\nNext steps:"));
			console.log(chalk.cyan("1. Navigate to the plugin directory"));
			console.log(chalk.cyan("2. Install dependencies: npm install"));
			console.log(chalk.cyan("3. Start development: npm run dev"));
			console.log(chalk.cyan("4. Run tests: npm test"));
			console.log(chalk.cyan("5. Build: npm run build"));
		} else {
			console.log(chalk.red("❌ Plugin creation failed:"));
			result.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
		}

	} catch (error) {
		logger.error("Plugin creation failed:", error);
		console.log(chalk.red("Plugin creation failed. Please try again."));
	}
}

/**
 * Handle plugin test command
 */
async function handlePluginTestCommand(pluginPath: string, options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const testSuites = ["unit", "integration"];
		if (options.security) testSuites.push("security");
		if (options.performance) testSuites.push("performance");
		if (options.compatibility) testSuites.push("compatibility");

		console.log(chalk.cyan(`\n🧪 Running tests for plugin at: ${pluginPath}\n`));

		const testConfig = {
			pluginPath,
			testSuites: testSuites as any[],
			timeout: 30000,
			coverage: true,
			verbose: true,
			parallel: false,
			environment: "node" as const,
		};

		const result = await communityHub.testing.runTestSuite(testConfig);

		if (result.success) {
			console.log(chalk.green("✅ All tests passed!"));
		} else {
			console.log(chalk.red("❌ Some tests failed"));
		}

		// Display test results
		result.results.forEach(testResult => {
			const icon = testResult.status === "passed" ? "✅" : testResult.status === "failed" ? "❌" : "⚠️";
			console.log(`${icon} ${testResult.testSuite}: ${testResult.summary.passed}/${testResult.summary.total} passed`);
			
			if (testResult.errors.length > 0) {
				testResult.errors.forEach(error => {
					console.log(chalk.red(`  Error: ${error}`));
				});
			}
		});

		console.log(chalk.cyan(`\n📊 Test report saved to: ${result.reportPath}`));

	} catch (error) {
		logger.error("Plugin testing failed:", error);
		console.log(chalk.red("Plugin testing failed. Please try again."));
	}
}

/**
 * Handle template search command
 */
async function handleTemplateSearchCommand(query: string, options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const searchResult = await communityHub.templates.searchTemplates({
			query,
			category: options.category as any,
			frameworks: options.framework ? [options.framework as any] : undefined,
			complexity: options.complexity as any,
		});

		console.log(chalk.cyan.bold(`\n📋 Template Search Results (${searchResult.total} found)\n`));

		if (searchResult.templates.length === 0) {
			console.log(chalk.yellow("No templates found matching your criteria."));
			return;
		}

		searchResult.templates.forEach(template => {
			console.log(chalk.blue.bold(template.name));
			console.log(`  ${template.description}`);
			console.log(`  ${chalk.green(template.category)} • ${chalk.cyan(template.complexity)} • ${chalk.gray(template.frameworks.join(", "))}`);
			console.log(`  ${chalk.yellow(`${template.stats.rating.toFixed(1)}/5 ⭐`)} • ${chalk.green(`${template.stats.downloads.toLocaleString()} downloads`)}`);
			if (template.flags.featured) console.log(`  ${chalk.yellow("⭐ Featured")}`);
			if (template.flags.trending) console.log(`  ${chalk.red("🔥 Trending")}`);
			console.log();
		});

	} catch (error) {
		logger.error("Template search failed:", error);
		console.log(chalk.red("Template search failed. Please try again."));
	}
}

/**
 * Handle template share command
 */
async function handleTemplateShareCommand(templatePath: string, options: any): Promise<void> {
	try {
		console.log(chalk.cyan(`\n📤 Sharing template from: ${templatePath}\n`));

		// Get template information
		let name = options.name;
		let description = options.description;
		let category = options.category;

		if (!name) {
			const { templateName } = await inquirer.prompt([
				{
					type: "input",
					name: "templateName",
					message: "Template name:",
					validate: (input) => input.trim().length >= 3 || "Name must be at least 3 characters",
				},
			]);
			name = templateName;
		}

		if (!description) {
			const { templateDescription } = await inquirer.prompt([
				{
					type: "input",
					name: "templateDescription",
					message: "Template description:",
					validate: (input) => input.trim().length >= 10 || "Description must be at least 10 characters",
				},
			]);
			description = templateDescription;
		}

		if (!category) {
			const { templateCategory } = await inquirer.prompt([
				{
					type: "list",
					name: "templateCategory",
					message: "Template category:",
					choices: [
						"web-app",
						"mobile-app",
						"desktop-app",
						"api",
						"microservice",
						"component",
						"layout",
						"boilerplate",
						"starter",
						"enterprise",
					],
				},
			]);
			category = templateCategory;
		}

		const { frameworks, complexity, tags } = await inquirer.prompt([
			{
				type: "checkbox",
				name: "frameworks",
				message: "Select frameworks:",
				choices: ["react", "nextjs", "vue", "angular", "svelte", "nodejs", "express"],
				validate: (input) => input.length > 0 || "Please select at least one framework",
			},
			{
				type: "list",
				name: "complexity",
				message: "Complexity level:",
				choices: ["beginner", "intermediate", "advanced", "expert"],
			},
			{
				type: "input",
				name: "tags",
				message: "Tags (comma-separated):",
				filter: (input) => input.split(",").map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0),
			},
		]);

		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const submission = {
			name,
			description,
			category,
			complexity,
			frameworks,
			tags,
			keywords: tags.slice(0, 5),
			license: "MIT",
			templatePath,
			features: [],
		};

		const result = await communityHub.templates.submitTemplate(submission, "current-user");

		if (result.success) {
			console.log(chalk.green(`✅ Template shared successfully! ID: ${result.templateId}`));
			if (result.warnings.length > 0) {
				console.log(chalk.yellow("\nSuggestions:"));
				result.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
			}
		} else {
			console.log(chalk.red("❌ Template sharing failed:"));
			result.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
		}

	} catch (error) {
		logger.error("Template sharing failed:", error);
		console.log(chalk.red("Template sharing failed. Please try again."));
	}
}

/**
 * Handle template collections command
 */
async function handleTemplateCollectionsCommand(): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const collections = await communityHub.templates.getFeaturedCollections();

		console.log(chalk.cyan.bold("\n📚 Featured Template Collections\n"));

		if (collections.length === 0) {
			console.log(chalk.yellow("No featured collections available."));
			return;
		}

		collections.forEach(collection => {
			console.log(chalk.blue.bold(collection.name));
			console.log(`  ${collection.description}`);
			console.log(`  ${chalk.green(`${collection.templates.length} templates`)} • ${chalk.cyan(`${collection.stats.followers} followers`)}`);
			console.log(`  By ${chalk.gray(collection.author.displayName)}`);
			console.log();
		});

	} catch (error) {
		logger.error("Template collections command failed:", error);
		console.log(chalk.red("Failed to load template collections. Please try again."));
	}
}

/**
 * Handle tutorial list command
 */
async function handleTutorialListCommand(options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const tutorials = await communityHub.tutorials.getTutorials({
			difficulty: options.difficulty as any,
			category: options.category,
		});

		console.log(chalk.cyan.bold(`\n🎓 Available Tutorials (${tutorials.length})\n`));

		if (tutorials.length === 0) {
			console.log(chalk.yellow("No tutorials found matching your criteria."));
			return;
		}

		const table = new Table({
			head: ["Title", "Difficulty", "Duration", "Completions", "Rating"],
			colWidths: [35, 12, 10, 12, 10],
		});

		tutorials.forEach(tutorial => {
			table.push([
				tutorial.title,
				tutorial.difficulty,
				`${tutorial.estimatedDuration}m`,
				tutorial.stats.completions.toLocaleString(),
				`${tutorial.stats.averageRating.toFixed(1)}/5`,
			]);
		});

		console.log(table.toString());

		// Interactive tutorial start
		const { shouldStart } = await inquirer.prompt([
			{
				type: "confirm",
				name: "shouldStart",
				message: "Would you like to start a tutorial?",
				default: false,
			},
		]);

		if (shouldStart && tutorials.length > 0) {
			const { selectedTutorial } = await inquirer.prompt([
				{
					type: "list",
					name: "selectedTutorial",
					message: "Select a tutorial to start:",
					choices: tutorials.map(t => ({
						name: `${t.title} (${t.difficulty}, ${t.estimatedDuration}m)`,
						value: t.id,
					})),
				},
			]);

			await handleTutorialStartCommand(selectedTutorial);
		}

	} catch (error) {
		logger.error("Tutorial list command failed:", error);
		console.log(chalk.red("Failed to load tutorials. Please try again."));
	}
}

/**
 * Handle tutorial start command
 */
async function handleTutorialStartCommand(tutorialId: string): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		console.log(chalk.cyan(`\n🚀 Starting tutorial: ${tutorialId}\n`));

		const result = await communityHub.tutorials.startTutorial(tutorialId);

		if (result.success && result.session) {
			console.log(chalk.green(`✅ Tutorial session started: ${result.sessionId}`));
			console.log(chalk.cyan(`📁 Workspace: ${result.session.workspacePath}`));
			console.log(chalk.yellow("\n💡 Use 'xaheen community tutorials progress' to check your progress"));
			console.log(chalk.yellow("💡 Follow the interactive prompts to complete each step"));
		} else {
			console.log(chalk.red("❌ Failed to start tutorial:"));
			result.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
		}

	} catch (error) {
		logger.error("Tutorial start failed:", error);
		console.log(chalk.red("Failed to start tutorial. Please try again."));
	}
}

/**
 * Handle tutorial progress command
 */
async function handleTutorialProgressCommand(): Promise<void> {
	try {
		console.log(chalk.cyan.bold("\n📈 Your Tutorial Progress\n"));

		// Mock progress data (in practice, this would come from user service)
		const progressData = [
			{
				title: "Getting Started with Xaheen CLI",
				progress: 100,
				completedAt: "2 days ago",
				rating: 5,
			},
			{
				title: "React Component Development",
				progress: 60,
				currentStep: "Creating Button Component",
				estimatedTimeRemaining: 15,
			},
			{
				title: "Advanced TypeScript Patterns",
				progress: 0,
				enrolled: true,
			},
		];

		progressData.forEach(tutorial => {
			console.log(chalk.blue.bold(tutorial.title));
			
			if (tutorial.progress === 100) {
				console.log(`  ${chalk.green("✅ Completed")} ${tutorial.completedAt}`);
				if (tutorial.rating) {
					console.log(`  ${chalk.yellow(`⭐ Rated: ${tutorial.rating}/5`)}`);
				}
			} else if (tutorial.progress > 0) {
				console.log(`  ${chalk.yellow(`📊 Progress: ${tutorial.progress}%`)}`);
				if (tutorial.currentStep) {
					console.log(`  ${chalk.cyan(`🎯 Current: ${tutorial.currentStep}`)}`);
				}
				if (tutorial.estimatedTimeRemaining) {
					console.log(`  ${chalk.gray(`⏱️ Est. remaining: ${tutorial.estimatedTimeRemaining}m`)}`);
				}
			} else if (tutorial.enrolled) {
				console.log(`  ${chalk.gray("📚 Enrolled, not started")}`);
			}
			
			console.log();
		});

	} catch (error) {
		logger.error("Tutorial progress command failed:", error);
		console.log(chalk.red("Failed to load tutorial progress. Please try again."));
	}
}

/**
 * Handle enhanced help command
 */
async function handleEnhancedHelpCommand(commandName: string, options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		if (!commandName) {
			// Show available commands
			const searchResult = await communityHub.help.searchHelp({
				type: "command" as any,
				limit: 20,
			});

			console.log(chalk.cyan.bold("\n❓ Available Commands\n"));

			searchResult.results.forEach(help => {
				console.log(`${chalk.blue(help.command || help.title)}`);
				console.log(`  ${help.description}`);
				console.log();
			});

			return;
		}

		const helpResult = await communityHub.help.getCommandHelp(commandName, {
			includeExamples: options.examples,
			format: options.format,
		});

		if (helpResult.content) {
			console.log(helpResult.formatted);

			// Show interactive examples if available
			if (options.examples) {
				const examples = await communityHub.help.getInteractiveExamples(commandName);
				
				if (examples.count > 0) {
					console.log(chalk.yellow.bold("\n🎮 Interactive Examples Available:"));
					examples.examples.forEach(example => {
						console.log(`  ${chalk.blue(example.title)} (${example.difficulty}, ~${example.estimatedTime}m)`);
						console.log(`    ${example.description}`);
					});

					const { runExample } = await inquirer.prompt([
						{
							type: "confirm",
							name: "runExample",
							message: "Would you like to try an interactive example?",
							default: false,
						},
					]);

					if (runExample) {
						const { selectedExample } = await inquirer.prompt([
							{
								type: "list",
								name: "selectedExample",
								message: "Select an example:",
								choices: examples.examples.map(e => ({
									name: `${e.title} (${e.estimatedTime}m)`,
									value: e.id,
								})),
							},
						]);

						const sessionResult = await communityHub.help.startInteractiveExample(selectedExample);
						
						if (sessionResult.success) {
							console.log(chalk.green(`\n✅ Interactive example started: ${sessionResult.sessionId}`));
							console.log(chalk.cyan("Follow the prompts to complete the example."));
						}
					}
				}
			}

			// Show related content
			if (helpResult.relatedContent.length > 0) {
				console.log(chalk.yellow.bold("\n🔗 Related Topics:"));
				helpResult.relatedContent.forEach(related => {
					console.log(`  ${chalk.cyan(`xaheen help ${related.command || related.title}`)}`);
				});
			}

		} else {
			console.log(helpResult.formatted);
		}

	} catch (error) {
		logger.error("Enhanced help command failed:", error);
		console.log(chalk.red("Failed to get help. Please try again."));
	}
}

/**
 * Handle profile command
 */
async function handleProfileCommand(userId?: string): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const profileUserId = userId || "current-user";
		const contributions = await communityHub.getUserContributions(profileUserId);

		if (!contributions) {
			console.log(chalk.yellow("Profile not found."));
			return;
		}

		console.log(chalk.cyan.bold(`\n👤 ${contributions.username}'s Profile\n`));

		// Stats overview
		console.log(chalk.yellow.bold("📊 Contribution Statistics:"));
		console.log(`${chalk.green("🔌")} Plugins Created: ${chalk.white.bold(contributions.stats.pluginsCreated)}`);
		console.log(`${chalk.green("📋")} Templates Shared: ${chalk.white.bold(contributions.stats.templatesShared)}`);
		console.log(`${chalk.green("🎓")} Tutorials Completed: ${chalk.white.bold(contributions.stats.tutorialsCompleted)}`);
		console.log(`${chalk.green("👍")} Helpful Reviews: ${chalk.white.bold(contributions.stats.helpfulReviews)}`);
		console.log(`${chalk.green("⭐")} Reputation: ${chalk.white.bold(contributions.stats.reputation)}\n`);

		// Badges
		if (contributions.stats.badges.length > 0) {
			console.log(chalk.yellow.bold("🏆 Badges:"));
			console.log(`  ${contributions.stats.badges.join(" • ")}\n`);
		}

		// Recent activity
		if (contributions.recentActivity.length > 0) {
			console.log(chalk.yellow.bold("🕒 Recent Activity:"));
			contributions.recentActivity.forEach(activity => {
				const icon = activity.type === "plugin" ? "🔌" : activity.type === "template" ? "📋" : activity.type === "review" ? "⭐" : "🎓";
				const timeAgo = formatTimeAgo(activity.timestamp);
				console.log(`  ${icon} ${activity.title} ${chalk.gray(`• ${timeAgo} • +${activity.points} pts`)}`);
			});
			console.log();
		}

		// Achievements
		if (contributions.achievements.length > 0) {
			console.log(chalk.yellow.bold("🎖️ Achievements:"));
			contributions.achievements.forEach(achievement => {
				const rarityColor = 
					achievement.rarity === "legendary" ? chalk.magenta :
					achievement.rarity === "epic" ? chalk.cyan :
					achievement.rarity === "rare" ? chalk.blue :
					chalk.gray;
				
				console.log(`  ${achievement.icon} ${chalk.white.bold(achievement.title)} ${rarityColor(`(${achievement.rarity})`)}`);
				console.log(`    ${achievement.description}`);
				console.log(`    ${chalk.gray(`Earned ${formatTimeAgo(achievement.earnedAt)}`)}`);
				console.log();
			});
		}

	} catch (error) {
		logger.error("Profile command failed:", error);
		console.log(chalk.red("Failed to load profile. Please try again."));
	}
}

/**
 * Handle recommendations command
 */
async function handleRecommendationsCommand(options: any): Promise<void> {
	try {
		const communityHub = createCommunityHubService();
		await communityHub.initialize();

		const preferences = {
			interests: options.interests ? options.interests.split(",").map((s: string) => s.trim()) : undefined,
			skillLevel: options.skillLevel as any,
			timeAvailable: options.time ? parseInt(options.time) : undefined,
		};

		const recommendations = await communityHub.getPersonalizedRecommendations("current-user", preferences);

		console.log(chalk.cyan.bold("\n🎯 Personalized Recommendations\n"));

		// Recommended plugins
		if (recommendations.plugins.length > 0) {
			console.log(chalk.yellow.bold("🔌 Recommended Plugins:"));
			recommendations.plugins.slice(0, 3).forEach((plugin: any) => {
				console.log(`  ${chalk.blue(plugin.metadata.name)}`);
				console.log(`    ${plugin.metadata.description}`);
				console.log(`    ${chalk.green(`${plugin.metadata.downloads.toLocaleString()} downloads`)} • ${chalk.yellow(`${plugin.metadata.rating.toFixed(1)}/5 ⭐`)}`);
				console.log();
			});
		}

		// Recommended templates
		if (recommendations.templates.length > 0) {
			console.log(chalk.yellow.bold("📋 Recommended Templates:"));
			recommendations.templates.slice(0, 3).forEach((template: any) => {
				console.log(`  ${chalk.blue(template.name)}`);
				console.log(`    ${template.description}`);
				console.log(`    ${chalk.green(template.category)} • ${chalk.cyan(template.complexity)}`);
				console.log();
			});
		}

		// Recommended tutorials
		if (recommendations.tutorials.length > 0) {
			console.log(chalk.yellow.bold("🎓 Recommended Tutorials:"));
			recommendations.tutorials.slice(0, 3).forEach((tutorial: any) => {
				console.log(`  ${chalk.blue(tutorial.title)}`);
				console.log(`    ${tutorial.description}`);
				console.log(`    ${chalk.green(`${tutorial.estimatedDuration}m`)} • ${chalk.cyan(tutorial.difficulty)}`);
				console.log();
			});
		}

		// Recommended collections
		if (recommendations.collections.length > 0) {
			console.log(chalk.yellow.bold("📚 Recommended Collections:"));
			recommendations.collections.slice(0, 2).forEach((collection: any) => {
				console.log(`  ${chalk.blue(collection.name)}`);
				console.log(`    ${collection.description}`);
				console.log(`    ${chalk.green(`${collection.templates.length} templates`)} • By ${chalk.gray(collection.author.displayName)}`);
				console.log();
			});
		}

		console.log(chalk.cyan("💡 Recommendations are based on your activity, preferences, and community trends."));

	} catch (error) {
		logger.error("Recommendations command failed:", error);
		console.log(chalk.red("Failed to load recommendations. Please try again."));
	}
}

// Helper functions for interactive modes
async function handleInteractiveSearch(): Promise<void> {
	const { query, type } = await inquirer.prompt([
		{
			type: "input",
			name: "query",
			message: "What are you looking for?",
		},
		{
			type: "list",
			name: "type",
			message: "Content type:",
			choices: ["all", "plugins", "templates", "tutorials", "help"],
		},
	]);

	await handleSearchCommand(query, { type });
}

async function handleInteractivePlugins(): Promise<void> {
	const { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What would you like to do with plugins?",
			choices: [
				{ name: "Search plugins", value: "search" },
				{ name: "Create new plugin", value: "create" },
				{ name: "View plugin development toolkit", value: "toolkit" },
			],
		},
	]);

	switch (action) {
		case "search":
			await handlePluginSearchCommand("", {});
			break;
		case "create":
			const { name } = await inquirer.prompt([
				{
					type: "input",
					name: "name",
					message: "Plugin name:",
					validate: (input) => input.trim().length > 0 || "Please enter a plugin name",
				},
			]);
			await handlePluginCreateCommand(name, {});
			break;
		case "toolkit":
			console.log(chalk.cyan("\n🔧 Plugin Development Toolkit"));
			console.log(chalk.gray("The toolkit provides scaffolding, testing, and publishing tools for plugin development."));
			console.log(chalk.yellow("Use 'xaheen community plugins create <name>' to get started."));
			break;
	}
}

async function handleInteractiveTemplates(): Promise<void> {
	const { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What would you like to do with templates?",
			choices: [
				{ name: "Search templates", value: "search" },
				{ name: "Browse collections", value: "collections" },
				{ name: "Share a template", value: "share" },
			],
		},
	]);

	switch (action) {
		case "search":
			await handleTemplateSearchCommand("", {});
			break;
		case "collections":
			await handleTemplateCollectionsCommand();
			break;
		case "share":
			const { templatePath } = await inquirer.prompt([
				{
					type: "input",
					name: "templatePath",
					message: "Path to template directory:",
					validate: (input) => input.trim().length > 0 || "Please enter a template path",
				},
			]);
			await handleTemplateShareCommand(templatePath, {});
			break;
	}
}

async function handleInteractiveTutorials(): Promise<void> {
	const { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What would you like to do with tutorials?",
			choices: [
				{ name: "Browse tutorials", value: "list" },
				{ name: "Check my progress", value: "progress" },
				{ name: "Get recommendations", value: "recommendations" },
			],
		},
	]);

	switch (action) {
		case "list":
			await handleTutorialListCommand({});
			break;
		case "progress":
			await handleTutorialProgressCommand();
			break;
		case "recommendations":
			await handleRecommendationsCommand({});
			break;
	}
}

async function handleInteractiveHelp(): Promise<void> {
	const { command } = await inquirer.prompt([
		{
			type: "input",
			name: "command",
			message: "Which command do you need help with? (leave empty to see all):",
		},
	]);

	await handleEnhancedHelpCommand(command, { examples: true });
}

/**
 * Format time ago helper
 */
function formatTimeAgo(timestamp: string): string {
	const now = new Date();
	const time = new Date(timestamp);
	const diffMs = now.getTime() - time.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) {
		return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
	} else if (diffHours > 0) {
		return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
	} else {
		return "Just now";
	}
}

/**
 * Default export
 */
export default createCommunityCommand;