/**
 * @fileoverview CVA Compliance Check Command
 * @description CLI command to validate CVA compliance of components
 * @version 5.0.0
 */

import { readFile } from "fs/promises";
import { glob } from "glob";
import { CVAValidator } from "../services/cva-validator.js";
import { logger } from "../utils/logger.js";

export interface CVACheckOptions {
	readonly path?: string;
	readonly pattern?: string;
	readonly fix?: boolean;
	readonly report?: boolean;
	readonly verbose?: boolean;
}

// Command registration
export const cvaCheckCommand = {
	name: "cva-check",
	description: "Check CVA compliance of components",
	alias: "cva",
	options: [
		{
			flags: "-p, --path <path>",
			description: "Path to check (default: src/components)",
			defaultValue: "src/components",
		},
		{
			flags: "--pattern <pattern>",
			description: "File pattern to match (default: **/*.{tsx,ts,vue,svelte})",
			defaultValue: "**/*.{tsx,ts,vue,svelte}",
		},
		{
			flags: "--fix",
			description: "Attempt to auto-fix compliance issues",
			defaultValue: false,
		},
		{
			flags: "-r, --report",
			description: "Generate detailed compliance report",
			defaultValue: false,
		},
		{
			flags: "-v, --verbose",
			description: "Show detailed output",
			defaultValue: false,
		},
	],
	action: async (options: CVACheckOptions) => {
		await cvaCheck(options);
	},
};

export async function cvaCheck(options: CVACheckOptions = {}): Promise<void> {
	const {
		path = "src/components",
		pattern = "**/*.{tsx,ts,vue,svelte}",
		fix = false,
		report = false,
		verbose = false,
	} = options;

	logger.info("🔍 Checking CVA compliance...");

	const validator = new CVAValidator();
	const searchPattern = `${path}/${pattern}`;

	try {
		const files = await glob(searchPattern, {
			ignore: ["**/node_modules/**", "**/*.test.*", "**/*.spec.*"],
		});

		if (files.length === 0) {
			logger.warn(`No files found matching pattern: ${searchPattern}`);
			return;
		}

		logger.info(`Found ${files.length} files to check`);

		const results = [];
		let totalScore = 0;
		let compliantFiles = 0;

		for (const file of files) {
			try {
				const content = await readFile(file, "utf-8");
				const result = validator.validateFile(file, content);

				results.push({ file, result });
				totalScore += result.score;

				if (result.isCompliant) {
					compliantFiles++;
					if (verbose) {
						logger.info(`✅ ${file} (${result.score}%)`);
					}
				} else {
					logger.warn(`❌ ${file} (${result.score}%)`);
					if (verbose) {
						result.errors.forEach((error) => logger.warn(`   - ${error}`));
						result.warnings.forEach((warning) =>
							logger.warn(`   - ${warning}`),
						);
					}
				}
			} catch (error) {
				logger.error(`Failed to check ${file}:`, error);
			}
		}

		// Summary
		const averageScore = Math.round(totalScore / files.length);
		const complianceRate = Math.round((compliantFiles / files.length) * 100);

		logger.info("\n📊 CVA Compliance Summary:");
		logger.info(`Files checked: ${files.length}`);
		logger.info(`Compliant files: ${compliantFiles} (${complianceRate}%)`);
		logger.info(`Average score: ${averageScore}%`);

		if (complianceRate < 100) {
			logger.warn(
				`\n⚠️  ${files.length - compliantFiles} files need CVA compliance fixes`,
			);
		} else {
			logger.info("\n🎉 All files are CVA compliant!");
		}

		// Generate report if requested
		if (report) {
			await generateComplianceReport(results, averageScore, complianceRate);
		}

		// Auto-fix if requested (placeholder for future implementation)
		if (fix) {
			logger.info("\n🔧 Auto-fix mode is not implemented yet");
			logger.info("Please manually fix the issues listed above");
		}
	} catch (error) {
		logger.error("CVA compliance check failed:", error);
		throw error;
	}
}

async function generateComplianceReport(
	results: Array<{ file: string; result: any }>,
	averageScore: number,
	complianceRate: number,
): Promise<void> {
	const validator = new CVAValidator();
	const reportLines: string[] = [];

	reportLines.push("# CVA Compliance Report\n");
	reportLines.push(`**Generated**: ${new Date().toISOString()}`);
	reportLines.push(`**Files Checked**: ${results.length}`);
	reportLines.push(`**Average Score**: ${averageScore}%`);
	reportLines.push(`**Compliance Rate**: ${complianceRate}%\n`);

	// Compliant files
	const compliantFiles = results.filter((r) => r.result.isCompliant);
	if (compliantFiles.length > 0) {
		reportLines.push("## ✅ Compliant Files\n");
		compliantFiles.forEach(({ file, result }) => {
			reportLines.push(`- ${file} (${result.score}%)`);
		});
		reportLines.push("");
	}

	// Non-compliant files
	const nonCompliantFiles = results.filter((r) => !r.result.isCompliant);
	if (nonCompliantFiles.length > 0) {
		reportLines.push("## ❌ Non-Compliant Files\n");
		nonCompliantFiles.forEach(({ file, result }) => {
			reportLines.push(`### ${file} (${result.score}%)\n`);

			if (result.errors.length > 0) {
				reportLines.push("**Errors:**");
				result.errors.forEach((error: string) => {
					reportLines.push(`- ❌ ${error}`);
				});
				reportLines.push("");
			}

			if (result.warnings.length > 0) {
				reportLines.push("**Warnings:**");
				result.warnings.forEach((warning: string) => {
					reportLines.push(`- ⚠️ ${warning}`);
				});
				reportLines.push("");
			}
		});
	}

	// Recommendations
	reportLines.push("## 📋 Recommendations\n");
	reportLines.push(
		"1. **Use CVA Pattern**: All components should use `cva()` for variant management",
	);
	reportLines.push(
		"2. **Semantic Classes**: Use semantic Tailwind classes (bg-primary, text-card-foreground, etc.)",
	);
	reportLines.push(
		"3. **Remove Hooks**: Replace `useTokens()` with CVA variants",
	);
	reportLines.push(
		"4. **Forward Refs**: Use `React.forwardRef` for better component composition",
	);
	reportLines.push(
		"5. **Accessibility**: Include proper ARIA attributes and data-testid",
	);

	const reportContent = reportLines.join("\n");

	try {
		const { writeFile } = await import("fs/promises");
		const reportPath = "cva-compliance-report.md";
		await writeFile(reportPath, reportContent);
		logger.info(`📄 Report saved to: ${reportPath}`);
	} catch (error) {
		logger.error("Failed to save report:", error);
		logger.info("Report content:");
		console.log(reportContent);
	}
}
