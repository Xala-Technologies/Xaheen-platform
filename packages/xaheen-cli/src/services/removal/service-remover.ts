/**
 * Service Remover Implementation
 *
 * Handles removal of services from projects with dependency checking,
 * file cleanup, and backup functionality.
 *
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import { promises as fs, existsSync, mkdirSync } from "node:fs";

import type { IServiceRegistry } from "../../types/index";
import type { ProjectInfo } from "../analysis/project-analyzer";

export interface DependencyAnalysis {
	blockers: Array<{
		dependentService: string;
		requiredService: string;
		reason: string;
	}>;
	warnings: string[];
}

export interface RemovalPlan {
	servicesToRemove: string[];
	filesToRemove: string[];
	filesToModify: Array<{
		path: string;
		changes: string[];
	}>;
	dependenciesToRemove: string[];
	envVariablesToRemove: string[];
	configUpdates: Array<{
		file: string;
		updates: Record<string, any>;
	}>;
}

export interface RemovalOptions {
	cleanup: boolean;
	keepConfig: boolean;
	force: boolean;
}

export interface RemovalResult {
	success: boolean;
	removedServices: string[];
	removedFiles: string[];
	modifiedFiles: string[];
	errors: string[];
	warnings: string[];
	backupPath?: string;
	postRemovalSteps: string[];
}

export class ServiceRemover {
	constructor(private serviceRegistry: IServiceRegistry) {}

	async analyzeDependencies(
		servicesToRemove: string[],
		existingServices: string[],
		projectPath: string,
	): Promise<DependencyAnalysis> {
		const blockers: DependencyAnalysis["blockers"] = [];
		const warnings: string[] = [];

		// Check service dependencies
		for (const serviceToRemove of servicesToRemove) {
			const dependentServices = await this.findDependentServices(
				serviceToRemove,
				existingServices.filter((s) => !servicesToRemove.includes(s)),
			);

			for (const dependentService of dependentServices) {
				blockers.push({
					dependentService,
					requiredService: serviceToRemove,
					reason: `${dependentService} service requires ${serviceToRemove}`,
				});
			}
		}

		// Check for configuration dependencies
		await this.checkConfigurationDependencies(
			servicesToRemove,
			projectPath,
			warnings,
		);

		// Check for code dependencies
		await this.checkCodeDependencies(servicesToRemove, projectPath, warnings);

		return { blockers, warnings };
	}

	async createRemovalPlan(
		servicesToRemove: string[],
		projectPath: string,
		projectInfo: ProjectInfo,
		options: RemovalOptions,
	): Promise<RemovalPlan> {
		const plan: RemovalPlan = {
			servicesToRemove,
			filesToRemove: [],
			filesToModify: [],
			dependenciesToRemove: [],
			envVariablesToRemove: [],
			configUpdates: [],
		};

		// Analyze each service for removal
		for (const serviceType of servicesToRemove) {
			await this.analyzeServiceForRemoval(
				serviceType,
				projectPath,
				projectInfo,
				plan,
				options,
			);
		}

		// Add cleanup operations
		if (options.cleanup) {
			await this.addCleanupOperations(plan, projectPath, projectInfo);
		}

		return plan;
	}

	async executeRemoval(
		plan: RemovalPlan,
		projectPath: string,
		options: { backup: boolean; cleanup: boolean },
	): Promise<RemovalResult> {
		const result: RemovalResult = {
			success: false,
			removedServices: [],
			removedFiles: [],
			modifiedFiles: [],
			errors: [],
			warnings: [],
			postRemovalSteps: [],
		};

		try {
			// Create backup if requested
			if (options.backup) {
				result.backupPath = await this.createBackup(projectPath);
			}

			// Remove files
			for (const filePath of plan.filesToRemove) {
				try {
					const fullPath = path.resolve(projectPath, filePath);
					if (existsSync(fullPath)) {
						await fs.rm(fullPath, { recursive: true, force: true });
						result.removedFiles.push(filePath);
						consola.debug(`Removed file: ${filePath}`);
					}
				} catch (error) {
					result.errors.push(`Failed to remove file ${filePath}: ${error}`);
				}
			}

			// Modify files
			for (const modification of plan.filesToModify) {
				try {
					await this.applyFileModification(projectPath, modification);
					result.modifiedFiles.push(modification.path);
					consola.debug(`Modified file: ${modification.path}`);
				} catch (error) {
					result.errors.push(
						`Failed to modify file ${modification.path}: ${error}`,
					);
				}
			}

			// Update package.json
			if (plan.dependenciesToRemove.length > 0) {
				try {
					await this.removeDependencies(projectPath, plan.dependenciesToRemove);
					consola.debug(
						`Removed ${plan.dependenciesToRemove.length} dependencies`,
					);
				} catch (error) {
					result.errors.push(`Failed to remove dependencies: ${error}`);
				}
			}

			// Update configuration files
			for (const configUpdate of plan.configUpdates) {
				try {
					await this.updateConfigFile(projectPath, configUpdate);
					consola.debug(`Updated config: ${configUpdate.file}`);
				} catch (error) {
					result.errors.push(
						`Failed to update config ${configUpdate.file}: ${error}`,
					);
				}
			}

			// Generate post-removal steps
			result.postRemovalSteps = this.generatePostRemovalSteps(plan);

			result.removedServices = plan.servicesToRemove;
			result.success = result.errors.length === 0;

			return result;
		} catch (error) {
			result.errors.push(`Removal execution failed: ${error}`);
			result.success = false;
			return result;
		}
	}

	private async findDependentServices(
		serviceToRemove: string,
		remainingServices: string[],
	): Promise<string[]> {
		const dependentServices: string[] = [];

		// Check each remaining service for dependencies on the service to remove
		for (const service of remainingServices) {
			const templates = await this.serviceRegistry.listTemplates(service);

			for (const template of templates) {
				const hasDependency = template.dependencies.some(
					(dep) => dep.serviceType === serviceToRemove,
				);

				if (hasDependency && !dependentServices.includes(service)) {
					dependentServices.push(service);
				}
			}
		}

		return dependentServices;
	}

	private async checkConfigurationDependencies(
		servicesToRemove: string[],
		projectPath: string,
		warnings: string[],
	): Promise<void> {
		// Check for shared configuration that might be affected
		const configFiles = [
			"next.config.js",
			"next.config.mjs",
			"nuxt.config.ts",
			"vite.config.ts",
			"svelte.config.js",
		];

		for (const configFile of configFiles) {
			const configPath = path.join(projectPath, configFile);
			if (existsSync(configPath)) {
				try {
					const content = await fs.readFile(configPath, "utf-8");

					// Simple check for service references in config
					for (const service of servicesToRemove) {
						if (content.includes(service)) {
							warnings.push(
								`Configuration file ${configFile} may reference ${service} service`,
							);
						}
					}
				} catch (error) {
					consola.debug(`Could not analyze config file ${configFile}:`, error);
				}
			}
		}
	}

	private async checkCodeDependencies(
		servicesToRemove: string[],
		projectPath: string,
		warnings: string[],
	): Promise<void> {
		// Check for imports and usage in source code
		const srcPath = path.join(projectPath, "src");
		if (!existsSync(srcPath)) return;

		try {
			// Use grep to find potential references
			const result = await execa(
				"grep",
				[
					"-r",
					"--include=*.ts",
					"--include=*.tsx",
					"--include=*.js",
					"--include=*.jsx",
					"-l", // Only show filenames
					servicesToRemove.join("|"),
					"src/",
				],
				{
					cwd: projectPath,
					stdio: "pipe",
					reject: false,
				},
			);

			if (result.stdout) {
				const files = result.stdout.split("\n").filter(Boolean);
				if (files.length > 0) {
					warnings.push(
						`Found potential references in ${files.length} file(s) - manual review recommended`,
					);
				}
			}
		} catch (error) {
			consola.debug("Could not scan for code dependencies:", error);
		}
	}

	private async analyzeServiceForRemoval(
		serviceType: string,
		projectPath: string,
		projectInfo: ProjectInfo,
		plan: RemovalPlan,
		options: RemovalOptions,
	): Promise<void> {
		// Get service templates to understand what was installed
		const templates = await this.serviceRegistry.listTemplates(serviceType);
		if (templates.length === 0) return;

		// Use the first template as a reference (could be enhanced to detect actual provider)
		const template = templates[0];

		// Analyze injection points to determine what to remove
		for (const injectionPoint of template.injectionPoints) {
			const targetPath = injectionPoint.target;

			switch (injectionPoint.type) {
				case "file-create":
					if (!options.keepConfig || !this.isConfigFile(targetPath)) {
						plan.filesToRemove.push(targetPath);
					}
					break;

				case "file-append":
				case "file-prepend":
				case "file-replace":
				case "ast-modify":
					// These require more sophisticated removal - add to modify list
					const existingModification = plan.filesToModify.find(
						(m) => m.path === targetPath,
					);
					if (existingModification) {
						existingModification.changes.push(
							`Remove ${serviceType} modifications`,
						);
					} else {
						plan.filesToModify.push({
							path: targetPath,
							changes: [`Remove ${serviceType} modifications`],
						});
					}
					break;

				case "json-merge":
					// Handle package.json and other JSON file updates
					if (targetPath === "package.json") {
						// Parse the template to extract dependencies
						try {
							const templateData = JSON.parse(injectionPoint.template);
							if (templateData.dependencies) {
								plan.dependenciesToRemove.push(
									...Object.keys(templateData.dependencies),
								);
							}
							if (templateData.devDependencies) {
								plan.dependenciesToRemove.push(
									...Object.keys(templateData.devDependencies),
								);
							}
						} catch (error) {
							consola.debug(
								`Could not parse template for ${serviceType}:`,
								error,
							);
						}
					} else {
						// Other JSON files
						plan.configUpdates.push({
							file: targetPath,
							updates: { [`remove_${serviceType}`]: true },
						});
					}
					break;
			}
		}

		// Add environment variables to remove
		template.envVariables.forEach((envVar) => {
			plan.envVariablesToRemove.push(envVar.name);
		});
	}

	private async addCleanupOperations(
		plan: RemovalPlan,
		projectPath: string,
		projectInfo: ProjectInfo,
	): Promise<void> {
		// Find orphaned files in lib directory
		const libPath = path.join(projectPath, "src/lib");
		if (existsSync(libPath)) {
			const files = await fs.readdir(libPath);

			for (const file of files) {
				const filePath = `src/lib/${file}`;
				const serviceType = this.detectServiceTypeFromFile(file);

				if (serviceType && plan.servicesToRemove.includes(serviceType)) {
					if (!plan.filesToRemove.includes(filePath)) {
						plan.filesToRemove.push(filePath);
					}
				}
			}
		}

		// Check for unused dependencies
		const unusedDeps = await this.findUnusedDependencies(
			projectPath,
			plan.dependenciesToRemove,
		);
		plan.dependenciesToRemove.push(...unusedDeps);
	}

	private isConfigFile(filePath: string): boolean {
		const configFiles = [
			".env",
			".env.example",
			".env.local",
			"package.json",
			"tsconfig.json",
			"next.config.js",
			"next.config.mjs",
			"nuxt.config.ts",
		];

		return configFiles.some((config) => filePath.includes(config));
	}

	private detectServiceTypeFromFile(fileName: string): string | null {
		const servicePatterns = {
			auth: ["auth", "session", "user"],
			database: ["db", "prisma", "database"],
			payments: ["stripe", "payment", "billing"],
			email: ["email", "mail", "resend"],
			analytics: ["analytics", "posthog", "tracking"],
			monitoring: ["sentry", "monitoring", "error"],
			cache: ["cache", "redis"],
		};

		for (const [serviceType, patterns] of Object.entries(servicePatterns)) {
			if (
				patterns.some((pattern) => fileName.toLowerCase().includes(pattern))
			) {
				return serviceType;
			}
		}

		return null;
	}

	private async findUnusedDependencies(
		projectPath: string,
		removingDeps: string[],
	): Promise<string[]> {
		// This is a simplified implementation
		// In practice, this would be more sophisticated
		return [];
	}

	private async applyFileModification(
		projectPath: string,
		modification: { path: string; changes: string[] },
	): Promise<void> {
		const fullPath = path.resolve(projectPath, modification.path);

		if (!existsSync(fullPath)) {
			return;
		}

		// For now, just add a comment indicating manual review is needed
		// In a full implementation, this would use AST manipulation
		const content = await fs.readFile(fullPath, "utf-8");
		const updatedContent = `// TODO: Manual review needed - service removal\n${content}`;

		await fs.writeFile(fullPath, updatedContent);
	}

	private async removeDependencies(
		projectPath: string,
		dependencies: string[],
	): Promise<void> {
		const packageJsonPath = path.join(projectPath, "package.json");
		if (!existsSync(packageJsonPath)) return;

		const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
		const packageJson = JSON.parse(packageJsonContent);

		// Remove from dependencies and devDependencies
		dependencies.forEach((dep) => {
			if (packageJson.dependencies?.[dep]) {
				delete packageJson.dependencies[dep];
			}
			if (packageJson.devDependencies?.[dep]) {
				delete packageJson.devDependencies[dep];
			}
		});

		await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
	}

	private async updateConfigFile(
		projectPath: string,
		configUpdate: { file: string; updates: Record<string, any> },
	): Promise<void> {
		const fullPath = path.resolve(projectPath, configUpdate.file);

		if (!existsSync(fullPath)) {
			return;
		}

		if (configUpdate.file.endsWith(".json")) {
			const contentStr = await fs.readFile(fullPath, 'utf-8');
			const content = JSON.parse(contentStr);
			Object.assign(content, configUpdate.updates);
			await fs.writeFile(fullPath, JSON.stringify(content, null, 2), 'utf-8');
		}
	}

	private generatePostRemovalSteps(plan: RemovalPlan): string[] {
		const steps: string[] = [];

		if (plan.dependenciesToRemove.length > 0) {
			steps.push("Run `npm install` to clean up removed dependencies");
		}

		if (plan.filesToModify.length > 0) {
			steps.push("Review modified files for any remaining service references");
		}

		if (plan.envVariablesToRemove.length > 0) {
			steps.push("Update .env files to remove unused environment variables");
		}

		steps.push(
			"Test the application to ensure removed services are not causing issues",
		);

		return steps;
	}

	private async createBackup(projectPath: string): Promise<string> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		const backupDir = path.join(projectPath, ".xaheen-backups");
		const backupPath = path.join(backupDir, `backup-${timestamp}`);

		if (!existsSync(backupDir)) {
			mkdirSync(backupDir, { recursive: true });
		}

		// Copy important files
		const importantPaths = [
			"package.json",
			"src/lib",
			".env.example",
			"prisma",
			"next.config.js",
			"next.config.mjs",
		];

		for (const importantPath of importantPaths) {
			const srcPath = path.join(projectPath, importantPath);
			const destPath = path.join(backupPath, importantPath);

			if (existsSync(srcPath)) {
				await fs.cp(srcPath, destPath, { recursive: true });
			}
		}

		return backupPath;
	}
}
