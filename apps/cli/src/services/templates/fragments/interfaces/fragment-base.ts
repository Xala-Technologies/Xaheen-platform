/**
 * Core interfaces for the Template Fragment System
 * Defines the base structure for all template fragments
 */

/**
 * Template fragment types
 */
export type FragmentType = 
  | "auth"
  | "notification" 
  | "payment"
  | "shared"
  | "ui"
  | "api"
  | "database"
  | "config"
  | "layout"
  | "component";

/**
 * Template processing context
 */
export type TemplateContext = "web" | "native" | "server" | "shared";

/**
 * Supported frameworks for fragments
 */
export type SupportedFramework = 
  | "react"
  | "next"
  | "nuxt"
  | "svelte"
  | "solid"
  | "angular"
  | "vue"
  | "native-react"
  | "express"
  | "fastify"
  | "hono"
  | "elysia";

/**
 * Fragment dependency specification
 */
export interface FragmentDependency {
  readonly name: string;
  readonly version?: string;
  readonly type: "dev" | "peer" | "runtime";
  readonly optional?: boolean;
  readonly condition?: string; // Handlebars condition
}

/**
 * Fragment file metadata
 */
export interface FragmentFile {
  readonly path: string;
  readonly type: "template" | "static" | "config";
  readonly condition?: string; // Handlebars condition for inclusion
  readonly override?: boolean; // Whether this file can override existing files
  readonly merge?: boolean; // Whether this file should be merged with existing
}

/**
 * Fragment configuration schema
 */
export interface FragmentConfig {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly type: FragmentType;
  readonly context: readonly TemplateContext[];
  readonly frameworks: readonly SupportedFramework[];
  readonly dependencies: readonly FragmentDependency[];
  readonly files: readonly FragmentFile[];
  readonly variables?: Record<string, unknown>;
  readonly conditions?: Record<string, string>;
  readonly compatibility?: {
    readonly requires?: readonly string[];
    readonly conflicts?: readonly string[];
    readonly suggests?: readonly string[];
  };
}

/**
 * Fragment processing options
 */
export interface FragmentProcessingOptions {
  readonly dryRun?: boolean;
  readonly overwrite?: boolean;
  readonly merge?: boolean;
  readonly validateOnly?: boolean;
  readonly skipValidation?: boolean;
}

/**
 * Fragment processing result
 */
export interface FragmentProcessingResult {
  readonly success: boolean;
  readonly fragmentName: string;
  readonly filesProcessed: readonly string[];
  readonly dependenciesAdded: readonly FragmentDependency[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly skipped: readonly string[];
}

/**
 * Fragment composition context for combining multiple fragments
 */
export interface FragmentCompositionContext {
  readonly projectConfig: Record<string, unknown>;
  readonly selectedFragments: readonly string[];
  readonly framework: SupportedFramework;
  readonly context: TemplateContext;
  readonly options: FragmentProcessingOptions;
}

/**
 * Base interface for all fragment processors
 */
export interface FragmentProcessor {
  /**
   * Process a single fragment
   */
  processFragment(
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext,
    outputPath: string
  ): Promise<FragmentProcessingResult>;

  /**
   * Validate fragment compatibility
   */
  validateFragment(
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext
  ): Promise<readonly string[]>;

  /**
   * Resolve fragment dependencies
   */
  resolveDependencies(
    fragmentConfig: FragmentConfig,
    context: FragmentCompositionContext
  ): Promise<readonly FragmentDependency[]>;
}

/**
 * Fragment registry interface for managing available fragments
 */
export interface FragmentRegistry {
  /**
   * Register a fragment
   */
  registerFragment(config: FragmentConfig): Promise<void>;

  /**
   * Get fragment by name
   */
  getFragment(name: string): Promise<FragmentConfig | null>;

  /**
   * List available fragments
   */
  listFragments(
    filter?: {
      type?: FragmentType;
      context?: TemplateContext;
      framework?: SupportedFramework;
    }
  ): Promise<readonly FragmentConfig[]>;

  /**
   * Check fragment compatibility
   */
  checkCompatibility(
    fragmentNames: readonly string[],
    context: FragmentCompositionContext
  ): Promise<{
    compatible: boolean;
    conflicts: readonly string[];
    missing: readonly string[];
  }>;
}

/**
 * Fragment composition engine interface
 */
export interface FragmentCompositionEngine {
  /**
   * Compose multiple fragments into a complete template
   */
  composeFragments(
    fragmentNames: readonly string[],
    context: FragmentCompositionContext,
    outputPath: string
  ): Promise<{
    results: readonly FragmentProcessingResult[];
    compositionSuccess: boolean;
    totalFilesProcessed: number;
    totalDependencies: readonly FragmentDependency[];
  }>;

  /**
   * Validate composition before processing
   */
  validateComposition(
    fragmentNames: readonly string[],
    context: FragmentCompositionContext
  ): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  }>;
}