/**
 * Security Scanner Service
 * Comprehensive security scanning and validation for production readiness
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync, readFileSync, statSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import { logger } from "../../utils/logger";

export interface SecurityVulnerability {
	readonly id: string;
	readonly severity: "low" | "moderate" | "high" | "critical";
	readonly title: string;
	readonly description: string;
	readonly package?: string;
	readonly version?: string;
	readonly fixedIn?: string;
	readonly cwe?: string[];
	readonly cvss?: number;
}

export interface SecurityScanResult {
	readonly timestamp: string;
	readonly vulnerabilities: SecurityVulnerability[];
	readonly summary: {
		readonly total: number;
		readonly critical: number;
		readonly high: number;
		readonly moderate: number;
		readonly low: number;
	};
	readonly compliance: {
		readonly inputValidation: boolean;
		readonly outputSanitization: boolean;
		readonly pathTraversalProtection: boolean;
		readonly commandInjectionProtection: boolean;
		readonly dependencySecurityScore: number;
	};
	readonly recommendations: string[];
}

export interface CodeSecurityIssue {
	readonly file: string;
	readonly line: number;
	readonly issue: string;
	readonly severity: "info" | "warning" | "error";
	readonly rule: string;
	readonly description: string;
}

export class SecurityScannerService {
	private readonly projectRoot: string;

	constructor(projectRoot: string = process.cwd()) {
		this.projectRoot = resolve(projectRoot);
	}

	/**
	 * Perform comprehensive security scan
	 */
	async performComprehensiveScan(): Promise<SecurityScanResult> {
		logger.info(chalk.blue("🔒 Starting comprehensive security scan..."));

		const vulnerabilities = await this.scanDependencies();
		const codeIssues = await this.scanSourceCode();
		const compliance = await this.checkCompliance();

		const summary = this.generateSummary(vulnerabilities);
		const recommendations = this.generateRecommendations(vulnerabilities, codeIssues, compliance);

		const result: SecurityScanResult = {
			timestamp: new Date().toISOString(),
			vulnerabilities,
			summary,
			compliance,
			recommendations,
		};

		return result;
	}

	/**
	 * Scan dependencies for known vulnerabilities
	 */
	private async scanDependencies(): Promise<SecurityVulnerability[]> {
		const vulnerabilities: SecurityVulnerability[] = [];

		try {
			// Run npm audit
			const auditResult = execSync("npm audit --json", {
				cwd: this.projectRoot,
				encoding: "utf-8",
				stdio: "pipe",
			});

			const auditData = JSON.parse(auditResult);
			
			if (auditData.vulnerabilities) {
				for (const [packageName, vulnData] of Object.entries(auditData.vulnerabilities as Record<string, any>)) {
					for (const advisory of vulnData.via || []) {
						if (typeof advisory === "object") {
							vulnerabilities.push({
								id: advisory.id?.toString() || `npm-${packageName}-${Date.now()}`,
								severity: this.mapSeverity(advisory.severity),
								title: advisory.title || `Vulnerability in ${packageName}`,
								description: advisory.overview || advisory.description || "No description available",
								package: packageName,
								version: vulnData.range || "unknown",
								fixedIn: advisory.fixedIn,
								cwe: advisory.cwe ? [advisory.cwe] : undefined,
								cvss: advisory.cvss,
							});
						}
					}
				}
			}
		} catch (error) {
			logger.warn("npm audit failed:", error);
			
			// Fallback to basic package.json analysis
			await this.performBasicDependencyAnalysis(vulnerabilities);
		}

		return vulnerabilities;
	}

	/**
	 * Perform basic dependency analysis when npm audit fails
	 */
	private async performBasicDependencyAnalysis(vulnerabilities: SecurityVulnerability[]): Promise<void> {
		try {
			const packageJsonPath = join(this.projectRoot, "package.json");
			if (!existsSync(packageJsonPath)) return;

			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
			const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

			// Check for known problematic packages
			const problematicPackages = [
				{ name: "lodash", versions: ["<4.17.19"], reason: "Prototype pollution vulnerability" },
				{ name: "moment", versions: ["*"], reason: "Deprecated package with security concerns" },
				{ name: "request", versions: ["*"], reason: "Deprecated package" },
				{ name: "axios", versions: ["<0.21.1"], reason: "SSRF vulnerability" },
			];

			for (const [depName, depVersion] of Object.entries(dependencies)) {
				const problematic = problematicPackages.find(p => p.name === depName);
				if (problematic) {
					vulnerabilities.push({
						id: `dep-check-${depName}`,
						severity: "moderate",
						title: `Potentially problematic dependency: ${depName}`,
						description: problematic.reason,
						package: depName,
						version: depVersion as string,
					});
				}
			}
		} catch (error) {
			logger.warn("Basic dependency analysis failed:", error);
		}
	}

	/**
	 * Scan source code for security issues
	 */
	private async scanSourceCode(): Promise<CodeSecurityIssue[]> {
		const issues: CodeSecurityIssue[] = [];

		try {
			// Find all TypeScript and JavaScript files
			const sourceFiles = this.findSourceFiles();

			for (const file of sourceFiles) {
				const fileIssues = await this.scanFile(file);
				issues.push(...fileIssues);
			}
		} catch (error) {
			logger.warn("Source code scanning failed:", error);
		}

		return issues;
	}

	/**
	 * Find source files to scan
	 */
	private findSourceFiles(): string[] {
		const files: string[] = [];
		const extensions = [".ts", ".js", ".tsx", ".jsx"];

		const scanDirectory = (dir: string): void => {
			try {
				const entries = require("fs").readdirSync(dir, { withFileTypes: true });
				
				for (const entry of entries) {
					const fullPath = join(dir, entry.name);
					
					if (entry.isDirectory()) {
						// Skip node_modules and other ignored directories
						if (!["node_modules", ".git", "dist", "build", ".next"].includes(entry.name)) {
							scanDirectory(fullPath);
						}
					} else if (entry.isFile()) {
						if (extensions.some(ext => entry.name.endsWith(ext))) {
							files.push(fullPath);
						}
					}
				}
			} catch (error) {
				// Skip directories we can't read
			}
		};

		scanDirectory(join(this.projectRoot, "src"));
		return files;
	}

	/**
	 * Scan individual file for security issues
	 */
	private async scanFile(filePath: string): Promise<CodeSecurityIssue[]> {
		const issues: CodeSecurityIssue[] = [];

		try {
			const content = readFileSync(filePath, "utf-8");
			const lines = content.split("\n");

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const lineNumber = i + 1;

				// Check for potential security issues
				this.checkForCommandInjection(line, filePath, lineNumber, issues);
				this.checkForPathTraversal(line, filePath, lineNumber, issues);
				this.checkForHardcodedSecrets(line, filePath, lineNumber, issues);
				this.checkForUnsafeEval(line, filePath, lineNumber, issues);
				this.checkForSqlInjection(line, filePath, lineNumber, issues);
			}
		} catch (error) {
			logger.warn(`Failed to scan file ${filePath}:`, error);
		}

		return issues;
	}

	/**
	 * Check for command injection vulnerabilities
	 */
	private checkForCommandInjection(
		line: string,
		file: string,
		lineNumber: number,
		issues: CodeSecurityIssue[]
	): void {
		const dangerousFunctions = [
			"exec(",
			"execSync(",
			"spawn(",
			"spawnSync(",
			"eval(",
		];

		for (const func of dangerousFunctions) {
			if (line.includes(func) && !line.includes("//") && !line.includes("/*")) {
				// Check if input is properly sanitized
				const hasValidation = line.includes("sanitize") || 
									   line.includes("validate") || 
									   line.includes("escape") ||
									   line.includes("allowedCommands");

				issues.push({
					file,
					line: lineNumber,
					issue: `Potential command injection with ${func}`,
					severity: hasValidation ? "warning" : "error",
					rule: "no-command-injection",
					description: `Usage of ${func} detected. Ensure input is properly validated and sanitized.`,
				});
			}
		}
	}

	/**
	 * Check for path traversal vulnerabilities
	 */
	private checkForPathTraversal(
		line: string,
		file: string,
		lineNumber: number,
		issues: CodeSecurityIssue[]
	): void {
		const pathFunctions = ["readFile", "writeFile", "readdir", "stat", "unlink"];
		
		for (const func of pathFunctions) {
			if (line.includes(func) && line.includes("..")) {
				issues.push({
					file,
					line: lineNumber,
					issue: "Potential path traversal vulnerability",
					severity: "error",
					rule: "no-path-traversal",
					description: "Direct use of '..' in file paths can lead to path traversal attacks.",
				});
			}
		}

		// Check for user input in file paths
		if (line.includes("process.argv") && pathFunctions.some(f => line.includes(f))) {
			issues.push({
				file,
				line: lineNumber,
				issue: "User input used in file operations",
				severity: "warning",
				rule: "validate-file-paths",
				description: "User input should be validated before use in file operations.",
			});
		}
	}

	/**
	 * Check for hardcoded secrets
	 */
	private checkForHardcodedSecrets(
		line: string,
		file: string,
		lineNumber: number,
		issues: CodeSecurityIssue[]
	): void {
		const secretPatterns = [
			{ pattern: /password\s*[:=]\s*["']([^"']{8,})["']/i, type: "password" },
			{ pattern: /api[_-]?key\s*[:=]\s*["']([^"']{16,})["']/i, type: "API key" },
			{ pattern: /secret\s*[:=]\s*["']([^"']{16,})["']/i, type: "secret" },
			{ pattern: /token\s*[:=]\s*["']([^"']{20,})["']/i, type: "token" },
			{ pattern: /(?:aws|amazon)[_-]?(?:access[_-]?key|secret)[_-]?(?:id)?\s*[:=]\s*["']([^"']{16,})["']/i, type: "AWS key" },
		];

		for (const { pattern, type } of secretPatterns) {
			if (pattern.test(line) && !line.includes("process.env")) {
				issues.push({
					file,
					line: lineNumber,
					issue: `Potential hardcoded ${type}`,
					severity: "error",
					rule: "no-hardcoded-secrets",
					description: `Hardcoded ${type} detected. Use environment variables instead.`,
				});
			}
		}
	}

	/**
	 * Check for unsafe eval usage
	 */
	private checkForUnsafeEval(
		line: string,
		file: string,
		lineNumber: number,
		issues: CodeSecurityIssue[]
	): void {
		const unsafeFunctions = ["eval(", "Function(", "setTimeout(", "setInterval("];
		
		for (const func of unsafeFunctions) {
			if (line.includes(func) && line.includes("string")) {
				issues.push({
					file,
					line: lineNumber,
					issue: `Unsafe use of ${func} with string`,
					severity: "error",
					rule: "no-eval",
					description: `${func} with string arguments can lead to code injection vulnerabilities.`,
				});
			}
		}
	}

	/**
	 * Check for SQL injection vulnerabilities
	 */
	private checkForSqlInjection(
		line: string,
		file: string,
		lineNumber: number,
		issues: CodeSecurityIssue[]
	): void {
		if (line.includes("SELECT") || line.includes("INSERT") || line.includes("UPDATE") || line.includes("DELETE")) {
			if (line.includes("${") || line.includes("` + ") || line.includes("' + ")) {
				issues.push({
					file,
					line: lineNumber,
					issue: "Potential SQL injection vulnerability",
					severity: "error",
					rule: "no-sql-injection",
					description: "SQL queries should use parameterized queries or prepared statements.",
				});
			}
		}
	}

	/**
	 * Check compliance with security standards
	 */
	private async checkCompliance(): Promise<SecurityScanResult["compliance"]> {
		const compliance = {
			inputValidation: false,
			outputSanitization: false,
			pathTraversalProtection: false,
			commandInjectionProtection: false,
			dependencySecurityScore: 0,
		};

		try {
			// Check for input validation patterns
			const sourceFiles = this.findSourceFiles();
			let validationPatterns = 0;
			let sanitizationPatterns = 0;
			let protectionPatterns = 0;

			for (const file of sourceFiles) {
				const content = readFileSync(file, "utf-8");
				
				// Check for validation libraries/patterns
				if (content.includes("zod") || content.includes("joi") || content.includes("validator")) {
					validationPatterns++;
				}

				// Check for sanitization
				if (content.includes("sanitize") || content.includes("escape") || content.includes("DOMPurify")) {
					sanitizationPatterns++;
				}

				// Check for path/command protection
				if (content.includes("path.resolve") || content.includes("path.normalize") || content.includes("allowedCommands")) {
					protectionPatterns++;
				}
			}

			compliance.inputValidation = validationPatterns > 0;
			compliance.outputSanitization = sanitizationPatterns > 0;
			compliance.pathTraversalProtection = protectionPatterns > 0;
			compliance.commandInjectionProtection = protectionPatterns > 0;

			// Calculate dependency security score (0-100)
			const vulnerabilities = await this.scanDependencies();
			const criticalCount = vulnerabilities.filter(v => v.severity === "critical").length;
			const highCount = vulnerabilities.filter(v => v.severity === "high").length;
			const moderateCount = vulnerabilities.filter(v => v.severity === "moderate").length;
			
			const securityScore = Math.max(0, 100 - (criticalCount * 25 + highCount * 10 + moderateCount * 5));
			compliance.dependencySecurityScore = securityScore;

		} catch (error) {
			logger.warn("Compliance check failed:", error);
		}

		return compliance;
	}

	/**
	 * Generate vulnerability summary
	 */
	private generateSummary(vulnerabilities: SecurityVulnerability[]): SecurityScanResult["summary"] {
		const summary = {
			total: vulnerabilities.length,
			critical: 0,
			high: 0,
			moderate: 0,
			low: 0,
		};

		for (const vuln of vulnerabilities) {
			summary[vuln.severity]++;
		}

		return summary;
	}

	/**
	 * Generate security recommendations
	 */
	private generateRecommendations(
		vulnerabilities: SecurityVulnerability[],
		codeIssues: CodeSecurityIssue[],
		compliance: SecurityScanResult["compliance"]
	): string[] {
		const recommendations: string[] = [];

		// Vulnerability recommendations
		const criticalVulns = vulnerabilities.filter(v => v.severity === "critical");
		if (criticalVulns.length > 0) {
			recommendations.push(`🚨 CRITICAL: Fix ${criticalVulns.length} critical vulnerabilities immediately`);
		}

		const highVulns = vulnerabilities.filter(v => v.severity === "high");
		if (highVulns.length > 0) {
			recommendations.push(`⚠️ HIGH: Address ${highVulns.length} high-severity vulnerabilities`);
		}

		// Code issue recommendations
		const errorIssues = codeIssues.filter(i => i.severity === "error");
		if (errorIssues.length > 0) {
			recommendations.push(`🔒 Fix ${errorIssues.length} security code issues`);
		}

		// Compliance recommendations
		if (!compliance.inputValidation) {
			recommendations.push("📋 Implement input validation using libraries like Zod or Joi");
		}

		if (!compliance.outputSanitization) {
			recommendations.push("🧹 Add output sanitization to prevent XSS attacks");
		}

		if (!compliance.pathTraversalProtection) {
			recommendations.push("🛡️ Implement path traversal protection using path.resolve()");
		}

		if (compliance.dependencySecurityScore < 80) {
			recommendations.push("📦 Improve dependency security score by updating vulnerable packages");
		}

		// General recommendations
		if (recommendations.length === 0) {
			recommendations.push("✅ Security scan passed! Continue monitoring for new vulnerabilities");
		} else {
			recommendations.push("🔍 Run security scans regularly in your CI/CD pipeline");
			recommendations.push("📚 Consider implementing a security policy and training");
		}

		return recommendations;
	}

	/**
	 * Map severity levels
	 */
	private mapSeverity(severity: string): SecurityVulnerability["severity"] {
		switch (severity?.toLowerCase()) {
			case "critical":
				return "critical";
			case "high":
				return "high";
			case "moderate":
			case "medium":
				return "moderate";
			case "low":
			default:
				return "low";
		}
	}

	/**
	 * Display security scan results
	 */
	displayResults(result: SecurityScanResult): void {
		console.log(chalk.blue.bold("\n🔒 Security Scan Results\n"));

		// Summary
		console.log(chalk.cyan("Vulnerability Summary:"));
		console.log(`  Total: ${result.summary.total}`);
		if (result.summary.critical > 0) {
			console.log(chalk.red(`  Critical: ${result.summary.critical}`));
		}
		if (result.summary.high > 0) {
			console.log(chalk.red(`  High: ${result.summary.high}`));
		}
		if (result.summary.moderate > 0) {
			console.log(chalk.yellow(`  Moderate: ${result.summary.moderate}`));
		}
		if (result.summary.low > 0) {
			console.log(chalk.gray(`  Low: ${result.summary.low}`));
		}

		// Compliance
		console.log(chalk.cyan("\nCompliance Status:"));
		console.log(`  Input Validation: ${result.compliance.inputValidation ? chalk.green("✓") : chalk.red("✗")}`);
		console.log(`  Output Sanitization: ${result.compliance.outputSanitization ? chalk.green("✓") : chalk.red("✗")}`);
		console.log(`  Path Traversal Protection: ${result.compliance.pathTraversalProtection ? chalk.green("✓") : chalk.red("✗")}`);
		console.log(`  Command Injection Protection: ${result.compliance.commandInjectionProtection ? chalk.green("✓") : chalk.red("✗")}`);
		console.log(`  Dependency Security Score: ${this.getScoreColor(result.compliance.dependencySecurityScore)}${result.compliance.dependencySecurityScore}/100`);

		// Recommendations
		console.log(chalk.cyan("\nRecommendations:"));
		for (const recommendation of result.recommendations) {
			console.log(`  ${recommendation}`);
		}

		console.log();
	}

	/**
	 * Get color for security score
	 */
	private getScoreColor(score: number): (str: string) => string {
		if (score >= 80) return chalk.green;
		if (score >= 60) return chalk.yellow;
		return chalk.red;
	}
}

// Export singleton instance
export const securityScannerService = new SecurityScannerService();