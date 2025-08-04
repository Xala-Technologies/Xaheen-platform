/**
 * Base TypeScript Interfaces for Component Specifications
 * Generated from JSON Schema with strict TypeScript compliance
 * Supports Norwegian NSM compliance and multi-platform architecture
 */

// ===== NORWEGIAN COMPLIANCE TYPES =====

/**
 * Norwegian Security Model (NSM) classification levels
 * @see https://www.nsm.no/
 */
export type NSMClassification =
	| "OPEN" // Public information
	| "RESTRICTED" // Limited distribution
	| "CONFIDENTIAL" // Sensitive information
	| "SECRET"; // Highly classified

/**
 * Norwegian compliance metadata
 */
export interface NorwegianCompliance {
	readonly nsmClassification: NSMClassification;
	readonly gdprCompliant: boolean;
	readonly designSystem: {
		readonly altinnCompliant?: boolean;
		readonly governmentApproved?: boolean;
	};
	readonly auditTrail?: boolean;
}

/**
 * Norwegian localization support
 */
export interface NorwegianI18n {
	readonly supported: boolean;
	readonly defaultLocale: "nb-NO" | "nn-NO" | "en-US";
	readonly supportedLocales: readonly string[];
	readonly textDirection: readonly ("ltr" | "rtl")[];
}

// ===== COMPONENT METADATA TYPES =====

/**
 * Component stability levels
 */
export type ComponentStability =
	| "experimental"
	| "beta"
	| "stable"
	| "deprecated";

/**
 * Component categories in v5.0 architecture
 */
export type ComponentCategory =
	| "basic"
	| "composite"
	| "layout"
	| "navigation"
	| "feedback"
	| "overlay"
	| "form"
	| "data-display"
	| "specialized";

/**
 * Semantic version for Xala architecture
 */
export type SemanticVersion = "v5.0" | "v5.1" | "v5.2";

/**
 * Component maintainer information
 */
export interface ComponentMaintainer {
	readonly name: string;
	readonly email: string;
	readonly team?: string;
}

/**
 * Component metadata specification
 */
export interface ComponentMetadata {
	readonly name: string; // PascalCase component name
	readonly version: string; // Semantic version
	readonly semanticVersion: SemanticVersion;
	readonly category: ComponentCategory;
	readonly subcategory?: string;
	readonly description: string; // 10-500 characters
	readonly keywords?: readonly string[];
	readonly maintainer?: ComponentMaintainer;
	readonly stability: ComponentStability;
	readonly createdAt?: string; // ISO date string
	readonly updatedAt?: string; // ISO date string
}

// ===== PROP TYPE SYSTEM =====

/**
 * Primitive TypeScript types
 */
export type PrimitiveType =
	| "string"
	| "number"
	| "boolean"
	| "null"
	| "undefined";

/**
 * Complex TypeScript types
 */
export type ComplexType =
	| "function"
	| "node"
	| "element"
	| "component"
	| "ref"
	| "date"
	| "file";

/**
 * Custom semantic types
 */
export type CustomType =
	| "color"
	| "size"
	| "spacing"
	| "breakpoint"
	| "theme"
	| "variant"
	| "icon"
	| "url"
	| "email"
	| "phone"
	| "currency"
	| "percentage"
	| "duration"
	| "cssClass"
	| "cssProperty"
	| "keyboardKey"
	| "locale"
	| "timezone";

/**
 * String validation constraints
 */
export interface StringConstraints {
	readonly minLength?: number;
	readonly maxLength?: number;
	readonly pattern?: string; // Regex pattern
	readonly format?:
		| "email"
		| "uri"
		| "uuid"
		| "date"
		| "time"
		| "datetime"
		| "hostname"
		| "ipv4"
		| "ipv6";
	readonly enum?: readonly string[];
}

/**
 * Number validation constraints
 */
export interface NumberConstraints {
	readonly minimum?: number;
	readonly maximum?: number;
	readonly exclusiveMinimum?: number;
	readonly exclusiveMaximum?: number;
	readonly multipleOf?: number;
	readonly integer?: boolean;
	readonly positive?: boolean;
	readonly enum?: readonly number[];
}

/**
 * Function signature definition
 */
export interface FunctionSignature {
	readonly parameters: readonly {
		readonly name: string;
		readonly type: string;
		readonly required: boolean;
	}[];
	readonly returnType: string;
}

/**
 * Element constraints for React nodes
 */
export interface ElementConstraints {
	readonly allowedElements?: readonly string[];
	readonly forbiddenElements?: readonly string[];
}

/**
 * Primitive type definition
 */
export interface PrimitiveTypeDefinition {
	readonly primitive: PrimitiveType;
	readonly constraints?: StringConstraints | NumberConstraints;
}

/**
 * Complex type definition
 */
