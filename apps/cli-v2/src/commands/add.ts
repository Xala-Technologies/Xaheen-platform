/**
 * Add Command - Add services to existing projects
 *
 * Detects project configuration and intelligently adds new services
 * with proper dependency resolution and compatibility checking.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import {
	cancel,
	confirm,
	intro,
	isCancel,
	outro,
	select,
	spinner,
} from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";
import { consola } from "consola";
import * as fs from "fs-extra";
import * as path from "path";
import { ProjectAnalyzer } from "../services/analysis/project-analyzer.js";
import { ServiceInjector } from "../services/injection/service-injector.js";
import { ServiceRegistry } from "../services/registry/service-registry.js";
import type {
	ProjectContext,
	ServiceConfiguration,
	ServiceTemplate,
	XalaPlatform,
	XalaIntegrationOptions,
} from "../types/index.js";
import { XalaIntegrationService } from "../services/xala-ui/xala-integration-service.js";

export const addCommand = new Command("add")
	.description("Add a service to existing project")
	.argument("[service]", "Service type to add (auth, payments, database, etc.)")
	.option("-p, --provider <provider>", "Service provider")
	.option("-f, --force", "Force add even if conflicts exist")
	.option("--dry-run", "Preview changes without applying them")
	.option("--skip-install", "Skip dependency installation")
	.action(async (serviceType, options) => {
		try {
			intro(chalk.cyan("🔧 Adding service to project"));

			// Initialize services
			const registry = new ServiceRegistry();
			const injector = new ServiceInjector();
			const analyzer = new ProjectAnalyzer();

			await registry.initialize();

			// Analyze current project
			const projectPath = process.cwd();
			const s = spinner();
			s.start("Analyzing project...");

			const projectInfo = await analyzer.analyzeProject(projectPath);

			if (!projectInfo.isValid) {
				s.stop("Project analysis failed");
				consola.error("Could not detect valid project in current directory");

				const shouldInit = await confirm({
					message: "No project detected. Create a new project instead?",
					initialValue: false,
				});

				if (shouldInit) {
					consola.info('Run "xaheen create" to create a new project');
				}
				process.exit(1);
			}

			s.stop("Project analyzed");

			// Display project info
			consola.info("\nProject Details:");
			consola.info(`  Name: ${chalk.green(projectInfo.name)}`);
			consola.info(
				`  Framework: ${chalk.green(projectInfo.framework || "Unknown")}`,
			);
			consola.info(`  Backend: ${chalk.green(projectInfo.backend || "None")}`);
			consola.info(
				`  Database: ${chalk.green(projectInfo.database || "None")}`,
			);

			if (projectInfo.services.length > 0) {
				consola.info(
					`  Existing services: ${projectInfo.services.map((s) => chalk.blue(s)).join(", ")}`,
				);
			}

			// Select service type if not provided
			const selectedServiceType =
				serviceType || (await selectServiceType(projectInfo.services));

			if (isCancel(selectedServiceType)) {
				cancel("Service addition cancelled");
				process.exit(0);
			}

			// Handle Xala UI services specially
			if (selectedServiceType === "ui" || selectedServiceType === "ui-integration") {
				await handleXalaUIIntegration(projectPath, projectInfo, options);
				return;
			}

			if (selectedServiceType === "ui-component") {
				await handleXalaUIComponentGeneration(projectPath, projectInfo, options);
				return;
			}

			// Get available providers for the service type
			const templates = await registry.listTemplates(selectedServiceType);

			if (templates.length === 0) {
				consola.error(
					`No providers available for service type: ${selectedServiceType}`,
				);
				process.exit(1);
			}

			// Select provider
			let selectedProvider = options.provider;

			if (!selectedProvider) {
				if (templates.length === 1) {
					selectedProvider = templates[0].provider;
					consola.info(`Using provider: ${chalk.green(selectedProvider)}`);
				} else {
					selectedProvider = await selectProvider(templates, projectInfo);

					if (isCancel(selectedProvider)) {
						cancel("Service addition cancelled");
						process.exit(0);
					}
				}
			}

			// Get the selected template
			const template = templates.find((t) => t.provider === selectedProvider);

			if (!template) {
				consola.error(`Provider not found: ${selectedProvider}`);
				process.exit(1);
			}

			// Check compatibility
			const compatibility = await checkCompatibility(template, projectInfo);

			if (!compatibility.isCompatible && !options.force) {
				consola.error("Service is not compatible with current project:");
				compatibility.issues.forEach((issue) => consola.error(`  - ${issue}`));

				const shouldForce = await confirm({
					message: "Add anyway?",
					initialValue: false,
				});

				if (isCancel(shouldForce) || !shouldForce) {
					cancel("Service addition cancelled");
					process.exit(0);
				}
			}

			// Check for existing service conflicts
			if (
				projectInfo.services.includes(selectedServiceType) &&
				!options.force
			) {
				consola.warn(
					`Service type "${selectedServiceType}" already exists in project`,
				);

				const shouldReplace = await confirm({
					message: "Replace existing service?",
					initialValue: false,
				});

				if (isCancel(shouldReplace) || !shouldReplace) {
					cancel("Service addition cancelled");
					process.exit(0);
				}
			}

			// Show what will be added
			consola.info("\nService to add:");
			consola.info(`  Type: ${chalk.green(selectedServiceType)}`);
			consola.info(`  Provider: ${chalk.green(selectedProvider)}`);
			consola.info(`  Version: ${chalk.green(template.version)}`);

			if (template.envVariables.length > 0) {
				consola.info(
					`  Environment variables: ${template.envVariables.length}`,
				);
			}

			if (template.dependencies.length > 0) {
				consola.info(
					`  Dependencies: ${template.dependencies.map((d) => d.serviceType).join(", ")}`,
				);
			}

			// Confirm addition
			const shouldAdd = await confirm({
				message: "Add this service to your project?",
				initialValue: true,
			});

			if (isCancel(shouldAdd) || !shouldAdd) {
				cancel("Service addition cancelled");
				process.exit(0);
			}

			// Create project context
			const projectContext: ProjectContext = {
				name: projectInfo.name,
				framework: projectInfo.framework || "",
				backend: projectInfo.backend,
				database: projectInfo.database,
				platform: projectInfo.platform || "web",
				packageManager: projectInfo.packageManager || "npm",
				typescript: projectInfo.typescript,
				git: true,
				features: projectInfo.features || [],
			};

			// Create service configuration
			const serviceConfig: ServiceConfiguration = {
				serviceId: `${selectedServiceType}-${Date.now()}`,
				serviceType: selectedServiceType as any,
				provider: selectedProvider,
				version: template.version,
				required: true,
				priority: 50,
				configuration: template as any,
				environmentVariables: template.envVariables.map((env) => ({
					name: env.name,
					value: env.defaultValue,
					required: env.required,
				})),
				dependencies: template.dependencies,
				postInstallSteps: template.postInjectionSteps.map(
					(step) => step.description,
				),
				verificationSteps: [],
			};

			// Inject the service
			s.start("Adding service to project...");

			const result = await injector.injectService(
				serviceConfig,
				template,
				projectPath,
				projectContext,
				{
					dryRun: options.dryRun,
					force: options.force,
				},
			);

			s.stop(
				result.status === "success"
					? "Service added successfully"
					: "Service addition failed",
			);

			if (result.status === "failed") {
				consola.error("Failed to add service:");
				result.errors.forEach((err) => consola.error(`  - ${err}`));
				process.exit(1);
			}

			if (result.warnings.length > 0) {
				consola.warn("Warnings:");
				result.warnings.forEach((warn) => consola.warn(`  - ${warn}`));
			}

			// Display results
			if (options.dryRun) {
				consola.info("\n[DRY RUN] Changes that would be made:");
			} else {
				consola.info("\nChanges made:");
			}

			if (result.createdFiles.length > 0) {
				consola.info("  Created files:");
				result.createdFiles.forEach((file) =>
					consola.info(`    - ${chalk.green(file)}`),
				);
			}

			if (result.injectedFiles.length > 0) {
				consola.info("  Modified files:");
				result.injectedFiles.forEach((file) =>
					consola.info(`    - ${chalk.blue(file)}`),
				);
			}

			if (result.environmentVariables.length > 0) {
				consola.info("  Environment variables added:");
				result.environmentVariables.forEach((env) =>
					consola.info(
						`    - ${chalk.yellow(env.name)}${env.required ? " (required)" : ""}`,
					),
				);
			}

			// Install dependencies
			if (!options.skipInstall && !options.dryRun) {
				s.start("Installing dependencies...");

				try {
					const { execa } = await import("execa");
					await execa(projectContext.packageManager, ["install"], {
						cwd: projectPath,
						stdio: "pipe",
					});
					s.stop("Dependencies installed");
				} catch (error) {
					s.stop("Failed to install dependencies");
					consola.warn(
						"Please run install manually:",
						chalk.cyan(`${projectContext.packageManager} install`),
					);
				}
			}

			// Display post-install steps
			if (result.postInstallSteps.length > 0) {
				consola.box({
					title: "Next Steps",
					message: result.postInstallSteps
						.map((step, i) => `${i + 1}. ${step}`)
						.join("\n"),
				});
			}

			outro(chalk.green("✨ Service added successfully!"));
		} catch (error) {
			consola.error("Failed to add service:", error);
			process.exit(1);
		}
	});

async function selectServiceType(
	existingServices: string[],
): Promise<string | symbol> {
	const allServices = [
		// Core services
		{
			value: "auth",
			label: "Authentication & Authorization",
			disabled: existingServices.includes("auth"),
		},
		{
			value: "database",
			label: "Database",
			disabled: existingServices.includes("database"),
		},
		{
			value: "payments",
			label: "Payment Processing",
			disabled: existingServices.includes("payments"),
		},
		// Xala UI Services
		{
			value: "ui",
			label: "🎨 Xala UI System - Multi-platform semantic components",
			disabled: existingServices.includes("ui"),
		},
		{
			value: "ui-component",
			label: "🧩 UI Component - Generate semantic components",
		},
		{
			value: "ui-integration",
			label: "🔗 UI Integration - Initialize Xala UI in project",
		},
		// Other services
		{ value: "email", label: "Email Service" },
		{ value: "sms", label: "SMS Service" },
		{ value: "storage", label: "File Storage" },
		{ value: "cache", label: "Caching Layer" },
		{ value: "queue", label: "Job Queue" },
		{ value: "search", label: "Search Engine" },
		{ value: "analytics", label: "Analytics & Tracking" },
		{ value: "monitoring", label: "Error Monitoring" },
		{ value: "realtime", label: "Real-time Updates" },
		{ value: "ai", label: "AI Integration" },
		{ value: "cms", label: "Content Management" },
		{ value: "i18n", label: "Internationalization" },
	];

	return select({
		message: "Select service type to add",
		options: allServices.filter((s) => !s.disabled),
	});
}

async function selectProvider(
	templates: ServiceTemplate[],
	projectInfo: any,
): Promise<string | symbol> {
	const options = templates.map((template) => {
		let label = `${template.provider} - ${template.description}`;

		// Add compatibility indicators
		const compatIssues = [];
		if (template.frameworks.length > 0 && projectInfo.framework) {
			if (!template.frameworks.includes(projectInfo.framework)) {
				compatIssues.push("framework");
			}
		}
		if (template.databases.length > 0 && projectInfo.database) {
			if (!template.databases.includes(projectInfo.database)) {
				compatIssues.push("database");
			}
		}

		if (compatIssues.length > 0) {
			label += chalk.yellow(` (⚠️  ${compatIssues.join(", ")})`);
		}

		return {
			value: template.provider,
			label,
		};
	});

	return select({
		message: "Select service provider",
		options,
	});
}

async function checkCompatibility(
	template: ServiceTemplate,
	projectInfo: any,
): Promise<{
	isCompatible: boolean;
	issues: string[];
}> {
	const issues: string[] = [];

	// Check framework compatibility
	if (template.frameworks.length > 0 && projectInfo.framework) {
		if (!template.frameworks.includes(projectInfo.framework)) {
			issues.push(
				`Framework "${projectInfo.framework}" is not supported. Supported: ${template.frameworks.join(", ")}`,
			);
		}
	}

	// Check database compatibility
	if (template.databases.length > 0 && projectInfo.database) {
		if (!template.databases.includes(projectInfo.database)) {
			issues.push(
				`Database "${projectInfo.database}" is not supported. Supported: ${template.databases.join(", ")}`,
			);
		}
	}

	// Check platform compatibility
	if (template.platforms.length > 0 && projectInfo.platform) {
		if (!template.platforms.includes(projectInfo.platform)) {
			issues.push(
				`Platform "${projectInfo.platform}" is not supported. Supported: ${template.platforms.join(", ")}`,
			);
		}
	}

	// Check for dependency conflicts
	for (const dep of template.dependencies) {
		if (dep.required && !projectInfo.services.includes(dep.serviceType)) {
			issues.push(`Required dependency "${dep.serviceType}" is not installed`);
		}
	}

	return {
		isCompatible: issues.length === 0,
		issues,
	};
}

/**
 * Handle Xala UI Integration
 */
