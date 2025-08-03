/**
 * Service Validator Interface
 * 
 * Interface for comprehensive service validation including templates,
 * configurations, and compatibility checks.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import type {
  ServiceTemplate,
  ServiceTemplateEnhanced,
  ServiceConfig,
  ServiceMetadata,
  ServiceBundle
} from '../schemas';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Validation result for individual checks
 */
export interface ValidationIssue {
  readonly code: string;
  readonly severity: ValidationSeverity;
  readonly message: string;
  readonly path?: string; // JSONPath to the problematic field
  readonly suggestion?: string;
  readonly documentation?: string;
}

/**
 * Comprehensive validation result
 */
export interface ValidationResult {
  readonly valid: boolean;
  readonly score: number; // Quality score (0-100)
  readonly issues: readonly ValidationIssue[];
  readonly summary: {
    readonly criticalCount: number;
    readonly errorCount: number;
    readonly warningCount: number;
    readonly infoCount: number;
  };
  readonly validatedAt: Date;
  readonly validator: string;
  readonly duration: number; // in milliseconds
}

/**
 * Validation options
 */
export interface ValidationOptions {
  readonly strict?: boolean;
  readonly includeWarnings?: boolean;
  readonly includeInfo?: boolean;
  readonly skipOptional?: boolean;
  readonly environment?: string;
  readonly framework?: string;
  readonly platform?: string;
  readonly customRules?: readonly string[]; // Rule names to apply
  readonly excludeRules?: readonly string[]; // Rule names to exclude
}

/**
 * Template validation context
 */
export interface TemplateValidationContext {
  readonly template: ServiceTemplate | ServiceTemplateEnhanced;
  readonly targetFramework?: string;
  readonly targetPlatform?: string;
  readonly targetEnvironment?: string;
  readonly projectContext?: Record<string, unknown>;
}

/**
 * Service configuration validation context
 */
export interface ConfigValidationContext {
  readonly config: ServiceConfig;
  readonly template?: ServiceTemplate | ServiceTemplateEnhanced;
  readonly existingServices?: readonly ServiceConfig[];
  readonly projectPath?: string;
  readonly environment?: string;
}

/**
 * Enhanced Service Validator Interface
 */
export interface IServiceValidator {
  /**
   * Validate service template structure and content
   */
  validateTemplate(
    template: ServiceTemplate | ServiceTemplateEnhanced,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Validate template against specific context
   */
  validateTemplateInContext(
    context: TemplateValidationContext,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Validate service configuration
   */
  validateConfig(
    config: ServiceConfig,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Validate configuration against template
   */
  validateConfigAgainstTemplate(
    context: ConfigValidationContext,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Validate service metadata
   */
  validateMetadata(
    metadata: ServiceMetadata,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Validate service bundle
   */
  validateBundle(
    bundle: ServiceBundle,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Validate multiple services for compatibility
   */
  validateServiceGroup(
    services: readonly ServiceConfig[],
    options?: ValidationOptions
  ): Promise<{
    overall: ValidationResult;
    individual: readonly {
      serviceId: string;
      result: ValidationResult;
    }[];
    interactions: readonly {
      serviceA: string;
      serviceB: string;
      issues: readonly ValidationIssue[];
    }[];
  }>;

  /**
   * Validate project configuration
   */
  validateProject(
    projectPath: string,
    options?: ValidationOptions
  ): Promise<{
    valid: boolean;
    services: readonly {
      serviceId: string;
      result: ValidationResult;
    }[];
    project: ValidationResult;
    recommendations: readonly string[];
  }>;

  /**
   * Get available validation rules
   */
  getValidationRules(): Promise<readonly {
    name: string;
    description: string;
    severity: ValidationSeverity;
    category: string;
    enabled: boolean;
  }[]>;

  /**
   * Register custom validation rule
   */
  registerValidationRule(rule: {
    name: string;
    description: string;
    severity: ValidationSeverity;
    category: string;
    validator: (
      target: unknown,
      context?: Record<string, unknown>
    ) => Promise<readonly ValidationIssue[]>;
  }): Promise<void>;

  /**
   * Remove validation rule
   */
  removeValidationRule(ruleName: string): Promise<boolean>;

  /**
   * Enable/disable validation rule
   */
  toggleValidationRule(ruleName: string, enabled: boolean): Promise<void>;

  /**
   * Validate template injection points
   */
  validateInjectionPoints(
    template: ServiceTemplate | ServiceTemplateEnhanced,
    projectPath?: string,
    options?: ValidationOptions
  ): Promise<{
    valid: boolean;
    points: readonly {
      path: string;
      valid: boolean;
      issues: readonly ValidationIssue[];
      preview?: string; // Preview of what would be injected
    }[];
  }>;

  /**
   * Validate environment variables
   */
  validateEnvironmentVariables(
    template: ServiceTemplate | ServiceTemplateEnhanced,
    environment?: Record<string, string>,
    options?: ValidationOptions
  ): Promise<{
    valid: boolean;
    variables: readonly {
      name: string;
      valid: boolean;
      present: boolean;
      issues: readonly ValidationIssue[];
    }[];
  }>;

  /**
   * Validate dependencies
   */
  validateDependencies(
    template: ServiceTemplate | ServiceTemplateEnhanced,
    projectPath?: string,
    options?: ValidationOptions
  ): Promise<{
    valid: boolean;
    dependencies: readonly {
      name: string;
      version: string;
      available: boolean;
      compatible: boolean;
      issues: readonly ValidationIssue[];
    }[];
  }>;

  /**
   * Get validation schema for service type
   */
  getValidationSchema(
    serviceType: string,
    provider?: string
  ): Promise<Record<string, unknown> | null>;

  /**
   * Validate against JSON schema
   */
  validateAgainstSchema(
    data: unknown,
    schema: Record<string, unknown>,
    options?: ValidationOptions
  ): Promise<ValidationResult>;

  /**
   * Get validator statistics
   */
  getStatistics(): Promise<{
    totalValidations: number;
    successfulValidations: number;
    failedValidations: number;
    averageValidationTime: number;
    mostCommonIssues: readonly {
      code: string;
      count: number;
      severity: ValidationSeverity;
    }[];
  }>;

  /**
   * Generate validation report
   */
  generateReport(
    results: readonly ValidationResult[],
    format?: 'json' | 'html' | 'markdown' | 'text'
  ): Promise<string>;

  /**
   * Subscribe to validation events
   */
  subscribe(
    event: 'validation-started' | 'validation-completed' | 'validation-failed',
    callback: (data: {
      target: unknown;
      result?: ValidationResult;
      error?: string;
      duration?: number;
    }) => void
  ): () => void; // Returns unsubscribe function
}