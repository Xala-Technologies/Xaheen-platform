import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { promises as fs } from "fs";
import path from "path";
import { TextExtractor } from "../localization/text-extractor.js";
import { fileExists, readFile } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import {
	BaseMigrationAdapter,
	ComponentInfo,
	ConfigurationInfo,
	MigrationOptions,
	MigrationResult,
	PageInfo,
	ProjectAnalysis,
	ProjectStructure,
	StylingInfo,
} from "./base-adapter.js";

// Bolt.new specific patterns and configurations
const BOLT_PATTERNS = {
	// File patterns that indicate a Bolt.new project
	configFiles: [".bolt", "bolt.config.js", "bolt.config.json", ".boltrc"],

	// Common Bolt.new dependencies
	boltDependencies: [
		"@bolt/core",
		"bolt-ui",
		"@bolt/components",
		"bolt-router",
		"bolt-state",
	],

	// Bolt.new specific file structures
	fileStructures: [
		"app/routes",
		"app/components",
		"app/lib",
		"app/styles",
		"routes",
		"server",
	],

	// Common Bolt.new API patterns
	apiPatterns: [
		/app\/routes\/.*\.tsx?$/,
		/routes\/api\/.*\.ts$/,
		/server\/.*\.ts$/,
	],

	// Bolt.new component patterns
	componentPatterns: [
		/app\/components\/.*\.(jsx?|tsx?)$/,
		/components\/ui\/.*\.(jsx?|tsx?)$/,
	],

	// Database patterns (Bolt.new often uses Prisma)
	databaseFiles: ["prisma/schema.prisma", "db/schema.ts", "drizzle.config.ts"],

	// Environment and deployment files
	deploymentFiles: [
		".env.example",
		"fly.toml",
		"railway.json",
		"vercel.json",
		"netlify.toml",
	],
};

// Bolt.new to Xala component mapping
const BOLT_COMPONENT_MAPPING = {
	Button: "Button",
	Input: "Input",
	Card: "Card",
	Modal: "Modal",
	Form: "Form",
	Grid: "Grid",
	Container: "Container",
	Text: "Typography",
	Image: "Image",
	Icon: "Icon",
	Select: "Select",
	Checkbox: "Checkbox",
	Radio: "Radio",
	Switch: "Switch",
	Slider: "Slider",
	Tabs: "Tabs",
	Accordion: "Accordion",
	Toast: "Toast",
	Dialog: "Dialog",
	Popover: "Popover",
	Tooltip: "Tooltip",
};

// Database adapter mapping
const DATABASE_ADAPTERS = {
	prisma: "@prisma/client",
	drizzle: "drizzle-orm",
	mongoose: "mongoose",
	supabase: "@supabase/supabase-js",
};

// Bolt.new migration adapter
export class BoltAdapter extends BaseMigrationAdapter {
	private textExtractor: TextExtractor;

	constructor(options: MigrationOptions) {
		super(options);
		this.textExtractor = new TextExtractor();
	}