async function handleXalaUIIntegration(
	projectPath: string,
	projectInfo: any,
	options: any
): Promise<void> {
	const xalaService = new XalaIntegrationService(projectPath);

	try {
		// Platform selection
		const platform = await select({
			message: "Select target platform for Xala UI",
			options: [
				{ value: "nextjs", label: "Next.js (App Router + Pages Router)" },
				{ value: "react", label: "React (CRA + Vite)" },
				{ value: "vue", label: "Vue 3 (Composition API)" },
				{ value: "angular", label: "Angular (Standalone Components)" },
				{ value: "svelte", label: "Svelte (SvelteKit)" },
				{ value: "electron", label: "Electron (Desktop Apps)" },
			],
		});

		if (isCancel(platform)) {
			cancel("UI integration cancelled");
			process.exit(0);
		}

		// Theme selection
		const theme = await select({
			message: "Select UI theme",
			options: [
				{ value: "enterprise", label: "Enterprise - Business applications" },
				{ value: "healthcare", label: "Healthcare - Medical applications" },
				{ value: "finance", label: "Finance - Financial applications" },
				{ value: "government", label: "Government - Public sector" },
				{ value: "consumer", label: "Consumer - End-user applications" },
			],
		});

		if (isCancel(theme)) {
			cancel("UI integration cancelled");
			process.exit(0);
		}

		// Compliance requirements
		const compliance = await select({
			message: "Select compliance requirements (optional)",
			options: [
				{ value: [], label: "None" },
				{ value: ["wcag-aaa"], label: "WCAG AAA Accessibility" },
				{ value: ["gdpr"], label: "GDPR Privacy" },
				{ value: ["hipaa"], label: "HIPAA Healthcare" },
				{ value: ["nsm"], label: "NSM Norwegian Security" },
				{ value: ["wcag-aaa", "gdpr"], label: "WCAG AAA + GDPR" },
				{ value: ["wcag-aaa", "nsm"], label: "WCAG AAA + NSM" },
			],
		});

		if (isCancel(compliance)) {
			cancel("UI integration cancelled");
			process.exit(0);
		}

		// Initial components
		const wantComponents = await confirm({
			message: "Generate initial components (navbar, dashboard)?",
			initialValue: true,
		});

		let components: string[] = [];
		if (wantComponents && !isCancel(wantComponents)) {
			const selectedComponents = await select({
				message: "Select initial components",
				options: [
					{ value: ["navbar"], label: "Navbar only" },
					{ value: ["navbar", "dashboard"], label: "Navbar + Dashboard" },
					{ value: ["navbar", "dashboard", "layout"], label: "Full layout set" },
					{ value: [], label: "None (setup only)" },
				],
			});

			if (!isCancel(selectedComponents)) {
				components = selectedComponents as string[];
			}
		}

		// Setup localization
		const setupI18n = await confirm({
			message: "Setup internationalization (i18n)?",
			initialValue: true,
		});

		const integrationOptions: XalaIntegrationOptions = {
			platform: platform as XalaPlatform,
			theme: theme as any,
			compliance: compliance as any,
			components,
			features: ["navbar", "dashboard"],
			locale: "en",
			skipUISetup: false,
			skipLocalization: isCancel(setupI18n) || !setupI18n,
			interactive: true,
		};

		// Initialize integration
		await xalaService.initializeIntegration(integrationOptions);

		outro(chalk.green("✨ Xala UI integration completed successfully!"));

	} catch (error) {
		consola.error("Failed to integrate Xala UI:", error);
		process.exit(1);
	}
}

