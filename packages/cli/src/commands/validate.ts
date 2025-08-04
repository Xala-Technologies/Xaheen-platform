/**
 * Validate Command - Project Health Check
 *
 * Validates project configuration, checks service health,
 * verifies dependencies, and provides actionable feedback.
 *
 * @author DevOps Expert Agent
 * @since 2025-01-03
 */

import { confirm, intro, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { consola } from "consola";
import * as fs from "fs-extra";
import * as path from "path";
import { ProjectAnalyzer } from "../services/analysis/project-analyzer.js";
import { ServiceRegistry } from "../services/registry/service-registry.js";
import { ProjectValidator } from "../services/validation/project-validator.js";
import { XalaIntegrationService } from "../services/xala-ui/xala-integration-service.js";
import type {
	ValidationIssue,
	ValidationResult,
	XalaValidationResult,
} from "../types/index.js";

export const validateCommand = new Command("validate")
	.description("Validate project configuration and health")
	.option("-f, --fix", "Attempt to fix issues automatically")
	.option("--services", "Validate service configurations")
	.option("--deps", "Validate dependencies")
	.option("--env", "Validate environment variables")
	.option("--lint", "Run linting checks")
	.option("--types", "Run type checking")
	.option("--ui", "Validate Xala UI integration and components")
	.option("--semantic", "Validate semantic architecture compliance")
	.option("--accessibility", "Validate WCAG accessibility compliance")
	.option("--localization", "Validate i18n implementation")
	.option("--compliance", "Validate compliance requirements")
	.option("--all", "Run all validations")
	.action(async (options) => {
		try {
			intro(chalk.cyan("🔍 Validating project"));

			// Initialize services
			const registry = new ServiceRegistry();
			const analyzer = new ProjectAnalyzer();
			const validator = new ProjectValidator(registry);

			await registry.initialize();

			// Analyze project
			const projectPath = process.cwd();
			const s = spinner();
			s.start("Analyzing project...");

			const projectInfo = await analyzer.analyzeProject(projectPath);

			if (!projectInfo.isValid) {
				s.stop("No valid project found");
				consola.error(
					"Could not detect a valid project in the current directory",
				);
				process.exit(1);
			}

			s.stop("Project analyzed");

			// Display project info
			consola.info("\nProject Information:");
			consola.info(`  Name: ${chalk.green(projectInfo.name)}`);
			consola.info(
				`  Framework: ${chalk.green(projectInfo.framework || "Unknown")}`,
			);
			consola.info(
				`  TypeScript: ${projectInfo.typescript ? chalk.green("Yes") : chalk.yellow("No")}`,
			);
			consola.info(
				`  Package Manager: ${chalk.green(projectInfo.packageManager || "npm")}`,
			);

			if (projectInfo.services.length > 0) {
				consola.info(
					`  Services: ${projectInfo.services.map((s) => chalk.blue(s)).join(", ")}`,
				);
			}

			// Determine what to validate
			const validationOptions = {
				validateServices: options.services || options.all,
				validateDependencies: options.deps || options.all,
				validateEnvironment: options.env || options.all,
				validateLinting: options.lint || options.all,
				validateTypes: options.types || options.all,
				validateUI: options.ui || options.all,
				validateSemantic: options.semantic || options.all,
				validateAccessibility: options.accessibility || options.all,
				validateLocalization: options.localization || options.all,
				validateCompliance: options.compliance || options.all,
				autoFix: options.fix,
			};

			// If no specific options, validate everything
			if (
				!options.services &&
				!options.deps &&
				!options.env &&
				!options.lint &&
				!options.types &&
				!options.ui &&
				!options.semantic &&
				!options.accessibility &&
				!options.localization &&
				!options.compliance &&
				!options.all
			) {
				Object.keys(validationOptions).forEach((key) => {
					if (key !== "autoFix") {
						validationOptions[key as keyof typeof validationOptions] = true;
					}
				});
			}

			// Run standard validation
			s.start("Running validations...");

			const result = await validator.validateProject(
				projectPath,
				projectInfo,
				validationOptions,
			);

			s.stop(
				`Standard validation complete: ${result.isValid ? chalk.green("✓") : chalk.red("✗")}`,
			);

			// Run Xala UI validations if requested
			let uiValidationResult = null;
			if (
				validationOptions.validateUI ||
				validationOptions.validateSemantic ||
				validationOptions.validateAccessibility ||
				validationOptions.validateLocalization ||
				validationOptions.validateCompliance
			) {
				uiValidationResult = await runXalaUIValidations(
					projectPath,
					validationOptions,
					options.fix,
				);
			}

			// Display results
			displayValidationResults(result);

			// Display UI validation results if available
			if (uiValidationResult) {
				displayXalaUIValidationResults(uiValidationResult);
			}

			// Handle fixes
			if (!result.isValid && options.fix && result.fixableIssues > 0) {
				const shouldFix = await confirm({
					message: `Found ${result.fixableIssues} fixable issues. Apply fixes?`,
					initialValue: true,
				});

				if (shouldFix) {
					s.start("Applying fixes...");
					const fixResult = await validator.applyFixes(result);
					s.stop(`Applied ${fixResult.fixedCount} fixes`);

					if (fixResult.errors.length > 0) {
						consola.warn("Some fixes could not be applied:");
						fixResult.errors.forEach((err) => consola.error(`  - ${err}`));
					}

					// Re-run validation after fixes
					if (fixResult.fixedCount > 0) {
						consola.info("\nRe-running validation after fixes...");
						const revalidationResult = await validator.validateProject(
							projectPath,
							projectInfo,
							validationOptions,
						);
						displayValidationResults(revalidationResult);
					}
				}
			}

			// Exit code based on validation result
			const allValidationsPassed =
				result.isValid && (!uiValidationResult || uiValidationResult.success);

			if (allValidationsPassed) {
				outro(chalk.green("✨ All validations passed!"));
				process.exit(0);
			} else {
				outro(chalk.yellow("⚠️  Validation completed with issues"));
				process.exit(1);
			}
		} catch (error) {
			consola.error("Validation failed:", error);
			process.exit(1);
		}
	});

function displayValidationResults(result: ValidationResult): void {
	console.log("\n" + chalk.bold("Validation Results:"));
	console.log("─".repeat(50));

	// Summary
	const totalIssues = result.errors.length + result.warnings.length;

	if (result.isValid) {
		console.log(chalk.green("✓ All checks passed"));
	} else {
		console.log(
			chalk.red(`✗ Found ${totalIssues} issue${totalIssues !== 1 ? "s" : ""}`),
		);
	}

	// Group issues by category
	const categories = new Map<string, ValidationIssue[]>();

	[...result.errors, ...result.warnings].forEach((issue) => {
		const existing = categories.get(issue.category) || [];
		existing.push(issue);
		categories.set(issue.category, existing);
	});

	// Display issues by category
	categories.forEach((issues, category) => {
		console.log(`\n${chalk.bold(formatCategoryName(category))}:`);

		issues.forEach((issue) => {
			const icon =
				issue.severity === "error" ? chalk.red("✗") : chalk.yellow("⚠");
			const message = issue.message;
			const location = issue.file
				? chalk.gray(` (${issue.file}${issue.line ? `:${issue.line}` : ""})`)
				: "";

			console.log(`  ${icon} ${message}${location}`);

			if (issue.suggestion) {
				console.log(`    ${chalk.gray("→")} ${chalk.gray(issue.suggestion)}`);
			}
		});
	});

	// Summary statistics
	console.log("\n" + chalk.bold("Summary:"));
	console.log(
		`  Errors: ${result.errors.length > 0 ? chalk.red(result.errors.length) : chalk.green("0")}`,
	);
	console.log(
		`  Warnings: ${result.warnings.length > 0 ? chalk.yellow(result.warnings.length) : chalk.green("0")}`,
	);

	if (result.fixableIssues > 0) {
		console.log(`  Fixable: ${chalk.blue(result.fixableIssues)}`);
	}

	// Performance metrics
	if (result.metrics) {
		console.log("\n" + chalk.bold("Metrics:"));
		if (result.metrics.dependencies) {
			console.log(
				`  Dependencies: ${result.metrics.dependencies.total} (${result.metrics.dependencies.outdated} outdated)`,
			);
		}
		if (result.metrics.bundleSize) {
			console.log(`  Bundle Size: ${formatBytes(result.metrics.bundleSize)}`);
		}
		if (result.metrics.typesCoverage !== undefined) {
			console.log(`  Type Coverage: ${result.metrics.typesCoverage}%`);
		}
	}
}

function formatCategoryName(category: string): string {
	return category
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function formatBytes(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Run Xala UI specific validations
 */
async function runXalaUIValidations(
	projectPath: string,
	validationOptions: any,
	autoFix: boolean,
): Promise<XalaValidationResult | null> {
	const s = spinner();

	try {
		// Check if Xala UI is integrated
		const xalaConfigPath = path.join(projectPath, "xala.config.json");
		if (!(await fs.pathExists(xalaConfigPath))) {
			if (validationOptions.validateUI) {
				consola.warn("🎨 Xala UI is not integrated in this project");
				consola.info("Run 'xaheen add ui-integration' to integrate Xala UI");
			}
			return null;
		}

		s.start("🎨 Running Xala UI validations...");

		const xalaService = new XalaIntegrationService(projectPath);
		const result = await xalaService.validateSemanticCompliance();

		s.stop(
			`UI validation complete: ${result.success ? chalk.green("✓") : chalk.red("✗")}`,
		);

		return result;
	} catch (error) {
		s.stop("UI validation failed");
		consola.error("Failed to run Xala UI validations:", error);
		return {
			success: false,
			issues: [
				{
					type: "error",
					category: "semantic",
					message: `UI validation failed: ${error.message}`,
					file: "unknown",
				},
			],
			score: 0,
			recommendations: ["Fix the underlying error and try again"],
		};
	}
}

/**
 * Display Xala UI validation results
 */
function displayXalaUIValidationResults(result: XalaValidationResult): void {
	console.log("\n" + chalk.bold("🎨 Xala UI Validation Results:"));
	console.log("─".repeat(50));

	// Overall score
	const scoreColor =
		result.score >= 90 ? "green" : result.score >= 70 ? "yellow" : "red";
	console.log(
		`${chalk.bold("Semantic Architecture Score:")} ${chalk[scoreColor](`${result.score}%`)}`,
	);

	if (result.success) {
		console.log(chalk.green("✓ All UI validations passed"));
	} else {
		console.log(
			chalk.red(
				`✗ Found ${result.issues.length} UI issue${result.issues.length !== 1 ? "s" : ""}`,
			),
		);
	}

	// Group issues by category
	const categories = new Map<string, typeof result.issues>();
	result.issues.forEach((issue) => {
		const existing = categories.get(issue.category) || [];
		existing.push(issue);
		categories.set(issue.category, existing);
	});

	// Display issues by category
	categories.forEach((issues, category) => {
		console.log(`\n${chalk.bold(formatCategoryName(category))}:`);

		issues.forEach((issue) => {
			const icon =
				issue.type === "error"
					? chalk.red("✗")
					: issue.type === "warning"
						? chalk.yellow("⚠")
						: chalk.blue("ℹ");
			const message = issue.message;
			const location = issue.file
				? chalk.gray(` (${issue.file}${issue.line ? `:${issue.line}` : ""})`)
				: "";

			console.log(`  ${icon} ${message}${location}`);

			if (issue.fix) {
				console.log(`    ${chalk.gray("→")} ${chalk.gray(issue.fix)}`);
			}
		});
	});

	// Recommendations
	if (result.recommendations.length > 0) {
		console.log("\n" + chalk.bold("🔧 Recommendations:"));
		result.recommendations.forEach((recommendation, index) => {
			console.log(`  ${index + 1}. ${recommendation}`);
		});
	}

	// UI-specific metrics
	console.log("\n" + chalk.bold("📊 UI Metrics:"));
	console.log(
		`  Semantic Compliance: ${chalk[scoreColor](`${result.score}%`)}`,
	);
	console.log(`  Issues Found: ${result.issues.length}`);
	console.log(`  Categories Checked: ${categories.size}`);
}
