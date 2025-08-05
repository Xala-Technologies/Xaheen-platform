/**
 * @fileoverview TypeScript interfaces for Interactive Full-Stack Tech Builder
 * @description Comprehensive type definitions for the interactive project builder
 */

// Core project configuration interfaces
export interface ProjectType {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly icon: string;
	readonly color: string;
	readonly relevantCategories: readonly string[];
	readonly defaultSelections: Record<string, string | readonly string[]>;
	readonly sort_order: number;
}

export interface QuickPreset {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly projectType: string;
	readonly stack: StackConfiguration;
	readonly sort_order: number;
}

export interface TechCategory {
	readonly id: string;
	readonly sort_order: number;
}

export interface TechOption {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly icon: string;
	readonly color: string;
	readonly default: boolean;
	readonly sort_order: number;
}

export interface TechCompatibility {
	readonly supportedOrms?: readonly string[];
	readonly supportedDatabases?: readonly string[];
	readonly supportedAuth?: readonly string[];
	readonly supportedRuntimes?: readonly string[];
	readonly incompatibleWith?: readonly string[];
	readonly requiredWith?: readonly string[];
}

// Stack configuration interfaces
export interface StackConfiguration {
	readonly projectName: string;
	readonly webFrontend: readonly string[] | string;
	readonly nativeFrontend: readonly string[] | string;
	readonly backend: string;
	readonly database: string;
	readonly orm: string;
	readonly auth: string;
	readonly runtime: string;
	readonly packageManager: string;
	readonly uiSystem: string;
	readonly api: string;
	readonly webDeploy?: string;
	readonly mobileDeploy?: string;
	readonly apiDeploy?: string;
	readonly analytics?: string;
	readonly monitoring?: string;
	readonly notifications?: string;
	readonly documents?: string;
	readonly payments?: string;
	readonly messaging?: string;
	readonly search?: string;
	readonly caching?: string;
	readonly backgroundJobs?: string;
	readonly cms?: string;
	readonly security?: readonly string[];
	readonly compliance?: readonly string[] | string;
	readonly locales?: readonly string[];
	readonly primaryLocale?: string;
	readonly saasAdmin?: string;
	readonly subscriptions?: string;
	readonly licensing?: string;
	readonly rbac?: string;
	readonly multiTenancy?: readonly string[];
	readonly testing?: readonly string[];
	readonly devops?: readonly string[];
	readonly i18n?: string;
	readonly addons: readonly string[];
	readonly examples: readonly string[];
	readonly git: string | boolean;
	readonly install: string | boolean;
	readonly audit?: boolean;
	readonly encryption?: boolean;
	readonly mfa?: boolean;
}

// Builder state and UI interfaces
export interface BuilderState {
	readonly selectedProjectType: ProjectType | null;
	readonly selectedPreset: QuickPreset | null;
	readonly currentStack: Partial<StackConfiguration>;
	readonly completedCategories: readonly string[];
	readonly currentCategory: string | null;
	readonly validationErrors: readonly ValidationError[];
	readonly isValid: boolean;
}

export interface ValidationError {
	readonly category: string;
	readonly field: string;
	readonly message: string;
	readonly severity: "error" | "warning" | "info";
}

// Interactive prompt interfaces
export interface CategoryPrompt {
	readonly category: string;
	readonly displayName: string;
	readonly description: string;
	readonly options: readonly TechOption[];
	readonly allowMultiple: boolean;
	readonly required: boolean;
	readonly defaultValue?: string | readonly string[];
}

export interface PromptChoice {
	readonly name: string;
	readonly value: string;
	readonly description?: string;
	readonly disabled?: boolean | string;
	readonly short?: string;
}

export interface InteractivePromptResult {
	readonly category: string;
	readonly selection: string | readonly string[];
	readonly skipped: boolean;
}

// Bundle and generator interfaces
export interface TechBundle {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly category: "starter" | "professional" | "enterprise" | "custom";
	readonly price?: number;
	readonly features: readonly string[];
	readonly stack: StackConfiguration;
	readonly requirements: readonly string[];
	readonly conflicts: readonly string[];
}

export interface GeneratorContext {
	readonly projectType: ProjectType;
	readonly stack: StackConfiguration;
	readonly targetPath: string;
	readonly templateOverrides?: Record<string, any>;
	readonly skipValidation?: boolean;
	readonly dryRun?: boolean;
}

