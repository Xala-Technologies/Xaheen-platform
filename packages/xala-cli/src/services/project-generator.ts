/**
 * @fileoverview Project Generator for Interactive Tech Builder
 * @description Generates full-stack projects based on selected technology stack
 */

import { mkdir, writeFile, readFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import ora from 'ora';
import chalk from 'chalk';

import {
	StackConfiguration,
	GeneratorContext,
	GenerationResult,
	ProjectType,
	QuickPreset,
	BuilderError
} from './builder-types.js';
import { configLoader } from './config-loader.js';

const execAsync = promisify(exec);

export class ProjectGenerator {
	private readonly templateBasePath: string;

	constructor(templateBasePath?: string) {
		this.templateBasePath = templateBasePath || join(__dirname, '../templates');
	}

	/**
	 * Generate project from stack configuration
	 */
	async generateProject(
		stack: StackConfiguration,
		targetPath: string,
		options: {
			dryRun?: boolean;
			skipInstall?: boolean;
			verbose?: boolean;
		} = {}
	): Promise<GenerationResult> {
		const startTime = Date.now();
		const result: GenerationResult = {
			success: false,
			generatedFiles: [],
			skippedFiles: [],
			errors: [],
			warnings: [],
			executionTime: 0
		};

		const spinner = ora('Generating project...').start();

		try {
			// Create generation context
			const context: GeneratorContext = {
				projectType: await this.getProjectTypeFromStack(stack),
				stack,
				targetPath,
				dryRun: options.dryRun || false,
				skipValidation: false
			};

			// Step 1: Create project structure
			await this.createProjectStructure(context, result);

			// Step 2: Generate configuration files
			await this.generateConfigurationFiles(context, result);

			// Step 3: Generate package.json and dependencies
			await this.generatePackageJson(context, result);

			// Step 4: Generate framework-specific files
			await this.generateFrameworkFiles(context, result);

			// Step 5: Generate database and ORM files
			await this.generateDatabaseFiles(context, result);

			// Step 6: Generate authentication files
			await this.generateAuthFiles(context, result);

			// Step 7: Generate UI system files
			await this.generateUIFiles(context, result);

			// Step 8: Generate example components and pages
			await this.generateExampleFiles(context, result);

			// Step 9: Generate deployment configuration
			await this.generateDeploymentFiles(context, result);

			// Step 10: Initialize git repository
			if (stack.git && !options.dryRun) {
				await this.initializeGit(context, result);
			}

			// Step 11: Install dependencies
			if (stack.install && !options.skipInstall && !options.dryRun) {
				await this.installDependencies(context, result);
			}

			result.success = true;
			result.executionTime = Date.now() - startTime;

			spinner.succeed(`Project generated successfully in ${result.executionTime}ms`);

		} catch (error) {
			result.errors.push(error instanceof Error ? error.message : String(error));
			result.executionTime = Date.now() - startTime;
			spinner.fail('Project generation failed');
		}

		return result;
	}

	/**
	 * Generate project from preset
	 */
	async generateFromPreset(
		presetId: string,
		targetPath: string,
		customizations?: Partial<StackConfiguration>
	): Promise<GenerationResult> {
		const preset = await configLoader.getQuickPreset(presetId);
		if (!preset) {
			throw new BuilderError(`Preset ${presetId} not found`, 'PRESET_NOT_FOUND');
		}

		// Apply customizations if provided
		const stack: StackConfiguration = customizations
			? { ...preset.stack, ...customizations }
			: preset.stack;

		return await this.generateProject(stack, targetPath);
	}

	/**
	 * Get project structure preview
	 */
	async getProjectStructurePreview(stack: StackConfiguration): Promise<readonly string[]> {
		const structure: string[] = [];

		// Base structure
		structure.push(
			'README.md',
			'package.json',
			'.gitignore',
			'.env.example'
		);

		// Frontend structure
		if (stack.webFrontend && stack.webFrontend !== 'none') {
			const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
			
			if (frontend === 'next') {
				structure.push(
					'next.config.js',
					'app/',
					'app/layout.tsx',
					'app/page.tsx',
					'app/globals.css',
					'components/',
					'lib/',
					'public/'
				);
			} else if (frontend === 'react') {
				structure.push(
					'src/',
					'src/App.tsx',
					'src/main.tsx',
					'src/components/',
					'src/hooks/',
					'src/utils/',
					'public/',
					'vite.config.ts'
				);
			} else if (frontend === 'vue' || frontend === 'nuxt') {
				structure.push(
					'nuxt.config.ts',
					'app.vue',
					'pages/',
					'components/',
					'composables/',
					'assets/',
					'public/'
				);
			}
		}

		// Backend structure
		if (stack.backend && stack.backend !== 'none') {
			if (stack.backend === 'next-api') {
				structure.push('app/api/');
			} else if (['hono', 'fastify', 'express'].includes(stack.backend)) {
				structure.push(
					'src/server/',
					'src/server/index.ts',
					'src/server/routes/',
					'src/server/middleware/',
					'src/server/utils/'
				);
			} else if (stack.backend === 'dotnet') {
				structure.push(
					'Controllers/',
					'Models/',
					'Services/',
					'Program.cs',
					'appsettings.json'
				);
			}
		}

		// Database structure
		if (stack.database && stack.database !== 'none') {
			if (stack.orm === 'prisma') {
				structure.push(
					'prisma/',
					'prisma/schema.prisma',
					'prisma/migrations/'
				);
			} else if (stack.orm === 'drizzle') {
				structure.push(
					'src/db/',
					'src/db/schema.ts',
					'src/db/migrations/',
					'drizzle.config.ts'
				);
			}
		}

		// Configuration files
		if (stack.uiSystem === 'xala') {
			structure.push(
				'xala.config.js',
				'tailwind.config.js'
			);
		}

		// Deployment files
		if (stack.webDeploy === 'vercel') {
			structure.push('vercel.json');
		} else if (stack.webDeploy === 'netlify') {
			structure.push('netlify.toml');
		} else if (stack.webDeploy === 'docker') {
			structure.push('Dockerfile', 'docker-compose.yml');
		}

		return structure.sort();
	}

	/**
	 * Create project directory structure
	 */
	private async createProjectStructure(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		const { targetPath, stack, dryRun } = context;

		// Ensure target directory exists
		if (!dryRun) {
			try {
				await access(targetPath);
			} catch {
				await mkdir(targetPath, { recursive: true });
			}
		}

		// Create base directories
		const directories = [
			'src',
			'public',
			'docs',
			'scripts'
		];

		// Add framework-specific directories
		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
			
			if (frontend === 'next') {
				directories.push('app', 'components', 'lib', 'styles');
			} else if (frontend === 'react') {
				directories.push('src/components', 'src/hooks', 'src/utils', 'src/assets');
			} else if (frontend === 'vue' || frontend === 'nuxt') {
				directories.push('pages', 'components', 'composables', 'assets', 'plugins');
			}
		}

		// Add backend directories
		if (stack.backend && !['next-api', 'none'].includes(stack.backend)) {
			directories.push('src/server', 'src/server/routes', 'src/server/middleware');
		}

		// Add database directories
		if (stack.orm === 'prisma') {
			directories.push('prisma', 'prisma/migrations');
		} else if (stack.orm === 'drizzle') {
			directories.push('src/db', 'src/db/migrations');
		}

		// Create directories
		for (const dir of directories) {
			const dirPath = join(targetPath, dir);
			if (!dryRun) {
				await mkdir(dirPath, { recursive: true });
			}
			result.generatedFiles.push(dir + '/');
		}
	}

	/**
	 * Generate configuration files
	 */
	private async generateConfigurationFiles(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		const { targetPath, stack, dryRun } = context;

		// Generate .gitignore
		const gitignoreContent = await this.generateGitignore(stack);
		await this.writeFile(join(targetPath, '.gitignore'), gitignoreContent, dryRun);
		result.generatedFiles.push('.gitignore');

		// Generate .env.example
		const envContent = await this.generateEnvExample(stack);
		await this.writeFile(join(targetPath, '.env.example'), envContent, dryRun);
		result.generatedFiles.push('.env.example');

		// Generate README.md
		const readmeContent = await this.generateReadme(stack);
		await this.writeFile(join(targetPath, 'README.md'), readmeContent, dryRun);
		result.generatedFiles.push('README.md');

		// Generate TypeScript config if needed
		if (this.needsTypeScript(stack)) {
			const tsconfigContent = await this.generateTsConfig(stack);
			await this.writeFile(join(targetPath, 'tsconfig.json'), tsconfigContent, dryRun);
			result.generatedFiles.push('tsconfig.json');
		}

		// Generate Tailwind config if UI system is used
		if (stack.uiSystem) {
			const tailwindConfig = await this.generateTailwindConfig(stack);
			await this.writeFile(join(targetPath, 'tailwind.config.js'), tailwindConfig, dryRun);
			result.generatedFiles.push('tailwind.config.js');
		}
	}

	/**
	 * Generate package.json
	 */
	private async generatePackageJson(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		const { targetPath, stack, dryRun } = context;

		const packageJson = {
			name: stack.projectName,
			version: '0.1.0',
			private: true,
			description: `A ${stack.webFrontend} application generated by Xaheen CLI`,
			scripts: await this.generateScripts(stack),
			dependencies: await this.generateDependencies(stack),
			devDependencies: await this.generateDevDependencies(stack),
			engines: this.generateEngines(stack),
			...(stack.packageManager === 'pnpm' && { packageManager: 'pnpm@latest' })
		};

		const packageJsonContent = JSON.stringify(packageJson, null, 2);
		await this.writeFile(join(targetPath, 'package.json'), packageJsonContent, dryRun);
		result.generatedFiles.push('package.json');
	}

	/**
	 * Generate framework-specific files
	 */
	private async generateFrameworkFiles(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		const { targetPath, stack, dryRun } = context;

		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
			
			if (frontend === 'next') {
				await this.generateNextjsFiles(targetPath, stack, dryRun, result);
			} else if (frontend === 'react') {
				await this.generateReactFiles(targetPath, stack, dryRun, result);
			} else if (frontend === 'vue' || frontend === 'nuxt') {
				await this.generateVueFiles(targetPath, stack, dryRun, result);
			}
		}
	}

	// Helper methods for generating specific file types...

	private async generateGitignore(stack: StackConfiguration): Promise<string> {
		const lines = [
			'node_modules/',
			'.env',
			'.env.local',
			'.env.development.local',
			'.env.test.local',
			'.env.production.local',
			'',
			'# Logs',
			'npm-debug.log*',
			'yarn-debug.log*',
			'yarn-error.log*',
			'pnpm-debug.log*',
			'lerna-debug.log*',
			'',
			'# Build outputs',
			'dist/',
			'build/',
			'.next/',
			'out/',
		];

		if (stack.orm === 'prisma') {
			lines.push('', '# Prisma', 'prisma/dev.db');
		}

		if (stack.webDeploy === 'vercel') {
			lines.push('', '# Vercel', '.vercel');
		}

		return lines.join('\n');
	}

	private async generateEnvExample(stack: StackConfiguration): Promise<string> {
		const vars: string[] = [
			'# Database',
			'DATABASE_URL="postgresql://username:password@localhost:5432/database"',
			'',
			'# App Configuration',
			'NEXT_PUBLIC_APP_URL="http://localhost:3000"'
		];

		if (stack.auth && stack.auth !== 'none') {
			vars.push('', '# Authentication');
			if (stack.auth === 'clerk') {
				vars.push(
					'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""',
					'CLERK_SECRET_KEY=""'
				);
			} else if (stack.auth === 'auth0') {
				vars.push(
					'AUTH0_SECRET=""',
					'AUTH0_BASE_URL=""',
					'AUTH0_ISSUER_BASE_URL=""',
					'AUTH0_CLIENT_ID=""',
					'AUTH0_CLIENT_SECRET=""'
				);
			}
		}

		return vars.join('\n');
	}

	private async generateReadme(stack: StackConfiguration): Promise<string> {
		return `# ${stack.projectName}

A modern full-stack application built with:

- **Frontend**: ${this.formatStackItem(stack.webFrontend)}
- **Backend**: ${stack.backend}
- **Database**: ${stack.database}
- **ORM**: ${stack.orm}
- **Authentication**: ${stack.auth}
- **UI System**: ${stack.uiSystem}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   ${stack.packageManager} install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. Start the development server:
   \`\`\`bash
   ${stack.packageManager} run dev
   \`\`\`

## Scripts

- \`dev\` - Start development server
- \`build\` - Build for production
- \`start\` - Start production server
- \`lint\` - Run linting
- \`test\` - Run tests

Generated with ❤️ by [Xaheen CLI](https://github.com/xaheen-technologies/xaheen-cli)
`;
	}

	private async generateTsConfig(stack: StackConfiguration): Promise<string> {
		const config = {
			compilerOptions: {
				target: "es5",
				lib: ["dom", "dom.iterable", "es6"],
				allowJs: true,
				skipLibCheck: true,
				strict: true,
				forceConsistentCasingInFileNames: true,
				noEmit: true,
				esModuleInterop: true,
				module: "esnext",
				moduleResolution: "bundler",
				resolveJsonModule: true,
				isolatedModules: true,
				jsx: "preserve",
				incremental: true,
				plugins: [
					{
						name: "next"
					}
				],
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
					"@/components/*": ["./src/components/*"],
					"@/lib/*": ["./src/lib/*"]
				}
			},
			include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
			exclude: ["node_modules"]
		};

		return JSON.stringify(config, null, 2);
	}

	private async generateTailwindConfig(stack: StackConfiguration): Promise<string> {
		return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
    },
  },
  plugins: [],
}`;
	}

	private async generateScripts(stack: StackConfiguration): Promise<Record<string, string>> {
		const scripts: Record<string, string> = {};

		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
			
			if (frontend === 'next') {
				scripts.dev = 'next dev';
				scripts.build = 'next build';
				scripts.start = 'next start';
			} else if (frontend === 'react') {
				scripts.dev = 'vite';
				scripts.build = 'vite build';
				scripts.preview = 'vite preview';
			}
		}

		scripts.lint = 'eslint . --ext .ts,.tsx,.js,.jsx';
		scripts.type = 'tsc --noEmit';
		
		if (stack.orm === 'prisma') {
			scripts['db:generate'] = 'prisma generate';
			scripts['db:push'] = 'prisma db push';
			scripts['db:migrate'] = 'prisma migrate dev';
		} else if (stack.orm === 'drizzle') {
			scripts['db:generate'] = 'drizzle-kit generate:pg';
			scripts['db:push'] = 'drizzle-kit push:pg';
		}

		return scripts;
	}

	private async generateDependencies(stack: StackConfiguration): Promise<Record<string, string>> {
		const deps: Record<string, string> = {};

		// Frontend dependencies
		if (stack.webFrontend) {
			const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
			
			if (frontend === 'next') {
				deps.next = '^14.0.0';
				deps.react = '^18.0.0';
				deps['react-dom'] = '^18.0.0';
			} else if (frontend === 'react') {
				deps.react = '^18.0.0';
				deps['react-dom'] = '^18.0.0';
			}
		}

		// UI System
		if (stack.uiSystem === 'xala') {
			deps['@xala-technologies/ui'] = '^1.0.0';
			deps.tailwindcss = '^3.0.0';
		}

		// Database and ORM
		if (stack.orm === 'prisma') {
			deps['@prisma/client'] = '^5.0.0';
		} else if (stack.orm === 'drizzle') {
			deps['drizzle-orm'] = '^0.28.0';
		}

		// Authentication
		if (stack.auth === 'clerk') {
			deps['@clerk/nextjs'] = '^4.0.0';
		} else if (stack.auth === 'auth0') {
			deps['@auth0/nextjs-auth0'] = '^3.0.0';
		}

		return deps;
	}

	private async generateDevDependencies(stack: StackConfiguration): Promise<Record<string, string>> {
		const devDeps: Record<string, string> = {
			'@types/node': '^20.0.0',
			typescript: '^5.0.0',
			eslint: '^8.0.0',
			prettier: '^3.0.0'
		};

		if (this.needsReactTypes(stack)) {
			devDeps['@types/react'] = '^18.0.0';
			devDeps['@types/react-dom'] = '^18.0.0';
		}

		if (stack.orm === 'prisma') {
			devDeps.prisma = '^5.0.0';
		} else if (stack.orm === 'drizzle') {
			devDeps['drizzle-kit'] = '^0.19.0';
		}

		return devDeps;
	}

	private generateEngines(stack: StackConfiguration): Record<string, string> {
		const engines: Record<string, string> = {};

		if (stack.runtime === 'node') {
			engines.node = '>=18.0.0';
		} else if (stack.runtime === 'bun') {
			engines.bun = '>=1.0.0';
		}

		if (stack.packageManager === 'pnpm') {
			engines.pnpm = '>=8.0.0';
		}

		return engines;
	}

	// Additional helper methods...

	private async getProjectTypeFromStack(stack: StackConfiguration): Promise<ProjectType> {
		const config = await configLoader.loadConfiguration();
		// Try to infer project type from stack characteristics
		for (const projectType of config.projectTypes) {
			// Simple heuristic based on default selections
			let matches = 0;
			let total = 0;
			
			for (const [key, value] of Object.entries(projectType.defaultSelections)) {
				total++;
				const stackValue = (stack as any)[key];
				if (stackValue === value || (Array.isArray(value) && value.includes(stackValue))) {
					matches++;
				}
			}
			
			// If more than 50% match, consider it the right project type
			if (total > 0 && matches / total > 0.5) {
				return projectType;
			}
		}
		
		// Default to the first project type if no match found
		return config.projectTypes[0]!;
	}

	private async generateNextjsFiles(
		targetPath: string,
		stack: StackConfiguration,
		dryRun: boolean,
		result: GenerationResult
	): Promise<void> {
		// Generate Next.js specific files
		const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`;

		await this.writeFile(join(targetPath, 'next.config.js'), nextConfig, dryRun);
		result.generatedFiles.push('next.config.js');

		// Generate app layout
		const layout = `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${stack.projectName}',
  description: 'Generated by Xaheen CLI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`;

		await this.writeFile(join(targetPath, 'app/layout.tsx'), layout, dryRun);
		result.generatedFiles.push('app/layout.tsx');

		// Generate home page
		const page = `export default function Home(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">Welcome to ${stack.projectName}</h1>
        <p className="mt-4 text-lg">
          A modern full-stack application built with Xaheen CLI
        </p>
      </div>
    </main>
  )
}`;

		await this.writeFile(join(targetPath, 'app/page.tsx'), page, dryRun);
		result.generatedFiles.push('app/page.tsx');

		// Generate globals.css
		const globalsCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

		await this.writeFile(join(targetPath, 'app/globals.css'), globalsCss, dryRun);
		result.generatedFiles.push('app/globals.css');
	}

	private async generateReactFiles(
		targetPath: string,
		stack: StackConfiguration,
		dryRun: boolean,
		result: GenerationResult
	): Promise<void> {
		// Generate Vite config
		const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})`;

		await this.writeFile(join(targetPath, 'vite.config.ts'), viteConfig, dryRun);
		result.generatedFiles.push('vite.config.ts');
	}

	private async generateVueFiles(
		targetPath: string,
		stack: StackConfiguration,
		dryRun: boolean,
		result: GenerationResult
	): Promise<void> {
		// Vue/Nuxt specific file generation
		// Implementation would go here
	}

	private async generateDatabaseFiles(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		// Database and ORM specific file generation
		// Implementation would go here
	}

	private async generateAuthFiles(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		// Authentication specific file generation
		// Implementation would go here
	}

	private async generateUIFiles(
		context: GeneratorContext,  
		result: GenerationResult
	): Promise<void> {
		// UI system specific file generation
		// Implementation would go here
	}

	private async generateExampleFiles(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		// Example components and pages generation
		// Implementation would go here
	}

	private async generateDeploymentFiles(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		// Deployment configuration file generation
		// Implementation would go here
	}

	private async initializeGit(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		const { targetPath } = context;
		
		try {
			await execAsync('git init', { cwd: targetPath });
			await execAsync('git add .', { cwd: targetPath });
			await execAsync('git commit -m "Initial commit - Generated by Xaheen CLI"', { cwd: targetPath });
			result.generatedFiles.push('.git/');
		} catch (error) {
			result.warnings.push(`Failed to initialize git: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async installDependencies(
		context: GeneratorContext,
		result: GenerationResult
	): Promise<void> {
		const { stack, targetPath } = context;
		const packageManager = stack.packageManager;

		try {
			const command = packageManager === 'npm' ? 'npm install' : 
							packageManager === 'pnpm' ? 'pnpm install' : 
							'yarn install';
			
			await execAsync(command, { cwd: targetPath });
		} catch (error) {
			result.errors.push(`Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async writeFile(filePath: string, content: string, dryRun: boolean): Promise<void> {
		if (dryRun) {
			return;
		}

		// Ensure directory exists
		await mkdir(dirname(filePath), { recursive: true });
		await writeFile(filePath, content, 'utf-8');
	}

	private needsTypeScript(stack: StackConfiguration): boolean {
		return stack.webFrontend !== 'none' || stack.backend !== 'none';
	}

	private needsReactTypes(stack: StackConfiguration): boolean {
		const frontend = Array.isArray(stack.webFrontend) ? stack.webFrontend[0] : stack.webFrontend;
		return frontend === 'react' || frontend === 'next';
	}

	private formatStackItem(item: string | readonly string[]): string {
		if (Array.isArray(item)) {
			return item.join(', ');
		}
		return item;
	}
}

// Export singleton instance
export const projectGenerator = new ProjectGenerator();