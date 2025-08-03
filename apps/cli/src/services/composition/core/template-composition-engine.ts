/**
 * Template Composition Engine Implementation
 * Orchestrates the combination of fragments and services into complete project templates
 */

import path from "node:path";
import fs from "fs-extra";
import consola from "consola";
import type {
  TemplateCompositionEngine,
  TemplateCompositionConfig,
  CompositionResult,
  CompositionValidationResult,
  CompositionPlan,
  CompositionStep,
  CompositionManifest,
  CompositionStrategy,
  CompositionOptimizer,
} from "../interfaces/composition-engine";
import type { FragmentService } from "../../templates/fragments/fragment-service";
import type { ServiceInjectionService } from "../../injection/injection-service";
import { generateId } from "../../utils/id-generator";

export class CoreTemplateCompositionEngine implements TemplateCompositionEngine {
  constructor(
    private readonly fragmentService: FragmentService,
    private readonly serviceInjectionService: ServiceInjectionService,
    private readonly optimizer?: CompositionOptimizer
  ) {}

  /**
   * Validate composition configuration
   */
  async validateComposition(config: TemplateCompositionConfig): Promise<CompositionValidationResult> {
    consola.info("Validating composition configuration...");

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const compatibilityIssues: CompositionValidationResult["compatibilityIssues"] = [];

    try {
      // Validate basic configuration
      if (!config.projectName || config.projectName.trim().length === 0) {
        errors.push("Project name is required");
      }

      if (!config.framework) {
        errors.push("Framework is required");
      }

      if (!config.context) {
        errors.push("Context is required");
      }

      if (!config.outputPath || config.outputPath.trim().length === 0) {
        errors.push("Output path is required");
      }

      // Validate fragments
      if (config.fragments.length > 0) {
        const fragmentValidation = await this.fragmentService.validateFragmentSelection({
          fragmentNames: config.fragments,
          framework: config.framework,
          context: config.context,
          projectConfig: config.projectConfig,
        });

        if (!fragmentValidation.valid) {
          errors.push(...fragmentValidation.errors);
          
          for (const error of fragmentValidation.errors) {
            if (error.includes("conflicts")) {
              compatibilityIssues.push({
                type: "fragment-conflict",
                message: error,
                affected: this.extractAffectedItems(error),
              });
            }
          }
        }

        warnings.push(...fragmentValidation.warnings);
        suggestions.push(...fragmentValidation.suggestions);
      }

      // Validate services
      if (config.services.length > 0) {
        const serviceCompatibility = await this.serviceInjectionService.validateCompatibility({
          serviceConfigs: config.services,
          projectPath: config.outputPath,
        });

        if (!serviceCompatibility.compatible) {
          for (const conflict of serviceCompatibility.conflicts) {
            errors.push(`Service conflict: ${conflict.serviceA} conflicts with ${conflict.serviceB} (${conflict.reason})`);
            compatibilityIssues.push({
              type: "service-conflict",
              message: `${conflict.serviceA} conflicts with ${conflict.serviceB}`,
              affected: [conflict.serviceA, conflict.serviceB],
            });
          }
        }

        for (const missing of serviceCompatibility.missingDependencies) {
          errors.push(`Missing service dependency: ${missing.serviceId} requires ${missing.provider}`);
          compatibilityIssues.push({
            type: "dependency-missing",
            message: `${missing.serviceId} requires ${missing.provider}`,
            affected: [missing.serviceId, missing.provider],
          });
        }
      }

      // Cross-validate fragments and services
      await this.validateFragmentServiceCompatibility(config, errors, warnings, compatibilityIssues);

      // Validate output path
      if (config.outputPath) {
        const outputDir = path.dirname(config.outputPath);
        if (!(await fs.pathExists(outputDir))) {
          if (config.options.overwrite) {
            warnings.push(`Output directory will be created: ${outputDir}`);
          } else {
            errors.push(`Output directory does not exist: ${outputDir}`);
          }
        }

        if (!config.options.overwrite && await fs.pathExists(config.outputPath)) {
          const dirContents = await fs.readdir(config.outputPath);
          if (dirContents.length > 0) {
            warnings.push("Output directory is not empty - files may be overwritten");
          }
        }
      }

      const result: CompositionValidationResult = {
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions,
        compatibilityIssues,
      };

      if (result.valid) {
        consola.success("Composition configuration validation passed");
      } else {
        consola.warn(`Composition configuration validation failed with ${errors.length} errors`);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        valid: false,
        errors: [errorMessage],
        warnings,
        suggestions,
        compatibilityIssues,
      };
    }
  }

