/**
 * Comprehensive Help System Service
 *
 * Provides detailed help content, examples, and usage guides for all CLI commands.
 * Inspired by Laravel Artisan's excellent help system.
 */

import chalk from "chalk";
import { cliLogger } from "../../utils/logger";
import { getVersion } from "../../utils/version.js";

export interface HelpSection {
	title: string;
	description: string;
	examples: HelpExample[];
	related?: string[];
}

export interface HelpExample {
	command: string;
	description: string;
	explanation?: string;
}

export interface CommandHelp {
	name: string;
	description: string;
	usage: string;
	arguments?: ArgumentHelp[];
	options?: OptionHelp[];
	examples: HelpExample[];
	tips?: string[];
	related?: string[];
}

export interface ArgumentHelp {
	name: string;
	description: string;
	required: boolean;
	type: string;
}

export interface OptionHelp {
	name: string;
	short?: string;
	description: string;
	type: string;
	default?: string;
}

export class HelpSystemService {
	private helpContent: Map<string, CommandHelp> = new Map();
	private sections: Map<string, HelpSection> = new Map();

	constructor() {
		this.initializeHelpContent();
	}

	/**
	 * Initialize comprehensive help content for all commands
	 */
	private initializeHelpContent(): void {
		// Project Commands
		this.helpContent.set("project:create", {
			name: "project create",
			description: "Create a new Xaheen project with full-stack architecture",
			usage: "xaheen project create <name> [options]",
			arguments: [
				{
					name: "name",
					description: "The name of the project to create",
					required: true,
					type: "string",
				},
			],
			options: [
				{
					name: "--template",
					short: "-t",
					description: "Project template to use",
					type: "string",
					default: "fullstack",
				},
				{
					name: "--framework",
					short: "-f",
					description: "Frontend framework (react, nextjs, vue, angular)",
					type: "string",
					default: "nextjs",
				},
				{
					name: "--backend",
					short: "-b",
					description: "Backend framework (nestjs, express, fastify)",
					type: "string",
					default: "nestjs",
				},
				{
					name: "--database",
					short: "-d",
					description: "Database provider (postgresql, mysql, mongodb)",
					type: "string",
					default: "postgresql",
				},
				{
					name: "--norwegian",
					description: "Enable Norwegian compliance features",
					type: "boolean",
				},
				{
					name: "--accessibility",
					short: "-a",
					description: "Accessibility level (A, AA, AAA)",
					type: "string",
					default: "AAA",
				},
			],
			examples: [
				{
					command: "xaheen project create my-app",
					description: "Create a basic full-stack project",
					explanation:
						"Creates a new project with Next.js frontend, NestJS backend, and PostgreSQL database",
				},
				{
					command:
						"xaheen project create ecommerce --template ecommerce --norwegian",
					description: "Create an e-commerce project with Norwegian compliance",
					explanation:
						"Sets up e-commerce template with GDPR compliance and Norwegian localization",
				},
				{
					command:
						"xaheen project create blog --framework react --backend express",
					description: "Create a blog with specific tech stack",
					explanation:
						"Uses React for frontend and Express for backend instead of defaults",
				},
			],
			tips: [
				"Use --dry-run to see what files would be created without actually creating them",
				"Add --verbose to see detailed creation progress",
				"Projects are automatically configured with TypeScript, ESLint, and Prettier",
			],
			related: ["app:create", "make:model", "make:controller"],
		});

		// Make Commands (Laravel Artisan-style)
		this.helpContent.set("make:model", {
			name: "make:model",
			description: "Create a new model class with optional database migration",
			usage: "xaheen make:model <name> [options]",
			arguments: [
				{
					name: "name",
					description: "The name of the model to create",
					required: true,
					type: "string",
				},
			],
			options: [
				{
					name: "--migration",
					short: "-m",
					description: "Create a migration file for the model",
					type: "boolean",
				},
				{
					name: "--controller",
					short: "-c",
					description: "Create a controller for the model",
					type: "boolean",
				},
				{
					name: "--resource",
					short: "-r",
					description: "Create a resource controller",
					type: "boolean",
				},
				{
					name: "--factory",
					short: "-f",
					description: "Create a factory for the model",
					type: "boolean",
				},
				{
					name: "--seeder",
					short: "-s",
					description: "Create a seeder for the model",
					type: "boolean",
				},
				{
					name: "--all",
					short: "-a",
					description:
						"Create model with migration, controller, factory, and seeder",
					type: "boolean",
				},
				{
					name: "--ai",
					description: "Use AI to generate intelligent model structure",
					type: "boolean",
				},
				{
					name: "--description",
					description: "Describe the model for AI generation",
					type: "string",
				},
			],
			examples: [
				{
					command: "xaheen make:model User",
					description: "Create a basic User model",
					explanation: "Generates a User model class with TypeScript types",
				},
				{
					command:
						"xaheen make:model Product --migration --controller --factory",
					description: "Create Product model with related files",
					explanation:
						"Creates model, migration, controller, and factory files",
				},
				{
					command: "xaheen make:model Order --all",
					description: "Create Order model with all related files",
					explanation:
						"Equivalent to --migration --controller --factory --seeder",
				},
				{
					command:
						'xaheen make:model Article --ai --description "Blog article with title, content, author, and published date"',
					description: "AI-generated Article model",
					explanation:
						"Uses AI to intelligently generate model fields and relationships",
				},
			],
			tips: [
				"Model names should be singular and PascalCase (e.g., User, BlogPost)",
				"Use --ai with --description for intelligent field generation",
				"Migrations are automatically timestamped and versioned",
			],
			related: ["make:controller", "make:migration", "make:factory"],
		});

		this.helpContent.set("make:controller", {
			name: "make:controller",
			description:
				"Create a new controller class with optional resource methods",
			usage: "xaheen make:controller <name> [options]",
			arguments: [
				{
					name: "name",
					description: "The name of the controller to create",
					required: true,
					type: "string",
				},
			],
			options: [
				{
					name: "--resource",
					short: "-r",
					description: "Create a resource controller with CRUD methods",
					type: "boolean",
				},
				{
					name: "--api",
					description: "Create an API-only controller (no create/edit views)",
					type: "boolean",
				},
				{
					name: "--model",
					short: "-m",
					description: "Associated model name for type hints",
					type: "string",
				},
				{
					name: "--ai",
					description: "Use AI to generate intelligent controller methods",
					type: "boolean",
				},
			],
			examples: [
				{
					command: "xaheen make:controller UserController",
					description: "Create a basic controller",
					explanation: "Generates an empty controller class",
				},
				{
					command: "xaheen make:controller ProductController --resource",
					description: "Create a resource controller",
					explanation:
						"Includes index, show, store, update, and destroy methods",
				},
				{
					command: "xaheen make:controller OrderController --api --model Order",
					description: "Create API controller with model binding",
					explanation:
						"API-only controller with proper TypeScript types for Order model",
				},
			],
			tips: [
				'Controller names should end with "Controller" (e.g., UserController)',
				"Use --resource for standard CRUD operations",
				"Use --api for REST API endpoints without view methods",
			],
			related: ["make:model", "make:service", "make:component"],
		});

		this.helpContent.set("make:component", {
			name: "make:component",
			description:
				"Create a new frontend component with TypeScript and styling",
			usage: "xaheen make:component <name> [options]",
			arguments: [
				{
					name: "name",
					description: "The name of the component to create",
					required: true,
					type: "string",
				},
			],
			options: [
				{
					name: "--type",
					short: "-t",
					description: "Component type (page, layout, form, modal, card)",
					type: "string",
					default: "component",
				},
				{
					name: "--styling",
					short: "-s",
					description:
						"Styling approach (tailwind, css-modules, styled-components)",
					type: "string",
					default: "tailwind",
				},
				{
					name: "--test",
					description: "Generate unit tests for the component",
					type: "boolean",
				},
				{
					name: "--stories",
					description: "Generate Storybook stories",
					type: "boolean",
				},
				{
					name: "--ai",
					description: "Use AI for intelligent component generation",
					type: "boolean",
				},
				{
					name: "--description",
					description: "Describe the component for AI generation",
					type: "string",
				},
				{
					name: "--accessibility",
					description: "Accessibility level (A, AA, AAA)",
					type: "string",
					default: "AAA",
				},
			],
			examples: [
				{
					command: "xaheen make:component Button",
					description: "Create a basic Button component",
					explanation:
						"Generates a TypeScript React component with Tailwind CSS",
				},
				{
					command:
						"xaheen make:component UserForm --type form --test --stories",
					description: "Create a form component with tests and stories",
					explanation:
						"Full component with unit tests and Storybook documentation",
				},
				{
					command:
						'xaheen make:component ProductCard --ai --description "Product card showing image, title, price, and add to cart button"',
					description: "AI-generated product card",
					explanation:
						"Uses AI to generate component structure, props, and styling",
				},
			],
			tips: [
				"Component names should be PascalCase (e.g., UserProfile, ProductCard)",
				"Use --ai with --description for intelligent component generation",
				"All components include TypeScript interfaces and accessibility features",
			],
			related: ["make:page", "make:service", "project:create"],
		});

		// MCP Commands
		this.helpContent.set("mcp:connect", {
			name: "mcp connect",
			description:
				"Connect to Xala MCP server for intelligent component generation",
			usage: "xaheen mcp connect [options]",
			options: [
				{
					name: "--server",
					description: "MCP server URL to connect to",
					type: "string",
					default: "local",
				},
			],
			examples: [
				{
					command: "xaheen mcp connect",
					description: "Connect to local MCP server",
					explanation:
						"Establishes connection to Xala MCP server for intelligent features",
				},
			],
			tips: [
				"MCP connection enables AI-powered component generation",
				"Server automatically starts in simulation mode if unavailable",
			],
			related: ["mcp:generate", "mcp:analyze", "mcp:suggestions"],
		});

		this.helpContent.set("mcp:analyze", {
			name: "mcp analyze",
			description: "Perform intelligent analysis of your codebase",
			usage: "xaheen mcp analyze [options]",
			options: [
				{
					name: "--path",
					description: "Project path to analyze",
					type: "string",
					default: "current directory",
				},
			],
			examples: [
				{
					command: "xaheen mcp analyze",
					description: "Analyze current project",
					explanation:
						"Provides comprehensive analysis with health scores and suggestions",
				},
				{
					command: "xaheen mcp analyze --path ./my-project",
					description: "Analyze specific project",
					explanation: "Analyzes a different project directory",
				},
			],
			tips: [
				"Analysis includes code health, security, performance, and accessibility scores",
				"Results include actionable suggestions for improvement",
			],
			related: ["mcp:suggestions", "mcp:context"],
		});

		// Sections for topic-based help
		this.sections.set("getting-started", {
			title: "Getting Started with Xaheen CLI",
			description:
				"Learn the basics of using Xaheen CLI for full-stack development",
			examples: [
				{
					command: "xaheen project create my-app",
					description: "Create your first project",
				},
				{
					command: "xaheen make:model User --migration",
					description: "Create your first model with database migration",
				},
				{
					command: "xaheen make:controller UserController --resource",
					description: "Create a REST API controller",
				},
				{
					command:
						'xaheen make:component UserProfile --ai --description "User profile with avatar and bio"',
					description: "Create an AI-generated component",
				},
			],
			related: ["project", "make", "mcp"],
		});

		this.sections.set("ai-features", {
			title: "AI-Powered Development",
			description:
				"Leverage AI for intelligent code generation and project analysis",
			examples: [
				{
					command: "xaheen mcp connect",
					description: "Connect to AI services",
				},
				{
					command: "xaheen mcp analyze",
					description: "Get AI-powered project analysis",
				},
				{
					command:
						'xaheen make:model Product --ai --description "E-commerce product with pricing and inventory"',
					description: "AI-generated model with intelligent fields",
				},
				{
					command:
						'xaheen make:component Dashboard --ai --description "Admin dashboard with charts and metrics"',
					description: "AI-generated complex component",
				},
			],
			related: ["mcp", "make"],
		});

		this.sections.set("best-practices", {
			title: "Best Practices",
			description:
				"Follow these conventions for optimal development experience",
			examples: [
				{
					command:
						"xaheen make:model BlogPost --migration --controller --factory",
					description: "Create models with all related files",
					explanation:
						"Always create migrations, controllers, and factories together",
				},
				{
					command: "xaheen make:component UserCard --test --stories",
					description: "Create components with tests and documentation",
					explanation:
						"Include tests and Storybook stories for better maintainability",
				},
				{
					command:
						"xaheen project create app-name --norwegian --accessibility AAA",
					description: "Enable compliance features from the start",
					explanation:
						"Set up GDPR and accessibility compliance early in development",
				},
			],
			related: ["make", "project"],
		});
	}

