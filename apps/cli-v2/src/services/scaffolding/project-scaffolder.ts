/**
 * Project Scaffolder Implementation
 *
 * Orchestrates project creation with service injection.
 *
 * @author CLI Template Generator Agent
 * @since 2025-01-03
 */

import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import fs from "fs-extra";
import ora from "ora";

import type {
	BundleResolutionResult,
	IBundleResolver,
	IServiceInjector,
	IServiceRegistry,
	ProjectConfig,
	ProjectContext,
	ServiceBundle,
} from "../../types/index.js";

export interface ScaffoldOptions {
	dryRun?: boolean;
	skipInstall?: boolean;
	skipGit?: boolean;
	packageManager?: "npm" | "pnpm" | "yarn" | "bun";
}

export interface ScaffoldResult {
	projectName: string;
	projectPath: string;
	services: string[];
	postInstallSteps: string[];
	success: boolean;
}

export class ProjectScaffolder {
	constructor(
		private serviceRegistry: IServiceRegistry,
		private bundleResolver: IBundleResolver,
		private serviceInjector: IServiceInjector,
	) {}

	async scaffoldProject(params: {
		name: string;
		path: string;
		config: ProjectConfig;
		bundle: ServiceBundle;
		resolution: BundleResolutionResult;
		options?: ScaffoldOptions;
	}): Promise<ScaffoldResult> {
		const {
			name,
			path: projectPath,
			config,
			bundle,
			resolution,
			options = {},
		} = params;

		consola.info(`Creating project: ${name}`);

		try {
			// Create project directory
			if (!options.dryRun) {
				await fs.ensureDir(projectPath);
			}

			// Create base project structure
			await this.createBaseStructure(projectPath, config, options);

			// Create project context
			const projectContext: ProjectContext = {
				name,
				framework: config.framework,
				backend: config.backend,
				database: config.database,
				platform: config.platform,
				packageManager: options.packageManager || "bun",
				typescript: true,
				git: !options.skipGit,
				features: config.features,
				author: process.env.USER || "Developer",
				license: "MIT",
			};

			// Inject services
			const injectionResults = await this.serviceInjector.injectServices(
				resolution.resolvedServices,
				projectPath,
				projectContext,
				{ dryRun: options.dryRun },
			);

			// Create package.json
			await this.createPackageJson(projectPath, name, config, options);

			// Initialize git
			if (!options.skipGit && !options.dryRun) {
				await this.initializeGit(projectPath);
			}

			// Install dependencies
			if (!options.skipInstall && !options.dryRun) {
				await this.installDependencies(
					projectPath,
					options.packageManager || "bun",
				);
			}

			// Collect post-install steps
			const postInstallSteps = resolution.postInstallSteps;

			return {
				projectName: name,
				projectPath,
				services: resolution.resolvedServices.map(
					(s) => `${s.serviceType}:${s.provider}`,
				),
				postInstallSteps,
				success: true,
			};
		} catch (error) {
			consola.error("Failed to scaffold project:", error);
			return {
				projectName: name,
				projectPath,
				services: [],
				postInstallSteps: [],
				success: false,
			};
		}
	}

	private async createBaseStructure(
		projectPath: string,
		config: ProjectConfig,
		options: ScaffoldOptions,
	): Promise<void> {
		if (options.dryRun) {
			consola.info("[DRY RUN] Would create base project structure");
			return;
		}

		// Create directory structure
		const dirs = [
			"src",
			"src/components",
			"src/lib",
			"src/utils",
			"public",
			"tests",
		];

		for (const dir of dirs) {
			await fs.ensureDir(path.join(projectPath, dir));
		}

		// Create basic files
		await fs.writeFile(
			path.join(projectPath, "README.md"),
			`# ${config.name}\n\nCreated with Xaheen CLI v2\n`,
		);

		await fs.writeFile(
			path.join(projectPath, ".gitignore"),
			`node_modules/
.env
.env.local
.env.*.local
dist/
build/
.next/
.nuxt/
.output/
.vercel/
*.log
.DS_Store
coverage/
.vscode/
.idea/
`,
		);

		await fs.writeFile(
			path.join(projectPath, "tsconfig.json"),
			JSON.stringify(
				{
					compilerOptions: {
						target: "ES2022",
						module: "ESNext",
						lib: ["ES2022", "DOM", "DOM.Iterable"],
						jsx: "react-jsx",
						moduleResolution: "bundler",
						resolveJsonModule: true,
						allowSyntheticDefaultImports: true,
						esModuleInterop: true,
						forceConsistentCasingInFileNames: true,
						strict: true,
						skipLibCheck: true,
						paths: {
							"@/*": ["./src/*"],
						},
					},
					include: ["src/**/*"],
					exclude: ["node_modules", "dist"],
				},
				null,
				2,
			),
		);
	}

