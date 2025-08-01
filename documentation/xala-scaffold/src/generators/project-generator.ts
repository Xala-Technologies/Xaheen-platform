import path from "path";
import { z } from "zod";
import {
	DEFAULT_LOCALIZATION_CONFIG,
	LocalizationConfig,
} from "../localization/core.js";
import { ProjectConfig, ProjectPlatform } from "../types/project.js";
import { fileExists } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import {
	BaseGenerator,
	GenerationContext,
	TemplateFile,
} from "./base-generator.js";

// Project generation input schema
const ProjectGenerationInputSchema = z.object({
	name: z.string().min(1),
	platform: z.enum(["nextjs", "react", "nestjs", "library"]),
	typescript: z.boolean().default(true),
	localization: z.boolean().default(true),
	compliance: z
		.object({
			nsm: z.boolean().default(true),
			gdpr: z.boolean().default(true),
			wcag: z.enum(["AA", "AAA"]).default("AAA"),
		})
		.default({}),
	features: z
		.object({
			authentication: z.boolean().default(false),
			database: z.boolean().default(false),
			api: z.boolean().default(false),
			testing: z.boolean().default(true),
			docker: z.boolean().default(false),
			ci: z.boolean().default(false),
		})
		.default({}),
	styling: z
		.enum(["tailwind", "styled-components", "css-modules", "vanilla"])
		.default("tailwind"),
	packageManager: z.enum(["npm", "yarn", "pnpm"]).default("pnpm"),
	outputPath: z.string(),
});

type ProjectGenerationInput = z.infer<typeof ProjectGenerationInputSchema>;

// Platform-specific dependencies
const PLATFORM_DEPENDENCIES = {
	nextjs: {
		dependencies: [
			"next@14.x",
			"react@18.x",
			"react-dom@18.x",
			"@xala-technologies/ui-system@workspace:*",
			"@xala-technologies/foundation@workspace:*",
		],
		devDependencies: [
			"@types/react@18.x",
			"@types/react-dom@18.x",
			"@types/node@20.x",
			"typescript@5.x",
			"eslint@9.x",
			"eslint-config-next@14.x",
		],
	},
	react: {
		dependencies: [
			"react@18.x",
			"react-dom@18.x",
			"react-router-dom@6.x",
			"@xala-technologies/ui-system@workspace:*",
			"@xala-technologies/foundation@workspace:*",
		],
		devDependencies: [
			"@types/react@18.x",
			"@types/react-dom@18.x",
			"@types/node@20.x",
			"typescript@5.x",
			"vite@5.x",
			"@vitejs/plugin-react@4.x",
			"eslint@9.x",
		],
	},
	nestjs: {
		dependencies: [
			"@nestjs/core@10.x",
			"@nestjs/common@10.x",
			"@nestjs/platform-express@10.x",
			"@xala-technologies/foundation@workspace:*",
			"reflect-metadata@0.1.x",
			"rxjs@7.x",
		],
		devDependencies: [
			"@nestjs/cli@10.x",
			"@nestjs/schematics@10.x",
			"@nestjs/testing@10.x",
			"@types/node@20.x",
			"typescript@5.x",
			"eslint@9.x",
		],
	},
	library: {
		dependencies: ["@xala-technologies/foundation@workspace:*"],
		devDependencies: [
			"@types/node@20.x",
			"typescript@5.x",
			"tsup@8.x",
			"vitest@1.x",
			"eslint@9.x",
		],
	},
};

// Styling system dependencies
const STYLING_DEPENDENCIES = {
	tailwind: {
		dependencies: [],
		devDependencies: ["tailwindcss@3.x", "autoprefixer@10.x", "postcss@8.x"],
	},
	"styled-components": {
		dependencies: ["styled-components@6.x"],
		devDependencies: ["@types/styled-components@5.x"],
	},
	"css-modules": {
		dependencies: [],
		devDependencies: [],
	},
	vanilla: {
		dependencies: [],
		devDependencies: [],
	},
};

