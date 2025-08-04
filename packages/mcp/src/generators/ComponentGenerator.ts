/**
 * Main Component Generator for Xala UI System
 */

import type {
	ComponentConfig,
	DataTableConfig,
	FormConfig,
	GeneratedComponent,
	GeneratedFile,
	LayoutConfig,
	PageTemplateConfig,
} from "../types/index.js";
import { CliTemplateGenerator } from "./CliTemplateGenerator.js";
import { DataTableGenerator } from "./DataTableGenerator.js";
import { DocumentationGenerator } from "./DocumentationGenerator.js";
import { FormGenerator } from "./FormGenerator.js";
import { LayoutGenerator } from "./LayoutGenerator.js";
import { LocalizationGenerator } from "./LocalizationGenerator.js";
import { MultiPlatformGenerator } from "./MultiPlatformGenerator.js";
import { NavigationGenerator } from "./NavigationGenerator.js";
import { PageTemplateGenerator } from "./PageTemplateGenerator.js";
import { StoryGenerator } from "./StoryGenerator.js";
import { TestGenerator } from "./TestGenerator.js";
import { UIComponentGenerator } from "./UIComponentGenerator.js";

export class ComponentGenerator {
	private layoutGenerator: LayoutGenerator;
	private pageTemplateGenerator: PageTemplateGenerator;
	private formGenerator: FormGenerator;
	private dataTableGenerator: DataTableGenerator;
	private navigationGenerator: NavigationGenerator;
	private uiComponentGenerator: UIComponentGenerator;
	private localizationGenerator: LocalizationGenerator;
	private testGenerator: TestGenerator;
	private storyGenerator: StoryGenerator;
	private documentationGenerator: DocumentationGenerator;
	private multiPlatformGenerator: MultiPlatformGenerator;
	private cliTemplateGenerator: CliTemplateGenerator;

	constructor() {
		this.layoutGenerator = new LayoutGenerator();
		this.pageTemplateGenerator = new PageTemplateGenerator();
		this.formGenerator = new FormGenerator();
		this.dataTableGenerator = new DataTableGenerator();
		this.navigationGenerator = new NavigationGenerator();
		this.uiComponentGenerator = new UIComponentGenerator();
		this.localizationGenerator = new LocalizationGenerator();
		this.testGenerator = new TestGenerator();
		this.storyGenerator = new StoryGenerator();
		this.documentationGenerator = new DocumentationGenerator();
		this.multiPlatformGenerator = new MultiPlatformGenerator();
		this.cliTemplateGenerator = new CliTemplateGenerator();
	}

	async generateComponent(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		// Check if platform is specified for multi-platform generation
		if (config.platform) {
			return this.generateMultiPlatformComponent(config);
		}

		// Legacy single-platform generation
		switch (config.category) {
			case "page-template":
				return this.generatePageTemplate(config as PageTemplateConfig);
			case "form":
				return this.generateForm(config as FormConfig);
			case "data-display":
				if (config.name.toLowerCase().includes("table")) {
					return this.generateDataTable(config as DataTableConfig);
				}
				return this.generateUIComponent(config);
			case "navigation":
				return this.generateNavigation(config);
			// New v6.0 categories
			case "components":
			case "data-components":
			case "theme-components":
			case "layouts":
			case "providers":
			case "patterns":
			case "tools":
				return this.generateMultiPlatformComponent(config);
			default:
				return this.generateUIComponent(config);
		}
	}

	/**
	 * Generate component for specific platform using v6.0 multi-platform generator
	 * Uses actual CLI templates for 100% alignment
	 */
	async generateMultiPlatformComponent(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		// Use CLI template generator for actual template alignment
		try {
			return await this.cliTemplateGenerator.generateFromCliTemplate(config);
		} catch (error) {
			// Fallback to programmatic generation if template not found
			console.warn(`CLI template not found, using fallback: ${error}`);
			return this.multiPlatformGenerator.generateMultiPlatformComponent(config);
		}
	}