export interface ComplexTypeDefinition {
	readonly complex: ComplexType;
	readonly signature?: FunctionSignature;
	readonly elementConstraints?: ElementConstraints;
}

/**
 * Custom type definition
 */
export interface CustomTypeDefinition {
	readonly custom: CustomType;
	readonly format?: string;
	readonly values?: readonly unknown[];
	readonly pattern?: string;
}

/**
 * Union type definition
 */
export interface UnionTypeDefinition {
	readonly union: readonly (
		| PrimitiveTypeDefinition
		| ComplexTypeDefinition
		| CustomTypeDefinition
	)[];
	readonly discriminant?: string;
}

/**
 * Array type definition
 */
export interface ArrayTypeDefinition {
	readonly array:
		| PrimitiveTypeDefinition
		| ComplexTypeDefinition
		| CustomTypeDefinition
		| ObjectTypeDefinition;
	readonly constraints?: {
		readonly minItems?: number;
		readonly maxItems?: number;
		readonly uniqueItems?: boolean;
	};
}

/**
 * Object type definition
 */
export interface ObjectTypeDefinition {
	readonly object: Record<string, PropDefinition>;
	readonly strict?: boolean;
}

/**
 * Type definition union
 */
export type TypeDefinition =
	| PrimitiveTypeDefinition
	| ComplexTypeDefinition
	| CustomTypeDefinition
	| UnionTypeDefinition
	| ArrayTypeDefinition
	| ObjectTypeDefinition;

// ===== VALIDATION SYSTEM =====

/**
 * Validation rule types
 */
export type ValidationRuleType =
	| "required"
	| "minLength"
	| "maxLength"
	| "pattern"
	| "email"
	| "url"
	| "min"
	| "max"
	| "integer"
	| "positive"
	| "custom";

/**
 * Individual validation rule
 */
export interface ValidationRule {
	readonly type: ValidationRuleType;
	readonly value?: unknown;
	readonly message?: string;
	readonly severity?: "error" | "warning";
	readonly customValidator?: string;
}

/**
 * Dependency validation rule
 */
export interface DependencyValidation {
	readonly prop: string;
	readonly condition: string;
	readonly rules: readonly string[];
}

/**
 * Cross-validation rule
 */
export interface CrossValidation {
	readonly props: readonly string[];
	readonly validator: string;
	readonly message?: string;
}

/**
 * Complete validation configuration
 */
export interface ValidationRules {
	readonly rules?: readonly ValidationRule[];
	readonly dependencies?: readonly DependencyValidation[];
	readonly crossValidation?: readonly CrossValidation[];
}

// ===== PLATFORM-SPECIFIC TYPES =====

/**
 * Supported platforms
 */
export type SupportedPlatform =
	| "react"
	| "vue"
	| "angular"
	| "svelte"
	| "solid"
	| "web-components";

/**
 * Platform-specific prop configuration
 */
export interface PlatformPropConfig {
	readonly type?: string;
	readonly defaultValue?: unknown;
	readonly binding?: string;
	readonly transformer?: string;
}

/**
 * Platform-specific configurations
 */
export type PlatformConfigs = Partial<
	Record<SupportedPlatform, PlatformPropConfig>
>;

// ===== ACCESSIBILITY TYPES =====

/**
 * Accessibility metadata for props
 */
export interface AccessibilityMetadata {
	readonly ariaAttribute?: string;
	readonly screenReaderText?: string;
	readonly keyboardInteraction?: boolean;
}

/**
 * Internationalization metadata
 */
export interface I18nMetadata {
	readonly translatable?: boolean;
	readonly key?: string;
	readonly context?: string;
}

/**
 * Prop usage examples
 */
export interface PropExample {
	readonly value: unknown;
	readonly description?: string;
	readonly context?: string;
}

/**
 * Prop deprecation information
 */
export interface PropDeprecation {
	readonly since: string;
	readonly reason: string;
	readonly alternative: string;
}

// ===== CORE PROP DEFINITION =====

/**
 * Complete prop definition
 */
export interface PropDefinition {
	readonly type: TypeDefinition;
	readonly description: string; // Minimum 5 characters
	readonly required?: boolean;
	readonly defaultValue?: unknown;
	readonly deprecated?: PropDeprecation;
	readonly validation?: ValidationRules;
	readonly platforms?: PlatformConfigs;
	readonly examples?: readonly PropExample[];
	readonly accessibility?: AccessibilityMetadata;
	readonly i18n?: I18nMetadata;
}

/**
 * Prop groupings
 */
export interface PropGroups {
	readonly required: readonly string[];
	readonly optional: readonly string[];
	readonly deprecated: readonly {
		readonly name: string;
		readonly reason: string;
		readonly alternative: string;
	}[];
}

/**
 * Children composition rules
 */