// Feature dependencies
const FEATURE_DEPENDENCIES = {
	authentication: {
		dependencies: ["@auth/core@0.x", "jsonwebtoken@9.x"],
		devDependencies: ["@types/jsonwebtoken@9.x"],
	},
	database: {
		dependencies: ["prisma@5.x", "@prisma/client@5.x"],
		devDependencies: [],
	},
	api: {
		dependencies: ["axios@1.x"],
		devDependencies: [],
	},
	testing: {
		dependencies: [],
		devDependencies: [
			"vitest@1.x",
			"@testing-library/react@14.x",
			"@testing-library/jest-dom@6.x",
			"jsdom@23.x",
		],
	},
	docker: {
		dependencies: [],
		devDependencies: [],
	},
	ci: {
		dependencies: [],
		devDependencies: [],
	},
};

// Project generator class
export class ProjectGenerator extends BaseGenerator {
	constructor() {
		super({
			name: "project-generator",
			description:
				"Generate new project structure with platform-specific configuration",
			templateDir: path.join(process.cwd(), "templates", "projects"),
			outputDir: "",
			overwrite: false,
			backup: true,
			validate: true,
			hooks: {
				beforeGenerate: async (context) => {
					logger.info(
						`Generating ${context.variables.platform} project: ${context.variables.name}`,
					);
				},
				afterGenerate: async (context, results) => {
					const successCount = results.filter((r) => r.success).length;
					logger.info(
						`Generated ${successCount} files for project ${context.variables.name}`,
					);
				},
			},
		});
	}

	// Validate input
	async validateInput(input: any): Promise<ProjectGenerationInput> {
		const validated = ProjectGenerationInputSchema.parse(input);

		// Check if output directory already exists
		if (await fileExists(validated.outputPath)) {
			const entries = await import("fs").then((fs) =>
				fs.promises.readdir(validated.outputPath),
			);
			if (entries.length > 0) {
				throw new Error(
					`Output directory ${validated.outputPath} is not empty`,
				);
			}
		}

		return validated;
	}

	// Prepare generation context
	async prepareContext(
		input: ProjectGenerationInput,
	): Promise<GenerationContext> {
		const templatePath = path.join(this.config.templateDir, input.platform);

		// Generate dependencies
		const dependencies = this.generateDependencies(input);

		// Generate scripts
		const scripts = this.generateScripts(input);

		// Generate configuration files content
		const configurations = await this.generateConfigurations(input);

		// Prepare localization config
		const localizationConfig: LocalizationConfig = input.localization
			? DEFAULT_LOCALIZATION_CONFIG
			: (undefined as any);

		const variables = {
			// Project info
			name: input.name,
			description: `${input.platform} application generated with Xala Scaffold`,
			platform: input.platform,
			typescript: input.typescript,

			// Dependencies
			dependencies: dependencies.dependencies,
			devDependencies: dependencies.devDependencies,
			scripts,

			// Features
			features: input.features,
			styling: input.styling,
			packageManager: input.packageManager,

			// Compliance
			compliance: input.compliance,
			nsmClassification: input.compliance.nsm ? "RESTRICTED" : "OPEN",
			wcagLevel: input.compliance.wcag,

			// Localization
			localization: input.localization,
			defaultLocale: localizationConfig?.defaultLocale || "nb-NO",
			supportedLocales: localizationConfig?.supportedLocales || ["nb-NO"],

			// Configurations
			...configurations,

			// Metadata
			generatedAt: new Date().toISOString(),
			generator: "xala-scaffold",
			version: "1.0.0",

			// Utilities
			kebabCase: (str: string) => str.toLowerCase().replace(/\s+/g, "-"),
			camelCase: (str: string) =>
				str.replace(/-([a-z])/g, (g) => g[1].toUpperCase()),
			pascalCase: (str: string) =>
				str.replace(/(^|-)([a-z])/g, (g) => g.slice(-1).toUpperCase()),
		};

		return {
			templatePath,
			outputPath: input.outputPath,
			variables,
			config: this.config,
			localization: localizationConfig,
			metadata: {
				timestamp: new Date().toISOString(),
				generator: this.config.name,
				version: "1.0.0",
			},
		};
	}

