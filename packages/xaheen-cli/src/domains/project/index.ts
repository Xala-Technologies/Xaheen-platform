import * as prompts from "@clack/prompts";
import chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";
import { appTemplateRegistry } from "../../services/registry/app-template-registry";
import type { CLICommand, UnifiedConfig } from "../../types/index";
import { CLIError } from "../../types/index";
import { cliLogger } from "../../utils/logger";

export default class ProjectDomain {
	private get configManager() {
		return global.__xaheen_cli.configManager;
	}

	private get registry() {
		return global.__xaheen_cli.registry;
	}

	public async create(command: CLICommand): Promise<void> {
		const projectName = command.target;

		if (!projectName) {
			throw new CLIError(
				"Project name is required",
				"MISSING_PROJECT_NAME",
				"project",
				"create",
			);
		}

		cliLogger.info(`Creating new project: ${projectName}`);

		try {
			// Check if directory already exists
			const projectPath = path.resolve(process.cwd(), projectName);

			if (await fs.pathExists(projectPath)) {
				throw new CLIError(
					`Directory "${projectName}" already exists`,
					"DIRECTORY_EXISTS",
					"project",
					"create",
				);
			}

			// Get project configuration through interactive prompts
			const projectConfig = await this.getProjectConfiguration(command.options);

			// Create project structure
			await this.createProjectStructure(
				projectPath,
				projectName,
				projectConfig,
			);

			// Initialize configuration
			const configManager = this.configManager;
			configManager.clearCache(); // Clear any cached config

			// Change to project directory and initialize config
			process.chdir(projectPath);

			const initialConfig: UnifiedConfig = {
				version: "3.0.0",
				project: {
					name: projectName,
					framework: projectConfig.framework,
					packageManager: projectConfig.packageManager,
				},
				design: {
					platform: projectConfig.platform,
					theme: projectConfig.theme || "default",
				},
				compliance: {
					accessibility: "AAA",
					norwegian: projectConfig.norwegian || false,
					gdpr: projectConfig.gdpr || false,
				},
			};

			await configManager.saveConfig(initialConfig);

			// Add initial service bundle if specified
			if (projectConfig.bundle) {
				await this.addServiceBundle(projectConfig.bundle);
			}

			cliLogger.success(`Project "${projectName}" created successfully!`);

			// Show next steps
			this.showNextSteps(projectName, projectConfig);
		} catch (error) {
			if (error instanceof CLIError) {
				throw error;
			}
			throw new CLIError(
				`Failed to create project: ${error}`,
				"PROJECT_CREATION_FAILED",
				"project",
				"create",
			);
		}
	}

	public async validate(command: CLICommand): Promise<void> {
		cliLogger.info("Validating project configuration and structure...");

		try {
			// Validate configuration
			const configValidation = await this.configManager.validateConfig();

			if (!configValidation.valid) {
				cliLogger.error("Configuration validation failed:");
				configValidation.errors.forEach((error) => {
					cliLogger.error(`  • ${error}`);
				});
				return;
			}

			// Load current configuration
			const config = await this.configManager.loadConfig();

			// Check monorepo structure
			const monorepoInfo = await this.configManager.getMonorepoInfo();

			// Validate project structure
			const structureIssues = await this.validateProjectStructure(
				config,
				monorepoInfo,
			);

			// Validate services
			const serviceIssues = await this.validateServices(config);

			// Report results
			if (structureIssues.length === 0 && serviceIssues.length === 0) {
				cliLogger.success("Project validation passed! ✨");

				// Show project info
				console.log("\n" + chalk.bold("Project Information:"));
				console.log(`  Name: ${chalk.cyan(config.project.name)}`);
				console.log(`  Framework: ${chalk.cyan(config.project.framework)}`);
				console.log(
					`  Package Manager: ${chalk.cyan(config.project.packageManager)}`,
				);

				if (monorepoInfo.isMonorepo) {
					console.log(
						`  Monorepo: ${chalk.green("Yes")} (${monorepoInfo.structure})`,
					);
					console.log(
						`  Apps: ${monorepoInfo.apps.length} (${monorepoInfo.apps.join(", ")})`,
					);
					console.log(
						`  Packages: ${monorepoInfo.packages.length} (${monorepoInfo.packages.join(", ")})`,
					);
				}

				if (config.services) {
					const serviceCount = Object.keys(config.services).length;
					console.log(`  Services: ${chalk.cyan(serviceCount)} configured`);
				}
			} else {
				cliLogger.warn("Project validation found issues:");

				[...structureIssues, ...serviceIssues].forEach((issue) => {
					cliLogger.warn(`  • ${issue}`);
				});
			}
		} catch (error) {
			throw new CLIError(
				`Project validation failed: ${error}`,
				"VALIDATION_FAILED",
				"project",
				"validate",
			);
		}
	}

