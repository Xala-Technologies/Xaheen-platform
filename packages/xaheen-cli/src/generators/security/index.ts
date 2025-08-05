/**
 * Security Generators Index
 *
 * Export all security-related generators including security audits,
 * compliance reporting, and automated security analysis tools.
 *
 * Features:
 * - Security audit generation with multiple tool integrations
 * - Compliance reporting for GDPR, NSM, OWASP, and other standards
 * - Generation-time security and compliance gap detection
 * - Interactive compliance dashboards and monitoring
 *
 * @author Xaheen CLI Security Team
 * @since 2025-01-04
 */

// Compliance Report Generator
export {
	type ActionMilestone,
	type AuditEvent,
	type ComplianceAlert,
	type ComplianceDashboardData,
	type ComplianceEvidence,
	type ComplianceGap,
	type ComplianceMetrics,
	type ComplianceRecommendation,
	ComplianceReportGenerator,
	type ComplianceReportOptions,
	type ComplianceReportResult,
	type ComplianceStandard,
	type ControlResult,
	createComplianceReportGenerator,
	type DashboardChart,
	type DashboardSummary,
	type DashboardWidget,
	type GDPRLawfulBasis,
	generateComplianceReport,
	type RemediationAction,
	type StandardComplianceResult,
	type TrendDataPoint,
} from "./compliance-report.generator";
// Security Audit Generator
export {
	type CodeSecurityIssue,
	type ComplianceRequirement as SecurityComplianceRequirement,
	type ComplianceResult as SecurityComplianceResult,
	type ConfigurationIssue,
	createSecurityAuditGenerator,
	type DependencyIssue,
	generateSecurityAudit,
	SecurityAuditGenerator,
	type SecurityAuditOptions,
	type SecurityAuditResult,
	type SecurityFix,
	type SecurityRecommendation,
	type SecurityScore,
	type SecuritySummary,
	type Vulnerability,
} from "./security-audit.generator";

/**
 * Security and Compliance generator registry
 */
export const SECURITY_GENERATORS = {
	"security-audit": {
		name: "Security Audit",
		description:
			"Generate comprehensive security audit reports with vulnerability scanning",
		generator: "security-audit.generator",
		features: [
			"Static security analysis (ESLint Security, SonarQube, Snyk)",
			"Code vulnerability scanning",
			"Dependency vulnerability assessment",
			"Configuration security review",
			"NSM security classification validation",
			"OWASP compliance checking",
			"Security recommendations and fixes",
			"Multiple report formats (JSON, HTML, Markdown)",
		],
		integrations: ["snyk", "sonarqube", "eslint-plugin-security", "npm-audit"],
		standards: ["OWASP", "NSM", "CWE", "CVE"],
	},
	"compliance-report": {
		name: "Compliance Report",
		description:
			"Generate compliance dashboards and reports for regulatory standards",
		generator: "compliance-report.generator",
		features: [
			"Multi-standard compliance assessment",
			"Interactive compliance dashboards",
			"Gap analysis and remediation planning",
			"Real-time compliance monitoring",
			"Audit trail generation",
			"Executive and technical reporting",
			"Action plan generation",
			"Compliance trend analysis",
		],
		standards: [
			"GDPR",
			"NSM",
			"PCI DSS",
			"SOC 2",
			"ISO 27001",
			"HIPAA",
			"NIST",
			"OWASP",
		],
		reportTypes: ["executive", "detailed", "technical", "audit"],
		outputFormats: ["json", "html", "pdf", "dashboard"],
	},
} as const;

/**
 * Available compliance standards
 */
