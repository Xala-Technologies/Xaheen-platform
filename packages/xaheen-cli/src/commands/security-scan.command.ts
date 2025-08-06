/**
 * Security Scan Command
 *
 * Story 1.2 Implementation: Security scanning integration with AI analysis
 * - Provides comprehensive security scanning capabilities
 * - Integrates AI-powered vulnerability detection
 * - Supports multiple compliance standards (OWASP, NSM, GDPR, WCAG)
 * - Generates detailed security reports
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-04
 */

import chalk from "chalk";
import { Command } from "commander";
import * as path from "path";
import {
	aiSecurityScanner,
	type SecurityScanOptions,
} from "../services/ai/ai-security-scanner.js";
import { logger } from "../utils/logger";

export const securityScanCommand = new Command("security-scan")
	.alias("scan")
	.description("Perform comprehensive security analysis with AI assistance")
	.argument("[project-path]", "Path to project to scan", process.cwd())
	.option(
		"-t, --types <types>",
		"Scan types: code,dependencies,secrets,configuration,compliance",
		"code,dependencies,secrets",
	)
	.option(
		"-s, --severity <levels>",
		"Severity levels to include: critical,high,medium,low,info",
		"critical,high,medium",
	)
	.option(
		"-c, --compliance <standards>",
		"Compliance standards to check: owasp,nsm,gdpr,wcag",
		"owasp",
	)
	.option("--ai-enhanced", "Enable AI-powered security analysis", true)
	.option("--no-ai-enhanced", "Disable AI-powered analysis")
	.option(
		"-f, --format <format>",
		"Report format: json,html,markdown,sarif",
		"json",
	)
	.option("-o, --output <path>", "Output file path for the report")
	.option("--exclude <patterns>", "Comma-separated patterns to exclude")
	.option("--max-file-size <size>", "Maximum file size to scan (KB)", "1024")
	.option("--timeout <ms>", "Scan timeout in milliseconds", "300000")
	.option("--verbose", "Enable verbose logging")
	.action(async (projectPath: string, options) => {
		try {
			await runSecurityScan(projectPath, options);
		} catch (error) {
			logger.error("Security scan failed:", error);
			process.exit(1);
		}
	});

// Add subcommands
securityScanCommand
	.command("validate <file>")
	.description("Validate a single file for security issues")
	.option("--ai-enhanced", "Enable AI-powered analysis", true)
	.option("-f, --format <format>", "Output format: json,text", "text")
	.action(async (filePath: string, options) => {
		try {
			await validateSingleFile(filePath, options);
		} catch (error) {
			logger.error("File validation failed:", error);
			process.exit(1);
		}
	});

securityScanCommand
	.command("report <scan-id>")
	.description("Generate report from previous scan")
	.option(
		"-f, --format <format>",
		"Report format: json,html,markdown,sarif",
		"html",
	)
	.option("-o, --output <path>", "Output file path")
	.action(async (scanId: string, options) => {
		try {
			await generateScanReport(scanId, options);
		} catch (error) {
			logger.error("Report generation failed:", error);
			process.exit(1);
		}
	});

// Remove the export function since we're using direct export
// return securityScanCommand;

