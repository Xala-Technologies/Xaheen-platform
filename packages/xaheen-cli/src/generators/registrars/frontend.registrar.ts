/**
 * @fileoverview Frontend Generator Registrar Module
 * @description Registers all frontend generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from "../core/index";
import { PageGenerator } from "../page.generator";
import { LayoutGenerator } from "../layout.generator";
import { ComponentGenerator } from "../component.generator";
// Import other frontend generators as they become available

/**
 * Register all frontend generators with the registry
 * @param registry The generator registry instance
 */
export function registerFrontendGenerators(registry: IGeneratorRegistry): void {
  // Register page generator
  registry.registerGenerator(
    GeneratorDomain.FRONTEND,
    'page',
    PageGenerator
  );
  
  // Register layout generator
  registry.registerGenerator(
    GeneratorDomain.FRONTEND,
    'layout',
    LayoutGenerator
  );
  
  // Register component generator
  registry.registerGenerator(
    GeneratorDomain.FRONTEND,
    'component',
    ComponentGenerator
  );
  
  // Additional frontend generators will be registered here
  // For example:
  // registry.registerGenerator(GeneratorDomain.FRONTEND, 'hook', HookGenerator);
  // registry.registerGenerator(GeneratorDomain.FRONTEND, 'context', ContextGenerator);
  // registry.registerGenerator(GeneratorDomain.FRONTEND, 'provider', ProviderGenerator);
  
  console.log(`[Generator Registry] Registered frontend generators`);
}