export const COMPLIANCE_STANDARDS = [
	{
		id: "gdpr",
		name: "General Data Protection Regulation",
		version: "2018",
		region: "EU",
		category: "privacy",
		description: "European Union data protection and privacy regulation",
		controls: 99,
		maturityLevels: 5,
	},
	{
		id: "nsm",
		name: "Norwegian Security Authority",
		version: "2023",
		region: "Norway",
		category: "security",
		description:
			"Norwegian government security classifications and requirements",
		controls: 156,
		maturityLevels: 5,
		classifications: ["OPEN", "RESTRICTED", "CONFIDENTIAL", "SECRET"],
	},
	{
		id: "pci-dss",
		name: "Payment Card Industry Data Security Standard",
		version: "4.0",
		region: "Global",
		category: "financial",
		description: "Security standard for payment card data protection",
		controls: 321,
		maturityLevels: 4,
	},
	{
		id: "soc2",
		name: "Service Organization Control 2",
		version: "2017",
		region: "US",
		category: "service",
		description:
			"Security, availability, and confidentiality controls for service organizations",
		controls: 64,
		maturityLevels: 3,
		trustServices: [
			"security",
			"availability",
			"processing-integrity",
			"confidentiality",
			"privacy",
		],
	},
	{
		id: "iso27001",
		name: "ISO/IEC 27001",
		version: "2022",
		region: "Global",
		category: "security",
		description: "International information security management standard",
		controls: 114,
		maturityLevels: 5,
	},
	{
		id: "hipaa",
		name: "Health Insurance Portability and Accountability Act",
		version: "2013",
		region: "US",
		category: "healthcare",
		description: "US healthcare data protection and privacy regulation",
		controls: 78,
		maturityLevels: 3,
	},
	{
		id: "nist",
		name: "NIST Cybersecurity Framework",
		version: "2.0",
		region: "US",
		category: "cybersecurity",
		description: "US cybersecurity framework for critical infrastructure",
		controls: 108,
		maturityLevels: 4,
		functions: [
			"identify",
			"protect",
			"detect",
			"respond",
			"recover",
			"govern",
		],
	},
	{
		id: "owasp",
		name: "OWASP Top 10",
		version: "2021",
		region: "Global",
		category: "application-security",
		description: "Top 10 web application security risks",
		controls: 10,
		maturityLevels: 3,
		risks: [
			"Broken Access Control",
			"Cryptographic Failures",
			"Injection",
			"Insecure Design",
			"Security Misconfiguration",
			"Vulnerable Components",
			"Authentication Failures",
			"Software Integrity Failures",
			"Security Logging Failures",
			"Server-Side Request Forgery",
		],
	},
] as const;

/**
 * Security analysis tools configuration
 */
export const SECURITY_TOOLS = {
	snyk: {
		name: "Snyk",
		type: "dependency-scanner",
		description: "Vulnerability scanning for dependencies and container images",
		command: "snyk test",
		installCommand: "npm install -g snyk",
		configFile: ".snyk",
		outputFormats: ["json", "sarif"],
		integrations: ["github", "gitlab", "jenkins", "docker"],
	},
	sonarqube: {
		name: "SonarQube",
		type: "static-analysis",
		description:
			"Static code analysis for security vulnerabilities and code quality",
		command: "sonar-scanner",
		installCommand: "npm install -g sonarqube-scanner",
		configFile: "sonar-project.properties",
		outputFormats: ["json", "xml"],
		languages: ["javascript", "typescript", "java", "python", "csharp"],
	},
	"eslint-security": {
		name: "ESLint Security",
		type: "linter",
		description: "ESLint plugin for identifying security vulnerabilities",
		command: "eslint --ext .js,.ts,.jsx,.tsx",
		installCommand: "npm install --save-dev eslint-plugin-security",
		configFile: ".eslintrc.js",
		outputFormats: ["json", "junit"],
		plugins: ["eslint-plugin-security", "eslint-plugin-no-unsanitized"],
	},
	"npm-audit": {
		name: "npm audit",
		type: "dependency-scanner",
		description: "Built-in npm vulnerability scanner",
		command: "npm audit",
		outputFormats: ["json"],
		integrated: true,
	},
	semgrep: {
		name: "Semgrep",
		type: "static-analysis",
		description: "Static analysis tool for finding bugs and security issues",
		command: "semgrep --config=auto",
		installCommand: "pip install semgrep",
		outputFormats: ["json", "sarif", "junit"],
		rulesets: ["owasp-top-10", "cwe-top-25", "security-audit"],
	},
	bandit: {
		name: "Bandit",
		type: "static-analysis",
		description: "Security linter for Python code",
		command: "bandit -r",
		installCommand: "pip install bandit",
		outputFormats: ["json", "xml"],
		language: "python",
	},
} as const;

