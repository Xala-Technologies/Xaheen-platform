/**
 * Platform Manager - Multi-platform abstraction layer for Xala UI
 *
 * Provides unified interface for generating components across different
 * frontend platforms (React, Next.js, Vue, Angular, Svelte, Electron)
 */

import { consola } from "consola";
import * as fs from "fs-extra";
import * as Handlebars from "handlebars";
import * as path from "path";
import type {
	GenerationResult,
	TemplateContext,
	XalaComponentSpec,
	XalaPlatform,
} from "../../types/index.js";

// Platform configuration interface
export interface PlatformConfig {
	name: XalaPlatform;
	fileExtensions: {
		component: string;
		style: string;
		test: string;
		story: string;
	};
	templateDir: string;
	outputDir: string;
	features: {
		typescript: boolean;
		cssInJs: boolean;
		styledComponents: boolean;
		cssModules: boolean;
		localization: {
			system: string;
			functionName: string;
			syntax: string;
		};
	};
	dependencies: {
		ui: string[];
		dev: string[];
		peer: string[];
	};
}

// Abstract platform interface
export abstract class Platform {
	protected config: PlatformConfig;
	protected handlebars: typeof Handlebars;

	constructor(config: PlatformConfig) {
		this.config = config;
		this.handlebars = Handlebars.create();
		this.registerHelpers();
	}

	abstract generateComponent(
		spec: XalaComponentSpec,
		context: TemplateContext,
	): Promise<GenerationResult>;
	abstract validateComponent(
		filePath: string,
	): Promise<{ valid: boolean; issues: string[] }>;
	abstract setupProject(projectPath: string): Promise<void>;
	abstract installDependencies(projectPath: string): Promise<void>;

	protected registerHelpers(): void {
		// Common helpers for all platforms
		this.handlebars.registerHelper("camelCase", (str: string) => {
			return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
		});

		this.handlebars.registerHelper("pascalCase", (str: string) => {
			return (
				str.charAt(0).toUpperCase() +
				str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase())
			);
		});

		this.handlebars.registerHelper("kebabCase", (str: string) => {
			return str
				.replace(/([A-Z])/g, "-$1")
				.toLowerCase()
				.replace(/^-/, "");
		});

		this.handlebars.registerHelper(
			"if_eq",
			function (a: any, b: any, options: any) {
				return a === b ? options.fn(this) : options.inverse(this);
			},
		);

		this.handlebars.registerHelper(
			"localize",
			function (key: string, context: any) {
				const { localization } = context.data.root.platform;
				return `${localization.functionName}('${key}')`;
			},
		);
	}

	protected async loadTemplate(templateName: string): Promise<string> {
		const templatePath = path.join(
			__dirname,
			"../../templates/platforms",
			this.config.templateDir,
			`${templateName}.hbs`,
		);

		if (!(await fs.pathExists(templatePath))) {
			throw new Error(`Template not found: ${templatePath}`);
		}

		return fs.readFile(templatePath, "utf-8");
	}

	protected async generateFile(
		templateName: string,
		context: TemplateContext,
		outputPath: string,
	): Promise<void> {
		const templateContent = await this.loadTemplate(templateName);
		const compiledTemplate = this.handlebars.compile(templateContent);
		const generatedContent = compiledTemplate(context);

		await fs.ensureDir(path.dirname(outputPath));
		await fs.writeFile(outputPath, generatedContent);
	}
}

// React Platform Implementation
export class ReactPlatform extends Platform {
	constructor() {
		super({
			name: "react",
			fileExtensions: {
				component: ".tsx",
				style: ".module.css",
				test: ".test.tsx",
				story: ".stories.tsx",
			},
			templateDir: "react",
			outputDir: "src/components",
			features: {
				typescript: true,
				cssInJs: false,
				styledComponents: false,
				cssModules: true,
				localization: {
					system: "react-i18next",
					functionName: "t",
					syntax: '{t("key")}',
				},
			},
			dependencies: {
				ui: [
					"@xala-technologies/ui-system",
					"clsx",
					"class-variance-authority",
				],
				dev: ["@types/react", "@types/react-dom"],
				peer: ["react", "react-dom"],
			},
		});
	}