	private async getProjectConfiguration(options: Record<string, any>): Promise<{
		framework: string;
		platform: string;
		packageManager: string;
		theme?: string;
		bundle?: string;
		norwegian?: boolean;
		gdpr?: boolean;
	}> {
		// If options are provided via CLI flags, use them
		if (options.framework && options.platform && options.packageManager) {
			return {
				framework: options.framework,
				platform: options.platform,
				packageManager: options.packageManager,
				theme: options.theme,
				bundle: options.bundle,
				norwegian: options.norwegian,
				gdpr: options.gdpr,
			};
		}

		// Interactive prompts
		const responses = await prompts.group({
			framework: {
				type: "select",
				message: "Choose your framework:",
				options: [
					{ value: "nextjs", label: "Next.js (Recommended)" },
					{ value: "react", label: "React with Vite" },
					{ value: "vue", label: "Vue.js" },
					{ value: "angular", label: "Angular" },
					{ value: "svelte", label: "SvelteKit" },
				],
			},
			packageManager: {
				type: "select",
				message: "Choose your package manager:",
				options: [
					{ value: "bun", label: "Bun (Recommended)" },
					{ value: "pnpm", label: "pnpm" },
					{ value: "yarn", label: "Yarn" },
					{ value: "npm", label: "npm" },
				],
			},
			bundle: {
				type: "select",
				message: "Choose a service bundle:",
				options: [
					{ value: "", label: "None (manual setup)" },
					{ value: "saas-starter", label: "SaaS Starter (Auth, DB, Payments)" },
					{ value: "e-commerce", label: "E-commerce (Products, Cart, Orders)" },
					{ value: "cms", label: "CMS (Content, Media, Admin)" },
					{ value: "dashboard", label: "Analytics Dashboard" },
				],
			},
			norwegian: {
				type: "confirm",
				message: "Enable Norwegian compliance features?",
				initialValue: false,
			},
			gdpr: {
				type: "confirm",
				message: "Enable GDPR compliance features?",
				initialValue: false,
			},
		});

		return {
			framework: responses.framework as string,
			platform: this.getPlatformFromFramework(responses.framework as string),
			packageManager: responses.packageManager as string,
			theme: "default",
			bundle: (responses.bundle as string) || undefined,
			norwegian: responses.norwegian as boolean,
			gdpr: responses.gdpr as boolean,
		};
	}

	private async createProjectStructure(
		projectPath: string,
		projectName: string,
		config: any,
	): Promise<void> {
		cliLogger.step(1, 4, "Creating project directory structure...");

		// Create basic monorepo structure
		await fs.ensureDir(path.join(projectPath, "apps"));
		await fs.ensureDir(path.join(projectPath, "packages"));
		await fs.ensureDir(path.join(projectPath, "apps", "web"));

		// Create root package.json
		const rootPackageJson = {
			name: projectName,
			private: true,
			workspaces: ["apps/*", "packages/*"],
			scripts: {
				dev: "turbo dev",
				build: "turbo build",
				lint: "turbo lint",
				"type-check": "turbo type-check",
			},
			devDependencies: {
				turbo: "^2.5.5",
				typescript: "^5.7.2",
				"@xala-technologies/ui-system": "^6.1.0",
			},
			packageManager: `${config.packageManager}@latest`,
		};

		await fs.writeJson(
			path.join(projectPath, "package.json"),
			rootPackageJson,
			{ spaces: 2 },
		);

		cliLogger.step(2, 4, "Setting up monorepo configuration...");

		// Create turbo.json
		const turboJson = {
			$schema: "https://turbo.build/schema.json",
			tasks: {
				dev: {
					cache: false,
					persistent: true,
				},
				build: {
					dependsOn: ["^build"],
					outputs: [".next/**", "!.next/cache/**", "dist/**"],
				},
				lint: {},
				"type-check": {},
			},
		};

		await fs.writeJson(path.join(projectPath, "turbo.json"), turboJson, {
			spaces: 2,
		});

		cliLogger.step(3, 4, "Creating initial web application...");

		// Generate web app from template using the new app template registry
		await appTemplateRegistry.generateAppFromTemplate(
			path.join(projectPath, "apps", "web"),
			config.framework === "nextjs" ? "nextjs" : config.framework,
			{
				name: "web",
				title: projectName,
				description: `Web application for ${projectName}`,
				appName: "web",
				port: 3000,
				features: ["dashboard", "navbar"],
				framework: config.framework,
				packageManager: config.packageManager,
			},
		);

		cliLogger.step(4, 4, "Finalizing project setup...");

		// Create basic README
		const readme = `# ${projectName}

This is a monorepo project created with Xaheen CLI v3.0.0.

## Getting Started

1. Install dependencies:
   \`\`\`bash
   ${config.packageManager} install
   \`\`\`

2. Start development servers:
   \`\`\`bash
   ${config.packageManager} dev
   \`\`\`

3. Add more apps:
   \`\`\`bash
   xaheen add app <name> --platform <web|mobile|desktop>
   \`\`\`

## Project Structure

- \`apps/\` - Applications (web, mobile, desktop)
- \`packages/\` - Shared packages and libraries
- \`xaheen.config.json\` - Unified CLI configuration

## Commands

- \`xaheen service add <service>\` - Add a service
- \`xaheen component generate "<description>"\` - Generate AI components
- \`xaheen add app <name>\` - Add new application
- \`xaheen validate\` - Validate project structure
`;

		await fs.writeFile(path.join(projectPath, "README.md"), readme);
	}

