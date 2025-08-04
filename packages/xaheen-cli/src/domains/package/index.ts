import chalk from "chalk";
import * as fs from "fs/promises";
import * as path from "path";
import type { CLICommand } from "../../types/index.js";
import { logger } from "../../utils/logger.js";

interface PackageTemplate {
	name: string;
	description: string;
	type: "ui" | "utils" | "types" | "config" | "hooks" | "lib";
	exports: string[];
	dependencies?: string[];
}

export default class PackageDomain {
	private packageTemplates: Map<string, PackageTemplate>;

	constructor() {
		this.packageTemplates = this.initializePackageTemplates();
	}

	private initializePackageTemplates(): Map<string, PackageTemplate> {
		const templates = new Map<string, PackageTemplate>();

		// Shared package templates for monorepo
		templates.set("ui-components", {
			name: "UI Components Package",
			description: "Shared UI components for the monorepo",
			type: "ui",
			exports: ["components", "styles"],
			dependencies: [
				"react",
				"@xala-technologies/ui-system",
				"class-variance-authority",
			],
		});

		templates.set("utils", {
			name: "Utilities Package",
			description: "Shared utility functions and helpers",
			type: "utils",
			exports: ["formatters", "validators", "helpers"],
			dependencies: ["date-fns", "lodash-es"],
		});

		templates.set("types", {
			name: "TypeScript Types Package",
			description: "Shared TypeScript types and interfaces",
			type: "types",
			exports: ["types", "interfaces", "enums"],
			dependencies: [],
		});

		templates.set("config", {
			name: "Configuration Package",
			description: "Shared configuration (ESLint, TypeScript, etc.)",
			type: "config",
			exports: ["eslint", "tsconfig", "prettier"],
			dependencies: ["eslint", "typescript", "prettier"],
		});

		templates.set("hooks", {
			name: "React Hooks Package",
			description: "Shared React hooks and custom hooks",
			type: "hooks",
			exports: ["hooks"],
			dependencies: ["react", "react-dom"],
		});

		templates.set("api-client", {
			name: "API Client Package",
			description: "Shared API client and data fetching utilities",
			type: "lib",
			exports: ["client", "fetchers", "mutations"],
			dependencies: ["axios", "swr", "@tanstack/react-query"],
		});

		templates.set("auth-lib", {
			name: "Authentication Library",
			description: "Shared authentication utilities and providers",
			type: "lib",
			exports: ["auth", "providers", "guards"],
			dependencies: ["jsonwebtoken", "bcryptjs"],
		});

		templates.set("database", {
			name: "Database Package",
			description: "Shared database models and utilities",
			type: "lib",
			exports: ["models", "schemas", "migrations"],
			dependencies: ["@prisma/client", "zod"],
		});

		return templates;
	}

	async create(command: CLICommand): Promise<void> {
		const packageName = command.target;

		if (!packageName) {
			logger.error("Package name is required");
			this.showAvailableTemplates();
			return;
		}

		const template = command.options?.template || "utils";
		const packageTemplate = this.packageTemplates.get(template);

		if (!packageTemplate) {
			logger.error(`Template "${template}" not found`);
			this.showAvailableTemplates();
			return;
		}

		logger.info(
			`📦 Creating ${packageTemplate.name}: ${chalk.green(packageName)}`,
		);

		// Check if we're in a monorepo
		const isMonorepo = await this.isMonorepo();
		const packagesDir = isMonorepo ? "./packages" : "./";
		const packagePath = path.join(packagesDir, packageName);

		try {
			// Create package directory
			await fs.mkdir(packagePath, { recursive: true });

			// Generate package structure
			await this.generatePackageStructure(
				packagePath,
				packageName,
				packageTemplate,
			);

			logger.success(
				`✅ Package created successfully at: ${chalk.cyan(packagePath)}`,
			);
			logger.info(`   Type: ${packageTemplate.type}`);
			logger.info(`   Exports: ${packageTemplate.exports.join(", ")}`);

			if (
				packageTemplate.dependencies &&
				packageTemplate.dependencies.length > 0
			) {
				logger.info(`\n   Install dependencies:`);
				logger.info(`   ${chalk.cyan(`cd ${packagePath} && bun install`)}`);
			}

			// Update workspace if in monorepo
			if (isMonorepo) {
				logger.info(`\n   Add to workspace in root package.json:`);
				logger.info(
					`   ${chalk.cyan(`"workspaces": ["packages/${packageName}"]`)}`,
				);
			}
		} catch (error) {
			logger.error("Failed to create package:", error);
		}
	}