export interface ChildrenComposition {
	readonly supported: boolean;
	readonly types?: readonly (
		| "string"
		| "number"
		| "element"
		| "node"
		| "function"
	)[];
	readonly constraints?: {
		readonly maxChildren?: number;
		readonly allowedComponents?: readonly string[];
	};
}

/**
 * Slot definition for component composition
 */
export interface SlotDefinition {
	readonly required: boolean;
	readonly types: readonly string[];
	readonly description: string;
}

/**
 * Component composition rules
 */
export interface ComponentComposition {
	readonly children?: ChildrenComposition;
	readonly slots?: Record<string, SlotDefinition>;
}

/**
 * Props specification
 */
export interface PropsSpecification {
	readonly schema: Record<string, PropDefinition>;
	readonly groups: PropGroups;
	readonly composition?: ComponentComposition;
}

// ===== VARIANT SYSTEM =====

/**
 * Simple variant definition
 */
export interface SimpleVariant {
	readonly values: Record<string, string>; // value -> CSS classes
	readonly defaultValue: string;
}

/**
 * Compound variant condition
 */
export interface CompoundVariantCondition {
	readonly conditions: Record<string, unknown>;
	readonly className: string;
	readonly description?: string;
}

/**
 * Variant definitions
 */
export interface VariantDefinitions {
	readonly simple?: Record<string, SimpleVariant>;
	readonly compound?: readonly CompoundVariantCondition[];
}

// ===== ACCESSIBILITY SYSTEM =====

/**
 * ARIA role configuration
 */
export interface AriaRoleConfig {
	readonly primary: string;
	readonly additional?: readonly string[];
}

/**
 * Keyboard navigation pattern
 */
export interface KeyboardPattern {
	readonly key: string;
	readonly action: string;
	readonly context?: string;
}

/**
 * Focus management configuration
 */
export interface FocusManagement {
	readonly trapFocus?: boolean;
	readonly restoreFocus?: boolean;
	readonly skipLinks?: boolean;
}

/**
 * Keyboard navigation specification
 */
export interface KeyboardNavigation {
	readonly supported: boolean;
	readonly patterns: readonly KeyboardPattern[];
	readonly focusManagement?: FocusManagement;
}

/**
 * Screen reader announcement
 */
export interface ScreenReaderAnnouncement {
	readonly trigger: string;
	readonly message: string;
	readonly priority: "polite" | "assertive";
}

/**
 * Screen reader labels
 */
export interface ScreenReaderLabels {
	readonly required: readonly string[];
	readonly descriptions?: Record<string, string>;
}

/**
 * Screen reader configuration
 */
export interface ScreenReaderConfig {
	readonly announcements: readonly ScreenReaderAnnouncement[];
	readonly labels: ScreenReaderLabels;
}

/**
 * Accessibility testing configuration
 */
export interface AccessibilityTesting {
	readonly automated?: readonly string[];
	readonly manual?: readonly string[];
}

/**
 * Complete accessibility specification
 */
export interface AccessibilitySpecification {
	readonly role: AriaRoleConfig;
	readonly keyboardNavigation: KeyboardNavigation;
	readonly screenReader: ScreenReaderConfig;
	readonly testing?: AccessibilityTesting;
}

// ===== COMPLIANCE SYSTEM =====

/**
 * Semantic HTML compliance
 */
export interface SemanticCompliance {
	readonly htmlElements: readonly string[];
	readonly ariaRoles: readonly string[];
	readonly landmarks: boolean;
	readonly headingStructure?: boolean;
}

/**
 * WCAG compliance configuration
 */
export interface WCAGCompliance {
	readonly level: "A" | "AA" | "AAA";
	readonly tested: boolean;
	readonly guidelines: readonly string[];
	readonly colorContrast?: {
		readonly normal?: number; // >= 4.5
		readonly large?: number; // >= 3.0
		readonly enhanced?: number; // >= 7.0
	};
}

/**
 * Server-side rendering compliance
 */
export interface SSRCompliance {
	readonly supported: boolean;
	readonly hydrationSafe: boolean;
	readonly staticGeneration?: boolean;
}

/**
 * Complete compliance specification
 */
export interface ComplianceSpecification {
	readonly i18n: NorwegianI18n;
	readonly semantic: SemanticCompliance;
	readonly wcag: WCAGCompliance;
	readonly ssr: SSRCompliance;
	readonly norwegian: NorwegianCompliance;
}

// ===== PLATFORM IMPLEMENTATIONS =====

/**
 * Code example definition
 */
export interface CodeExample {
	readonly code: string;
	readonly language: string;
	readonly description?: string;
}

/**
 * Platform implementation details
 */
export interface PlatformImplementation {
	readonly templatePath?: string;
	readonly dependencies?: readonly string[];
	readonly imports?: readonly {
		readonly module: string;
		readonly imports: readonly string[];
	}[];
	readonly examples?: readonly CodeExample[];
}

