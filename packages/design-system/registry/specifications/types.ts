/**
 * Universal Design System Specification Types
 * Type definitions for component specifications
 */

import { Platform } from '../core/component-specs';

// =============================================================================
// CORE SPECIFICATION TYPES
// =============================================================================

export interface ComponentSpecification {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: ComponentCategory;
  readonly platforms: PlatformSupport;
  readonly version: string;
  readonly status: SpecificationStatus;
  readonly metadata: SpecificationMetadata;
  readonly props: SpecificationProp[];
  readonly variants: SpecificationVariant[];
  readonly examples: SpecificationExample[];
  readonly compliance: SpecificationCompliance;
  readonly dependencies: SpecificationDependencies;
  readonly validation: SpecificationValidation;
}

export type ComponentCategory = 
  | 'core'
  | 'layout'
  | 'navigation'
  | 'data'
  | 'feedback'
  | 'media'
  | 'typography'
  | 'advanced'
  | 'utility';

export type SpecificationStatus = 
  | 'draft'
  | 'experimental'
  | 'stable'
  | 'deprecated'
  | 'legacy';

// =============================================================================
// PLATFORM SUPPORT
// =============================================================================

export interface PlatformSupport {
  readonly react: PlatformStatus;
  readonly vue: PlatformStatus;
  readonly angular: PlatformStatus;
  readonly svelte: PlatformStatus;
  readonly reactNative: PlatformStatus;
  readonly electron: PlatformStatus;
  readonly ionic: PlatformStatus;
  readonly headlessUI: PlatformStatus;
  readonly radixUI: PlatformStatus;
  readonly vanilla: PlatformStatus;
  readonly webComponents: PlatformStatus;
}

export interface PlatformStatus {
  readonly supported: boolean;
  readonly version: string;
  readonly notes?: string;
  readonly limitations?: string[];
  readonly features?: string[];
}

// =============================================================================
// SPECIFICATION METADATA
// =============================================================================

export interface SpecificationMetadata {
  readonly author: string;
  readonly created: string;
  readonly modified: string;
  readonly tags: string[];
  readonly keywords: string[];
  readonly designTokens: string[];
  readonly relatedComponents: string[];
  readonly changelog: ChangelogEntry[];
}

export interface ChangelogEntry {
  readonly version: string;
  readonly date: string;
  readonly changes: string[];
  readonly breaking?: boolean;
}

// =============================================================================
// PROPS SPECIFICATION
// =============================================================================

export interface SpecificationProp {
  readonly name: string;
  readonly type: PropType;
  readonly required: boolean;
  readonly defaultValue?: unknown;
  readonly description: string;
  readonly deprecated?: boolean;
  readonly experimental?: boolean;
  readonly platformSpecific?: Partial<Record<Platform, PropPlatformOverride>>;
  readonly validation?: PropValidation;
  readonly examples?: unknown[];
}

export interface PropType {
  readonly base: string;
  readonly generic?: string[];
  readonly union?: string[];
  readonly literal?: unknown[];
  readonly nullable?: boolean;
  readonly optional?: boolean;
}

export interface PropPlatformOverride {
  readonly type?: PropType;
  readonly name?: string;
  readonly implementation?: string;
}

export interface PropValidation {
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: string;
  readonly custom?: string;
  readonly message?: string;
}

// =============================================================================
// VARIANTS SPECIFICATION
// =============================================================================

export interface SpecificationVariant {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly props: Partial<Record<string, unknown>>;
  readonly visual: VariantVisual;
  readonly usage: VariantUsage;
  readonly accessibility?: VariantAccessibility;
}

export interface VariantVisual {
  readonly preview?: string;
  readonly screenshots?: string[];
  readonly designTokens: Record<string, string>;
}

export interface VariantUsage {
  readonly when: string;
  readonly avoid?: string;
  readonly prefer?: string;
  readonly examples: string[];
}

export interface VariantAccessibility {
  readonly considerations: string[];
  readonly aria?: Record<string, string>;
  readonly keyboard?: string[];
}

// =============================================================================
// EXAMPLES SPECIFICATION
// =============================================================================

export interface SpecificationExample {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly platform: Platform;
  readonly code: string;
  readonly preview?: string;
  readonly props: Record<string, unknown>;
  readonly tags: string[];
  readonly complexity: 'basic' | 'intermediate' | 'advanced';
}

// =============================================================================
// COMPLIANCE SPECIFICATION
// =============================================================================

export interface SpecificationCompliance {
  readonly wcag: WCAGCompliance;
  readonly norwegian: NorwegianCompliance;
  readonly security: SecurityCompliance;
  readonly performance: PerformanceCompliance;
  readonly browser: BrowserCompliance;
}