	private async addServiceBundle(bundleName: string): Promise<void> {
		// This would integrate with the service domain to add a bundle
		cliLogger.info(`Adding service bundle: ${bundleName}`);
		// Implementation would delegate to ServiceDomain
	}

	private async validateProjectStructure(
		config: UnifiedConfig,
		monorepoInfo: any,
	): Promise<string[]> {
		const issues: string[] = [];

		// Check for required files
		const requiredFiles = ["package.json", "xaheen.config.json"];
		for (const file of requiredFiles) {
			if (!(await fs.pathExists(file))) {
				issues.push(`Missing required file: ${file}`);
			}
		}

		// Check monorepo structure
		if (monorepoInfo.isMonorepo) {
			if (!(await fs.pathExists("apps"))) {
				issues.push("Missing apps directory for monorepo structure");
			}
			if (!(await fs.pathExists("packages"))) {
				issues.push("Missing packages directory for monorepo structure");
			}
		}

		return issues;
	}

	private async validateServices(config: UnifiedConfig): Promise<string[]> {
		const issues: string[] = [];

		if (config.services) {
			for (const [serviceId, serviceConfig] of Object.entries(
				config.services,
			)) {
				const template = this.registry.getServiceTemplate(serviceId);
				if (!template) {
					issues.push(`Unknown service template: ${serviceId}`);
				}
			}
		}

		return issues;
	}

	private getPlatformFromFramework(framework: string): string {
		const platformMap: Record<string, string> = {
			nextjs: "react",
			react: "react",
			vue: "vue",
			angular: "angular",
			svelte: "svelte",
		};

		return platformMap[framework] || "react";
	}

	private showNextSteps(projectName: string, config: any): void {
		console.log("\n" + chalk.bold.green("🎉 Project created successfully!"));
		console.log("\n" + chalk.bold("Next steps:"));
		console.log(`  1. ${chalk.cyan(`cd ${projectName}`)}`);
		console.log(`  2. ${chalk.cyan(`${config.packageManager} install`)}`);
		console.log(`  3. ${chalk.cyan(`${config.packageManager} dev`)}`);

		if (config.bundle) {
			console.log(`\n${chalk.bold("Service bundle added:")} ${config.bundle}`);
			console.log(
				`  Run ${chalk.cyan("xaheen service list")} to see available services`,
			);
		}

		console.log(`\n${chalk.bold("Useful commands:")}`);
		console.log(
			`  ${chalk.cyan("xaheen add app <name>")} - Add new application`,
		);
		console.log(
			`  ${chalk.cyan("xaheen service add <service>")} - Add service`,
		);
		console.log(
			`  ${chalk.cyan('xaheen component generate "<description>"')} - Generate component`,
		);
		console.log(`  ${chalk.cyan("xaheen validate")} - Validate project`);
	}
}
