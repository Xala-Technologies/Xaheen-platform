/**
 * @fileoverview Scaffold Command - Hybrid Scaffolding Architecture
 * @description Command interface for the three-tier generator system
 */

import chalk from "chalk";
import { Command } from "commander";
import { promises as fs } from "fs";
import inquirer from "inquirer";
import ora from "ora";
import { join, resolve } from "path";
import {
	createHybridScaffolder,
	getDefaultHybridOptions,
	getDefaultScaffoldingContext,
	HybridScaffoldingOptions,
	ImportStatement,
	RouteConfiguration,
	ScaffoldingContext,
	TypeScriptInterface,
	validateProjectPath,
} from "../scaffolding/index.js";
import { logger } from "../utils/logger.js";

interface ScaffoldOptions {
	readonly framework?: string;
	readonly features?: string;
	readonly tier1?: boolean;
	readonly tier2?: boolean;
	readonly tier3?: boolean;
	readonly dryRun?: boolean;
	readonly verbose?: boolean;
	readonly interactive?: boolean;
	readonly template?: string;
	readonly services?: string;
}

export const scaffoldCommand = new Command()
	.name("scaffold")
	.description("Generate code using the hybrid scaffolding architecture")
	.argument("[name]", "Project or component name")
	.option(
		"-f, --framework <framework>",
		"Target framework (react, vue, angular, svelte)",
		"react",
	)
	.option(
		"--features <features>",
		"Comma-separated list of features to include",
	)
	.option("--tier1", "Enable Tier 1: Global Project Scaffolding (Yeoman)", true)
	.option(
		"--tier2",
		"Enable Tier 2: TypeScript Code Manipulation (Nx DevKit)",
		true,
	)
	.option("--tier3", "Enable Tier 3: Project-Local Generators (Hygen)", true)
	.option("--no-tier1", "Disable Tier 1")
	.option("--no-tier2", "Disable Tier 2")
	.option("--no-tier3", "Disable Tier 3")
	.option("-d, --dry-run", "Preview changes without writing files", false)
	.option("-v, --verbose", "Enable verbose logging", false)
	.option("-i, --interactive", "Run in interactive mode", false)
	.option("-t, --template <template>", "Custom template path")
	.option(
		"-s, --services <services>",
		"Comma-separated list of services to run",
	)
	.action(async (name: string | undefined, options: ScaffoldOptions) => {
		try {
			if (options.interactive || !name) {
				await runInteractiveMode(options);
			} else {
				await runDirectMode(name, options);
			}
		} catch (error) {
			logger.error(
				`Scaffolding failed: ${error instanceof Error ? error.message : String(error)}`,
			);
			process.exit(1);
		}
	});

// ===== SUB-COMMANDS =====

scaffoldCommand
	.command("project")
	.description("Generate a new project using Tier 1 (Yeoman)")
	.argument("<name>", "Project name")
	.option("-f, --framework <framework>", "Target framework", "react")
	.option("-p, --path <path>", "Project path", ".")
	.option("--backend <backend>", "Backend framework")
	.option("--database <database>", "Database type")
	.option("--auth <auth>", "Authentication provider")
	.option("-d, --dry-run", "Preview changes", false)
	.action(async (name: string, projectOptions: any) => {
		const projectPath = resolve(projectOptions.path, name);

		if (!validateProjectPath(projectPath)) {
			throw new Error(`Invalid project path: ${projectPath}`);
		}

		const context = getDefaultScaffoldingContext(
			name,
			projectPath,
			projectOptions.framework,
		);
		context.dryRun = projectOptions.dryRun;

		const scaffolder = createHybridScaffolder(projectPath);

		const options: HybridScaffoldingOptions = {
			tier1: {
				skipInstall: projectOptions.dryRun,
				gitInit: true,
				customizations: {
					backend: projectOptions.backend,
					database: projectOptions.database,
					auth: projectOptions.auth,
				},
			},
			orchestration: {
				strategy: "sequential",
				rollbackOnError: true,
			},
		};

		const spinner = ora("Generating project structure...").start();

		try {
			const result = await scaffolder.generateProject(context, options);

			if (result.success) {
				spinner.succeed(`Project '${name}' generated successfully`);
				logger.info(`Generated ${result.files.length} files`);

				if (result.warnings.length > 0) {
					result.warnings.forEach((warning) => logger.warn(warning));
				}
			} else {
				spinner.fail("Project generation failed");
				result.errors.forEach((error) => logger.error(error));
			}
		} catch (error) {
			spinner.fail("Project generation failed");
			throw error;
		}
	});