	async list(command: CLICommand): Promise<void> {
		const isMonorepo = await this.isMonorepo();

		if (!isMonorepo) {
			logger.warn("Not in a monorepo structure");
			return;
		}

		try {
			const packagesDir = "./packages";
			const packages = await fs.readdir(packagesDir);

			logger.info(chalk.cyan("\n📦 Monorepo Packages:\n"));

			for (const pkg of packages) {
				const packagePath = path.join(packagesDir, pkg);
				const stat = await fs.stat(packagePath);

				if (stat.isDirectory()) {
					try {
						const packageJsonPath = path.join(packagePath, "package.json");
						const packageJson = JSON.parse(
							await fs.readFile(packageJsonPath, "utf-8"),
						);

						logger.info(`  • ${chalk.green(pkg)}`);
						logger.info(
							`    ${chalk.gray(packageJson.description || "No description")}`,
						);
						logger.info(
							`    Version: ${chalk.cyan(packageJson.version || "0.0.0")}`,
						);

						if (packageJson.main || packageJson.exports) {
							logger.info(
								`    Exports: ${chalk.yellow(packageJson.main || "ESM exports")}`,
							);
						}
						logger.info("");
					} catch (error) {
						logger.info(
							`  • ${chalk.green(pkg)} ${chalk.gray("(no package.json)")}`,
						);
					}
				}
			}
		} catch (error) {
			logger.error("Failed to list packages:", error);
		}
	}

	async add(command: CLICommand): Promise<void> {
		const packageName = command.target;

		if (!packageName) {
			logger.error("Package name is required");
			return;
		}

		const isMonorepo = await this.isMonorepo();

		if (!isMonorepo) {
			logger.warn(
				'Not in a monorepo structure. Use "xaheen package create" instead.',
			);
			return;
		}

		// Delegate to create with monorepo context
		await this.create(command);
	}

	private async generatePackageStructure(
		packagePath: string,
		packageName: string,
		template: PackageTemplate,
	): Promise<void> {
		// Create package.json
		const packageJson = {
			name: `@monorepo/${packageName}`,
			version: "0.1.0",
			private: false,
			description: template.description,
			main: "./dist/index.js",
			module: "./dist/index.mjs",
			types: "./dist/index.d.ts",
			exports: {
				".": {
					types: "./dist/index.d.ts",
					import: "./dist/index.mjs",
					require: "./dist/index.js",
				},
			},
			scripts: {
				build: "tsup",
				dev: "tsup --watch",
				lint: "eslint . --ext .ts,.tsx",
				test: "vitest",
				"type-check": "tsc --noEmit",
			},
			dependencies: this.getDependenciesForTemplate(template),
			devDependencies: {
				"@types/node": "^20.0.0",
				tsup: "^8.0.0",
				typescript: "^5.0.0",
				vitest: "^1.0.0",
			},
			peerDependencies:
				template.type === "ui" || template.type === "hooks"
					? {
							react: ">=18.0.0",
							"react-dom": ">=18.0.0",
						}
					: undefined,
		};

		await fs.writeFile(
			path.join(packagePath, "package.json"),
			JSON.stringify(packageJson, null, 2),
		);

		// Create src directory
		const srcPath = path.join(packagePath, "src");
		await fs.mkdir(srcPath, { recursive: true });

		// Create index.ts
		await fs.writeFile(
			path.join(srcPath, "index.ts"),
			this.generateIndexFile(packageName, template),
		);

		// Create tsconfig.json
		await fs.writeFile(
			path.join(packagePath, "tsconfig.json"),
			JSON.stringify(
				{
					extends: "../../tsconfig.json",
					compilerOptions: {
						outDir: "./dist",
						rootDir: "./src",
					},
					include: ["src/**/*"],
					exclude: ["node_modules", "dist"],
				},
				null,
				2,
			),
		);

		// Create tsup.config.ts
		await fs.writeFile(
			path.join(packagePath, "tsup.config.ts"),
			this.generateTsupConfig(),
		);

		// Create README
		await fs.writeFile(
			path.join(packagePath, "README.md"),
			this.generateReadme(packageName, template),
		);

		// Create example files based on template type
		await this.createTemplateFiles(srcPath, template);
	}