/**
 * Handle Xala UI Component Generation
 */
async function handleXalaUIComponentGeneration(
	projectPath: string,
	projectInfo: any,
	options: any
): Promise<void> {
	const xalaService = new XalaIntegrationService(projectPath);

	try {
		// Check if Xala UI is already integrated
		const xalaConfigPath = path.join(projectPath, 'xala.config.json');
		if (!await fs.pathExists(xalaConfigPath)) {
			consola.warn("Xala UI is not integrated in this project");
			
			const shouldIntegrate = await confirm({
				message: "Initialize Xala UI integration first?",
				initialValue: true,
			});

			if (shouldIntegrate && !isCancel(shouldIntegrate)) {
				await handleXalaUIIntegration(projectPath, projectInfo, options);
				return;
			} else {
				cancel("Component generation cancelled");
				process.exit(0);
			}
		}

		// Load Xala config to get platform
		const xalaConfig = await fs.readJson(xalaConfigPath);
		const platform = xalaConfig.ui?.platform || 'react';

		// Component selection
		const componentType = await select({
			message: "Select component type to generate",
			options: [
				{ value: "navbar", label: "🧭 Navbar - Navigation component" },
				{ value: "dashboard", label: "📊 Dashboard - Analytics dashboard" },
				{ value: "sidebar", label: "📋 Sidebar - Side navigation" },
				{ value: "modal", label: "🪟 Modal - Dialog component" },
				{ value: "form", label: "📝 Form - Data input form" },
				{ value: "card", label: "🃏 Card - Content card" },
				{ value: "data-table", label: "📋 Data Table - Sortable table" },
				{ value: "layout", label: "🏗️ Layout - Page layout" },
			],
		});

		if (isCancel(componentType)) {
			cancel("Component generation cancelled");
			process.exit(0);
		}

		// Component options
		const withStories = await confirm({
			message: "Generate Storybook stories?",
			initialValue: false,
		});

		const withTests = await confirm({
			message: "Generate test files?",
			initialValue: true,
		});

		const enterpriseMode = await confirm({
			message: "Use enterprise compliance patterns?",
			initialValue: xalaConfig.ui?.compliance?.length > 0,
		});

		// Generate component
		const result = await xalaService.generateComponents(
			[componentType as string],
			platform,
			{
				semantic: true,
				withStories: !isCancel(withStories) && withStories,
				withTests: !isCancel(withTests) && withTests,
				enterprise: !isCancel(enterpriseMode) && enterpriseMode,
			}
		);

		if (result.success) {
			consola.success(`✅ Generated ${componentType} component`);
			if (result.files.length > 0) {
				consola.info("Created files:");
				result.files.forEach(file => consola.info(`  - ${chalk.green(file)}`));
			}
		} else {
			consola.error("Failed to generate component");
			result.errors.forEach(error => consola.error(`  - ${error}`));
		}

		outro(chalk.green("✨ Component generation completed!"));

	} catch (error) {
		consola.error("Failed to generate component:", error);
		process.exit(1);
	}
}
