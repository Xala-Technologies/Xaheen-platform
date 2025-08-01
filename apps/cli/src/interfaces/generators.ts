/**
 * Generator Interfaces for Xaheen Platform
 * Enhanced interfaces for comprehensive code generation functionality
 */

/**
 * Base generation options - common properties for all generators
 */
export interface BaseGenerationOptions {
	readonly name: string;
	readonly description?: string;
	readonly outputPath: string;
	readonly template?: string;
	readonly typescript: boolean;
	readonly localization: boolean;
	readonly compliance: "none" | "gdpr" | "norwegian";
	readonly uiSystem: "default" | "xala";
	readonly overwrite: boolean;
	readonly dryRun: boolean;
	readonly verbose: boolean;
	readonly metadata?: Record<string, unknown>;
}

/**
 * Component generation options
 */
export interface ComponentGenerationOptions extends BaseGenerationOptions {
	readonly componentType: "functional" | "class" | "hook" | "provider";
	readonly props?: readonly ComponentProp[];
	readonly hasState: boolean;
	readonly hasEffects: boolean;
	readonly hasEvents: boolean;
	readonly accessibility: AccessibilityOptions;
	readonly styling: StylingOptions;
	readonly testing: boolean;
	readonly storybook: boolean;
	readonly internationalization: boolean;
	readonly responsive: boolean;
	readonly variants?: readonly string[];
	readonly exports?: readonly string[];
}

/**
 * Page generation options
 */
export interface PageGenerationOptions extends BaseGenerationOptions {
	readonly pageType: "static" | "dynamic" | "api" | "layout";
	readonly route: string;
	readonly layout?: string;
	readonly auth: boolean;
	readonly seo: SEOOptions;
	readonly ssr: boolean;
	readonly ssg: boolean;
	readonly components?: readonly string[];
	readonly params?: readonly {
		readonly name: string;
		readonly type: string;
		readonly optional: boolean;
	}[];
	readonly dependencies?: readonly string[];
}

/**
 * Model generation options
 */
export interface ModelGenerationOptions extends BaseGenerationOptions {
	readonly modelType: "entity" | "dto" | "schema" | "interface";
	readonly database?: string;
	readonly orm?: string;
	readonly fields: readonly {
		readonly name: string;
		readonly type: string;
		readonly nullable: boolean;
		readonly unique: boolean;
		readonly indexed: boolean;
		readonly defaultValue?: string;
		readonly validation?: Record<string, unknown>;
	}[];
	readonly relationships?: readonly {
		readonly type: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
		readonly target: string;
		readonly foreignKey?: string;
		readonly cascade: boolean;
	}[];
	readonly migrations: boolean;
	readonly seeds: boolean;
}

/**
 * Layout generation options
 */
export interface LayoutGenerationOptions extends BaseGenerationOptions {
	readonly layoutType: "app" | "page" | "component" | "section" | "wrapper";
	readonly regions: readonly {
		readonly name: string;
		readonly required: boolean;
		readonly defaultContent?: string;
	}[];
	readonly responsive: boolean;
	readonly navigation: boolean;
	readonly footer: boolean;
	readonly sidebar: boolean;
	readonly breadcrumbs: boolean;
	readonly theme: "light" | "dark" | "auto";
}

/**
 * API generation options
 */
export interface ApiGenerationOptions extends BaseGenerationOptions {
	readonly apiType: "rest" | "graphql" | "trpc" | "orpc";
	readonly endpoints: readonly {
		readonly path: string;
		readonly method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
		readonly handler: string;
		readonly auth: boolean;
		readonly validation?: Record<string, unknown>;
	}[];
	readonly middleware?: readonly string[];
	readonly documentation: boolean;
	readonly testing: boolean;
	readonly rateLimit: boolean;
	readonly caching: boolean;
}

/**
 * Test generation options
 */
export interface TestGenerationOptions extends BaseGenerationOptions {
	readonly testType: "unit" | "integration" | "e2e" | "performance";
	readonly framework: "jest" | "vitest" | "playwright" | "cypress";
	readonly target: string; // Component/function to test
	readonly coverage: boolean;
	readonly snapshots: boolean;
	readonly mocking: boolean;
	readonly fixtures: boolean;
	readonly parallel: boolean;
}

/**
 * Generation result with comprehensive information
 */
export interface GenerationResult {
	readonly success: boolean;
	readonly files: readonly GeneratedFile[];
	readonly errors: readonly string[];
	readonly warnings: readonly string[];
	readonly metadata: {
		readonly generator: string;
		readonly version: string;
		readonly startTime: Date;
		readonly endTime: Date;
		readonly duration: number; // milliseconds
		readonly options: BaseGenerationOptions;
	};
	readonly statistics: {
		readonly filesGenerated: number;
		readonly linesOfCode: number;
		readonly complexity: number;
		readonly dependencies: readonly string[];
		readonly testCoverage?: number;
	};
}