async function runSecurityScan(
	projectPath: string,
	options: {
		types: string;
		severity: string;
		compliance: string;
		aiEnhanced: boolean;
		format: string;
		output?: string;
		exclude?: string;
		maxFileSize: string;
		timeout: string;
		verbose: boolean;
	},
): Promise<void> {
	logger.info(chalk.blue.bold("🛡️ Xaheen Security Scanner"));
	logger.info(chalk.gray("=".repeat(50)));

	if (options.verbose) {
		logger.info(`Scanning project: ${projectPath}`);
		logger.info(`Scan types: ${options.types}`);
		logger.info(`Severity levels: ${options.severity}`);
		logger.info(`Compliance standards: ${options.compliance}`);
		logger.info(`AI enhanced: ${options.aiEnhanced}`);
	}

	// Parse options
	const scanOptions: SecurityScanOptions = {
		scanTypes: options.types.split(",") as any[],
		severity: options.severity.split(",") as any[],
		aiEnhanced: options.aiEnhanced,
		includeCompliance: options.compliance.split(",") as any[],
		excludePatterns: options.exclude?.split(","),
		maxFileSize: parseInt(options.maxFileSize) * 1024, // Convert KB to bytes
		timeout: parseInt(options.timeout),
	};

	// Validate project path
	const absolutePath = path.resolve(projectPath);
	if (!(await import("fs-extra")).pathExists(absolutePath)) {
		logger.error(`Project path does not exist: ${absolutePath}`);
		return;
	}

	// Run security scan
	logger.info(chalk.cyan("🔍 Starting security analysis..."));
	const startTime = Date.now();

	try {
		const result = await aiSecurityScanner.scanProject(
			absolutePath,
			scanOptions,
		);
		const duration = Date.now() - startTime;

		// Display results summary
		displayScanSummary(result, duration);

		// Display detailed results if verbose
		if (options.verbose) {
			displayDetailedResults(result);
		}

		// Generate and save report
		const reportContent = await aiSecurityScanner.generateReport(
			result,
			options.format as any,
			options.output,
		);

		if (!options.output) {
			// Display report content if no output file specified
			if (options.format === "json") {
				console.log(JSON.stringify(result, null, 2));
			} else if (options.format === "markdown") {
				console.log(reportContent);
			}
		}

		// Exit with appropriate code
		const exitCode = getExitCode(result);
		if (exitCode !== 0) {
			logger.error(
				chalk.red(
					`Scan completed with ${result.summary.totalVulnerabilities} security issues`,
				),
			);
		}

		process.exit(exitCode);
	} catch (error) {
		logger.error("Security scan failed:", error);
		throw error;
	}
}

async function validateSingleFile(
	filePath: string,
	options: {
		aiEnhanced: boolean;
		format: string;
	},
): Promise<void> {
	logger.info(chalk.blue(`🔍 Validating file: ${filePath}`));

	try {
		const fs = await import("fs-extra");
		const absolutePath = path.resolve(filePath);

		if (!(await fs.pathExists(absolutePath))) {
			logger.error(`File does not exist: ${absolutePath}`);
			return;
		}

		const content = await fs.readFile(absolutePath, "utf-8");
		const vulnerabilities = await aiSecurityScanner.validateGeneratedCode(
			content,
			filePath,
			{
				aiEnhanced: options.aiEnhanced,
				scanTypes: ["code", "secrets"],
				severity: ["critical", "high", "medium", "low"],
				includeCompliance: ["owasp"],
			},
		);

		if (vulnerabilities.length === 0) {
			logger.success(chalk.green("✅ No security vulnerabilities found"));
			return;
		}

		// Display vulnerabilities
		logger.warn(
			chalk.yellow(`⚠️ Found ${vulnerabilities.length} security issues:`),
		);

		for (const vuln of vulnerabilities) {
			const severityColor = getSeverityColor(vuln.severity);

			if (options.format === "json") {
				console.log(JSON.stringify(vuln, null, 2));
			} else {
				logger.warn(
					`\n${severityColor(vuln.severity.toUpperCase())}: ${vuln.title}`,
				);
				logger.warn(`Category: ${vuln.category}`);
				logger.warn(`Description: ${vuln.description}`);
				if (vuln.line) logger.warn(`Line: ${vuln.line}`);
				logger.warn(`Evidence: ${vuln.evidence}`);
				logger.warn(`Recommendation: ${vuln.recommendation}`);
				if (vuln.aiAnalysis) {
					logger.warn(`AI Analysis: ${vuln.aiAnalysis}`);
				}
			}
		}

		// Exit with error code if vulnerabilities found
		const criticalIssues = vulnerabilities.filter(
			(v) => v.severity === "critical",
		).length;
		const highIssues = vulnerabilities.filter(
			(v) => v.severity === "high",
		).length;

		if (criticalIssues > 0) {
			process.exit(2);
		} else if (highIssues > 0) {
			process.exit(1);
		}
	} catch (error) {
		logger.error("File validation failed:", error);
		throw error;
	}
}

async function generateScanReport(
	scanId: string,
	options: {
		format: string;
		output?: string;
	},
): Promise<void> {
	logger.info(chalk.blue(`📊 Generating report for scan: ${scanId}`));

	try {
		const result = aiSecurityScanner.getCachedScanResult(scanId);

		if (!result) {
			logger.error(`Scan result not found for ID: ${scanId}`);
			logger.info("Available scan results:");
			// In a real implementation, we'd list available scan IDs
			return;
		}

		const reportContent = await aiSecurityScanner.generateReport(
			result,
			options.format as any,
			options.output,
		);

		if (!options.output) {
			console.log(reportContent);
		} else {
			logger.success(`Report saved to: ${options.output}`);
		}
	} catch (error) {
		logger.error("Report generation failed:", error);
		throw error;
	}
}

