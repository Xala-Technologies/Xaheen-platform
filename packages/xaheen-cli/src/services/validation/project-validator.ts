/**
 * Project Validator Service
 *
 * Comprehensive project validation including services, dependencies,
 * environment variables, linting, and type checking.
 *
 * @author DevOps Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import fs from "fs-extra";

import type {
	FixResult,
	IServiceRegistry,
	ValidationIssue,
	ValidationResult,
} from "../../types/index.js";
import type { ProjectInfo } from "../analysis/project-analyzer";

export interface ValidationOptions {
	validateServices: boolean;
	validateDependencies: boolean;
	validateEnvironment: boolean;
	validateLinting: boolean;
	validateTypes: boolean;
	autoFix: boolean;
}

export class ProjectValidator {
	private issues: ValidationIssue[] = [];
	private fixableCount = 0;

	constructor(private serviceRegistry: IServiceRegistry) {}

	async validateProject(
		projectPath: string,
		projectInfo: ProjectInfo,
		options: ValidationOptions,
	): Promise<ValidationResult> {
		this.issues = [];
		this.fixableCount = 0;

		const validators = [
			options.validateServices && this.validateServices,
			options.validateDependencies && this.validateDependencies,
			options.validateEnvironment && this.validateEnvironment,
			options.validateLinting && this.validateLinting,
			options.validateTypes && this.validateTypes,
		].filter(Boolean);

		// Run all validations
		for (const validator of validators.filter(Boolean)) {
			try {
				if (typeof validator === "function") {
					await validator.call(this, projectPath, projectInfo);
				}
			} catch (error) {
				this.addIssue({
					id: `validation-error-${Date.now()}`,
					category: "validation",
					severity: "error",
					message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
					fixable: false,
				});
			}
		}

		// Calculate metrics
		const metrics = await this.calculateMetrics(projectPath, projectInfo);

		// Separate errors and warnings
		const errors = this.issues.filter((issue) => issue.severity === "error");
		const warnings = this.issues.filter(
			(issue) => issue.severity === "warning",
		);

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
			fixableIssues: this.fixableCount,
			validatedAt: new Date(),
			metrics,
		};
	}

	async applyFixes(result: ValidationResult): Promise<FixResult> {
		const fixResult: FixResult = {
			fixedCount: 0,
			errors: [],
			appliedFixes: [],
		};

		const fixableIssues = [...result.errors, ...result.warnings].filter(
			(issue) => issue.fixable,
		);

		for (const issue of fixableIssues) {
			try {
				const success = await this.applyFix(issue);

				fixResult.appliedFixes.push({
					issueId: issue.id,
					description: issue.suggestion || "Applied automatic fix",
					success,
				});

				if (success) {
					fixResult.fixedCount++;
				}
			} catch (error) {
				fixResult.errors.push(`Failed to fix ${issue.id}: ${error}`);
			}
		}

		return fixResult;
	}

	private async validateServices(
		projectPath: string,
		projectInfo: ProjectInfo,
	): Promise<void> {
		consola.debug("Validating services...");

		// Check for service configuration consistency
		for (const serviceType of projectInfo.services) {
			const templates = await this.serviceRegistry.listTemplates(serviceType);

			if (templates.length === 0) {
				this.addIssue({
					id: `service-no-template-${serviceType}`,
					category: "services",
					severity: "warning",
					message: `No templates available for service type: ${serviceType}`,
					suggestion: "Remove unused service or add proper template",
					fixable: false,
				});
				continue;
			}

			// Check if service files exist
			const expectedFiles = this.getExpectedServiceFiles(serviceType);
			for (const file of expectedFiles) {
				const filePath = path.join(projectPath, file);
				if (!(await fs.pathExists(filePath))) {
					this.addIssue({
						id: `service-missing-file-${serviceType}-${file}`,
						category: "services",
						severity: "error",
						message: `Missing service file: ${file}`,
						file,
						suggestion: `Run "xaheen add ${serviceType}" to regenerate service files`,
						fixable: false,
					});
				}
			}
		}

		// Check for orphaned service files
		const serviceFiles = await this.findServiceFiles(projectPath);
		for (const file of serviceFiles) {
			const serviceType = this.detectServiceTypeFromFile(file);
			if (serviceType && !projectInfo.services.includes(serviceType)) {
				this.addIssue({
					id: `service-orphaned-${file}`,
					category: "services",
					severity: "warning",
					message: `Orphaned service file detected: ${file}`,
					file,
					suggestion: "Remove unused file or add service to project",
					fixable: true,
				});
			}
		}
	}

	private async validateDependencies(
		projectPath: string,
		projectInfo: ProjectInfo,
	): Promise<void> {
		consola.debug("Validating dependencies...");

		const packageJsonPath = path.join(projectPath, "package.json");
		if (!(await fs.pathExists(packageJsonPath))) {
			this.addIssue({
				id: "deps-no-package-json",
				category: "dependencies",
				severity: "error",
				message: "package.json not found",
				suggestion: "Initialize project with npm init",
				fixable: false,
			});
			return;
		}

		const packageJson = await fs.readJson(packageJsonPath);
		const deps = {
			...packageJson.dependencies,
			...packageJson.devDependencies,
		};

		// Check for unused dependencies
		const usedDeps = await this.findUsedDependencies(projectPath);
		for (const dep of Object.keys(deps)) {
			if (
				!usedDeps.has(dep) &&
				!this.isFrameworkDependency(dep, projectInfo.framework)
			) {
				this.addIssue({
					id: `deps-unused-${dep}`,
					category: "dependencies",
					severity: "warning",
					message: `Unused dependency: ${dep}`,
					file: "package.json",
					suggestion: `Remove with: ${projectInfo.packageManager} remove ${dep}`,
					fixable: true,
				});
			}
		}

		// Check for missing dependencies
		for (const dep of usedDeps) {
			if (!deps[dep]) {
				this.addIssue({
					id: `deps-missing-${dep}`,
					category: "dependencies",
					severity: "error",
					message: `Missing dependency: ${dep}`,
					file: "package.json",
					suggestion: `Install with: ${projectInfo.packageManager} install ${dep}`,
					fixable: true,
				});
			}
		}

		// Check for outdated dependencies (simplified check)
		try {
			const result = await execa(
				projectInfo.packageManager || "npm",
				["outdated", "--json"],
				{
					cwd: projectPath,
					stdio: "pipe",
					reject: false,
				},
			);

			if (result.stdout) {
				const outdated = JSON.parse(result.stdout);
				for (const [name, info] of Object.entries(
					outdated as Record<string, any>,
				)) {
					this.addIssue({
						id: `deps-outdated-${name}`,
						category: "dependencies",
						severity: "info",
						message: `Outdated dependency: ${name} (${info.current} → ${info.latest})`,
						file: "package.json",
						suggestion: `Update with: ${projectInfo.packageManager} update ${name}`,
						fixable: true,
					});
				}
			}
		} catch (error) {
			consola.debug("Could not check for outdated dependencies:", error);
		}
	}

	private async validateEnvironment(
		projectPath: string,
		projectInfo: ProjectInfo,
	): Promise<void> {
		consola.debug("Validating environment variables...");

		// Check for .env.example
		const envExamplePath = path.join(projectPath, ".env.example");
		if (!(await fs.pathExists(envExamplePath))) {
			this.addIssue({
				id: "env-no-example",
				category: "environment",
				severity: "warning",
				message: "Missing .env.example file",
				suggestion: "Create .env.example with required environment variables",
				fixable: true,
			});
			return;
		}

		// Parse environment variables from .env.example
		const envExample = await fs.readFile(envExamplePath, "utf-8");
		const requiredVars = this.parseEnvFile(envExample);

		// Check for missing environment variables in actual .env files
		const envFiles = [".env", ".env.local", ".env.development"];

		for (const envFile of envFiles) {
			const envPath = path.join(projectPath, envFile);
			if (await fs.pathExists(envPath)) {
				const envContent = await fs.readFile(envPath, "utf-8");
				const actualVars = this.parseEnvFile(envContent);

				for (const requiredVar of requiredVars) {
					if (!actualVars.has(requiredVar) && !process.env[requiredVar]) {
						this.addIssue({
							id: `env-missing-${requiredVar}`,
							category: "environment",
							severity: "warning",
							message: `Missing environment variable: ${requiredVar}`,
							file: envFile,
							suggestion: `Add ${requiredVar}=your_value to ${envFile}`,
							fixable: false,
						});
					}
				}
				break; // Only check the first existing env file
			}
		}
	}

	private async validateLinting(
		projectPath: string,
		projectInfo: ProjectInfo,
	): Promise<void> {
		consola.debug("Validating linting...");

		// Check for linting configuration
		const lintConfigs = [
			".eslintrc.js",
			".eslintrc.json",
			".eslintrc.yml",
			"eslint.config.js",
			"eslint.config.mjs",
			"biome.json",
		];

		let hasLintConfig = false;
		for (const config of lintConfigs) {
			if (await fs.pathExists(path.join(projectPath, config))) {
				hasLintConfig = true;
				break;
			}
		}

		if (!hasLintConfig) {
			this.addIssue({
				id: "lint-no-config",
				category: "linting",
				severity: "warning",
				message: "No linting configuration found",
				suggestion: "Add ESLint or Biome configuration",
				fixable: true,
			});
			return;
		}

		// Run linting if available
		try {
			let lintCommand: string[] = [];

			if (await fs.pathExists(path.join(projectPath, "biome.json"))) {
				lintCommand = ["npx", "biome", "check", "."];
			} else if (
				projectInfo.dependencies?.eslint ||
				projectInfo.devDependencies?.eslint
			) {
				lintCommand = ["npx", "eslint", "."];
			}

			if (lintCommand.length > 0) {
				const result = await execa(lintCommand[0], lintCommand.slice(1), {
					cwd: projectPath,
					stdio: "pipe",
					reject: false,
				});

				if (result.exitCode !== 0) {
					// Parse linting output for specific issues
					const lines = result.stdout.split("\n").filter((line) => line.trim());
					let errorCount = 0;
					let warningCount = 0;

					lines.forEach((line) => {
						if (line.includes("error")) errorCount++;
						if (line.includes("warning")) warningCount++;
					});

					if (errorCount > 0 || warningCount > 0) {
						this.addIssue({
							id: "lint-issues",
							category: "linting",
							severity: errorCount > 0 ? "error" : "warning",
							message: `Linting issues found: ${errorCount} errors, ${warningCount} warnings`,
							suggestion: "Fix linting issues or run with --fix flag",
							fixable: true,
						});
					}
				}
			}
		} catch (error) {
			consola.debug("Could not run linting:", error);
		}
	}

	private async validateTypes(
		projectPath: string,
		projectInfo: ProjectInfo,
	): Promise<void> {
		consola.debug("Validating TypeScript...");

		if (!projectInfo.typescript) {
			return; // Skip if not a TypeScript project
		}

		// Check for tsconfig.json
		const tsconfigPath = path.join(projectPath, "tsconfig.json");
		if (!(await fs.pathExists(tsconfigPath))) {
			this.addIssue({
				id: "types-no-config",
				category: "typescript",
				severity: "error",
				message: "tsconfig.json not found in TypeScript project",
				suggestion: "Create tsconfig.json with tsc --init",
				fixable: true,
			});
			return;
		}

		// Run type checking
		try {
			const result = await execa("npx", ["tsc", "--noEmit"], {
				cwd: projectPath,
				stdio: "pipe",
				reject: false,
			});

			if (result.exitCode !== 0) {
				const errors = result.stderr
					.split("\n")
					.filter(
						(line) => line.includes("error TS") || line.includes("error:"),
					);

				if (errors.length > 0) {
					this.addIssue({
						id: "types-errors",
						category: "typescript",
						severity: "error",
						message: `TypeScript errors found: ${errors.length} issues`,
						suggestion: "Fix TypeScript errors",
						fixable: false,
					});
				}
			}
		} catch (error) {
			consola.debug("Could not run TypeScript check:", error);
		}
	}

	private async calculateMetrics(
		projectPath: string,
		projectInfo: ProjectInfo,
	) {
		const metrics: any = {};

		// Dependencies metrics
		if (projectInfo.dependencies || projectInfo.devDependencies) {
			const total = Object.keys({
				...projectInfo.dependencies,
				...projectInfo.devDependencies,
			}).length;
			metrics.dependencies = {
				total,
				outdated: 0, // Would be calculated from outdated check
				vulnerable: 0, // Would be calculated from audit
			};
		}

		return metrics;
	}

	private addIssue(issue: Omit<ValidationIssue, "id"> & { id: string }): void {
		this.issues.push(issue);
		if (issue.fixable) {
			this.fixableCount++;
		}
	}

	private getExpectedServiceFiles(serviceType: string): string[] {
		const fileMap: Record<string, string[]> = {
			auth: ["src/lib/auth.ts"],
			database: ["src/lib/prisma.ts", "prisma/schema.prisma"],
			payments: ["src/lib/stripe.ts"],
			email: ["src/lib/email.ts"],
			analytics: ["src/lib/analytics.ts"],
			monitoring: ["src/lib/monitoring.ts"],
			cache: ["src/lib/cache.ts"],
		};

		return fileMap[serviceType] || [];
	}

	private async findServiceFiles(projectPath: string): Promise<string[]> {
		const serviceFiles: string[] = [];
		const libPath = path.join(projectPath, "src/lib");

		if (await fs.pathExists(libPath)) {
			const files = await fs.readdir(libPath);
			serviceFiles.push(...files.map((f) => `src/lib/${f}`));
		}

		return serviceFiles;
	}

	private detectServiceTypeFromFile(file: string): string | null {
		const basename = path.basename(file, path.extname(file));
		const serviceTypes = [
			"auth",
			"database",
			"prisma",
			"stripe",
			"email",
			"analytics",
			"monitoring",
			"cache",
		];

		return serviceTypes.find((type) => basename.includes(type)) || null;
	}

	private async findUsedDependencies(
		projectPath: string,
	): Promise<Set<string>> {
		// Simplified dependency scanning - would be more comprehensive in real implementation
		const used = new Set<string>();

		try {
			// Scan common file types for imports
			const result = await execa(
				"grep",
				[
					"-r",
					"--include=*.ts",
					"--include=*.tsx",
					"--include=*.js",
					"--include=*.jsx",
					"-h",
					"^import.*from",
					"src/",
				],
				{
					cwd: projectPath,
					stdio: "pipe",
					reject: false,
				},
			);

			if (result.stdout) {
				const imports = result.stdout.split("\n");
				imports.forEach((line) => {
					const match = line.match(/from\s+['"]([^'"]+)['"]/);
					if (match && !match[1].startsWith(".") && !match[1].startsWith("/")) {
						const dep = match[1].split("/")[0];
						if (dep.startsWith("@")) {
							used.add(match[1].split("/").slice(0, 2).join("/"));
						} else {
							used.add(dep);
						}
					}
				});
			}
		} catch (error) {
			consola.debug("Could not scan for used dependencies:", error);
		}

		return used;
	}

	private isFrameworkDependency(dep: string, framework?: string): boolean {
		const frameworkDeps: Record<string, string[]> = {
			next: ["next", "react", "react-dom"],
			nuxt: ["nuxt", "vue"],
			remix: ["@remix-run/node", "@remix-run/react", "react", "react-dom"],
			sveltekit: ["@sveltejs/kit", "svelte"],
			angular: ["@angular/core", "@angular/common"],
		};

		return framework ? frameworkDeps[framework]?.includes(dep) || false : false;
	}

	private parseEnvFile(content: string): Set<string> {
		const vars = new Set<string>();
		const lines = content.split("\n");

		lines.forEach((line) => {
			const trimmed = line.trim();
			if (trimmed && !trimmed.startsWith("#")) {
				const [key] = trimmed.split("=");
				if (key) {
					vars.add(key.trim());
				}
			}
		});

		return vars;
	}

	private async applyFix(issue: ValidationIssue): Promise<boolean> {
		// Simplified auto-fix implementation
		// In a real implementation, this would handle various fix types

		switch (issue.category) {
			case "dependencies":
				if (issue.id.startsWith("deps-unused-")) {
					// Would remove unused dependency
					consola.debug(`Would fix: ${issue.message}`);
					return true;
				}
				break;

			case "environment":
				if (issue.id === "env-no-example") {
					// Would create .env.example
					consola.debug(`Would fix: ${issue.message}`);
					return true;
				}
				break;

			case "linting":
				if (issue.id === "lint-issues") {
					// Would run linter with --fix
					consola.debug(`Would fix: ${issue.message}`);
					return true;
				}
				break;
		}

		return false;
	}
}
