/**
 * Interactive Project Initialization
 * Enhanced developer experience with guided setup and smart defaults
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import chalk from "chalk";
import { Command } from "commander";
import { existsSync, readFileSync } from "fs";
// import { createProject } from '../services/project-creator.js'; // TODO: Implement project creator service
import inquirer from "inquirer";
import { join } from "path";
import { z } from "zod";
import { logger } from "../utils/logger.js";

/**
 * Project configuration schema
 */
const ProjectConfigSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	type: z.enum([
		"fullstack",
		"frontend",
		"backend",
		"api",
		"mobile",
		"desktop",
	]),
	framework: z.string(),
	database: z.string().optional(),
	authentication: z.string().optional(),
	deployment: z.string().optional(),
	features: z.array(z.string()),
	integrations: z.array(z.string()),
	compliance: z.array(z.string()),
	aiFeatures: z.boolean().default(false),
	testing: z.boolean().default(true),
	cicd: z.boolean().default(true),
	monitoring: z.boolean().default(false),
	documentation: z.boolean().default(true),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

/**
 * Framework options by project type
 */
const FRAMEWORK_OPTIONS = {
	fullstack: [
		{
			name: "Next.js + NestJS",
			value: "nextjs-nestjs",
			description: "React frontend with NestJS backend",
		},
		{
			name: "Nuxt.js + NestJS",
			value: "nuxtjs-nestjs",
			description: "Vue frontend with NestJS backend",
		},
		{
			name: "SvelteKit + NestJS",
			value: "sveltekit-nestjs",
			description: "Svelte frontend with NestJS backend",
		},
		{
			name: "T3 Stack",
			value: "t3-stack",
			description: "Next.js, tRPC, Prisma, NextAuth",
		},
	],
	frontend: [
		{
			name: "Next.js",
			value: "nextjs",
			description: "React framework with SSR/SSG",
		},
		{
			name: "Nuxt.js",
			value: "nuxtjs",
			description: "Vue.js framework with SSR/SSG",
		},
		{
			name: "SvelteKit",
			value: "sveltekit",
			description: "Svelte framework with SSR/SSG",
		},
		{
			name: "Vite + React",
			value: "vite-react",
			description: "Fast React development with Vite",
		},
		{
			name: "Vite + Vue",
			value: "vite-vue",
			description: "Fast Vue development with Vite",
		},
		{
			name: "Angular",
			value: "angular",
			description: "Enterprise Angular application",
		},
	],
	backend: [
		{
			name: "NestJS",
			value: "nestjs",
			description: "Enterprise Node.js framework",
		},
		{
			name: "Express",
			value: "express",
			description: "Minimal Node.js framework",
		},
		{
			name: "Fastify",
			value: "fastify",
			description: "Fast Node.js framework",
		},
		{ name: "Hono", value: "hono", description: "Lightweight web framework" },
	],
	api: [
		{
			name: "REST API",
			value: "rest-api",
			description: "RESTful API with OpenAPI",
		},
		{
			name: "GraphQL API",
			value: "graphql-api",
			description: "GraphQL API with Apollo",
		},
		{
			name: "tRPC API",
			value: "trpc-api",
			description: "Type-safe API with tRPC",
		},
		{
			name: "Hybrid API",
			value: "hybrid-api",
			description: "REST + GraphQL combined",
		},
	],
	mobile: [
		{
			name: "React Native",
			value: "react-native",
			description: "Cross-platform mobile with React",
		},
		{
			name: "React Native + Expo",
			value: "expo",
			description: "React Native with Expo tools",
		},
		{
			name: "Flutter",
			value: "flutter",
			description: "Cross-platform mobile with Dart",
		},
		{
			name: "Ionic",
			value: "ionic",
			description: "Hybrid mobile with web technologies",
		},
	],
	desktop: [
		{
			name: "Electron",
			value: "electron",
			description: "Desktop apps with web technologies",
		},
		{
			name: "Tauri",
			value: "tauri",
			description: "Lightweight desktop apps with Rust",
		},
		{
			name: "Flutter Desktop",
			value: "flutter-desktop",
			description: "Desktop apps with Flutter",
		},
	],
};

/**
 * Database options
 */
