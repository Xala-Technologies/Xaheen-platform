/**
 * @fileoverview Full-Stack Generator Registrar Module
 * @description Registers all full-stack generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from '../core/index.js';
import { ScaffoldGenerator } from '../scaffold.generator.js';
// Import other fullstack generators as they become available

/**
 * Register all full-stack generators with the registry
 * @param registry The generator registry instance
 * @returns void
 */
export function registerFullStackGenerators(registry: IGeneratorRegistry): void {
  // Register scaffold generator
  registry.registerGenerator(
    GeneratorDomain.FULLSTACK,
    'scaffold',
    ScaffoldGenerator
  );
  
  // Additional full-stack generators will be registered here
  // For example:
  // registry.registerGenerator(GeneratorDomain.FULLSTACK, 'crud', CrudGenerator);
  // registry.registerGenerator(GeneratorDomain.FULLSTACK, 'auth', AuthGenerator);
  // registry.registerGenerator(GeneratorDomain.FULLSTACK, 'feature', FeatureGenerator);
  
  console.log(`[Generator Registry] Registered full-stack generators`);
}
