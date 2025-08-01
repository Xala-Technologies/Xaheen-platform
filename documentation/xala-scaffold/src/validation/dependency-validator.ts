import * as babel from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { promises as fs } from "fs";
import path from "path";
import { logger } from "../utils/logger.js";
import {
	BaseValidator,
	createValidationRule,
	ValidationIssue,
	ValidationRule,
	ValidationSeverity,
} from "./base-validator.js";

// Dependency validation configuration
export interface DependencyConfig {
	checkOutdatedPackages: boolean;
	checkSecurityVulnerabilities: boolean;
	checkLicenseCompatibility: boolean;
	checkCircularDependencies: boolean;
	checkUnusedDependencies: boolean;
	checkVersionConflicts: boolean;
	checkPeerDependencies: boolean;
	enforceNorwegianCompliance: boolean;
	maxDependencyAge: number; // in days
	allowedLicenses: string[];
	bannedPackages: string[];
	requiredPackages: string[];
	maxDependencyDepth: number;
	checkBundleImpact: boolean;
}

// Dependency information
export interface DependencyInfo {
	name: string;
	version: string;
	type: "dependencies" | "devDependencies" | "peerDependencies";
	license?: string;
	vulnerabilities?: VulnerabilityInfo[];
	lastUpdated?: string;
	bundleSize?: number;
	usageCount: number;
	isDirectDependency: boolean;
}

// Vulnerability information
export interface VulnerabilityInfo {
	id: string;
	severity: "low" | "moderate" | "high" | "critical";
	title: string;
	description: string;
	patchedVersions?: string;
	recommendation: string;
}

// Package analysis result
export interface PackageAnalysis {
	dependencies: Map<string, DependencyInfo>;
	devDependencies: Map<string, DependencyInfo>;
	peerDependencies: Map<string, DependencyInfo>;
	unusedDependencies: string[];
	outdatedDependencies: string[];
	vulnerableDependencies: string[];
	circularDependencies: string[][];
	versionConflicts: string[];
	licenseIssues: string[];
	bundleImpact: number;
	totalSize: number;
}

// Dependency validator implementation
export class DependencyValidator extends BaseValidator {
	private config: DependencyConfig;
	private packageCache = new Map<string, any>();

	private securityVulnerabilities = new Map<string, VulnerabilityInfo[]>([
		// Known vulnerable packages - this would be updated from security databases
		[
			"lodash",
			[
				{
					id: "CVE-2021-23337",
					severity: "high",
					title: "Command Injection in lodash",
					description:
						"Lodash versions prior to 4.17.21 are vulnerable to command injection",
					patchedVersions: ">=4.17.21",
					recommendation: "Update to lodash@4.17.21 or later",
				},
			],
		],
		[
			"axios",
			[
				{
					id: "CVE-2020-28168",
					severity: "moderate",
					title: "Prototype Pollution in axios",
					description:
						"Axios versions prior to 0.21.1 are vulnerable to prototype pollution",
					patchedVersions: ">=0.21.1",
					recommendation: "Update to axios@0.21.1 or later",
				},
			],
		],
	]);

	private incompatibleLicenses = new Set([
		"GPL-2.0",
		"GPL-3.0",
		"AGPL-1.0",
		"AGPL-3.0",
	]);

	private deprecatedPackages = new Set([
		"request",
		"bower",
		"grunt",
		"gulp-util",
		"node-uuid",
	]);

