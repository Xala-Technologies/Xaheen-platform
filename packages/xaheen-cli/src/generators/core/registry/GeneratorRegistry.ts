/**
 * GeneratorRegistry
 * A registry for all generator classes organized by category and type
 * Implements the IGeneratorRegistry interface
 */

import { IGenerator } from '../interfaces/IGenerator.js';
import { IGeneratorRegistry } from '../interfaces/IGeneratorRegistry.js';
import { logger } from '../../../utils/logger.js';

/**
 * Registry implementation for managing generator registrations
 */
export class GeneratorRegistry implements IGeneratorRegistry {
  /**
   * Internal storage for generator classes by category and type
   * @private
   */
  private readonly generators: Map<string, Map<string, new () => IGenerator<any>>> = new Map();

  /**
   * Register a generator class with the registry
   * @param category - Generator category (e.g., frontend, backend, database)
   * @param type - Generator type (e.g., component, page, model)
   * @param generatorClass - Constructor for the generator class
   */
  public registerGenerator<T>(
    category: string,
    type: string,
    generatorClass: new () => IGenerator<T>
  ): void {
    // Ensure category map exists
    if (!this.generators.has(category)) {
      this.generators.set(category, new Map());
    }

    // Get category map
    const categoryMap = this.generators.get(category)!;

    // Check if generator is already registered
    if (categoryMap.has(type)) {
      logger.warn(`Generator of type '${type}' in category '${category}' is being overridden`);
    }

    // Register the generator
    categoryMap.set(type, generatorClass);
    logger.info(`Registered generator: ${category}:${type}`);
  }

  /**
   * Get a generator class by category and type
   * @param category - Generator category
   * @param type - Generator type
   * @returns Constructor for the generator class, or undefined if not found
   */
  public getGenerator(category: string, type: string): (new () => IGenerator<any>) | undefined {
    const categoryMap = this.generators.get(category);
    if (!categoryMap) {
      return undefined;
    }

    return categoryMap.get(type);
  }

  /**
   * Check if a generator exists for the given category and type
   * @param category - Generator category
   * @param type - Generator type
   * @returns Boolean indicating if the generator exists
   */
  public hasGenerator(category: string, type: string): boolean {
    const categoryMap = this.generators.get(category);
    if (!categoryMap) {
      return false;
    }

    return categoryMap.has(type);
  }

  /**
   * Get all generator types for a specific category
   * @param category - Generator category
   * @returns Array of generator types
   */
  public getGeneratorTypes(category: string): string[] {
    const categoryMap = this.generators.get(category);
    if (!categoryMap) {
      return [];
    }

    return Array.from(categoryMap.keys());
  }

  /**
   * Get all registered generator categories
   * @returns Array of generator categories
   */
  public getCategories(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Get all registered generators as a map of category -> types
   * @returns Map of categories to arrays of types
   */
  public getAllGenerators(): Map<string, string[]> {
    const result = new Map<string, string[]>();
    
    for (const [category, typeMap] of this.generators.entries()) {
      result.set(category, Array.from(typeMap.keys()));
    }
    
    return result;
  }
}