	/**
	 * Generate component for all platforms
	 */
	async generateAllPlatforms(
		config: ComponentConfig,
	): Promise<Record<string, GeneratedComponent>> {
		return this.multiPlatformGenerator.generateAllPlatforms(config);
	}

	public generateLayout(config: LayoutConfig): GeneratedComponent {
		const componentCode = this.layoutGenerator.generateLayout(config);
		const typesCode = this.generateTypes(config);
		const localizationKeys = this.localizationGenerator.generateKeys(config);
		const imports = this.generateImports(config);
		const dependencies = this.generateDependencies(config);

		const files: GeneratedFile[] = [
			{
				path: `components/layouts/${this.toPascalCase(config.name)}.tsx`,
				content: componentCode,
				type: "component",
			},
			{
				path: `types/${config.name.toLowerCase()}.types.ts`,
				content: typesCode,
				type: "types",
			},
			{
				path: `locales/en/${config.name.toLowerCase()}.json`,
				content: JSON.stringify(localizationKeys, null, 2),
				type: "locale",
			},
		];

		return {
			componentCode,
			typesCode,
			localizationKeys,
			imports,
			dependencies,
			files,
			platform: config.platform || "react",
			architecture: config.platformConfig?.architecture || "v5-cva",
		};
	}

	public generatePageTemplate(config: PageTemplateConfig): GeneratedComponent {
		const componentCode =
			this.pageTemplateGenerator.generatePageTemplate(config);
		const typesCode = this.generateTypes(config);
		const localizationKeys = this.localizationGenerator.generateKeys(config);
		const imports = this.generateImports(config);
		const dependencies = this.generateDependencies(config);

		const files: GeneratedFile[] = [
			{
				path: `pages/${config.template}/${this.toPascalCase(config.name)}.tsx`,
				content: componentCode,
				type: "component",
			},
			{
				path: `types/${config.name.toLowerCase()}.types.ts`,
				content: typesCode,
				type: "types",
			},
			{
				path: `locales/en/${config.name.toLowerCase()}.json`,
				content: JSON.stringify(localizationKeys, null, 2),
				type: "locale",
			},
		];

		return {
			componentCode,
			typesCode,
			localizationKeys,
			imports,
			dependencies,
			files,
			platform: config.platform || "react",
			architecture: config.platformConfig?.architecture || "v5-cva",
		};
	}

	public generateForm(config: FormConfig): GeneratedComponent {
		const componentCode = this.formGenerator.generateForm(config);
		const typesCode = this.generateTypes(config);
		const localizationKeys = this.localizationGenerator.generateKeys(config);
		const imports = this.generateImports(config);
		const dependencies = this.generateDependencies(config);

		const files: GeneratedFile[] = [
			{
				path: `components/forms/${this.toPascalCase(config.name)}.tsx`,
				content: componentCode,
				type: "component",
			},
			{
				path: `types/${config.name.toLowerCase()}.types.ts`,
				content: typesCode,
				type: "types",
			},
			{
				path: `locales/en/${config.name.toLowerCase()}.json`,
				content: JSON.stringify(localizationKeys, null, 2),
				type: "locale",
			},
		];

		return {
			componentCode,
			typesCode,
			localizationKeys,
			imports,
			dependencies,
			files,
			platform: config.platform || "react",
			architecture: config.platformConfig?.architecture || "v5-cva",
		};
	}

	public generateDataTable(config: DataTableConfig): GeneratedComponent {
		const componentCode = this.dataTableGenerator.generateDataTable(config);
		const typesCode = this.generateTypes(config as any);
		const localizationKeys = this.localizationGenerator.generateKeys(
			config as any,
		);
		const imports = this.generateImports(config as any);
		const dependencies = this.generateDependencies(config as any);

		const files: GeneratedFile[] = [
			{
				path: `components/tables/${this.toPascalCase(config.name)}.tsx`,
				content: componentCode,
				type: "component",
			},
			{
				path: `types/${config.name.toLowerCase()}.types.ts`,
				content: typesCode,
				type: "types",
			},
			{
				path: `locales/en/${config.name.toLowerCase()}.json`,
				content: JSON.stringify(localizationKeys, null, 2),
				type: "locale",
			},
		];

		return {
			componentCode,
			typesCode,
			localizationKeys,
			imports,
			dependencies,
			files,
			platform: config.platform || "react",
			architecture: config.platformConfig?.architecture || "v5-cva",
		};
	}