	constructor(config: Partial<DependencyConfig> = {}) {
		super({
			rules: [],
			severity: "warning",
			autofix: false,
			exclude: ["node_modules/**", "dist/**", "build/**"],
			include: [
				"**/package.json",
				"**/*.ts",
				"**/*.tsx",
				"**/*.js",
				"**/*.jsx",
			],
			failFast: false,
			maxIssues: 1000,
		});

		this.config = {
			checkOutdatedPackages: true,
			checkSecurityVulnerabilities: true,
			checkLicenseCompatibility: true,
			checkCircularDependencies: true,
			checkUnusedDependencies: true,
			checkVersionConflicts: true,
			checkPeerDependencies: true,
			enforceNorwegianCompliance: true,
			maxDependencyAge: 365, // 1 year
			allowedLicenses: [
				"MIT",
				"Apache-2.0",
				"BSD-2-Clause",
				"BSD-3-Clause",
				"ISC",
			],
			bannedPackages: ["request", "bower"],
			requiredPackages: [
				"@xala-technologies/ui-system",
				"@xala-technologies/foundation",
			],
			maxDependencyDepth: 5,
			checkBundleImpact: true,
			...config,
		};
	}

	initializeRules(): void {
		const rules: ValidationRule[] = [
			// Security Rules
			createValidationRule(
				"dependency.security-vulnerabilities",
				"Security Vulnerabilities",
				"Check for known security vulnerabilities in dependencies",
				"dependency",
				"error",
				true,
			),
			createValidationRule(
				"dependency.outdated-packages",
				"Outdated Packages",
				"Check for outdated packages that may have security issues",
				"dependency",
				"warning",
				true,
			),

			// License Compliance
			createValidationRule(
				"dependency.license-compatibility",
				"License Compatibility",
				"Ensure all dependencies have compatible licenses",
				"dependency",
				"error",
				true,
			),
			createValidationRule(
				"dependency.banned-packages",
				"Banned Packages",
				"Check for usage of banned or deprecated packages",
				"dependency",
				"error",
				true,
			),

			// Dependency Management
			createValidationRule(
				"dependency.unused-dependencies",
				"Unused Dependencies",
				"Identify unused dependencies that can be removed",
				"dependency",
				"warning",
				true,
			),
			createValidationRule(
				"dependency.circular-dependencies",
				"Circular Dependencies",
				"Detect circular dependencies that can cause issues",
				"dependency",
				"error",
				true,
			),
			createValidationRule(
				"dependency.version-conflicts",
				"Version Conflicts",
				"Check for version conflicts between dependencies",
				"dependency",
				"error",
				true,
			),

			// Performance Impact
			createValidationRule(
				"dependency.bundle-impact",
				"Bundle Size Impact",
				"Analyze the impact of dependencies on bundle size",
				"dependency",
				"warning",
				true,
			),
			createValidationRule(
				"dependency.peer-dependencies",
				"Peer Dependencies",
				"Ensure all peer dependencies are properly declared",
				"dependency",
				"warning",
				true,
			),

			// Norwegian Compliance
			createValidationRule(
				"dependency.norwegian-compliance",
				"Norwegian Compliance",
				"Ensure dependencies meet Norwegian regulatory requirements",
				"dependency",
				"error",
				true,
			),
			createValidationRule(
				"dependency.required-packages",
				"Required Packages",
				"Check for required Xala packages",
				"dependency",
				"error",
				true,
			),
		];

		for (const rule of rules) {
			this.rules.set(rule.id, rule);
		}
	}

	getDefaultRules(): ValidationRule[] {
		return Array.from(this.rules.values());
	}

	async validateFile(file: string, content: string): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		try {
			// Handle package.json files
			if (file.endsWith("package.json")) {
				const packageAnalysis = await this.analyzePackageJson(file, content);
				issues.push(...this.validatePackageAnalysis(file, packageAnalysis));
				return issues;
			}

			// Handle source files
			if (this.isJavaScriptFile(file)) {
				const ast = this.parseCode(content, file);
				if (ast) {
					// Check for dependency usage
					issues.push(...this.validateDependencyUsage(file, ast));

					// Check for circular dependencies
					if (this.config.checkCircularDependencies) {
						issues.push(...this.validateCircularDependencies(file, ast));
					}
				}
			}
		} catch (error) {
			logger.error(`Dependency validation failed for ${file}:`, error);
			issues.push({
				id: `dependency-validation-error-${file}`,
				severity: "error",
				category: "dependency",
				message: "Dependency validation failed",
				description: error instanceof Error ? error.message : "Unknown error",
				file,
				rule: "dependency.validation-error",
				fixable: false,
			});
		}

