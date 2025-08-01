// Core interfaces for SOLID architecture implementation
// Single Responsibility: Each interface has a single, well-defined purpose
// Interface Segregation: Specific interfaces instead of large monolithic ones
// Dependency Inversion: Abstract contracts for implementation details

import { LocaleCode } from "../localization/types.js";
import { NorwegianCompliance } from "../types/compliance.js";

// === Core Service Interfaces ===

/**
 * Base service interface - Single Responsibility Principle
 * All services implement this basic contract
 */
export interface IBaseService {
	readonly name: string;
	readonly version: string;
	initialize(): Promise<void>;
	dispose(): Promise<void>;
	healthCheck(): Promise<boolean>;
}

/**
 * Configuration service interface - manages application configuration
 */
export interface IConfigurationService extends IBaseService {
	get<T>(key: string, defaultValue?: T): T;
	set<T>(key: string, value: T): void;
	has(key: string): boolean;
	getAll(): Record<string, any>;
	load(source: string): Promise<void>;
	save(destination: string): Promise<void>;
	watch(key: string, callback: (value: any) => void): () => void;
}

/**
 * Logging service interface - handles application logging
 */
export interface ILoggingService extends IBaseService {
	debug(message: string, meta?: Record<string, any>): void;
	info(message: string, meta?: Record<string, any>): void;
	warn(message: string, meta?: Record<string, any>): void;
	error(message: string, error?: Error, meta?: Record<string, any>): void;
	setLevel(level: "debug" | "info" | "warn" | "error"): void;
	addTransport(transport: ILogTransport): void;
}

/**
 * Log transport interface - Interface Segregation Principle
 */
export interface ILogTransport {
	readonly name: string;
	log(
		level: string,
		message: string,
		meta?: Record<string, any>,
	): Promise<void>;
}

/**
 * File system service interface - abstracts file operations
 */
export interface IFileSystemService extends IBaseService {
	exists(path: string): Promise<boolean>;
	read(path: string): Promise<string>;
	write(path: string, content: string): Promise<void>;
	delete(path: string): Promise<void>;
	createDirectory(path: string): Promise<void>;
	list(path: string): Promise<string[]>;
	copy(source: string, destination: string): Promise<void>;
	move(source: string, destination: string): Promise<void>;
	getStats(path: string): Promise<IFileStats>;
}

/**
 * File statistics interface
 */
export interface IFileStats {
	size: number;
	isFile: boolean;
	isDirectory: boolean;
	createdAt: Date;
	modifiedAt: Date;
}

// === Generator Interfaces ===

/**
 * Code generator interface - generates code from templates
 */
export interface ICodeGenerator extends IBaseService {
	generateComponent(
		options: IComponentGenerationOptions,
	): Promise<IGenerationResult>;
	generatePage(options: IPageGenerationOptions): Promise<IGenerationResult>;
	generateLayout(options: ILayoutGenerationOptions): Promise<IGenerationResult>;
	generateApi(options: IApiGenerationOptions): Promise<IGenerationResult>;
	generateTest(options: ITestGenerationOptions): Promise<IGenerationResult>;
	generateStory(options: IStoryGenerationOptions): Promise<IGenerationResult>;
}

/**
 * Base generation options - common properties for all generators
 */
export interface IBaseGenerationOptions {
	name: string;
	description?: string;
	outputPath: string;
	typescript?: boolean;
	localization?: boolean;
	compliance?: NorwegianCompliance;
	overwrite?: boolean;
	dryRun?: boolean;
}

/**
 * Component generation options
 */
export interface IComponentGenerationOptions extends IBaseGenerationOptions {
	type: "functional" | "class" | "hook";
	props?: IComponentProp[];
	hasState?: boolean;
	hasEffects?: boolean;
	hasEvents?: boolean;
	accessibility?: IAccessibilityOptions;
	styling?: IStylingOptions;
}

/**
 * Page generation options
 */
export interface IPageGenerationOptions extends IBaseGenerationOptions {
	framework: "nextjs" | "react" | "gatsby";
	layout?: string;
	sections?: IPageSection[];
	seo?: ISeoOptions;
	authentication?: boolean;
	staticGeneration?: boolean;
	serverSideRendering?: boolean;
}

/**
 * Layout generation options
 */
export interface ILayoutGenerationOptions extends IBaseGenerationOptions {
	type: "base" | "dashboard" | "auth" | "landing";
	hasHeader?: boolean;
	hasFooter?: boolean;
	hasSidebar?: boolean;
	hasNavigation?: boolean;
	responsive?: boolean;
	theme?: boolean;
}

/**
 * API generation options
 */
