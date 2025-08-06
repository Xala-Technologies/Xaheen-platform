/**
 * IGeneratorRegistry Interface
 * Defines the contract for generator registry implementations
 * Single Responsibility: Maintain a registry of available generators
 */

import type { IGenerator } from "./IGenerator";

/**
 * Registry interface for managing generator registrations
 */
export interface IGeneratorRegistry {
  /**
   * Register a generator class for a specific category and type
   * @param category - The generator category (e.g., 'frontend', 'backend')
   * @param type - The generator type within the category
   * @param generatorClass - The generator class to register
   * @returns void
   */
  registerGenerator<T>(category: string, type: string, generatorClass: new () => IGenerator<T>): void;
  
  /**
   * Get a generator class for the specified category and type
   * @param category - The generator category
   * @param type - The generator type
   * @returns The generator class or undefined if not found
   */
  getGenerator(category: string, type: string): new () => IGenerator<any> | undefined;
  
  /**
   * Check if a generator exists for the specified category and type
   * @param category - The generator category
   * @param type - The generator type
   * @returns True if the generator exists, false otherwise
   */
  hasGenerator(category: string, type: string): boolean;
  
  /**
   * Get all registered generator types for a specific category
   * @param category - The generator category
   * @returns Array of generator types or empty array if category doesn't exist
   */
  getGeneratorTypes(category: string): string[];
  
  /**
   * Get all registered categories
   * @returns Array of category names
   */
  getCategories(): string[];
}