	/**
	 * Display help for a specific command
	 */
	public showCommandHelp(commandName: string): void {
		const help = this.helpContent.get(commandName);

		if (!help) {
			cliLogger.error(
				chalk.red(`No help available for command: ${commandName}`),
			);
			this.showAvailableCommands();
			return;
		}

		this.displayCommandHelp(help);
	}

	/**
	 * Display help for a topic/section
	 */
	public showSectionHelp(sectionName: string): void {
		const section = this.sections.get(sectionName);

		if (!section) {
			cliLogger.error(chalk.red(`No help available for topic: ${sectionName}`));
			this.showAvailableSections();
			return;
		}

		this.displaySectionHelp(section);
	}

	/**
	 * Display general help overview
	 */
	public showGeneralHelp(): void {
		this.displayHeader();

		cliLogger.info(chalk.blue("\n📚 Available Topics:\n"));

		for (const [key, section] of this.sections) {
			cliLogger.info(
				`  ${chalk.cyan(key.padEnd(20))} ${chalk.gray(section.description)}`,
			);
		}

		cliLogger.info(chalk.blue("\n🛠️  Common Commands:\n"));

		const commonCommands = [
			"project:create",
			"make:model",
			"make:controller",
			"make:component",
			"mcp:connect",
			"mcp:analyze",
		];

		for (const commandKey of commonCommands) {
			const help = this.helpContent.get(commandKey);
			if (help) {
				cliLogger.info(
					`  ${chalk.green(help.name.padEnd(20))} ${chalk.gray(help.description)}`,
				);
			}
		}

		cliLogger.info(chalk.yellow("\n💡 Usage:"));
		cliLogger.info(
			`  ${chalk.white("xaheen help <command>")}     Show help for a specific command`,
		);
		cliLogger.info(
			`  ${chalk.white("xaheen help <topic>")}       Show help for a topic`,
		);
		cliLogger.info(
			`  ${chalk.white("xaheen <command> --help")}   Quick command help`,
		);

		cliLogger.info(chalk.blue("\n🚀 Examples:"));
		cliLogger.info(`  ${chalk.gray("xaheen help getting-started")}`);
		cliLogger.info(`  ${chalk.gray("xaheen help make:model")}`);
		cliLogger.info(`  ${chalk.gray("xaheen help ai-features")}`);

		cliLogger.info(chalk.blue("\n🔗 Quick Access:"));
		cliLogger.info(
			`  ${chalk.white("xaheen aliases")}         Show all command aliases and shortcuts`,
		);
		cliLogger.info(
			`  ${chalk.gray("xaheen m:m User")}          Shortcut for make:model User`,
		);
		cliLogger.info(
			`  ${chalk.gray("xaheen new my-app")}        Shortcut for project create my-app`,
		);
		cliLogger.info(
			`  ${chalk.gray("xaheen ai")}                Shortcut for mcp connect`,
		);
	}

