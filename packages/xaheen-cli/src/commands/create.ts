/**
 * Create Command - Initialize new projects
 *
 * Handles project creation with intelligent service selection,
 * bundle resolution, and template generation.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
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
import { consola } from "consola";
import fs from "fs-extra";
import { BundleResolver } from "../services/bundles/bundle-resolver";
import { ServiceInjector } from "../services/injection/service-injector";
import { ServiceRegistry } from "../services/registry/service-registry";
import { ProjectScaffolder } from "../services/scaffolding/project-scaffolder";
import type { ProjectConfig, ServiceBundle } from "../types/index";

export const createCommand = new Command("create")
	.alias("new")
	.description("Create a new project")
	.argument("[name]", "Project name")
	.option(
		"-p, --preset <preset>",
		"Use a preset bundle (e.g., saas-starter, saas-enterprise)",
	)
	.option(
		"-f, --framework <framework>",
		"Frontend framework (next, nuxt, remix, etc.)",
	)
	.option(
		"-b, --backend <backend>",
		"Backend framework (hono, express, fastify, etc.)",
	)
	.option(
		"-d, --database <database>",
		"Database (postgresql, mysql, mongodb, etc.)",
	)
	.option("--bundles <bundles...>", "Service bundles to include")
	.option("--no-install", "Skip dependency installation")
	.option("--no-git", "Skip git initialization")
	.option("--dry-run", "Preview what would be created")
	.action(async (name, options) => {
		try {
			intro(chalk.cyan("🚀 Welcome to Xaheen CLI v2"));

			// Initialize services
			const registry = new ServiceRegistry();
			const resolver = new BundleResolver(registry);
			const injector = new ServiceInjector();
			const scaffolder = new ProjectScaffolder(registry, resolver, injector);

			await registry.initialize();

			// Get project configuration
			const projectConfig = await getProjectConfig(name, options);

			if (isCancel(projectConfig)) {
				cancel("Project creation cancelled");
				process.exit(0);
			}

			// Resolve bundle
			const s = spinner();
			s.start("Resolving service bundle...");

			let bundle: ServiceBundle | null = null;

			if (options.preset) {
				bundle = await resolver.loadBundleByName(options.preset);
			} else if (options.bundles) {
				// Create custom bundle from specified services
				bundle = await resolver.createCustomBundle(options.bundles);
			} else {
				// Interactive bundle selection
				bundle = await selectBundle(resolver);
			}

			if (!bundle) {
				s.stop("Bundle resolution failed");
				consola.error("Could not resolve service bundle");
				process.exit(1);
			}

			const resolution = await resolver.resolveBundle(bundle, {
				targetFramework: projectConfig.framework,
				targetPlatform: projectConfig.platform,
				environment: "development",
				userConfig: projectConfig,
			});

			s.stop("Bundle resolved successfully");

			if (resolution.status === "failed") {
				consola.error("Bundle resolution failed:");
				resolution.errors.forEach((err) => consola.error(`  - ${err}`));
				process.exit(1);
			}

			if (resolution.warnings.length > 0) {
				consola.warn("Bundle resolution warnings:");
				resolution.warnings.forEach((warn) => consola.warn(`  - ${warn}`));
			}

			// Show resolved services
			consola.info("\nResolved services:");
			resolution.resolvedServices.forEach((service) => {
				consola.info(
					`  - ${chalk.green(service.serviceType)}: ${service.provider} v${service.version}`,
				);
			});

			// Confirm creation
			const shouldContinue = await confirm({
				message: "Create project with these services?",
				initialValue: true,
			});

			if (isCancel(shouldContinue) || !shouldContinue) {
				cancel("Project creation cancelled");
				process.exit(0);
			}

			// Scaffold project
			s.start("Creating project structure...");

			const result = await scaffolder.scaffoldProject({
				name: projectConfig.name,
				path: projectConfig.path,
				config: projectConfig,
				bundle,
				resolution,
				options: {
					dryRun: options.dryRun,
					skipInstall: !options.install,
					skipGit: !options.git,
				},
			});

			s.stop("Project created successfully");

			// Display post-creation instructions
			displayPostCreationInstructions(result);

			outro(chalk.green("✨ Project created successfully!"));
		} catch (error) {
			consola.error("Failed to create project:", error);
			process.exit(1);
		}
	});

async function getProjectConfig(
	name?: string,
	options?: any,
): Promise<ProjectConfig> {
	const projectName =
		name ||
		(await text({
			message: "What is your project name?",
			placeholder: "my-awesome-app",
			validate: (value) => {
				if (!value) return "Project name is required";
				if (!/^[a-z0-9-]+$/.test(value)) {
					return "Project name must be lowercase with hyphens only";
				}
				return undefined;
			},
		}));

	if (isCancel(projectName)) {
		outro("Project creation cancelled");
		process.exit(0);
	}

	const projectPath = path.resolve(process.cwd(), projectName as string);

	if (await fs.pathExists(projectPath)) {
		const overwrite = await confirm({
			message: `Directory ${projectName} already exists. Overwrite?`,
			initialValue: false,
		});

		if (isCancel(overwrite) || !overwrite) {
			return Symbol() as any;
		}
	}

	// Get framework if not provided
	const framework =
		options?.framework ||
		(await select({
			message: "Select a frontend framework",
			options: [
				{ value: "next", label: "Next.js - React framework with SSR/SSG" },
				{ value: "nuxt", label: "Nuxt - Vue.js framework with SSR/SSG" },
				{ value: "remix", label: "Remix - Full-stack React framework" },
				{ value: "sveltekit", label: "SvelteKit - Svelte framework" },
				{ value: "solid-start", label: "SolidStart - SolidJS framework" },
				{ value: "qwik-city", label: "Qwik City - Resumable framework" },
				{ value: "angular", label: "Angular - Enterprise framework" },
				{ value: "react", label: "React - Library only" },
				{ value: "vue", label: "Vue.js - Progressive framework" },
			],
		}));

	if (isCancel(framework)) {
		outro("Project creation cancelled");
		process.exit(0);
	}

	// Get backend if not provided
	const backend =
		options?.backend ||
		(await select({
			message: "Select a backend framework",
			options: [
				{ value: "hono", label: "Hono - Ultrafast web framework" },
				{ value: "express", label: "Express - Minimalist framework" },
				{ value: "fastify", label: "Fastify - High performance" },
				{ value: "nest", label: "NestJS - Enterprise Node.js" },
				{ value: "adonis", label: "AdonisJS - Full-featured MVC" },
				{ value: "next-api", label: "Next.js API Routes" },
				{ value: "nuxt-api", label: "Nuxt Server Routes" },
				{ value: "none", label: "No backend (frontend only)" },
			],
		}));

	if (isCancel(backend)) {
		outro("Project creation cancelled");
		process.exit(0);
	}

	// Get database if backend selected
	let database = "none";
	if (backend !== "none") {
		database =
			options?.database ||
			(await select({
				message: "Select a database",
				options: [
					{ value: "postgresql", label: "PostgreSQL - Advanced relational" },
					{ value: "mysql", label: "MySQL - Popular relational" },
					{ value: "sqlite", label: "SQLite - Embedded database" },
					{ value: "mongodb", label: "MongoDB - Document database" },
					{ value: "redis", label: "Redis - In-memory cache" },
					{ value: "supabase", label: "Supabase - PostgreSQL + Auth" },
					{ value: "planetscale", label: "PlanetScale - Serverless MySQL" },
					{ value: "neon", label: "Neon - Serverless PostgreSQL" },
					{ value: "none", label: "No database" },
				],
			}));

		if (isCancel(database)) return database;
	}

	return {
		name: projectName as string,
		path: projectPath,
		framework: framework as string,
		backend: backend as string,
		database: database as string,
		platform: "web",
		features: [],
		metadata: {
			createdWith: "xaheen-cli-v2",
			version: "2.0.0",
		},
	};
}

async function selectBundle(
	resolver: BundleResolver,
): Promise<ServiceBundle | null> {
	const bundleType = await select({
		message: "Select project type",
		options: [
			{
				value: "saas-starter",
				label: "SaaS Starter - Essential SaaS features",
			},
			{
				value: "saas-professional",
				label: "SaaS Professional - Full-featured SaaS",
			},
			{
				value: "saas-enterprise",
				label: "SaaS Enterprise - Enterprise-grade SaaS",
			},
			{ value: "marketplace", label: "Marketplace - Multi-vendor platform" },
			{ value: "fintech", label: "FinTech - Financial services" },
			{ value: "healthcare", label: "Healthcare - HIPAA compliant" },
			{ value: "ecommerce", label: "E-commerce - Online store" },
			{ value: "custom", label: "Custom - Select individual services" },
		],
	});

	if (isCancel(bundleType)) return null;

	if (bundleType === "custom") {
		// Custom service selection
		const services = await multiselect({
			message: "Select services to include",
			options: [
				{ value: "auth", label: "Authentication & Authorization" },
				{ value: "payments", label: "Payment Processing" },
				{ value: "notifications", label: "Email & SMS Notifications" },
				{ value: "analytics", label: "Analytics & Tracking" },
				{ value: "monitoring", label: "Error Monitoring" },
				{ value: "search", label: "Search Engine" },
				{ value: "storage", label: "File Storage" },
				{ value: "queue", label: "Job Queue" },
				{ value: "cache", label: "Caching Layer" },
				{ value: "realtime", label: "Real-time Updates" },
				{ value: "i18n", label: "Internationalization" },
				{ value: "cms", label: "Content Management" },
				{ value: "admin", label: "Admin Dashboard" },
				{ value: "docs", label: "Documentation" },
			],
			required: true,
		});

		if (isCancel(services)) return null;

		return resolver.createCustomBundle(services as string[]);
	}

	return resolver.loadBundleByName(bundleType as string);
}

function displayPostCreationInstructions(result: any): void {
	consola.box({
		title: "Next Steps",
		message: `
1. Navigate to your project:
   ${chalk.cyan(`cd ${result.projectName}`)}

2. Install dependencies:
   ${chalk.cyan("bun install")}

3. Set up environment variables:
   ${chalk.cyan("cp .env.example .env.local")}

4. Start development server:
   ${chalk.cyan("bun dev")}

For more information, visit:
${chalk.blue("https://xaheen.dev/docs")}
    `,
	});

	if (result.postInstallSteps.length > 0) {
		consola.info("\n📋 Post-installation steps:");
		result.postInstallSteps.forEach((step: string, index: number) => {
			consola.info(`${index + 1}. ${step}`);
		});
	}
}
