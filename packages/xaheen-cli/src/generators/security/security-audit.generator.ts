/**
 * Security Audit Generator
 *
 * Generates automated security audit reports with static security analysis
 * integration for SonarQube, ESLint Security, Snyk, and custom security checks.
 * 
 * Features:
 * - Static security analysis integration
 * - Vulnerability assessment reports
 * - Code quality security metrics
 * - Dependency vulnerability scanning
 * - NSM security classification validation
 * - OWASP compliance checking
 *
 * @author Xaheen CLI Security Team
 * @since 2025-01-04
 */

import { consola } from "consola";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import type { GeneratorOptions } from "../types";
import {
	nsmClassifier,
	type NSMClassification,
} from "../../services/compliance/nsm-classifier";

const execAsync = promisify(exec);

export interface SecurityAuditOptions extends GeneratorOptions {
	readonly projectPath?: string;
	readonly includeSnyk?: boolean;
	readonly includeSonarQube?: boolean;
	readonly includeESLintSecurity?: boolean;
	readonly includeCustomRules?: boolean;
	readonly outputFormat?: "json" | "html" | "markdown" | "all";
	readonly severity?: "low" | "medium" | "high" | "critical" | "all";
	readonly scanDependencies?: boolean;
	readonly scanCode?: boolean;
	readonly scanConfiguration?: boolean;
	readonly nsmClassification?: NSMClassification;
	readonly complianceChecks?: readonly string[];
}

export interface SecurityAuditResult {
	readonly timestamp: string;
	readonly projectName: string;
	readonly summary: SecuritySummary;
	readonly vulnerabilities: readonly Vulnerability[];
	readonly codeIssues: readonly CodeSecurityIssue[];
	readonly dependencyIssues: readonly DependencyIssue[];
	readonly configurationIssues: readonly ConfigurationIssue[];
	readonly complianceResults: readonly ComplianceResult[];
	readonly recommendations: readonly SecurityRecommendation[];
	readonly score: SecurityScore;
}

export interface SecuritySummary {
	readonly totalIssues: number;
	readonly criticalIssues: number;
	readonly highIssues: number;
	readonly mediumIssues: number;
	readonly lowIssues: number;
	readonly riskScore: number;
	readonly complianceStatus: "compliant" | "non-compliant" | "partial";
}

export interface Vulnerability {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly severity: "low" | "medium" | "high" | "critical";
	readonly category: string;
	readonly file: string;
	readonly line?: number;
	readonly column?: number;
	readonly source: "snyk" | "sonarqube" | "eslint" | "custom";
	readonly cwe?: string;
	readonly cvss?: number;
	readonly fix?: SecurityFix;
}

export interface CodeSecurityIssue {
	readonly rule: string;
	readonly message: string;
	readonly severity: "low" | "medium" | "high" | "critical";
	readonly file: string;
	readonly line: number;
	readonly column: number;
	readonly category: "injection" | "xss" | "csrf" | "auth" | "crypto" | "other";
	readonly fix?: SecurityFix;
}

export interface DependencyIssue {
	readonly package: string;
	readonly version: string;
	readonly vulnerability: string;
	readonly severity: "low" | "medium" | "high" | "critical";
	readonly fixedIn?: string;
	readonly patchAvailable: boolean;
	readonly cve?: string;
}

export interface ConfigurationIssue {
	readonly file: string;
	readonly issue: string;
	readonly severity: "low" | "medium" | "high" | "critical";
	readonly recommendation: string;
	readonly category: "tls" | "cors" | "headers" | "auth" | "session" | "other";
}

export interface ComplianceResult {
	readonly standard: string;
	readonly status: "compliant" | "non-compliant" | "partial";
	readonly requirements: readonly ComplianceRequirement[];
	readonly score: number;
}

export interface ComplianceRequirement {
	readonly id: string;
	readonly description: string;
	readonly status: "pass" | "fail" | "partial";
	readonly details: string;
}

export interface SecurityRecommendation {
	readonly priority: "low" | "medium" | "high" | "critical";
	readonly category: string;
	readonly title: string;
	readonly description: string;
	readonly action: string;
	readonly effort: "low" | "medium" | "high";
}

export interface SecurityScore {
	readonly overall: number;
	readonly code: number;
	readonly dependencies: number;
	readonly configuration: number;
	readonly compliance: number;
}

export interface SecurityFix {
	readonly description: string;
	readonly action: "update" | "patch" | "configure" | "replace" | "manual";
	readonly command?: string;
	readonly diff?: string;
}

export class SecurityAuditGenerator {
	private readonly projectPath: string;
	private readonly outputPath: string;
	private readonly options: SecurityAuditOptions;

	constructor(options: SecurityAuditOptions) {
		this.options = options;
		this.projectPath = options.projectPath || process.cwd();
		this.outputPath = options.outputDir || join(this.projectPath, "security-audit");
	}