	// Get template files
	async getTemplateFiles(): Promise<TemplateFile[]> {
		const templateFiles = await this.scanTemplateDirectory(
			this.config.templateDir,
		);
		return this.loadTemplateFiles(templateFiles);
	}

	// Generate dependencies based on configuration
	private generateDependencies(input: ProjectGenerationInput): {
		dependencies: Record<string, string>;
		devDependencies: Record<string, string>;
	} {
		const dependencies: Record<string, string> = {};
		const devDependencies: Record<string, string> = {};

		// Platform dependencies
		const platformDeps = PLATFORM_DEPENDENCIES[input.platform];
		for (const dep of platformDeps.dependencies) {
			const [name, version] = dep.split("@");
			dependencies[name] = version;
		}
		for (const dep of platformDeps.devDependencies) {
			const [name, version] = dep.split("@");
			devDependencies[name] = version;
		}

		// Styling dependencies
		const stylingDeps = STYLING_DEPENDENCIES[input.styling];
		for (const dep of stylingDeps.dependencies) {
			const [name, version] = dep.split("@");
			dependencies[name] = version;
		}
		for (const dep of stylingDeps.devDependencies) {
			const [name, version] = dep.split("@");
			devDependencies[name] = version;
		}

		// Feature dependencies
		for (const [feature, enabled] of Object.entries(input.features)) {
			if (
				enabled &&
				FEATURE_DEPENDENCIES[feature as keyof typeof FEATURE_DEPENDENCIES]
			) {
				const featureDeps =
					FEATURE_DEPENDENCIES[feature as keyof typeof FEATURE_DEPENDENCIES];

				for (const dep of featureDeps.dependencies) {
					const [name, version] = dep.split("@");
					dependencies[name] = version;
				}
				for (const dep of featureDeps.devDependencies) {
					const [name, version] = dep.split("@");
					devDependencies[name] = version;
				}
			}
		}

		// Localization dependencies
		if (input.localization) {
			dependencies["i18next"] = "^23.0.0";
			dependencies["react-i18next"] = "^13.0.0";
		}

		// Compliance dependencies
		if (input.compliance.nsm || input.compliance.gdpr) {
			dependencies["@xala-technologies/norwegian-compliance"] = "workspace:*";
		}

		return { dependencies, devDependencies };
	}

	// Generate package.json scripts
	private generateScripts(
		input: ProjectGenerationInput,
	): Record<string, string> {
		const scripts: Record<string, string> = {};

		switch (input.platform) {
			case "nextjs":
				scripts.dev = "next dev";
				scripts.build = "next build";
				scripts.start = "next start";
				scripts.lint = "next lint";
				break;

			case "react":
				scripts.dev = "vite";
				scripts.build = "vite build";
				scripts.preview = "vite preview";
				scripts.lint =
					"eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0";
				break;

			case "nestjs":
				scripts.build = "nest build";
				scripts.start = "nest start";
				scripts["start:dev"] = "nest start --watch";
				scripts["start:debug"] = "nest start --debug --watch";
				scripts["start:prod"] = "node dist/main";
				scripts.lint = 'eslint "{src,apps,libs,test}/**/*.ts" --fix';
				break;

			case "library":
				scripts.build = "tsup";
				scripts["build:watch"] = "tsup --watch";
				scripts.lint =
					"eslint src --ext ts --report-unused-disable-directives --max-warnings 0";
				break;
		}

		// Common scripts
		if (input.typescript) {
			scripts["type-check"] = "tsc --noEmit";
		}

		if (input.features.testing) {
			scripts.test = "vitest";
			scripts["test:run"] = "vitest run";
			scripts["test:coverage"] = "vitest run --coverage";
		}

		if (input.features.database) {
			scripts["db:generate"] = "prisma generate";
			scripts["db:push"] = "prisma db push";
			scripts["db:migrate"] = "prisma migrate dev";
			scripts["db:studio"] = "prisma studio";
		}

		// Norwegian compliance scripts
		if (input.compliance.nsm || input.compliance.gdpr) {
			scripts["validate:compliance"] =
				"npx enterprise-standards validate --norwegian-compliance";
			scripts["validate:nsm"] = "npx enterprise-standards validate --nsm";
			scripts["validate:gdpr"] = "npx enterprise-standards validate --gdpr";
		}

		return scripts;
	}

