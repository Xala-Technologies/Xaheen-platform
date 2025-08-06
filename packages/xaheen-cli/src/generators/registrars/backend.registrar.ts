/**
 * @fileoverview Backend Generator Registrar Module
 * @description Registers all backend generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from "../core/index";
import { BackendGenerator } from "../backend/index";
import { ServiceGenerator } from "../service.generator";
import { ControllerGenerator } from "../controller.generator";
import { ModelGenerator } from "../model.generator";
import { MiddlewareGenerator } from "../middleware.generator";
// Import other backend generators as they become available

/**
 * Register all backend generators with the registry
 * @param registry The generator registry instance
 * @returns void
 */
export function registerBackendGenerators(registry: IGeneratorRegistry): void {
  // Register controller generator
  registry.registerGenerator(
    GeneratorDomain.BACKEND,
    'controller',
    ControllerGenerator
  );
  
  // Register service generator
  registry.registerGenerator(
    GeneratorDomain.BACKEND,
    'service',
    ServiceGenerator
  );
  
  // Register model generator
  registry.registerGenerator(
    GeneratorDomain.BACKEND,
    'model',
    ModelGenerator
  );
  
  // Register middleware generator
  registry.registerGenerator(
    GeneratorDomain.BACKEND,
    'middleware',
    MiddlewareGenerator
  );
  
  // Register general backend generator
  registry.registerGenerator(
    GeneratorDomain.BACKEND,
    'api',
    BackendGenerator
  );
  
  // Additional backend generators will be registered here
  // For example:
  // registry.registerGenerator(GeneratorDomain.BACKEND, 'guard', GuardGenerator);
  // registry.registerGenerator(GeneratorDomain.BACKEND, 'interceptor', InterceptorGenerator);
  // registry.registerGenerator(GeneratorDomain.BACKEND, 'pipe', PipeGenerator);
  // registry.registerGenerator(GeneratorDomain.BACKEND, 'decorator', DecoratorGenerator);
  
  console.log(`[Generator Registry] Registered backend generators`);
}
