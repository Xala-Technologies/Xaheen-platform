/**
 * Fragment Composition Engine
 * Orchestrates the composition of multiple fragments into a complete template
 */

import consola from "consola";
import type {
  FragmentCompositionEngine,
  FragmentCompositionContext,
  FragmentProcessingResult,
  FragmentDependency,
  FragmentRegistry,
  FragmentProcessor,
} from "../interfaces/fragment-base";

export class CoreCompositionEngine implements FragmentCompositionEngine {
  constructor(
    private readonly registry: FragmentRegistry,
    private readonly processor: FragmentProcessor
  ) {}

  /**
   * Compose multiple fragments into a complete template
   */
  async composeFragments(
    fragmentNames: readonly string[],
    context: FragmentCompositionContext,
    outputPath: string
  ): Promise<{
    results: readonly FragmentProcessingResult[];
    compositionSuccess: boolean;
    totalFilesProcessed: number;
    totalDependencies: readonly FragmentDependency[];
  }> {
    consola.info(`Composing ${fragmentNames.length} fragments...`);

    // Validate composition first
    const validation = await this.validateComposition(fragmentNames, context);
    if (!validation.valid) {
      throw new Error(`Composition validation failed: ${validation.errors.join(", ")}`);
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      for (const warning of validation.warnings) {
        consola.warn(warning);
      }
    }

    // Resolve processing order
    const processingOrder = await this.resolveProcessingOrder(fragmentNames);
    consola.debug(`Processing order: ${processingOrder.join(" -> ")}`);

    const results: FragmentProcessingResult[] = [];
    const allDependencies: FragmentDependency[] = [];
    let totalFilesProcessed = 0;
    let compositionSuccess = true;

    // Process fragments in dependency order
    for (const fragmentName of processingOrder) {
      try {
        const fragment = await this.registry.getFragment(fragmentName);
        if (!fragment) {
          const error = `Fragment not found: ${fragmentName}`;
          consola.error(error);
          results.push({
            success: false,
            fragmentName,
            filesProcessed: [],
            dependenciesAdded: [],
            errors: [error],
            warnings: [],
            skipped: [],
          });
          compositionSuccess = false;
          continue;
        }

        consola.info(`Processing fragment: ${fragmentName}`);
        const result = await this.processor.processFragment(fragment, context, outputPath);
        
        results.push(result);
        totalFilesProcessed += result.filesProcessed.length;
        allDependencies.push(...result.dependenciesAdded);

        if (!result.success) {
          compositionSuccess = false;
          consola.error(`Fragment ${fragmentName} failed:`, result.errors);
        } else {
          consola.success(`Fragment ${fragmentName} processed successfully`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        consola.error(`Error processing fragment ${fragmentName}:`, error);
        
        results.push({
          success: false,
          fragmentName,
          filesProcessed: [],
          dependenciesAdded: [],
          errors: [errorMessage],
          warnings: [],
          skipped: [],
        });
        compositionSuccess = false;
      }
    }

    // Deduplicate dependencies
    const uniqueDependencies = this.deduplicateDependencies(allDependencies);

    const summary = {
      results,
      compositionSuccess,
      totalFilesProcessed,
      totalDependencies: uniqueDependencies,
    };

    if (compositionSuccess) {
      consola.success(
        `Composition completed successfully: ${totalFilesProcessed} files processed, ` +
        `${uniqueDependencies.length} dependencies resolved`
      );
    } else {
      consola.error("Composition completed with errors");
    }

    return summary;
  }

  /**
   * Validate composition before processing
   */
  async validateComposition(
    fragmentNames: readonly string[],
    context: FragmentCompositionContext
  ): Promise<{
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (fragmentNames.length === 0) {
      errors.push("No fragments specified for composition");
      return { valid: false, errors, warnings };
    }

    // Check if all fragments exist
    const missingFragments: string[] = [];
    for (const name of fragmentNames) {
      const fragment = await this.registry.getFragment(name);
      if (!fragment) {
        missingFragments.push(name);
      }
    }

    if (missingFragments.length > 0) {
      errors.push(`Missing fragments: ${missingFragments.join(", ")}`);
    }

    // Check compatibility
    const compatibility = await this.registry.checkCompatibility(fragmentNames, context);
    if (!compatibility.compatible) {
      errors.push(...compatibility.conflicts);
      errors.push(...compatibility.missing);
    }

    // Check for potential issues
    const duplicateFragments = this.findDuplicates(fragmentNames);
    if (duplicateFragments.length > 0) {
      warnings.push(`Duplicate fragments specified: ${duplicateFragments.join(", ")}`);
    }

    // Validate dependency cycles
    try {
      await this.resolveProcessingOrder(fragmentNames);
    } catch (error) {
      if (error instanceof Error && error.message.includes("circular dependency")) {
        errors.push(error.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Resolve the correct processing order based on dependencies
   */
  private async resolveProcessingOrder(fragmentNames: readonly string[]): Promise<readonly string[]> {
    const fragments = new Map<string, { dependencies: string[]; processed: boolean }>();
    
    // Build dependency graph
    for (const name of fragmentNames) {
      const fragment = await this.registry.getFragment(name);
      if (!fragment) {
        continue;
      }

      const dependencies = fragment.compatibility?.requires || [];
      // Only include dependencies that are in our selection
      const relevantDependencies = dependencies.filter(dep => fragmentNames.includes(dep));
      
      fragments.set(name, {
        dependencies: relevantDependencies,
        processed: false,
      });
    }

    const processingOrder: string[] = [];
    const processing = new Set<string>();

    const processFragment = (name: string): void => {
      if (processing.has(name)) {
        throw new Error(`Circular dependency detected involving fragment: ${name}`);
      }

      const fragmentInfo = fragments.get(name);
      if (!fragmentInfo || fragmentInfo.processed) {
        return;
      }

      processing.add(name);

      // Process dependencies first
      for (const dep of fragmentInfo.dependencies) {
        processFragment(dep);
      }

      processing.delete(name);
      fragmentInfo.processed = true;
      processingOrder.push(name);
    };

    // Process all fragments
    for (const name of fragmentNames) {
      processFragment(name);
    }

    return processingOrder;
  }

  /**
   * Deduplicate dependencies, preferring more specific versions
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
        continue;
      }

      // Prefer specific versions over unspecified
      if (dep.version && !existing.version) {
        dependencyMap.set(dep.name, dep);
        continue;
      }

      // Prefer higher versions (basic semver comparison)
      if (dep.version && existing.version) {
        const depVersion = this.parseVersion(dep.version);
        const existingVersion = this.parseVersion(existing.version);
        
        if (this.compareVersions(depVersion, existingVersion) > 0) {
          dependencyMap.set(dep.name, dep);
        }
      }
    }

    return Array.from(dependencyMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find duplicate items in an array
   */
  private findDuplicates<T>(items: readonly T[]): T[] {
    const seen = new Set<T>();
    const duplicates = new Set<T>();

    for (const item of items) {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    }

    return Array.from(duplicates);
  }

  /**
   * Parse version string into comparable components
   */
  private parseVersion(version: string): [number, number, number] {
    const cleaned = version.replace(/^[^0-9]*/, ""); // Remove prefixes like ^ or ~
    const parts = cleaned.split(".").map(Number);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  }

  /**
   * Compare two version tuples
   */
  private compareVersions(a: [number, number, number], b: [number, number, number]): number {
    for (let i = 0; i < 3; i++) {
      if (a[i] !== b[i]) {
        return a[i] - b[i];
      }
    }
    return 0;
  }
}