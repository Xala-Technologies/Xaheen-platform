/**
 * Meta-Generator System - Advanced generator composition and meta-programming
 * 
 * This module provides:
 * - Meta-generators that generate other generators (Rails-style)
 * - Advanced generator composition and workflow orchestration
 * - Template inheritance and composition system
 * - Generator marketplace with versioning and distribution
 * - Comprehensive validation and analytics
 * - Performance optimization and debugging tools
 */

// Core meta-generator system
export { MetaGenerator } from './meta-generator';
export { GeneratorRegistry } from './generator-registry';
export { GeneratorComposer } from './generator-composer';
export { TemplateEngine } from './template-engine';

// Validation and analytics
export { GeneratorValidator } from './generator-validator';
export { GeneratorAnalytics } from './generator-analytics';

// Security and advanced features
export { GeneratorSecurityScanner } from './generator-security';
export { AdvancedGeneratorFeatures } from './advanced-features';

// Marketplace and distribution
export { GeneratorMarketplace } from './marketplace';

// Types and interfaces
export * from './types';

// Re-export base generator for convenience
export { BaseGenerator, type GeneratorResult } from '../base.generator';

/**
 * Create a complete meta-generator system instance
 */
export async function createMetaGeneratorSystem(options: {
  registryPath?: string;
  marketplaceConfig?: any;
  validationRules?: any;
  analyticsConfig?: any;
  securityConfig?: any;
  debugOptions?: any;
} = {}) {
  const registry = new GeneratorRegistry(options.registryPath);
  const validator = new GeneratorValidator(options.validationRules);
  const analytics = new GeneratorAnalytics(options.analyticsConfig);
  const security = new GeneratorSecurityScanner(options.securityConfig);
  const marketplace = new GeneratorMarketplace(registry, validator, analytics, options.marketplaceConfig);
  const composer = new GeneratorComposer(registry);
  const advancedFeatures = new AdvancedGeneratorFeatures(registry, composer);
  const metaGenerator = new MetaGenerator();

  // Wait for all systems to initialize
  await Promise.all([
    // Registry loads automatically
    // Marketplace syncs if auto-update is enabled
  ]);

  return {
    registry,
    validator,
    analytics,
    security,
    marketplace,
    composer,
    advancedFeatures,
    metaGenerator,
    
    // Convenience methods
    async generateGenerator(templateId: string, targetMetadata: any, options: any = {}) {
      return metaGenerator.generate({
        name: targetMetadata.name,
        templateId,
        targetGenerator: targetMetadata,
        customOptions: options,
        ...options
      });
    },

    async publishGenerator(generatorId: string, options: any = {}) {
      return marketplace.publishGenerator(generatorId, options);
    },

    async installGenerator(generatorId: string, version?: string) {
      return marketplace.installGenerator(generatorId, version);
    },

    async searchGenerators(options: any = {}) {
      return marketplace.searchGenerators(options);
    },

    async validateGenerator(generatorId: string) {
      const entry = await registry.getGenerator(generatorId);
      if (!entry) {
        throw new Error(`Generator not found: ${generatorId}`);
      }
      return validator.validateGenerator(entry);
    },

    async getGeneratorAnalytics(generatorId: string) {
      return analytics.getGeneratorAnalytics(generatorId);
    },

    async scanGeneratorSecurity(generatorId: string) {
      const entry = await registry.getGenerator(generatorId);
      if (!entry) {
        throw new Error(`Generator not found: ${generatorId}`);
      }
      return security.scanGenerator(entry);
    },

    async executeConditionalGeneration(generatorId: string, baseOptions: any, conditions: any) {
      return advancedFeatures.executeConditionalGeneration(generatorId, baseOptions, conditions);
    },

    async executeBatchGeneration(targets: any[]) {
      return advancedFeatures.executeBatchGeneration({
        targets,
        parallelism: 3,
        failureStrategy: 'continue'
      });
    },

    async debugGeneration(generatorId: string, options: any, debugOptions: any) {
      return advancedFeatures.startDebugSession(generatorId, options, debugOptions);
    },

    async inspectTemplate(templatePath: string) {
      return advancedFeatures.inspectTemplate(templatePath);
    },

    async composeGenerators(composition: any) {
      return composer.executeComposition(composition);
    },

    // Cleanup
    async dispose() {
      await Promise.all([
        registry.dispose?.(),
        analytics.dispose(),
        security.dispose(),
        marketplace.dispose(),
        advancedFeatures.dispose()
      ]);
    }
  };
}

/**
 * Quick start helper for meta-generation
 */
