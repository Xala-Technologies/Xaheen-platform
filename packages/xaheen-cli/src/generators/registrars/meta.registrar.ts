/**
 * Meta-Generator Registrar
 * 
 * Registers all meta-generators with the central GeneratorRegistry.
 * Meta-generators are specialized generators that can create other generators,
 * enabling Rails-style meta-programming capabilities within the Xaheen CLI.
 */

import { GeneratorRegistry } from '../core/registry';
import { GeneratorDomain } from '../core/types';

// Import meta-generators
import { GeneratorGenerator } from '../meta/generator/GeneratorGenerator';
import { TemplateGenerator } from '../meta/template/TemplateGenerator';
import { WorkflowGenerator } from '../meta/workflow/WorkflowGenerator';
import { PluginGenerator } from '../meta/plugin/PluginGenerator';
import { MarketplaceItemGenerator } from '../meta/marketplace/MarketplaceItemGenerator';
import { ExtensionGenerator } from '../meta/extension/ExtensionGenerator';

/**
 * Register all meta-generators with the GeneratorRegistry
 * 
 * @param registry The central generator registry
 */
export function registerMetaGenerators(registry: GeneratorRegistry): void {
  console.log('Registering meta-generators...');
  
  // Register generator creation meta-generators
  registry.register(GeneratorGenerator, GeneratorDomain.META);
  registry.register(TemplateGenerator, GeneratorDomain.META);
  
  // Register workflow and plugin meta-generators
  registry.register(WorkflowGenerator, GeneratorDomain.META);
  registry.register(PluginGenerator, GeneratorDomain.META);
  
  // Register ecosystem meta-generators
  registry.register(MarketplaceItemGenerator, GeneratorDomain.META);
  registry.register(ExtensionGenerator, GeneratorDomain.META);
  
  console.log('Meta-generators registered successfully');
}

// Export default function for dynamic importing
export default registerMetaGenerators;