	// Check if project is a Bolt.new project
	async canMigrate(projectPath: string): Promise<boolean> {
		try {
			// Check for Bolt-specific config files
			for (const configFile of BOLT_PATTERNS.configFiles) {
				if (await fileExists(path.join(projectPath, configFile))) {
					return true;
				}
			}

			// Check for Bolt.new file structure
			for (const structure of BOLT_PATTERNS.fileStructures) {
				if (await fileExists(path.join(projectPath, structure))) {
					return true;
				}
			}

			// Check package.json for Bolt dependencies
			const packageJsonPath = path.join(projectPath, "package.json");
			if (await fileExists(packageJsonPath)) {
				const packageJson = JSON.parse(await readFile(packageJsonPath));
				const allDeps = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
				};

				// Check for Bolt-specific dependencies
				for (const boltDep of BOLT_PATTERNS.boltDependencies) {
					if (allDeps[boltDep]) {
						return true;
					}
				}

				// Check for common Bolt.new stack (Remix + specific patterns)
				if (
					allDeps["@remix-run/node"] &&
					(allDeps["@remix-run/react"] ||
						allDeps["prisma"] ||
						allDeps["tailwindcss"])
				) {
					return true;
				}
			}

			// Check for Bolt.new API route patterns
			const hasApiRoutes = await this.checkForBoltApiRoutes(projectPath);
			if (hasApiRoutes) {
				return true;
			}

			return false;
		} catch (error) {
			logger.error("Error checking Bolt.new project:", error);
			return false;
		}
	}

	// Analyze Bolt.new project structure
	async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
		logger.info("Analyzing Bolt.new project...");

		const analysis: ProjectAnalysis = {
			source: "bolt",
			framework: "remix", // Bolt.new typically uses Remix
			language: "typescript",
			packageManager: "npm",
			dependencies: {},
			devDependencies: {},
			structure: await this.analyzeStructure(projectPath),
			components: [],
			pages: [],
			assets: [],
			configuration: await this.analyzeConfiguration(projectPath),
			buildTool: "vite",
			styling: await this.analyzeStyling(projectPath),
			texts: [],
		};

		// Analyze package.json
		const packageJsonPath = path.join(projectPath, "package.json");
		if (await fileExists(packageJsonPath)) {
			const packageJson = JSON.parse(await readFile(packageJsonPath));
			analysis.dependencies = packageJson.dependencies || {};
			analysis.devDependencies = packageJson.devDependencies || {};
			analysis.packageManager = this.detectPackageManager(projectPath);

			// Detect framework
			if (packageJson.dependencies?.["@remix-run/node"]) {
				analysis.framework = "remix";
			} else if (packageJson.dependencies?.["next"]) {
				analysis.framework = "nextjs";
			}

			// Detect language
			if (
				!packageJson.devDependencies?.typescript &&
				!packageJson.dependencies?.typescript
			) {
				analysis.language = "javascript";
			}
		}

		// Analyze components
		analysis.components = await this.analyzeComponents(
			projectPath,
			analysis.structure,
		);

		// Analyze pages/routes
		analysis.pages = await this.analyzeRoutes(projectPath, analysis.structure);

		// Analyze assets
		analysis.assets = await this.analyzeAssets(projectPath, analysis.structure);

		// Analyze state management
		analysis.stateManagement = await this.analyzeStateManagement(projectPath);

		// Analyze routing
		analysis.routing = await this.analyzeRouting(
			projectPath,
			analysis.framework,
		);

		// Analyze testing setup
		analysis.testing = await this.analyzeTesting(projectPath);

		// Extract texts for localization
		if (this.options.addLocalization) {
			analysis.texts = await this.textExtractor.extractFromProject(projectPath);
		}

		logger.info(
			`Bolt.new analysis complete: ${analysis.components.length} components, ${analysis.pages.length} routes`,
		);

		return analysis;
	}

	// Transform Bolt component to Xala component
	async transformComponent(
		component: ComponentInfo,
		analysis: ProjectAnalysis,
	): Promise<string> {
		logger.debug(`Transforming Bolt component: ${component.name}`);

		const sourceCode = await readFile(component.path);

		try {
			const ast = parse(sourceCode, {
				sourceType: "module",
				plugins: [
					"jsx",
					analysis.language === "typescript" ? "typescript" : "flow",
					"decorators-legacy",
					"classProperties",
					"optionalChaining",
					"nullishCoalescingOperator",
				],
			});

			let imports: string[] = [];
			let componentBody = "";
			let hasRemixImports = false;

			// Transform AST
			traverse(ast, {
				// Handle imports
				ImportDeclaration(nodePath) {
					const source = nodePath.node.source.value;

					if (source.startsWith("@remix-run/") || source.startsWith("remix")) {
						hasRemixImports = true;
						// Convert Remix imports to React equivalents
						this.transformRemixImports(nodePath, imports);
					} else if (
						BOLT_PATTERNS.boltDependencies.some((dep) => source.includes(dep))
					) {
						// Transform Bolt imports to Xala imports
						this.transformBoltImports(nodePath, imports);
					} else {
						// Keep other imports
						const importCode = sourceCode.substring(
							nodePath.node.start!,
							nodePath.node.end!,
						);
						imports.push(importCode);
					}
				},

				// Transform JSX elements
				JSXElement(nodePath) {
					this.transformBoltJSXElement(nodePath);
				},

				// Handle Remix-specific hooks
				CallExpression(nodePath) {
					if (t.isIdentifier(nodePath.node.callee)) {
						this.transformRemixHooks(nodePath);
					}
				},
			});

			// Generate transformed component
			const transformedComponent = this.generateXalaComponent({
				name: component.name,
				sourceCode,
				imports: imports.filter(Boolean),
				hasRemixFeatures: hasRemixImports,
				typescript: analysis.language === "typescript",
				styling: analysis.styling.type,
				localization: this.options.addLocalization,
			});

			return transformedComponent;
		} catch (error) {
			logger.error(
				`Error transforming Bolt component ${component.name}:`,
				error,
			);
			throw error;
		}
	}

	// Transform Bolt route/page to Xala page
	async transformPage(
		page: PageInfo,
		analysis: ProjectAnalysis,
	): Promise<string> {
		logger.debug(`Transforming Bolt route: ${page.name}`);

		const sourceCode = await readFile(page.path);

		const transformedPage = this.generateXalaPage({
			name: page.name,
			route: page.route,
			sourceCode,
			hasAuth: page.hasAuth,
			hasLayout: page.hasLayout,
			seo: page.seo,
			dataFetching: page.dataFetching,
			framework: analysis.framework,
			platform: this.options.targetPlatform,
			typescript: analysis.language === "typescript",
			localization: this.options.addLocalization,
		});

		return transformedPage;
	}

	// Transform styling from Bolt to Xala
	async transformStyles(
		styling: StylingInfo,
		analysis: ProjectAnalysis,
	): Promise<Record<string, string>> {
		const transformedStyles: Record<string, string> = {};

		if (this.options.targetStyling === "tailwind") {
			// Generate Tailwind configuration with Norwegian design tokens
			transformedStyles["globals.css"] = this.generateTailwindGlobals();
			transformedStyles["tokens.css"] = this.generateNorwegianTokens();
			transformedStyles["components.css"] = this.generateComponentStyles();
		}

		// Transform existing CSS files
		for (const styleFile of styling.files) {
			try {
				const content = await readFile(styleFile);
				const transformedContent = this.transformCSSContent(content);
				const fileName = path.basename(styleFile);
				transformedStyles[fileName] = transformedContent;
			} catch (error) {
				logger.warn(`Failed to transform style file ${styleFile}:`, error);
			}
		}

		return transformedStyles;
	}

	// Helper methods
	private async checkForBoltApiRoutes(projectPath: string): Promise<boolean> {
		const apiDirs = ["app/routes", "routes/api", "server"];

		for (const apiDir of apiDirs) {
			const fullPath = path.join(projectPath, apiDir);
			if (await fileExists(fullPath)) {
				try {
					const files = await fs.readdir(fullPath, { recursive: true });
					if (
						files.some(
							(file) =>
								file.toString().endsWith(".ts") ||
								file.toString().endsWith(".tsx"),
						)
					) {
						return true;
					}
				} catch (error) {
					continue;
				}
			}
		}

		return false;
	}

	private async analyzeStructure(
		projectPath: string,
	): Promise<ProjectStructure> {
		const structure: ProjectStructure = {
			srcDir: "app", // Bolt.new typically uses 'app' directory
			componentsDir: "app/components",
			hasTypeScript: false,
			hasTests: false,
			configFiles: [],
		};

		// Check for Bolt.new/Remix structure
		const commonDirs = [
			"app",
			"app/components",
			"app/routes",
			"public",
			"prisma",
		];
		for (const dir of commonDirs) {
			if (await fileExists(path.join(projectPath, dir))) {
				switch (dir) {
					case "app":
						structure.srcDir = "app";
						break;
					case "app/components":
						structure.componentsDir = "app/components";
						break;
					case "app/routes":
						structure.pagesDir = "app/routes";
						break;
					case "public":
						structure.publicDir = "public";
						break;
				}
			}
		}

		// Check for alternative structures
		if (await fileExists(path.join(projectPath, "components"))) {
			structure.componentsDir = "components";
		}
		if (await fileExists(path.join(projectPath, "routes"))) {
			structure.pagesDir = "routes";
		}

		// Check for TypeScript
		const tsFiles = ["tsconfig.json", "app/root.tsx", "remix.config.ts"];
		for (const tsFile of tsFiles) {
			if (await fileExists(path.join(projectPath, tsFile))) {
				structure.hasTypeScript = true;
				break;
			}
		}

		// Check for tests
		const testDirs = ["tests", "__tests__", "app/__tests__"];
		for (const testDir of testDirs) {
			if (await fileExists(path.join(projectPath, testDir))) {
				structure.hasTests = true;
				break;
			}
		}

		// Find config files
		const configFiles = [
			"package.json",
			"tsconfig.json",
			"remix.config.js",
			"remix.config.ts",
			"tailwind.config.js",
			"tailwind.config.ts",
			"prisma/schema.prisma",
			"drizzle.config.ts",
			"vite.config.ts",
			".env.example",
		];

		for (const configFile of configFiles) {
			if (await fileExists(path.join(projectPath, configFile))) {
				structure.configFiles.push(configFile);
			}
		}

		return structure;
	}

	private async analyzeConfiguration(
		projectPath: string,
	): Promise<ConfigurationInfo> {
		const config: ConfigurationInfo = {};

		const configFiles = [
			{ name: "remix.config.js", key: "remix" },
			{ name: "remix.config.ts", key: "remix" },
			{ name: "vite.config.ts", key: "vite" },
			{ name: "tailwind.config.js", key: "tailwind" },
			{ name: "tailwind.config.ts", key: "tailwind" },
			{ name: "tsconfig.json", key: "typescript" },
			{ name: "prisma/schema.prisma", key: "prisma" },
			{ name: "drizzle.config.ts", key: "drizzle" },
		];

		for (const { name, key } of configFiles) {
			const configPath = path.join(projectPath, name);
			if (await fileExists(configPath)) {
				try {
					const content = await readFile(configPath);
					config[key as keyof ConfigurationInfo] = name.endsWith(".json")
						? JSON.parse(content)
						: { content };
				} catch (error) {
					logger.warn(`Failed to parse config file ${name}:`, error);
				}
			}
		}

		return config;
	}

	private async analyzeStyling(projectPath: string): Promise<StylingInfo> {
		const styling: StylingInfo = {
			type: "css",
			files: [],
		};

		// Check for styling approach
		const packageJsonPath = path.join(projectPath, "package.json");
		if (await fileExists(packageJsonPath)) {
			const packageJson = JSON.parse(await readFile(packageJsonPath));
			const allDeps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (allDeps["tailwindcss"]) {
				styling.type = "tailwind";
			} else if (allDeps["styled-components"]) {
				styling.type = "styled-components";
			} else if (allDeps["@emotion/react"]) {
				styling.type = "emotion";
			}
		}

		// Find style files
		const styleDirs = ["app/styles", "styles", "app/globals.css"];
		const styleExtensions = [".css", ".scss", ".less"];

		for (const styleDir of styleDirs) {
			const fullPath = path.join(projectPath, styleDir);
			if (await fileExists(fullPath)) {
				const stat = await fs.stat(fullPath);
				if (stat.isFile()) {
					styling.files.push(styleDir);
				} else if (stat.isDirectory()) {
					try {
						const files = await fs.readdir(fullPath);
						for (const file of files) {
							if (styleExtensions.some((ext) => file.endsWith(ext))) {
								styling.files.push(path.join(styleDir, file));
							}
						}
					} catch (error) {
						continue;
					}
				}
			}
		}

		return styling;
	}

	private async analyzeComponents(
		projectPath: string,
		structure: ProjectStructure,
	): Promise<ComponentInfo[]> {
		const components: ComponentInfo[] = [];
		const componentsDir = path.join(projectPath, structure.componentsDir);

		if (!(await fileExists(componentsDir))) {
			return components;
		}

		const componentFiles = await this.getComponentFiles(componentsDir);

		for (const filePath of componentFiles) {
			try {
				const component = await this.analyzeComponent(filePath, projectPath);
				if (component) {
					components.push(component);
				}
			} catch (error) {
				logger.warn(`Failed to analyze component ${filePath}:`, error);
			}
		}

		return components;
	}

	private async analyzeRoutes(
		projectPath: string,
		structure: ProjectStructure,
	): Promise<PageInfo[]> {
		const routes: PageInfo[] = [];

		if (!structure.pagesDir) {
			return routes;
		}

		const routesDir = path.join(projectPath, structure.pagesDir);
		if (!(await fileExists(routesDir))) {
			return routes;
		}

		const routeFiles = await this.getRouteFiles(routesDir);

		for (const filePath of routeFiles) {
			try {
				const route = await this.analyzeRoute(filePath, projectPath);
				if (route) {
					routes.push(route);
				}
			} catch (error) {
				logger.warn(`Failed to analyze route ${filePath}:`, error);
			}
		}

		return routes;
	}

	private async analyzeAssets(
		projectPath: string,
		structure: ProjectStructure,
	): Promise<any[]> {
		// Analyze assets in public directory
		const assets: any[] = [];

		if (structure.publicDir) {
			const publicDir = path.join(projectPath, structure.publicDir);
			if (await fileExists(publicDir)) {
				// Scan for assets
				try {
					const files = await fs.readdir(publicDir, { recursive: true });
					for (const file of files) {
						const filePath = path.join(publicDir, file.toString());
						const stat = await fs.stat(filePath);
						if (stat.isFile()) {
							assets.push({
								name: file.toString(),
								path: path.relative(projectPath, filePath),
								type: this.getAssetType(file.toString()),
								size: stat.size,
								used: false, // Would need more analysis to determine usage
							});
						}
					}
				} catch (error) {
					logger.warn("Failed to analyze assets:", error);
				}
			}
		}

		return assets;
	}

	private async analyzeStateManagement(projectPath: string): Promise<any> {
		// Analyze state management approach
		const packageJsonPath = path.join(projectPath, "package.json");
		if (await fileExists(packageJsonPath)) {
			const packageJson = JSON.parse(await readFile(packageJsonPath));
			const allDeps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (allDeps["zustand"]) {
				return { type: "zustand", files: [] };
			} else if (allDeps["@reduxjs/toolkit"]) {
				return { type: "redux", files: [] };
			} else if (allDeps["recoil"]) {
				return { type: "recoil", files: [] };
			}
		}

		return { type: "context", files: [] };
	}

	private async analyzeRouting(
		projectPath: string,
		framework: string,
	): Promise<any> {
		if (framework === "remix") {
			return {
				type: "remix-router",
				routes: [], // Would need to parse route files
			};
		}

		return {
			type: "react-router",
			routes: [],
		};
	}

	private async analyzeTesting(projectPath: string): Promise<any> {
		const packageJsonPath = path.join(projectPath, "package.json");
		if (await fileExists(packageJsonPath)) {
			const packageJson = JSON.parse(await readFile(packageJsonPath));
			const allDeps = {
				...packageJson.dependencies,
				...packageJson.devDependencies,
			};

			if (allDeps["vitest"]) {
				return { framework: "vitest", files: [], coverage: true };
			} else if (allDeps["jest"]) {
				return { framework: "jest", files: [], coverage: true };
			}
		}

		return { framework: "vitest", files: [], coverage: false };
	}

	private async getComponentFiles(dir: string): Promise<string[]> {
		const files: string[] = [];

		const scan = async (currentDir: string) => {
			try {
				const entries = await fs.readdir(currentDir, { withFileTypes: true });

				for (const entry of entries) {
					const fullPath = path.join(currentDir, entry.name);

					if (entry.isDirectory()) {
						await scan(fullPath);
					} else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
						files.push(fullPath);
					}
				}
			} catch (error) {
				// Skip directories that can't be read
			}
		};

		await scan(dir);
		return files;
	}

	private async getRouteFiles(dir: string): Promise<string[]> {
		const files: string[] = [];

		const scan = async (currentDir: string) => {
			try {
				const entries = await fs.readdir(currentDir, { withFileTypes: true });

				for (const entry of entries) {
					const fullPath = path.join(currentDir, entry.name);

					if (entry.isDirectory()) {
						await scan(fullPath);
					} else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
						files.push(fullPath);
					}
				}
			} catch (error) {
				// Skip directories that can't be read
			}
		};

		await scan(dir);
		return files;
	}

	private async analyzeComponent(
		filePath: string,
		projectPath: string,
	): Promise<ComponentInfo | null> {
		const sourceCode = await readFile(filePath);
		const relativePath = path.relative(projectPath, filePath);
		const componentName = path.basename(filePath, path.extname(filePath));

		const info: ComponentInfo = {
			name: componentName,
			path: relativePath,
			type: "functional",
			dependencies: [],
			hasState: false,
			hooks: [],
			complexity: 1,
		};

		// Parse and analyze component
		try {
			const ast = parse(sourceCode, {
				sourceType: "module",
				plugins: ["jsx", "typescript", "decorators-legacy"],
			});

			traverse(ast, {
				ImportDeclaration(nodePath) {
					info.dependencies.push(nodePath.node.source.value);
				},

				CallExpression(nodePath) {
					if (t.isIdentifier(nodePath.node.callee)) {
						const hookName = nodePath.node.callee.name;
						if (hookName.startsWith("use")) {
							info.hooks.push(hookName);
							if (hookName === "useState") {
								info.hasState = true;
							}
						}
					}
				},
			});

			info.complexity = this.calculateComplexity(sourceCode);
		} catch (error) {
			logger.warn(`Failed to parse component ${componentName}:`, error);
		}

		return info;
	}

	private async analyzeRoute(
		filePath: string,
		projectPath: string,
	): Promise<PageInfo | null> {
		const sourceCode = await readFile(filePath);
		const relativePath = path.relative(projectPath, filePath);
		const routeName = path.basename(filePath, path.extname(filePath));

		// Convert file path to route
		const routePath = this.convertFilePathToRoute(relativePath);

		const info: PageInfo = {
			name: routeName,
			path: relativePath,
			route: routePath,
			components: [],
			hasLayout: false,
			hasAuth: false,
			seo: {},
		};

		// Analyze route features
		if (sourceCode.includes("loader") || sourceCode.includes("action")) {
			info.dataFetching = "ssr";
		}

		if (
			sourceCode.includes("requireAuth") ||
			sourceCode.includes("authenticate")
		) {
			info.hasAuth = true;
		}

		if (sourceCode.includes("Layout") || sourceCode.includes("Outlet")) {
			info.hasLayout = true;
		}

		// Extract SEO information
		if (sourceCode.includes("meta")) {
			// Parse meta function for SEO data
			info.seo = this.extractSEOFromRoute(sourceCode);
		}

		return info;
	}

	private detectPackageManager(projectPath: string): "npm" | "yarn" | "pnpm" {
		const lockFiles = [
			{ file: "pnpm-lock.yaml", manager: "pnpm" as const },
			{ file: "yarn.lock", manager: "yarn" as const },
			{ file: "package-lock.json", manager: "npm" as const },
		];

		for (const { file, manager } of lockFiles) {
			if (fileExists(path.join(projectPath, file))) {
				return manager;
			}
		}

		return "npm";
	}

	private getAssetType(fileName: string): string {
		const ext = path.extname(fileName).toLowerCase();

		if ([".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"].includes(ext)) {
			return "image";
		} else if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) {
			return "font";
		} else if ([".mp4", ".webm", ".avi"].includes(ext)) {
			return "video";
		} else if ([".mp3", ".wav", ".ogg"].includes(ext)) {
			return "audio";
		} else {
			return "document";
		}
	}

	private calculateComplexity(sourceCode: string): number {
		let complexity = 1;

		// Count various complexity indicators
		complexity += (sourceCode.match(/if\s*\(/g) || []).length;
		complexity += (sourceCode.match(/\?\s*:/g) || []).length;
		complexity += (sourceCode.match(/switch\s*\(/g) || []).length;
		complexity += (sourceCode.match(/for\s*\(/g) || []).length;
		complexity += (sourceCode.match(/while\s*\(/g) || []).length;
		complexity += (sourceCode.match(/catch\s*\(/g) || []).length;

		return Math.min(complexity, 10);
	}

	private convertFilePathToRoute(filePath: string): string {
		// Convert Remix file-based routing to standard routes
		let route = filePath.replace(/^app\/routes\//, "/");
		route = route.replace(/\.(jsx?|tsx?)$/, "");
		route = route.replace(/\._index$/, "");
		route = route.replace(/\$([^/]+)/g, ":$1"); // Convert $param to :param

		if (route === "/index" || route === "") {
			route = "/";
		}

		return route;
	}

	private extractSEOFromRoute(sourceCode: string): any {
		// Simple extraction of SEO metadata
		const seo: any = {};

		const titleMatch = sourceCode.match(/title:\s*["']([^"']+)["']/);
		if (titleMatch) {
			seo.title = titleMatch[1];
		}

		const descriptionMatch = sourceCode.match(
			/description:\s*["']([^"']+)["']/,
		);
		if (descriptionMatch) {
			seo.description = descriptionMatch[1];
		}

		return seo;
	}

	// Transform methods
	private transformRemixImports(nodePath: any, imports: string[]): void {
		// Transform Remix imports to React/Next.js equivalents
		const source = nodePath.node.source.value;

		if (source === "@remix-run/react") {
			// Transform common Remix imports
			const specifiers = nodePath.node.specifiers;
			const reactImports: string[] = [];
			const nextImports: string[] = [];

			for (const spec of specifiers) {
				if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
					const importName = spec.imported.name;

					switch (importName) {
						case "Link":
							if (this.options.targetPlatform === "nextjs") {
								nextImports.push("Link");
							} else {
								imports.push("import { Link } from 'react-router-dom';");
							}
							break;
						case "useLoaderData":
							// Convert to props or custom hook
							break;
						case "useActionData":
							// Convert to form handling
							break;
						case "Form":
							reactImports.push("form");
							break;
						default:
							reactImports.push(importName);
					}
				}
			}

			if (reactImports.length > 0) {
				imports.push(`import { ${reactImports.join(", ")} } from 'react';`);
			}

			if (nextImports.length > 0 && this.options.targetPlatform === "nextjs") {
				imports.push(`import { ${nextImports.join(", ")} } from 'next/link';`);
			}
		}
	}

	private transformBoltImports(nodePath: any, imports: string[]): void {
		// Transform Bolt-specific imports to Xala imports
		const source = nodePath.node.source.value;
		const specifiers = nodePath.node.specifiers;
		const xalaImports: string[] = [];

		for (const spec of specifiers) {
			if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
				const importName = spec.imported.name;
				const mappedName = BOLT_COMPONENT_MAPPING[importName] || importName;
				xalaImports.push(mappedName);
			}
		}

		if (xalaImports.length > 0) {
			imports.push(
				`import { ${xalaImports.join(", ")} } from '@xala-technologies/ui-system';`,
			);
		}
	}

	private transformBoltJSXElement(nodePath: any): void {
		const elementName = nodePath.node.openingElement.name;

		if (t.isJSXIdentifier(elementName)) {
			const originalName = elementName.name;
			const mappedName = BOLT_COMPONENT_MAPPING[originalName];

			if (mappedName) {
				elementName.name = mappedName;
				if (
					nodePath.node.closingElement?.name &&
					t.isJSXIdentifier(nodePath.node.closingElement.name)
				) {
					nodePath.node.closingElement.name.name = mappedName;
				}
			}
		}
	}

	private transformRemixHooks(nodePath: any): void {
		const hookName = nodePath.node.callee.name;

		switch (hookName) {
			case "useLoaderData":
				// Transform to props or custom data fetching
				nodePath.node.callee.name = "useData";
				break;
			case "useActionData":
				// Transform to form state
				nodePath.node.callee.name = "useFormState";
				break;
			case "useTransition":
				// Transform to loading state
				nodePath.node.callee.name = "useLoading";
				break;
		}
	}

	private transformCSSContent(content: string): string {
		// Transform CSS to include Norwegian design tokens
		let transformed = content;

		// Add Norwegian color variables
		transformed = transformed.replace(
			/:root\s*{/,
			`:root {
  /* Norwegian design tokens */
  --color-norway-blue: #003d82;
  --color-norway-red: #ba0c2f;
  --color-norway-white: #ffffff;
`,
		);

		return transformed;
	}

	private generateXalaComponent(config: {
		name: string;
		sourceCode: string;
		imports: string[];
		hasRemixFeatures: boolean;
		typescript: boolean;
		styling: string;
		localization: boolean;
	}): string {
		const {
			name,
			imports,
			hasRemixFeatures,
			typescript,
			styling,
			localization,
		} = config;

		let component = "";

		// Add React imports
		component += `import React from 'react';\n`;

		if (localization) {
			component += `import { useTranslation } from 'react-i18next';\n`;
		}

		// Add other imports
		imports.forEach((imp) => {
			component += `${imp}\n`;
		});

		component += "\n";

		// Add TypeScript interface if needed
		if (typescript) {
			component += `interface ${name}Props {\n`;
			component += `  className?: string;\n`;
			if (localization) {
				component += `  ariaLabel?: string;\n`;
			}
			component += `}\n\n`;
		}

		// Add component
		const propsParam = typescript
			? `{ className, ${localization ? "ariaLabel" : ""} }: ${name}Props`
			: "props";

		component += `export const ${name}${typescript ? `: React.FC<${name}Props>` : ""} = (${propsParam}) => {\n`;

		if (localization) {
			component += `  const { t } = useTranslation();\n\n`;
		}

		component += `  return (\n`;
		component += `    <div \n`;
		component += `      className={\`${name.toLowerCase()}${styling === "tailwind" ? " p-4 rounded-lg" : ""}\${className ? \` \${className}\` : ''}\`}\n`;
		if (localization) {
			component += `      aria-label={ariaLabel}\n`;
		}
		component += `    >\n`;
		component += `      {/* Migrated ${name} component */}\n`;
		component += `    </div>\n`;
		component += `  );\n`;
		component += `};\n\n`;

		component += `export default ${name};\n`;

		return component;
	}

	private generateXalaPage(config: {
		name: string;
		route: string;
		sourceCode: string;
		hasAuth: boolean;
		hasLayout: boolean;
		seo: any;
		dataFetching?: string;
		framework: string;
		platform: string;
		typescript: boolean;
		localization: boolean;
	}): string {
		const {
			name,
			route,
			hasAuth,
			hasLayout,
			seo,
			platform,
			typescript,
			localization,
		} = config;

		let page = "";

		// Add imports
		page += `import React from 'react';\n`;

		if (platform === "nextjs") {
			page += `import Head from 'next/head';\n`;
			if (hasAuth) {
				page += `import { useSession } from 'next-auth/react';\n`;
			}
		} else {
			page += `import { Helmet } from 'react-helmet-async';\n`;
			if (hasAuth) {
				page += `import { useAuth } from '../hooks/useAuth';\n`;
			}
		}

		if (localization) {
			page += `import { useTranslation } from 'react-i18next';\n`;
		}

		if (hasLayout) {
			page += `import { DefaultLayout } from '../layouts';\n`;
		}

		page += "\n";

		// Add TypeScript interface
		if (typescript) {
			page += `interface ${name}PageProps {\n`;
			page += `  // Add props here\n`;
			page += `}\n\n`;
		}

		// Add page component
		const propsParam = typescript ? `props: ${name}PageProps` : "props";
		page += `const ${name}Page${typescript ? `: React.FC<${name}PageProps>` : ""} = (${propsParam}) => {\n`;

		if (localization) {
			page += `  const { t } = useTranslation();\n`;
		}

		if (hasAuth) {
			if (platform === "nextjs") {
				page += `  const { data: session, status } = useSession();\n\n`;
				page += `  if (status === 'loading') return <div>Loading...</div>;\n`;
				page += `  if (!session) return <div>Access denied</div>;\n\n`;
			} else {
				page += `  const { user, loading } = useAuth();\n\n`;
				page += `  if (loading) return <div>Loading...</div>;\n`;
				page += `  if (!user) return <div>Access denied</div>;\n\n`;
			}
		}

		page += `  const content = (\n`;
		page += `    <>\n`;

		// Add SEO head
		if (platform === "nextjs") {
			page += `      <Head>\n`;
			page += `        <title>${seo.title || `${name} | App`}</title>\n`;
			if (seo.description) {
				page += `        <meta name="description" content="${seo.description}" />\n`;
			}
			page += `      </Head>\n`;
		} else {
			page += `      <Helmet>\n`;
			page += `        <title>${seo.title || `${name} | App`}</title>\n`;
			if (seo.description) {
				page += `        <meta name="description" content="${seo.description}" />\n`;
			}
			page += `      </Helmet>\n`;
		}

		page += `      <div className="page-${name.toLowerCase()}">\n`;
		page += `        <h1>${localization ? `{t('pages.${name.toLowerCase()}.title')}` : name}</h1>\n`;
		page += `        {/* Migrated ${name} page content */}\n`;
		page += `      </div>\n`;
		page += `    </>\n`;
		page += `  );\n\n`;

		if (hasLayout) {
			page += `  return <DefaultLayout>{content}</DefaultLayout>;\n`;
		} else {
			page += `  return content;\n`;
		}

		page += `};\n\n`;

		page += `export default ${name}Page;\n`;

		return page;
	}

	private generateTailwindGlobals(): string {
		return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: system-ui, sans-serif;
  }
  
  body {
    @apply bg-white text-gray-900;
  }
  
  /* RTL support for Arabic */
  [dir="rtl"] {
    direction: rtl;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-norway-blue text-white hover:bg-blue-700;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  }
}`;
	}

	private generateNorwegianTokens(): string {
		return `:root {
  /* Norwegian design tokens */
  --color-norway-blue: #003d82;
  --color-norway-red: #ba0c2f;
  --color-norway-white: #ffffff;
  
  /* Semantic colors */
  --color-primary: var(--color-norway-blue);
  --color-secondary: var(--color-norway-red);
  --color-background: var(--color-norway-white);
  
  /* Spacing system */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  /* Typography scale */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}`;
	}

	private generateComponentStyles(): string {
		return `/* Xala UI System component styles */

.xala-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border: none;
  cursor: pointer;
}

.xala-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.xala-button:active {
  transform: translateY(0);
}

.xala-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid #d1d5db;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: border-color 0.2s ease-in-out;
}

.xala-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgb(0 61 130 / 0.1);
}

.xala-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  border: 1px solid #f3f4f6;
}