	private generateIndexFile(
		packageName: string,
		template: PackageTemplate,
	): string {
		const exports = template.exports
			.map((exp) => `export * from './${exp}';`)
			.join("\n");

		return `/**
 * @monorepo/${packageName}
 * ${template.description}
 * 
 * Generated with Xaheen Unified CLI v3.0.0
 */

${exports}

// Package version
export const version = '0.1.0';

// Package name
export const name = '@monorepo/${packageName}';`;
	}

	private generateTsupConfig(): string {
		return `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});`;
	}

	private generateReadme(
		packageName: string,
		template: PackageTemplate,
	): string {
		return `# @monorepo/${packageName}

${template.description}

## Installation

\`\`\`bash
# From monorepo root
bun install

# Build package
bun run build
\`\`\`

## Usage

\`\`\`typescript
import { ${template.exports[0]} } from '@monorepo/${packageName}';

// Use the exported utilities
\`\`\`

## Exports

${template.exports.map((exp) => `- \`${exp}\``).join("\n")}

## Development

\`\`\`bash
# Watch mode
bun run dev

# Type checking
bun run type-check

# Testing
bun run test
\`\`\`

---

Part of the monorepo managed by [Xaheen Unified CLI](https://github.com/xala-technologies/xaheen)`;
	}

	private async createTemplateFiles(
		srcPath: string,
		template: PackageTemplate,
	): Promise<void> {
		// Create example files for each export
		for (const exp of template.exports) {
			const filePath = path.join(srcPath, `${exp}.ts`);
			let content = "";

			switch (exp) {
				case "components":
					content = `export { Button } from './components/Button';
export { Card } from './components/Card';
export { Input } from './components/Input';`;
					break;
				case "hooks":
					content = `export { useDebounce } from './hooks/useDebounce';
export { useLocalStorage } from './hooks/useLocalStorage';
export { useMediaQuery } from './hooks/useMediaQuery';`;
					break;
				case "utils":
				case "helpers":
					content = `export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};`;
					break;
				case "types":
					content = `export interface User {
  id: string;
  name: string;
  email: string;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';`;
					break;
				default:
					content = `// ${exp} exports\nexport {};`;
			}

			await fs.writeFile(filePath, content);
		}
	}

	private getDependenciesForTemplate(
		template: PackageTemplate,
	): Record<string, string> {
		const deps: Record<string, string> = {};

		if (template.dependencies) {
			template.dependencies.forEach((dep) => {
				deps[dep] = "latest";
			});
		}

		return deps;
	}

	private async isMonorepo(): Promise<boolean> {
		try {
			await fs.access("./packages");
			const rootPackageJson = JSON.parse(
				await fs.readFile("./package.json", "utf-8"),
			);
			return rootPackageJson.workspaces !== undefined;
		} catch {
			return false;
		}
	}

	private showAvailableTemplates(): void {
		logger.info("\nAvailable package templates:");

		const templatesByType = new Map<string, PackageTemplate[]>();

		this.packageTemplates.forEach((template, key) => {
			const templates = templatesByType.get(template.type) || [];
			templates.push({ ...template, key });
			templatesByType.set(template.type, templates);
		});

		templatesByType.forEach((templates, type) => {
			logger.info(`\n  ${chalk.yellow(type.toUpperCase())}:`);
			templates.forEach((template: any) => {
				logger.info(
					`    • ${chalk.green(template.key)}: ${template.description}`,
				);
			});
		});
	}
}
