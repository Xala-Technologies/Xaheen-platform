/**
 * @fileoverview Xaheen CLI Integration Bridge
 * @description Provides seamless integration between Xala UI CLI and Xaheen full-stack CLI
 */

import chalk from "chalk";
import { exec } from "child_process";
import { Command } from "commander";
import { existsSync } from "fs";
import fs from "fs/promises";
import ora from "ora";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface XaheenProjectConfig {
	name: string;
	type: "saas" | "ecommerce" | "healthcare" | "fintech" | "government";
	stack: {
		frontend: "react" | "nextjs" | "vue" | "nuxt" | "angular";
		backend: "nestjs" | "express" | "fastify" | "django" | "laravel";
		database: "postgresql" | "mysql" | "mongodb" | "redis";
		auth: "auth0" | "supabase" | "firebase" | "custom";
	};
	features: string[];
	compliance: ("nsm" | "gdpr" | "hipaa" | "sox")[];
	deployment: "aws" | "azure" | "gcp" | "vercel" | "netlify";
}

export interface XaheenIntegrationOptions {
	useXalaUI: boolean;
	theme?: string;
	industry?: string;
	compliance?: string[];
	components?: string[];
	skipUISetup?: boolean;
	interactive?: boolean;
}

export class XaheenBridge {
	private projectPath: string;
	private config: XaheenProjectConfig | null = null;

	constructor(projectPath: string = process.cwd()) {
		this.projectPath = projectPath;
	}

	/**
	 * Initialize Xala UI system within a Xaheen project
	 */
	async initializeXalaUI(options: XaheenIntegrationOptions): Promise<void> {
		const spinner = ora(
			"Integrating Xala UI system with Xaheen project...",
		).start();

		try {
			// 1. Detect Xaheen project configuration
			await this.detectXaheenProject();

			// 2. Validate compatibility
			await this.validateCompatibility();

			// 3. Install Xala UI CLI if not present
			await this.ensureXalaCLI();

			// 4. Configure UI system for the specific stack
			await this.configureUISystem(options);

			// 5. Generate initial components based on Xaheen features
			await this.generateInitialComponents(options);

			// 6. Setup integration hooks
			await this.setupIntegrationHooks();

			// 7. Update Xaheen configuration
			await this.updateXaheenConfig(options);

			spinner.succeed("Xala UI system successfully integrated!");
		} catch (error) {
			spinner.fail("Integration failed");
			throw error;
		}
	}

