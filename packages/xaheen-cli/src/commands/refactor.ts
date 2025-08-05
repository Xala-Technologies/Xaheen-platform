/**
 * AI-Powered Refactoring Command
 * Interactive code refactoring with AI suggestions and preview
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import chalk from "chalk";
import { Command } from "commander";
import { existsSync } from "fs";
import inquirer from "inquirer";
import { join } from "path";
import {
	createRefactoringAssistant,
	RefactoringSuggestion,
} from "../services/ai/refactoring-assistant.js";
import { logger } from "../utils/logger.js";
import { validateProject } from "../utils/project-validator.js";

/**
 * Refactor command options interface
 */
interface RefactorOptions {
	readonly file?: string;
	readonly type?: string;
	readonly interactive?: boolean;
	readonly preview?: boolean;
	readonly report?: boolean;
	readonly confidence?: number;
	readonly dryRun?: boolean;
}

/**
 * Create refactor command
 */
export function createRefactorCommand(): Command {
	const command = new Command("refactor");

	command
		.description("AI-powered code refactoring assistant")
		.option("-f, --file <path>", "Target file for refactoring")
		.option(
			"-t, --type <type>",
			"Refactoring type (extract-function, rename-variable, simplify-condition, remove-duplication, optimize-imports)",
		)
		.option("-i, --interactive", "Interactive mode with previews", true)
		.option("-p, --preview", "Preview suggestions without applying")
		.option("-r, --report", "Generate accuracy report")
		.option(
			"-c, --confidence <number>",
			"Minimum confidence threshold (0-1)",
			"0.5",
		)
		.option("--dry-run", "Show what would be refactored without making changes")
		.action(async (options: RefactorOptions) => {
			await handleRefactorCommand(options);
		});

	return command;
}

/**
 * Handle refactor command execution
 */
async function handleRefactorCommand(options: RefactorOptions): Promise<void> {
	try {
		const projectPath = process.cwd();

		// Validate project
		const validation = await validateProject(projectPath);
		if (!validation.isValid) {
			logger.error("Invalid project structure:", validation.errors.join(", "));
			process.exit(1);
		}

		const assistant = createRefactoringAssistant(projectPath);

		// Handle report generation
		if (options.report) {
			await generateAccuracyReport(assistant);
			return;
		}

		// Handle file-specific refactoring
		if (options.file) {
			await refactorFile(assistant, options);
			return;
		}

		// Interactive mode - discover files to refactor
		await interactiveRefactoring(assistant, options);
	} catch (error) {
		logger.error("Refactoring failed:", error);
		process.exit(1);
	}
}

/**
 * Generate and display accuracy report
 */
async function generateAccuracyReport(assistant: any): Promise<void> {
	logger.info("Generating AI refactoring accuracy report...");

	const report = await assistant.generateAccuracyReport();
	console.log(chalk.cyan(report));
}

/**
 * Refactor specific file
 */
async function refactorFile(
	assistant: any,
	options: RefactorOptions,
): Promise<void> {
	const filePath = options.file!;
	const fullPath = join(process.cwd(), filePath);

	if (!existsSync(fullPath)) {
		logger.error(`File not found: ${filePath}`);
		process.exit(1);
	}

	logger.info(`Analyzing ${filePath} for refactoring opportunities...`);

	const suggestions = await assistant.generateSuggestions(filePath);

	if (suggestions.length === 0) {
		logger.info(
			chalk.green(`No refactoring suggestions found for ${filePath}`),
		);
		return;
	}

	// Filter by confidence threshold
	const confidenceThreshold = parseFloat(options.confidence || "0.5");
	const filteredSuggestions = suggestions.filter(
		(s) => s.confidence >= confidenceThreshold,
	);

	if (filteredSuggestions.length === 0) {
		logger.info(
			chalk.yellow(
				`No suggestions meet confidence threshold of ${confidenceThreshold}`,
			),
		);
		return;
	}

	// Filter by type if specified
	const typedSuggestions = options.type
		? filteredSuggestions.filter((s) => s.type === options.type)
		: filteredSuggestions;

	if (typedSuggestions.length === 0) {
		logger.info(chalk.yellow(`No suggestions found for type: ${options.type}`));
		return;
	}

	logger.info(
		chalk.cyan(`Found ${typedSuggestions.length} refactoring suggestions:`),
	);

	// Display suggestions
	for (const suggestion of typedSuggestions) {
		console.log(chalk.blue(`\n${suggestion.title}`));
		console.log(chalk.gray(`  Type: ${suggestion.type}`));
		console.log(chalk.gray(`  Impact: ${suggestion.impact}`));
		console.log(
			chalk.gray(`  Confidence: ${(suggestion.confidence * 100).toFixed(1)}%`),
		);
		console.log(
			chalk.gray(`  Lines: ${suggestion.startLine}-${suggestion.endLine}`),
		);
		console.log(chalk.gray(`  Description: ${suggestion.description}`));
	}

	// Preview mode - show suggestions without applying
	if (options.preview || options.dryRun) {
		for (const suggestion of typedSuggestions) {
			const preview = await assistant.previewRefactoring(suggestion);
			console.log(chalk.yellow(preview));
		}
		return;
	}

	// Apply refactorings
	const result = await assistant.applyRefactorings(
		typedSuggestions,
		options.interactive,
	);

	// Display results
	console.log(chalk.green(`\nRefactoring complete!`));
	console.log(
		chalk.green(`Applied: ${result.appliedSuggestions.length} suggestions`),
	);
	console.log(
		chalk.yellow(`Rejected: ${result.rejectedSuggestions.length} suggestions`),
	);

	if (result.errors.length > 0) {
		console.log(chalk.red(`Errors: ${result.errors.length}`));
		result.errors.forEach((error) => console.log(chalk.red(`  - ${error}`)));
	}

	if (result.gitCommitHash) {
		console.log(chalk.blue(`Git commit: ${result.gitCommitHash}`));
	}
}