	/**
	 * Show available commands for help
	 */
	private showAvailableCommands(): void {
		cliLogger.info(chalk.blue("\n📋 Available Commands for Help:\n"));

		for (const [key, help] of this.helpContent) {
			cliLogger.info(
				`  ${chalk.cyan(key.padEnd(20))} ${chalk.gray(help.description)}`,
			);
		}
	}

	/**
	 * Show available help sections
	 */
	private showAvailableSections(): void {
		cliLogger.info(chalk.blue("\n📋 Available Help Topics:\n"));

		for (const [key, section] of this.sections) {
			cliLogger.info(
				`  ${chalk.cyan(key.padEnd(20))} ${chalk.gray(section.description)}`,
			);
		}
	}

	/**
	 * Display formatted command help
	 */
	private displayCommandHelp(help: CommandHelp): void {
		this.displayHeader();

		// Command name and description
		cliLogger.info(chalk.blue(`\n📖 ${help.name}\n`));
		cliLogger.info(chalk.gray(help.description));

		// Usage
		cliLogger.info(chalk.yellow("\n💡 Usage:"));
		cliLogger.info(`  ${chalk.white(help.usage)}`);

		// Arguments
		if (help.arguments && help.arguments.length > 0) {
			cliLogger.info(chalk.yellow("\n📝 Arguments:"));
			for (const arg of help.arguments) {
				const required = arg.required
					? chalk.red("required")
					: chalk.gray("optional");
				cliLogger.info(
					`  ${chalk.cyan(arg.name.padEnd(15))} ${chalk.gray(arg.description)} ${chalk.gray(`(${arg.type}, ${required})`)}`,
				);
			}
		}

		// Options
		if (help.options && help.options.length > 0) {
			cliLogger.info(chalk.yellow("\n⚙️  Options:"));
			for (const option of help.options) {
				const shortFlag = option.short ? `, ${option.short}` : "";
				const defaultValue = option.default
					? chalk.gray(` (default: ${option.default})`)
					: "";
				cliLogger.info(
					`  ${chalk.green(`${option.name}${shortFlag}`.padEnd(25))} ${chalk.gray(option.description)}${defaultValue}`,
				);
			}
		}

		// Examples
		if (help.examples && help.examples.length > 0) {
			cliLogger.info(chalk.yellow("\n🚀 Examples:"));
			for (const example of help.examples) {
				cliLogger.info(`\n  ${chalk.white(example.command)}`);
				cliLogger.info(`  ${chalk.gray(example.description)}`);
				if (example.explanation) {
					cliLogger.info(`  ${chalk.dim("→ " + example.explanation)}`);
				}
			}
		}

		// Tips
		if (help.tips && help.tips.length > 0) {
			cliLogger.info(chalk.yellow("\n💡 Tips:"));
			for (const tip of help.tips) {
				cliLogger.info(`  • ${chalk.gray(tip)}`);
			}
		}

		// Related commands
		if (help.related && help.related.length > 0) {
			cliLogger.info(chalk.yellow("\n🔗 Related Commands:"));
			cliLogger.info(
				`  ${help.related.map((cmd) => chalk.cyan(cmd)).join(", ")}`,
			);
		}
	}