	/**
	 * Detect if current directory is a Xaheen project
	 */
	async detectXaheenProject(): Promise<boolean> {
		const xaheenConfigPath = path.join(this.projectPath, "xaheen.config.json");
		const packageJsonPath = path.join(this.projectPath, "package.json");

		if (existsSync(xaheenConfigPath)) {
			const configContent = await fs.readFile(xaheenConfigPath, "utf-8");
			this.config = JSON.parse(configContent);
			return true;
		}

		if (existsSync(packageJsonPath)) {
			const packageContent = await fs.readFile(packageJsonPath, "utf-8");
			const packageJson = JSON.parse(packageContent);

			// Check if it's a Xaheen-generated project
			if (packageJson.xaheen || packageJson.devDependencies?.["@xaheen-ai/cli"]) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Validate compatibility between Xaheen stack and Xala UI
	 */
	async validateCompatibility(): Promise<void> {
		if (!this.config) {
			throw new Error("No Xaheen configuration found");
		}

		const supportedFrontends = ["react", "nextjs", "vue", "nuxt", "angular"];

		if (!supportedFrontends.includes(this.config.stack.frontend)) {
			throw new Error(
				`Frontend ${this.config.stack.frontend} is not supported by Xala UI system`,
			);
		}

		console.log(
			chalk.green(
				`✓ Frontend stack ${this.config.stack.frontend} is compatible`,
			),
		);
	}

	/**
	 * Ensure Xala CLI is available
	 */
	async ensureXalaCLI(): Promise<void> {
		try {
			await execAsync("xala --version");
			console.log(chalk.green("✓ Xala CLI is already available"));
		} catch {
			console.log(chalk.yellow("Installing Xala CLI..."));
			await execAsync("npm install -g @xala-technologies/xala-cli");
			console.log(chalk.green("✓ Xala CLI installed successfully"));
		}
	}

	/**
	 * Configure UI system based on Xaheen project
	 */
	async configureUISystem(options: XaheenIntegrationOptions): Promise<void> {
		if (!this.config) return;

		const installArgs = ["--platform", this.config.stack.frontend, "--force"];

		if (options.theme) {
			installArgs.push("--theme", options.theme);
		} else {
			// Auto-select theme based on project type
			const themeMap = {
				healthcare: "healthcare",
				fintech: "finance",
				government: "government",
				saas: "enterprise",
				ecommerce: "retail",
			};
			installArgs.push("--theme", themeMap[this.config.type] || "enterprise");
		}

		if (options.compliance && options.compliance.length > 0) {
			installArgs.push("--compliance", options.compliance.join(","));
		} else if (this.config.compliance.length > 0) {
			installArgs.push("--compliance", this.config.compliance.join(","));
		}

		const command = `xala install ${installArgs.join(" ")}`;
		console.log(chalk.blue(`Running: ${command}`));

		await execAsync(command, { cwd: this.projectPath });
	}

	/**
	 * Generate initial components based on Xaheen features
	 */
	async generateInitialComponents(
		options: XaheenIntegrationOptions,
	): Promise<void> {
		if (!this.config) return;

		const componentMap = {
			auth: ["LoginForm", "RegisterForm", "UserProfile"],
			dashboard: ["DashboardLayout", "StatsCard", "DataTable"],
			ecommerce: ["ProductCard", "ShoppingCart", "CheckoutForm"],
			blog: ["BlogPost", "CommentSection", "TagList"],
			admin: ["AdminPanel", "UserManagement", "SettingsPage"],
		};

		const componentsToGenerate = new Set<string>();

		// Add components based on features
		for (const feature of this.config.features) {
			const components = componentMap[feature as keyof typeof componentMap];
			if (components) {
				components.forEach((comp) => componentsToGenerate.add(comp));
			}
		}

		// Add custom components if specified
		if (options.components) {
			options.components.forEach((comp) => componentsToGenerate.add(comp));
		}

		// Generate each component
		for (const component of componentsToGenerate) {
			try {
				await execAsync(
					`xala ai generate "${component} component for ${this.config.type} application"`,
					{
						cwd: this.projectPath,
					},
				);
				console.log(chalk.green(`✓ Generated ${component}`));
			} catch (error) {
				console.log(
					chalk.yellow(`⚠ Could not generate ${component}, skipping...`),
				);
			}
		}
	}

	/**
	 * Setup integration hooks for seamless workflow
	 */
	async setupIntegrationHooks(): Promise<void> {
		const hooksDir = path.join(this.projectPath, ".xaheen", "hooks");
		await fs.mkdir(hooksDir, { recursive: true });

		// Pre-build hook to validate UI components
		const preBuildHook = `#!/bin/bash
# Xala UI Integration - Pre-build validation
echo "🎨 Validating UI components..."
xala migrate analyze --report --format json > .xaheen/ui-validation-report.json

if [ $? -ne 0 ]; then
  echo "❌ UI validation failed. Run 'xala check' to fix issues."
  exit 1
fi

echo "✅ UI components validated successfully"
`;

		await fs.writeFile(path.join(hooksDir, "pre-build.sh"), preBuildHook);
		await execAsync(`chmod +x ${path.join(hooksDir, "pre-build.sh")}`);

		// Post-generate hook to apply UI system
		const postGenerateHook = `#!/bin/bash
# Auto-apply Xala UI system to newly generated components
echo "🎨 Applying UI system to generated components..."

# Find new component files
find src/components -name "*.tsx" -newer .xaheen/last-generation -exec xala check {} --fix-suggestions \\;

touch .xaheen/last-generation
echo "✅ UI system applied to new components"
`;

		await fs.writeFile(
			path.join(hooksDir, "post-generate.sh"),
			postGenerateHook,
		);
		await execAsync(`chmod +x ${path.join(hooksDir, "post-generate.sh")}`);
	}

	/**
	 * Update Xaheen configuration to include UI system
	 */
	async updateXaheenConfig(options: XaheenIntegrationOptions): Promise<void> {
		if (!this.config) return;

		const xaheenConfigPath = path.join(this.projectPath, "xaheen.config.json");

		// Add UI system configuration
		const updatedConfig = {
			...this.config,
			ui: {
				system: "xala",
				theme: options.theme || "enterprise",
				compliance: options.compliance || this.config.compliance,
				autoGenerate: true,
				hooks: {
					preBuild: ".xaheen/hooks/pre-build.sh",
					postGenerate: ".xaheen/hooks/post-generate.sh",
				},
			},
		};

		await fs.writeFile(
			xaheenConfigPath,
			JSON.stringify(updatedConfig, null, 2),
		);
		console.log(chalk.green("✓ Updated Xaheen configuration"));
	}

	/**
	 * Create a unified development workflow script
	 */
	async createUnifiedWorkflow(): Promise<void> {
		const workflowScript = `#!/bin/bash
# Unified Xaheen + Xala Development Workflow

set -e

echo "🚀 Starting unified development workflow..."

# 1. Generate backend if needed
if [ "$1" = "generate" ] && [ "$2" = "backend" ]; then
  echo "🔧 Generating backend components..."
  xaheen generate:api $3
fi

# 2. Generate frontend with UI system
if [ "$1" = "generate" ] && [ "$2" = "frontend" ]; then
  echo "🎨 Generating frontend with Xala UI..."
  xaheen generate:page $3
  xala ai generate "$3 page with proper UI components"
  xala check src/pages/$3 --fix-suggestions
fi

# 3. Full stack generation
if [ "$1" = "generate" ] && [ "$2" = "fullstack" ]; then
  echo "🏗️ Generating full stack feature..."
  xaheen generate:feature $3
  xala ai generate "UI components for $3 feature"
  xala migrate convert src/components/$3 --interactive
fi

# 4. Development server with UI watching
if [ "$1" = "dev" ]; then
  echo "🔄 Starting development servers..."
  concurrently \\
    "xaheen dev:backend" \\
    "xaheen dev:frontend" \\
    "xala dev --watch"
fi

# 5. Build with UI validation
if [ "$1" = "build" ]; then
  echo "📦 Building with UI validation..."
  xala migrate analyze --report
  xaheen build
fi

echo "✅ Workflow completed successfully!"
`;

		await fs.writeFile(
			path.join(this.projectPath, "xaheen-xala.sh"),
			workflowScript,
		);
		await execAsync(
			`chmod +x ${path.join(this.projectPath, "xaheen-xala.sh")}`,
		);

		console.log(
			chalk.green("✓ Created unified workflow script: ./xaheen-xala.sh"),
		);
	}
}

/**
 * Command to integrate with Xaheen projects
 */
export const xaheenIntegrationCommand = new Command("xaheen")
	.description("Integration commands for Xaheen full-stack CLI")
	.addCommand(
		new Command("init")
			.description("Initialize Xala UI system in a Xaheen project")
			.option("-t, --theme <theme>", "UI theme to apply")
			.option("-i, --industry <industry>", "Industry preset")
			.option(
				"-c, --compliance <compliance>",
				"Compliance requirements (comma-separated)",
			)
			.option(
				"--components <components>",
				"Initial components to generate (comma-separated)",
			)
			.option("--skip-ui-setup", "Skip initial UI setup")
			.option("--interactive", "Interactive setup")
			.action(async (options: XaheenIntegrationOptions) => {
				const bridge = new XaheenBridge();

				try {
					console.log(
						chalk.blue(
							"🔗 Integrating Xala UI system with Xaheen project...\n",
						),
					);

					const isXaheenProject = await bridge.detectXaheenProject();
					if (!isXaheenProject) {
						console.log(
							chalk.red("❌ This doesn't appear to be a Xaheen project."),
						);
						console.log(
							chalk.yellow(
								"💡 Run this command in a Xaheen project directory.",
							),
						);
						return;
					}

					await bridge.initializeXalaUI(options);
					await bridge.createUnifiedWorkflow();

					console.log(chalk.green("\n🎉 Integration completed successfully!"));
					console.log(chalk.cyan("\n📋 Next steps:"));
					console.log("   1. Run: ./xaheen-xala.sh dev");
					console.log(
						"   2. Generate components: ./xaheen-xala.sh generate frontend MyComponent",
					);
					console.log("   3. Validate UI: xala check src/components/");
				} catch (error) {
					console.error(
						chalk.red("❌ Integration failed:"),
						error instanceof Error ? error.message : String(error),
					);
					process.exit(1);
				}
			}),
	)
	.addCommand(
		new Command("sync")
			.description("Sync UI components with Xaheen backend changes")
			.option("-f, --force", "Force sync even with conflicts")
			.action(async (options) => {
				console.log(
					chalk.blue("🔄 Syncing UI components with backend changes..."),
				);

				try {
					// Re-analyze backend API changes
					await execAsync(
						"xaheen analyze:api --output .xaheen/api-changes.json",
					);

					// Update UI components based on API changes
					await execAsync(
						'xala ai generate "update components based on API changes" --context .xaheen/api-changes.json',
					);

					// Validate updated components
					await execAsync("xala migrate analyze --report");

					console.log(chalk.green("✅ UI components synced successfully"));
				} catch (error) {
					console.error(
						chalk.red("❌ Sync failed:"),
						error instanceof Error ? error.message : String(error),
					);
				}
			}),
	);

/**
 * Programmatic API for Xaheen CLI integration
 */
export class XalaProgrammaticAPI {
	/**
	 * Generate UI components programmatically from Xaheen
	 */
	static async generateComponents(
		components: string[],
		options: {
			platform: string;
			theme?: string;
			outputDir?: string;
		},
	): Promise<{ success: boolean; generatedFiles: string[]; errors: string[] }> {
		const results = {
			success: true,
			generatedFiles: [] as string[],
			errors: [] as string[],
		};

		for (const component of components) {
			try {
				const { stdout } = await execAsync(
					`xala ai generate "${component}" --platform ${options.platform} --json`,
					{ cwd: options.outputDir || process.cwd() },
				);

				const result = JSON.parse(stdout);
				if (result.files) {
					results.generatedFiles.push(...result.files);
				}
			} catch (error) {
				results.success = false;
				results.errors.push(
					`Failed to generate ${component}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}

		return results;
	}

	/**
	 * Validate components programmatically
	 */
	static async validateComponents(filePaths: string[]): Promise<{
		overallScore: number;
		componentScores: { file: string; score: number; issues: string[] }[];
	}> {
		const componentScores = [];
		let totalScore = 0;

		for (const filePath of filePaths) {
			try {
				const { stdout } = await execAsync(`xala check "${filePath}" --json`);
				const result = JSON.parse(stdout);

				componentScores.push({
					file: filePath,
					score: result.score,
					issues: result.checks
						.filter((c: any) => !c.passed)
						.map((c: any) => c.message),
				});

				totalScore += result.score;
			} catch (error) {
				componentScores.push({
					file: filePath,
					score: 0,
					issues: [
						`Validation failed: ${error instanceof Error ? error.message : String(error)}`,
					],
				});
			}
		}

		return {
			overallScore:
				filePaths.length > 0 ? Math.round(totalScore / filePaths.length) : 0,
			componentScores,
		};
	}

	/**
	 * Apply migrations programmatically
	 */
	static async applyMigrations(
		filePaths: string[],
		options: {
			dryRun?: boolean;
			backup?: boolean;
		} = {},
	): Promise<{ success: boolean; migratedFiles: string[]; errors: string[] }> {
		const results = {
			success: true,
			migratedFiles: [] as string[],
			errors: [] as string[],
		};

		for (const filePath of filePaths) {
			try {
				const command = [
					"xala migrate convert",
					filePath,
					options.dryRun ? "--dry-run" : "",
					options.backup ? "--backup" : "",
					"--json",
				]
					.filter(Boolean)
					.join(" ");

				const { stdout } = await execAsync(command);
				const result = JSON.parse(stdout);

				if (result.success) {
					results.migratedFiles.push(filePath);
				} else {
					results.errors.push(
						`Migration failed for ${filePath}: ${result.error}`,
					);
				}
			} catch (error) {
				results.success = false;
				results.errors.push(
					`Failed to migrate ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}

		return results;
	}
}
