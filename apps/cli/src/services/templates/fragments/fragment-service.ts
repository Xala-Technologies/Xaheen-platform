/**
 * Fragment Service - Main Entry Point
 * Provides a unified interface for the Template Fragment System
 */

import consola from "consola";
import type {
  FragmentConfig,
  FragmentCompositionContext,
  FragmentProcessingResult,
  FragmentDependency,
  FragmentType,
  TemplateContext,
  SupportedFramework,
  FragmentProcessingOptions,
} from "./interfaces/fragment-base";
import { CoreFragmentRegistry } from "./core/fragment-registry";
import { CoreFragmentProcessor } from "./core/fragment-processor";
import { CoreCompositionEngine } from "./core/composition-engine";

export class FragmentService {
  private readonly registry: CoreFragmentRegistry;
  private readonly processor: CoreFragmentProcessor;
  private readonly compositionEngine: CoreCompositionEngine;
  private initialized = false;

  constructor(fragmentBasePath?: string) {
    this.registry = new CoreFragmentRegistry(fragmentBasePath);
    this.processor = new CoreFragmentProcessor();
    this.compositionEngine = new CoreCompositionEngine(this.registry, this.processor);
  }

  /**
   * Initialize the fragment service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    consola.info("Initializing Fragment Service...");
    
    try {
      await this.registry.initialize();
      this.initialized = true;
      consola.success("Fragment Service initialized successfully");
    } catch (error) {
      consola.error("Failed to initialize Fragment Service:", error);
      throw error;
    }
  }

  /**
   * Generate templates using selected fragments
   */
  async generateTemplate(options: {
    fragmentNames: readonly string[];
    projectConfig: Record<string, unknown>;
    framework: SupportedFramework;
    context: TemplateContext;
    outputPath: string;
    processingOptions?: FragmentProcessingOptions;
  }): Promise<{
    success: boolean;
    results: readonly FragmentProcessingResult[];
    totalFilesProcessed: number;
    dependencies: readonly FragmentDependency[];
    errors: readonly string[];
    warnings: readonly string[];
  }> {
    await this.ensureInitialized();

    const compositionContext: FragmentCompositionContext = {
      projectConfig: options.projectConfig,
      selectedFragments: options.fragmentNames,
      framework: options.framework,
      context: options.context,
      options: options.processingOptions || {},
    };

    try {
      const result = await this.compositionEngine.composeFragments(
        options.fragmentNames,
        compositionContext,
        options.outputPath
      );

      // Collect all errors and warnings
      const allErrors: string[] = [];
      const allWarnings: string[] = [];

      for (const fragmentResult of result.results) {
        allErrors.push(...fragmentResult.errors);
        allWarnings.push(...fragmentResult.warnings);
      }

      return {
        success: result.compositionSuccess,
        results: result.results,
        totalFilesProcessed: result.totalFilesProcessed,
        dependencies: result.totalDependencies,
        errors: allErrors,
        warnings: allWarnings,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      consola.error("Template generation failed:", error);
      
      return {
        success: false,
        results: [],
        totalFilesProcessed: 0,
        dependencies: [],
        errors: [errorMessage],
        warnings: [],
      };
    }
  }

  /**
   * List available fragments with filtering
   */
  async listFragments(filter?: {
    type?: FragmentType;
    context?: TemplateContext;
    framework?: SupportedFramework;
  }): Promise<readonly FragmentConfig[]> {
    await this.ensureInitialized();
    return this.registry.listFragments(filter);
  }

  /**
   * Get detailed information about a specific fragment
   */
  async getFragmentInfo(name: string): Promise<FragmentConfig | null> {
    await this.ensureInitialized();
    return this.registry.getFragment(name);
  }

  /**
   * Validate fragment selection and compatibility
   */
  async validateFragmentSelection(options: {
    fragmentNames: readonly string[];
    framework: SupportedFramework;
    context: TemplateContext;
    projectConfig?: Record<string, unknown>;
  }): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
    suggestions: readonly string[];
  }> {
    await this.ensureInitialized();

    const compositionContext: FragmentCompositionContext = {
      projectConfig: options.projectConfig || {},
      selectedFragments: options.fragmentNames,
      framework: options.framework,
      context: options.context,
      options: { validateOnly: true },
    };

    try {
      // Validate composition
      const validation = await this.compositionEngine.validateComposition(
        options.fragmentNames,
        compositionContext
      );

      // Get suggestions
      const suggestions = await this.registry.getSuggestions(
        options.fragmentNames,
        compositionContext
      );

      return {
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        suggestions,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        valid: false,
        errors: [errorMessage],
        warnings: [],
        suggestions: [],
      };
    }
  }

