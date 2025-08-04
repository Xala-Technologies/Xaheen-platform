/**
 * @fileoverview Migrate Command - Codebase analysis and conversion
 * @description Analyzes existing code and converts it to Xala UI system
 */

import chalk from "chalk";
import { Command } from "commander";
import { existsSync } from "fs";
import fs from "fs/promises";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";

interface MigrationAnalysis {
	file: string;
	type: "component" | "page" | "layout" | "unknown";
	framework: "react" | "vue" | "angular" | "unknown";
	issues: MigrationIssue[];
	recommendations: MigrationRecommendation[];
	complexity: "simple" | "moderate" | "complex";
	compatibility: number; // 0-100 score
	estimatedEffort: string;
}

interface MigrationIssue {
	type: "error" | "warning" | "info";
	category:
		| "styling"
		| "structure"
		| "accessibility"
		| "performance"
		| "compliance";
	message: string;
	line?: number;
	column?: number;
	suggestion?: string;
	autoFixable?: boolean;
}

interface MigrationRecommendation {
	priority: "high" | "medium" | "low";
	action: string;
	description: string;
	before?: string;
	after?: string;
	effort: "easy" | "moderate" | "complex";
}

interface ConversionOptions {
	dryRun?: boolean;
	backup?: boolean;
	force?: boolean;
	interactive?: boolean;
	output?: string;
	format?: "typescript" | "javascript";
	platform?: "react" | "vue" | "angular";
}

export const migrate = new Command("migrate").description(
	"Analyze and convert existing code to Xala UI system",
);

// Analyze command
migrate
	.command("analyze")
	.description("Analyze existing code for migration compatibility")
	.argument("[file]", "File or directory to analyze")
	.option("-r, --recursive", "Analyze directory recursively")
	.option(
		"-f, --format <format>",
		"Output format (json, table, detailed)",
		"table",
	)
	.option("-o, --output <file>", "Save report to file")
	.option("--include-examples", "Include conversion examples in report")
	.action(async (file, options) => {
		try {
			const targetPath = file || process.cwd();
			console.log(
				chalk.blue(
					`\n🔍 Analyzing ${targetPath} for migration compatibility...\n`,
				),
			);

			const analysis = await analyzeForMigration(targetPath, options);
			await displayAnalysisResults(analysis, options);

			if (options.output) {
				await saveAnalysisReport(analysis, options.output, options.format);
				console.log(chalk.green(`\n📄 Report saved to ${options.output}`));
			}
		} catch (error) {
			console.error(
				chalk.red("\n❌ Analysis failed:"),
				error instanceof Error ? error.message : String(error),
			);
			process.exit(1);
		}
	});

// Convert command
migrate
	.command("convert")
	.description("Convert existing code to Xala UI system")
	.argument("<file>", "File to convert")
	.option("-d, --dry-run", "Show what would be changed without making changes")
	.option("-b, --backup", "Create backup before conversion")
	.option("-f, --force", "Force conversion even with warnings")
	.option("-i, --interactive", "Interactive conversion with prompts")
	.option("-o, --output <file>", "Output file (default: overwrite original)")
	.option(
		"--format <format>",
		"Output format (typescript, javascript)",
		"typescript",
	)
	.option(
		"-p, --platform <platform>",
		"Target platform (react, vue, angular)",
		"react",
	)
	.action(async (file, options: ConversionOptions) => {
		try {
			console.log(chalk.blue(`\n🔄 Converting ${file} to Xala UI system...\n`));

			const result = await convertToUISystem(file, options);
			await displayConversionResults(result, options);
		} catch (error) {
			console.error(
				chalk.red("\n❌ Conversion failed:"),
				error instanceof Error ? error.message : String(error),
			);
			process.exit(1);
		}
	});

// Check command for quick compatibility checks
migrate
	.command("check")
	.description("Quick compatibility check for a component or page")
	.argument("<file>", "File to check")
	.option("-v, --verbose", "Detailed output")
	.option("--fix-suggestions", "Show specific fix suggestions")
	.action(async (file, options) => {
		try {
			console.log(
				chalk.blue(`\n⚡ Quick compatibility check for ${file}...\n`),
			);

			const check = await quickCompatibilityCheck(file, options);
			await displayQuickCheckResults(check, options);
		} catch (error) {
			console.error(
				chalk.red("\n❌ Check failed:"),
				error instanceof Error ? error.message : String(error),
			);
			process.exit(1);
		}
	});