	async generateComponent(
		spec: XalaComponentSpec,
		context: TemplateContext,
	): Promise<GenerationResult> {
		const result: GenerationResult = {
			success: true,
			files: [],
			errors: [],
			warnings: [],
			duration: 0,
		};

		const startTime = Date.now();

		try {
			const componentName = spec.name;
			const componentDir = path.join(
				context.project.name,
				this.config.outputDir,
				componentName,
			);

			// Generate main component file
			const componentPath = path.join(
				componentDir,
				`${componentName}${this.config.fileExtensions.component}`,
			);
			await this.generateFile("component", context, componentPath);
			result.files.push(componentPath);

			// Generate styles if needed
			if (!context.features.cssInJs) {
				const stylePath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.style}`,
				);
				await this.generateFile("styles", context, stylePath);
				result.files.push(stylePath);
			}

			// Generate tests if requested
			if (spec.withTests) {
				const testPath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.test}`,
				);
				await this.generateFile("test", context, testPath);
				result.files.push(testPath);
			}

			// Generate stories if requested
			if (spec.withStories) {
				const storyPath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.story}`,
				);
				await this.generateFile("story", context, storyPath);
				result.files.push(storyPath);
			}

			// Generate index file for easier imports
			const indexPath = path.join(componentDir, "index.ts");
			await this.generateFile("index", context, indexPath);
			result.files.push(indexPath);
		} catch (error) {
			result.success = false;
			result.errors.push(`Component generation failed: ${error.message}`);
		}

		result.duration = Date.now() - startTime;
		return result;
	}

	async validateComponent(
		filePath: string,
	): Promise<{ valid: boolean; issues: string[] }> {
		const issues: string[] = [];

		try {
			const content = await fs.readFile(filePath, "utf-8");

			// Check for raw HTML elements (zero raw HTML policy)
			const rawHtmlPattern =
				/<(div|span|p|h[1-6]|button|input|form|ul|ol|li|table|tr|td|th|thead|tbody|tfoot)\s/g;
			const rawHtmlMatches = content.match(rawHtmlPattern);

			if (rawHtmlMatches) {
				issues.push(
					`Found raw HTML elements: ${rawHtmlMatches.join(", ")}. Use semantic components instead.`,
				);
			}

			// Check for hardcoded text (localization requirement)
			const hardcodedTextPattern = />[^<{]*[a-zA-Z]{3,}[^<}]*</g;
			const textMatches = content.match(hardcodedTextPattern);

			if (textMatches) {
				const filteredMatches = textMatches.filter(
					(match) =>
						!match.includes("t(") &&
						!match.includes("className") &&
						!match.includes("data-") &&
						match.trim().length > 5,
				);

				if (filteredMatches.length > 0) {
					issues.push(
						`Found hardcoded text that should be localized: ${filteredMatches.slice(0, 3).join(", ")}`,
					);
				}
			}

			// Check for hardcoded styling
			const inlineStylePattern = /style\s*=\s*\{/g;
			if (inlineStylePattern.test(content)) {
				issues.push(
					"Found inline styles. Use design tokens and semantic components instead.",
				);
			}

			// Check for proper imports
			if (!content.includes("@xala-technologies/ui-system")) {
				issues.push(
					"Missing import from @xala-technologies/ui-system. Use semantic components.",
				);
			}
		} catch (error) {
			issues.push(`Failed to validate component: ${error.message}`);
		}

		return {
			valid: issues.length === 0,
			issues,
		};
	}

	async setupProject(projectPath: string): Promise<void> {
		// Setup React-specific configuration
		await this.createTsConfig(projectPath);
		await this.createCssConfig(projectPath);
	}

	async installDependencies(projectPath: string): Promise<void> {
		// Install React-specific dependencies
		consola.info("Installing React dependencies...");
		// Implementation would use package manager to install dependencies
	}

	private async createTsConfig(projectPath: string): Promise<void> {
		const tsConfigPath = path.join(projectPath, "tsconfig.json");
		const tsConfig = {
			compilerOptions: {
				target: "ES2020",
				useDefineForClassFields: true,
				lib: ["ES2020", "DOM", "DOM.Iterable"],
				module: "ESNext",
				skipLibCheck: true,
				moduleResolution: "bundler",
				allowImportingTsExtensions: true,
				resolveJsonModule: true,
				isolatedModules: true,
				noEmit: true,
				jsx: "react-jsx",
				strict: true,
				noUnusedLocals: true,
				noUnusedParameters: true,
				noFallthroughCasesInSwitch: true,
			},
			include: ["src"],
			references: [{ path: "./tsconfig.node.json" }],
		};

		await fs.writeJson(tsConfigPath, tsConfig, { spaces: 2 });
	}

	private async createCssConfig(projectPath: string): Promise<void> {
		// Create CSS modules configuration if needed
		const cssConfig = `
/* CSS Modules configuration for Xala UI */
.component {
  @apply relative;
}
`;
		await fs.writeFile(
			path.join(projectPath, "src/styles/modules.css"),
			cssConfig,
		);
	}
}

// Next.js Platform Implementation
export class NextJSPlatform extends ReactPlatform {
	constructor() {
		super();
		this.config.name = "nextjs";
		this.config.templateDir = "nextjs";
		this.config.features.localization = {
			system: "next-intl",
			functionName: "t",
			syntax: '{t("key")}',
		};
		this.config.dependencies.ui.push("next-intl");
	}

	async setupProject(projectPath: string): Promise<void> {
		await super.setupProject(projectPath);
		await this.createNextConfig(projectPath);
		await this.setupIntl(projectPath);
	}

	private async createNextConfig(projectPath: string): Promise<void> {
		const nextConfigPath = path.join(projectPath, "next.config.js");
		const nextConfig = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
`;
		await fs.writeFile(nextConfigPath, nextConfig);
	}

	private async setupIntl(projectPath: string): Promise<void> {
		const intlConfigPath = path.join(projectPath, "src/i18n.ts");
		const intlConfig = `
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'nb-NO', 'fr', 'ar'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(\`../messages/\${locale}.json\`)).default
  };
});
`;
		await fs.writeFile(intlConfigPath, intlConfig);
	}
}