	/**
	 * Display formatted section help
	 */
	private displaySectionHelp(section: HelpSection): void {
		this.displayHeader();

		cliLogger.info(chalk.blue(`\n📚 ${section.title}\n`));
		cliLogger.info(chalk.gray(section.description));

		if (section.examples && section.examples.length > 0) {
			cliLogger.info(chalk.yellow("\n🚀 Examples:"));
			for (const example of section.examples) {
				cliLogger.info(`\n  ${chalk.white(example.command)}`);
				cliLogger.info(`  ${chalk.gray(example.description)}`);
				if (example.explanation) {
					cliLogger.info(`  ${chalk.dim("→ " + example.explanation)}`);
				}
			}
		}

		if (section.related && section.related.length > 0) {
			cliLogger.info(chalk.yellow("\n🔗 Related Topics:"));
			cliLogger.info(
				`  ${section.related.map((topic) => chalk.cyan(topic)).join(", ")}`,
			);
		}
	}

	/**
	 * Display CLI header
	 */
	private displayHeader(): void {
		const border = "─".repeat(61);
		cliLogger.info(chalk.blue(`╭${border}╮`));
		cliLogger.info(
			chalk.blue(
				`│  ${chalk.bold(`Xaheen CLI v${getVersion()} - Comprehensive Help System`)}       │`,
			),
		);
		cliLogger.info(
			chalk.blue(
				`│  ${chalk.gray("Laravel Artisan-inspired • AI-powered • Full-stack")}   │`,
			),
		);
		cliLogger.info(chalk.blue(`╰${border}╯`));
	}