export interface GenerationResult {
	readonly success: boolean;
	readonly generatedFiles: readonly string[];
	readonly skippedFiles: readonly string[];
	readonly errors: readonly string[];
	readonly warnings: readonly string[];
	readonly executionTime: number;
}

// Configuration loaders
export interface ConfigurationData {
	readonly projectTypes: readonly ProjectType[];
	readonly quickPresets: readonly QuickPreset[];
	readonly techCategories: readonly TechCategory[];
	readonly techOptions: Record<string, readonly TechOption[]>;
	readonly techCompatibility: Record<string, Record<string, TechCompatibility>>;
	readonly defaultStack: StackConfiguration;
}

// CLI command options
export interface BuilderCommandOptions {
	readonly interactive?: boolean;
	readonly preset?: string;
	readonly projectType?: string;
	readonly output?: string;
	readonly skipValidation?: boolean;
	readonly dryRun?: boolean;
	readonly verbose?: boolean;
	readonly force?: boolean;
	readonly template?: string;
	readonly theme?: string;
}

export interface PresetGeneratorOptions extends BuilderCommandOptions {
	readonly presetId: string;
	readonly projectName?: string;
	readonly customizations?: Record<string, any>;
}

export interface BundleGeneratorOptions extends BuilderCommandOptions {
	readonly bundleId: string;
	readonly features?: readonly string[];
	readonly skipOptional?: boolean;
}

// Validation and compatibility checking
export interface CompatibilityChecker {
	validateStack(stack: Partial<StackConfiguration>): readonly ValidationError[];
	checkCompatibility(
		category: string,
		selection: string,
		currentStack: Partial<StackConfiguration>,
	): boolean;
	getAvailableOptions(
		category: string,
		currentStack: Partial<StackConfiguration>,
	): readonly TechOption[];
	suggestAlternatives(
		category: string,
		incompatibleOption: string,
		currentStack: Partial<StackConfiguration>,
	): readonly TechOption[];
}

// Live preview and validation
export interface PreviewContext {
	readonly stack: StackConfiguration;
	readonly projectStructure: readonly string[];
	readonly dependencies: Record<string, string>;
	readonly scripts: Record<string, string>;
	readonly configFiles: readonly string[];
}

export interface LivePreview {
	generatePreview(stack: StackConfiguration): Promise<PreviewContext>;
	validateConfiguration(
		stack: StackConfiguration,
	): Promise<readonly ValidationError[]>;
	estimateGenerationTime(stack: StackConfiguration): number;
	calculateComplexity(
		stack: StackConfiguration,
	): "simple" | "moderate" | "complex";
}

// Auto-completion and suggestions
export interface AutoCompletionProvider {
	getProjectNameSuggestions(projectType: string): readonly string[];
	getDependencyVersions(packageName: string): Promise<readonly string[]>;
	getThemeSuggestions(industry?: string): readonly string[];
	getComplianceSuggestions(projectType: string): readonly string[];
}

// Export utility types
export type CategoryId = string;
export type TechOptionId = string;
export type ProjectTypeId = string;
export type PresetId = string;
export type BundleId = string;

// Builder error types
export class BuilderError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly category?: string,
	) {
		super(message);
		this.name = "BuilderError";
	}
}

export class ValidationError extends BuilderError {
	constructor(message: string, category: string, field: string) {
		super(message, "VALIDATION_ERROR", category);
		this.field = field;
	}

	public readonly field: string;
}

export class CompatibilityError extends BuilderError {
	constructor(
		message: string,
		public readonly conflictingOptions: readonly string[],
	) {
		super(message, "COMPATIBILITY_ERROR");
	}
}

// Type guards
export function isProjectType(obj: any): obj is ProjectType {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.id === "string" &&
		typeof obj.name === "string" &&
		typeof obj.description === "string" &&
		Array.isArray(obj.relevantCategories) &&
		typeof obj.sort_order === "number"
	);
}

export function isQuickPreset(obj: any): obj is QuickPreset {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.id === "string" &&
		typeof obj.name === "string" &&
		typeof obj.projectType === "string" &&
		typeof obj.stack === "object" &&
		typeof obj.sort_order === "number"
	);
}

export function isValidStackConfiguration(obj: any): obj is StackConfiguration {
	return (
		typeof obj === "object" &&
		obj !== null &&
		typeof obj.projectName === "string" &&
		typeof obj.packageManager === "string" &&
		Array.isArray(obj.addons) &&
		Array.isArray(obj.examples)
	);
}