/**
 * Generated file information with enhanced metadata
 */
export interface GeneratedFile {
	readonly path: string;
	readonly content: string;
	readonly type: "component" | "page" | "layout" | "api" | "test" | "config" | "style" | "model";
	readonly size: number;
	readonly checksum: string;
	readonly language: "typescript" | "javascript" | "css" | "html" | "json" | "markdown";
	readonly encoding: "utf8" | "base64";
	readonly generated: Date;
	readonly dependencies?: readonly string[];
	readonly exports?: readonly string[];
}

/**
 * Component prop definition
 */
export interface ComponentProp {
	readonly name: string;
	readonly type: string;
	readonly required: boolean;
	readonly defaultValue?: string;
	readonly description?: string;
}

/**
 * Enhanced accessibility options
 */
export interface AccessibilityOptions {
	readonly wcagLevel: "A" | "AA" | "AAA";
	readonly ariaLabels: boolean;
	readonly keyboardNavigation: boolean;
	readonly screenReader: boolean;
	readonly colorContrast: boolean;
	readonly focusManagement: boolean;
	readonly semanticHtml: boolean;
}

/**
 * Enhanced styling options
 */
export interface StylingOptions {
	readonly system: "css" | "scss" | "tailwind" | "styled-components" | "xala";
	readonly responsive: boolean;
	readonly darkMode: boolean;
	readonly animations: boolean;
	readonly tokens: boolean;
	readonly rtlSupport: boolean;
	readonly customProperties: boolean;
}

/**
 * Enhanced SEO options
 */
export interface SEOOptions {
	readonly title: string;
	readonly description: string;
	readonly keywords?: readonly string[];
	readonly openGraph: boolean;
	readonly jsonLd: boolean;
	readonly sitemap: boolean;
	readonly canonical?: string;
	readonly robots?: string;
	readonly alternateLanguages?: readonly {
		readonly lang: string;
		readonly href: string;
	}[];
}

/**
 * Template engine interface
 */
export interface TemplateEngine {
	render(template: string, data: Record<string, unknown>): Promise<string>;
	registerHelper(name: string, helper: Function): void;
	registerPartial(name: string, template: string): void;
	compile(template: string): (data: Record<string, unknown>) => string;
	precompile(templates: Record<string, string>): void;
}

/**
 * Enhanced code generator interface
 */
export interface CodeGenerator {
	generateComponent(options: ComponentGenerationOptions): Promise<GenerationResult>;
	generatePage(options: PageGenerationOptions): Promise<GenerationResult>;
	generateModel(options: ModelGenerationOptions): Promise<GenerationResult>;
	generateLayout(options: LayoutGenerationOptions): Promise<GenerationResult>;
	generateApi(options: ApiGenerationOptions): Promise<GenerationResult>;
	generateTest(options: TestGenerationOptions): Promise<GenerationResult>;
	
	// Validation methods
	validateOptions(options: BaseGenerationOptions): Promise<readonly string[]>;
	
	// Preview methods
	previewGeneration(options: BaseGenerationOptions): Promise<readonly GeneratedFile[]>;
	
	// Utility methods
	getAvailableTemplates(): Promise<readonly string[]>;
	getGeneratorInfo(): {
		readonly name: string;
		readonly version: string;
		readonly description: string;
		readonly supportedFrameworks: readonly string[];
	};
}

/**
 * Generation context with project information
 */
export interface GenerationContext {
	readonly projectPath: string;
	readonly projectName: string;
	readonly framework: string;
	readonly version: string;
	readonly config: {
		readonly typescript: boolean;
		readonly uiSystem: "default" | "xala";
		readonly compliance: "none" | "gdpr" | "norwegian";
		readonly locales: readonly string[];
		readonly auth: readonly string[];
		readonly integrations: readonly string[];
		readonly documents: readonly string[];
	};
	readonly existing: {
		readonly components: readonly string[];
		readonly pages: readonly string[];
		readonly models: readonly string[];
		readonly layouts: readonly string[];
		readonly apis: readonly string[];
	};
}

/**
 * Generator registry for managing all generators
 */
export interface GeneratorRegistry {
	register(generator: CodeGenerator): void;
	get(name: string): CodeGenerator | undefined;
	getAll(): readonly CodeGenerator[];
	getByType(type: string): readonly CodeGenerator[];
	unregister(name: string): boolean;
	clear(): void;
}