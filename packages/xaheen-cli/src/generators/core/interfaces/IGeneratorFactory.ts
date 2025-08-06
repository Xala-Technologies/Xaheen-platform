/**
 * IGeneratorFactory Interface
 * Defines the contract for generator factory implementations
 * Single Responsibility: Create generator instances by type
 */

import type { IGenerator } from "./IGenerator";

/**
 * Factory interface for creating generator instances
 */
export interface IGeneratorFactory {
  /**
   * Register a generator class for a specific domain and type
   * @param domain - The generator domain (e.g., 'frontend', 'backend')
   * @param type - The generator type within the domain
   * @param generatorClass - The generator class to register
   * @returns void
   */
  registerGenerator<T>(domain: string, type: string, generatorClass: new () => IGenerator<T>): void;

  /**
   * Create a generator instance for the specified domain and type
   * @param domain - The generator domain (e.g., 'frontend', 'backend')
   * @param type - The generator type within the domain
   * @returns A generator instance or null if not found
   */
  createGenerator<TOptions>(domain: string, type: string): IGenerator<TOptions> | null;

  /**
   * Check if a generator exists for the specified domain and type
   * @param domain - The generator domain
   * @param type - The generator type
   * @returns True if the generator exists, false otherwise
   */
  hasGenerator(domain: string, type: string): boolean;
}
