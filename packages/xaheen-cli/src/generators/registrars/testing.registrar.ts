/**
 * @fileoverview Testing Generator Registrar Module
 * @description Registers all testing generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from '../core/index.js';
import { TestGenerator } from '../test.generator.js';
// Import other testing generators as they become available

/**
 * Register all testing generators with the registry
 * @param registry The generator registry instance
 * @returns void
 */
export function registerTestingGenerators(registry: IGeneratorRegistry): void {
  // Register test generator
  registry.registerGenerator(
    GeneratorDomain.TESTING,
    'test',
    TestGenerator
  );
  
  // Additional testing generators will be registered here
  // For example:
  // registry.registerGenerator(GeneratorDomain.TESTING, 'e2e', E2ETestGenerator);
  // registry.registerGenerator(GeneratorDomain.TESTING, 'mock', MockGenerator);
  
  console.log(`[Generator Registry] Registered testing generators`);
}