/**
 * Interactive refactoring mode
 */
async function interactiveRefactoring(
	assistant: any,
	options: RefactorOptions,
): Promise<void> {
	logger.info("Starting interactive refactoring mode...");

	// Discover TypeScript/JavaScript files
	const files = await discoverRefactorableFiles();

	if (files.length === 0) {
		logger.info("No refactorable files found in the project.");
		return;
	}

	// Let user select files to analyze
	const { selectedFiles } = await inquirer.prompt([
		{
			type: "checkbox",
			name: "selectedFiles",
			message: "Select files to analyze for refactoring:",
			choices: files.map((file) => ({ name: file, value: file })),
			pageSize: 10,
		},
	]);

	if (selectedFiles.length === 0) {
		logger.info("No files selected for refactoring.");
		return;
	}

	// Analyze selected files
	const allSuggestions: RefactoringSuggestion[] = [];

	for (const file of selectedFiles) {
		logger.info(`Analyzing ${file}...`);
		const suggestions = await assistant.generateSuggestions(file);
		allSuggestions.push(...suggestions);
	}

	if (allSuggestions.length === 0) {
		logger.info(chalk.green("No refactoring suggestions found!"));
		return;
	}

	// Filter by confidence
	const confidenceThreshold = parseFloat(options.confidence || "0.5");
	const filteredSuggestions = allSuggestions.filter(
		(s) => s.confidence >= confidenceThreshold,
	);

	logger.info(
		chalk.cyan(`Found ${filteredSuggestions.length} refactoring suggestions:`),
	);

	// Group suggestions by type
	const suggestionsByType = groupSuggestionsByType(filteredSuggestions);

	// Display summary
	for (const [type, suggestions] of Object.entries(suggestionsByType)) {
		console.log(chalk.blue(`${type}: ${suggestions.length} suggestions`));
	}

	// Let user select which types to apply
	const { selectedTypes } = await inquirer.prompt([
		{
			type: "checkbox",
			name: "selectedTypes",
			message: "Select refactoring types to apply:",
			choices: Object.keys(suggestionsByType).map((type) => ({
				name: `${type} (${suggestionsByType[type].length} suggestions)`,
				value: type,
			})),
		},
	]);

	if (selectedTypes.length === 0) {
		logger.info("No refactoring types selected.");
		return;
	}

	// Collect suggestions for selected types
	const selectedSuggestions = selectedTypes.flatMap(
		(type: string) => suggestionsByType[type],
	);

	// Preview mode
	if (options.preview || options.dryRun) {
		for (const suggestion of selectedSuggestions) {
			const preview = await assistant.previewRefactoring(suggestion);
			console.log(chalk.yellow(preview));
		}
		return;
	}

	// Confirm application
	const { confirmApply } = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirmApply",
			message: `Apply ${selectedSuggestions.length} refactoring suggestions?`,
			default: false,
		},
	]);

	if (!confirmApply) {
		logger.info("Refactoring cancelled.");
		return;
	}

	// Apply refactorings
	const result = await assistant.applyRefactorings(
		selectedSuggestions,
		options.interactive,
	);

	// Display results
	console.log(chalk.green(`\nRefactoring complete!`));
	console.log(
		chalk.green(`Applied: ${result.appliedSuggestions.length} suggestions`),
	);
	console.log(
		chalk.yellow(`Rejected: ${result.rejectedSuggestions.length} suggestions`),
	);

	if (result.errors.length > 0) {
		console.log(chalk.red(`Errors: ${result.errors.length}`));
		result.errors.forEach((error) => console.log(chalk.red(`  - ${error}`)));
	}

	if (result.gitCommitHash) {
		console.log(chalk.blue(`Git commit: ${result.gitCommitHash}`));
	}

	// Suggest next steps
	console.log(chalk.cyan("\nNext steps:"));
	console.log(chalk.cyan("- Run tests to ensure refactorings are correct"));
	console.log(chalk.cyan("- Review the changes in your Git diff"));
	console.log(
		chalk.cyan("- Generate accuracy report with: xaheen refactor --report"),
	);
}

/**
 * Discover refactorable files in the project
 */
async function discoverRefactorableFiles(): Promise<string[]> {
	const { glob } = await import("glob");

	const patterns = [
		"src/**/*.ts",
		"src/**/*.tsx",
		"src/**/*.js",
		"src/**/*.jsx",
		"lib/**/*.ts",
		"lib/**/*.js",
		"*.ts",
		"*.js",
	];

	const files: string[] = [];

	for (const pattern of patterns) {
		try {
			const matches = await glob(pattern, {
				ignore: ["node_modules/**", "dist/**", "build/**"],
			});
			files.push(...matches);
		} catch (error) {
			// Ignore glob errors
		}
	}

	// Remove duplicates and sort
	return [...new Set(files)].sort();
}

/**
 * Group suggestions by type
 */
function groupSuggestionsByType(
	suggestions: RefactoringSuggestion[],
): Record<string, RefactoringSuggestion[]> {
	const groups: Record<string, RefactoringSuggestion[]> = {};

	for (const suggestion of suggestions) {
		if (!groups[suggestion.type]) {
			groups[suggestion.type] = [];
		}
		groups[suggestion.type].push(suggestion);
	}

	return groups;
}

/**
 * Default export
 */
export default createRefactorCommand;