async function analyzeForMigration(
	targetPath: string,
	options: any,
): Promise<MigrationAnalysis[]> {
	const spinner = ora("Analyzing files...").start();

	try {
		const filesToAnalyze = await getFilesToAnalyze(
			targetPath,
			options.recursive,
		);
		const analyses: MigrationAnalysis[] = [];

		for (const file of filesToAnalyze) {
			const analysis = await analyzeFile(file, options);
			if (analysis) {
				analyses.push(analysis);
			}
		}

		spinner.succeed(`Analyzed ${analyses.length} files`);
		return analyses;
	} catch (error) {
		spinner.fail("Analysis failed");
		throw error;
	}
}

async function getFilesToAnalyze(
	targetPath: string,
	recursive: boolean,
): Promise<string[]> {
	const files: string[] = [];
	const extensions = [".tsx", ".ts", ".jsx", ".js", ".vue"];

	if (!existsSync(targetPath)) {
		throw new Error(`Path does not exist: ${targetPath}`);
	}

	const stat = await fs.stat(targetPath);

	if (stat.isFile()) {
		if (extensions.some((ext) => targetPath.endsWith(ext))) {
			files.push(targetPath);
		}
	} else if (stat.isDirectory()) {
		const items = await fs.readdir(targetPath);

		for (const item of items) {
			const itemPath = path.join(targetPath, item);
			const itemStat = await fs.stat(itemPath);

			if (itemStat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
				files.push(itemPath);
			} else if (itemStat.isDirectory() && recursive) {
				const subFiles = await getFilesToAnalyze(itemPath, recursive);
				files.push(...subFiles);
			}
		}
	}

	return files;
}

