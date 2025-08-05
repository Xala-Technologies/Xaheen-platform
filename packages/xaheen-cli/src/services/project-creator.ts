/**
 * Project Creator Service
 * Handles the creation of new projects with proper configuration and scaffolding
 * Generated with Xaheen CLI - AI-Native Developer Productivity
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import chalk from "chalk";
import { logger } from "../utils/logger.js";
import type { ProjectConfig } from "../commands/init-interactive.js";

export interface ProjectCreationOptions {
	name: string;
	type: string;
	framework: string;
	database?: string;
	authentication?: string;
	deployment?: string;
	features: string[];
	integrations: string[];
	compliance: string[];
	aiFeatures: boolean;
	testing: boolean;
	cicd: boolean;
	monitoring: boolean;
	documentation: boolean;
	skipInstall?: boolean;
	skipGit?: boolean;
}

export class ProjectCreator {
	/**
	 * Create a new project with the specified configuration
	 */
	async createProject(options: ProjectCreationOptions): Promise<void> {
		const projectPath = join(process.cwd(), options.name);

		try {
			// Validate project doesn't exist
			if (existsSync(projectPath)) {
				throw new Error(`Directory "${options.name}" already exists`);
			}

			logger.info(chalk.blue(`Creating project: ${options.name}`));

			// Create project directory
			mkdirSync(projectPath, { recursive: true });

			// Initialize project structure
			await this.initializeProjectStructure(projectPath, options);

			// Install dependencies
			if (!options.skipInstall) {
				await this.installDependencies(projectPath, options);
			}

			// Initialize git repository
			if (!options.skipGit) {
				await this.initializeGitRepository(projectPath);
			}

			// Generate initial files
			await this.generateInitialFiles(projectPath, options);

			// Setup additional features
			await this.setupFeatures(projectPath, options);

			logger.info(chalk.green(`✅ Project "${options.name}" created successfully!`));
		} catch (error) {
			logger.error(chalk.red(`Failed to create project: ${error.message}`));
			throw error;
		}
	}

	/**
	 * Initialize basic project structure
	 */
	private async initializeProjectStructure(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		const directories = this.getDirectoryStructure(options);

		for (const dir of directories) {
			const fullPath = join(projectPath, dir);
			mkdirSync(fullPath, { recursive: true });
		}
	}

	/**
	 * Get directory structure based on project type and framework
	 */
	private getDirectoryStructure(options: ProjectCreationOptions): string[] {
		const baseStructure = ["src", "docs", "tests"];

		switch (options.type) {
			case "fullstack":
				return [
					...baseStructure,
					"src/components",
					"src/pages",
					"src/lib",
					"src/server",
					"src/database",
					"public",
					"config",
				];
			case "frontend":
				return [
					...baseStructure,
					"src/components",
					"src/pages",
					"src/lib",
					"src/hooks",
					"src/styles",
					"public",
				];
			case "backend":
				return [
					...baseStructure,
					"src/controllers",
					"src/services",
					"src/models",
					"src/middleware",
					"src/routes",
					"config",
				];
			case "api":
				return [
					...baseStructure,
					"src/routes",
					"src/controllers",
					"src/services",
					"src/middleware",
					"config",
				];
			case "mobile":
				return [
					...baseStructure,
					"src/screens",
					"src/components",
					"src/navigation",
					"src/services",
					"assets",
				];
			case "desktop":
				return [
					...baseStructure,
					"src/main",
					"src/renderer",
					"src/components",
					"src/services",
					"assets",
				];
			default:
				return baseStructure;
		}
	}

	/**
	 * Install project dependencies
	 */
	private async installDependencies(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		logger.info(chalk.blue("Installing dependencies..."));

		try {
			// Change to project directory and install
			process.chdir(projectPath);

			// Initialize package.json first
			const packageJson = this.generatePackageJson(options);
			writeFileSync(
				join(projectPath, "package.json"),
				JSON.stringify(packageJson, null, 2),
			);

			// Install dependencies
			execSync("npm install", { stdio: "inherit" });

			logger.info(chalk.green("✅ Dependencies installed successfully"));
		} catch (error) {
			logger.error(chalk.red(`Failed to install dependencies: ${error.message}`));
			throw error;
		}
	}

	/**
	 * Generate package.json based on project configuration
	 */
	private generatePackageJson(options: ProjectCreationOptions): Record<string, any> {
		const basePackageJson = {
			name: options.name,
			version: "0.1.0",
			private: true,
			scripts: {
				dev: "next dev",
				build: "next build",
				start: "next start",
				lint: "eslint . --ext .ts,.tsx,.js,.jsx",
				"lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
				test: "jest",
				"test:watch": "jest --watch",
				"test:coverage": "jest --coverage",
			},
			dependencies: this.getDependencies(options),
			devDependencies: this.getDevDependencies(options),
		};

		// Adjust scripts based on framework
		if (options.framework === "react") {
			basePackageJson.scripts = {
				...basePackageJson.scripts,
				dev: "react-scripts start",
				build: "react-scripts build",
				start: "react-scripts start",
			};
		} else if (options.framework === "vue") {
			basePackageJson.scripts = {
				...basePackageJson.scripts,
				dev: "vue-cli-service serve",
				build: "vue-cli-service build",
			};
		}

		return basePackageJson;
	}

	/**
	 * Get dependencies based on project configuration
	 */
	private getDependencies(options: ProjectCreationOptions): Record<string, string> {
		const dependencies: Record<string, string> = {};

		// Framework dependencies
		switch (options.framework) {
			case "nextjs":
				dependencies.next = "^14.0.0";
				dependencies.react = "^18.0.0";
				dependencies["react-dom"] = "^18.0.0";
				break;
			case "react":
				dependencies.react = "^18.0.0";
				dependencies["react-dom"] = "^18.0.0";
				dependencies["react-scripts"] = "^5.0.0";
				break;
			case "vue":
				dependencies.vue = "^3.0.0";
				dependencies["@vue/cli-service"] = "^5.0.0";
				break;
			case "angular":
				dependencies["@angular/core"] = "^17.0.0";
				dependencies["@angular/common"] = "^17.0.0";
				dependencies["@angular/platform-browser"] = "^17.0.0";
				break;
		}

		// Database dependencies
		if (options.database) {
			switch (options.database) {
				case "postgresql":
					dependencies.pg = "^8.0.0";
					dependencies["@types/pg"] = "^8.0.0";
					break;
				case "mysql":
					dependencies.mysql2 = "^3.0.0";
					break;
				case "mongodb":
					dependencies.mongodb = "^6.0.0";
					break;
				case "sqlite":
					dependencies["better-sqlite3"] = "^8.0.0";
					break;
			}
		}

		// Authentication dependencies
		if (options.authentication) {
			switch (options.authentication) {
				case "nextauth":
					dependencies["next-auth"] = "^4.0.0";
					break;
				case "auth0":
					dependencies["@auth0/auth0-react"] = "^2.0.0";
					break;
				case "firebase":
					dependencies.firebase = "^10.0.0";
					break;
			}
		}

		// Feature dependencies
		if (options.features.includes("tailwind")) {
			dependencies.tailwindcss = "^3.0.0";
		}

		if (options.features.includes("prisma")) {
			dependencies["@prisma/client"] = "^5.0.0";
		}

		return dependencies;
	}

	/**
	 * Get development dependencies
	 */
	private getDevDependencies(options: ProjectCreationOptions): Record<string, string> {
		const devDependencies: Record<string, string> = {
			typescript: "^5.0.0",
			"@types/node": "^20.0.0",
			eslint: "^8.0.0",
			prettier: "^3.0.0",
		};

		if (options.testing) {
			devDependencies.jest = "^29.0.0";
			devDependencies["@testing-library/react"] = "^14.0.0";
			devDependencies["@testing-library/jest-dom"] = "^6.0.0";
		}

		if (options.framework === "nextjs") {
			devDependencies["@types/react"] = "^18.0.0";
			devDependencies["@types/react-dom"] = "^18.0.0";
			devDependencies["eslint-config-next"] = "^14.0.0";
		}

		return devDependencies;
	}

	/**
	 * Initialize git repository
	 */
	private async initializeGitRepository(projectPath: string): Promise<void> {
		try {
			execSync("git init", { cwd: projectPath, stdio: "inherit" });
			
			// Create .gitignore
			const gitignoreContent = this.generateGitignore();
			writeFileSync(join(projectPath, ".gitignore"), gitignoreContent);

			execSync("git add .", { cwd: projectPath, stdio: "inherit" });
			execSync('git commit -m "Initial commit"', { cwd: projectPath, stdio: "inherit" });

			logger.info(chalk.green("✅ Git repository initialized"));
		} catch (error) {
			logger.warn(chalk.yellow(`Warning: Could not initialize git: ${error.message}`));
		}
	}

	/**
	 * Generate .gitignore content
	 */
	private generateGitignore(): string {
		return `# Dependencies
node_modules/
.pnp
.pnp.js

# Production
/build
/dist
/.next/
/out/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# rollup.js default build output
dist/

# Uncomment the public line in if your project uses Gatsby
# https://nextjs.org/docs/api-reference/next.config.js/introduction
# public

# Storybook build outputs
.out
.storybook-out

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
	}

	/**
	 * Generate initial project files
	 */
	private async generateInitialFiles(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		// Generate README.md
		const readmeContent = this.generateReadme(options);
		writeFileSync(join(projectPath, "README.md"), readmeContent);

		// Generate TypeScript config
		const tsConfigContent = this.generateTsConfig(options);
		writeFileSync(join(projectPath, "tsconfig.json"), JSON.stringify(tsConfigContent, null, 2));

		// Generate ESLint config
		const eslintConfigContent = this.generateEslintConfig(options);
		writeFileSync(join(projectPath, ".eslintrc.json"), JSON.stringify(eslintConfigContent, null, 2));

		// Generate Prettier config
		const prettierConfigContent = this.generatePrettierConfig();
		writeFileSync(join(projectPath, ".prettierrc"), JSON.stringify(prettierConfigContent, null, 2));

		logger.info(chalk.green("✅ Initial files generated"));
	}

	/**
	 * Generate README.md content
	 */
	private generateReadme(options: ProjectCreationOptions): string {
		return `# ${options.name}

${options.framework} project created with Xaheen CLI.

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── pages/         # Application pages
├── lib/           # Utility functions and configurations
└── styles/        # Global styles and themes
\`\`\`

## Features

${options.features.map(feature => `- ${feature}`).join('\n')}

## Technology Stack

- **Framework**: ${options.framework}
${options.database ? `- **Database**: ${options.database}` : ''}
${options.authentication ? `- **Authentication**: ${options.authentication}` : ''}
${options.deployment ? `- **Deployment**: ${options.deployment}` : ''}

## Generated with Xaheen CLI

This project was bootstrapped with [Xaheen CLI](https://github.com/xaheen/xaheen-cli) - the AI-Native developer productivity toolkit.

Learn more about Xaheen at [https://xaheen.com](https://xaheen.com)
`;
	}

	/**
	 * Generate TypeScript configuration
	 */
	private generateTsConfig(options: ProjectCreationOptions): Record<string, any> {
		const baseConfig = {
			compilerOptions: {
				target: "es5",
				lib: ["dom", "dom.iterable", "es6"],
				allowJs: true,
				skipLibCheck: true,
				esModuleInterop: true,
				allowSyntheticDefaultImports: true,
				strict: true,
				forceConsistentCasingInFileNames: true,
				noFallthroughCasesInSwitch: true,
				module: "esnext",
				moduleResolution: "node",
				resolveJsonModule: true,
				isolatedModules: true,
				noEmit: true,
				jsx: "react-jsx",
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
				},
			},
			include: [
				"src",
				"next-env.d.ts",
				"**/*.ts",
				"**/*.tsx",
			],
			exclude: [
				"node_modules",
			],
		};

		// Adjust for Next.js
		if (options.framework === "nextjs") {
			baseConfig.compilerOptions = {
				...baseConfig.compilerOptions,
				incremental: true,
				plugins: [
					{
						name: "next",
					},
				],
			};
		}

		return baseConfig;
	}

	/**
	 * Generate ESLint configuration
	 */
	private generateEslintConfig(options: ProjectCreationOptions): Record<string, any> {
		const baseConfig = {
			extends: [
				"eslint:recommended",
				"@typescript-eslint/recommended",
			],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "module",
			},
			env: {
				node: true,
				es6: true,
			},
			rules: {
				"@typescript-eslint/no-unused-vars": "error",
				"@typescript-eslint/no-explicit-any": "warn",
				"@typescript-eslint/explicit-function-return-type": "warn",
			},
		};

		// Add React rules if applicable
		if (options.framework === "react" || options.framework === "nextjs") {
			baseConfig.extends.push("plugin:react/recommended", "plugin:react-hooks/recommended");
			baseConfig.plugins.push("react", "react-hooks");
			baseConfig.env.browser = true;
			baseConfig.parserOptions.ecmaFeatures = { jsx: true };
		}

		// Add Next.js rules
		if (options.framework === "nextjs") {
			baseConfig.extends.push("next/core-web-vitals");
		}

		return baseConfig;
	}

	/**
	 * Generate Prettier configuration
	 */
	private generatePrettierConfig(): Record<string, any> {
		return {
			semi: true,
			trailingComma: "es5",
			singleQuote: false,
			printWidth: 100,
			tabWidth: 2,
			useTabs: true,
		};
	}

	/**
	 * Setup additional project features
	 */
	private async setupFeatures(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		// Setup CI/CD
		if (options.cicd) {
			await this.setupCICD(projectPath, options);
		}

		// Setup monitoring
		if (options.monitoring) {
			await this.setupMonitoring(projectPath, options);
		}

		// Setup documentation
		if (options.documentation) {
			await this.setupDocumentation(projectPath, options);
		}

		logger.info(chalk.green("✅ Additional features configured"));
	}

	/**
	 * Setup CI/CD configuration
	 */
	private async setupCICD(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		const githubWorkflowsDir = join(projectPath, ".github", "workflows");
		mkdirSync(githubWorkflowsDir, { recursive: true });

		const ciConfig = `name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm run build --if-present
    - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    # Add deployment steps here
`;

		writeFileSync(join(githubWorkflowsDir, "ci.yml"), ciConfig);
	}

	/**
	 * Setup monitoring configuration
	 */
	private async setupMonitoring(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		// Create basic monitoring configuration
		const monitoringConfig = {
			healthCheck: {
				endpoint: "/health",
				interval: 30000,
			},
			metrics: {
				enabled: true,
				endpoint: "/metrics",
			},
			logging: {
				level: "info",
				format: "json",
			},
		};

		writeFileSync(
			join(projectPath, "monitoring.json"),
			JSON.stringify(monitoringConfig, null, 2),
		);
	}

	/**
	 * Setup documentation
	 */
	private async setupDocumentation(
		projectPath: string,
		options: ProjectCreationOptions,
	): Promise<void> {
		const docsDir = join(projectPath, "docs");
		mkdirSync(docsDir, { recursive: true });

		// Create documentation structure
		const docFiles = [
			{
				name: "CONTRIBUTING.md",
				content: this.generateContributingGuide(options),
			},
			{
				name: "DEPLOYMENT.md",
				content: this.generateDeploymentGuide(options),
			},
			{
				name: "API.md",
				content: this.generateAPIDocumentation(options),
			},
		];

		for (const file of docFiles) {
			writeFileSync(join(docsDir, file.name), file.content);
		}
	}

	/**
	 * Generate contributing guide
	 */
	private generateContributingGuide(options: ProjectCreationOptions): string {
		return `# Contributing to ${options.name}

## Development Setup

1. Fork the repository
2. Clone your fork: \`git clone <your-fork-url>\`
3. Install dependencies: \`npm install\`
4. Create a feature branch: \`git checkout -b feature/your-feature\`

## Code Standards

- Use TypeScript for all new code
- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed

## Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## Pull Request Process

1. Ensure all tests pass
2. Update the README.md if needed
3. Request review from maintainers
4. Squash commits before merging
`;
	}

	/**
	 * Generate deployment guide
	 */
	private generateDeploymentGuide(options: ProjectCreationOptions): string {
		return `# Deployment Guide for ${options.name}

## Environment Setup

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`
NODE_ENV=production
${options.database ? `DATABASE_URL=your_database_connection_string` : ''}
${options.authentication ? `AUTH_SECRET=your_auth_secret` : ''}
\`\`\`

## Production Build

\`\`\`bash
npm run build
npm start
\`\`\`

## Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Health Checks

The application exposes health check endpoints at:

- \`/health\` - Basic health status
- \`/metrics\` - Application metrics
`;
	}

	/**
	 * Generate API documentation
	 */
	private generateAPIDocumentation(options: ProjectCreationOptions): string {
		return `# API Documentation for ${options.name}

## Base URL

\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

${options.authentication ? `This API uses ${options.authentication} for authentication.` : 'No authentication configured.'}

## Endpoints

### Health Check

\`\`\`
GET /health
\`\`\`

Returns the health status of the application.

### Metrics

\`\`\`
GET /metrics
\`\`\`

Returns application metrics in Prometheus format.

## Error Handling

All API errors follow this format:

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
\`\`\`
`;
	}
}

/**
 * Create a new project with the specified configuration
 */
export async function createProject(options: ProjectCreationOptions): Promise<void> {
	const creator = new ProjectCreator();
	return creator.createProject(options);
}