// Vue Platform Implementation
export class VuePlatform extends Platform {
	constructor() {
		super({
			name: "vue",
			fileExtensions: {
				component: ".vue",
				style: ".module.css",
				test: ".test.ts",
				story: ".stories.ts",
			},
			templateDir: "vue",
			outputDir: "src/components",
			features: {
				typescript: true,
				cssInJs: false,
				styledComponents: false,
				cssModules: true,
				localization: {
					system: "vue-i18n",
					functionName: "t",
					syntax: '{{ t("key") }}',
				},
			},
			dependencies: {
				ui: ["@xala-technologies/ui-system", "vue-i18n"],
				dev: ["@vue/test-utils", "vitest"],
				peer: ["vue"],
			},
		});

		// Register Vue-specific helpers
		this.handlebars.registerHelper("vueLocalize", function (key: string) {
			return `{{ t('${key}') }}`;
		});
	}

	async generateComponent(
		spec: XalaComponentSpec,
		context: TemplateContext,
	): Promise<GenerationResult> {
		const result: GenerationResult = {
			success: true,
			files: [],
			errors: [],
			warnings: [],
			duration: 0,
		};

		const startTime = Date.now();

		try {
			const componentName = spec.name;
			const componentDir = path.join(
				context.project.name,
				this.config.outputDir,
				componentName,
			);

			// Generate main component file
			const componentPath = path.join(
				componentDir,
				`${componentName}${this.config.fileExtensions.component}`,
			);
			await this.generateFile("component", context, componentPath);
			result.files.push(componentPath);

			// Generate tests if requested
			if (spec.withTests) {
				const testPath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.test}`,
				);
				await this.generateFile("test", context, testPath);
				result.files.push(testPath);
			}

			// Generate stories if requested
			if (spec.withStories) {
				const storyPath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.story}`,
				);
				await this.generateFile("story", context, storyPath);
				result.files.push(storyPath);
			}