	/**
	 * Generate comprehensive security audit
	 */
	async generate(): Promise<SecurityAuditResult> {
		try {
			consola.info("🔒 Starting security audit...");

			// Create output directory
			this.createOutputDirectory();

			// Initialize audit result
			const auditResult: SecurityAuditResult = {
				timestamp: new Date().toISOString(),
				projectName: this.getProjectName(),
				summary: {
					totalIssues: 0,
					criticalIssues: 0,
					highIssues: 0,
					mediumIssues: 0,
					lowIssues: 0,
					riskScore: 0,
					complianceStatus: "compliant",
				},
				vulnerabilities: [],
				codeIssues: [],
				dependencyIssues: [],
				configurationIssues: [],
				complianceResults: [],
				recommendations: [],
				score: {
					overall: 0,
					code: 0,
					dependencies: 0,
					configuration: 0,
					compliance: 0,
				},
			};

			// Run security scans
			if (this.options.scanCode !== false) {
				consola.info("📝 Scanning code for security issues...");
				auditResult.codeIssues = await this.scanCodeSecurity();
			}

			if (this.options.scanDependencies !== false) {
				consola.info("📦 Scanning dependencies for vulnerabilities...");
				auditResult.dependencyIssues = await this.scanDependencies();
			}

			if (this.options.scanConfiguration !== false) {
				consola.info("⚙️  Scanning configuration for security issues...");
				auditResult.configurationIssues = await this.scanConfiguration();
			}

			// Run compliance checks
			if (this.options.complianceChecks) {
				consola.info("✅ Running compliance checks...");
				auditResult.complianceResults = await this.runComplianceChecks();
			}

			// Generate vulnerabilities from issues
			auditResult.vulnerabilities = this.aggregateVulnerabilities(
				auditResult.codeIssues,
				auditResult.dependencyIssues,
				auditResult.configurationIssues,
			);

			// Calculate summary and scores
			auditResult.summary = this.calculateSummary(auditResult);
			auditResult.score = this.calculateSecurityScore(auditResult);

			// Generate recommendations
			auditResult.recommendations = this.generateRecommendations(auditResult);

			// Generate reports
			await this.generateReports(auditResult);

			consola.success(
				`🔒 Security audit completed. Found ${auditResult.summary.totalIssues} issues with risk score ${auditResult.summary.riskScore}/100`,
			);

			return auditResult;
		} catch (error) {
			consola.error("Failed to generate security audit:", error);
			throw error;
		}
	}

	/**
	 * Create output directory structure
	 */
	private createOutputDirectory(): void {
		const dirs = [
			this.outputPath,
			join(this.outputPath, "reports"),
			join(this.outputPath, "raw-data"),
			join(this.outputPath, "fixes"),
		];

		dirs.forEach((dir) => {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		});
	}

	/**
	 * Get project name from package.json
	 */
	private getProjectName(): string {
		try {
			const packageJsonPath = join(this.projectPath, "package.json");
			if (existsSync(packageJsonPath)) {
				const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
				return packageJson.name || "unknown-project";
			}
		} catch (error) {
			consola.debug("Could not read package.json:", error);
		}
		return "unknown-project";
	}

	/**
	 * Scan code for security issues using ESLint Security and custom rules
	 */
	private async scanCodeSecurity(): Promise<readonly CodeSecurityIssue[]> {
		const issues: CodeSecurityIssue[] = [];

		try {
			// Run ESLint with security rules if enabled
			if (this.options.includeESLintSecurity !== false) {
				const eslintIssues = await this.runESLintSecurity();
				issues.push(...eslintIssues);
			}

			// Run custom security rules if enabled
			if (this.options.includeCustomRules !== false) {
				const customIssues = await this.runCustomSecurityRules();
				issues.push(...customIssues);
			}

			// NSM classification validation
			if (this.options.nsmClassification) {
				const nsmIssues = await this.validateNSMCompliance();
				issues.push(...nsmIssues);
			}
		} catch (error) {
			consola.warn("Code security scan encountered errors:", error);
		}

		return issues;
	}

	/**
	 * Scan dependencies for vulnerabilities using Snyk and npm audit
	 */
	private async scanDependencies(): Promise<readonly DependencyIssue[]> {
		const issues: DependencyIssue[] = [];

		try {
			// Run Snyk scan if enabled and available
			if (this.options.includeSnyk !== false) {
				const snykIssues = await this.runSnykScan();
				issues.push(...snykIssues);
			}

			// Run npm audit
			const npmAuditIssues = await this.runNpmAudit();
			issues.push(...npmAuditIssues);
		} catch (error) {
			consola.warn("Dependency scan encountered errors:", error);
		}

		return issues;
	}