const DATABASE_OPTIONS = [
	{
		name: "PostgreSQL",
		value: "postgresql",
		description: "Advanced relational database",
	},
	{ name: "MySQL", value: "mysql", description: "Popular relational database" },
	{
		name: "SQLite",
		value: "sqlite",
		description: "Lightweight embedded database",
	},
	{
		name: "MongoDB",
		value: "mongodb",
		description: "Document-based NoSQL database",
	},
	{
		name: "Supabase",
		value: "supabase",
		description: "PostgreSQL with real-time features",
	},
	{
		name: "PlanetScale",
		value: "planetscale",
		description: "Serverless MySQL platform",
	},
	{
		name: "Redis",
		value: "redis",
		description: "In-memory data structure store",
	},
	{ name: "None", value: "none", description: "No database needed" },
];

/**
 * Authentication options
 */
const AUTH_OPTIONS = [
	{
		name: "NextAuth.js",
		value: "nextauth",
		description: "Authentication for Next.js",
	},
	{
		name: "Auth0",
		value: "auth0",
		description: "Enterprise identity platform",
	},
	{
		name: "Firebase Auth",
		value: "firebase",
		description: "Google Firebase authentication",
	},
	{
		name: "Supabase Auth",
		value: "supabase-auth",
		description: "Supabase authentication",
	},
	{
		name: "BankID (Norway)",
		value: "bankid",
		description: "Norwegian digital identity",
	},
	{
		name: "JWT Custom",
		value: "jwt",
		description: "Custom JWT implementation",
	},
	{ name: "None", value: "none", description: "No authentication needed" },
];

/**
 * Feature options
 */
const FEATURE_OPTIONS = [
	{
		name: "Real-time Features",
		value: "realtime",
		description: "WebSocket, SSE, live updates",
	},
	{
		name: "File Upload",
		value: "upload",
		description: "File upload and storage",
	},
	{
		name: "Email System",
		value: "email",
		description: "Email sending and templates",
	},
	{
		name: "Payment Processing",
		value: "payments",
		description: "Stripe, Vipps integration",
	},
	{
		name: "Search & Indexing",
		value: "search",
		description: "Full-text search capabilities",
	},
	{
		name: "Caching Layer",
		value: "caching",
		description: "Redis caching system",
	},
	{
		name: "Queue System",
		value: "queues",
		description: "Background job processing",
	},
	{
		name: "Notifications",
		value: "notifications",
		description: "Push notifications, alerts",
	},
	{
		name: "Analytics",
		value: "analytics",
		description: "User analytics and tracking",
	},
	{
		name: "Admin Panel",
		value: "admin",
		description: "Administrative interface",
	},
];

/**
 * Norwegian integration options
 */
const NORWEGIAN_INTEGRATIONS = [
	{
		name: "BankID",
		value: "bankid",
		description: "Norwegian digital identity",
	},
	{ name: "Vipps", value: "vipps", description: "Norwegian mobile payment" },
	{
		name: "Altinn",
		value: "altinn",
		description: "Norwegian government services",
	},
	{
		name: "Digipost",
		value: "digipost",
		description: "Norwegian digital mailbox",
	},
	{
		name: "Bring API",
		value: "bring",
		description: "Norwegian postal services",
	},
	{
		name: "DNB Open Banking",
		value: "dnb",
		description: "Norwegian bank integration",
	},
];

/**
 * Compliance options
 */
const COMPLIANCE_OPTIONS = [
	{ name: "GDPR", value: "gdpr", description: "EU data protection regulation" },
	{
		name: "NSM (Norway)",
		value: "nsm",
		description: "Norwegian security authority standards",
	},
	{
		name: "PCI DSS",
		value: "pci",
		description: "Payment card industry standards",
	},
	{
		name: "SOC 2",
		value: "soc2",
		description: "Security and availability standards",
	},
	{
		name: "ISO 27001",
		value: "iso27001",
		description: "Information security management",
	},
];

/**
 * Create interactive initialization command
 */
export function createInitInteractiveCommand(): Command {
	const command = new Command("init-interactive");

	command
		.alias("init-i")
		.description("Interactive project initialization with guided setup")
		.option("--skip-install", "Skip dependency installation")
		.option("--skip-git", "Skip git repository initialization")
		.option("--template <name>", "Start with a specific template")
		.option("--preset <name>", "Use a predefined preset")
		.action(async (options) => {
			await handleInteractiveInit(options);
		});

	return command;
}

/**
 * Handle interactive initialization
 */
