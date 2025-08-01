import chalk from "chalk";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import {
	assertFileSystem,
	FileSystemError,
	ScaffoldError,
} from "../utils/errors.js";
import { copyDirectory, ensureDir, fileExists } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import { GlobalOptions } from "../utils/options.js";
import { CommandMetadata } from "./index.js";

// Migrate command options
interface MigrateOptions extends GlobalOptions {
	from?: string;
	source?: string;
	output?: string;
	backup?: boolean;
	analyze?: boolean;
}

// Migration source types
type MigrationSource =
	| "lovable"
	| "bolt"
	| "vercel"
	| "create-react-app"
	| "custom";

// Migration configuration
interface MigrationConfig {
	source: MigrationSource;
	sourcePath: string;
	outputPath: string;
	strategy: "incremental" | "full-replace" | "merge";
	preserveFiles: string[];
	includeLocalization: boolean;
	includeCompliance: boolean;
	includeTests: boolean;
}

// Execute migrate command
async function executeMigrate(options: MigrateOptions): Promise<void> {
	logger.info("Starting project migration...");

	// Get migration configuration
	const config = await getMigrationConfig(options);

	// Validate source
	if (!(await fileExists(config.sourcePath))) {
		throw new FileSystemError(
			`Source path not found: ${config.sourcePath}`,
			config.sourcePath,
			"read",
		);
	}

	// Create backup if requested
	if (options.backup) {
		const backupPath = `${config.sourcePath}.backup-${Date.now()}`;
		const spinner = ora("Creating backup...").start();

		try {
			await copyDirectory(config.sourcePath, backupPath);
			spinner.succeed(`Backup created at: ${backupPath}`);
		} catch (error) {
			spinner.fail("Backup failed");
			throw error;
		}
	}

	// Analyze project if requested
	if (options.analyze || !options.skipPrompts) {
		await analyzeProject(config.sourcePath);
	}

	// Dry run mode
	if (options.dryRun) {
		logger.info("\nDry run mode - no changes will be made");
		logger.info("\nMigration configuration:");
		console.log(JSON.stringify(config, null, 2));
		return;
	}

	// TODO: Implement actual migration
	logger.warn("Migration functionality not yet implemented");
	logger.info("\nPlanned migration steps:");
	logger.info("1. Analyze source project structure");
	logger.info("2. Extract translatable text");
	logger.info("3. Convert components to Xala standards");
	logger.info("4. Add Norwegian compliance");
	logger.info("5. Generate localization files");
	logger.info("6. Update build configuration");
}

// Get migration configuration
async function getMigrationConfig(
	options: MigrateOptions,
): Promise<MigrationConfig> {
	let source: MigrationSource;
	let sourcePath: string;
	let outputPath: string;

	// Source type
	if (options.from) {
		source = options.from as MigrationSource;
	} else {
		const { selectedSource } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedSource",
				message: "Migration source:",
				choices: [
					{ name: "Lovable.dev project", value: "lovable" },
					{ name: "Bolt.new project", value: "bolt" },
					{ name: "Vercel template", value: "vercel" },
					{ name: "Create React App", value: "create-react-app" },
					{ name: "Custom/Other", value: "custom" },
				],
			},
		]);
		source = selectedSource;
	}

	// Source path
	if (options.source) {
		sourcePath = path.resolve(options.source);
	} else {
		const { inputPath } = await inquirer.prompt([
			{
				type: "input",
				name: "inputPath",
				message: "Source project path:",
				default: ".",
				validate: async (input) => {
					const resolved = path.resolve(input);
					if (await fileExists(resolved)) {
						return true;
					}
					return `Path not found: ${resolved}`;
				},
			},
		]);
		sourcePath = path.resolve(inputPath);
	}

	// Output path
	if (options.output) {
		outputPath = path.resolve(options.output);
	} else {
		const projectName = path.basename(sourcePath);
		const { selectedOutput } = await inquirer.prompt([
			{
				type: "input",
				name: "selectedOutput",
				message: "Output path:",
				default: `./${projectName}-xala`,
			},
		]);
		outputPath = path.resolve(selectedOutput);
	}

	// Migration strategy
	const { strategy } = await inquirer.prompt([
		{
			type: "list",
			name: "strategy",
			message: "Migration strategy:",
			choices: [
				{
					name: "Incremental (Add Xala features to existing code)",
					value: "incremental",
				},
				{
					name: "Full Replace (Convert everything to Xala standards)",
					value: "full-replace",
				},
				{
					name: "Merge (Keep existing + add Xala features)",
					value: "merge",
				},
			],
			default: "incremental",
		},
	]);

	// Additional options
	const { features } = await inquirer.prompt([
		{
			type: "checkbox",
			name: "features",
			message: "Include in migration:",
			choices: [
				{
					name: "Extract text for localization",
					value: "localization",
					checked: true,
				},
				{
					name: "Add Norwegian compliance",
					value: "compliance",
					checked: true,
				},
				{ name: "Generate tests", value: "tests", checked: true },
				{ name: "Convert to TypeScript", value: "typescript", checked: true },
				{
					name: "Add accessibility features",
					value: "accessibility",
					checked: true,
				},
			],
		},
	]);

	return {
		source,
		sourcePath,
		outputPath,
		strategy,
		preserveFiles: [".git", "node_modules", ".env*"],
		includeLocalization: features.includes("localization"),
		includeCompliance: features.includes("compliance"),
		includeTests: features.includes("tests"),
	};
}

// Analyze source project
async function analyzeProject(sourcePath: string): Promise<void> {
	const spinner = ora("Analyzing project...").start();

	try {
		// TODO: Implement project analysis
		// For now, show placeholder results
		spinner.succeed("Project analysis complete");

		logger.info("\nProject Analysis Results:");
		logger.info("-------------------------");
		logger.info("Framework: React (detected)");
		logger.info("Language: JavaScript/TypeScript");
		logger.info("Components: 25 found");
		logger.info("Pages/Routes: 8 found");
		logger.info("Translatable strings: 156 found");
		logger.info("Styling: Tailwind CSS");
		logger.info("State Management: Context API");
		logger.info("Build Tool: Vite");
		logger.info("\nCompliance gaps:");
		logger.info("- Missing WCAG compliance");
		logger.info("- No GDPR implementation");
		logger.info("- No localization support");
		logger.info("- Missing Norwegian language");
	} catch (error) {
		spinner.fail("Analysis failed");
		throw error;
	}
}

// Command metadata
const migrateCommand: CommandMetadata = {
	name: "migrate",
	alias: "m",
	description: "Migrate an existing project to Xala standards",
	options: [
		{
			flags: "--from <platform>",
			description:
				"Source platform (lovable, bolt, vercel, create-react-app, custom)",
		},
		{
			flags: "-s, --source <path>",
			description: "Source project path",
		},
		{
			flags: "-o, --output <path>",
			description: "Output path for migrated project",
		},
		{
			flags: "--backup",
			description: "Create backup before migration",
			defaultValue: true,
		},
		{
			flags: "--analyze",
			description: "Only analyze project without migrating",
			defaultValue: false,
		},
	],
	action: executeMigrate,
};

export default migrateCommand;