/**
 * Generate security audit with specified options
 */
export async function generateSecurity(
	type: "security-audit" | "compliance-report",
	options: any,
): Promise<any> {
	switch (type) {
		case "security-audit":
			const { generateSecurityAudit } = await import(
				"./security-audit.generator"
			);
			return generateSecurityAudit(options);

		case "compliance-report":
			const { generateComplianceReport } = await import(
				"./compliance-report.generator"
			);
			return generateComplianceReport(options);

		default:
			throw new Error(`Unknown security generator type: ${type}`);
	}
}

/**
 * Get security generator configuration
 */
export function getSecurityGeneratorConfig(
	type: keyof typeof SECURITY_GENERATORS,
) {
	return SECURITY_GENERATORS[type];
}

/**
 * List all available security generators
 */
export function listSecurityGenerators() {
	return Object.entries(SECURITY_GENERATORS).map(([key, config]) => ({
		type: key,
		...config,
	}));
}

/**
 * Get compliance standard information
 */
export function getComplianceStandard(id: string) {
	return COMPLIANCE_STANDARDS.find((standard) => standard.id === id);
}

/**
 * List all supported compliance standards
 */
export function listComplianceStandards() {
	return COMPLIANCE_STANDARDS;
}

/**
 * Get security tool configuration
 */
export function getSecurityTool(name: string) {
	return SECURITY_TOOLS[name as keyof typeof SECURITY_TOOLS];
}

/**
 * List all supported security tools
 */
export function listSecurityTools() {
	return Object.entries(SECURITY_TOOLS).map(([key, config]) => ({
		name: key,
		...config,
	}));
}

/**
 * Validate security tool availability
 */
export async function validateSecurityTools(tools: readonly string[]): Promise<{
	available: readonly string[];
	missing: readonly string[];
	recommendations: readonly string[];
}> {
	const available: string[] = [];
	const missing: string[] = [];
	const recommendations: string[] = [];

	for (const tool of tools) {
		const toolConfig = getSecurityTool(tool);
		if (!toolConfig) {
			missing.push(tool);
			continue;
		}

		try {
			// Check if tool is available (this would use actual command checking)
			// For now, we'll assume npm-audit is always available
			if (tool === "npm-audit" || toolConfig.integrated) {
				available.push(tool);
			} else {
				missing.push(tool);
				recommendations.push(
					`Install ${toolConfig.name}: ${toolConfig.installCommand}`,
				);
			}
		} catch (error) {
			missing.push(tool);
			recommendations.push(
				`Install ${toolConfig.name}: ${toolConfig.installCommand}`,
			);
		}
	}

	return {
		available,
		missing,
		recommendations,
	};
}

/**
 * Get recommended security tools for project type
 */
export function getRecommendedSecurityTools(
	projectType: "web" | "api" | "mobile" | "desktop",
): readonly string[] {
	const commonTools = ["npm-audit", "eslint-security"];

	switch (projectType) {
		case "web":
			return [...commonTools, "snyk", "sonarqube"];
		case "api":
			return [...commonTools, "snyk", "semgrep"];
		case "mobile":
			return [...commonTools, "snyk"];
		case "desktop":
			return [...commonTools, "snyk"];
		default:
			return commonTools;
	}
}

/**
 * Default export for convenience
 */
export default {
	generateSecurity,
	getSecurityGeneratorConfig,
	listSecurityGenerators,
	getComplianceStandard,
	listComplianceStandards,
	getSecurityTool,
	listSecurityTools,
	validateSecurityTools,
	getRecommendedSecurityTools,
	SECURITY_GENERATORS,
	COMPLIANCE_STANDARDS,
	SECURITY_TOOLS,
};