  /**
   * Plan composition execution
   */
  async planComposition(config: TemplateCompositionConfig): Promise<CompositionPlan> {
    consola.info("Planning composition execution...");

    const steps: CompositionStep[] = [];
    let estimatedDuration = 0;

    // Create fragment steps
    for (const [index, fragmentName] of config.fragments.entries()) {
      const stepId = generateId(`fragment-${fragmentName}`);
      const step: CompositionStep = {
        id: stepId,
        type: "fragment",
        name: fragmentName,
        dependencies: [],
        estimatedTime: 2000, // 2 seconds per fragment
        priority: 100 - index, // Earlier fragments have higher priority
        canRunInParallel: true,
      };
      steps.push(step);
      estimatedDuration += step.estimatedTime;
    }

    // Create service steps
    for (const [index, service] of config.services.entries()) {
      const stepId = generateId(`service-${service.name}`);
      const step: CompositionStep = {
        id: stepId,
        type: "service",
        name: service.name,
        dependencies: service.dependencies || [],
        estimatedTime: 5000, // 5 seconds per service
        priority: 50 - index, // Services have lower priority than fragments
        canRunInParallel: false, // Services often have dependencies
        config: service.config,
      };
      steps.push(step);
      estimatedDuration += step.estimatedTime;
    }

    // Optimize execution order if requested
    let optimizedSteps = steps;
    if (config.options.optimizeOrder && this.optimizer) {
      optimizedSteps = await this.optimizer.optimizeExecutionOrder(steps);
    }

    // Calculate files affected and dependencies
    const filesAffected: string[] = [];
    const dependenciesToAdd: string[] = [];
    const envVarsRequired: string[] = [];
    const warnings: string[] = [];

    // Preview fragments
    if (config.fragments.length > 0) {
      const fragmentPreview = await this.fragmentService.previewGeneration({
        fragmentNames: config.fragments,
        projectConfig: config.projectConfig,
        framework: config.framework,
        context: config.context,
      });

      filesAffected.push(...fragmentPreview.fragmentPreviews.flatMap(p => p.filePaths));
      dependenciesToAdd.push(...fragmentPreview.totalDependencies.map(d => `${d.name}@${d.version || 'latest'}`));
    }

    // Preview services
    if (config.services.length > 0) {
      const servicePreview = await this.serviceInjectionService.previewServiceInjection({
        serviceConfigs: config.services,
        projectPath: config.outputPath,
        resolveDependencies: true,
      });

      filesAffected.push(...servicePreview.filesAffected);
      dependenciesToAdd.push(...servicePreview.dependenciesAdded);
      envVarsRequired.push(...servicePreview.envVarsRequired);
      warnings.push(...servicePreview.conflicts.map(c => `Conflict: ${c}`));
    }

    const plan: CompositionPlan = {
      strategy: config.strategy,
      executionOrder: optimizedSteps,
      estimatedDuration,
      filesAffected: [...new Set(filesAffected)],
      dependenciesToAdd: [...new Set(dependenciesToAdd)],
      envVarsRequired: [...new Set(envVarsRequired)],
      warnings,
    };

    consola.success(`Composition plan created: ${optimizedSteps.length} steps, estimated ${estimatedDuration}ms`);
    return plan;
  }