			// Generate index file for easier imports
			const indexPath = path.join(componentDir, "index.ts");
			await this.generateFile("index", context, indexPath);
			result.files.push(indexPath);
		} catch (error) {
			result.success = false;
			result.errors.push(`Vue component generation failed: ${error.message}`);
		}

		result.duration = Date.now() - startTime;
		return result;
	}

	async validateComponent(
		filePath: string,
	): Promise<{ valid: boolean; issues: string[] }> {
		const issues: string[] = [];

		try {
			const content = await fs.readFile(filePath, "utf-8");

			// Check for raw HTML elements in template
			const rawHtmlPattern =
				/<(div|span|p|h[1-6]|button|input|form|ul|ol|li|table|tr|td|th|thead|tbody|tfoot)[\s>]/g;
			const rawHtmlMatches = content.match(rawHtmlPattern);

			if (rawHtmlMatches) {
				issues.push(
					`Found raw HTML elements: ${rawHtmlMatches.join(", ")}. Use semantic components instead.`,
				);
			}

			// Check for localization
			if (!content.includes("$t(") && !content.includes("useI18n")) {
				issues.push(
					"Component should use localization with $t() function or useI18n.",
				);
			}
		} catch (error) {
			issues.push(`Failed to validate Vue component: ${error.message}`);
		}

		return {
			valid: issues.length === 0,
			issues,
		};
	}

	async setupProject(projectPath: string): Promise<void> {
		await this.createVueConfig(projectPath);
		await this.setupI18n(projectPath);
	}

	async installDependencies(projectPath: string): Promise<void> {
		consola.info("Installing Vue dependencies...");
	}

	private async createVueConfig(projectPath: string): Promise<void> {
		const viteConfigPath = path.join(projectPath, "vite.config.ts");
		const viteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
`;
		await fs.writeFile(viteConfigPath, viteConfig);
	}

	private async setupI18n(projectPath: string): Promise<void> {
		const i18nConfigPath = path.join(projectPath, "src/i18n/index.ts");
		const i18nConfig = `
import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    // English translations
  },
  'nb-NO': {
    // Norwegian translations
  }
}

export default createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})
`;
		await fs.ensureDir(path.dirname(i18nConfigPath));
		await fs.writeFile(i18nConfigPath, i18nConfig);
	}
}

// Angular Platform Implementation
export class AngularPlatform extends Platform {
	constructor() {
		super({
			name: "angular",
			fileExtensions: {
				component: ".component.ts",
				style: ".component.scss",
				test: ".component.spec.ts",
				story: ".stories.ts",
			},
			templateDir: "angular",
			outputDir: "src/app/components",
			features: {
				typescript: true,
				cssInJs: false,
				styledComponents: false,
				cssModules: false,
				localization: {
					system: "@ngx-translate/core",
					functionName: "translate.instant",
					syntax: "{{ key | translate }}",
				},
			},
			dependencies: {
				ui: ["@xala-technologies/ui-system", "@ngx-translate/core"],
				dev: ["@angular/testing"],
				peer: ["@angular/core", "@angular/common"],
			},
		});
	}

	async generateComponent(
		spec: XalaComponentSpec,
		context: TemplateContext,
	): Promise<GenerationResult> {
		const result: GenerationResult = {
			success: true,
			files: [],
			errors: [],
			warnings: [],
			duration: 0,
		};

		const startTime = Date.now();

		try {
			const componentName = spec.name;
			const componentDir = path.join(
				context.project.name,
				this.config.outputDir,
				componentName,
			);

			// Generate component file
			const componentPath = path.join(
				componentDir,
				`${componentName}${this.config.fileExtensions.component}`,
			);
			await this.generateFile("component", context, componentPath);
			result.files.push(componentPath);

			// Generate module file
			const modulePath = path.join(componentDir, `${componentName}.module.ts`);
			await this.generateFile("module", context, modulePath);
			result.files.push(modulePath);

			// Generate tests if requested
			if (spec.withTests) {
				const testPath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.test}`,
				);
				await this.generateFile("test", context, testPath);
				result.files.push(testPath);
			}

			// Generate stories if requested
			if (spec.withStories) {
				const storyPath = path.join(
					componentDir,
					`${componentName}${this.config.fileExtensions.story}`,
				);
				await this.generateFile("story", context, storyPath);
				result.files.push(storyPath);
			}

			// Generate index file
			const indexPath = path.join(componentDir, "index.ts");
			await this.generateFile("index", context, indexPath);
			result.files.push(indexPath);
		} catch (error) {
			result.success = false;
			result.errors.push(
				`Angular component generation failed: ${error.message}`,
			);
		}

		result.duration = Date.now() - startTime;
		return result;
	}

	async validateComponent(
		filePath: string,
	): Promise<{ valid: boolean; issues: string[] }> {
		const issues: string[] = [];

		try {
			const content = await fs.readFile(filePath, "utf-8");

			// Check for raw HTML in template
			const templateMatch = content.match(/template:\s*`([^`]+)`/s);
			if (templateMatch) {
				const template = templateMatch[1];
				const rawHtmlPattern = /<(div|span|p|h[1-6]|button|input|form)[\s>]/g;
				const rawHtmlMatches = template.match(rawHtmlPattern);

				if (rawHtmlMatches) {
					issues.push(
						`Found raw HTML elements in template: ${rawHtmlMatches.join(", ")}`,
					);
				}
			}

			// Check for proper Angular patterns
			if (!content.includes("@Component")) {
				issues.push("Missing @Component decorator");
			}
		} catch (error) {
			issues.push(`Failed to validate Angular component: ${error.message}`);
		}

		return {
			valid: issues.length === 0,
			issues,
		};
	}

	async setupProject(projectPath: string): Promise<void> {
		await this.setupAngularConfig(projectPath);
	}

	async installDependencies(projectPath: string): Promise<void> {
		consola.info("Installing Angular dependencies...");
	}

	private async setupAngularConfig(projectPath: string): Promise<void> {
		// Angular-specific setup would go here
	}
}

// Svelte Platform Implementation
export class SveltePlatform extends Platform {
	constructor() {
		super({
			name: "svelte",
			fileExtensions: {
				component: ".svelte",
				style: ".css",
				test: ".test.ts",
				story: ".stories.ts",
			},
			templateDir: "svelte",
			outputDir: "src/lib/components",
			features: {
				typescript: true,
				cssInJs: false,
				styledComponents: false,
				cssModules: false,
				localization: {
					system: "svelte-i18n",
					functionName: "$t",
					syntax: '{$t("key")}',
				},
			},
			dependencies: {
				ui: ["@xala-technologies/ui-system", "svelte-i18n"],
				dev: ["@testing-library/svelte"],
				peer: ["svelte"],
			},
		});
	}

	async generateComponent(
		spec: XalaComponentSpec,
		context: TemplateContext,
	): Promise<GenerationResult> {
		// Svelte implementation
		return { success: true, files: [], errors: [], warnings: [], duration: 0 };
	}

	async validateComponent(
		filePath: string,
	): Promise<{ valid: boolean; issues: string[] }> {
		return { valid: true, issues: [] };
	}

	async setupProject(projectPath: string): Promise<void> {
		// Svelte setup
	}

	async installDependencies(projectPath: string): Promise<void> {
		consola.info("Installing Svelte dependencies...");
	}
}

// Electron Platform Implementation
export class ElectronPlatform extends ReactPlatform {
	constructor() {
		super();
		this.config.name = "electron";
		this.config.templateDir = "electron";
		this.config.dependencies.ui.push("electron");
	}

	async setupProject(projectPath: string): Promise<void> {
		await super.setupProject(projectPath);
		await this.setupElectron(projectPath);
	}

	private async setupElectron(projectPath: string): Promise<void> {
		// Electron-specific setup
		const mainProcessPath = path.join(projectPath, "src/main/main.ts");
		const mainProcess = `
import { app, BrowserWindow } from 'electron';
import path from 'path';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('dist/index.html');
};