export interface IApiGenerationOptions extends IBaseGenerationOptions {
	framework: "nextjs" | "express" | "fastify" | "nestjs";
	methods: ("GET" | "POST" | "PUT" | "DELETE" | "PATCH")[];
	authentication?: boolean;
	validation?: boolean;
	database?: boolean;
	rateLimit?: boolean;
	caching?: boolean;
}

/**
 * Test generation options
 */
export interface ITestGenerationOptions extends IBaseGenerationOptions {
	testType: "unit" | "integration" | "e2e";
	framework: "jest" | "vitest" | "playwright" | "cypress";
	targetFile: string;
	coverage?: boolean;
	accessibility?: boolean;
}

/**
 * Story generation options
 */
export interface IStoryGenerationOptions extends IBaseGenerationOptions {
	componentName: string;
	componentPath: string;
	variants?: string[];
	interactions?: boolean;
	accessibility?: boolean;
	responsive?: boolean;
	darkMode?: boolean;
}

/**
 * Generation result interface
 */
export interface IGenerationResult {
	success: boolean;
	files: IGeneratedFile[];
	errors: string[];
	warnings: string[];
	metrics: IGenerationMetrics;
}

/**
 * Generated file interface
 */
export interface IGeneratedFile {
	path: string;
	content: string;
	size: number;
	type: "component" | "test" | "story" | "config" | "type" | "style";
	language: "typescript" | "javascript" | "css" | "scss" | "json" | "markdown";
}

/**
 * Generation metrics interface
 */
export interface IGenerationMetrics {
	duration: number;
	filesGenerated: number;
	linesOfCode: number;
	complexity: number;
	coverage?: number;
}

// === Validation Interfaces ===

/**
 * Validator interface - validates code and configurations
 */
export interface IValidator extends IBaseService {
	validate(input: IValidationInput): Promise<IValidationResult>;
	autofix(result: IValidationResult): Promise<IAutofixResult>;
	getSupportedRules(): string[];
	setRules(rules: IValidationRule[]): void;
}

/**
 * Validation input interface
 */
export interface IValidationInput {
	files: Map<string, string>;
	rules?: string[];
	context?: Record<string, any>;
	options?: IValidationOptions;
}

/**
 * Validation result interface
 */
export interface IValidationResult {
	isValid: boolean;
	issues: IValidationIssue[];
	metrics: IValidationMetrics;
	suggestions: string[];
}

/**
 * Validation issue interface
 */
export interface IValidationIssue {
	file: string;
	line: number;
	column: number;
	rule: string;
	message: string;
	severity: "error" | "warning" | "info";
	fixable: boolean;
	suggestion?: string;
}

/**
 * Validation metrics interface
 */
export interface IValidationMetrics {
	totalFiles: number;
	totalIssues: number;
	errorCount: number;
	warningCount: number;
	infoCount: number;
	duration: number;
}

/**
 * Validation rule interface
 */
export interface IValidationRule {
	name: string;
	description: string;
	category: string;
	severity: "error" | "warning" | "info";
	enabled: boolean;
	options?: Record<string, any>;
}

/**
 * Validation options interface
 */
export interface IValidationOptions {
	skipFiles?: string[];
	includeTests?: boolean;
	includeStories?: boolean;
	maxErrors?: number;
	parallel?: boolean;
}

/**
 * Autofix result interface
 */
export interface IAutofixResult {
	success: boolean;
	fixedFiles: Map<string, string>;
	unfixableIssues: IValidationIssue[];
	metrics: IAutofixMetrics;
}

/**
 * Autofix metrics interface
 */
export interface IAutofixMetrics {
	duration: number;
	issuesFixed: number;
	filesModified: number;
}

// === Template Interfaces ===

/**
 * Template engine interface - processes templates
 */
export interface ITemplateEngine extends IBaseService {
	render(templateName: string, context: Record<string, any>): Promise<string>;
	registerTemplate(name: string, content: string): void;
	registerHelper(name: string, helper: Function): void;
	registerPartial(name: string, content: string): void;
	compile(template: string): ICompiledTemplate;
}

/**
 * Compiled template interface
 */
export interface ICompiledTemplate {
	render(context: Record<string, any>): string;
	dependencies: string[];
	metadata: ITemplateMetadata;
}

/**
 * Template metadata interface
 */
export interface ITemplateMetadata {
	name: string;
	description: string;
	category: string;
	tags: string[];
	requiredContext: string[];
	optionalContext: string[];
	dependencies: string[];
	platform: string[];
	version: string;
	author: string;
}

/**
 * Template registry interface - manages template collections
 */
