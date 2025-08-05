/**
 * Compliance Report Command
 *
 * Generates comprehensive compliance dashboards and reports for regulatory
 * standards including GDPR, NSM, PCI DSS, SOC 2, ISO 27001, and others.
 *
 * Usage:
 *   xaheen compliance-report [options]
 *   xaheen compliance-report --standards gdpr,nsm --format html
 *   xaheen compliance-report --type executive --dashboard --gaps
 *   xaheen compliance-report --classification SECRET --remediation
 *
 * @author Xaheen CLI Compliance Team
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
	type ComplianceReportOptions,
	type ComplianceStandard,
	type GDPRLawfulBasis,
	generateComplianceReport,
	getComplianceStandard,
	listComplianceStandards,
	type NSMClassification,
} from "../generators/security/index.js";

export const complianceReportCommand = new Command("compliance-report")
	.alias("compliance")
	.description("Generate compliance dashboards and reports")
	.option(
		"--standards <standards>",
		"Compliance standards to assess (comma-separated)",
		"gdpr,owasp",
	)
	.option(
		"--type <type>",
		"Report type (executive|detailed|technical|audit)",
		"detailed",
	)
	.option("--format <format>", "Output format (json|html|pdf|all)", "html")
	.option("--classification <level>", "NSM security classification level")
	.option("--lawful-basis <basis>", "GDPR lawful basis (comma-separated)")
	.option("--output <dir>", "Output directory for reports")
	.option("--gaps", "Include gap analysis", true)
	.option("--remediation", "Include remediation planning", true)
	.option("--dashboard", "Generate interactive dashboard", true)
	.option("--metrics", "Include compliance metrics", true)
	.option("--action-plan", "Generate detailed action plan")
	.option(
		"--timeframe <timeframe>",
		"Report timeframe (current|historical|projected)",
		"current",
	)
	.option("--dry-run", "Preview what will be assessed without running")
	.option("--interactive", "Interactive mode with guided prompts")
	.action(async (options) => {
		try {
			if (options.interactive) {
				await runInteractiveComplianceReport(options);
			} else {
				await runComplianceReport(options);
			}
		} catch (error) {
			consola.error("Compliance report generation failed:", error);
			process.exit(1);
		}
	});

/**
 * Run interactive compliance report with guided prompts
 */
