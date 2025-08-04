import chalk from "chalk";
import { existsSync, mkdirSync } from "fs";
import inquirer from "inquirer";
import ora from "ora";
import { join } from "path";
import { ProjectGenerator } from "../generators/project-generator.js";
import { ValidationError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { CommandMetadata } from "./index.js";

export interface InitOptions {
	readonly platform?: string;
	readonly template?: string;
	readonly name?: string;
	readonly directory?: string;
	readonly skipInstall?: boolean;
	readonly force?: boolean;
	readonly theme?: string;
	readonly locale?: string;
	readonly compliance?: string;
}

export interface ProjectConfig {
	readonly name: string;
	readonly platform: string;
	readonly template: string;
	readonly directory: string;
	readonly theme: string;
	readonly locale: string;
	readonly compliance: string;
	readonly features: ReadonlyArray<string>;
}

export const initCommand: CommandMetadata = {
	name: "init",
	description: "Initialize design system in a new project",
	alias: "i",
	arguments: [
		{
			name: "name",
			description: "Project name",
			required: false,
		},
	],
	options: [
		{
			flags: "--platform <platform>",
			description: "Target platform (react|vue|angular|flutter|ios|android)",
			defaultValue: "react",
		},
		{
			flags: "--template <template>",
			description: "Project template (basic|saas|dashboard|mobile|desktop)",
			defaultValue: "basic",
		},
		{
			flags: "--directory <directory>",
			description: "Project directory",
		},
		{
			flags: "--theme <theme>",
			description: "Initial theme to apply",
			defaultValue: "base-light",
		},
		{
			flags: "--locale <locale>",
			description: "Default locale (en-US|nb-NO|fr-FR|ar-SA)",
			defaultValue: "en-US",
		},
		{
			flags: "--compliance <level>",
			description: "Compliance level (basic|nsm|enterprise)",
			defaultValue: "basic",
		},
		{
			flags: "--skip-install",
			description: "Skip dependency installation",
			defaultValue: false,
		},
		{
			flags: "--force",
			description: "Force overwrite existing directory",
			defaultValue: false,
		},
	],
	action: async (name?: string, options: InitOptions = {}) => {
		try {
			logger.info("Initializing new project with Xala Design System...");

			const config = await collectProjectInfo(name, options);

			if (!validateProjectConfig(config)) {
				throw new ValidationError("Invalid project configuration");
			}

			await generateProject(config, options);

			logger.success(`Project "${config.name}" initialized successfully!`);
			console.log(chalk.dim(`\nNext steps:`));
			console.log(chalk.dim(`  cd ${config.directory}`));
			console.log(chalk.dim(`  ${getStartCommand(config.platform)}`));
		} catch (error) {
			logger.error("Failed to initialize project:", error);
			throw error;
		}
	},
};

async function collectProjectInfo(
	name?: string,
	options: InitOptions = {},
): Promise<ProjectConfig> {
	const questions: any[] = [];

	if (!name) {
		questions.push({
			type: "input",
			name: "name",
			message: "What is the project name?",
			validate: (input: string) =>
				input.length > 0 || "Project name is required",
		});
	}

	if (!options.platform) {
		questions.push({
			type: "list",
			name: "platform",
			message: "Which platform are you targeting?",
			choices: [
				{ name: "React (Web)", value: "react" },
				{ name: "Vue.js (Web)", value: "vue" },
				{ name: "Angular (Web)", value: "angular" },
				{ name: "Flutter (Mobile)", value: "flutter" },
				{ name: "iOS (Native)", value: "ios" },
				{ name: "Android (Native)", value: "android" },
			],
		});
	}

	if (!options.template) {
		questions.push({
			type: "list",
			name: "template",
			message: "Which template would you like to use?",
			choices: [
				{ name: "Basic - Simple starter", value: "basic" },
				{ name: "SaaS - Multi-tenant application", value: "saas" },
				{ name: "Dashboard - Admin interface", value: "dashboard" },
				{ name: "E-commerce - Online store", value: "ecommerce" },
				{ name: "Mobile - Mobile-first app", value: "mobile" },
				{ name: "Desktop - Desktop application", value: "desktop" },
			],
		});
	}

	questions.push({
		type: "checkbox",
		name: "features",
		message: "Select additional features:",
		choices: [
			{ name: "Authentication & Authorization", value: "auth" },
			{ name: "Internationalization (i18n)", value: "i18n" },
			{ name: "Real-time Communication", value: "realtime" },
			{ name: "Data Visualization", value: "charts" },
			{ name: "File Upload & Management", value: "files" },
			{ name: "Payment Integration", value: "payments" },
			{ name: "Analytics & Tracking", value: "analytics" },
			{ name: "SEO Optimization", value: "seo" },
		],
	});

	const answers = await inquirer.prompt(questions);

	return {
		name: name || answers.name,
		platform: options.platform || answers.platform,
		template: options.template || answers.template,
		directory: options.directory || answers.name || name || "xala-project",
		theme: options.theme || "base-light",
		locale: options.locale || "en-US",
		compliance: options.compliance || "basic",
		features: answers.features || [],
	};
}

function validateProjectConfig(config: ProjectConfig): boolean {
	const validPlatforms = [
		"react",
		"vue",
		"angular",
		"flutter",
		"ios",
		"android",
	];
	const validTemplates = [
		"basic",
		"saas",
		"dashboard",
		"ecommerce",
		"mobile",
		"desktop",
	];
	const validCompliance = ["basic", "nsm", "enterprise"];

	if (!validPlatforms.includes(config.platform)) {
		logger.error(`Invalid platform: ${config.platform}`);
		return false;
	}

	if (!validTemplates.includes(config.template)) {
		logger.error(`Invalid template: ${config.template}`);
		return false;
	}

	if (!validCompliance.includes(config.compliance)) {
		logger.error(`Invalid compliance level: ${config.compliance}`);
		return false;
	}

	return true;
}

async function generateProject(
	config: ProjectConfig,
	options: InitOptions,
): Promise<void> {
	const targetDir = config.directory;

	// Check if directory exists
	if (existsSync(targetDir) && !options.force) {
		throw new ValidationError(
			`Directory "${targetDir}" already exists. Use --force to overwrite.`,
		);
	}

	// Create directory if it doesn't exist
	if (!existsSync(targetDir)) {
		mkdirSync(targetDir, { recursive: true });
	}

	const spinner = ora("Generating project files...").start();

	try {
		const generator = new ProjectGenerator();
		await generator.generate(config, {
			outputDir: targetDir,
			skipInstall: options.skipInstall || false,
			force: options.force || false,
		});

		spinner.succeed("Project files generated successfully");
	} catch (error) {
		spinner.fail("Failed to generate project files");
		throw error;
	}
}

function getStartCommand(platform: string): string {
	switch (platform) {
		case "react":
		case "vue":
		case "angular":
			return "npm run dev";
		case "flutter":
			return "flutter run";
		case "ios":
			return "xcodebuild";
		case "android":
			return "./gradlew assembleDebug";
		default:
			return "npm start";
	}
}