export interface ITemplateRegistry extends IBaseService {
	register(template: ITemplate): Promise<void>;
	unregister(name: string): boolean;
	get(name: string): ITemplate | undefined;
	search(criteria: ITemplateSearchCriteria): ITemplate[];
	getCategories(): string[];
	getStatistics(): ITemplateStatistics;
}

/**
 * Template interface
 */
export interface ITemplate {
	name: string;
	path: string;
	content: string;
	metadata: ITemplateMetadata;
	lastModified: Date;
	size: number;
	isActive: boolean;
}

/**
 * Template search criteria interface
 */
export interface ITemplateSearchCriteria {
	category?: string;
	tags?: string[];
	platform?: string;
	author?: string;
	namePattern?: string;
	sortBy?: "name" | "category" | "lastModified" | "size";
	sortOrder?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

/**
 * Template statistics interface
 */
export interface ITemplateStatistics {
	totalTemplates: number;
	totalCategories: number;
	categoryCounts: Record<string, number>;
	platformCounts: Record<string, number>;
	averageSize: number;
	totalSize: number;
}

// === Migration Interfaces ===

/**
 * Migration service interface - handles code migration between platforms
 */
export interface IMigrationService extends IBaseService {
	migrate(options: IMigrationOptions): Promise<IMigrationResult>;
	getSupportedPlatforms(): string[];
	analyzeProject(path: string): Promise<IProjectAnalysis>;
	generateMigrationPlan(
		analysis: IProjectAnalysis,
		targetPlatform: string,
	): IMigrationPlan;
}

/**
 * Migration options interface
 */
export interface IMigrationOptions {
	sourcePath: string;
	targetPath: string;
	sourcePlatform: string;
	targetPlatform: string;
	preserveStructure?: boolean;
	updateImports?: boolean;
	convertStyles?: boolean;
	generateTests?: boolean;
	dryRun?: boolean;
}

/**
 * Migration result interface
 */
export interface IMigrationResult {
	success: boolean;
	migratedFiles: IGeneratedFile[];
	skippedFiles: string[];
	errors: string[];
	warnings: string[];
	metrics: IMigrationMetrics;
}

/**
 * Migration metrics interface
 */
export interface IMigrationMetrics {
	duration: number;
	totalFiles: number;
	migratedFiles: number;
	skippedFiles: number;
	linesOfCode: number;
	compatibilityScore: number;
}

/**
 * Project analysis interface
 */
export interface IProjectAnalysis {
	platform: string;
	framework: string;
	version: string;
	structure: IProjectStructure;
	dependencies: IDependencyAnalysis;
	codeMetrics: ICodeMetrics;
	compatibility: ICompatibilityAnalysis;
}

/**
 * Project structure interface
 */
export interface IProjectStructure {
	rootPath: string;
	sourceFiles: string[];
	testFiles: string[];
	configFiles: string[];
	assetFiles: string[];
	directories: string[];
}

/**
 * Dependency analysis interface
 */
export interface IDependencyAnalysis {
	dependencies: IDependency[];
	devDependencies: IDependency[];
	peerDependencies: IDependency[];
	conflicts: string[];
	outdated: string[];
}

/**
 * Dependency interface
 */
export interface IDependency {
	name: string;
	version: string;
	type: "production" | "development" | "peer";
	compatible: boolean;
	alternative?: string;
}

/**
 * Code metrics interface
 */
export interface ICodeMetrics {
	totalLines: number;
	codeLines: number;
	commentLines: number;
	complexity: number;
	maintainabilityIndex: number;
	testCoverage?: number;
}

/**
 * Compatibility analysis interface
 */
export interface ICompatibilityAnalysis {
	score: number;
	issues: ICompatibilityIssue[];
	recommendations: string[];
}

/**
 * Compatibility issue interface
 */
export interface ICompatibilityIssue {
	type: "breaking" | "deprecated" | "warning";
	component: string;
	message: string;
	solution?: string;
	impact: "high" | "medium" | "low";
}

/**
 * Migration plan interface
 */
export interface IMigrationPlan {
	steps: IMigrationStep[];
	estimatedDuration: number;
	complexity: "low" | "medium" | "high";
	risks: string[];
	recommendations: string[];
}

/**
 * Migration step interface
 */
export interface IMigrationStep {
	id: string;
	name: string;
	description: string;
	type: "file" | "dependency" | "config" | "test";
	files: string[];
	actions: string[];
	dependencies: string[];
	estimated: number;
}

// === Localization Interfaces ===

/**
 * Localization service interface - handles internationalization
 */
export interface ILocalizationService extends IBaseService {
	translate(
		key: string,
		locale: LocaleCode,
		params?: Record<string, any>,
	): string;
	hasTranslation(key: string, locale: LocaleCode): boolean;
	loadTranslations(
		locale: LocaleCode,
		translations: Record<string, string>,
	): void;
	getSupportedLocales(): LocaleCode[];
	detectLocale(request?: any): LocaleCode;
	formatNumber(
		value: number,
		locale: LocaleCode,
		options?: Intl.NumberFormatOptions,
	): string;
	formatDate(
		date: Date,
		locale: LocaleCode,
		options?: Intl.DateTimeFormatOptions,
	): string;
	formatCurrency(amount: number, currency: string, locale: LocaleCode): string;
}

// === Common Supporting Interfaces ===

/**
 * Component prop interface
 */
export interface IComponentProp {
	name: string;
	type: string;
	required: boolean;
	defaultValue?: string;
	description?: string;
	enumValues?: string[];
}

/**
 * Page section interface
 */
export interface IPageSection {
	name: string;
	title?: string;
	components: string[];
	props?: Record<string, any>;
}

/**
 * SEO options interface
 */
export interface ISeoOptions {
	title?: string;
	description?: string;
	keywords?: string;
	ogImage?: string;
	canonical?: string;
}

/**
 * Accessibility options interface
 */
export interface IAccessibilityOptions {
	ariaSupport: boolean;
	keyboardNavigation: boolean;
	role?: string;
	announcements?: boolean;
}

/**
 * Styling options interface
 */
export interface IStylingOptions {
	tokenBased: boolean;
	tokens?: IDesignToken[];
	responsive?: boolean;
	darkMode?: boolean;
}

/**
 * Design token interface
 */
export interface IDesignToken {
	property: string;
	tokenPath: string;
	value?: any;
}

// === Factory Interfaces - Abstract Factory Pattern ===

/**
 * Service factory interface - creates service instances
 */
export interface IServiceFactory {
	createConfigurationService(): IConfigurationService;
	createLoggingService(): ILoggingService;
	createFileSystemService(): IFileSystemService;
	createCodeGenerator(): ICodeGenerator;
	createValidator(): IValidator;
	createTemplateEngine(): ITemplateEngine;
	createTemplateRegistry(): ITemplateRegistry;
	createMigrationService(): IMigrationService;
	createLocalizationService(): ILocalizationService;
}

/**
 * Generator factory interface - creates generator instances
 */
export interface IGeneratorFactory {
	createComponentGenerator(): ICodeGenerator;
	createPageGenerator(): ICodeGenerator;
	createLayoutGenerator(): ICodeGenerator;
	createApiGenerator(): ICodeGenerator;
	createTestGenerator(): ICodeGenerator;
	createStoryGenerator(): ICodeGenerator;
}

/**
 * Validator factory interface - creates validator instances
 */
export interface IValidatorFactory {
	createSchemaValidator(): IValidator;
	createCodeStyleValidator(): IValidator;
	createSOLIDValidator(): IValidator;
	createAccessibilityValidator(): IValidator;
	createSecurityValidator(): IValidator;
	createPerformanceValidator(): IValidator;
	createNorwegianComplianceValidator(): IValidator;
}

// === Observer Pattern Interfaces ===

/**
 * Event emitter interface - publishes events
 */
export interface IEventEmitter {
	emit(event: string, data?: any): void;
	on(event: string, handler: (data?: any) => void): () => void;
	off(event: string, handler: (data?: any) => void): void;
	once(event: string, handler: (data?: any) => void): () => void;
}

/**
 * Event listener interface - subscribes to events
 */
export interface IEventListener {
	handleEvent(event: string, data?: any): void;
	getSupportedEvents(): string[];
}

/**
 * Progress reporter interface - reports operation progress
 */
export interface IProgressReporter {
	start(total: number, message?: string): void;
	update(current: number, message?: string): void;
	complete(message?: string): void;
	error(error: Error): void;
}

// === Strategy Pattern Interfaces ===

/**
 * Code formatter strategy interface
 */
export interface ICodeFormatterStrategy {
	format(code: string, options?: any): string;
	getSupportedLanguages(): string[];
}

/**
 * File resolver strategy interface
 */
export interface IFileResolverStrategy {
	resolve(path: string, context?: any): Promise<string>;
	canResolve(path: string): boolean;
}

/**
 * Content transformer strategy interface
 */
export interface IContentTransformerStrategy {
	transform(content: string, options?: any): Promise<string>;
	getSupportedFormats(): string[];
}

export {
	// Re-export types for convenience
	type LocaleCode,
	type NorwegianCompliance,
};