	// Generate configuration files content
	private async generateConfigurations(
		input: ProjectGenerationInput,
	): Promise<Record<string, any>> {
		const configurations: Record<string, any> = {};

		// TypeScript configuration
		if (input.typescript) {
			configurations.tsConfig = this.generateTsConfig(input);
		}

		// ESLint configuration
		configurations.eslintConfig = this.generateEslintConfig(input);

		// Tailwind configuration
		if (input.styling === "tailwind") {
			configurations.tailwindConfig = this.generateTailwindConfig(input);
		}

		// Next.js configuration
		if (input.platform === "nextjs") {
			configurations.nextConfig = this.generateNextConfig(input);
		}

		// Vite configuration
		if (input.platform === "react") {
			configurations.viteConfig = this.generateViteConfig(input);
		}

		// Vitest configuration
		if (input.features.testing) {
			configurations.vitestConfig = this.generateVitestConfig(input);
		}

		// Prisma schema
		if (input.features.database) {
			configurations.prismaSchema = this.generatePrismaSchema(input);
		}

		// Docker configuration
		if (input.features.docker) {
			configurations.dockerfile = this.generateDockerfile(input);
			configurations.dockerCompose = this.generateDockerCompose(input);
		}

		// GitHub Actions
		if (input.features.ci) {
			configurations.githubActions = this.generateGitHubActions(input);
		}

		return configurations;
	}

	// Generate TypeScript configuration
	private generateTsConfig(input: ProjectGenerationInput): any {
		const baseConfig = {
			compilerOptions: {
				target: "ES2022",
				lib: ["dom", "dom.iterable", "es6"],
				allowJs: true,
				skipLibCheck: true,
				strict: true,
				noEmit: true,
				esModuleInterop: true,
				module: "esnext",
				moduleResolution: "bundler",
				resolveJsonModule: true,
				isolatedModules: true,
				jsx: "preserve",
				incremental: true,
				plugins: [],
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
				},
			},
			include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
			exclude: ["node_modules"],
		};

		// Platform-specific adjustments
		switch (input.platform) {
			case "nextjs":
				baseConfig.compilerOptions.plugins = [{ name: "next" }];
				baseConfig.include.push(".next/types/**/*.ts");
				break;

			case "react":
				baseConfig.compilerOptions.jsx = "react-jsx";
				break;

			case "nestjs":
				baseConfig.compilerOptions.experimentalDecorators = true;
				baseConfig.compilerOptions.emitDecoratorMetadata = true;
				baseConfig.compilerOptions.noEmit = false;
				baseConfig.compilerOptions.outDir = "./dist";
				break;

			case "library":
				baseConfig.compilerOptions.declaration = true;
				baseConfig.compilerOptions.outDir = "./dist";
				baseConfig.compilerOptions.noEmit = false;
				break;
		}