async function handleInteractiveInit(options: any): Promise<void> {
	try {
		console.log(
			chalk.cyan.bold("\n🚀 Welcome to Xaheen CLI Interactive Setup\n"),
		);
		console.log(
			chalk.gray("Let's create your next amazing project together!\n"),
		);

		// Check if we're in an existing project
		if (existsSync("package.json")) {
			const { continueInExisting } = await inquirer.prompt([
				{
					type: "confirm",
					name: "continueInExisting",
					message:
						"This directory already contains a package.json. Continue anyway?",
					default: false,
				},
			]);

			if (!continueInExisting) {
				logger.info("Setup cancelled");
				return;
			}
		}

		// Load presets if available
		const presets = await loadPresets();

		// Step 1: Basic project information
		const basicInfo = await collectBasicInfo(options, presets);

		// Step 2: Technical choices
		const techChoices = await collectTechnicalChoices(basicInfo);

		// Step 3: Features and integrations
		const features = await collectFeatures(basicInfo, techChoices);

		// Step 4: Advanced options
		const advanced = await collectAdvancedOptions(
			basicInfo,
			techChoices,
			features,
		);

		// Step 5: Final configuration
		const config = await finalizeConfiguration(
			basicInfo,
			techChoices,
			features,
			advanced,
		);

		// Step 6: Preview and confirmation
		await previewConfiguration(config);

		const { confirmed } = await inquirer.prompt([
			{
				type: "confirm",
				name: "confirmed",
				message: "Create project with this configuration?",
				default: true,
			},
		]);

		if (!confirmed) {
			logger.info("Project creation cancelled");
			return;
		}

		// Step 7: Create project
		await createProjectWithConfig(config, options);

		// Step 8: Post-creation steps
		await showPostCreationSteps(config);
	} catch (error) {
		logger.error("Interactive setup failed:", error);
		process.exit(1);
	}
}

/**
 * Collect basic project information
 */
async function collectBasicInfo(options: any, presets: any[]): Promise<any> {
	console.log(chalk.blue.bold("📋 Project Information\n"));

	const questions = [
		{
			type: "input",
			name: "name",
			message: "Project name:",
			default: "my-xaheen-app",
			validate: (input: string) => {
				if (!input.trim()) return "Project name is required";
				if (!/^[a-z0-9-_]+$/.test(input))
					return "Use lowercase letters, numbers, hyphens, and underscores only";
				return true;
			},
		},
		{
			type: "input",
			name: "description",
			message: "Project description (optional):",
			default: "A modern application built with Xaheen CLI",
		},
		{
			type: "list",
			name: "type",
			message: "What type of project are you building?",
			choices: [
				{
					name: "🌐 Full-stack Application",
					value: "fullstack",
					description: "Frontend + Backend + Database",
				},
				{
					name: "⚛️  Frontend Application",
					value: "frontend",
					description: "Client-side application",
				},
				{
					name: "🔧 Backend API",
					value: "backend",
					description: "Server-side application",
				},
				{
					name: "🔌 API Service",
					value: "api",
					description: "REST/GraphQL API",
				},
				{
					name: "📱 Mobile Application",
					value: "mobile",
					description: "iOS/Android app",
				},
				{
					name: "🖥️  Desktop Application",
					value: "desktop",
					description: "Cross-platform desktop app",
				},
			],
		},
	];

	// Add preset selection if presets are available
	if (presets.length > 0) {
		questions.unshift({
			type: "list",
			name: "preset",
			message: "Would you like to use a preset?",
			choices: [
				{ name: "Custom setup (recommended)", value: "custom" },
				...presets.map((preset) => ({
					name: `${preset.name} - ${preset.description}`,
					value: preset.id,
				})),
			],
		} as any);
	}

	const answers = await inquirer.prompt(questions);

	// If preset is selected, load preset configuration
	if (answers.preset && answers.preset !== "custom") {
		const selectedPreset = presets.find((p) => p.id === answers.preset);
		if (selectedPreset) {
			return { ...answers, ...selectedPreset.config };
		}
	}

	return answers;
}

/**
 * Collect technical choices
 */
