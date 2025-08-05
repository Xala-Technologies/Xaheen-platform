/**
 * @fileoverview Patterns Generator Registrar Module
 * @description Registers all software pattern generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from '../core/index.js';
import {
  CleanArchitectureGenerator,
  CQRSEventSourcingGenerator,
  DDDPatternGenerator,
  DependencyInjectionGenerator
} from '../patterns/index.js';

/**
 * Register all pattern generators with the registry
 * @param registry The generator registry instance
 * @returns void
 */
export function registerPatternsGenerators(registry: IGeneratorRegistry): void {
  // Register DDD pattern generator
  registry.registerGenerator(
    GeneratorDomain.PATTERNS,
    'ddd',
    DDDPatternGenerator
  );
  
  // Register Clean Architecture generator
  registry.registerGenerator(
    GeneratorDomain.PATTERNS,
    'clean-architecture',
    CleanArchitectureGenerator
  );
  
  // Register CQRS & Event Sourcing generator
  registry.registerGenerator(
    GeneratorDomain.PATTERNS,
    'cqrs',
    CQRSEventSourcingGenerator
  );
  
  // Register Dependency Injection generator
  registry.registerGenerator(
    GeneratorDomain.PATTERNS,
    'di',
    DependencyInjectionGenerator
  );
  
  // Additional pattern generators will be registered here
  // For example:
  // registry.registerGenerator(GeneratorDomain.PATTERNS, 'adapter', AdapterPatternGenerator);
  
  console.log(`[Generator Registry] Registered pattern generators`);
}
