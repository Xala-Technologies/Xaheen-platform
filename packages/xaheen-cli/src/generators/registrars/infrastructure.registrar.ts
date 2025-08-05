/**
 * @fileoverview Infrastructure Generator Registrar Module
 * @description Registers all infrastructure generators with the registry system
 * @author Xala Technologies
 */

import { IGeneratorRegistry, GeneratorDomain } from '../core/index.js';
import { 
  createInfrastructureGenerator,
  DockerGenerator 
} from '../infrastructure/index.js';
// Import other infrastructure generators as they become available

/**
 * Register all infrastructure generators with the registry
 * @param registry The generator registry instance
 * @returns void
 */
export function registerInfrastructureGenerators(registry: IGeneratorRegistry): void {
  // Register Docker generator
  registry.registerGenerator(
    GeneratorDomain.INFRASTRUCTURE,
    'docker',
    DockerGenerator
  );
  
  // Register other infrastructure generators
  // For example:
  // registry.registerGenerator(GeneratorDomain.INFRASTRUCTURE, 'k8s', KubernetesGenerator);
  // registry.registerGenerator(GeneratorDomain.INFRASTRUCTURE, 'ci', CIGenerator);
  // registry.registerGenerator(GeneratorDomain.INFRASTRUCTURE, 'deployment', DeploymentGenerator);
  // registry.registerGenerator(GeneratorDomain.INFRASTRUCTURE, 'terraform', TerraformGenerator);
  
  console.log(`[Generator Registry] Registered infrastructure generators`);
}