	public generateNavigation(config: ComponentConfig): GeneratedComponent {
		const componentCode = this.navigationGenerator.generateNavigation(config);
		const typesCode = this.generateTypes(config);
		const localizationKeys = this.localizationGenerator.generateKeys(config);
		const imports = this.generateImports(config);
		const dependencies = this.generateDependencies(config);

		const files: GeneratedFile[] = [
			{
				path: `components/navigation/${this.toPascalCase(config.name)}.tsx`,
				content: componentCode,
				type: "component",
			},
			{
				path: `types/${config.name.toLowerCase()}.types.ts`,
				content: typesCode,
				type: "types",
			},
			{
				path: `locales/en/${config.name.toLowerCase()}.json`,
				content: JSON.stringify(localizationKeys, null, 2),
				type: "locale",
			},
		];

		return {
			componentCode,
			typesCode,
			localizationKeys,
			imports,
			dependencies,
			files,
			platform: config.platform || "react",
			architecture: config.platformConfig?.architecture || "v5-cva",
		};
	}

	private async generateUIComponent(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		const componentCode = this.uiComponentGenerator.generateUIComponent(config);
		const typesCode = this.generateTypes(config);
		const localizationKeys = this.localizationGenerator.generateKeys(config);
		const imports = this.generateImports(config);
		const dependencies = this.generateDependencies(config);

		const files: GeneratedFile[] = [
			{
				path: `components/ui/${this.toPascalCase(config.name)}.tsx`,
				content: componentCode,
				type: "component",
			},
			{
				path: `types/${config.name.toLowerCase()}.types.ts`,
				content: typesCode,
				type: "types",
			},
			{
				path: `locales/en/${config.name.toLowerCase()}.json`,
				content: JSON.stringify(localizationKeys, null, 2),
				type: "locale",
			},
		];

		return {
			componentCode,
			typesCode,
			localizationKeys,
			imports,
			dependencies,
			files,
			platform: config.platform || "react",
			architecture: config.platformConfig?.architecture || "v5-cva",
		};
	}

	private generateTypes(config: ComponentConfig): string {
		const componentName = this.toPascalCase(config.name);

		return `// types/${config.name.toLowerCase()}.types.ts
/**
 * Type definitions for ${componentName}
 * Generated by Xala UI System MCP
 */

export interface ${componentName}Props {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly variant?: '${config.styling.variant}';
  readonly size?: '${config.size || "md"}';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly 'data-testid'?: string;
}

export interface ${componentName}Config {
  readonly theme: '${config.theme || "enterprise"}';
  readonly locale: '${config.locale || "en"}';
  readonly accessibility: {
    readonly level: '${config.accessibility.level}';
    readonly screenReader: ${config.accessibility.screenReader};
    readonly keyboardNavigation: ${config.accessibility.keyboardNavigation};
  };
}

export type ${componentName}Variant = '${config.styling.variant}';
export type ${componentName}Size = '${config.size || "md"}';`;
	}

	private generateImports(config: ComponentConfig): string[] {
		const baseImports = ["React", "cva", "type VariantProps", "cn"];

		const conditionalImports: string[] = [];

		// Add category-specific imports
		switch (config.category) {
			case "layouts":
				conditionalImports.push(
					"Card",
					"CardContent",
					"CardDescription",
					"CardHeader",
					"CardTitle",
				);
				break;
			case "navigation":
				conditionalImports.push("Button", "Badge");
				break;
			case "form":
				conditionalImports.push("Button", "Input", "Label");
				break;
			case "data-display":
				conditionalImports.push("Avatar", "Badge", "Card");
				break;
			case "feedback":
				conditionalImports.push("Alert", "Progress");
				break;
			case "interactive":
				conditionalImports.push("Button");
				break;
		}

		// Add feature-specific imports
		if (config.features.icons) {
			conditionalImports.push("lucide-react");
		}

		return [...new Set([...baseImports, ...conditionalImports])];
	}

