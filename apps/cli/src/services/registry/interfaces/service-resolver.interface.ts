/**
 * Service Resolver Interface
 * 
 * Interface for advanced service dependency resolution with graph analysis.
 * Supports complex dependency scenarios and optimization strategies.
 * 
 * @author Backend Expert Agent
 * @since 2025-01-03
 */

import type {
  ServiceConfig,
  ServiceDependencyGraph,
  DependencyResolutionResult,
  DependencyResolutionStrategy,
  ServiceDependencyIdentifier,
  DependencyAnalysisReport
} from '../schemas';

/**
 * Dependency resolution options
 */
export interface DependencyResolutionOptions {
  readonly strategy?: string; // Strategy name
  readonly failFast?: boolean;
  readonly includeOptional?: boolean;
  readonly maxDepth?: number;
  readonly timeout?: number; // in milliseconds
  readonly parallel?: boolean;
  readonly cache?: boolean;
  readonly validate?: boolean;
  readonly environment?: string;
  readonly platform?: string;
  readonly framework?: string;
}

/**
 * Service suggestion options
 */
export interface ServiceSuggestionOptions {
  readonly projectType?: string;
  readonly framework?: string;
  readonly platform?: string;
  readonly environment?: string;
  readonly includeOptional?: boolean;
  readonly maxSuggestions?: number;
  readonly minScore?: number; // Minimum relevance score (0-100)
}

/**
 * Enhanced Service Resolver Interface
 */
export interface IServiceResolver {
  /**
   * Resolve service dependencies with advanced analysis
   */
  resolveDependencies(
    services: readonly ServiceConfig[],
    projectPath: string,
    options?: DependencyResolutionOptions
  ): Promise<DependencyResolutionResult>;

  /**
   * Build dependency graph for services
   */
  buildDependencyGraph(
    services: readonly ServiceConfig[],
    options?: DependencyResolutionOptions
  ): Promise<ServiceDependencyGraph>;

  /**
   * Analyze dependency graph for issues
   */
  analyzeDependencyGraph(
    graph: ServiceDependencyGraph
  ): Promise<DependencyAnalysisReport>;

  /**
   * Calculate optimal injection order
   */
  calculateInjectionOrder(
    services: readonly ServiceConfig[],
    options?: DependencyResolutionOptions
  ): Promise<readonly string[]>; // Service IDs in order

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(
    services: readonly ServiceConfig[]
  ): Promise<readonly {
    cycle: readonly string[]; // Service IDs in cycle
    severity: 'warning' | 'error' | 'critical';
    resolution?: string;
  }[]>;

  /**
   * Suggest additional services based on current selection
   */
  suggestServices(
    currentServices: readonly ServiceConfig[],
    options?: ServiceSuggestionOptions
  ): Promise<readonly {
    service: ServiceDependencyIdentifier;
    reason: string;
    score: number; // Relevance score (0-100)
    benefits: readonly string[];
    optional: boolean;
  }[]>;

  /**
   * Find service alternatives
   */
  findAlternatives(
    service: ServiceDependencyIdentifier,
    context?: {
      currentServices?: readonly ServiceConfig[];
      requirements?: Record<string, unknown>;
      preferences?: Record<string, unknown>;
    }
  ): Promise<readonly {
    service: ServiceDependencyIdentifier;
    compatibility: number; // Compatibility score (0-100)
    migrationEffort: 'low' | 'medium' | 'high';
    benefits: readonly string[];
    drawbacks: readonly string[];
  }[]>;

  /**
   * Optimize service selection
   */
  optimizeServices(
    services: readonly ServiceConfig[],
    objectives?: {
      minimizeComplexity?: boolean;
      maximizePerformance?: boolean;
      minimizeCost?: boolean;
      maximizeCompatibility?: boolean;
      weights?: Record<string, number>;
    }
  ): Promise<{
    optimized: readonly ServiceConfig[];
    removed: readonly ServiceConfig[];
    added: readonly ServiceConfig[];
    score: number; // Optimization score (0-100)
    explanation: string;
  }>;

  /**
   * Validate service combination
   */
  validateServiceCombination(
    services: readonly ServiceConfig[],
    options?: {
      strict?: boolean;
      environment?: string;
      framework?: string;
    }
  ): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
    suggestions: readonly string[];
  }>;

  /**
   * Get dependency resolution strategies
   */
  getResolutionStrategies(): Promise<readonly DependencyResolutionStrategy[]>;

  /**
   * Register custom resolution strategy
   */
  registerResolutionStrategy(
    strategy: DependencyResolutionStrategy
  ): Promise<void>;

  /**
   * Remove resolution strategy
   */
  removeResolutionStrategy(strategyName: string): Promise<boolean>;

  /**
   * Get resolution strategy by name
   */
  getResolutionStrategy(
    strategyName: string
  ): Promise<DependencyResolutionStrategy | null>;

  /**
   * Test resolution strategy
   */
  testResolutionStrategy(
    strategy: DependencyResolutionStrategy,
    testCases: readonly {
      services: readonly ServiceConfig[];
      expectedResult?: DependencyResolutionResult;
    }[]
  ): Promise<{
    passed: number;
    failed: number;
    results: readonly {
      testCase: number;
      passed: boolean;
      result: DependencyResolutionResult;
      error?: string;
    }[];
  }>;

  /**
   * Get cached resolution results
   */
  getCachedResult(
    services: readonly ServiceConfig[],
    options?: DependencyResolutionOptions
  ): Promise<DependencyResolutionResult | null>;

  /**
   * Clear resolution cache
   */
  clearCache(pattern?: string): Promise<void>;

  /**
   * Get resolver statistics
   */
  getStatistics(): Promise<{
    totalResolutions: number;
    successfulResolutions: number;
    failedResolutions: number;
    averageResolutionTime: number;
    cacheHitRate: number;
    mostUsedStrategies: readonly {
      strategy: string;
      count: number;
    }[];
  }>;

  /**
   * Subscribe to resolution events
   */
  subscribe(
    event: 'resolution-started' | 'resolution-completed' | 'resolution-failed',
    callback: (data: {
      services: readonly ServiceConfig[];
      result?: DependencyResolutionResult;
      error?: string;
      duration?: number;
    }) => void
  ): () => void; // Returns unsubscribe function
}