export interface WCAGCompliance {
  readonly level: 'A' | 'AA' | 'AAA';
  readonly criteria: WCAGCriterion[];
  readonly tested: boolean;
  readonly notes?: string;
}

export interface WCAGCriterion {
  readonly id: string;
  readonly name: string;
  readonly level: 'A' | 'AA' | 'AAA';
  readonly passed: boolean;
  readonly notes?: string;
}

export interface NorwegianCompliance {
  readonly nsmClassification: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  readonly digiGov: boolean;
  readonly universalDesign: boolean;
  readonly dataProtection: boolean;
  readonly notes?: string;
}

export interface SecurityCompliance {
  readonly xss: boolean;
  readonly csrf: boolean;
  readonly injectionSafe: boolean;
  readonly sanitization: boolean;
  readonly notes?: string;
}

export interface PerformanceCompliance {
  readonly renderTime: number; // milliseconds
  readonly bundleSize: number; // bytes
  readonly memoryUsage: number; // bytes
  readonly reflows: number;
  readonly benchmarks?: PerformanceBenchmark[];
}

export interface PerformanceBenchmark {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly target?: number;
}

export interface BrowserCompliance {
  readonly chrome: string; // version
  readonly firefox: string;
  readonly safari: string;
  readonly edge: string;
  readonly ie?: string;
  readonly mobile: MobileBrowserSupport;
}

export interface MobileBrowserSupport {
  readonly ios: string;
  readonly android: string;
  readonly responsive: boolean;
  readonly touch: boolean;
}

// =============================================================================
// DEPENDENCIES SPECIFICATION
// =============================================================================

export interface SpecificationDependencies {
  readonly required: DependencyInfo[];
  readonly optional: DependencyInfo[];
  readonly peer: DependencyInfo[];
  readonly internal: string[]; // Other component IDs
}

export interface DependencyInfo {
  readonly name: string;
  readonly version: string;
  readonly platforms?: Platform[];
  readonly purpose: string;
}

// =============================================================================
// VALIDATION SPECIFICATION
// =============================================================================

export interface SpecificationValidation {
  readonly rules: ValidationRule[];
  readonly customValidators?: CustomValidator[];
  readonly errorMessages: Record<string, string>;
}

export interface ValidationRule {
  readonly id: string;
  readonly type: 'prop' | 'variant' | 'composition' | 'accessibility' | 'performance';
  readonly severity: 'error' | 'warning' | 'info';
  readonly message: string;
  readonly check: string; // Validation function as string
}

export interface CustomValidator {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly validator: string; // Function as string
}

// =============================================================================
// SPECIFICATION UTILITIES
// =============================================================================

export interface SpecificationQuery {
  readonly category?: ComponentCategory;
  readonly platform?: Platform;
  readonly status?: SpecificationStatus;
  readonly compliance?: {
    readonly wcag?: 'A' | 'AA' | 'AAA';
    readonly norwegian?: boolean;
  };
  readonly search?: string;
  readonly tags?: string[];
}

export interface SpecificationValidationResult {
  readonly valid: boolean;
  readonly errors: SpecificationError[];
  readonly warnings: SpecificationWarning[];
  readonly suggestions: SpecificationSuggestion[];
}

export interface SpecificationError {
  readonly code: string;
  readonly message: string;
  readonly path: string;
  readonly severity: 'critical' | 'major' | 'minor';
}

export interface SpecificationWarning {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

export interface SpecificationSuggestion {
  readonly code: string;
  readonly message: string;
  readonly path: string;
  readonly fix?: string;
}

// =============================================================================
// SPECIFICATION GENERATION
// =============================================================================

export interface SpecificationGenerationOptions {
  readonly platform: Platform;
  readonly variant?: string;
  readonly typescript?: boolean;
  readonly styling?: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion';
  readonly testing?: boolean;
  readonly documentation?: boolean;
  readonly storybook?: boolean;
  readonly includeExamples?: boolean;
  readonly customizations?: Record<string, unknown>;
}

export interface GeneratedComponent {
  readonly specification: ComponentSpecification;
  readonly code: GeneratedCode;
  readonly tests?: GeneratedTests;
  readonly documentation?: GeneratedDocumentation;
  readonly storybook?: GeneratedStorybook;
}

export interface GeneratedCode {
  readonly component: string;
  readonly types?: string;
  readonly styles?: string;
  readonly utils?: string;
  readonly index: string;
}

export interface GeneratedTests {
  readonly unit: string;
  readonly integration?: string;
  readonly accessibility?: string;
  readonly visual?: string;
}

export interface GeneratedDocumentation {
  readonly readme: string;
  readonly api: string;
  readonly examples: string;
  readonly migration?: string;
}

export interface GeneratedStorybook {
  readonly stories: string;
  readonly docs: string;
  readonly controls: string;
}