	/**
	 * Search help content
	 */
	public searchHelp(query: string): void {
		const results: Array<{
			type: "command" | "section";
			key: string;
			item: CommandHelp | HelpSection;
		}> = [];

		// Search commands
		for (const [key, help] of this.helpContent) {
			if (
				key.toLowerCase().includes(query.toLowerCase()) ||
				help.description.toLowerCase().includes(query.toLowerCase())
			) {
				results.push({ type: "command", key, item: help });
			}
		}

		// Search sections
		for (const [key, section] of this.sections) {
			if (
				key.toLowerCase().includes(query.toLowerCase()) ||
				section.description.toLowerCase().includes(query.toLowerCase())
			) {
				results.push({ type: "section", key, item: section });
			}
		}

		if (results.length === 0) {
			cliLogger.info(chalk.yellow(`No help found for: ${query}`));
			this.showGeneralHelp();
			return;
		}

		this.displayHeader();
		cliLogger.info(
			chalk.blue(`\n🔍 Search Results for: ${chalk.white(query)}\n`),
		);

		for (const result of results) {
			const icon = result.type === "command" ? "🛠️" : "📚";
			cliLogger.info(
				`  ${icon} ${chalk.cyan(result.key.padEnd(20))} ${chalk.gray(result.item.description)}`,
			);
		}

		cliLogger.info(chalk.yellow("\n💡 Use:"));
		cliLogger.info(
			`  ${chalk.white("xaheen help <command/topic>")} for detailed help`,
		);
	}
}