	private async createPackageJson(
		projectPath: string,
		name: string,
		config: ProjectConfig,
		options: ScaffoldOptions,
	): Promise<void> {
		if (options.dryRun) {
			consola.info("[DRY RUN] Would create package.json");
			return;
		}

		const packageJson = {
			name,
			version: "0.1.0",
			private: true,
			type: "module",
			scripts: {
				dev: this.getDevScript(config.framework),
				build: this.getBuildScript(config.framework),
				start: this.getStartScript(config.framework),
				lint: "eslint . --ext .ts,.tsx",
				"type-check": "tsc --noEmit",
				test: "vitest",
			},
			dependencies: {},
			devDependencies: {
				typescript: "^5.0.0",
				"@types/node": "^20.0.0",
				eslint: "^8.0.0",
				vitest: "^1.0.0",
			},
		};

		const existingPath = path.join(projectPath, "package.json");
		if (await fs.pathExists(existingPath)) {
			// Merge with existing
			const existing = await fs.readJson(existingPath);
			const merged = this.deepMerge(existing, packageJson);
			await fs.writeJson(existingPath, merged, { spaces: 2 });
		} else {
			await fs.writeJson(existingPath, packageJson, { spaces: 2 });
		}
	}

	private getDevScript(framework: string): string {
		const scripts: Record<string, string> = {
			next: "next dev",
			nuxt: "nuxt dev",
			remix: "remix dev",
			sveltekit: "vite dev",
			"solid-start": "solid-start dev",
			"qwik-city": "vite --mode ssr",
			angular: "ng serve",
			react: "vite",
			vue: "vite",
		};
		return scripts[framework] || "vite";
	}

	private getBuildScript(framework: string): string {
		const scripts: Record<string, string> = {
			next: "next build",
			nuxt: "nuxt build",
			remix: "remix build",
			sveltekit: "vite build",
			"solid-start": "solid-start build",
			"qwik-city": "qwik build",
			angular: "ng build",
			react: "vite build",
			vue: "vite build",
		};
		return scripts[framework] || "vite build";
	}

	private getStartScript(framework: string): string {
		const scripts: Record<string, string> = {
			next: "next start",
			nuxt: "nuxt start",
			remix: "remix-serve build",
			sveltekit: "node build",
			"solid-start": "solid-start start",
			"qwik-city": "qwik start",
			angular: "ng serve --prod",
			react: "vite preview",
			vue: "vite preview",
		};
		return scripts[framework] || "vite preview";
	}

	private async initializeGit(projectPath: string): Promise<void> {
		try {
			await execa("git", ["init"], { cwd: projectPath });
			await execa("git", ["add", "-A"], { cwd: projectPath });
			await execa("git", ["commit", "-m", "Initial commit from Xaheen CLI"], {
				cwd: projectPath,
			});
			consola.success("Initialized git repository");
		} catch (error) {
			consola.warn("Failed to initialize git:", error);
		}
	}

	private async installDependencies(
		projectPath: string,
		packageManager: string,
	): Promise<void> {
		const spinner = ora("Installing dependencies...").start();

		try {
			await execa(packageManager, ["install"], {
				cwd: projectPath,
				stdio: "pipe",
			});
			spinner.succeed("Dependencies installed");
		} catch (error) {
			spinner.fail("Failed to install dependencies");
			throw error;
		}
	}

	private deepMerge(target: any, source: any): any {
		const result = { ...target };

		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				if (
					typeof source[key] === "object" &&
					source[key] !== null &&
					!Array.isArray(source[key])
				) {
					result[key] = this.deepMerge(result[key] || {}, source[key]);
				} else {
					result[key] = source[key];
				}
			}
		}

		return result;
	}
}