  /**
   * Execute template composition
   */
  async executeComposition(config: TemplateCompositionConfig): Promise<CompositionResult> {
    const startTime = Date.now();
    consola.info(`Starting template composition for project: ${config.projectName}`);

    // Validate configuration first
    const validation = await this.validateComposition(config);
    if (!validation.valid) {
      return {
        success: false,
        projectPath: config.outputPath,
        manifest: {} as CompositionManifest,
        fragmentResults: [],
        serviceResults: [],
        errors: validation.errors,
        warnings: validation.warnings,
        duration: Date.now() - startTime,
        filesGenerated: [],
        dependenciesAdded: [],
      };
    }

    // Create execution plan
    const plan = await this.planComposition(config);
    consola.info(`Executing composition with ${plan.executionOrder.length} steps`);

    // Ensure output directory exists
    await fs.ensureDir(config.outputPath);

    const result: CompositionResult = {
      success: false,
      projectPath: config.outputPath,
      manifest: {} as CompositionManifest,
      fragmentResults: [],
      serviceResults: [],
      errors: [],
      warnings: [...validation.warnings, ...plan.warnings],
      duration: 0,
      filesGenerated: [],
      dependenciesAdded: [],
    };

    try {
      // Execute based on strategy
      switch (config.strategy) {
        case "fragments-first":
          await this.executeFragmentsFirst(config, plan, result);
          break;
        case "services-first":
          await this.executeServicesFirst(config, plan, result);
          break;
        case "parallel":
          await this.executeParallel(config, plan, result);
          break;
        case "optimized":
        default:
          await this.executeOptimized(config, plan, result);
          break;
      }

      // Generate manifest
      result.manifest = await this.generateManifest(config, result);

      // Save manifest if requested
      if (config.options.generateManifest) {
        await this.saveManifest(result.manifest, config.outputPath);
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      if (result.success) {
        consola.success(`Template composition completed successfully in ${result.duration}ms`);
      } else {
        consola.error(`Template composition failed with ${result.errors.length} errors`);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Composition execution failed: ${errorMessage}`);
      result.duration = Date.now() - startTime;
      consola.error("Template composition execution failed:", error);
      return result;
    }
  }

  /**
   * Preview composition without execution
   */
  async previewComposition(config: TemplateCompositionConfig): Promise<{
    plan: CompositionPlan;
    manifest: Omit<CompositionManifest, "generatedAt">;
    validation: CompositionValidationResult;
  }> {
    const validation = await this.validateComposition(config);
    const plan = await this.planComposition(config);

    // Create preview manifest
    const manifest: Omit<CompositionManifest, "generatedAt"> = {
      version: "1.0.0",
      config,
      fragments: config.fragments.map(name => ({
        name,
        version: "1.0.0", // Would be resolved from actual fragment
        files: [], // Would be resolved from preview
      })),
      services: config.services.map(service => ({
        name: service.name,
        type: service.type,
        provider: service.provider,
        files: [], // Would be resolved from preview
      })),
      dependencies: [], // Would be resolved from fragments and services
      envVariables: [], // Would be resolved from services
      postActions: [], // Would be resolved from services
    };

    return { plan, manifest, validation };
  }

  /**
   * Get composition suggestions
   */
  async getCompositionSuggestions(config: Partial<TemplateCompositionConfig>): Promise<{
    recommendedFragments: readonly string[];
    recommendedServices: readonly any[];
    recommendedStrategy: CompositionStrategy;
    reasoning: readonly string[];
  }> {
    const reasoning: string[] = [];
    const recommendedFragments: string[] = [];
    const recommendedServices: any[] = [];

    // Basic recommendations based on framework and context
    if (config.framework && config.context) {
      if (config.context === "web") {
        recommendedFragments.push("ui-base");
        reasoning.push("UI base components are essential for web applications");

        if (config.framework === "next" || config.framework === "react") {
          recommendedFragments.push("better-auth");
          reasoning.push("Authentication is commonly needed in React/Next.js applications");
        }
      }

      if (config.context === "server") {
        recommendedServices.push({
          name: "monitoring",
          type: "monitoring",
          provider: "sentry",
          enabled: true,
          config: {},
        });
        reasoning.push("Monitoring is essential for production servers");
      }
    }

    // Suggest strategy based on complexity
    let recommendedStrategy: CompositionStrategy = "optimized";
    if (config.fragments && config.services) {
      const totalItems = config.fragments.length + config.services.length;
      if (totalItems > 10) {
        recommendedStrategy = "parallel";
        reasoning.push("Parallel execution recommended for complex compositions");
      } else if (config.services.length > config.fragments.length) {
        recommendedStrategy = "services-first";
        reasoning.push("Services-first approach recommended when services dominate");
      } else {
        recommendedStrategy = "fragments-first";
        reasoning.push("Fragments-first approach recommended for this composition");
      }
    }

    return {
      recommendedFragments,
      recommendedServices,
      recommendedStrategy,
      reasoning,
    };
  }

  /**
   * Optimize composition configuration
   */
  async optimizeComposition(config: TemplateCompositionConfig): Promise<{
    optimizedConfig: TemplateCompositionConfig;
    improvements: readonly string[];
    potentialIssues: readonly string[];
  }> {
    const improvements: string[] = [];
    const potentialIssues: string[] = [];
    let optimizedConfig = { ...config };

    if (this.optimizer) {
      const optimizationResult = await this.optimizer.optimizeResourceUsage(config);
      optimizedConfig = optimizationResult.optimizedConfig;
      
      if (optimizationResult.savings.executionTime > 0) {
        improvements.push(`Execution time reduced by ${optimizationResult.savings.executionTime}ms`);
      }
    }

    // Enable parallel execution for better performance
    if (!config.options.parallelExecution && config.fragments.length > 3) {
      optimizedConfig = {
        ...optimizedConfig,
        options: {
          ...optimizedConfig.options,
          parallelExecution: true,
          maxConcurrency: Math.min(4, config.fragments.length),
        },
      };
      improvements.push("Enabled parallel execution for better performance");
    }

    return {
      optimizedConfig,
      improvements,
      potentialIssues,
    };
  }

  /**
   * Execute fragments-first strategy
   */
  private async executeFragmentsFirst(
    config: TemplateCompositionConfig,
    plan: CompositionPlan,
    result: CompositionResult
  ): Promise<void> {
    // Execute fragments first
    if (config.fragments.length > 0) {
      consola.info("Executing fragments...");
      const fragmentResult = await this.fragmentService.generateTemplate({
        fragmentNames: config.fragments,
        projectConfig: config.projectConfig,
        framework: config.framework,
        context: config.context,
        outputPath: config.outputPath,
        processingOptions: {
          dryRun: config.options.dryRun,
          overwrite: config.options.overwrite,
          skipValidation: config.options.skipValidation,
        },
      });

      result.fragmentResults = fragmentResult.results;
      result.errors.push(...fragmentResult.errors);
      result.warnings.push(...fragmentResult.warnings);
      result.filesGenerated.push(...fragmentResult.results.flatMap(r => r.filesProcessed));
      result.dependenciesAdded.push(...fragmentResult.dependencies.map(d => `${d.name}@${d.version || 'latest'}`));
    }

    // Then execute services
    if (config.services.length > 0) {
      consola.info("Executing services...");
      const serviceResult = await this.serviceInjectionService.injectServices({
        serviceConfigs: config.services,
        projectPath: config.outputPath,
        injectionOptions: {
          dryRun: config.options.dryRun,
          overwrite: config.options.overwrite,
          skipValidation: config.options.skipValidation,
        },
      });

      result.serviceResults = serviceResult.results;
      result.errors.push(...serviceResult.results.flatMap(r => r.errors));
      result.warnings.push(...serviceResult.results.flatMap(r => r.warnings));
      result.filesGenerated.push(...serviceResult.results.flatMap(r => r.filesModified));
      result.dependenciesAdded.push(...serviceResult.results.flatMap(r => r.dependenciesAdded));
    }
  }

  /**
   * Execute services-first strategy
   */
  private async executeServicesFirst(
    config: TemplateCompositionConfig,
    plan: CompositionPlan,
    result: CompositionResult
  ): Promise<void> {
    // Execute services first
    if (config.services.length > 0) {
      consola.info("Executing services...");
      const serviceResult = await this.serviceInjectionService.injectServices({
        serviceConfigs: config.services,
        projectPath: config.outputPath,
        injectionOptions: {
          dryRun: config.options.dryRun,
          overwrite: config.options.overwrite,
          skipValidation: config.options.skipValidation,
        },
      });

      result.serviceResults = serviceResult.results;
      result.errors.push(...serviceResult.results.flatMap(r => r.errors));
      result.warnings.push(...serviceResult.results.flatMap(r => r.warnings));
      result.filesGenerated.push(...serviceResult.results.flatMap(r => r.filesModified));
      result.dependenciesAdded.push(...serviceResult.results.flatMap(r => r.dependenciesAdded));
    }

    // Then execute fragments
    if (config.fragments.length > 0) {
      consola.info("Executing fragments...");
      const fragmentResult = await this.fragmentService.generateTemplate({
        fragmentNames: config.fragments,
        projectConfig: config.projectConfig,
        framework: config.framework,
        context: config.context,
        outputPath: config.outputPath,
        processingOptions: {
          dryRun: config.options.dryRun,
          overwrite: config.options.overwrite,
          skipValidation: config.options.skipValidation,
        },
      });

      result.fragmentResults = fragmentResult.results;
      result.errors.push(...fragmentResult.errors);
      result.warnings.push(...fragmentResult.warnings);
      result.filesGenerated.push(...fragmentResult.results.flatMap(r => r.filesProcessed));
      result.dependenciesAdded.push(...fragmentResult.dependencies.map(d => `${d.name}@${d.version || 'latest'}`));
    }
  }

  /**
   * Execute parallel strategy
   */
  private async executeParallel(
    config: TemplateCompositionConfig,
    plan: CompositionPlan,
    result: CompositionResult
  ): Promise<void> {
    const promises: Promise<any>[] = [];

    // Execute fragments in parallel
    if (config.fragments.length > 0) {
      promises.push(
        this.fragmentService.generateTemplate({
          fragmentNames: config.fragments,
          projectConfig: config.projectConfig,
          framework: config.framework,
          context: config.context,
          outputPath: config.outputPath,
          processingOptions: {
            dryRun: config.options.dryRun,
            overwrite: config.options.overwrite,
            skipValidation: config.options.skipValidation,
          },
        })
      );
    }

    // Execute services in parallel (with dependency resolution)
    if (config.services.length > 0) {
      promises.push(
        this.serviceInjectionService.injectServices({
          serviceConfigs: config.services,
          projectPath: config.outputPath,
          injectionOptions: {
            dryRun: config.options.dryRun,
            overwrite: config.options.overwrite,
            skipValidation: config.options.skipValidation,
          },
        })
      );
    }

    const results = await Promise.allSettled(promises);

    // Process fragment results
    if (results[0] && results[0].status === "fulfilled") {
      const fragmentResult = results[0].value;
      result.fragmentResults = fragmentResult.results;
      result.errors.push(...fragmentResult.errors);
      result.warnings.push(...fragmentResult.warnings);
      result.filesGenerated.push(...fragmentResult.results.flatMap((r: any) => r.filesProcessed));
      result.dependenciesAdded.push(...fragmentResult.dependencies.map((d: any) => `${d.name}@${d.version || 'latest'}`));
    } else if (results[0] && results[0].status === "rejected") {
      result.errors.push(`Fragment execution failed: ${results[0].reason}`);
    }

    // Process service results
    if (results[1] && results[1].status === "fulfilled") {
      const serviceResult = results[1].value;
      result.serviceResults = serviceResult.results;
      result.errors.push(...serviceResult.results.flatMap((r: any) => r.errors));
      result.warnings.push(...serviceResult.results.flatMap((r: any) => r.warnings));
      result.filesGenerated.push(...serviceResult.results.flatMap((r: any) => r.filesModified));
      result.dependenciesAdded.push(...serviceResult.results.flatMap((r: any) => r.dependenciesAdded));
    } else if (results[1] && results[1].status === "rejected") {
      result.errors.push(`Service execution failed: ${results[1].reason}`);
    }
  }

  /**
   * Execute optimized strategy
   */
  private async executeOptimized(
    config: TemplateCompositionConfig,
    plan: CompositionPlan,
    result: CompositionResult
  ): Promise<void> {
    // For now, use fragments-first as the optimized strategy
    // This can be enhanced with more sophisticated optimization logic
    await this.executeFragmentsFirst(config, plan, result);
  }

  /**
   * Validate fragment-service compatibility
   */
  private async validateFragmentServiceCompatibility(
    config: TemplateCompositionConfig,
    errors: string[],
    warnings: string[],
    compatibilityIssues: CompositionValidationResult["compatibilityIssues"]
  ): Promise<void> {
    // Check for common compatibility issues
    const hasAuthFragment = config.fragments.some(f => f.includes("auth"));
    const hasAuthService = config.services.some(s => s.type === "auth");

    if (hasAuthFragment && hasAuthService) {
      warnings.push("Both auth fragment and auth service detected - ensure they are compatible");
      compatibilityIssues.push({
        type: "fragment-conflict",
        message: "Auth fragment and auth service may conflict",
        affected: ["auth"],
      });
    }

    // Check framework compatibility
    const incompatibleServices = config.services.filter(service => {
      // Add logic to check if service supports the framework
      return false; // Placeholder
    });

    for (const service of incompatibleServices) {
      errors.push(`Service ${service.name} is not compatible with framework ${config.framework}`);
      compatibilityIssues.push({
        type: "framework-mismatch",
        message: `${service.name} incompatible with ${config.framework}`,
        affected: [service.name],
      });
    }
  }

  /**
   * Extract affected items from error message
   */
  private extractAffectedItems(error: string): string[] {
    // Simple extraction - can be enhanced with regex patterns
    const words = error.split(" ");
    return words.filter(word => 
      word.length > 3 && 
      !["with", "and", "the", "that", "this", "conflicts", "requires"].includes(word.toLowerCase())
    );
  }

  /**
   * Generate composition manifest
   */
  private async generateManifest(
    config: TemplateCompositionConfig,
    result: CompositionResult
  ): Promise<CompositionManifest> {
    return {
      version: "1.0.0",
      generatedAt: new Date(),
      config,
      fragments: result.fragmentResults.map(r => ({
        name: r.fragmentName,
        version: "1.0.0", // Would be resolved from actual fragment
        files: r.filesProcessed,
      })),
      services: result.serviceResults.map(r => ({
        name: r.serviceId,
        type: "auth" as any, // Would be resolved from actual service
        provider: "unknown", // Would be resolved from actual service
        files: r.filesModified,
      })),
      dependencies: result.dependenciesAdded.map(dep => {
        const [name, version] = dep.split("@");
        return {
          name,
          version: version || "latest",
          type: "runtime" as const,
        };
      }),
      envVariables: result.serviceResults.flatMap(r => 
        r.envVarsAdded.map(envVar => ({
          name: envVar,
          required: true,
          description: `Environment variable for ${r.serviceId}`,
        }))
      ),
      postActions: [], // Would be populated from service templates
    };
  }

  /**
   * Save manifest to file
   */
  private async saveManifest(manifest: CompositionManifest, outputPath: string): Promise<void> {
    const manifestPath = path.join(outputPath, ".xaheen", "composition-manifest.json");
    await fs.ensureDir(path.dirname(manifestPath));
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    consola.debug(`Composition manifest saved to: ${manifestPath}`);
  }
}