// Generator interfaces for CLI template generation
// Extracted and simplified from packages/core

/**
 * Base generation options - common properties for all generators
 */
export interface BaseGenerationOptions {
	name: string;
	description?: string;
	outputPath: string;
	typescript?: boolean;
	localization?: boolean;
	compliance?: "none" | "gdpr" | "norwegian";
	uiSystem?: "default" | "xala";
	overwrite?: boolean;
	dryRun?: boolean;
}

/**
 * Component generation options
 */
export interface ComponentGenerationOptions extends BaseGenerationOptions {
	type: "functional" | "class" | "hook";
	props?: ComponentProp[];
	hasState?: boolean;
	hasEffects?: boolean;
	hasEvents?: boolean;
	accessibility?: AccessibilityOptions;
	styling?: StylingOptions;
}

/**
 * Page generation options
 */
export interface PageGenerationOptions extends BaseGenerationOptions {
	route: string;
	layout?: string;
	auth?: boolean;
	seo?: SEOOptions;
	components?: string[];
}

/**
 * Layout generation options
 */
export interface LayoutGenerationOptions extends BaseGenerationOptions {
	type: "app" | "page" | "component";
	responsive?: boolean;
	navigation?: boolean;
	footer?: boolean;
	sidebar?: boolean;
}

/**
 * API generation options
 */
export interface ApiGenerationOptions extends BaseGenerationOptions {
	type: "rest" | "graphql" | "trpc";
	methods?: string[];
	auth?: boolean;
	validation?: boolean;
	database?: boolean;
}

/**
 * Test generation options
 */
export interface TestGenerationOptions extends BaseGenerationOptions {
	type: "unit" | "integration" | "e2e";
	framework: "vitest" | "jest" | "playwright";
	coverage?: boolean;
	mocks?: boolean;
}

/**
 * Generation result
 */
export interface GenerationResult {
	success: boolean;
	files: GeneratedFile[];
	errors?: string[];
	warnings?: string[];
	metadata?: Record<string, unknown>;
}

/**
 * Generated file information
 */
export interface GeneratedFile {
	path: string;
	content: string;
	type: "component" | "page" | "layout" | "api" | "test" | "config" | "style";
	size: number;
	checksum?: string;
}

/**
 * Component prop definition
 */
export interface ComponentProp {
	name: string;
	type: string;
	required?: boolean;
	defaultValue?: string;
	description?: string;
}

/**
 * Accessibility options
 */
export interface AccessibilityOptions {
	wcagLevel: "A" | "AA" | "AAA";
	ariaLabels?: boolean;
	keyboardNavigation?: boolean;
	screenReader?: boolean;
	colorContrast?: boolean;
}

/**
 * Styling options
 */
export interface StylingOptions {
	system: "css" | "scss" | "tailwind" | "styled-components" | "xala";
	responsive?: boolean;
	darkMode?: boolean;
	animations?: boolean;
	tokens?: boolean;
}

/**
 * SEO options
 */
export interface SEOOptions {
	title?: string;
	description?: string;
	keywords?: string[];
	openGraph?: boolean;
	jsonLd?: boolean;
	sitemap?: boolean;
}

/**
 * Template engine interface
 */
export interface TemplateEngine {
	render(template: string, data: Record<string, unknown>): Promise<string>;
	registerHelper(name: string, helper: Function): void;
	registerPartial(name: string, template: string): void;
}

/**
 * Code generator interface
 */
export interface CodeGenerator {
	generateComponent(options: ComponentGenerationOptions): Promise<GenerationResult>;
	generatePage(options: PageGenerationOptions): Promise<GenerationResult>;
	generateLayout(options: LayoutGenerationOptions): Promise<GenerationResult>;
	generateApi(options: ApiGenerationOptions): Promise<GenerationResult>;
	generateTest(options: TestGenerationOptions): Promise<GenerationResult>;
}
