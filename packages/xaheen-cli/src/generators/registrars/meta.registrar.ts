/**
 * Meta-Generator Registrar
 * 
 * Registers all meta-generators with the central GeneratorRegistry.
 * Meta-generators are specialized generators that can create other generators,
 * enabling Rails-style meta-programming capabilities within the Xaheen CLI.
 */

import { GeneratorRegistry, IGeneratorRegistry, GeneratorDomain } from "../core/index";
import { IGenerator } from "../core/interfaces/IGenerator";

// Generic result type for all generators
type GeneratorResult = { success: boolean; message: string; error?: string };

// Base options for all meta generators
type MetaGeneratorOptions = {
  name: string;
  outputDir?: string;
  template?: string;
  force?: boolean;
  dryRun?: boolean;
};

// Mock implementation of Meta generators
class GeneratorGenerator implements IGenerator<MetaGeneratorOptions> {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    console.log('Generator Generator executed with:', options);
    return { success: true, message: 'New generator scaffold created (mock)' };
  }
}

class TemplateGenerator implements IGenerator<MetaGeneratorOptions> {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    console.log('Template Generator executed with:', options);
    return { success: true, message: 'New generator template created (mock)' };
  }
}

class WorkflowGenerator implements IGenerator<MetaGeneratorOptions> {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    console.log('Workflow Generator executed with:', options);
    return { success: true, message: 'New workflow created (mock)' };
  }
}

class PluginGenerator implements IGenerator<MetaGeneratorOptions> {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    console.log('Plugin Generator executed with:', options);
    return { success: true, message: 'New plugin scaffold created (mock)' };
  }
}

class MarketplaceItemGenerator implements IGenerator<MetaGeneratorOptions> {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    console.log('Marketplace Item Generator executed with:', options);
    return { success: true, message: 'New marketplace item created (mock)' };
  }
}

class ExtensionGenerator implements IGenerator<MetaGeneratorOptions> {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult> {
    console.log('Extension Generator executed with:', options);
    return { success: true, message: 'New extension scaffold created (mock)' };
  }
}

/**
 * Register all meta-generators with the GeneratorRegistry
 * 
 * @param registry The central generator registry
 */
export function registerMetaGenerators(registry: IGeneratorRegistry): void {
  console.log('Registering meta-generators...');
  
  // Register generator creation meta-generators
  registry.registerGenerator(GeneratorDomain.META, 'generator', GeneratorGenerator);
  registry.registerGenerator(GeneratorDomain.META, 'template', TemplateGenerator);
  
  // Register workflow and plugin meta-generators
  registry.registerGenerator(GeneratorDomain.META, 'workflow', WorkflowGenerator);
  registry.registerGenerator(GeneratorDomain.META, 'plugin', PluginGenerator);
  
  // Register ecosystem meta-generators
  registry.registerGenerator(GeneratorDomain.META, 'marketplace', MarketplaceItemGenerator);
  registry.registerGenerator(GeneratorDomain.META, 'extension', ExtensionGenerator);
  
  console.log('Meta-generators registered successfully');
}

// Export default function for dynamic importing
export default registerMetaGenerators;