	private generateDependencies(config: ComponentConfig): string[] {
		const baseDeps = ["@xala-technologies/ui-system", "react", "react-i18next"];

		const conditionalDeps: string[] = [];

		if (config.features.icons) {
			conditionalDeps.push("lucide-react");
		}

		if (config.features.animated) {
			conditionalDeps.push("framer-motion");
		}

		if (config.features.validation) {
			conditionalDeps.push("zod", "react-hook-form");
		}

		if (config.category === "form") {
			conditionalDeps.push("react-hook-form", "@hookform/resolvers");
		}

		if (config.category === "data-display" && config.features.sortable) {
			conditionalDeps.push("@tanstack/react-table");
		}

		return [...new Set([...baseDeps, ...conditionalDeps])];
	}

	private toPascalCase(str: string): string {
		return str
			.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
				return index === 0 ? word.toLowerCase() : word.toUpperCase();
			})
			.replace(/\s+/g, "")
			.replace(/^./, (str) => str.toUpperCase());
	}

	async generateWithTests(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		const result = await this.generateComponent(config);

		const testCode = this.testGenerator.generateTest(config);
		result.testCode = testCode;

		result.files.push({
			path: `components/__tests__/${this.toPascalCase(config.name)}.test.tsx`,
			content: testCode,
			type: "test",
		});

		return result;
	}

	async generateWithStories(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		const result = await this.generateComponent(config);

		const storyCode = this.storyGenerator.generateStory(config);
		result.storyCode = storyCode;

		result.files.push({
			path: `stories/${this.toPascalCase(config.name)}.stories.tsx`,
			content: storyCode,
			type: "story",
		});

		return result;
	}

	async generateWithDocumentation(
		config: ComponentConfig,
	): Promise<GeneratedComponent> {
		const result = await this.generateComponent(config);

		const documentationCode =
			this.documentationGenerator.generateDocumentation(config);
		result.documentationCode = documentationCode;

		result.files.push({
			path: `docs/components/${config.name.toLowerCase()}.md`,
			content: documentationCode,
			type: "docs",
		});

		return result;
	}

	async generateComplete(config: ComponentConfig): Promise<GeneratedComponent> {
		let result = await this.generateComponent(config);
		result = await this.generateWithTests(config);
		result = await this.generateWithStories(config);
		result = await this.generateWithDocumentation(config);

		return result;
	}

	/**
	 * Get available components for a platform
	 */
	getAvailableComponents(platform: string): string[] {
		const components = this.multiPlatformGenerator.getAvailableComponents(
			platform as any,
		);
		return components.map((c) => c as string);
	}

	/**
	 * Get platform configuration
	 */
	getPlatformConfig(platform: string): any {
		return this.multiPlatformGenerator.getPlatformConfig(platform as any);
	}

	/**
	 * Validate if component is available for platform
	 */
	isComponentAvailable(component: string, platform: string): boolean {
		return this.multiPlatformGenerator.isComponentAvailable(
			component,
			platform as any,
		);
	}

	/**
	 * Get all supported platforms
	 */
	getSupportedPlatforms(): string[] {
		return [
			"react",
			"nextjs",
			"vue",
			"angular",
			"svelte",
			"electron",
			"react-native",
		];
	}

	/**
	 * Get all available component categories
	 */
	getComponentCategories(): string[] {
		return [
			"components", // UI Components
			"data-components", // Data Components
			"theme-components", // Theme Components
			"layouts", // Layout Components
			"providers", // Provider Components
			"patterns", // Advanced Patterns (React/Next.js only)
			"tools", // Enterprise Tools
			// Legacy categories
			"navigation",
			"form",
			"data-display",
			"feedback",
			"interactive",
			"specialized",
			"page-template",
		];
	}
}
