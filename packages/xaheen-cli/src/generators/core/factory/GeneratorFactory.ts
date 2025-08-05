/**
 * GeneratorFactory
 * A factory for creating instances of generators
 * Implements the IGeneratorFactory interface
 */

import { IGenerator } from '../interfaces/IGenerator.js';
import { IGeneratorFactory } from '../interfaces/IGeneratorFactory.js';
import { IGeneratorRegistry } from '../interfaces/IGeneratorRegistry.js';
import { logger } from '../../../utils/logger.js';

/**
 * Factory implementation for creating generator instances
 */
export class GeneratorFactory implements IGeneratorFactory {
  /**
   * Constructor
   * @param registry - The generator registry to use for looking up generator classes
   */
  constructor(private readonly registry: IGeneratorRegistry) {}

  /**
   * Register a generator class with the underlying registry
   * @param domain - Generator domain/category
   * @param type - Generator type
   * @param generatorClass - Constructor for the generator class
   */
  public registerGenerator<T>(
    domain: string,
    type: string,
    generatorClass: new () => IGenerator<T>
  ): void {
    this.registry.registerGenerator(domain, type, generatorClass);
  }

  /**
   * Create an instance of a generator
   * @param domain - Generator domain/category
   * @param type - Generator type
   * @returns Instance of the generator or null if not found
   */
  public createGenerator<TOptions>(
    domain: string,
    type: string
  ): IGenerator<TOptions> | null {
    const GeneratorClass = this.registry.getGenerator(domain, type);
    
    if (!GeneratorClass) {
      logger.error(`Generator not found: ${domain}:${type}`);
      return null;
    }
    
    try {
      return new GeneratorClass() as IGenerator<TOptions>;
    } catch (error) {
      logger.error(`Failed to create generator instance: ${domain}:${type}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Check if a generator exists for the given domain and type
   * @param domain - Generator domain/category
   * @param type - Generator type
   * @returns Boolean indicating if the generator exists
   */
  public hasGenerator(domain: string, type: string): boolean {
    return this.registry.hasGenerator(domain, type);
  }

  /**
   * Get all registered generator domains/categories
   * @returns Array of generator domains
   */
  public getDomains(): string[] {
    return this.registry.getCategories();
  }

  /**
   * Get all generator types for a specific domain
   * @param domain - Generator domain/category
   * @returns Array of generator types
   */
  public getGeneratorTypes(domain: string): string[] {
    return this.registry.getGeneratorTypes(domain);
  }

  /**
   * Get all registered generators as a map of domain -> types
   * @returns Map of domains to arrays of types
   */
  public getAllGenerators(): Map<string, string[]> {
    const result = new Map<string, string[]>();
    
    for (const domain of this.registry.getCategories()) {
      result.set(domain, this.registry.getGeneratorTypes(domain));
    }
    
    return result;
  }
}