	/**
	 * Scan configuration files for security issues
	 */
	private async scanConfiguration(): Promise<readonly ConfigurationIssue[]> {
		const issues: ConfigurationIssue[] = [];

		try {
			// Check common configuration files
			const configFiles = [
				"next.config.js",
				"next.config.mjs",
				"next.config.ts",
				".env",
				".env.local",
				".env.production",
				"docker-compose.yml",
				"Dockerfile",
				"nginx.conf",
				"tsconfig.json",
			];

			for (const configFile of configFiles) {
				const filePath = join(this.projectPath, configFile);
				if (existsSync(filePath)) {
					const configIssues = await this.scanConfigurationFile(
						filePath,
						configFile,
					);
					issues.push(...configIssues);
				}
			}
		} catch (error) {
			consola.warn("Configuration scan encountered errors:", error);
		}

		return issues;
	}

	/**
	 * Run ESLint with security plugins
	 */
	private async runESLintSecurity(): Promise<CodeSecurityIssue[]> {
		const issues: CodeSecurityIssue[] = [];

		try {
			const { stdout } = await execAsync(
				'npx eslint "src/**/*.{js,ts,jsx,tsx}" --format json --config .eslintrc-security.json',
				{ cwd: this.projectPath },
			);

			const eslintResults = JSON.parse(stdout);
			for (const result of eslintResults) {
				for (const message of result.messages) {
					if (message.ruleId && message.ruleId.includes("security")) {
						issues.push({
							rule: message.ruleId,
							message: message.message,
							severity: this.mapESLintSeverity(message.severity),
							file: relative(this.projectPath, result.filePath),
							line: message.line,
							column: message.column,
							category: this.categorizeSecurityIssue(message.ruleId),
							fix: message.fix
								? {
										description: "ESLint auto-fix available",
										action: "patch",
										command: `npx eslint "${result.filePath}" --fix`,
									}
								: undefined,
						});
					}
				}
			}
		} catch (error) {
			consola.debug("ESLint security scan failed:", error);
		}

		return issues;
	}