function displayScanSummary(result: any, duration: number): void {
	logger.info(chalk.blue("\n📊 Scan Summary"));
	logger.info(chalk.gray("-".repeat(30)));

	logger.info(`Scan ID: ${result.scanId}`);
	logger.info(`Duration: ${Math.round(duration / 1000)}s`);
	logger.info(`Files scanned: ${result.metadata.filesScanned}`);
	logger.info(
		`Lines scanned: ${result.metadata.linesScanned.toLocaleString()}`,
	);

	if (result.summary.totalVulnerabilities === 0) {
		logger.success(chalk.green("✅ No vulnerabilities found"));
	} else {
		logger.warn(
			chalk.yellow(
				`⚠️ Total vulnerabilities: ${result.summary.totalVulnerabilities}`,
			),
		);

		// Show severity breakdown
		for (const [severity, count] of Object.entries(result.summary.bySeverity)) {
			if (count > 0) {
				const severityColor = getSeverityColor(severity);
				logger.info(`  ${severityColor(severity.toUpperCase())}: ${count}`);
			}
		}
	}

	logger.info(`Risk score: ${result.summary.riskScore}/100`);
	logger.info(`Compliance score: ${result.summary.complianceScore}%`);

	// Display AI insights
	if (result.aiInsights.overallAssessment) {
		logger.info(chalk.cyan("\n🤖 AI Assessment"));
		logger.info(chalk.gray("-".repeat(20)));
		logger.info(result.aiInsights.overallAssessment);
	}

	// Display key recommendations
	if (result.aiInsights.recommendations.length > 0) {
		logger.info(chalk.cyan("\n💡 Key Recommendations"));
		logger.info(chalk.gray("-".repeat(25)));
		result.aiInsights.recommendations.slice(0, 3).forEach((rec: string) => {
			logger.info(`• ${rec}`);
		});
	}
}

function displayDetailedResults(result: any): void {
	if (result.vulnerabilities.length === 0) {
		return;
	}

	logger.info(chalk.red("\n🚨 Detailed Vulnerabilities"));
	logger.info(chalk.gray("-".repeat(35)));

	// Group by severity
	const grouped = result.vulnerabilities.reduce((acc: any, vuln: any) => {
		if (!acc[vuln.severity]) acc[vuln.severity] = [];
		acc[vuln.severity].push(vuln);
		return acc;
	}, {});

	const severityOrder = ["critical", "high", "medium", "low", "info"];

	for (const severity of severityOrder) {
		const vulns = grouped[severity];
		if (!vulns || vulns.length === 0) continue;

		const severityColor = getSeverityColor(severity);
		logger.info(`\n${severityColor(severity.toUpperCase())} (${vulns.length})`);

		vulns.forEach((vuln: any, index: number) => {
			logger.info(`\n  ${index + 1}. ${vuln.title}`);
			logger.info(`     File: ${vuln.file}${vuln.line ? `:${vuln.line}` : ""}`);
			logger.info(`     ${vuln.description}`);
			logger.info(`     Fix: ${vuln.recommendation}`);
		});
	}

	// Display compliance results
	if (result.compliance) {
		logger.info(chalk.blue("\n📋 Compliance Results"));
		logger.info(chalk.gray("-".repeat(25)));

		for (const [standard, complianceResult] of Object.entries(
			result.compliance,
		)) {
			if (
				complianceResult &&
				typeof complianceResult === "object" &&
				"score" in complianceResult
			) {
				const score = (complianceResult as any).score;
				const scoreColor =
					score >= 80 ? chalk.green : score >= 60 ? chalk.yellow : chalk.red;
				logger.info(`${standard.toUpperCase()}: ${scoreColor(score + "%")}`);
			}
		}
	}
}

function getSeverityColor(severity: string): typeof chalk.red {
	const colors: Record<string, typeof chalk.red> = {
		critical: chalk.red.bold,
		high: chalk.red,
		medium: chalk.yellow,
		low: chalk.blue,
		info: chalk.gray,
	};
	return colors[severity] || chalk.gray;
}

function getExitCode(result: any): number {
	const criticalCount = result.summary.bySeverity.critical || 0;
	const highCount = result.summary.bySeverity.high || 0;

	if (criticalCount > 0) return 2;
	if (highCount > 0) return 1;
	return 0;
}