		return baseConfig;
	}

	// Generate ESLint configuration
	private generateEslintConfig(input: ProjectGenerationInput): any {
		const config = {
			extends: ["eslint:recommended", "@typescript-eslint/recommended"],
			parser: "@typescript-eslint/parser",
			plugins: ["@typescript-eslint"],
			rules: {
				"@typescript-eslint/no-unused-vars": "error",
				"@typescript-eslint/no-explicit-any": "warn",
				"@typescript-eslint/explicit-function-return-type": "off",
			},
		};

		// Platform-specific extensions
		if (input.platform === "nextjs") {
			config.extends.push("next/core-web-vitals");
		}

		if (input.platform === "react") {
			config.extends.push(
				"plugin:react/recommended",
				"plugin:react-hooks/recommended",
			);
		}

		return config;
	}

	// Generate Tailwind configuration
	private generateTailwindConfig(input: ProjectGenerationInput): any {
		return {
			content: [
				"./src/**/*.{js,ts,jsx,tsx,mdx}",
				"./pages/**/*.{js,ts,jsx,tsx,mdx}",
				"./components/**/*.{js,ts,jsx,tsx,mdx}",
				"./app/**/*.{js,ts,jsx,tsx,mdx}",
			],
			theme: {
				extend: {
					colors: {
						// Norwegian design tokens
						"norway-blue": "#003d82",
						"norway-red": "#ba0c2f",
						"norway-white": "#ffffff",
					},
				},
			},
			plugins: [
				// RTL support for Arabic
				input.localization && {
					handler: ({ addUtilities }: any) => {
						addUtilities({
							".rtl": { direction: "rtl" },
							".ltr": { direction: "ltr" },
						});
					},
				},
			].filter(Boolean),
		};
	}

	// Generate Next.js configuration
	private generateNextConfig(input: ProjectGenerationInput): any {
		const config: any = {
			typescript: {
				ignoreBuildErrors: false,
			},
			eslint: {
				ignoreDuringBuilds: false,
			},
		};

		if (input.localization) {
			config.i18n = {
				locales: ["nb-NO", "nn-NO", "en-US", "ar-SA", "fr-FR"],
				defaultLocale: "nb-NO",
				localeDetection: true,
			};
		}

		return config;
	}

	// Generate Vite configuration
	private generateViteConfig(input: ProjectGenerationInput): string {
		return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  ${
		input.features.testing
			? `
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },`
			: ""
	}
})`;
	}

	private generateVitestConfig(input: ProjectGenerationInput): any {
		return {
			globals: true,
			environment: "jsdom",
			setupFiles: ["./src/test/setup.ts"],
			coverage: {
				provider: "v8",
				reporter: ["text", "json", "html"],
				threshold: {
					global: {
						branches: 95,
						functions: 95,
						lines: 95,
						statements: 95,
					},
				},
			},
		};
	}

	private generatePrismaSchema(input: ProjectGenerationInput): string {
		return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}`;
	}

	private generateDockerfile(input: ProjectGenerationInput): string {
		const nodeVersion = "20-alpine";

		if (input.platform === "nextjs") {
			return `FROM node:${nodeVersion} AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f package-lock.json ]; then npm ci; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \\
  if [ -f yarn.lock ]; then yarn run build; \\
  elif [ -f package-lock.json ]; then npm run build; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \\
  else echo "Lockfile not found." && exit 1; \\
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]`;
		}

		return `FROM node:${nodeVersion}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`;
	}

	private generateDockerCompose(input: ProjectGenerationInput): any {
		const services: any = {
			app: {
				build: ".",
				ports: ["3000:3000"],
				environment: ["NODE_ENV=production"],
				depends_on: input.features.database ? ["postgres"] : undefined,
			},
		};

		if (input.features.database) {
			services.postgres = {
				image: "postgres:15-alpine",
				environment: [
					"POSTGRES_USER=postgres",
					"POSTGRES_PASSWORD=postgres",
					"POSTGRES_DB=app",
				],
				ports: ["5432:5432"],
				volumes: ["postgres_data:/var/lib/postgresql/data"],
			};
		}

		const compose = {
			version: "3.8",
			services,
		};

		if (input.features.database) {
			compose.volumes = {
				postgres_data: null,
			};
		}

		return compose;
	}

	private generateGitHubActions(input: ProjectGenerationInput): any {
		return {
			name: "CI",
			on: {
				push: { branches: ["main", "develop"] },
				pull_request: { branches: ["main", "develop"] },
			},
			jobs: {
				test: {
					"runs-on": "ubuntu-latest",
					steps: [
						{ uses: "actions/checkout@v4" },
						{
							uses: "actions/setup-node@v4",
							with: { "node-version": "20", cache: input.packageManager },
						},
						{ run: `${input.packageManager} install` },
						{ run: `${input.packageManager} run lint` },
						{ run: `${input.packageManager} run type-check` },
						input.features.testing && {
							run: `${input.packageManager} run test:run`,
						},
						{ run: `${input.packageManager} run build` },
						input.compliance.nsm && {
							run: `${input.packageManager} run validate:compliance`,
						},
					].filter(Boolean),
				},
			},
		};
	}
}

// Export convenience function
export async function generateProject(
	input: ProjectGenerationInput,
): Promise<void> {
	const generator = new ProjectGenerator();
	await generator.generate(input);
}