async function analyzeFile(
	filePath: string,
	options: any,
): Promise<MigrationAnalysis | null> {
	try {
		const content = await fs.readFile(filePath, "utf-8");
		const analysis = await performFileAnalysis(filePath, content, options);
		return analysis;
	} catch (error) {
		console.warn(
			chalk.yellow(
				`Warning: Could not analyze ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
			),
		);
		return null;
	}
}

async function performFileAnalysis(
	filePath: string,
	content: string,
	options: any,
): Promise<MigrationAnalysis> {
	const analysis: MigrationAnalysis = {
		file: filePath,
		type: detectFileType(content, filePath),
		framework: detectFramework(content, filePath),
		issues: [],
		recommendations: [],
		complexity: "simple",
		compatibility: 100,
		estimatedEffort: "< 1 hour",
	};

	// Analyze styling issues
	analysis.issues.push(...analyzeStylingIssues(content));

	// Analyze structure issues
	analysis.issues.push(...analyzeStructureIssues(content));

	// Analyze accessibility issues
	analysis.issues.push(...analyzeAccessibilityIssues(content));

	// Analyze performance issues
	analysis.issues.push(...analyzePerformanceIssues(content));

	// Analyze compliance issues
	analysis.issues.push(...analyzeComplianceIssues(content));

	// Generate recommendations
	analysis.recommendations = generateRecommendations(analysis.issues, content);

	// Calculate complexity and compatibility
	analysis.complexity = calculateComplexity(analysis.issues);
	analysis.compatibility = calculateCompatibility(analysis.issues);
	analysis.estimatedEffort = estimateEffort(
		analysis.complexity,
		analysis.issues.length,
	);

	return analysis;
}

function detectFileType(
	content: string,
	filePath: string,
): MigrationAnalysis["type"] {
	const fileName = path.basename(filePath).toLowerCase();

	// Check file naming conventions
	if (fileName.includes("page") || fileName.includes("route")) return "page";
	if (fileName.includes("layout")) return "layout";

	// Check content patterns
	if (
		content.includes("export default function") ||
		content.includes("export const")
	) {
		if (content.includes("return (") && content.includes("<")) {
			return "component";
		}
	}

	if (content.includes("<template>") || content.includes("<script setup>")) {
		return "component";
	}

	return "unknown";
}

function detectFramework(
	content: string,
	filePath: string,
): MigrationAnalysis["framework"] {
	if (filePath.endsWith(".vue")) return "vue";
	if (
		content.includes("@Component") ||
		content.includes("import { Component }")
	)
		return "angular";
	if (content.includes("import React") || content.includes('from "react"'))
		return "react";

	return "unknown";
}

function analyzeStylingIssues(content: string): MigrationIssue[] {
	const issues: MigrationIssue[] = [];

	// Check for inline styles
	if (content.includes("style={{") || content.includes('style="{')) {
		issues.push({
			type: "warning",
			category: "styling",
			message: "Inline styles detected - should use Tailwind CSS classes",
			suggestion: "Replace inline styles with Tailwind utility classes",
			autoFixable: true,
		});
	}

	// Check for CSS modules or styled-components
	if (content.includes("styled.") || content.includes("css`")) {
		issues.push({
			type: "warning",
			category: "styling",
			message: "CSS-in-JS detected - consider migrating to Tailwind CSS",
			suggestion: "Convert styled-components to Tailwind utility classes",
			autoFixable: false,
		});
	}

	// Check for custom CSS classes
	const classNameMatches = content.match(/className=['"](.*?)['"]/g);
	if (classNameMatches) {
		for (const match of classNameMatches) {
			const className = match.match(/className=['"](.*?)['"]/)?.[1];
			if (className && !isTailwindClass(className)) {
				issues.push({
					type: "info",
					category: "styling",
					message: `Custom CSS class detected: ${className}`,
					suggestion: "Consider replacing with Tailwind utility classes",
					autoFixable: false,
				});
			}
		}
	}

	// Check for hardcoded colors
	const colorMatches = content.match(
		/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\(.*?\)|rgba\(.*?\)/g,
	);
	if (colorMatches) {
		issues.push({
			type: "warning",
			category: "styling",
			message: "Hardcoded colors detected",
			suggestion: "Use design tokens from the theme system",
			autoFixable: true,
		});
	}

	return issues;
}

function analyzeStructureIssues(content: string): MigrationIssue[] {
	const issues: MigrationIssue[] = [];

	// Check for missing TypeScript
	if (!content.includes("interface ") && !content.includes("type ")) {
		issues.push({
			type: "warning",
			category: "structure",
			message: "No TypeScript interfaces detected",
			suggestion: "Add proper TypeScript interfaces for props",
			autoFixable: true,
		});
	}

	// Check for missing forwardRef
	if (content.includes("export const") && !content.includes("forwardRef")) {
		issues.push({
			type: "info",
			category: "structure",
			message: "Component not using forwardRef",
			suggestion: "Consider using forwardRef for better ref handling",
			autoFixable: true,
		});
	}

	// Check for hooks in components (v5.0 violation)
	const hookPatterns = [
		"useState",
		"useEffect",
		"useCallback",
		"useMemo",
		"useTokens",
	];
	for (const hook of hookPatterns) {
		if (content.includes(hook)) {
			issues.push({
				type: "error",
				category: "structure",
				message: `Hook ${hook} detected in component - violates v5.0 pure component architecture`,
				suggestion: "Move state management to parent component or provider",
				autoFixable: false,
			});
		}
	}

	// Check for missing CVA usage
	if (
		content.includes("className") &&
		!content.includes("cva") &&
		!content.includes("class-variance-authority")
	) {
		issues.push({
			type: "info",
			category: "structure",
			message: "Not using CVA for variant management",
			suggestion:
				"Consider using class-variance-authority for consistent styling variants",
			autoFixable: false,
		});
	}

	return issues;
}

function analyzeAccessibilityIssues(content: string): MigrationIssue[] {
	const issues: MigrationIssue[] = [];

	// Check for missing ARIA labels
	const interactiveElements = ["button", "input", "select", "textarea"];
	for (const element of interactiveElements) {
		const elementRegex = new RegExp(`<${element}[^>]*>`, "g");
		const matches = content.match(elementRegex);
		if (matches) {
			for (const match of matches) {
				if (
					!match.includes("aria-label") &&
					!match.includes("aria-labelledby")
				) {
					issues.push({
						type: "warning",
						category: "accessibility",
						message: `${element} missing ARIA label`,
						suggestion: "Add aria-label or aria-labelledby attribute",
						autoFixable: true,
					});
				}
			}
		}
	}

	// Check for missing alt text on images
	if (content.includes("<img") && !content.includes("alt=")) {
		issues.push({
			type: "error",
			category: "accessibility",
			message: "Images missing alt text",
			suggestion: "Add descriptive alt text to all images",
			autoFixable: true,
		});
	}

	// Check for proper heading hierarchy
	const headingMatches = content.match(/<h[1-6]/g);
	if (headingMatches && headingMatches.length > 1) {
		// Simple check - could be enhanced
		issues.push({
			type: "info",
			category: "accessibility",
			message: "Multiple headings detected - verify proper hierarchy",
			suggestion:
				"Ensure heading levels follow proper hierarchy (h1 -> h2 -> h3)",
			autoFixable: false,
		});
	}

	return issues;
}

function analyzePerformanceIssues(content: string): MigrationIssue[] {
	const issues: MigrationIssue[] = [];

	// Check for large inline objects
	if (content.includes("style={{") && content.match(/\{[\s\S]{100,}\}/)) {
		issues.push({
			type: "warning",
			category: "performance",
			message: "Large inline objects detected",
			suggestion: "Extract large objects to avoid re-creation on each render",
			autoFixable: true,
		});
	}

	// Check for missing React.memo
	if (
		content.includes("export const") &&
		!content.includes("React.memo") &&
		!content.includes("memo(")
	) {
		issues.push({
			type: "info",
			category: "performance",
			message: "Component not memoized",
			suggestion: "Consider using React.memo for performance optimization",
			autoFixable: true,
		});
	}

	return issues;
}

function analyzeComplianceIssues(content: string): MigrationIssue[] {
	const issues: MigrationIssue[] = [];

	// Check for any type usage
	if (content.includes(": any") || content.includes("<any>")) {
		issues.push({
			type: "error",
			category: "compliance",
			message: 'TypeScript "any" type detected',
			suggestion: 'Replace "any" with specific types for better type safety',
			autoFixable: false,
		});
	}

	// Check for missing data-testid
	if (content.includes("export const") && !content.includes("data-testid")) {
		issues.push({
			type: "info",
			category: "compliance",
			message: "Missing test identifiers",
			suggestion: "Add data-testid attributes for better testing",
			autoFixable: true,
		});
	}

	return issues;
}

function generateRecommendations(
	issues: MigrationIssue[],
	content: string,
): MigrationRecommendation[] {
	const recommendations: MigrationRecommendation[] = [];

	// Group issues by category
	const issuesByCategory = issues.reduce(
		(acc, issue) => {
			if (!acc[issue.category]) acc[issue.category] = [];
			acc[issue.category]!.push(issue);
			return acc;
		},
		{} as Record<string, MigrationIssue[]>,
	);

	// Generate category-specific recommendations
	if (issuesByCategory.styling && issuesByCategory.styling.length > 0) {
		recommendations.push({
			priority: "high",
			action: "Migrate to Tailwind CSS",
			description:
				"Replace custom styles with Tailwind utility classes and design tokens",
			effort: "moderate",
		});
	}

	if (issuesByCategory.structure && issuesByCategory.structure.length > 0) {
		recommendations.push({
			priority: "high",
			action: "Update component architecture",
			description: "Convert to v5.0 pure component pattern with CVA",
			effort: "complex",
		});
	}

	if (
		issuesByCategory.accessibility &&
		issuesByCategory.accessibility.length > 0
	) {
		recommendations.push({
			priority: "high",
			action: "Fix accessibility issues",
			description: "Add missing ARIA labels and ensure WCAG AAA compliance",
			effort: "easy",
		});
	}

	if (issuesByCategory.compliance && issuesByCategory.compliance.length > 0) {
		recommendations.push({
			priority: "medium",
			action: "Improve TypeScript compliance",
			description: "Replace any types and add proper interfaces",
			effort: "moderate",
		});
	}

	return recommendations;
}

function calculateComplexity(
	issues: MigrationIssue[],
): "simple" | "moderate" | "complex" {
	const errorCount = issues.filter((i) => i.type === "error").length;
	const warningCount = issues.filter((i) => i.type === "warning").length;

	if (errorCount > 5 || warningCount > 10) return "complex";
	if (errorCount > 2 || warningCount > 5) return "moderate";
	return "simple";
}

function calculateCompatibility(issues: MigrationIssue[]): number {
	let score = 100;

	for (const issue of issues) {
		switch (issue.type) {
			case "error":
				score -= 15;
				break;
			case "warning":
				score -= 8;
				break;
			case "info":
				score -= 3;
				break;
		}
	}

	return Math.max(0, score);
}

function estimateEffort(complexity: string, issueCount: number): string {
	if (complexity === "complex" || issueCount > 15) return "1-2 days";
	if (complexity === "moderate" || issueCount > 8) return "4-6 hours";
	return "< 1 hour";
}

function isTailwindClass(className: string): boolean {
	// Basic check for common Tailwind patterns
	const tailwindPatterns = [
		/^(p|m|w|h|text|bg|border|flex|grid|space|gap|rounded|shadow)-/,
		/^(block|inline|hidden|visible|absolute|relative|fixed|sticky)$/,
		/^(justify|items|content|self|place)-(start|end|center|between|around|evenly|stretch|auto)$/,
		/^(sm|md|lg|xl|2xl):/,
	];

	return tailwindPatterns.some((pattern) => pattern.test(className));
}

async function displayAnalysisResults(
	analyses: MigrationAnalysis[],
	options: any,
) {
	if (options.format === "json") {
		console.log(JSON.stringify(analyses, null, 2));
		return;
	}

	console.log(chalk.cyan("\n📋 Migration Analysis Results\n"));

	// Summary
	const totalFiles = analyses.length;
	const avgCompatibility =
		analyses.reduce((sum, a) => sum + a.compatibility, 0) / totalFiles;
	const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);

	console.log(`${chalk.bold("Files analyzed:")} ${totalFiles}`);
	console.log(
		`${chalk.bold("Average compatibility:")} ${getCompatibilityColor(avgCompatibility)}${avgCompatibility.toFixed(1)}%${chalk.reset()}`,
	);
	console.log(`${chalk.bold("Total issues:")} ${totalIssues}\n`);

	// Detailed results
	for (const analysis of analyses) {
		console.log(chalk.blue(`📄 ${analysis.file}`));
		console.log(`   Type: ${analysis.type} | Framework: ${analysis.framework}`);
		console.log(
			`   Compatibility: ${getCompatibilityColor(analysis.compatibility)}${analysis.compatibility}%${chalk.reset()}`,
		);
		console.log(
			`   Complexity: ${getComplexityColor(analysis.complexity)}${analysis.complexity}${chalk.reset()}`,
		);
		console.log(`   Estimated effort: ${analysis.estimatedEffort}`);

		if (analysis.issues.length > 0) {
			console.log(chalk.yellow("   Issues:"));
			for (const issue of analysis.issues.slice(0, 3)) {
				// Show first 3 issues
				const icon =
					issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
				console.log(`     ${icon} ${issue.message}`);
			}
			if (analysis.issues.length > 3) {
				console.log(
					chalk.gray(`     ... and ${analysis.issues.length - 3} more issues`),
				);
			}
		}

		if (options.includeExamples && analysis.recommendations.length > 0) {
			console.log(chalk.green("   Top recommendation:"));
			const topRec = analysis.recommendations[0];
			if (topRec) {
				console.log(`     ${topRec.action} (${topRec.effort})`);
				console.log(`     ${topRec.description}`);
			}
		}

		console.log();
	}
}

function getCompatibilityColor(score: number): (str: string) => string {
	if (score >= 80) return chalk.green.bold;
	if (score >= 60) return chalk.yellow.bold;
	return chalk.red.bold;
}

function getComplexityColor(complexity: string): (str: string) => string {
	switch (complexity) {
		case "simple":
			return chalk.green;
		case "moderate":
			return chalk.yellow;
		case "complex":
			return chalk.red;
		default:
			return chalk.gray;
	}
}

async function saveAnalysisReport(
	analyses: MigrationAnalysis[],
	outputPath: string,
	format: string,
) {
	let content: string;

	switch (format) {
		case "json":
			content = JSON.stringify(analyses, null, 2);
			break;
		case "detailed":
			content = generateDetailedReport(analyses);
			break;
		default:
			content = generateTableReport(analyses);
	}

	await fs.writeFile(outputPath, content);
}

function generateDetailedReport(analyses: MigrationAnalysis[]): string {
	let report = "# Migration Analysis Report\n\n";

	// Summary
	const totalFiles = analyses.length;
	const avgCompatibility =
		analyses.reduce((sum, a) => sum + a.compatibility, 0) / totalFiles;
	const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);

	report += `## Summary\n\n`;
	report += `- **Files analyzed:** ${totalFiles}\n`;
	report += `- **Average compatibility:** ${avgCompatibility.toFixed(1)}%\n`;
	report += `- **Total issues:** ${totalIssues}\n\n`;

	// Detailed analysis
	report += `## Detailed Analysis\n\n`;

	for (const analysis of analyses) {
		report += `### ${analysis.file}\n\n`;
		report += `- **Type:** ${analysis.type}\n`;
		report += `- **Framework:** ${analysis.framework}\n`;
		report += `- **Compatibility:** ${analysis.compatibility}%\n`;
		report += `- **Complexity:** ${analysis.complexity}\n`;
		report += `- **Estimated effort:** ${analysis.estimatedEffort}\n\n`;

		if (analysis.issues.length > 0) {
			report += `#### Issues (${analysis.issues.length})\n\n`;
			for (const issue of analysis.issues) {
				const icon =
					issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
				report += `${icon} **${issue.category}**: ${issue.message}\n`;
				if (issue.suggestion) {
					report += `   *Suggestion: ${issue.suggestion}*\n`;
				}
				report += "\n";
			}
		}

		if (analysis.recommendations.length > 0) {
			report += `#### Recommendations\n\n`;
			for (const rec of analysis.recommendations) {
				report += `- **${rec.action}** (${rec.priority} priority, ${rec.effort} effort)\n`;
				report += `  ${rec.description}\n\n`;
			}
		}

		report += "---\n\n";
	}

	return report;
}

function generateTableReport(analyses: MigrationAnalysis[]): string {
	let report =
		"File\tType\tFramework\tCompatibility\tComplexity\tIssues\tEffort\n";

	for (const analysis of analyses) {
		report += `${analysis.file}\t${analysis.type}\t${analysis.framework}\t${analysis.compatibility}%\t${analysis.complexity}\t${analysis.issues.length}\t${analysis.estimatedEffort}\n`;
	}

	return report;
}

async function quickCompatibilityCheck(file: string, options: any) {
	const spinner = ora(`Checking ${file}...`).start();

	try {
		const content = await fs.readFile(file, "utf-8");
		const analysis = await performFileAnalysis(file, content, options);

		spinner.succeed("Quick check completed");
		return analysis;
	} catch (error) {
		spinner.fail("Check failed");
		throw error;
	}
}

async function displayQuickCheckResults(
	analysis: MigrationAnalysis,
	options: any,
) {
	console.log(chalk.cyan("\n⚡ Quick Compatibility Check Results\n"));

	console.log(`${chalk.bold("File:")} ${analysis.file}`);
	console.log(`${chalk.bold("Type:")} ${analysis.type}`);
	console.log(`${chalk.bold("Framework:")} ${analysis.framework}`);
	console.log(
		`${chalk.bold("Compatibility Score:")} ${getCompatibilityColor(analysis.compatibility)}${analysis.compatibility}%${chalk.reset()}`,
	);
	console.log(
		`${chalk.bold("Complexity:")} ${getComplexityColor(analysis.complexity)}${analysis.complexity}${chalk.reset()}`,
	);
	console.log(
		`${chalk.bold("Estimated Migration Effort:")} ${analysis.estimatedEffort}\n`,
	);

	// Quick summary
	const errorCount = analysis.issues.filter((i) => i.type === "error").length;
	const warningCount = analysis.issues.filter(
		(i) => i.type === "warning",
	).length;
	const infoCount = analysis.issues.filter((i) => i.type === "info").length;

	if (analysis.issues.length === 0) {
		console.log(
			chalk.green(
				"✅ No issues found! This component is ready for the UI system.",
			),
		);
	} else {
		console.log(chalk.yellow("📋 Issues Summary:"));
		if (errorCount > 0) console.log(chalk.red(`   ❌ ${errorCount} errors`));
		if (warningCount > 0)
			console.log(chalk.yellow(`   ⚠️  ${warningCount} warnings`));
		if (infoCount > 0) console.log(chalk.blue(`   ℹ️  ${infoCount} info items`));

		if (options.verbose) {
			console.log(chalk.cyan("\n📝 Detailed Issues:"));
			for (const issue of analysis.issues) {
				const icon =
					issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
				console.log(
					`\n${icon} ${chalk.bold(issue.category.toUpperCase())}: ${issue.message}`,
				);
				if (issue.suggestion) {
					console.log(chalk.gray(`   💡 ${issue.suggestion}`));
				}
			}
		}

		if (options.fixSuggestions && analysis.recommendations.length > 0) {
			console.log(chalk.green("\n🔧 Fix Suggestions:"));
			for (const rec of analysis.recommendations) {
				console.log(
					`\n${rec.priority === "high" ? "🔴" : rec.priority === "medium" ? "🟡" : "🟢"} ${chalk.bold(rec.action)}`,
				);
				console.log(`   ${rec.description}`);
				console.log(chalk.gray(`   Effort: ${rec.effort}`));
			}
		}
	}

	// Migration path
	console.log(chalk.cyan("\n🛤️  Recommended Migration Path:"));
	if (analysis.compatibility >= 80) {
		console.log(
			"1. Run automatic fixes with: " +
				chalk.yellow(`xala migrate convert ${analysis.file} --auto-fix`),
		);
		console.log("2. Manual review and testing");
	} else if (analysis.compatibility >= 60) {
		console.log("1. Address critical errors first");
		console.log(
			"2. Run: " +
				chalk.yellow(`xala migrate convert ${analysis.file} --interactive`),
		);
		console.log("3. Test thoroughly");
	} else {
		console.log("1. Consider rewriting component from scratch");
		console.log(
			"2. Use: " +
				chalk.yellow(`xala generate component NewComponent --template similar`),
		);
		console.log("3. Migrate logic step by step");
	}
}

async function convertToUISystem(file: string, options: ConversionOptions) {
	const spinner = ora(`Converting ${file}...`).start();

	try {
		// Read original file
		const originalContent = await fs.readFile(file, "utf-8");

		// Create backup if requested
		if (options.backup) {
			const backupPath = `${file}.backup`;
			await fs.writeFile(backupPath, originalContent);
			console.log(chalk.blue(`Backup created: ${backupPath}`));
		}

		// Perform conversion
		const convertedContent = await performConversion(originalContent, options);

		if (options.dryRun) {
			spinner.succeed("Dry run completed");
			return {
				originalContent,
				convertedContent,
				changes: generateChangesSummary(originalContent, convertedContent),
				dryRun: true,
			};
		}

		// Write converted content
		const outputPath = options.output || file;
		await fs.writeFile(outputPath, convertedContent);

		spinner.succeed(`Conversion completed: ${outputPath}`);

		return {
			originalContent,
			convertedContent,
			changes: generateChangesSummary(originalContent, convertedContent),
			outputPath,
			dryRun: false,
		};
	} catch (error) {
		spinner.fail("Conversion failed");
		throw error;
	}
}

async function performConversion(
	content: string,
	options: ConversionOptions,
): Promise<string> {
	let converted = content;

	// Convert styling
	converted = convertStyling(converted);

	// Convert structure
	converted = convertStructure(converted, options);

	// Add imports
	converted = addRequiredImports(converted);

	// Format and clean up
	converted = formatCode(converted);

	return converted;
}

function convertStyling(content: string): string {
	let converted = content;

	// Convert common inline styles to Tailwind
	const styleReplacements = [
		[/style\s*=\s*\{\{\s*display:\s*['"]flex['"]\s*\}\}/g, 'className="flex"'],
		[
			/style\s*=\s*\{\{\s*padding:\s*['"](\d+)px['"]\s*\}\}/g,
			(match: string, px: string) => {
				const value = parseInt(px);
				if (value <= 4) return 'className="p-1"';
				if (value <= 8) return 'className="p-2"';
				if (value <= 16) return 'className="p-4"';
				return 'className="p-6"';
			},
		],
		// Add more style conversions...
	];

	for (const [pattern, replacement] of styleReplacements) {
		if (typeof replacement === "function") {
			converted = converted.replace(pattern as RegExp, replacement);
		} else {
			converted = converted.replace(pattern as RegExp, replacement as string);
		}
	}

	return converted;
}

function convertStructure(content: string, options: ConversionOptions): string {
	let converted = content;

	// Add forwardRef if missing
	if (!converted.includes("forwardRef") && converted.includes("export const")) {
		converted = converted.replace(
			/export const (\w+) = \(\{([^}]+)\}\) => \{/,
			"export const $1 = forwardRef<HTMLDivElement, $1Props>(\n  ({ $2 }, ref) => {",
		);
		converted = converted.replace(/}\)$/, '})\n$1.displayName = "$1"');
	}

	// Add TypeScript interface if missing
	if (!converted.includes("interface ") && options.format === "typescript") {
		const componentMatch = converted.match(/export const (\w+)/);
		if (componentMatch) {
			const componentName = componentMatch[1];
			const interfaceCode = `\ninterface ${componentName}Props {\n  className?: string;\n  children?: React.ReactNode;\n}\n`;
			converted = converted.replace(
				/export const/,
				interfaceCode + "export const",
			);
		}
	}

	return converted;
}

function addRequiredImports(content: string): string {
	const imports = [];

	if (content.includes("forwardRef") && !content.includes("import React")) {
		imports.push('import React, { forwardRef } from "react"');
	}

	if (content.includes("className") && !content.includes("cn(")) {
		imports.push('import { cn } from "@/lib/utils"');
	}

	if (
		content.includes("cva") &&
		!content.includes("class-variance-authority")
	) {
		imports.push(
			'import { cva, type VariantProps } from "class-variance-authority"',
		);
	}

	if (imports.length > 0) {
		return imports.join("\n") + "\n\n" + content;
	}

	return content;
}

function formatCode(content: string): string {
	// Basic formatting - in real implementation, use prettier
	return content.replace(/\n\n\n+/g, "\n\n").trim() + "\n";
}

function generateChangesSummary(original: string, converted: string): string[] {
	const changes = [];

	if (converted.includes("forwardRef") && !original.includes("forwardRef")) {
		changes.push("Added forwardRef for better ref handling");
	}

	if (converted.includes("interface ") && !original.includes("interface ")) {
		changes.push("Added TypeScript interface for props");
	}

	if (converted.includes("className=") && !original.includes("className=")) {
		changes.push("Converted styles to Tailwind CSS classes");
	}

	if (
		converted.includes("import { cn }") &&
		!original.includes("import { cn }")
	) {
		changes.push("Added utility imports for class merging");
	}

	return changes;
}

async function displayConversionResults(
	result: any,
	options: ConversionOptions,
) {
	console.log(chalk.green("\n✅ Conversion Results\n"));

	if (result.dryRun) {
		console.log(chalk.yellow("🔍 Dry Run - No files were modified\n"));
	}

	console.log(chalk.cyan("📝 Changes Summary:"));
	if (result.changes.length > 0) {
		for (const change of result.changes) {
			console.log(`  ✓ ${change}`);
		}
	} else {
		console.log("  No changes were needed");
	}

	if (result.dryRun) {
		console.log(chalk.blue("\n📄 Preview of converted code:"));
		console.log(chalk.gray("--- Original ---"));
		console.log(result.originalContent.split("\n").slice(0, 10).join("\n"));
		console.log(chalk.gray("...\n--- Converted ---"));
		console.log(result.convertedContent.split("\n").slice(0, 10).join("\n"));
		console.log(chalk.gray("..."));

		console.log(chalk.yellow("\nTo apply changes, run without --dry-run flag"));
	} else {
		console.log(
			chalk.green(`\n✅ File converted successfully: ${result.outputPath}`),
		);
		console.log(chalk.blue("\n📋 Next steps:"));
		console.log("1. Review and test the converted component");
		console.log("2. Update any parent components that use this component");
		console.log("3. Run tests to ensure functionality is preserved");
	}
}