/**
 * Platform support specification
 */
export interface PlatformSupport {
	readonly supported: readonly SupportedPlatform[];
	readonly primary?: SupportedPlatform;
	readonly implementations?: Partial<
		Record<SupportedPlatform, PlatformImplementation>
	>;
}

// ===== EXAMPLES AND TESTING =====

/**
 * Component usage example
 */
export interface ComponentExample {
	readonly name: string;
	readonly description: string;
	readonly category?: "basic" | "advanced" | "playground" | "real-world";
	readonly code: Partial<Record<SupportedPlatform, string>>;
	readonly props?: Record<string, unknown>;
	readonly notes?: string;
}

/**
 * Unit testing configuration
 */
export interface UnitTestConfig {
	readonly required?: readonly string[];
	readonly coverage?: {
		readonly minimum: number; // Default 95
	};
}

/**
 * Integration testing configuration
 */
export interface IntegrationTestConfig {
	readonly scenarios?: readonly string[];
}

/**
 * Visual testing configuration
 */
export interface VisualTestConfig {
	readonly regression?: boolean;
	readonly responsive?: boolean;
}

/**
 * Testing specification
 */
export interface TestingSpecification {
	readonly unit?: UnitTestConfig;
	readonly integration?: IntegrationTestConfig;
	readonly visual?: VisualTestConfig;
}

// ===== AI AND OPTIMIZATION =====

/**
 * AI optimization pattern
 */
export interface AIPattern {
	readonly pattern: string;
	readonly context: string;
	readonly recommendation: string;
}

/**
 * AI anti-pattern
 */
export interface AIAntiPattern {
	readonly pattern: string;
	readonly reason: string;
	readonly alternative: string;
}

/**
 * AI optimization hints
 */
export interface AIOptimization {
	readonly hints?: readonly string[];
	readonly patterns?: readonly AIPattern[];
	readonly antiPatterns?: readonly AIAntiPattern[];
}

/**
 * AI generation metadata
 */
export interface AIGeneration {
	readonly priority?: "high" | "medium" | "low";
	readonly complexity?: "simple" | "moderate" | "complex";
	readonly estimatedTokens?: number;
}

/**
 * AI documentation configuration
 */
export interface AIDocumentation {
	readonly autoGenerate?: boolean;
	readonly templates?: readonly string[];
}

/**
 * AI assistance specification
 */
export interface AISpecification {
	readonly optimization?: AIOptimization;
	readonly generation?: AIGeneration;
	readonly documentation?: AIDocumentation;
}

// ===== PERFORMANCE METRICS =====

/**
 * Bundle size metrics
 */
export interface BundleSizeMetrics {
	readonly max?: string;
	readonly gzipped?: string;
}

/**
 * Render time metrics
 */
export interface RenderTimeMetrics {
	readonly initial?: string;
	readonly update?: string;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
	readonly bundleSize?: BundleSizeMetrics;
	readonly renderTime?: RenderTimeMetrics;
}

/**
 * Performance specification
 */
export interface PerformanceSpecification {
	readonly metrics?: PerformanceMetrics;
	readonly optimizations?: readonly string[];
}

// ===== MAIN COMPONENT SPECIFICATION =====

/**
 * Complete component specification
 * This is the root interface that encompasses all aspects of a component
 */
export interface ComponentSpecification {
	readonly metadata: ComponentMetadata;
	readonly compliance: ComplianceSpecification;
	readonly props: PropsSpecification;
	readonly variants?: VariantDefinitions;
	readonly accessibility: AccessibilitySpecification;
	readonly platforms: PlatformSupport;
	readonly examples?: readonly ComponentExample[];
	readonly ai?: AISpecification;
	readonly testing?: TestingSpecification;
	readonly performance?: PerformanceSpecification;
}

// ===== TYPE GUARDS =====

/**
 * Type guard for primitive types
 */
export const isPrimitiveType = (
	type: TypeDefinition,
): type is PrimitiveTypeDefinition => {
	return "primitive" in type;
};

/**
 * Type guard for complex types
 */
export const isComplexType = (
	type: TypeDefinition,
): type is ComplexTypeDefinition => {
	return "complex" in type;
};

/**
 * Type guard for custom types
 */
export const isCustomType = (
	type: TypeDefinition,
): type is CustomTypeDefinition => {
	return "custom" in type;
};

/**
 * Type guard for union types
 */
export const isUnionType = (
	type: TypeDefinition,
): type is UnionTypeDefinition => {
	return "union" in type;
};

/**
 * Type guard for array types
 */
export const isArrayType = (
	type: TypeDefinition,
): type is ArrayTypeDefinition => {
	return "array" in type;
};

/**
 * Type guard for object types
 */
export const isObjectType = (
	type: TypeDefinition,
): type is ObjectTypeDefinition => {
	return "object" in type;
};
