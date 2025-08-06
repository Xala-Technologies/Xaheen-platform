/**
 * IGenerator Interface
 * Defines the contract for all generator implementations
 * Single Responsibility: Generate code artifacts based on options
 */

import type { GeneratorResult } from "../../../types/index";

/**
 * Generator interface for creating code artifacts
 * @template TOptions - The options type specific to the generator
 */
export interface IGenerator<TOptions> {
  /**
   * Generate code artifacts based on the provided options
   * @param options - Configuration options for the generator
   * @returns Promise resolving to the generation result
   */
  generate(options: TOptions): Promise<GeneratorResult>;
}