export async function quickMetaGenerate(
  templateId: string,
  generatorName: string,
  options: {
    description?: string;
    category?: string;
    platforms?: string[];
    framework?: string[];
    outputPath?: string;
    publishToMarketplace?: boolean;
  } = {}
) {
  const system = await createMetaGeneratorSystem();

  const targetMetadata = {
    id: generatorName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: generatorName,
    version: '1.0.0',
    description: options.description || `Generated ${generatorName} generator`,
    author: 'Generated by Xaheen Meta-Generator',
    category: options.category || 'component',
    tags: [options.category || 'component', 'generated'],
    dependencies: [],
    conflicts: [],
    platforms: options.platforms || ['react', 'nextjs'],
    framework: options.framework || ['xaheen'],
    license: 'MIT',
    createdAt: new Date(),
    updatedAt: new Date(),
    downloads: 0,
    rating: 0,
    reviews: 0,
    certified: false,
    deprecated: false,
    experimental: true
  };

  try {
    // Generate the generator
    const result = await system.generateGenerator(templateId, targetMetadata, {
      outputPath: options.outputPath,
      publishToMarketplace: options.publishToMarketplace,
      generateTests: true,
      generateDocs: true,
      generateExamples: true
    });

    if (result.success && options.publishToMarketplace) {
      // Publish to marketplace
      const publishResult = await system.publishGenerator(targetMetadata.id);
      
      if (publishResult.success) {
        console.log(`🎉 Successfully generated and published ${generatorName}!`);
        console.log(`📦 Marketplace URL: ${publishResult.url}`);
      }
    }

    return result;

  } finally {
    await system.dispose();
  }
}

/**
 * Utility functions for generator development
 */
export const MetaGeneratorUtils = {
  /**
   * Create a basic generator template
   */
  createBasicTemplate(name: string, baseGenerator?: string) {
    return {
      id: `template-${name.toLowerCase()}`,
      name: `${name} Template`,
      path: '',
      content: `{{!-- ${name} Generator Template --}}
import { BaseGenerator, GeneratorResult } from '../base.generator';

export interface {{pascalCase name}}Options {
  readonly name: string;
  readonly {{camelCase name}}Type?: string;
  // Add more options as needed
}

export class {{pascalCase name}}Generator extends BaseGenerator<{{pascalCase name}}Options> {
  getGeneratorType(): string {
    return '{{kebabCase name}}';
  }

  async generate(options: {{pascalCase name}}Options): Promise<GeneratorResult> {
    await this.validateOptions(options);
    
    const files: string[] = [];
    const naming = this.getNamingConvention(options.name);
    
    // Generate main file
    const mainFile = await this.generateFile(
      '{{kebabCase name}}/main.hbs',
      \`src/{{kebabCase name}}s/\${naming.fileName}.ts\`,
      { ...options, naming },
      { dryRun: options.dryRun, force: options.force }
    );
    files.push(mainFile);
    
    return {
      success: true,
      message: \`Successfully generated {{name}}: \${options.name}\`,
      files,
      commands: [],
      nextSteps: [
        'Review the generated files',
        'Customize as needed',
        'Test the implementation'
      ]
    };
  }
}`,
      variables: [
        {
          name: 'name',
          type: 'string',
          required: true,
          description: 'Name of the item to generate'
        }
      ],
      partials: [`${name.toLowerCase()}/main.hbs`],
      helpers: [],
      blocks: []
    };
  },

  /**
   * Create a component generator template
   */
  createComponentTemplate(name: string) {
    return this.createBasicTemplate(name, 'component');
  },

  /**
   * Create a service generator template
   */
  createServiceTemplate(name: string) {
    return this.createBasicTemplate(name, 'service');
  },

  /**
   * Validate generator metadata
   */
  validateGeneratorMetadata(metadata: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!metadata.id) errors.push('Generator ID is required');
    if (!metadata.name) errors.push('Generator name is required');
    if (!metadata.version) errors.push('Generator version is required');
    if (!metadata.description) errors.push('Generator description is required');
    if (!metadata.category) errors.push('Generator category is required');

    // Validate version format (basic semver check)
    if (metadata.version && !/^\d+\.\d+\.\d+/.test(metadata.version)) {
      errors.push('Invalid version format (should be semver)');
    }

    // Validate category
    const validCategories = [
      'component', 'layout', 'page', 'service', 'infrastructure',
      'devops', 'testing', 'documentation', 'security', 'ai',
      'compliance', 'integration', 'meta'
    ];
    
    if (metadata.category && !validCategories.includes(metadata.category)) {
      errors.push(`Invalid category: ${metadata.category}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate unique generator ID
   */
  generateGeneratorId(name: string, namespace?: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now().toString(36);
    
    if (namespace) {
      return `${namespace}-${cleanName}-${timestamp}`;
    }
    
    return `${cleanName}-${timestamp}`;
  },

  /**
   * Create generator composition
   */
  createComposition(generators: Array<{ id: string; options?: any; order?: number }>) {
    return {
      generators: generators.map((g, index) => ({
        id: g.id,
        version: 'latest',
        options: g.options || {},
        order: g.order !== undefined ? g.order : index,
        parallel: false,
        optional: false
      })),
      execution: 'sequential' as const,
      errorHandling: 'fail-fast' as const,
      rollback: 'files' as const,
      conditions: []
    };
  }
};