		return issues;
	}

	private async analyzePackageJson(
		file: string,
		content: string,
	): Promise<PackageAnalysis> {
		const packageJson = JSON.parse(content);

		const analysis: PackageAnalysis = {
			dependencies: new Map(),
			devDependencies: new Map(),
			peerDependencies: new Map(),
			unusedDependencies: [],
			outdatedDependencies: [],
			vulnerableDependencies: [],
			circularDependencies: [],
			versionConflicts: [],
			licenseIssues: [],
			bundleImpact: 0,
			totalSize: 0,
		};

		// Analyze dependencies
		await this.analyzeDependencySection(
			packageJson.dependencies,
			"dependencies",
			analysis,
		);
		await this.analyzeDependencySection(
			packageJson.devDependencies,
			"devDependencies",
			analysis,
		);
		await this.analyzeDependencySection(
			packageJson.peerDependencies,
			"peerDependencies",
			analysis,
		);

		// Find unused dependencies
		if (this.config.checkUnusedDependencies) {
			analysis.unusedDependencies = await this.findUnusedDependencies(
				file,
				analysis,
			);
		}

		// Check for version conflicts
		if (this.config.checkVersionConflicts) {
			analysis.versionConflicts = this.findVersionConflicts(analysis);
		}

		return analysis;
	}

	private async analyzeDependencySection(
		dependencies: Record<string, string> | undefined,
		type: "dependencies" | "devDependencies" | "peerDependencies",
		analysis: PackageAnalysis,
	): Promise<void> {
		if (!dependencies) return;

		for (const [name, version] of Object.entries(dependencies)) {
			const depInfo: DependencyInfo = {
				name,
				version,
				type,
				usageCount: 0,
				isDirectDependency: true,
			};

			// Check for vulnerabilities
			if (this.config.checkSecurityVulnerabilities) {
				const vulnerabilities = this.securityVulnerabilities.get(name);
				if (vulnerabilities) {
					depInfo.vulnerabilities = vulnerabilities;
					analysis.vulnerableDependencies.push(name);
				}
			}

			// Check license compatibility
			if (this.config.checkLicenseCompatibility) {
				const licenseInfo = await this.getLicenseInfo(name, version);
				if (licenseInfo) {
					depInfo.license = licenseInfo;

					if (this.incompatibleLicenses.has(licenseInfo)) {
						analysis.licenseIssues.push(name);
					}
				}
			}

			// Check if outdated
			if (this.config.checkOutdatedPackages) {
				const isOutdated = await this.isPackageOutdated(name, version);
				if (isOutdated) {
					analysis.outdatedDependencies.push(name);
				}
			}

			// Estimate bundle impact
			if (this.config.checkBundleImpact) {
				const bundleSize = await this.estimateBundleSize(name, version);
				if (bundleSize) {
					depInfo.bundleSize = bundleSize;
					analysis.bundleImpact += bundleSize;
				}
			}

			analysis[type].set(name, depInfo);
		}
	}

	private validatePackageAnalysis(
		file: string,
		analysis: PackageAnalysis,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];

		// Check for security vulnerabilities
		if (analysis.vulnerableDependencies.length > 0) {
			analysis.vulnerableDependencies.forEach((dep) => {
				const depInfo = this.getDependencyInfo(analysis, dep);
				const vulnerabilities = depInfo?.vulnerabilities || [];

				vulnerabilities.forEach((vuln) => {
					const severity = this.mapVulnerabilitySeverity(vuln.severity);

					issues.push({
						id: `dependency-vulnerability-${dep}-${vuln.id}`,
						severity,
						category: "dependency",
						message: `Security vulnerability in ${dep}: ${vuln.title}`,
						description: `${vuln.description}\nRecommendation: ${vuln.recommendation}`,
						file,
						rule: "dependency.security-vulnerabilities",
						fixable: true,
						autofix: {
							description: `Update ${dep} to secure version`,
							operation: "replace",
							target: `"${dep}": "${depInfo?.version}"`,
							replacement: `"${dep}": "${vuln.patchedVersions}"`,
						},
					});
				});
			});
		}

		// Check for outdated packages
		if (analysis.outdatedDependencies.length > 0) {
			analysis.outdatedDependencies.forEach((dep) => {
				issues.push({
					id: `dependency-outdated-${dep}`,
					severity: "warning",
					category: "dependency",
					message: `Outdated dependency: ${dep}`,
					description:
						"Consider updating to the latest version for security and performance improvements",
					file,
					rule: "dependency.outdated-packages",
					fixable: false,
				});
			});
		}

		// Check for license issues
		if (analysis.licenseIssues.length > 0) {
			analysis.licenseIssues.forEach((dep) => {
				const depInfo = this.getDependencyInfo(analysis, dep);

				issues.push({
					id: `dependency-license-${dep}`,
					severity: "error",
					category: "dependency",
					message: `License compatibility issue: ${dep}`,
					description: `Package ${dep} uses license ${depInfo?.license} which may not be compatible`,
					file,
					rule: "dependency.license-compatibility",
					fixable: false,
				});
			});
		}

		// Check for unused dependencies
		if (analysis.unusedDependencies.length > 0) {
			analysis.unusedDependencies.forEach((dep) => {
				issues.push({
					id: `dependency-unused-${dep}`,
					severity: "warning",
					category: "dependency",
					message: `Unused dependency: ${dep}`,
					description:
						"This dependency appears to be unused and can be removed",
					file,
					rule: "dependency.unused-dependencies",
					fixable: true,
					autofix: {
						description: `Remove unused dependency ${dep}`,
						operation: "delete",
						target: `"${dep}": "${this.getDependencyInfo(analysis, dep)?.version}"`,
					},
				});
			});
		}

		// Check for version conflicts
		if (analysis.versionConflicts.length > 0) {
			analysis.versionConflicts.forEach((conflict) => {
				issues.push({
					id: `dependency-version-conflict-${conflict}`,
					severity: "error",
					category: "dependency",
					message: `Version conflict: ${conflict}`,
					description: "Multiple versions of the same package may cause issues",
					file,
					rule: "dependency.version-conflicts",
					fixable: false,
				});
			});
		}

		// Check for banned packages
		this.config.bannedPackages.forEach((banned) => {
			if (this.hasDependency(analysis, banned)) {
				issues.push({
					id: `dependency-banned-${banned}`,
					severity: "error",
					category: "dependency",
					message: `Banned package: ${banned}`,
					description: `Package ${banned} is banned and should not be used`,
					file,
					rule: "dependency.banned-packages",
					fixable: false,
				});
			}
		});

		// Check for required packages (Norwegian compliance)
		if (this.config.enforceNorwegianCompliance) {
			this.config.requiredPackages.forEach((required) => {
				if (!this.hasDependency(analysis, required)) {
					issues.push({
						id: `dependency-missing-required-${required}`,
						severity: "error",
						category: "dependency",
						message: `Missing required package: ${required}`,
						description: `Package ${required} is required for Norwegian compliance`,
						file,
						rule: "dependency.required-packages",
						fixable: true,
						autofix: {
							description: `Add required dependency ${required}`,
							operation: "insert",
							target: '"dependencies": {',
							replacement: `"dependencies": {\n    "${required}": "latest",`,
						},
					});
				}
			});
		}

		// Check bundle impact
		if (this.config.checkBundleImpact && analysis.bundleImpact > 1000) {
			// 1MB
			issues.push({
				id: `dependency-bundle-impact-${file}`,
				severity: "warning",
				category: "dependency",
				message: `High bundle impact: ${(analysis.bundleImpact / 1024).toFixed(2)}KB`,
				description: "Dependencies have significant impact on bundle size",
				file,
				rule: "dependency.bundle-impact",
				fixable: false,
			});
		}

		return issues;
	}

	private isJavaScriptFile(file: string): boolean {
		return /\.(js|jsx|ts|tsx)$/.test(file);
	}

	private parseCode(content: string, file: string): t.File | null {
		try {
			const isTypeScript = /\.tsx?$/.test(file);
			const isJSX = /\.(jsx|tsx)$/.test(file);

			return babel.parse(content, {
				sourceType: "module",
				plugins: [
					...(isTypeScript ? ["typescript"] : []),
					...(isJSX ? ["jsx"] : []),
					"decorators-legacy",
					"classProperties",
					"objectRestSpread",
				],
			});
		} catch (error) {
			logger.debug(`Failed to parse ${file}:`, error);
			return null;
		}
	}

	private validateDependencyUsage(
		file: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		const importedPackages = new Set<string>();

		traverse(ast, {
			// Track imports
			ImportDeclaration(path) {
				const node = path.node;

				if (t.isStringLiteral(node.source)) {
					const importPath = node.source.value;

					// Extract package name
					const packageName = this.extractPackageName(importPath);
					if (packageName) {
						importedPackages.add(packageName);

						// Check for deprecated packages
						if (this.deprecatedPackages.has(packageName)) {
							issues.push({
								id: `dependency-deprecated-${packageName}-${node.loc?.start.line}`,
								severity: "warning",
								category: "dependency",
								message: `Deprecated package: ${packageName}`,
								description: `Package ${packageName} is deprecated and should be replaced`,
								file,
								line: node.loc?.start.line,
								rule: "dependency.banned-packages",
								fixable: false,
							});
						}

						// Check for banned packages
						if (this.config.bannedPackages.includes(packageName)) {
							issues.push({
								id: `dependency-banned-usage-${packageName}-${node.loc?.start.line}`,
								severity: "error",
								category: "dependency",
								message: `Usage of banned package: ${packageName}`,
								description: `Package ${packageName} is banned and should not be used`,
								file,
								line: node.loc?.start.line,
								rule: "dependency.banned-packages",
								fixable: false,
							});
						}
					}
				}
			},

			// Check for require() calls
			CallExpression(path) {
				const node = path.node;

				if (t.isIdentifier(node.callee) && node.callee.name === "require") {
					const arg = node.arguments[0];

					if (t.isStringLiteral(arg)) {
						const packageName = this.extractPackageName(arg.value);

						if (packageName) {
							importedPackages.add(packageName);

							if (this.deprecatedPackages.has(packageName)) {
								issues.push({
									id: `dependency-deprecated-require-${packageName}-${node.loc?.start.line}`,
									severity: "warning",
									category: "dependency",
									message: `Deprecated package in require(): ${packageName}`,
									description: `Package ${packageName} is deprecated`,
									file,
									line: node.loc?.start.line,
									rule: "dependency.banned-packages",
									fixable: false,
								});
							}
						}
					}
				}
			},
		});

		return issues;
	}

	private validateCircularDependencies(
		file: string,
		ast: t.File,
	): ValidationIssue[] {
		const issues: ValidationIssue[] = [];
		const importPaths = new Set<string>();

		// Collect all import paths
		traverse(ast, {
			ImportDeclaration(path) {
				const node = path.node;

				if (t.isStringLiteral(node.source)) {
					const importPath = node.source.value;

					// Only check relative imports for circular dependencies
					if (importPath.startsWith("./") || importPath.startsWith("../")) {
						importPaths.add(importPath);
					}
				}
			},
		});

		// Check for potential circular dependencies
		// This is a simplified check - a full implementation would analyze the entire dependency graph
		for (const importPath of importPaths) {
			if (this.couldCreateCircularDependency(file, importPath)) {
				issues.push({
					id: `dependency-potential-circular-${file}`,
					severity: "warning",
					category: "dependency",
					message: "Potential circular dependency detected",
					description: `Import path ${importPath} may create a circular dependency`,
					file,
					rule: "dependency.circular-dependencies",
					fixable: false,
				});
			}
		}

		return issues;
	}

	// Helper methods
	private extractPackageName(importPath: string): string | null {
		// Handle scoped packages
		if (importPath.startsWith("@")) {
			const parts = importPath.split("/");
			if (parts.length >= 2) {
				return `${parts[0]}/${parts[1]}`;
			}
		}

		// Handle regular packages
		const parts = importPath.split("/");
		return parts[0] || null;
	}

	private getDependencyInfo(
		analysis: PackageAnalysis,
		name: string,
	): DependencyInfo | undefined {
		return (
			analysis.dependencies.get(name) ||
			analysis.devDependencies.get(name) ||
			analysis.peerDependencies.get(name)
		);
	}

	private hasDependency(analysis: PackageAnalysis, name: string): boolean {
		return (
			analysis.dependencies.has(name) ||
			analysis.devDependencies.has(name) ||
			analysis.peerDependencies.has(name)
		);
	}

	private mapVulnerabilitySeverity(severity: string): ValidationSeverity {
		switch (severity) {
			case "critical":
			case "high":
				return "error";
			case "moderate":
				return "warning";
			case "low":
			default:
				return "info";
		}
	}

	private async findUnusedDependencies(
		packageJsonPath: string,
		analysis: PackageAnalysis,
	): Promise<string[]> {
		// This is a simplified implementation
		// A full implementation would scan all source files to check usage
		const unusedDeps: string[] = [];

		// Get project root directory
		const projectRoot = path.dirname(packageJsonPath);

		try {
			// Scan source files for import usage
			const sourceFiles = await this.findSourceFiles(projectRoot);
			const usedPackages = new Set<string>();

			for (const sourceFile of sourceFiles) {
				try {
					const content = await fs.readFile(sourceFile, "utf-8");
					const ast = this.parseCode(content, sourceFile);

					if (ast) {
						traverse(ast, {
							ImportDeclaration(path) {
								const node = path.node;

								if (t.isStringLiteral(node.source)) {
									const packageName = this.extractPackageName(
										node.source.value,
									);
									if (packageName) {
										usedPackages.add(packageName);
									}
								}
							},
						});
					}
				} catch (error) {
					// Skip files that can't be parsed
					continue;
				}
			}

			// Check which dependencies are not used
			for (const [name] of analysis.dependencies) {
				if (
					!usedPackages.has(name) &&
					!this.config.requiredPackages.includes(name)
				) {
					unusedDeps.push(name);
				}
			}
		} catch (error) {
			logger.debug("Failed to scan for unused dependencies:", error);
		}

		return unusedDeps;
	}

	private async findSourceFiles(directory: string): Promise<string[]> {
		const sourceFiles: string[] = [];

		try {
			const entries = await fs.readdir(directory, { withFileTypes: true });

			for (const entry of entries) {
				const fullPath = path.join(directory, entry.name);

				if (entry.isDirectory()) {
					// Skip node_modules and common build directories
					if (!["node_modules", "dist", "build", ".git"].includes(entry.name)) {
						const subFiles = await this.findSourceFiles(fullPath);
						sourceFiles.push(...subFiles);
					}
				} else if (entry.isFile() && this.isJavaScriptFile(entry.name)) {
					sourceFiles.push(fullPath);
				}
			}
		} catch (error) {
			// Directory might not exist or be accessible
		}

		return sourceFiles;
	}

	private findVersionConflicts(analysis: PackageAnalysis): string[] {
		const conflicts: string[] = [];
		const allDeps = new Map<string, string[]>();

		// Collect all versions of each package
		for (const [name, info] of analysis.dependencies) {
			if (!allDeps.has(name)) {
				allDeps.set(name, []);
			}
			allDeps.get(name)!.push(info.version);
		}

		for (const [name, info] of analysis.devDependencies) {
			if (!allDeps.has(name)) {
				allDeps.set(name, []);
			}
			allDeps.get(name)!.push(info.version);
		}

		// Check for multiple versions
		for (const [name, versions] of allDeps) {
			const uniqueVersions = new Set(versions);
			if (uniqueVersions.size > 1) {
				conflicts.push(`${name}: ${Array.from(uniqueVersions).join(", ")}`);
			}
		}

		return conflicts;
	}

	private async getLicenseInfo(
		packageName: string,
		version: string,
	): Promise<string | null> {
		// This would typically fetch from npm registry or package.json
		// For now, return some common licenses as examples
		const commonLicenses: Record<string, string> = {
			react: "MIT",
			lodash: "MIT",
			axios: "MIT",
			express: "MIT",
			typescript: "Apache-2.0",
		};

		return commonLicenses[packageName] || null;
	}

	private async isPackageOutdated(
		packageName: string,
		currentVersion: string,
	): Promise<boolean> {
		// This would typically check against npm registry
		// For now, use a simple heuristic based on version patterns

		// Consider packages with major version 0 as potentially outdated
		if (currentVersion.startsWith("0.")) {
			return true;
		}

		// Consider packages with very old major versions as outdated
		const majorVersion = parseInt(currentVersion.split(".")[0]);
		const outdatedMajorVersions: Record<string, number> = {
			react: 16,
			lodash: 3,
			axios: 0,
		};

		const outdatedVersion = outdatedMajorVersions[packageName];
		if (outdatedVersion !== undefined && majorVersion <= outdatedVersion) {
			return true;
		}

		return false;
	}

	private async estimateBundleSize(
		packageName: string,
		version: string,
	): Promise<number | null> {
		// This would typically use bundlephobia API or similar
		// For now, return estimated sizes for common packages
		const estimatedSizes: Record<string, number> = {
			lodash: 70000, // 70KB
			moment: 65000, // 65KB
			react: 45000, // 45KB
			axios: 15000, // 15KB
			uuid: 5000, // 5KB
		};

		return estimatedSizes[packageName] || null;
	}

	private couldCreateCircularDependency(
		file: string,
		importPath: string,
	): boolean {
		// This is a simplified check
		// A full implementation would analyze the dependency graph

		const fileName = path.basename(file, path.extname(file));
		const importFileName = path.basename(importPath, path.extname(importPath));

		// Simple heuristic: if import path contains the current file name
		return importPath.includes(fileName) || importFileName === fileName;
	}
}

// Export utility functions
export function createDependencyValidator(
	config?: Partial<DependencyConfig>,
): DependencyValidator {
	return new DependencyValidator(config);
}

export function getDefaultDependencyConfig(): DependencyConfig {
	return {
		checkOutdatedPackages: true,
		checkSecurityVulnerabilities: true,
		checkLicenseCompatibility: true,
		checkCircularDependencies: true,
		checkUnusedDependencies: true,
		checkVersionConflicts: true,
		checkPeerDependencies: true,
		enforceNorwegianCompliance: true,
		maxDependencyAge: 365,
		allowedLicenses: [
			"MIT",
			"Apache-2.0",
			"BSD-2-Clause",
			"BSD-3-Clause",
			"ISC",
		],
		bannedPackages: ["request", "bower"],
		requiredPackages: [
			"@xala-technologies/ui-system",
			"@xala-technologies/foundation",
		],
		maxDependencyDepth: 5,
		checkBundleImpact: true,
	};
}