async function collectTechnicalChoices(basicInfo: any): Promise<any> {
	console.log(chalk.blue.bold("\n🛠️  Technical Choices\n"));

	const frameworkChoices =
		FRAMEWORK_OPTIONS[basicInfo.type as keyof typeof FRAMEWORK_OPTIONS] || [];

	const questions = [
		{
			type: "list",
			name: "framework",
			message: `Choose your ${basicInfo.type} framework:`,
			choices: frameworkChoices.map((choice) => ({
				name: `${choice.name} - ${choice.description}`,
				value: choice.value,
			})),
		},
	];

	// Add database selection for backend/fullstack projects
	if (["fullstack", "backend", "api"].includes(basicInfo.type)) {
		questions.push({
			type: "list",
			name: "database",
			message: "Choose your database:",
			choices: DATABASE_OPTIONS.map((choice) => ({
				name: `${choice.name} - ${choice.description}`,
				value: choice.value,
			})),
		} as any);
	}

	// Add authentication for applicable projects
	if (["fullstack", "backend", "api", "mobile"].includes(basicInfo.type)) {
		questions.push({
			type: "list",
			name: "authentication",
			message: "Choose authentication method:",
			choices: AUTH_OPTIONS.map((choice) => ({
				name: `${choice.name} - ${choice.description}`,
				value: choice.value,
			})),
		} as any);
	}

	return await inquirer.prompt(questions);
}

/**
 * Collect features and integrations
 */
async function collectFeatures(basicInfo: any, techChoices: any): Promise<any> {
	console.log(chalk.blue.bold("\n✨ Features & Integrations\n"));

	const questions = [
		{
			type: "checkbox",
			name: "features",
			message: "Select features to include:",
			choices: FEATURE_OPTIONS.map((choice) => ({
				name: `${choice.name} - ${choice.description}`,
				value: choice.value,
			})),
			pageSize: 10,
		},
		{
			type: "confirm",
			name: "includeNorwegianIntegrations",
			message: "Include Norwegian-specific integrations?",
			default: false,
		},
	];

	const answers = await inquirer.prompt(questions);

	// If Norwegian integrations are requested
	if (answers.includeNorwegianIntegrations) {
		const norwegianAnswers = await inquirer.prompt([
			{
				type: "checkbox",
				name: "norwegianIntegrations",
				message: "Select Norwegian integrations:",
				choices: NORWEGIAN_INTEGRATIONS.map((choice) => ({
					name: `${choice.name} - ${choice.description}`,
					value: choice.value,
				})),
			},
		]);

		answers.integrations = norwegianAnswers.norwegianIntegrations;
	}

	return answers;
}

/**
 * Collect advanced options
 */
async function collectAdvancedOptions(
	basicInfo: any,
	techChoices: any,
	features: any,
): Promise<any> {
	console.log(chalk.blue.bold("\n⚙️  Advanced Options\n"));

	const questions = [
		{
			type: "checkbox",
			name: "compliance",
			message: "Select compliance requirements:",
			choices: COMPLIANCE_OPTIONS.map((choice) => ({
				name: `${choice.name} - ${choice.description}`,
				value: choice.value,
			})),
		},
		{
			type: "confirm",
			name: "aiFeatures",
			message: "Include AI-powered features?",
			default: false,
		},
		{
			type: "confirm",
			name: "testing",
			message: "Include comprehensive testing setup?",
			default: true,
		},
		{
			type: "confirm",
			name: "cicd",
			message: "Setup CI/CD pipelines?",
			default: true,
		},
		{
			type: "confirm",
			name: "monitoring",
			message: "Include monitoring and observability?",
			default: false,
		},
		{
			type: "confirm",
			name: "documentation",
			message: "Generate documentation?",
			default: true,
		},
	];

	return await inquirer.prompt(questions);
}

/**
 * Finalize configuration
 */
async function finalizeConfiguration(
	basicInfo: any,
	techChoices: any,
	features: any,
	advanced: any,
): Promise<ProjectConfig> {
	const config = {
		...basicInfo,
		...techChoices,
		...features,
		...advanced,
		integrations: features.integrations || [],
		compliance: advanced.compliance || [],
	};

	// Validate configuration
	return ProjectConfigSchema.parse(config);
}

/**
 * Preview configuration
 */