.xala-card:hover {
  box-shadow: var(--shadow-md);
}

/* RTL support */
[dir="rtl"] .xala-button {
  /* RTL-specific button styles */
}

[dir="rtl"] .xala-input {
  /* RTL-specific input styles */
}`;
	}

	// Required abstract method implementations
	protected async migrateComponentTests(
		component: ComponentInfo,
		result: MigrationResult,
	): Promise<void> {
		if (component.tests?.length) {
			logger.debug(`Migrating tests for Bolt component: ${component.name}`);
			// Implementation for migrating component tests
		}
	}

	protected async migrateComponentStories(
		component: ComponentInfo,
		result: MigrationResult,
	): Promise<void> {
		if (component.stories) {
			logger.debug(`Migrating stories for Bolt component: ${component.name}`);
			// Implementation for migrating Storybook stories
		}
	}

	protected async generateConfigurationFiles(
		result: MigrationResult,
	): Promise<void> {
		const configs = {
			"tsconfig.json": this.generateTsConfig(),
			"tailwind.config.js": this.generateTailwindConfig(),
			"next.config.js":
				this.options.targetPlatform === "nextjs"
					? this.generateNextConfig()
					: null,
			"vite.config.ts":
				this.options.targetPlatform === "react"
					? this.generateViteConfig()
					: null,
		};

		for (const [filename, config] of Object.entries(configs)) {
			if (config) {
				await this.writeFile(
					path.join(this.options.outputPath, filename),
					typeof config === "string" ? config : JSON.stringify(config, null, 2),
				);
				result.summary.changes.configurations++;
			}
		}
	}

	protected async generatePackageJson(
		analysis: ProjectAnalysis,
	): Promise<void> {
		const packageJson = {
			name: path.basename(this.options.outputPath),
			version: "1.0.0",
			description: "Migrated from Bolt.new to Xala UI System",
			scripts: {
				dev: this.options.targetPlatform === "nextjs" ? "next dev" : "vite",
				build:
					this.options.targetPlatform === "nextjs"
						? "next build"
						: "vite build",
				start:
					this.options.targetPlatform === "nextjs"
						? "next start"
						: "vite preview",
				lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
				"type-check": "tsc --noEmit",
				test: "vitest",
			},
			dependencies: {
				react: "^18.0.0",
				"react-dom": "^18.0.0",
				"@xala-technologies/ui-system": "workspace:*",
				"@xala-technologies/foundation": "workspace:*",
				...(this.options.addLocalization && {
					"react-i18next": "^13.0.0",
					i18next: "^23.0.0",
				}),
				...(this.options.addCompliance && {
					"@xala-technologies/norwegian-compliance": "workspace:*",
				}),
				...(this.options.targetPlatform === "nextjs" && {
					next: "^14.0.0",
				}),
				...(analysis.dependencies.prisma && {
					"@prisma/client": "^5.0.0",
				}),
			},
			devDependencies: {
				"@types/react": "^18.0.0",
				"@types/react-dom": "^18.0.0",
				"@types/node": "^20.0.0",
				typescript: "^5.0.0",
				eslint: "^9.0.0",
				vitest: "^1.0.0",
				...(this.options.targetStyling === "tailwind" && {
					tailwindcss: "^3.0.0",
					autoprefixer: "^10.0.0",
					postcss: "^8.0.0",
				}),
				...(this.options.targetPlatform === "react" && {
					vite: "^5.0.0",
					"@vitejs/plugin-react": "^4.0.0",
				}),
				...(analysis.dependencies.prisma && {
					prisma: "^5.0.0",
				}),
			},
		};

		await this.writeFile(
			path.join(this.options.outputPath, "package.json"),
			JSON.stringify(packageJson, null, 2),
		);
	}

	private generateTsConfig(): any {
		return {
			compilerOptions: {
				target: "ES2022",
				lib: ["dom", "dom.iterable", "es6"],
				allowJs: true,
				skipLibCheck: true,
				strict: true,
				noEmit: this.options.targetPlatform === "nextjs",
				esModuleInterop: true,
				module: "esnext",
				moduleResolution: "bundler",
				resolveJsonModule: true,
				isolatedModules: true,
				jsx: "preserve",
				incremental: true,
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
				},
			},
			include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
			exclude: ["node_modules"],
		};
	}

	private generateTailwindConfig(): string {
		return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'norway-blue': '#003d82',
        'norway-red': '#ba0c2f',
        'norway-white': '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}`;
	}

	private generateNextConfig(): string {
		return `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ${
		this.options.addLocalization
			? `
  i18n: {
    locales: ['nb-NO', 'nn-NO', 'en-US', 'ar-SA', 'fr-FR'],
    defaultLocale: 'nb-NO',
    localeDetection: true,
  },`
			: ""
	}
}

module.exports = nextConfig`;
	}

	private generateViteConfig(): string {
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
})`;
	}
}

// Export convenience function
export async function migrateBoltProject(
	sourcePath: string,
	options: MigrationOptions,
	progressCallback?: (progress: any) => void,
): Promise<MigrationResult> {
	const adapter = new BoltAdapter(options);
	return adapter.migrate(sourcePath, progressCallback);
}