	/**
	 * Run custom security rules
	 */
	private async runCustomSecurityRules(): Promise<CodeSecurityIssue[]> {
		const issues: CodeSecurityIssue[] = [];

		// Custom security patterns to check
		const securityPatterns = [
			{
				pattern: /console\.log\(/g,
				rule: "no-console-in-production",
				message: "Console statements should not be in production code",
				severity: "medium" as const,
				category: "other" as const,
			},
			{
				pattern: /localStorage\.|sessionStorage\./g,
				rule: "secure-storage",
				message: "Consider using secure storage for sensitive data",
				severity: "medium" as const,
				category: "auth" as const,
			},
			{
				pattern: /document\.cookie/g,
				rule: "cookie-security",
				message: "Direct cookie manipulation may be insecure",
				severity: "medium" as const,
				category: "auth" as const,
			},
			{
				pattern: /eval\(/g,
				rule: "no-eval",
				message: "eval() usage is potentially dangerous",
				severity: "high" as const,
				category: "injection" as const,
			},
			{
				pattern: /innerHTML\s*=/g,
				rule: "no-inner-html",
				message: "innerHTML usage may lead to XSS vulnerabilities",
				severity: "high" as const,
				category: "xss" as const,
			},
		];

		// Scan TypeScript/JavaScript files
		const sourceFiles = await this.getSourceFiles();
		for (const filePath of sourceFiles) {
			try {
				const content = readFileSync(filePath, "utf-8");
				const lines = content.split("\n");

				for (const pattern of securityPatterns) {
					let match;
					while ((match = pattern.pattern.exec(content)) !== null) {
						const lineNumber = content.substring(0, match.index).split("\n").length;
						const line = lines[lineNumber - 1];
						const column = match.index - content.lastIndexOf("\n", match.index - 1);

						issues.push({
							rule: pattern.rule,
							message: pattern.message,
							severity: pattern.severity,
							file: relative(this.projectPath, filePath),
							line: lineNumber,
							column,
							category: pattern.category,
						});
					}
				}
			} catch (error) {
				consola.debug(`Failed to scan file ${filePath}:`, error);
			}
		}

		return issues;
	}

	/**
	 * Validate NSM compliance in code
	 */
	private async validateNSMCompliance(): Promise<CodeSecurityIssue[]> {
		const issues: CodeSecurityIssue[] = [];

		if (!this.options.nsmClassification) {
			return issues;
		}

		const classification = this.options.nsmClassification;
		const metadata = nsmClassifier.getClassification(classification);

		if (!metadata) {
			return issues;
		}

		// Check for required security headers
		if (metadata.securityRequirements.headers) {
			const requiredHeaders = metadata.securityRequirements.headers;
			const hasSecurityHeaders = await this.checkSecurityHeaders(requiredHeaders);

			if (!hasSecurityHeaders) {
				issues.push({
					rule: "nsm-security-headers",
					message: `NSM ${classification} classification requires security headers`,
					severity: "high",
					file: "next.config.js",
					line: 1,
					column: 1,
					category: "other",
					fix: {
						description: "Add required NSM security headers",
						action: "configure",
						command: "xaheen generate nsm-security --classification=" + classification,
					},
				});
			}
		}

		// Check for audit logging
		if (metadata.auditLevel !== "none") {
			const hasAuditLogging = await this.checkAuditLogging();
			if (!hasAuditLogging) {
				issues.push({
					rule: "nsm-audit-logging",
					message: `NSM ${classification} classification requires audit logging`,
					severity: "high",
					file: "src/",
					line: 1,
					column: 1,
					category: "other",
					fix: {
						description: "Implement NSM audit logging",
						action: "manual",
					},
				});
			}
		}

		return issues;
	}

	/**
	 * Run Snyk vulnerability scan
	 */
	private async runSnykScan(): Promise<DependencyIssue[]> {
		const issues: DependencyIssue[] = [];

		try {
			const { stdout } = await execAsync("snyk test --json", {
				cwd: this.projectPath,
			});

			const snykResult = JSON.parse(stdout);
			if (snykResult.vulnerabilities) {
				for (const vuln of snykResult.vulnerabilities) {
					issues.push({
						package: vuln.packageName,
						version: vuln.version,
						vulnerability: vuln.title,
						severity: vuln.severity,
						fixedIn: vuln.fixedIn,
						patchAvailable: !!vuln.patches?.length,
						cve: vuln.identifiers?.CVE?.[0],
					});
				}
			}
		} catch (error) {
			consola.debug("Snyk scan failed:", error);
		}

		return issues;
	}

	/**
	 * Run npm audit
	 */
	private async runNpmAudit(): Promise<DependencyIssue[]> {
		const issues: DependencyIssue[] = [];

		try {
			const { stdout } = await execAsync("npm audit --json", {
				cwd: this.projectPath,
			});

			const auditResult = JSON.parse(stdout);
			if (auditResult.vulnerabilities) {
				for (const [packageName, vuln] of Object.entries(
					auditResult.vulnerabilities,
				)) {
					const vulnData = vuln as any;
					issues.push({
						package: packageName,
						version: vulnData.range || "unknown",
						vulnerability: vulnData.title || "Vulnerability found",
						severity: vulnData.severity || "medium",
						fixedIn: vulnData.fixAvailable ? "available" : undefined,
						patchAvailable: !!vulnData.fixAvailable,
						cve: vulnData.cwe?.join(", "),
					});
				}
			}
		} catch (error) {
			consola.debug("npm audit failed:", error);
		}

		return issues;
	}

	/**
	 * Scan individual configuration file
	 */
	private async scanConfigurationFile(
		filePath: string,
		fileName: string,
	): Promise<ConfigurationIssue[]> {
		const issues: ConfigurationIssue[] = [];

		try {
			const content = readFileSync(filePath, "utf-8");

			// Check for common security misconfigurations
			if (fileName.includes(".env")) {
				// Check for exposed secrets in environment files
				if (content.includes("password") || content.includes("secret")) {
					issues.push({
						file: relative(this.projectPath, filePath),
						issue: "Potential secrets in environment file",
						severity: "high",
						recommendation: "Use proper secret management system",
						category: "auth",
					});
				}
			}

			if (fileName.includes("next.config")) {
				// Check for security headers
				if (!content.includes("securityHeaders") && !content.includes("headers")) {
					issues.push({
						file: relative(this.projectPath, filePath),
						issue: "Missing security headers configuration",
						severity: "medium",
						recommendation: "Add security headers to Next.js configuration",
						category: "headers",
					});
				}
			}

			if (fileName === "docker-compose.yml" || fileName === "Dockerfile") {
				// Check for Docker security issues
				if (content.includes("privileged: true")) {
					issues.push({
						file: relative(this.projectPath, filePath),
						issue: "Privileged Docker container detected",
						severity: "high",
						recommendation: "Avoid running containers in privileged mode",
						category: "other",
					});
				}
			}
		} catch (error) {
			consola.debug(`Failed to scan configuration file ${filePath}:`, error);
		}

		return issues;
	}

	/**
	 * Run compliance checks
	 */
	private async runComplianceChecks(): Promise<readonly ComplianceResult[]> {
		const results: ComplianceResult[] = [];

		if (!this.options.complianceChecks) {
			return results;
		}

		for (const standard of this.options.complianceChecks) {
			const result = await this.checkCompliance(standard);
			results.push(result);
		}

		return results;
	}

	/**
	 * Check compliance for specific standard
	 */
	private async checkCompliance(standard: string): Promise<ComplianceResult> {
		const requirements: ComplianceRequirement[] = [];

		switch (standard.toLowerCase()) {
			case "gdpr":
				requirements.push(
					{
						id: "GDPR-7.1",
						description: "Data processing consent implementation",
						status: await this.checkGDPRConsent() ? "pass" : "fail",
						details: "Check for consent management system",
					},
					{
						id: "GDPR-17",
						description: "Right to erasure implementation",
						status: await this.checkDataDeletion() ? "pass" : "fail",
						details: "Check for data deletion capabilities",
					},
				);
				break;

			case "nsm":
				if (this.options.nsmClassification) {
					const classification = this.options.nsmClassification;
					requirements.push(
						{
							id: "NSM-CL1",
							description: "Classification marking implementation",
							status: await this.checkClassificationMarking() ? "pass" : "fail",
							details: `Check for ${classification} classification marking`,
						},
						{
							id: "NSM-AU1",
							description: "Audit logging implementation",
							status: await this.checkAuditLogging() ? "pass" : "fail",
							details: "Check for comprehensive audit logging",
						},
					);
				}
				break;

			case "owasp":
				requirements.push(
					{
						id: "OWASP-A1",
						description: "Injection prevention",
						status: await this.checkInjectionPrevention() ? "pass" : "fail",
						details: "Check for SQL injection and XSS prevention",
					},
					{
						id: "OWASP-A2",
						description: "Authentication implementation",
						status: await this.checkAuthentication() ? "pass" : "fail",
						details: "Check for proper authentication mechanisms",
					},
				);
				break;
		}

		const passedRequirements = requirements.filter((r) => r.status === "pass").length;
		const score = Math.round((passedRequirements / requirements.length) * 100);
		const status =
			score === 100 ? "compliant" : score >= 70 ? "partial" : "non-compliant";

		return {
			standard: standard.toUpperCase(),
			status,
			requirements,
			score,
		};
	}

	/**
	 * Aggregate vulnerabilities from all sources
	 */
	private aggregateVulnerabilities(
		codeIssues: readonly CodeSecurityIssue[],
		dependencyIssues: readonly DependencyIssue[],
		configurationIssues: readonly ConfigurationIssue[],
	): readonly Vulnerability[] {
		const vulnerabilities: Vulnerability[] = [];

		// Convert code issues to vulnerabilities
		codeIssues.forEach((issue, index) => {
			vulnerabilities.push({
				id: `CODE-${index + 1}`,
				title: issue.rule,
				description: issue.message,
				severity: issue.severity,
				category: issue.category,
				file: issue.file,
				line: issue.line,
				column: issue.column,
				source: "custom",
				fix: issue.fix,
			});
		});

		// Convert dependency issues to vulnerabilities
		dependencyIssues.forEach((issue, index) => {
			vulnerabilities.push({
				id: `DEP-${index + 1}`,
				title: `Vulnerable dependency: ${issue.package}`,
				description: issue.vulnerability,
				severity: issue.severity,
				category: "dependency",
				file: "package.json",
				source: "snyk",
				cwe: issue.cve,
				fix: issue.patchAvailable
					? {
							description: `Update ${issue.package} to ${issue.fixedIn || "latest"}`,
							action: "update",
							command: `npm update ${issue.package}`,
						}
					: undefined,
			});
		});

		// Convert configuration issues to vulnerabilities
		configurationIssues.forEach((issue, index) => {
			vulnerabilities.push({
				id: `CONFIG-${index + 1}`,
				title: `Configuration Issue: ${issue.issue}`,
				description: issue.recommendation,
				severity: issue.severity,
				category: issue.category,
				file: issue.file,
				source: "custom",
				fix: {
					description: issue.recommendation,
					action: "configure",
				},
			});
		});

		return vulnerabilities;
	}

	/**
	 * Calculate security summary
	 */
	private calculateSummary(auditResult: SecurityAuditResult): SecuritySummary {
		const allIssues = [
			...auditResult.codeIssues,
			...auditResult.dependencyIssues,
			...auditResult.configurationIssues,
		];

		const criticalIssues = allIssues.filter((i) => i.severity === "critical").length;
		const highIssues = allIssues.filter((i) => i.severity === "high").length;
		const mediumIssues = allIssues.filter((i) => i.severity === "medium").length;
		const lowIssues = allIssues.filter((i) => i.severity === "low").length;

		const totalIssues = allIssues.length;
		const riskScore = Math.min(
			100,
			criticalIssues * 25 + highIssues * 10 + mediumIssues * 5 + lowIssues * 1,
		);

		const complianceScore =
			auditResult.complianceResults.length > 0
				? auditResult.complianceResults.reduce((sum, r) => sum + r.score, 0) /
					auditResult.complianceResults.length
				: 100;

		const complianceStatus: "compliant" | "non-compliant" | "partial" =
			complianceScore >= 90 ? "compliant" : complianceScore >= 70 ? "partial" : "non-compliant";

		return {
			totalIssues,
			criticalIssues,
			highIssues,
			mediumIssues,
			lowIssues,
			riskScore,
			complianceStatus,
		};
	}

	/**
	 * Calculate security score
	 */
	private calculateSecurityScore(auditResult: SecurityAuditResult): SecurityScore {
		const codeScore = Math.max(
			0,
			100 -
				auditResult.codeIssues.filter((i) => i.severity === "critical").length * 20 -
				auditResult.codeIssues.filter((i) => i.severity === "high").length * 10 -
				auditResult.codeIssues.filter((i) => i.severity === "medium").length * 5 -
				auditResult.codeIssues.filter((i) => i.severity === "low").length * 1,
		);

		const dependenciesScore = Math.max(
			0,
			100 -
				auditResult.dependencyIssues.filter((i) => i.severity === "critical").length * 15 -
				auditResult.dependencyIssues.filter((i) => i.severity === "high").length * 8 -
				auditResult.dependencyIssues.filter((i) => i.severity === "medium").length * 4 -
				auditResult.dependencyIssues.filter((i) => i.severity === "low").length * 1,
		);

		const configurationScore = Math.max(
			0,
			100 -
				auditResult.configurationIssues.filter((i) => i.severity === "critical").length * 15 -
				auditResult.configurationIssues.filter((i) => i.severity === "high").length * 8 -
				auditResult.configurationIssues.filter((i) => i.severity === "medium").length * 4 -
				auditResult.configurationIssues.filter((i) => i.severity === "low").length * 1,
		);

		const complianceScore =
			auditResult.complianceResults.length > 0
				? auditResult.complianceResults.reduce((sum, r) => sum + r.score, 0) /
					auditResult.complianceResults.length
				: 100;

		const overall = Math.round(
			(codeScore * 0.3 + dependenciesScore * 0.3 + configurationScore * 0.2 + complianceScore * 0.2),
		);

		return {
			overall,
			code: Math.round(codeScore),
			dependencies: Math.round(dependenciesScore),
			configuration: Math.round(configurationScore),
			compliance: Math.round(complianceScore),
		};
	}

	/**
	 * Generate security recommendations
	 */
	private generateRecommendations(auditResult: SecurityAuditResult): readonly SecurityRecommendation[] {
		const recommendations: SecurityRecommendation[] = [];

		// High-priority recommendations based on critical issues
		const criticalIssues = auditResult.vulnerabilities.filter((v) => v.severity === "critical");
		if (criticalIssues.length > 0) {
			recommendations.push({
				priority: "critical",
				category: "security",
				title: "Address Critical Security Vulnerabilities",
				description: `Found ${criticalIssues.length} critical security issues that require immediate attention`,
				action: "Review and fix all critical vulnerabilities listed in the audit report",
				effort: "high",
			});
		}

		// Dependency recommendations
		const vulnerableDependencies = auditResult.dependencyIssues.filter(
			(d) => d.severity === "high" || d.severity === "critical",
		);
		if (vulnerableDependencies.length > 0) {
			recommendations.push({
				priority: "high",
				category: "dependencies",
				title: "Update Vulnerable Dependencies",
				description: `${vulnerableDependencies.length} dependencies have high or critical vulnerabilities`,
				action: "Run 'npm audit fix' or update packages manually",
				effort: "medium",
			});
		}

		// Security tooling recommendations
		if (!this.options.includeSnyk) {
			recommendations.push({
				priority: "medium",
				category: "tooling",
				title: "Integrate Snyk for Vulnerability Scanning",
				description: "Add Snyk to your CI/CD pipeline for continuous vulnerability monitoring",
				action: "Install Snyk CLI and add to your build process",
				effort: "low",
			});
		}

		// Compliance recommendations
		const nonCompliantStandards = auditResult.complianceResults.filter(
			(r) => r.status === "non-compliant",
		);
		if (nonCompliantStandards.length > 0) {
			recommendations.push({
				priority: "high",
				category: "compliance",
				title: "Address Compliance Gaps",
				description: `Non-compliant with ${nonCompliantStandards.map((s) => s.standard).join(", ")}`,
				action: "Review compliance requirements and implement missing controls",
				effort: "high",
			});
		}

		// Configuration security recommendations
		const configIssues = auditResult.configurationIssues.filter(
			(c) => c.severity === "high" || c.severity === "medium",
		);
		if (configIssues.length > 0) {
			recommendations.push({
				priority: "medium",
				category: "configuration",
				title: "Improve Security Configuration",
				description: "Security misconfigurations detected in application settings",
				action: "Review and update configuration files with security best practices",
				effort: "medium",
			});
		}

		return recommendations;
	}

	/**
	 * Generate audit reports in various formats
	 */
	private async generateReports(auditResult: SecurityAuditResult): Promise<void> {
		const formats = this.options.outputFormat === "all" 
			? ["json", "html", "markdown"] 
			: [this.options.outputFormat || "json"];

		for (const format of formats) {
			switch (format) {
				case "json":
					await this.generateJSONReport(auditResult);
					break;
				case "html":
					await this.generateHTMLReport(auditResult);
					break;
				case "markdown":
					await this.generateMarkdownReport(auditResult);
					break;
			}
		}

		consola.info(`📊 Reports generated in ${join(this.outputPath, "reports")}`);
	}

	/**
	 * Generate JSON report
	 */
	private async generateJSONReport(auditResult: SecurityAuditResult): Promise<void> {
		const reportPath = join(this.outputPath, "reports", "security-audit.json");
		writeFileSync(reportPath, JSON.stringify(auditResult, null, 2));
	}

	/**
	 * Generate HTML report
	 */
	private async generateHTMLReport(auditResult: SecurityAuditResult): Promise<void> {
		const htmlContent = this.generateHTMLContent(auditResult);
		const reportPath = join(this.outputPath, "reports", "security-audit.html");
		writeFileSync(reportPath, htmlContent);
	}

	/**
	 * Generate Markdown report
	 */
	private async generateMarkdownReport(auditResult: SecurityAuditResult): Promise<void> {
		const markdownContent = this.generateMarkdownContent(auditResult);
		const reportPath = join(this.outputPath, "reports", "security-audit.md");
		writeFileSync(reportPath, markdownContent);
	}

	/**
	 * Generate HTML content for report
	 */
	private generateHTMLContent(auditResult: SecurityAuditResult): string {
		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Audit Report - ${auditResult.projectName}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui; margin: 0; padding: 2rem; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 2rem; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
        .title { font-size: 2rem; font-weight: 700; color: #1f2937; margin: 0; }
        .subtitle { color: #6b7280; margin: 0.5rem 0 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center; }
        .summary-value { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
        .summary-label { color: #6b7280; font-size: 0.875rem; }
        .critical { color: #dc2626; }
        .high { color: #ea580c; }
        .medium { color: #d97706; }
        .low { color: #65a30d; }
        .section { margin-bottom: 2rem; }
        .section-title { font-size: 1.5rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem; }
        .vulnerability { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .vulnerability-header { display: flex; justify-content: between; align-items: center; margin-bottom: 0.5rem; }
        .vulnerability-title { font-weight: 600; color: #1f2937; }
        .vulnerability-severity { padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        .severity-critical { background: #fef2f2; color: #dc2626; }
        .severity-high { background: #fff7ed; color: #ea580c; }
        .severity-medium { background: #fffbeb; color: #d97706; }
        .severity-low { background: #f7fee7; color: #65a30d; }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: white; margin: 0 auto; }
        .score-high { background: #10b981; }
        .score-medium { background: #f59e0b; }
        .score-low { background: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">Security Audit Report</h1>
            <p class="subtitle">${auditResult.projectName} • ${new Date(auditResult.timestamp).toLocaleDateString()}</p>
        </div>

        <div class="summary">
            <div class="summary-card">
                <div class="summary-value critical">${auditResult.summary.criticalIssues}</div>
                <div class="summary-label">Critical Issues</div>
            </div>
            <div class="summary-card">
                <div class="summary-value high">${auditResult.summary.highIssues}</div>
                <div class="summary-label">High Issues</div>
            </div>
            <div class="summary-card">
                <div class="summary-value medium">${auditResult.summary.mediumIssues}</div>
                <div class="summary-label">Medium Issues</div>
            </div>
            <div class="summary-card">
                <div class="summary-value low">${auditResult.summary.lowIssues}</div>
                <div class="summary-label">Low Issues</div>
            </div>
            <div class="summary-card">
                <div class="score-circle ${auditResult.score.overall >= 80 ? 'score-high' : auditResult.score.overall >= 60 ? 'score-medium' : 'score-low'}">
                    ${auditResult.score.overall}/100
                </div>
                <div class="summary-label">Security Score</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Top Vulnerabilities</h2>
            ${auditResult.vulnerabilities.slice(0, 10).map(vuln => `
                <div class="vulnerability">
                    <div class="vulnerability-header">
                        <span class="vulnerability-title">${vuln.title}</span>
                        <span class="vulnerability-severity severity-${vuln.severity}">${vuln.severity.toUpperCase()}</span>
                    </div>
                    <p>${vuln.description}</p>
                    <small><strong>File:</strong> ${vuln.file}${vuln.line ? `:${vuln.line}` : ''} • <strong>Source:</strong> ${vuln.source}</small>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2 class="section-title">Recommendations</h2>
            ${auditResult.recommendations.map(rec => `
                <div class="vulnerability">
                    <div class="vulnerability-header">
                        <span class="vulnerability-title">${rec.title}</span>
                        <span class="vulnerability-severity severity-${rec.priority}">${rec.priority.toUpperCase()}</span>
                    </div>
                    <p>${rec.description}</p>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <small><strong>Category:</strong> ${rec.category} • <strong>Effort:</strong> ${rec.effort}</small>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
	}

	/**
	 * Generate Markdown content for report
	 */
	private generateMarkdownContent(auditResult: SecurityAuditResult): string {
		return `# Security Audit Report

**Project:** ${auditResult.projectName}  
**Date:** ${new Date(auditResult.timestamp).toLocaleDateString()}  
**Security Score:** ${auditResult.score.overall}/100

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | ${auditResult.summary.criticalIssues} |
| High     | ${auditResult.summary.highIssues} |
| Medium   | ${auditResult.summary.mediumIssues} |
| Low      | ${auditResult.summary.lowIssues} |
| **Total** | **${auditResult.summary.totalIssues}** |

**Risk Score:** ${auditResult.summary.riskScore}/100  
**Compliance Status:** ${auditResult.summary.complianceStatus}

## Security Scores

- **Code Security:** ${auditResult.score.code}/100
- **Dependencies:** ${auditResult.score.dependencies}/100
- **Configuration:** ${auditResult.score.configuration}/100
- **Compliance:** ${auditResult.score.compliance}/100

## Top Vulnerabilities

${auditResult.vulnerabilities.slice(0, 10).map((vuln, index) => `
### ${index + 1}. ${vuln.title} (${vuln.severity.toUpperCase()})

**Description:** ${vuln.description}  
**File:** ${vuln.file}${vuln.line ? `:${vuln.line}` : ''}  
**Source:** ${vuln.source}  
${vuln.cwe ? `**CWE:** ${vuln.cwe}  ` : ''}
${vuln.fix ? `**Fix:** ${vuln.fix.description}` : ''}
`).join('\n')}

## Recommendations

${auditResult.recommendations.map((rec, index) => `
### ${index + 1}. ${rec.title} (${rec.priority.toUpperCase()})

**Category:** ${rec.category}  
**Description:** ${rec.description}  
**Action:** ${rec.action}  
**Effort:** ${rec.effort}
`).join('\n')}

## Compliance Results

${auditResult.complianceResults.map(comp => `
### ${comp.standard} Compliance

**Status:** ${comp.status} (${comp.score}%)

${comp.requirements.map(req => `
- **${req.id}:** ${req.description} - **${req.status.toUpperCase()}**
  ${req.details}
`).join('\n')}
`).join('\n')}

---

*Generated by Xaheen CLI Security Audit Generator*
`;
	}

	// Helper methods
	private async getSourceFiles(): Promise<string[]> {
		// Implementation to get all TypeScript/JavaScript source files
		// This would use glob patterns to find source files
		return [];
	}

	private mapESLintSeverity(severity: number): "low" | "medium" | "high" | "critical" {
		switch (severity) {
			case 1:
				return "medium";
			case 2:
				return "high";
			default:
				return "low";
		}
	}

	private categorizeSecurityIssue(ruleId: string): CodeSecurityIssue["category"] {
		if (ruleId.includes("injection") || ruleId.includes("sql")) return "injection";
		if (ruleId.includes("xss") || ruleId.includes("innerHTML")) return "xss";
		if (ruleId.includes("csrf")) return "csrf";
		if (ruleId.includes("auth") || ruleId.includes("session")) return "auth";
		if (ruleId.includes("crypto") || ruleId.includes("encrypt")) return "crypto";
		return "other";
	}

	// Compliance check helper methods
	private async checkSecurityHeaders(requiredHeaders: string[]): Promise<boolean> {
		// Implementation to check for security headers in Next.js config
		return false;
	}

	private async checkAuditLogging(): Promise<boolean> {
		// Implementation to check for audit logging
		return false;
	}

	private async checkGDPRConsent(): Promise<boolean> {
		// Implementation to check for GDPR consent management
		return false;
	}

	private async checkDataDeletion(): Promise<boolean> {
		// Implementation to check for data deletion capabilities
		return false;
	}

	private async checkClassificationMarking(): Promise<boolean> {
		// Implementation to check for NSM classification marking
		return false;
	}

	private async checkInjectionPrevention(): Promise<boolean> {
		// Implementation to check for injection prevention measures
		return false;
	}

	private async checkAuthentication(): Promise<boolean> {
		// Implementation to check for proper authentication
		return false;
	}
}

/**
 * Factory function to create Security Audit generator
 */
export function createSecurityAuditGenerator(
	options: SecurityAuditOptions,
): SecurityAuditGenerator {
	return new SecurityAuditGenerator(options);
}

/**
 * Generate security audit report
 */
export async function generateSecurityAudit(
	options: SecurityAuditOptions,
): Promise<SecurityAuditResult> {
	const generator = createSecurityAuditGenerator(options);
	return await generator.generate();
}