app.whenReady().then(createWindow);
`;
		await fs.ensureDir(path.dirname(mainProcessPath));
		await fs.writeFile(mainProcessPath, mainProcess);
	}
}

// Platform Manager - Factory for creating platform instances
export class PlatformManager {
	private platforms: Map<XalaPlatform, Platform> = new Map();

	constructor() {
		this.initializePlatforms();
	}

	private initializePlatforms(): void {
		this.platforms.set("react", new ReactPlatform());
		this.platforms.set("nextjs", new NextJSPlatform());
		this.platforms.set("vue", new VuePlatform());
		this.platforms.set("angular", new AngularPlatform());
		this.platforms.set("svelte", new SveltePlatform());
		this.platforms.set("electron", new ElectronPlatform());
	}

	getPlatform(platformName: XalaPlatform): Platform {
		const platform = this.platforms.get(platformName);
		if (!platform) {
			throw new Error(`Platform '${platformName}' is not supported yet`);
		}
		return platform;
	}

	getSupportedPlatforms(): XalaPlatform[] {
		return Array.from(this.platforms.keys());
	}

	async generateComponent(
		platformName: XalaPlatform,
		spec: XalaComponentSpec,
		context: TemplateContext,
	): Promise<GenerationResult> {
		const platform = this.getPlatform(platformName);
		return platform.generateComponent(spec, context);
	}

	async validateComponent(
		platformName: XalaPlatform,
		filePath: string,
	): Promise<{ valid: boolean; issues: string[] }> {
		const platform = this.getPlatform(platformName);
		return platform.validateComponent(filePath);
	}

	async setupProject(
		platformName: XalaPlatform,
		projectPath: string,
	): Promise<void> {
		const platform = this.getPlatform(platformName);
		await platform.setupProject(projectPath);
	}
}
