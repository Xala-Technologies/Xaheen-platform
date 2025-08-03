/**
 * Template Composition Engine Interfaces
 * Combines fragments and services into complete project templates
 */

import type { 
  FragmentConfig, 
  FragmentCompositionContext,
  FragmentProcessingResult,
  SupportedFramework,
  TemplateContext 
} from "../../templates/fragments/interfaces/fragment-base";
import type { 
  ServiceConfig, 
  ServiceInjectionResult,
  ServiceTemplate,
  ServiceType 
} from "../../injection/interfaces/service-injector";

/**
 * Composition strategy for combining fragments and services
 */
export type CompositionStrategy = "fragments-first" | "services-first" | "parallel" | "optimized";

/**
 * Template composition configuration
 */
export interface TemplateCompositionConfig {
  readonly projectName: string;
  readonly framework: SupportedFramework;
  readonly context: TemplateContext;
  readonly outputPath: string;
  readonly fragments: readonly string[];
  readonly services: readonly ServiceConfig[];
  readonly strategy: CompositionStrategy;
  readonly projectConfig: Record<string, unknown>;
  readonly options: CompositionOptions;
}

/**
 * Composition options
 */
export interface CompositionOptions {
  readonly dryRun?: boolean;
  readonly overwrite?: boolean;
  readonly skipValidation?: boolean;
  readonly parallelExecution?: boolean;
  readonly maxConcurrency?: number;
  readonly backupFiles?: boolean;
  readonly generateManifest?: boolean;
  readonly optimizeOrder?: boolean;
}

/**
 * Composition result
 */
export interface CompositionResult {
  readonly success: boolean;
  readonly projectPath: string;
  readonly manifest: CompositionManifest;
  readonly fragmentResults: readonly FragmentProcessingResult[];
  readonly serviceResults: readonly ServiceInjectionResult[];
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly duration: number;
  readonly filesGenerated: readonly string[];
  readonly dependenciesAdded: readonly string[];
}

/**
 * Composition manifest - record of what was generated
 */
export interface CompositionManifest {
  readonly version: string;
  readonly generatedAt: Date;
  readonly config: TemplateCompositionConfig;
  readonly fragments: readonly {
    name: string;
    version: string;
    files: readonly string[];
  }[];
  readonly services: readonly {
    name: string;
    type: ServiceType;
    provider: string;
    files: readonly string[];
  }[];
  readonly dependencies: readonly {
    name: string;
    version: string;
    type: "runtime" | "dev" | "peer";
  }[];
  readonly envVariables: readonly {
    name: string;
    required: boolean;
    description?: string;
  }[];
  readonly postActions: readonly {
    name: string;
    command: string;
    description: string;
  }[];
}

/**
 * Composition validation result
 */
export interface CompositionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly suggestions: readonly string[];
  readonly compatibilityIssues: readonly {
    type: "fragment-conflict" | "service-conflict" | "framework-mismatch" | "dependency-missing";
    message: string;
    affected: readonly string[];
  }[];
}

/**
 * Composition planning result
 */
export interface CompositionPlan {
  readonly strategy: CompositionStrategy;
  readonly executionOrder: readonly CompositionStep[];
  readonly estimatedDuration: number;
  readonly filesAffected: readonly string[];
  readonly dependenciesToAdd: readonly string[];
  readonly envVarsRequired: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Composition execution step
 */
export interface CompositionStep {
  readonly id: string;
  readonly type: "fragment" | "service" | "post-action";
  readonly name: string;
  readonly dependencies: readonly string[];
  readonly estimatedTime: number;
  readonly priority: number;
  readonly canRunInParallel: boolean;
  readonly config?: Record<string, unknown>;
}

/**
 * Template composition engine interface
 */
export interface TemplateCompositionEngine {
  /**
   * Validate composition configuration
   */
  validateComposition(config: TemplateCompositionConfig): Promise<CompositionValidationResult>;

  /**
   * Plan composition execution
   */
  planComposition(config: TemplateCompositionConfig): Promise<CompositionPlan>;

  /**
   * Execute template composition
   */
  executeComposition(config: TemplateCompositionConfig): Promise<CompositionResult>;

  /**
   * Preview composition without execution
   */
  previewComposition(config: TemplateCompositionConfig): Promise<{
    plan: CompositionPlan;
    manifest: Omit<CompositionManifest, "generatedAt">;
    validation: CompositionValidationResult;
  }>;

  /**
   * Get composition suggestions
   */
  getCompositionSuggestions(config: Partial<TemplateCompositionConfig>): Promise<{
    recommendedFragments: readonly string[];
    recommendedServices: readonly ServiceConfig[];
    recommendedStrategy: CompositionStrategy;
    reasoning: readonly string[];
  }>;

  /**
   * Optimize composition configuration
   */
  optimizeComposition(config: TemplateCompositionConfig): Promise<{
    optimizedConfig: TemplateCompositionConfig;
    improvements: readonly string[];
    potentialIssues: readonly string[];
  }>;
}

/**
 * Composition optimizer interface
 */
export interface CompositionOptimizer {
  /**
   * Optimize execution order for better performance
   */
  optimizeExecutionOrder(steps: readonly CompositionStep[]): Promise<readonly CompositionStep[]>;

  /**
   * Identify parallel execution opportunities
   */
  identifyParallelSteps(steps: readonly CompositionStep[]): Promise<readonly CompositionStep[][]>;

  /**
   * Optimize resource usage
   */
  optimizeResourceUsage(config: TemplateCompositionConfig): Promise<{
    optimizedConfig: TemplateCompositionConfig;
    savings: {
      executionTime: number;
      memoryUsage: number;
      diskSpace: number;
    };
  }>;

  /**
   * Detect and resolve conflicts
   */
  resolveConflicts(config: TemplateCompositionConfig): Promise<{
    resolvedConfig: TemplateCompositionConfig;
    resolutions: readonly {
      conflict: string;
      resolution: string;
      impact: "low" | "medium" | "high";
    }[];
  }>;
}

/**
 * Composition progress tracker
 */
export interface CompositionProgressTracker {
  /**
   * Track composition progress
   */
  trackProgress(step: CompositionStep, status: "started" | "completed" | "failed"): void;

  /**
   * Get current progress
   */
  getProgress(): {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    currentStep?: CompositionStep;
    estimatedTimeRemaining: number;
    overallProgress: number; // 0-100
  };

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (progress: ReturnType<CompositionProgressTracker["getProgress"]>) => void): void;

  /**
   * Reset progress tracking
   */
  reset(): void;
}