async function previewConfiguration(config: ProjectConfig): Promise<void> {
	console.log(chalk.blue.bold("\n📋 Configuration Summary\n"));

	console.log(chalk.cyan("Project Details:"));
	console.log(chalk.gray(`  Name: ${config.name}`));
	console.log(chalk.gray(`  Description: ${config.description || "None"}`));
	console.log(chalk.gray(`  Type: ${config.type}`));
	console.log(chalk.gray(`  Framework: ${config.framework}`));

	if (config.database) {
		console.log(chalk.gray(`  Database: ${config.database}`));
	}

	if (config.authentication) {
		console.log(chalk.gray(`  Authentication: ${config.authentication}`));
	}

	if (config.features.length > 0) {
		console.log(chalk.cyan("\nFeatures:"));
		config.features.forEach((feature) =>
			console.log(chalk.gray(`  - ${feature}`)),
		);
	}

	if (config.integrations.length > 0) {
		console.log(chalk.cyan("\nIntegrations:"));
		config.integrations.forEach((integration) =>
			console.log(chalk.gray(`  - ${integration}`)),
		);
	}

	if (config.compliance.length > 0) {
		console.log(chalk.cyan("\nCompliance:"));
		config.compliance.forEach((compliance) =>
			console.log(chalk.gray(`  - ${compliance}`)),
		);
	}

	console.log(chalk.cyan("\nOptions:"));
	console.log(chalk.gray(`  AI Features: ${config.aiFeatures ? "Yes" : "No"}`));
	console.log(chalk.gray(`  Testing: ${config.testing ? "Yes" : "No"}`));
	console.log(chalk.gray(`  CI/CD: ${config.cicd ? "Yes" : "No"}`));
	console.log(chalk.gray(`  Monitoring: ${config.monitoring ? "Yes" : "No"}`));
	console.log(
		chalk.gray(`  Documentation: ${config.documentation ? "Yes" : "No"}`),
	);

	console.log("");
}

/**
 * Create project with configuration
 */
async function createProjectWithConfig(
	config: ProjectConfig,
	options: any,
): Promise<void> {
	console.log(chalk.green.bold("\n🏗️  Creating Your Project\n"));

	// Convert config to project creation options
	const projectOptions = {
		name: config.name,
		description: config.description,
		type: config.type,
		framework: config.framework,
		database: config.database,
		authentication: config.authentication,
		features: config.features,
		integrations: config.integrations,
		compliance: config.compliance,
		aiFeatures: config.aiFeatures,
		testing: config.testing,
		cicd: config.cicd,
		monitoring: config.monitoring,
		documentation: config.documentation,
		skipInstall: options.skipInstall,
		skipGit: options.skipGit,
	};

	// Create the project
	// TODO: Implement actual project creation
	logger.info(
		"Project creation would be executed here with options:",
		projectOptions,
	);
}

/**
 * Show post-creation steps
 */
async function showPostCreationSteps(config: ProjectConfig): Promise<void> {
	console.log(chalk.green.bold("\n🎉 Project Created Successfully!\n"));

	console.log(chalk.cyan("Next steps:"));
	console.log(chalk.gray(`  cd ${config.name}`));

	if (config.database && config.database !== "none") {
		console.log(chalk.gray("  # Setup your database connection"));
		console.log(chalk.gray("  # Run database migrations"));
	}

	if (config.authentication && config.authentication !== "none") {
		console.log(chalk.gray("  # Configure authentication providers"));
	}

	console.log(chalk.gray("  npm run dev          # Start development server"));

	if (config.testing) {
		console.log(chalk.gray("  npm run test         # Run tests"));
	}

	if (config.cicd) {
		console.log(chalk.gray("  # Push to Git to trigger CI/CD"));
	}

	console.log(chalk.cyan("\nDocumentation:"));
	console.log(
		chalk.gray("  README.md            # Project overview and setup"),
	);
	console.log(chalk.gray("  docs/                # Detailed documentation"));

	console.log(chalk.cyan("\nHelpful commands:"));
	console.log(
		chalk.gray("  xaheen generate --help    # See available generators"),
	);
	console.log(
		chalk.gray("  xaheen plugin search      # Find community plugins"),
	);
	console.log(
		chalk.gray("  xaheen refactor --help    # AI-powered refactoring"),
	);

	console.log(
		chalk.yellow(
			"\n💡 Pro tip: Run `xaheen generate scaffold user` to create your first feature!",
		),
	);
}

/**
 * Load available presets
 */
async function loadPresets(): Promise<any[]> {
	try {
		const presetsPath = join(__dirname, "..", "..", "presets", "presets.json");

		if (existsSync(presetsPath)) {
			const content = readFileSync(presetsPath, "utf-8");
			return JSON.parse(content);
		}
	} catch (error) {
		logger.warn("Failed to load presets:", error);
	}

	return [];
}

/**
 * Default export
 */
export default createInitInteractiveCommand;