  /**
   * Get fragment suggestions based on current selection
   */
  async getFragmentSuggestions(options: {
    currentSelection: readonly string[];
    framework: SupportedFramework;
    context: TemplateContext;
    projectConfig?: Record<string, unknown>;
  }): Promise<readonly string[]> {
    await this.ensureInitialized();

    const compositionContext: FragmentCompositionContext = {
      projectConfig: options.projectConfig || {},
      selectedFragments: options.currentSelection,
      framework: options.framework,
      context: options.context,
      options: {},
    };

    return this.registry.getSuggestions(options.currentSelection, compositionContext);
  }

  /**
   * Preview what files would be generated without actually creating them
   */
  async previewGeneration(options: {
    fragmentNames: readonly string[];
    projectConfig: Record<string, unknown>;
    framework: SupportedFramework;
    context: TemplateContext;
  }): Promise<{
    fragmentPreviews: readonly {
      fragmentName: string;
      filePaths: readonly string[];
      dependencies: readonly FragmentDependency[];
    }[];
    totalFiles: number;
    totalDependencies: readonly FragmentDependency[];
  }> {
    await this.ensureInitialized();

    const compositionContext: FragmentCompositionContext = {
      projectConfig: options.projectConfig,
      selectedFragments: options.fragmentNames,
      framework: options.framework,
      context: options.context,
      options: { dryRun: true, validateOnly: false },
    };

    const fragmentPreviews: Array<{
      fragmentName: string;
      filePaths: readonly string[];
      dependencies: readonly FragmentDependency[];
    }> = [];

    let totalFiles = 0;
    const allDependencies: FragmentDependency[] = [];

    for (const fragmentName of options.fragmentNames) {
      const fragment = await this.registry.getFragment(fragmentName);
      if (!fragment) {
        continue;
      }

      const result = await this.processor.processFragment(
        fragment,
        compositionContext,
        "/tmp/preview" // Dummy path for dry run
      );

      fragmentPreviews.push({
        fragmentName,
        filePaths: result.filesProcessed,
        dependencies: result.dependenciesAdded,
      });

      totalFiles += result.filesProcessed.length;
      allDependencies.push(...result.dependenciesAdded);
    }

    // Deduplicate dependencies
    const uniqueDependencies = this.deduplicateDependencies(allDependencies);

    return {
      fragmentPreviews,
      totalFiles,
      totalDependencies: uniqueDependencies,
    };
  }

  /**
   * Register a new fragment (for dynamic registration)
   */
  async registerFragment(config: FragmentConfig): Promise<void> {
    await this.ensureInitialized();
    await this.registry.registerFragment(config);
  }

  /**
   * Get service statistics
   */
  async getStatistics(): Promise<{
    totalFragments: number;
    fragmentsByType: Record<FragmentType, number>;
    fragmentsByContext: Record<TemplateContext, number>;
    fragmentsByFramework: Record<SupportedFramework, number>;
  }> {
    await this.ensureInitialized();

    const allFragments = await this.registry.listFragments();
    
    const fragmentsByType: Record<string, number> = {};
    const fragmentsByContext: Record<string, number> = {};
    const fragmentsByFramework: Record<string, number> = {};

    for (const fragment of allFragments) {
      // Count by type
      fragmentsByType[fragment.type] = (fragmentsByType[fragment.type] || 0) + 1;

      // Count by context
      for (const context of fragment.context) {
        fragmentsByContext[context] = (fragmentsByContext[context] || 0) + 1;
      }

      // Count by framework
      for (const framework of fragment.frameworks) {
        fragmentsByFramework[framework] = (fragmentsByFramework[framework] || 0) + 1;
      }
    }

    return {
      totalFragments: allFragments.length,
      fragmentsByType: fragmentsByType as Record<FragmentType, number>,
      fragmentsByContext: fragmentsByContext as Record<TemplateContext, number>,
      fragmentsByFramework: fragmentsByFramework as Record<SupportedFramework, number>,
    };
  }

  /**
   * Ensure the service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Deduplicate dependencies helper
   */
  private deduplicateDependencies(dependencies: readonly FragmentDependency[]): readonly FragmentDependency[] {
    const dependencyMap = new Map<string, FragmentDependency>();

    for (const dep of dependencies) {
      const existing = dependencyMap.get(dep.name);
      
      if (!existing) {
        dependencyMap.set(dep.name, dep);
        continue;
      }

      // Prefer runtime over dev dependencies
      if (dep.type === "runtime" && existing.type !== "runtime") {
        dependencyMap.set(dep.name, dep);
      }
    }

    return Array.from(dependencyMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Export singleton instance for convenience
export const fragmentService = new FragmentService();