async function runInteractiveComplianceReport(options: any): Promise<void> {
	intro(chalk.cyan("📊 Xaheen Compliance Report"));

	// Standards selection
	const availableStandards = listComplianceStandards();

	const selectedStandards = await multiselect({
		message: "Select compliance standards to assess:",
		options: availableStandards.map((standard) => ({
			value: standard.id,
			label: `${standard.name} (${standard.version})`,
			hint: standard.description,
			...(["gdpr", "owasp"].includes(standard.id) && { selected: true }),
		})),
	});

	if (isCancel(selectedStandards)) {
		cancel("Operation cancelled");
		return;
	}

	// Report type selection
	const reportType = await select({
		message: "Select report type:",
		options: [
			{
				value: "executive",
				label: "Executive Summary",
				hint: "High-level overview for leadership",
			},
			{
				value: "detailed",
				label: "Detailed Report",
				hint: "Comprehensive analysis with recommendations",
			},
			{
				value: "technical",
				label: "Technical Report",
				hint: "In-depth technical findings",
			},
			{
				value: "audit",
				label: "Audit Report",
				hint: "Formal audit documentation",
			},
		],
	});

	if (isCancel(reportType)) {
		cancel("Operation cancelled");
		return;
	}

	// NSM classification (if NSM is selected)
	let nsmClassification: NSMClassification | undefined;
	if (selectedStandards.includes("nsm")) {
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

	// GDPR lawful basis (if GDPR is selected)
	let gdprLawfulBasis: GDPRLawfulBasis[] | undefined;
	if (selectedStandards.includes("gdpr")) {
		const lawfulBasis = await multiselect({
			message: "Select applicable GDPR lawful bases:",
			options: [
				{
					value: "consent",
					label: "Consent",
					hint: "Freely given, specific consent",
				},
				{
					value: "contract",
					label: "Contract",
					hint: "Performance of a contract",
				},
				{
					value: "legal-obligation",
					label: "Legal Obligation",
					hint: "Compliance with legal obligation",
				},
				{
					value: "vital-interests",
					label: "Vital Interests",
					hint: "Protection of vital interests",
				},
				{
					value: "public-task",
					label: "Public Task",
					hint: "Performance of public task",
				},
				{
					value: "legitimate-interests",
					label: "Legitimate Interests",
					hint: "Legitimate interests pursued",
				},
			],
		});

		if (isCancel(lawfulBasis)) {
			cancel("Operation cancelled");
			return;
		}

		gdprLawfulBasis = lawfulBasis as GDPRLawfulBasis[];
	}

	// Output format selection
	const outputFormat = await select({
		message: "Select output format:",
		options: [
			{
				value: "html",
				label: "HTML Report",
				hint: "Interactive web report with dashboard",
			},
			{ value: "json", label: "JSON Data", hint: "Machine-readable format" },
			{
				value: "pdf",
				label: "PDF Report",
				hint: "Professional document format",
			},
			{ value: "all", label: "All Formats", hint: "Generate all report types" },
		],
	});

	if (isCancel(outputFormat)) {
		cancel("Operation cancelled");
		return;
	}

	// Report features
	const includeGaps = await confirm({
		message: "Include gap analysis?",
		initialValue: true,
	});

	if (isCancel(includeGaps)) {
		cancel("Operation cancelled");
		return;
	}

	const includeRemediation = await confirm({
		message: "Include remediation planning?",
		initialValue: true,
	});

	if (isCancel(includeRemediation)) {
		cancel("Operation cancelled");
		return;
	}

	const includeDashboard = await confirm({
		message: "Generate interactive compliance dashboard?",
		initialValue: outputFormat === "html" || outputFormat === "all",
	});

	if (isCancel(includeDashboard)) {
		cancel("Operation cancelled");
		return;
	}

	const generateActionPlan = await confirm({
		message: "Generate detailed action plan?",
		initialValue: includeRemediation,
	});

	if (isCancel(generateActionPlan)) {
		cancel("Operation cancelled");
		return;
	}

	// Build compliance options
	const complianceOptions: ComplianceReportOptions = {
		projectPath: process.cwd(),
		standards: selectedStandards as ComplianceStandard[],
		reportType: reportType as any,
		outputFormat: outputFormat as any,
		nsmClassification,
		gdprLawfulBasis,
		includeGaps,
		includeRemediation,
		includeDashboard,
		includeMetrics: true,
		generateActionPlan,
		timeframe: "current",
		outputDir: options.output,
	};

	// Dry run preview
	if (options.dryRun) {
		consola.info(chalk.cyan("🔍 Compliance Report Preview:"));
		consola.info(`Standards: ${selectedStandards.join(", ")}`);
		consola.info(`Report Type: ${reportType}`);
		consola.info(`Format: ${outputFormat}`);
		consola.info(`NSM Classification: ${nsmClassification || "N/A"}`);
		consola.info(`GDPR Lawful Basis: ${gdprLawfulBasis?.join(", ") || "N/A"}`);
		consola.info(`Gap Analysis: ${includeGaps ? "Yes" : "No"}`);
		consola.info(`Remediation Plan: ${includeRemediation ? "Yes" : "No"}`);
		consola.info(`Dashboard: ${includeDashboard ? "Yes" : "No"}`);
		consola.info(`Action Plan: ${generateActionPlan ? "Yes" : "No"}`);

		const proceed = await confirm({
			message: "Proceed with compliance assessment?",
		});

		if (isCancel(proceed) || !proceed) {
			cancel("Operation cancelled");
			return;
		}
	}

	// Run the compliance report
	await executeComplianceReport(complianceOptions);
}

/**
 * Run compliance report with command line options
 */
async function runComplianceReport(options: any): Promise<void> {
	intro(chalk.cyan("📊 Xaheen Compliance Report"));

	// Parse standards
	const standards = options.standards
		? options.standards.split(",").map((s: string) => s.trim())
		: ["gdpr", "owasp"];

	// Validate standards
	const validStandards = standards.filter((std: string) => {
		const standard = getComplianceStandard(std);
		if (!standard) {
			consola.warn(`Unknown compliance standard: ${std}`);
			return false;
		}
		return true;
	});

	if (validStandards.length === 0) {
		consola.error("No valid compliance standards specified");
		process.exit(1);
	}

	// Parse GDPR lawful basis
	let gdprLawfulBasis: GDPRLawfulBasis[] | undefined;
	if (options.lawfulBasis && validStandards.includes("gdpr")) {
		gdprLawfulBasis = options.lawfulBasis
			.split(",")
			.map((b: string) => b.trim()) as GDPRLawfulBasis[];
	}

	// Build compliance options
	const complianceOptions: ComplianceReportOptions = {
		projectPath: process.cwd(),
		standards: validStandards as ComplianceStandard[],
		reportType: options.type || "detailed",
		outputFormat: options.format || "html",
		nsmClassification: options.classification as NSMClassification,
		gdprLawfulBasis,
		includeGaps: options.gaps !== false,
		includeRemediation: options.remediation !== false,
		includeDashboard: options.dashboard !== false,
		includeMetrics: options.metrics !== false,
		generateActionPlan: options.actionPlan,
		timeframe: options.timeframe || "current",
		outputDir: options.output,
	};

	// Dry run preview
	if (options.dryRun) {
		consola.info(chalk.cyan("🔍 Compliance Report Preview:"));
		consola.info(`Standards: ${validStandards.join(", ")}`);
		consola.info(`Report Type: ${options.type || "detailed"}`);
		consola.info(`Format: ${options.format || "html"}`);
		consola.info(`Classification: ${options.classification || "N/A"}`);
		consola.info(`Output: ${options.output || "compliance-reports/"}`);
		return;
	}

	// Run the compliance report
	await executeComplianceReport(complianceOptions);
}

/**
 * Execute the compliance report generation
 */
async function executeComplianceReport(
	options: ComplianceReportOptions,
): Promise<void> {
	const s = spinner();
	s.start("Generating compliance report...");

	try {
		const result = await generateComplianceReport(options);

		s.stop();

		// Display results summary
		consola.success(chalk.green("📊 Compliance report generated!"));

		consola.info("");
		consola.info(chalk.cyan("📈 Compliance Overview:"));
		consola.info(
			`Overall Score: ${getScoreColor(result.overallScore)}${result.overallScore}%${chalk.reset()}`,
		);
		consola.info(
			`Status: ${getComplianceColor(result.complianceStatus)}${result.complianceStatus.toUpperCase()}${chalk.reset()}`,
		);
		consola.info(`Standards Assessed: ${result.standardsResults.length}`);

		// Show standards results
		if (result.standardsResults.length > 0) {
			consola.info("");
			consola.info(chalk.cyan("🎯 Standards Compliance:"));
			result.standardsResults.forEach((standard) => {
				const statusColor = getComplianceColor(standard.status);
				const riskColor = getRiskColor(standard.riskLevel);
				consola.info(
					`${standard.standard.toUpperCase()}: ${statusColor}${standard.score}%${chalk.reset()} (${riskColor}${standard.riskLevel} risk${chalk.reset()})`,
				);
				consola.info(
					`  Controls: ${standard.controlsResults.length} total, ${standard.controlsResults.filter((c) => c.status === "implemented").length} implemented`,
				);
			});
		}

		// Show compliance metrics
		consola.info("");
		consola.info(chalk.cyan("📊 Compliance Metrics:"));
		consola.info(`Total Controls: ${result.metrics.totalControls}`);
		consola.info(
			`Implemented: ${chalk.green(result.metrics.implementedControls)} (${Math.round((result.metrics.implementedControls / result.metrics.totalControls) * 100)}%)`,
		);
		consola.info(`Partial: ${chalk.yellow(result.metrics.partialControls)}`);
		consola.info(
			`Not Implemented: ${chalk.red(result.metrics.notImplementedControls)}`,
		);
		consola.info(
			`Average Maturity: ${result.metrics.averageMaturityLevel.toFixed(1)}/5`,
		);

		// Show top gaps
		if (result.gapAnalysis.length > 0) {
			consola.info("");
			consola.info(chalk.cyan("🚨 Top Compliance Gaps:"));
			result.gapAnalysis.slice(0, 5).forEach((gap, index) => {
				const impactColor = getSeverityColor(gap.impact);
				consola.info(
					`${index + 1}. ${impactColor}[${gap.impact.toUpperCase()}]${chalk.reset()} ${gap.title}`,
				);
				consola.info(
					`   ${chalk.gray(gap.standard.toUpperCase())} • Timeline: ${gap.timeline}`,
				);
			});
		}

		// Show key recommendations
		if (result.recommendations.length > 0) {
			consola.info("");
			consola.info(chalk.cyan("💡 Key Recommendations:"));
			result.recommendations.slice(0, 3).forEach((rec, index) => {
				const priorityColor = getSeverityColor(rec.priority);
				consola.info(
					`${index + 1}. ${priorityColor}[${rec.priority.toUpperCase()}]${chalk.reset()} ${rec.title}`,
				);
				consola.info(`   ${chalk.gray(rec.description)}`);
				consola.info(`   Timeline: ${rec.timeline} • Effort: ${rec.effort}`);
			});
		}

		// Show dashboard alerts
		if (
			result.dashboardData?.alerts &&
			result.dashboardData.alerts.length > 0
		) {
			consola.info("");
			consola.info(chalk.cyan("⚠️  Compliance Alerts:"));
			result.dashboardData.alerts.slice(0, 3).forEach((alert) => {
				const severityColor = getAlertColor(alert.severity);
				consola.info(
					`${severityColor}[${alert.severity.toUpperCase()}]${chalk.reset()} ${alert.title}`,
				);
				consola.info(`  ${chalk.gray(alert.message)}`);
			});
		}

		// Show report locations
		const outputDir = options.outputDir || "compliance-reports";
		consola.info("");
		consola.info(chalk.cyan("📁 Generated Reports:"));
		if (options.outputFormat === "all" || options.outputFormat === "html") {
			consola.info(
				`  HTML Report: ${chalk.green(`${outputDir}/reports/compliance-report.html`)}`,
			);
		}
		if (options.outputFormat === "all" || options.outputFormat === "json") {
			consola.info(
				`  JSON Data: ${chalk.green(`${outputDir}/reports/compliance-report.json`)}`,
			);
		}
		if (options.outputFormat === "all" || options.outputFormat === "pdf") {
			consola.info(
				`  PDF Report: ${chalk.green(`${outputDir}/reports/compliance-report.pdf`)}`,
			);
		}
		if (options.includeDashboard) {
			consola.info(
				`  Dashboard: ${chalk.green(`${outputDir}/dashboard/ComplianceDashboard.tsx`)}`,
			);
		}
		if (options.generateActionPlan) {
			consola.info(
				`  Action Plan: ${chalk.green(`${outputDir}/reports/action-plan.md`)}`,
			);
		}

		// Next steps
		consola.info("");
		consola.info(chalk.cyan("🔧 Next Steps:"));
		if (result.gapAnalysis.filter((g) => g.impact === "critical").length > 0) {
			consola.info(
				`  1. Address ${result.gapAnalysis.filter((g) => g.impact === "critical").length} critical compliance gaps immediately`,
			);
		}
		if (result.remediationPlan.length > 0) {
			consola.info(
				`  2. Implement ${result.remediationPlan.length} remediation actions`,
			);
		}
		consola.info("  3. Set up regular compliance monitoring");
		consola.info("  4. Schedule periodic compliance assessments");
		if (options.generateActionPlan) {
			consola.info("  5. Follow the detailed action plan for implementation");
		}

		outro(chalk.green("Compliance report generated successfully! 📊"));
	} catch (error) {
		s.stop();
		throw error;
	}
}

/**
 * Get color for compliance score
 */
function getScoreColor(score: number): string {
	if (score >= 90) return chalk.green;
	if (score >= 70) return chalk.yellow;
	return chalk.red;
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

/**
 * Get color for risk level
 */
function getRiskColor(risk: string): string {
	switch (risk.toLowerCase()) {
		case "low":
			return chalk.green;
		case "medium":
			return chalk.yellow;
		case "high":
			return chalk.red;
		case "critical":
			return chalk.red;
		default:
			return chalk.gray;
	}
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
 * Get color for alert severity
 */
function getAlertColor(severity: string): string {
	switch (severity.toLowerCase()) {
		case "critical":
			return chalk.red;
		case "error":
			return chalk.red;
		case "warning":
			return chalk.yellow;
		case "info":
			return chalk.blue;
		default:
			return chalk.gray;
	}
}