scaffoldCommand
	.command("component")
	.description("Generate a component using Tier 3 (Hygen)")
	.argument("<name>", "Component name")
	.option("-t, --type <type>", "Component type", "functional")
	.option("--props", "Include props interface", false)
	.option("--state", "Include state management", false)
	.option("--storybook", "Generate Storybook story", false)
	.option("-d, --dry-run", "Preview changes", false)
	.action(async (name: string, componentOptions: any) => {
		const projectPath = process.cwd();
		const context = getDefaultScaffoldingContext(name, projectPath);
		context.dryRun = componentOptions.dryRun;

		const scaffolder = createHybridScaffolder(projectPath);

		const features: string[] = [];
		if (componentOptions.props) features.push("props");
		if (componentOptions.state) features.push("state");
		if (componentOptions.storybook) features.push("storybook");

		const serviceOptions = {
			"component-generator": {
				name,
				type: componentOptions.type,
				features,
			},
		};

		const options: HybridScaffoldingOptions = {
			tier3: {
				generatorName: "component",
				variables: { name, type: componentOptions.type, features },
				dryRun: componentOptions.dryRun,
			},
			orchestration: {
				strategy: "sequential",
			},
		};

		const spinner = ora(
			`Generating ${componentOptions.type} component: ${name}`,
		).start();

		try {
			const result = await scaffolder.generateWithServices(context, {
				...options,
				services: serviceOptions,
			});

			if (result.success) {
				spinner.succeed(`Component '${name}' generated successfully`);
				logger.info(`Generated ${result.files.length} files`);
				result.files.forEach((file) => logger.debug(`  - ${file}`));
			} else {
				spinner.fail("Component generation failed");
				result.errors.forEach((error) => logger.error(error));
			}
		} catch (error) {
			spinner.fail("Component generation failed");
			throw error;
		}
	});

scaffoldCommand
	.command("transform")
	.description("Apply TypeScript transformations using Tier 2 (Nx DevKit)")
	.option("--add-imports <imports>", "Add import statements (JSON format)")
	.option(
		"--add-interfaces <interfaces>",
		"Add TypeScript interfaces (JSON format)",
	)
	.option("--add-routes <routes>", "Add route configurations (JSON format)")
	.option("-d, --dry-run", "Preview changes", false)
	.action(async (transformOptions: any) => {
		const projectPath = process.cwd();
		const context = getDefaultScaffoldingContext("transform", projectPath);
		context.dryRun = transformOptions.dryRun;

		const scaffolder = createHybridScaffolder(projectPath);

		const options: HybridScaffoldingOptions = {
			tier2: {
				imports: transformOptions.addImports
					? (JSON.parse(transformOptions.addImports) as ImportStatement[])
					: [],
				interfaces: transformOptions.addInterfaces
					? (JSON.parse(
							transformOptions.addInterfaces,
						) as TypeScriptInterface[])
					: [],
				routes: transformOptions.addRoutes
					? (JSON.parse(transformOptions.addRoutes) as RouteConfiguration[])
					: [],
			},
			orchestration: {
				strategy: "sequential",
			},
		};

		const spinner = ora("Applying TypeScript transformations...").start();

		try {
			const result = await scaffolder.orchestrate(context, options);

			if (result.success) {
				spinner.succeed("Transformations applied successfully");
				logger.info(`Modified ${result.files.length} files`);
			} else {
				spinner.fail("Transformation failed");
				result.errors.forEach((error) => logger.error(error));
			}
		} catch (error) {
			spinner.fail("Transformation failed");
			throw error;
		}
	});

