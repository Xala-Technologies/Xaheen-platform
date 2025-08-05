/**
 * @fileoverview Tier 1: Yeoman Integration for Global Project Scaffolding
 * @description Complex project setup using Yeoman generators
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import * as yaml from "yaml";
import Environment from "yeoman-environment";
import Generator from "yeoman-generator";
import { logger } from "../utils/logger.js";
import {
	GenerationResult,
	GlobalScaffoldingOptions,
	ScaffoldingContext,
	ScaffoldingError,
	VirtualFileSystem,
	YeomanGeneratorConfig,
	YeomanPrompt,
} from "./types.js";

export class YeomanIntegration {
	private readonly environment: Environment;
	private readonly virtualFs: VirtualFileSystem;
	private readonly generatorsPath: string;

	constructor(virtualFs: VirtualFileSystem, generatorsPath?: string) {
		this.environment = Environment.createEnv();
		this.virtualFs = virtualFs;
		this.generatorsPath =
			generatorsPath || join(__dirname, "../../../generators");
	}

	// ===== GENERATOR REGISTRATION =====

	async registerGenerator(config: YeomanGeneratorConfig): Promise<void> {
		logger.info(`Registering Yeoman generator: ${config.name}`);

		try {
			// Create generator class dynamically
			const GeneratorClass = this.createGeneratorClass(config);

			// Register with environment
			this.environment.registerStub(GeneratorClass, config.namespace);

			logger.success(`Generator '${config.name}' registered successfully`);
		} catch (error) {
			throw new ScaffoldingError(
				`Failed to register generator '${config.name}': ${error instanceof Error ? error.message : String(error)}`,
				"GENERATOR_REGISTRATION_FAILED",
			);
		}
	}

	async registerBuiltinGenerators(): Promise<void> {
		logger.info("Registering built-in Yeoman generators");

		// Register project generators
		await this.registerProjectGenerators();

		// Register framework-specific generators
		await this.registerFrameworkGenerators();

		// Register feature generators
		await this.registerFeatureGenerators();
	}

	// ===== PROJECT GENERATION =====

	async generateProject(
		context: ScaffoldingContext,
		options: GlobalScaffoldingOptions = {},
	): Promise<GenerationResult> {
		logger.info(`Generating project using Yeoman: ${context.projectName}`);

		try {
			// Determine generator namespace based on framework
			const generatorNamespace = this.getGeneratorNamespace(context.framework);

			// Prepare generator options
			const generatorOptions = {
				...options,
				projectName: context.projectName,
				projectPath: context.projectPath,
				framework: context.framework,
				features: context.features,
				dryRun: context.dryRun,
				...options.customizations,
			};

			// Run generator
			const result = await this.runGenerator(
				generatorNamespace,
				generatorOptions,
			);

			return {
				success: true,
				files: result.files,
				errors: [],
				warnings: result.warnings || [],
			};
		} catch (error) {
			return {
				success: false,
				files: [],
				errors: [error instanceof Error ? error.message : String(error)],
				warnings: [],
			};
		}
	}

	async generateFullStackProject(
		context: ScaffoldingContext,
		options: GlobalScaffoldingOptions & {
			backend?: string;
			database?: string;
			auth?: string;
		} = {},
	): Promise<GenerationResult> {
		logger.info("Generating full-stack project with Yeoman");

		const generators = [
			"xala:project-base",
			`xala:frontend-${context.framework}`,
			...(options.backend ? [`xala:backend-${options.backend}`] : []),
			...(options.database ? [`xala:database-${options.database}`] : []),
			...(options.auth ? [`xala:auth-${options.auth}`] : []),
		];

		const results: GenerationResult[] = [];

		for (const generatorNamespace of generators) {
			try {
				const result = await this.runGenerator(generatorNamespace, {
					...options,
					projectName: context.projectName,
					projectPath: context.projectPath,
					framework: context.framework,
					features: context.features,
				});

				results.push({
					success: true,
					files: result.files,
					errors: [],
					warnings: result.warnings || [],
				});
			} catch (error) {
				results.push({
					success: false,
					files: [],
					errors: [error instanceof Error ? error.message : String(error)],
					warnings: [],
				});
			}
		}

		// Combine results
		const allFiles = results.flatMap((r) => r.files);
		const allErrors = results.flatMap((r) => r.errors);
		const allWarnings = results.flatMap((r) => r.warnings);

		return {
			success: allErrors.length === 0,
			files: allFiles,
			errors: allErrors,
			warnings: allWarnings,
		};
	}

	// ===== GENERATOR MANAGEMENT =====

	async listGenerators(): Promise<readonly string[]> {
		return Object.keys(this.environment.getGeneratorsMeta());
	}

	async getGeneratorInfo(namespace: string): Promise<any> {
		const meta = this.environment.getGeneratorsMeta()[namespace];
		return meta || null;
	}

	// ===== PRIVATE GENERATOR CREATION =====

	private createGeneratorClass(
		config: YeomanGeneratorConfig,
	): typeof Generator {
		const self = this;

		return class extends Generator {
			constructor(args: any, opts: any) {
				super(args, opts);

				// Add prompts based on configuration
				if (config.prompts) {
					this.prompts = config.prompts.map((prompt) => ({
						...prompt,
						name: prompt.name,
						message: prompt.message,
						type: prompt.type,
						default: prompt.default,
						choices: prompt.choices,
						validate: prompt.validate,
					}));
				}
			}

			async prompting() {
				if (config.prompts && config.prompts.length > 0) {
					this.answers = await this.prompt(this.prompts || []);
				}
			}

			async writing() {
				const templatePath = config.templatePath;
				const context = {
					...this.answers,
					projectName: this.options.projectName,
					framework: this.options.framework,
					features: this.options.features || [],
				};

				try {
					// Copy templates with processing
					await self.copyTemplatesWithProcessing(
						this,
						templatePath,
						this.destinationRoot(),
						context,
					);
				} catch (error) {
					this.log.error(`Template processing failed: ${error}`);
					throw error;
				}
			}

			async install() {
				if (
					!this.options.skipInstall &&
					config.dependencies &&
					config.dependencies.length > 0
				) {
					this.log("Installing dependencies...");
					this.npmInstall(config.dependencies);
				}
			}

			async end() {
				this.log(`\n✅ ${config.name} generator completed successfully!`);

				if (this.options.gitInit) {
					this.spawnCommandSync("git", ["init"]);
					this.spawnCommandSync("git", ["add", "."]);
					this.spawnCommandSync("git", [
						"commit",
						"-m",
						"Initial commit from Xala CLI",
					]);
				}
			}
		};
	}

	private async registerProjectGenerators(): Promise<void> {
		// Base project generator
		const baseProjectConfig: YeomanGeneratorConfig = {
			name: "Project Base",
			namespace: "xala:project-base",
			templatePath: join(this.generatorsPath, "project-base"),
			prompts: [
				{
					type: "input",
					name: "description",
					message: "Project description:",
					default: "A modern application built with Xala CLI",
				},
				{
					type: "input",
					name: "author",
					message: "Author name:",
					default: "Developer",
				},
				{
					type: "confirm",
					name: "typescript",
					message: "Use TypeScript?",
					default: true,
				},
				{
					type: "list",
					name: "packageManager",
					message: "Package manager:",
					choices: ["npm", "yarn", "pnpm"],
					default: "npm",
				},
			],
			dependencies: [],
		};

		await this.registerGenerator(baseProjectConfig);
	}

	private async registerFrameworkGenerators(): Promise<void> {
		// React generator
		const reactConfig: YeomanGeneratorConfig = {
			name: "React Frontend",
			namespace: "xala:frontend-react",
			templatePath: join(this.generatorsPath, "react"),
			prompts: [
				{
					type: "list",
					name: "reactVersion",
					message: "React version:",
					choices: ["18", "17"],
					default: "18",
				},
				{
					type: "confirm",
					name: "nextjs",
					message: "Use Next.js?",
					default: true,
				},
				{
					type: "confirm",
					name: "storybook",
					message: "Include Storybook?",
					default: false,
				},
			],
			dependencies: ["react", "react-dom", "@types/react", "@types/react-dom"],
		};

		await this.registerGenerator(reactConfig);

		// Vue generator
		const vueConfig: YeomanGeneratorConfig = {
			name: "Vue Frontend",
			namespace: "xala:frontend-vue",
			templatePath: join(this.generatorsPath, "vue"),
			prompts: [
				{
					type: "list",
					name: "vueVersion",
					message: "Vue version:",
					choices: ["3", "2"],
					default: "3",
				},
				{
					type: "confirm",
					name: "nuxt",
					message: "Use Nuxt.js?",
					default: false,
				},
			],
			dependencies: ["vue", "@vue/compiler-sfc"],
		};

		await this.registerGenerator(vueConfig);

		// Angular generator
		const angularConfig: YeomanGeneratorConfig = {
			name: "Angular Frontend",
			namespace: "xala:frontend-angular",
			templatePath: join(this.generatorsPath, "angular"),
			prompts: [
				{
					type: "confirm",
					name: "routing",
					message: "Enable routing?",
					default: true,
				},
				{
					type: "list",
					name: "styling",
					message: "Stylesheet format:",
					choices: ["CSS", "SCSS", "Sass", "Less"],
					default: "SCSS",
				},
			],
			dependencies: [
				"@angular/core",
				"@angular/common",
				"@angular/platform-browser",
			],
		};

		await this.registerGenerator(angularConfig);
	}

	private async registerFeatureGenerators(): Promise<void> {
		// Authentication generator
		const authConfig: YeomanGeneratorConfig = {
			name: "Authentication",
			namespace: "xala:auth",
			templatePath: join(this.generatorsPath, "auth"),
			prompts: [
				{
					type: "list",
					name: "provider",
					message: "Authentication provider:",
					choices: ["clerk", "auth0", "firebase", "custom"],
					default: "clerk",
				},
				{
					type: "confirm",
					name: "socialLogin",
					message: "Enable social login?",
					default: true,
				},
			],
			dependencies: [],
		};

		await this.registerGenerator(authConfig);

		// Database generator
		const databaseConfig: YeomanGeneratorConfig = {
			name: "Database",
			namespace: "xala:database",
			templatePath: join(this.generatorsPath, "database"),
			prompts: [
				{
					type: "list",
					name: "type",
					message: "Database type:",
					choices: ["postgresql", "mysql", "sqlite", "mongodb"],
					default: "postgresql",
				},
				{
					type: "list",
					name: "orm",
					message: "ORM/ODM:",
					choices: ["prisma", "drizzle", "typeorm", "mongoose"],
					default: "prisma",
				},
			],
			dependencies: [],
		};

		await this.registerGenerator(databaseConfig);
	}

	private getGeneratorNamespace(framework: string): string {
		const frameworkMap: Record<string, string> = {
			react: "xala:frontend-react",
			vue: "xala:frontend-vue",
			angular: "xala:frontend-angular",
			svelte: "xala:frontend-svelte",
			solid: "xala:frontend-solid",
		};

		return frameworkMap[framework] || "xala:project-base";
	}

	private async runGenerator(
		namespace: string,
		options: Record<string, unknown>,
	): Promise<{ files: string[]; warnings?: string[] }> {
		return new Promise((resolve, reject) => {
			try {
				const generator = this.environment.create(namespace, {
					...options,
					resolved: this.environment.getGeneratorsMeta()[namespace]?.resolved,
				});

				if (!generator) {
					throw new ScaffoldingError(
						`Generator '${namespace}' not found`,
						"GENERATOR_NOT_FOUND",
					);
				}

				// Track generated files
				const generatedFiles: string[] = [];
				const warnings: string[] = [];

				// Override generator methods to track files
				const originalWrite = generator.write;
				generator.write = function (
					this: any,
					filepath: string,
					contents: string,
				) {
					generatedFiles.push(filepath);
					return originalWrite.call(this, filepath, contents);
				};

				const originalCopy = generator.copy;
				generator.copy = function (this: any, from: string, to: string) {
					generatedFiles.push(to);
					return originalCopy.call(this, from, to);
				};

				// Run generator
				generator.run(() => {
					resolve({ files: generatedFiles, warnings });
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	private async copyTemplatesWithProcessing(
		generator: Generator,
		templatePath: string,
		destinationPath: string,
		context: Record<string, unknown>,
	): Promise<void> {
		try {
			// Check if template path exists
			await fs.access(templatePath);

			// Copy templates with EJS processing
			generator.fs.copyTpl(
				generator.templatePath(templatePath),
				generator.destinationPath(destinationPath),
				context,
			);
		} catch (error) {
			// If template path doesn't exist, create basic project structure
			await this.createBasicProjectStructure(generator, context);
		}
	}

	private async createBasicProjectStructure(
		generator: Generator,
		context: Record<string, unknown>,
	): Promise<void> {
		const { projectName, framework, features = [] } = context;

		// Create package.json
		const packageJson = {
			name: projectName,
			version: "0.1.0",
			private: true,
			description: `A ${framework} application generated by Xala CLI`,
			scripts: {
				dev: "npm run start",
				build: "npm run build:prod",
				start: 'echo "Development server not configured"',
				"build:prod": 'echo "Production build not configured"',
			},
			dependencies: {},
			devDependencies: {},
		};

		generator.fs.writeJSON(
			generator.destinationPath("package.json"),
			packageJson,
		);

		// Create README.md
		const readmeContent = `# ${projectName}

A modern ${framework} application built with Xala CLI.

## Features

${features.map((feature: string) => `- ${feature}`).join("\n")}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Generated with Xala CLI

This project was generated using [Xala CLI](https://github.com/xala-technologies/xala-cli), providing a modern development experience with best practices built-in.
`;

		generator.fs.write(generator.destinationPath("README.md"), readmeContent);

		// Create basic directory structure
		const directories = ["src", "public", "docs"];
		directories.forEach((dir) => {
			generator.fs.write(generator.destinationPath(`${dir}/.gitkeep`), "");
		});

		// Create .gitignore
		const gitignoreContent = `node_modules/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

dist/
build/
.next/
out/

.DS_Store
*.tsbuildinfo
.vscode/
.idea/
`;

		generator.fs.write(
			generator.destinationPath(".gitignore"),
			gitignoreContent,
		);
	}
}
