/**
 * Security Audit Command
 *
 * Generates comprehensive security audit reports with automated vulnerability
 * scanning using multiple security tools (Snyk, SonarQube, ESLint Security).
 *
 * Usage:
 *   xaheen security-audit [options]
 *   xaheen security-audit --standards gdpr,nsm,owasp
 *   xaheen security-audit --tools snyk,eslint-security --format html
 *   xaheen security-audit --classification SECRET --dry-run
 *
 * @author Xaheen CLI Security Team
 * @since 2025-01-04
 */

import {
	cancel,
	confirm,
	intro,
	isCancel,
	multiselect,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import consola from "consola";
import {
	generateSecurityAudit,
	getRecommendedSecurityTools,
	listSecurityTools,
	type NSMClassification,
	type SecurityAuditOptions,
	validateSecurityTools,
} from "../generators/security/index.js";

export const securityAuditCommand = new Command("security-audit")
	.alias("audit")
	.description("Generate comprehensive security audit reports")
	.option(
		"--tools <tools>",
		"Security tools to use (comma-separated)",
		"npm-audit,eslint-security",
	)
	.option(
		"--standards <standards>",
		"Compliance standards to check (comma-separated)",
		"owasp",
	)
	.option(
		"--classification <level>",
		"NSM security classification level",
		"OPEN",
	)
	.option("--format <format>", "Output format (json|html|markdown|all)", "html")
	.option(
		"--severity <level>",
		"Minimum severity level (low|medium|high|critical|all)",
		"medium",
	)
	.option("--output <dir>", "Output directory for reports")
	.option("--scan-code", "Scan source code for vulnerabilities", true)
	.option("--scan-deps", "Scan dependencies for vulnerabilities", true)
	.option("--scan-config", "Scan configuration files", true)
	.option("--include-snyk", "Include Snyk vulnerability scanning")
	.option("--include-sonarqube", "Include SonarQube analysis")
	.option("--include-eslint", "Include ESLint security analysis", true)
	.option("--include-custom", "Include custom security rules", true)
	.option("--dry-run", "Preview what will be analyzed without running")
	.option("--interactive", "Interactive mode with guided prompts")
	.action(async (options) => {
		try {
			if (options.interactive) {
				await runInteractiveSecurityAudit(options);
			} else {
				await runSecurityAudit(options);
			}
		} catch (error) {
			consola.error("Security audit failed:", error);
			process.exit(1);
		}
	});

/**
 * Run interactive security audit with guided prompts
 */
async function runInteractiveSecurityAudit(options: any): Promise<void> {
	intro(chalk.cyan("🔒 Xaheen Security Audit"));

	// Security tools selection
	const availableTools = listSecurityTools();
	const recommendedTools = getRecommendedSecurityTools("web");

	const selectedTools = await multiselect({
		message: "Select security tools to use:",
		options: availableTools.map((tool) => ({
			value: tool.name,
			label: tool.name,
			hint: tool.description,
			...(recommendedTools.includes(tool.name) && { selected: true }),
		})),
	});

	if (isCancel(selectedTools)) {
		cancel("Operation cancelled");
		return;
	}

	// Compliance standards selection
	const complianceStandards = await multiselect({
		message: "Select compliance standards to check:",
		options: [
			{
				value: "owasp",
				label: "OWASP Top 10",
				hint: "Web application security risks",
				selected: true,
			},
			{
				value: "gdpr",
				label: "GDPR",
				hint: "European data protection regulation",
			},
			{
				value: "nsm",
				label: "NSM",
				hint: "Norwegian security classifications",
			},
			{
				value: "pci-dss",
				label: "PCI DSS",
				hint: "Payment card security standard",
			},
			{ value: "soc2", label: "SOC 2", hint: "Service organization controls" },
			{
				value: "iso27001",
				label: "ISO 27001",
				hint: "Information security management",
			},
		],
	});

	if (isCancel(complianceStandards)) {
		cancel("Operation cancelled");
		return;
	}

	// NSM classification level (if NSM is selected)
	let nsmClassification: NSMClassification | undefined;
	if (complianceStandards.includes("nsm")) {
		const classification = await select({
			message: "Select NSM security classification level:",
			options: [
				{ value: "OPEN", label: "OPEN", hint: "Public information" },
				{
					value: "RESTRICTED",
					label: "RESTRICTED",
					hint: "Limited distribution",
				},
				{
					value: "CONFIDENTIAL",
					label: "CONFIDENTIAL",
					hint: "Sensitive information",
				},
				{ value: "SECRET", label: "SECRET", hint: "Highly classified" },
			],
		});

		if (isCancel(classification)) {
			cancel("Operation cancelled");
			return;
		}

		nsmClassification = classification as NSMClassification;
	}

	// Output format selection
	const outputFormat = await select({
		message: "Select output format:",
		options: [
			{ value: "html", label: "HTML Report", hint: "Interactive web report" },
			{ value: "json", label: "JSON Data", hint: "Machine-readable format" },
			{ value: "markdown", label: "Markdown", hint: "Documentation format" },
			{ value: "all", label: "All Formats", hint: "Generate all report types" },
		],
	});

	if (isCancel(outputFormat)) {
		cancel("Operation cancelled");
		return;
	}

	// Severity level selection
	const severityLevel = await select({
		message: "Minimum severity level to report:",
		options: [
			{ value: "low", label: "Low", hint: "Include all issues" },
			{ value: "medium", label: "Medium", hint: "Medium and above" },
			{ value: "high", label: "High", hint: "High and critical only" },
			{ value: "critical", label: "Critical", hint: "Critical issues only" },
		],
	});

	if (isCancel(severityLevel)) {
		cancel("Operation cancelled");
		return;
	}

	// Scan options
	const scanCode = await confirm({
		message: "Scan source code for security vulnerabilities?",
		initialValue: true,
	});

	if (isCancel(scanCode)) {
		cancel("Operation cancelled");
		return;
	}

	const scanDeps = await confirm({
		message: "Scan dependencies for vulnerabilities?",
		initialValue: true,
	});

	if (isCancel(scanDeps)) {
		cancel("Operation cancelled");
		return;
	}

	const scanConfig = await confirm({
		message: "Scan configuration files for security issues?",
		initialValue: true,
	});

	if (isCancel(scanConfig)) {
		cancel("Operation cancelled");
		return;
	}

	// Build audit options
	const auditOptions: SecurityAuditOptions = {
		projectPath: process.cwd(),
		includeSnyk: selectedTools.includes("snyk"),
		includeSonarQube: selectedTools.includes("sonarqube"),
		includeESLintSecurity: selectedTools.includes("eslint-security"),
		includeCustomRules: true,
		outputFormat: outputFormat as any,
		severity: severityLevel as any,
		scanCode,
		scanDependencies: scanDeps,
		scanConfiguration: scanConfig,
		nsmClassification,
		complianceChecks: complianceStandards as string[],
		outputDir: options.output,
	};

	// Dry run preview
	if (options.dryRun) {
		consola.info(chalk.cyan("🔍 Security Audit Preview:"));
		consola.info(`Tools: ${selectedTools.join(", ")}`);
		consola.info(`Standards: ${complianceStandards.join(", ")}`);
		consola.info(`Classification: ${nsmClassification || "N/A"}`);
		consola.info(`Format: ${outputFormat}`);
		consola.info(`Severity: ${severityLevel}+`);
		consola.info(`Scan code: ${scanCode ? "Yes" : "No"}`);
		consola.info(`Scan dependencies: ${scanDeps ? "Yes" : "No"}`);
		consola.info(`Scan configuration: ${scanConfig ? "Yes" : "No"}`);

		const proceed = await confirm({
			message: "Proceed with security audit?",
		});

		if (isCancel(proceed) || !proceed) {
			cancel("Operation cancelled");
			return;
		}
	}

	// Run the security audit
	await executeSecurityAudit(auditOptions);
}

/**
 * Run security audit with command line options
 */
async function runSecurityAudit(options: any): Promise<void> {
	intro(chalk.cyan("🔒 Xaheen Security Audit"));

	// Parse tools
	const tools = options.tools
		? options.tools.split(",").map((t: string) => t.trim())
		: ["npm-audit"];

	// Parse compliance standards
	const standards = options.standards
		? options.standards.split(",").map((s: string) => s.trim())
		: ["owasp"];

	// Validate tools availability
	const toolValidation = await validateSecurityTools(tools);
	if (toolValidation.missing.length > 0) {
		consola.warn(
			`Missing security tools: ${toolValidation.missing.join(", ")}`,
		);
		if (toolValidation.recommendations.length > 0) {
			consola.info("Installation commands:");
			toolValidation.recommendations.forEach((rec) => consola.info(`  ${rec}`));
		}
	}

	// Build audit options
	const auditOptions: SecurityAuditOptions = {
		projectPath: process.cwd(),
		includeSnyk:
			tools.includes("snyk") && toolValidation.available.includes("snyk"),
		includeSonarQube:
			tools.includes("sonarqube") &&
			toolValidation.available.includes("sonarqube"),
		includeESLintSecurity: options.includeEslint !== false,
		includeCustomRules: options.includeCustom !== false,
		outputFormat: options.format || "html",
		severity: options.severity || "medium",
		scanCode: options.scanCode !== false,
		scanDependencies: options.scanDeps !== false,
		scanConfiguration: options.scanConfig !== false,
		nsmClassification: options.classification as NSMClassification,
		complianceChecks: standards,
		outputDir: options.output,
	};

	// Dry run preview
	if (options.dryRun) {
		consola.info(chalk.cyan("🔍 Security Audit Preview:"));
		consola.info(`Tools: ${toolValidation.available.join(", ")}`);
		consola.info(`Standards: ${standards.join(", ")}`);
		consola.info(`Classification: ${options.classification || "N/A"}`);
		consola.info(`Format: ${options.format || "html"}`);
		consola.info(`Severity: ${options.severity || "medium"}+`);
		consola.info(`Output: ${options.output || "security-audit/"}`);
		return;
	}

	// Run the security audit
	await executeSecurityAudit(auditOptions);
}

/**
 * Execute the security audit
 */
async function executeSecurityAudit(
	options: SecurityAuditOptions,
): Promise<void> {
	const s = spinner();
	s.start("Running security audit...");

	try {
		const result = await generateSecurityAudit(options);

		s.stop();

		// Display results summary
		consola.success(chalk.green("🔒 Security audit completed!"));

		consola.info("");
		consola.info(chalk.cyan("📊 Security Summary:"));
		consola.info(`Overall Risk Score: ${result.summary.riskScore}/100`);
		consola.info(`Total Issues: ${result.summary.totalIssues}`);
		consola.info(`  Critical: ${chalk.red(result.summary.criticalIssues)}`);
		consola.info(`  High: ${chalk.red(result.summary.highIssues)}`);
		consola.info(`  Medium: ${chalk.yellow(result.summary.mediumIssues)}`);
		consola.info(`  Low: ${chalk.green(result.summary.lowIssues)}`);

		consola.info("");
		consola.info(chalk.cyan("🎯 Security Scores:"));
		consola.info(
			`Code Security: ${getScoreColor(result.score.code)}${result.score.code}/100${chalk.reset()}`,
		);
		consola.info(
			`Dependencies: ${getScoreColor(result.score.dependencies)}${result.score.dependencies}/100${chalk.reset()}`,
		);
		consola.info(
			`Configuration: ${getScoreColor(result.score.configuration)}${result.score.configuration}/100${chalk.reset()}`,
		);
		consola.info(
			`Compliance: ${getScoreColor(result.score.compliance)}${result.score.compliance}/100${chalk.reset()}`,
		);

		// Show top vulnerabilities
		if (result.vulnerabilities.length > 0) {
			consola.info("");
			consola.info(chalk.cyan("🚨 Top Vulnerabilities:"));
			result.vulnerabilities.slice(0, 5).forEach((vuln, index) => {
				const severityColor = getSeverityColor(vuln.severity);
				consola.info(
					`${index + 1}. ${severityColor}[${vuln.severity.toUpperCase()}]${chalk.reset()} ${vuln.title}`,
				);
				consola.info(
					`   ${chalk.gray(vuln.file)}${vuln.line ? `:${vuln.line}` : ""}`,
				);
			});
		}

		// Show compliance results
		if (result.complianceResults && result.complianceResults.length > 0) {
			consola.info("");
			consola.info(chalk.cyan("✅ Compliance Status:"));
			result.complianceResults.forEach((comp) => {
				const statusColor = getComplianceColor(comp.status);
				consola.info(
					`${comp.standard}: ${statusColor}${comp.status.toUpperCase()}${chalk.reset()} (${comp.score}%)`,
				);
			});
		}

		// Show top recommendations
		if (result.recommendations.length > 0) {
			consola.info("");
			consola.info(chalk.cyan("💡 Top Recommendations:"));
			result.recommendations.slice(0, 3).forEach((rec, index) => {
				const priorityColor = getSeverityColor(rec.priority);
				consola.info(
					`${index + 1}. ${priorityColor}[${rec.priority.toUpperCase()}]${chalk.reset()} ${rec.title}`,
				);
				consola.info(`   ${chalk.gray(rec.description)}`);
			});
		}

		// Show report locations
		const outputDir = options.outputDir || "security-audit";
		consola.info("");
		consola.info(chalk.cyan("📁 Generated Reports:"));
		if (options.outputFormat === "all" || options.outputFormat === "html") {
			consola.info(
				`  HTML Report: ${chalk.green(`${outputDir}/reports/security-audit.html`)}`,
			);
		}
		if (options.outputFormat === "all" || options.outputFormat === "json") {
			consola.info(
				`  JSON Data: ${chalk.green(`${outputDir}/reports/security-audit.json`)}`,
			);
		}
		if (options.outputFormat === "all" || options.outputFormat === "markdown") {
			consola.info(
				`  Markdown Report: ${chalk.green(`${outputDir}/reports/security-audit.md`)}`,
			);
		}

		// Next steps
		consola.info("");
		consola.info(chalk.cyan("🔧 Next Steps:"));
		if (result.summary.criticalIssues > 0) {
			consola.info(
				`  1. Address ${result.summary.criticalIssues} critical security issues immediately`,
			);
		}
		if (result.summary.highIssues > 0) {
			consola.info(
				`  2. Review and fix ${result.summary.highIssues} high-priority vulnerabilities`,
			);
		}
		consola.info("  3. Integrate security scanning into your CI/CD pipeline");
		consola.info("  4. Schedule regular security audits");

		outro(chalk.green("Security audit completed successfully! 🔒"));
	} catch (error) {
		s.stop();
		throw error;
	}
}

/**
 * Get color for security score
 */
function getScoreColor(score: number): string {
	if (score >= 80) return chalk.green;
	if (score >= 60) return chalk.yellow;
	return chalk.red;
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity: string): string {
	switch (severity.toLowerCase()) {
		case "critical":
			return chalk.red;
		case "high":
			return chalk.red;
		case "medium":
			return chalk.yellow;
		case "low":
			return chalk.green;
		default:
			return chalk.gray;
	}
}

/**
 * Get color for compliance status
 */
function getComplianceColor(status: string): string {
	switch (status.toLowerCase()) {
		case "compliant":
			return chalk.green;
		case "partial":
			return chalk.yellow;
		case "non-compliant":
			return chalk.red;
		default:
			return chalk.gray;
	}
}