scaffoldCommand
	.command("preview")
	.description("Preview scaffolding changes without applying them")
	.argument("[name]", "Project or component name")
	.option("-f, --framework <framework>", "Target framework", "react")
	.option("--features <features>", "Comma-separated list of features")
	.action(async (name: string | undefined, previewOptions: any) => {
		const projectPath = process.cwd();
		const projectName = name || "preview";

		const context = getDefaultScaffoldingContext(
			projectName,
			projectPath,
			previewOptions.framework,
		);
		context.dryRun = true;
		context.features = previewOptions.features
			? previewOptions.features.split(",")
			: [];

		const scaffolder = createHybridScaffolder(projectPath);
		const options = getDefaultHybridOptions();

		try {
			const changes = await scaffolder.previewChanges(context, options);

			console.log(chalk.cyan("\n📋 Preview of changes:\n"));

			if (changes.length === 0) {
				console.log(chalk.yellow("No changes would be made."));
			} else {
				changes.forEach((change) => {
					const [operation, file] = change.split(" ", 2);
					const color =
						operation === "+" ? "green" : operation === "-" ? "red" : "yellow";
					console.log(chalk[color](`${operation} ${file}`));
				});
			}

			console.log();
		} catch (error) {
			logger.error(
				`Preview failed: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	});

// ===== INTERACTIVE MODE =====

async function runInteractiveMode(options: ScaffoldOptions): Promise<void> {
	logger.info("🎨 Welcome to Xala CLI Hybrid Scaffolding");

	const answers = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What would you like to generate?",
			choices: [
				{ name: "🏗️  New Project (Full scaffolding)", value: "project" },
				{ name: "🧩 Component (Quick generation)", value: "component" },
				{ name: "📄 Page (With routing)", value: "page" },
				{ name: "🔧 Transform (Code manipulation)", value: "transform" },
			],
		},
		{
			type: "input",
			name: "name",
			message: "Name:",
			validate: (input: string) => input.length > 0 || "Name is required",
		},
		{
			type: "list",
			name: "framework",
			message: "Framework:",
			choices: ["react", "vue", "angular", "svelte"],
			default: "react",
		},
		{
			type: "checkbox",
			name: "features",
			message: "Features to include:",
			choices: [
				{ name: "TypeScript", value: "typescript", checked: true },
				{ name: "Props Interface", value: "props" },
				{ name: "State Management", value: "state" },
				{ name: "Storybook Stories", value: "storybook" },
				{ name: "Test Files", value: "tests", checked: true },
				{ name: "Documentation", value: "docs" },
			],
		},
		{
			type: "confirm",
			name: "dryRun",
			message: "Preview changes first (dry run)?",
			default: false,
		},
	]);

	const projectPath =
		answers.action === "project" ? resolve(answers.name) : process.cwd();

	const context: ScaffoldingContext = {
		projectPath,
		projectName: answers.name,
		framework: answers.framework,
		features: answers.features,
		dryRun: answers.dryRun,
		verbose: options.verbose || false,
	};

	const scaffolder = createHybridScaffolder(projectPath);

	try {
		let result;

		switch (answers.action) {
			case "project":
				result = await generateInteractiveProject(scaffolder, context);
				break;
			case "component":
				result = await generateInteractiveComponent(scaffolder, context);
				break;
			case "page":
				result = await generateInteractivePage(scaffolder, context);
				break;
			case "transform":
				result = await runInteractiveTransform(scaffolder, context);
				break;
			default:
				throw new Error(`Unknown action: ${answers.action}`);
		}

		if (result.success) {
			logger.success(`✅ ${answers.action} generation completed successfully!`);
			logger.info(`Generated ${result.files.length} files`);
		} else {
			logger.error("❌ Generation failed");
			result.errors.forEach((error) => logger.error(error));
		}
	} catch (error) {
		logger.error(
			`Interactive mode failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		throw error;
	}
}

async function runDirectMode(
	name: string,
	options: ScaffoldOptions,
): Promise<void> {
	const projectPath = process.cwd();
	const context: ScaffoldingContext = {
		projectPath,
		projectName: name,
		framework: options.framework || "react",
		features: options.features ? options.features.split(",") : [],
		dryRun: options.dryRun || false,
		verbose: options.verbose || false,
	};

	const scaffolder = createHybridScaffolder(projectPath);
	const scaffoldingOptions = getDefaultHybridOptions();

	// Configure tiers based on options
	if (!options.tier1) scaffoldingOptions.tier1 = undefined;
	if (!options.tier2) scaffoldingOptions.tier2 = undefined;
	if (!options.tier3) scaffoldingOptions.tier3 = undefined;

	// Add services if specified
	const serviceOptions: Record<string, unknown> = {};
	if (options.services) {
		const serviceNames = options.services.split(",");
		for (const serviceName of serviceNames) {
			serviceOptions[serviceName] = { name };
		}
	}

	const result = await scaffolder.generateWithServices(context, {
		...scaffoldingOptions,
		services: serviceOptions,
	});

	if (result.success) {
		logger.success(`Generated '${name}' successfully`);
		logger.info(`Created ${result.files.length} files`);
	} else {
		logger.error("Generation failed");
		result.errors.forEach((error) => logger.error(error));
		throw new Error("Generation failed");
	}
}

// ===== INTERACTIVE HELPERS =====

async function generateInteractiveProject(
	scaffolder: any,
	context: ScaffoldingContext,
) {
	const options = getDefaultHybridOptions();
	return await scaffolder.generateProject(context, options);
}

async function generateInteractiveComponent(
	scaffolder: any,
	context: ScaffoldingContext,
) {
	const serviceOptions = {
		"component-generator": {
			name: context.projectName,
			type: "functional",
			features: context.features,
		},
	};

	return await scaffolder.generateWithServices(context, {
		services: serviceOptions,
	});
}

async function generateInteractivePage(
	scaffolder: any,
	context: ScaffoldingContext,
) {
	const serviceOptions = {
		"page-generator": {
			name: context.projectName,
			route: `/${context.projectName.toLowerCase()}`,
			layout: "default",
		},
	};

	return await scaffolder.generateWithServices(context, {
		services: serviceOptions,
	});
}

async function runInteractiveTransform(
	scaffolder: any,
	context: ScaffoldingContext,
) {
	const options: HybridScaffoldingOptions = {
		tier2: {
			transformations: [],
			imports: [],
			interfaces: [],
			routes: [],
		},
	};

	return await scaffolder.orchestrate(context, options);
}
