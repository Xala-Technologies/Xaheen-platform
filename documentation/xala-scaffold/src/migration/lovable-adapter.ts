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
	ComponentProp,
	ConfigurationInfo,
	MigrationOptions,
	MigrationResult,
	PageInfo,
	ProjectAnalysis,
	ProjectStructure,
	StylingInfo,
} from "./base-adapter.js";

// Lovable.dev specific patterns
const LOVABLE_PATTERNS = {
	// File patterns
	configFiles: ["lovable.config.js", ".lovable", "lovable.json"],
	componentPatterns: [
		/src\/components\/.*\.(jsx?|tsx?)$/,
		/components\/.*\.(jsx?|tsx?)$/,
	],
	pagePatterns: [
		/src\/pages\/.*\.(jsx?|tsx?)$/,
		/pages\/.*\.(jsx?|tsx?)$/,
		/src\/routes\/.*\.(jsx?|tsx?)$/,
	],

	// Code patterns
	lovableImports: ["@lovable-dev/ui", "@lovable/components", "lovable-ui"],

	// Common Lovable component names
	lovableComponents: [
		"LovableButton",
		"LovableInput",
		"LovableCard",
		"LovableModal",
		"LovableForm",
		"LovableGrid",
		"LovableContainer",
	],

	// Styling patterns
	styledComponents: /styled\./,
	tailwindClasses: /className=["'][^"']*(?:bg-|text-|p-|m-|flex|grid)/,
};

// Lovable component mapping to Xala components
const COMPONENT_MAPPING = {
	LovableButton: "Button",
	LovableInput: "Input",
	LovableCard: "Card",
	LovableModal: "Modal",
	LovableForm: "Form",
	LovableGrid: "Grid",
	LovableContainer: "Container",
	LovableText: "Typography",
	LovableImage: "Image",
	LovableIcon: "Icon",
};

// Lovable migration adapter
export class LovableAdapter extends BaseMigrationAdapter {
	private textExtractor: TextExtractor;

	constructor(options: MigrationOptions) {
		super(options);
		this.textExtractor = new TextExtractor();
	}

	// Check if project is a Lovable.dev project
	async canMigrate(projectPath: string): Promise<boolean> {
		try {
			// Check for Lovable-specific config files
			for (const configFile of LOVABLE_PATTERNS.configFiles) {
				if (await fileExists(path.join(projectPath, configFile))) {
					return true;
				}
			}

			// Check package.json for Lovable dependencies
			const packageJsonPath = path.join(projectPath, "package.json");
			if (await fileExists(packageJsonPath)) {
				const packageJson = JSON.parse(await readFile(packageJsonPath));
				const allDeps = {
					...packageJson.dependencies,
					...packageJson.devDependencies,
				};

				// Check for Lovable-specific dependencies
				for (const lovableImport of LOVABLE_PATTERNS.lovableImports) {
					if (allDeps[lovableImport]) {
						return true;
					}
				}
			}

			// Check for Lovable component usage in files
			const srcPath = path.join(projectPath, "src");
			if (await fileExists(srcPath)) {
				const hasLovableComponents =
					await this.checkForLovableComponents(srcPath);
				if (hasLovableComponents) {
					return true;
				}
			}

			return false;
		} catch (error) {
			logger.error("Error checking Lovable project:", error);
			return false;
		}
	}

	// Analyze Lovable project structure
	async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
		logger.info("Analyzing Lovable.dev project...");

		const analysis: ProjectAnalysis = {
			source: "lovable",
			framework: "react",
			language: "javascript",
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

			// Detect if TypeScript is used
			if (
				packageJson.devDependencies?.typescript ||
				packageJson.dependencies?.typescript
			) {
				analysis.language = "typescript";
			}
		}

		// Analyze components
		analysis.components = await this.analyzeComponents(
			projectPath,
			analysis.structure,
		);

		// Analyze pages
		analysis.pages = await this.analyzePages(projectPath, analysis.structure);

		// Analyze assets
		analysis.assets = await this.analyzeAssets(projectPath, analysis.structure);

		// Extract texts for localization
		if (this.options.addLocalization) {
			analysis.texts = await this.textExtractor.extractFromProject(projectPath);
		}

		logger.info(
			`Analysis complete: ${analysis.components.length} components, ${analysis.pages.length} pages`,
		);

		return analysis;
	}

	// Transform Lovable component to Xala component
	async transformComponent(
		component: ComponentInfo,
		analysis: ProjectAnalysis,
	): Promise<string> {
		logger.debug(`Transforming component: ${component.name}`);

		const sourceCode = await readFile(component.path);

		try {
			// Parse the component
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

			let hasLovableImports = false;
			let componentName = component.name;
			let props: ComponentProp[] = [];
			let imports: string[] = [];
			let componentBody = "";

			// Traverse AST to transform
			traverse(ast, {
				// Transform imports
				ImportDeclaration(nodePath) {
					const source = nodePath.node.source.value;

					if (
						LOVABLE_PATTERNS.lovableImports.some((pattern) =>
							source.includes(pattern),
						)
					) {
						hasLovableImports = true;

						// Transform Lovable imports to Xala imports
						const specifiers = nodePath.node.specifiers
							.map((spec) => {
								if (
									t.isImportSpecifier(spec) &&
									t.isIdentifier(spec.imported)
								) {
									const importedName = spec.imported.name;
									const mappedName =
										COMPONENT_MAPPING[importedName] ||
										importedName.replace(/^Lovable/, "");
									return mappedName;
								}
								return null;
							})
							.filter(Boolean);

						if (specifiers.length > 0) {
							imports.push(
								`import { ${specifiers.join(", ")} } from '@xala-technologies/ui-system';`,
							);
						}

						// Remove original import
						nodePath.remove();
					} else {
						// Keep other imports
						const importCode = sourceCode.substring(
							nodePath.node.start!,
							nodePath.node.end!,
						);
						imports.push(importCode);
					}
				},

				// Extract component props
				FunctionDeclaration(nodePath) {
					if (
						t.isIdentifier(nodePath.node.id) &&
						nodePath.node.id.name === componentName
					) {
						props = this.extractPropsFromFunction(nodePath.node);
					}
				},

				VariableDeclarator(nodePath) {
					if (
						t.isIdentifier(nodePath.node.id) &&
						(t.isArrowFunctionExpression(nodePath.node.init) ||
							t.isFunctionExpression(nodePath.node.init))
					) {
						if (nodePath.node.id.name === componentName) {
							props = this.extractPropsFromFunction(nodePath.node.init as any);
						}
					}
				},

				// Transform JSX elements
				JSXElement(nodePath) {
					this.transformJSXElement(nodePath);
				},
			});

			// Generate transformed component
			const transformedComponent = this.generateXalaComponent({
				name: componentName,
				props,
				imports: imports.filter(Boolean),
				hasState: component.hasState,
				hooks: component.hooks,
				styling: analysis.styling.type,
				typescript: analysis.language === "typescript",
				localization: this.options.addLocalization,
			});

			return transformedComponent;
		} catch (error) {
			logger.error(`Error transforming component ${component.name}:`, error);
			throw error;
		}
	}

	// Transform page component
	async transformPage(
		page: PageInfo,
		analysis: ProjectAnalysis,
	): Promise<string> {
		logger.debug(`Transforming page: ${page.name}`);

		const sourceCode = await readFile(page.path);

		// Similar transformation logic as components, but for pages
		// Include SEO metadata, layout integration, etc.

		const transformedPage = this.generateXalaPage({
			name: page.name,
			route: page.route,
			hasAuth: page.hasAuth,
			hasLayout: page.hasLayout,
			seo: page.seo,
			components: page.components,
			platform: this.options.targetPlatform,
			typescript: analysis.language === "typescript",
			localization: this.options.addLocalization,
		});

		return transformedPage;
	}

	// Transform styling
	async transformStyles(
		styling: StylingInfo,
		analysis: ProjectAnalysis,
	): Promise<Record<string, string>> {
		const transformedStyles: Record<string, string> = {};

		if (this.options.targetStyling === "tailwind") {
			// Convert existing styles to Tailwind
			transformedStyles["globals.css"] = this.generateTailwindGlobals();

			// Add Norwegian design tokens
			transformedStyles["tokens.css"] = this.generateNorwegianTokens();
		}

		return transformedStyles;
	}

	// Helper methods
	private async checkForLovableComponents(srcPath: string): Promise<boolean> {
		const files = await this.getJSXFiles(srcPath);

		for (const file of files) {
			try {
				const content = await readFile(file);

				// Check for Lovable component usage
				for (const component of LOVABLE_PATTERNS.lovableComponents) {
					if (
						content.includes(`<${component}`) ||
						content.includes(component)
					) {
						return true;
					}
				}

				// Check for Lovable imports
				for (const importPattern of LOVABLE_PATTERNS.lovableImports) {
					if (content.includes(importPattern)) {
						return true;
					}
				}
			} catch (error) {
				// Skip files that can't be read
				continue;
			}
		}

		return false;
	}

	private async getJSXFiles(dir: string): Promise<string[]> {
		const files: string[] = [];

		const scan = async (currentDir: string) => {
			try {
				const entries = await fs.readdir(currentDir, { withFileTypes: true });

				for (const entry of entries) {
					const fullPath = path.join(currentDir, entry.name);

					if (
						entry.isDirectory() &&
						!entry.name.startsWith(".") &&
						entry.name !== "node_modules"
					) {
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

	private async analyzeStructure(
		projectPath: string,
	): Promise<ProjectStructure> {
		const structure: ProjectStructure = {
			srcDir: "src",
			componentsDir: "src/components",
			hasTypeScript: false,
			hasTests: false,
			configFiles: [],
		};

		// Check for common directories
		const commonDirs = [
			"src",
			"components",
			"pages",
			"styles",
			"assets",
			"public",
		];
		for (const dir of commonDirs) {
			if (await fileExists(path.join(projectPath, dir))) {
				switch (dir) {
					case "components":
						structure.componentsDir = "components";
						break;
					case "pages":
						structure.pagesDir = "pages";
						break;
					case "styles":
						structure.stylesDir = "styles";
						break;
					case "assets":
						structure.assetsDir = "assets";
						break;
					case "public":
						structure.publicDir = "public";
						break;
				}
			}
		}

		// Check for nested src structure
		if (await fileExists(path.join(projectPath, "src/components"))) {
			structure.componentsDir = "src/components";
		}
		if (await fileExists(path.join(projectPath, "src/pages"))) {
			structure.pagesDir = "src/pages";
		}

		// Check for TypeScript
		const tsConfigPath = path.join(projectPath, "tsconfig.json");
		if (await fileExists(tsConfigPath)) {
			structure.hasTypeScript = true;
		}

		// Check for tests
		const testDirs = ["__tests__", "tests", "test"];
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
			"vite.config.js",
			"vite.config.ts",
			"tailwind.config.js",
			"postcss.config.js",
			".eslintrc.js",
			".prettierrc",
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

		// Load various config files
		const configFiles = [
			{ name: "tsconfig.json", key: "typescript" },
			{ name: "tailwind.config.js", key: "tailwind" },
			{ name: "vite.config.js", key: "vite" },
			{ name: ".eslintrc.js", key: "eslint" },
		];

		for (const { name, key } of configFiles) {
			const configPath = path.join(projectPath, name);
			if (await fileExists(configPath)) {
				try {
					const content = await readFile(configPath);
					if (name.endsWith(".json")) {
						config[key as keyof ConfigurationInfo] = JSON.parse(content);
					} else {
						// For JS files, just store the content for now
						config[key as keyof ConfigurationInfo] = { content };
					}
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
		const styleDirs = ["src/styles", "styles", "src/css", "css"];
		const styleExtensions = [".css", ".scss", ".less"];

		for (const styleDir of styleDirs) {
			const fullPath = path.join(projectPath, styleDir);
			if (await fileExists(fullPath)) {
				const files = await fs.readdir(fullPath);
				for (const file of files) {
					if (styleExtensions.some((ext) => file.endsWith(ext))) {
						styling.files.push(path.join(styleDir, file));
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

		const componentFiles = await this.getJSXFiles(componentsDir);

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

	private async analyzePages(
		projectPath: string,
		structure: ProjectStructure,
	): Promise<PageInfo[]> {
		const pages: PageInfo[] = [];

		if (!structure.pagesDir) {
			return pages;
		}

		const pagesDir = path.join(projectPath, structure.pagesDir);
		if (!(await fileExists(pagesDir))) {
			return pages;
		}

		const pageFiles = await this.getJSXFiles(pagesDir);

		for (const filePath of pageFiles) {
			try {
				const page = await this.analyzePage(filePath, projectPath);
				if (page) {
					pages.push(page);
				}
			} catch (error) {
				logger.warn(`Failed to analyze page ${filePath}:`, error);
			}
		}

		return pages;
	}

	private async analyzeAssets(
		projectPath: string,
		structure: ProjectStructure,
	): Promise<any[]> {
		// Analyze assets in public directory, images, etc.
		return [];
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

				ClassDeclaration(nodePath) {
					if (nodePath.node.id?.name === componentName) {
						info.type = "class";
					}
				},
			});

			// Calculate complexity
			info.complexity = this.calculateComplexity(sourceCode);
		} catch (error) {
			logger.warn(`Failed to parse component ${componentName}:`, error);
		}

		return info;
	}

	private async analyzePage(
		filePath: string,
		projectPath: string,
	): Promise<PageInfo | null> {
		const sourceCode = await readFile(filePath);
		const relativePath = path.relative(projectPath, filePath);
		const pageName = path.basename(filePath, path.extname(filePath));

		const info: PageInfo = {
			name: pageName,
			path: relativePath,
			route: `/${pageName.toLowerCase()}`,
			components: [],
			hasLayout: false,
			hasAuth: false,
			seo: {},
		};

		// Extract route information, SEO metadata, etc.
		if (
			sourceCode.includes("useRouter") ||
			sourceCode.includes("useNavigate")
		) {
			// Has routing logic
		}

		if (sourceCode.includes("useAuth") || sourceCode.includes("withAuth")) {
			info.hasAuth = true;
		}

		if (sourceCode.includes("Layout") || sourceCode.includes("<Layout")) {
			info.hasLayout = true;
		}

		return info;
	}

	private detectPackageManager(projectPath: string): "npm" | "yarn" | "pnpm" {
		// Check for lock files
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

	private extractPropsFromFunction(func: any): ComponentProp[] {
		const props: ComponentProp[] = [];

		if (func.params && func.params.length > 0) {
			const firstParam = func.params[0];

			if (t.isObjectPattern(firstParam)) {
				for (const prop of firstParam.properties) {
					if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
						props.push({
							name: prop.key.name,
							type: "any", // Would need more sophisticated type inference
							required: true,
						});
					}
				}
			}
		}

		return props;
	}

	private transformJSXElement(nodePath: any): void {
		const elementName = nodePath.node.openingElement.name;

		if (t.isJSXIdentifier(elementName)) {
			const originalName = elementName.name;
			const mappedName = COMPONENT_MAPPING[originalName];

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

	private calculateComplexity(sourceCode: string): number {
		// Simple complexity calculation based on various factors
		let complexity = 1;

		// Count conditional statements
		complexity += (sourceCode.match(/if\s*\(/g) || []).length;
		complexity += (sourceCode.match(/\?\s*:/g) || []).length;
		complexity += (sourceCode.match(/switch\s*\(/g) || []).length;
		complexity += (sourceCode.match(/for\s*\(/g) || []).length;
		complexity += (sourceCode.match(/while\s*\(/g) || []).length;

		return Math.min(complexity, 10); // Cap at 10
	}

	private generateXalaComponent(config: {
		name: string;
		props: ComponentProp[];
		imports: string[];
		hasState: boolean;
		hooks: string[];
		styling: string;
		typescript: boolean;
		localization: boolean;
	}): string {
		const {
			name,
			props,
			imports,
			hasState,
			hooks,
			styling,
			typescript,
			localization,
		} = config;

		let component = "";

		// Add imports
		const reactImports = ["React"];
		if (hasState) reactImports.push("useState");
		if (hooks.includes("useEffect")) reactImports.push("useEffect");
		if (hooks.includes("useCallback")) reactImports.push("useCallback");

		component += `import { ${reactImports.join(", ")} } from 'react';\n`;

		if (localization) {
			component += `import { useTranslation } from 'react-i18next';\n`;
		}

		// Add other imports
		imports.forEach((imp) => {
			component += `${imp}\n`;
		});

		component += "\n";

		// Add TypeScript interface
		if (typescript && props.length > 0) {
			component += `interface ${name}Props {\n`;
			props.forEach((prop) => {
				component += `  ${prop.name}${prop.required ? "" : "?"}: ${prop.type};\n`;
			});
			component += "  className?: string;\n";
			if (localization) {
				component += "  ariaLabel?: string;\n";
			}
			component += "}\n\n";
		}

		// Add component
		const propsParam =
			props.length > 0
				? typescript
					? `{ ${props.map((p) => p.name).join(", ")}, className, ${localization ? "ariaLabel" : ""} }: ${name}Props`
					: "props"
				: "props";

		component += `export const ${name}${typescript ? `: React.FC${props.length > 0 ? `<${name}Props>` : ""}` : ""} = (${propsParam}) => {\n`;

		if (localization) {
			component += `  const { t } = useTranslation();\n\n`;
		}

		if (hasState) {
			component += `  const [state, setState] = useState();\n\n`;
		}

		// Add component body
		component += `  return (\n`;
		component += `    <div \n`;
		component += `      className={\`${name.toLowerCase()}${styling === "tailwind" ? " p-4 rounded-lg" : ""}\${className ? \` \${className}\` : ''}\`}\n`;
		if (localization) {
			component += `      aria-label={ariaLabel}\n`;
		}
		component += `    >\n`;
		component += `      {/* ${name} content */}\n`;
		component += `    </div>\n`;
		component += `  );\n`;
		component += `};\n\n`;

		component += `export default ${name};\n`;

		return component;
	}

	private generateXalaPage(config: {
		name: string;
		route: string;
		hasAuth: boolean;
		hasLayout: boolean;
		seo: any;
		components: string[];
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
		page += `        {/* Page content */}\n`;
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
  
  /* RTL support */
  [dir="rtl"] {
    direction: rtl;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }
}`;
	}

	private generateNorwegianTokens(): string {
		return `:root {
  /* Norwegian design tokens */
  --color-norway-blue: #003d82;
  --color-norway-red: #ba0c2f;
  --color-norway-white: #ffffff;
  
  /* Spacing tokens */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography tokens */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}`;
	}

	// Required abstract method implementations
	protected async migrateComponentTests(
		component: ComponentInfo,
		result: MigrationResult,
	): Promise<void> {
		// Implementation for migrating component tests
		if (component.tests?.length) {
			// Transform test files
			logger.debug(`Migrating tests for component: ${component.name}`);
		}
	}

	protected async migrateComponentStories(
		component: ComponentInfo,
		result: MigrationResult,
	): Promise<void> {
		// Implementation for migrating Storybook stories
		if (component.stories) {
			logger.debug(`Migrating stories for component: ${component.name}`);
		}
	}

	protected async generateConfigurationFiles(
		result: MigrationResult,
	): Promise<void> {
		// Generate configuration files for Xala project
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
			description: "Migrated from Lovable.dev to Xala UI System",
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
export async function migrateLovableProject(
	sourcePath: string,
	options: MigrationOptions,
	progressCallback?: (progress: any) => void,
): Promise<MigrationResult> {
	const adapter = new LovableAdapter(options);
	return adapter.migrate(sourcePath, progressCallback);
}
