/**
 * Meta-Generator System - Basic Usage Examples
 * Demonstrates how to use the meta-generator system for creating generators
 */

import { 
  createMetaGeneratorSystem, 
  MetaGeneratorUtils,
  quickMetaGenerate 
} from '../index';

/**
 * Example 1: Quick Meta-Generation
 * Generate a simple component generator quickly
 */
async function example1_QuickGeneration() {
  console.log('🚀 Example 1: Quick Meta-Generation');
  
  const result = await quickMetaGenerate(
    'basic-component', // template ID
    'CardGenerator',   // generator name
    {
      description: 'Generate card components with variants',
      category: 'component',
      platforms: ['react', 'nextjs'],
      framework: ['xaheen'],
      outputPath: './generators/card-generator',
      publishToMarketplace: false
    }
  );

  if (result.success) {
    console.log('✅ Successfully generated CardGenerator');
    console.log('📁 Files created:', result.files?.length || 0);
    console.log('📋 Next steps:', result.nextSteps?.join('\n- '));
  } else {
    console.error('❌ Generation failed:', result.message);
  }
}

/**
 * Example 2: Advanced Meta-Generation with System
 * Use the full meta-generator system for complex scenarios
 */
async function example2_AdvancedGeneration() {
  console.log('🔧 Example 2: Advanced Meta-Generation');
  
  const system = await createMetaGeneratorSystem({
    registryPath: './temp-registry',
    marketplaceConfig: {
      endpoint: 'https://marketplace.xaheen.com/api',
      cacheEnabled: true,
      requireCertification: false
    },
    validationRules: {
      syntax: { strictTypeScript: true, noAnyTypes: true },
      structure: { componentSizeLimit: 300 },
      security: { noHardcodedSecrets: true }
    }
  });

  // Create target generator metadata
  const targetMetadata = {
    id: 'advanced-form-generator',
    name: 'AdvancedFormGenerator',
    version: '1.0.0',
    description: 'Generate sophisticated forms with validation and accessibility',
    author: 'Xaheen CLI Meta-Generator',
    category: 'component' as const,
    tags: ['form', 'validation', 'accessibility', 'react'],
    dependencies: [],
    conflicts: [],
    platforms: ['react', 'nextjs'] as const,
    framework: ['xaheen'] as const,
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
    // Generate the advanced form generator
    const result = await system.generateGenerator(
      'advanced-form',
      targetMetadata,
      {
        generateValidation: true,
        generateA11y: true,
        generateTests: true,
        generateStories: true,
        formTypes: ['contact', 'login', 'registration', 'survey'],
        validationLibrary: 'zod',
        outputPath: './generated-generators/advanced-form'
      }
    );

    if (result.success) {
      console.log('✅ Advanced generator created successfully');
      
      // Validate the generated generator
      const validation = await system.validateGenerator('advanced-form-generator');
      console.log(`📊 Quality Score: ${validation.score}/100`);
      console.log(`🔍 Validation Status: ${validation.valid ? 'PASSED' : 'FAILED'}`);
      
      if (validation.errors.length > 0) {
        console.log('⚠️  Validation Errors:');
        validation.errors.forEach(error => 
          console.log(`   - ${error.category}: ${error.message}`)
        );
      }
    }

  } finally {
    await system.dispose();
  }
}

/**
 * Example 3: Template Creation and Inheritance
 * Create custom templates with inheritance
 */
async function example3_TemplateInheritance() {
  console.log('📝 Example 3: Template Creation and Inheritance');
  
  const system = await createMetaGeneratorSystem();

  try {
    // Create a base template
    const baseTemplate = await system.metaGenerator.createGeneratorTemplate(
      'BaseReactComponent',
      undefined, // no parent template
      {
        variables: [
          { name: 'componentName', type: 'string', required: true, description: 'Component name' },
          { name: 'hasProps', type: 'boolean', required: false, description: 'Include props interface' },
          { name: 'hasState', type: 'boolean', required: false, description: 'Include state management' }
        ],
        blocks: [
          { name: 'imports', content: "import React from 'react';", overridable: true, description: 'Import statements' },
          { name: 'interface', content: '', overridable: true, description: 'Props interface' },
          { name: 'component', content: '', overridable: true, description: 'Component implementation' }
        ]
      }
    );

    // Create a specialized template that extends the base
    const formComponentTemplate = await system.metaGenerator.createGeneratorTemplate(
      'FormComponent',
      'BaseReactComponent', // extends base template
      {
        variables: [
          { name: 'validationSchema', type: 'string', required: false, description: 'Validation schema type' },
          { name: 'submitHandler', type: 'string', required: false, description: 'Submit handler name' }
        ],
        blocks: [
          { 
            name: 'imports', 
            content: "import React from 'react';\nimport { useForm } from 'react-hook-form';", 
            overridable: true, 
            description: 'Form-specific imports' 
          }
        ]
      }
    );

    console.log('✅ Template inheritance created successfully');
    console.log(`📋 Base Template: ${baseTemplate.name}`);
    console.log(`📋 Child Template: ${formComponentTemplate.name}`);

  } finally {
    await system.dispose();
  }
}

/**
 * Example 4: Generator Composition Workflow
 * Create a complex workflow that combines multiple generators
 */
async function example4_GeneratorComposition() {
  console.log('🎼 Example 4: Generator Composition Workflow');
  
  const system = await createMetaGeneratorSystem();

  try {
    // Define a full-stack feature composition
    const composition = {
      generators: [
        {
          id: 'database-model',
          version: 'latest',
          options: {
            name: 'Product',
            fields: [
              { name: 'name', type: 'string', required: true },
              { name: 'price', type: 'number', required: true },
              { name: 'description', type: 'text', required: false },
              { name: 'category', type: 'string', required: true }
            ]
          },
          order: 1,
          parallel: false,
          optional: false
        },
        {
          id: 'api-service',
          version: 'latest',
          options: {
            name: 'ProductService',
            entity: 'Product',
            operations: ['create', 'read', 'update', 'delete', 'list'],
            includeValidation: true,
            includeAuth: true
          },
          order: 2,
          parallel: false,
          optional: false
        },
        {
          id: 'frontend-components',
          version: 'latest',
          options: {
            name: 'Product',
            components: ['ProductList', 'ProductForm', 'ProductCard'],
            includeRouting: true,
            includeStateManagement: true
          },
          order: 3,
          parallel: true,
          optional: false
        },
        {
          id: 'test-suite',
          version: 'latest',
          options: {
            testTypes: ['unit', 'integration', 'e2e'],
            coverage: 90
          },
          order: 4,
          parallel: true,
          optional: true
        }
      ],
      execution: 'pipeline' as const,
      errorHandling: 'rollback' as const,
      rollback: 'full' as const,
      conditions: []
    };

    // Execute the composition
    const result = await system.metaGenerator.generateComposition(composition);

    if (result.success) {
      console.log('✅ Full-stack feature generated successfully');
      console.log(`📁 Total files created: ${result.files?.length || 0}`);
      console.log(`⚡ Commands to run: ${result.commands?.length || 0}`);
      console.log('📋 Next Steps:');
      result.nextSteps?.forEach(step => console.log(`   - ${step}`));
    } else {
      console.error('❌ Composition failed:', result.message);
    }

  } finally {
    await system.dispose();
  }
}

/**
 * Example 5: Marketplace Integration
 * Publish and install generators from the marketplace
 */
async function example5_MarketplaceIntegration() {
  console.log('🏪 Example 5: Marketplace Integration');
  
  const system = await createMetaGeneratorSystem({
    marketplaceConfig: {
      endpoint: 'https://marketplace.xaheen.com/api',
      cacheEnabled: true,
      requireCertification: false,
      autoUpdate: true
    }
  });

  try {
    // Search for generators in the marketplace
    const searchResults = await system.searchGenerators({
      query: 'react component',
      category: 'component',
      platform: 'react',
      certified: false,
      minRating: 3.0,
      limit: 10
    });

    console.log(`🔍 Found ${searchResults.generators.length} generators`);
    
    searchResults.generators.forEach(generator => {
      console.log(`   📦 ${generator.metadata.name} v${generator.metadata.version}`);
      console.log(`      ${generator.metadata.description}`);
      console.log(`      ⭐ Rating: ${generator.metadata.rating} | 📥 Downloads: ${generator.metadata.downloads}`);
    });

    // Install a generator (simulate)
    if (searchResults.generators.length > 0) {
      const firstGenerator = searchResults.generators[0];
      console.log(`\n📥 Installing ${firstGenerator.metadata.name}...`);
      
      const installResult = await system.installGenerator(
        firstGenerator.metadata.id,
        firstGenerator.metadata.version
      );

      if (installResult.success) {
        console.log('✅ Generator installed successfully');
      } else {
        console.log('❌ Installation failed:', installResult.message);
      }
    }

    // Get analytics for our usage
    const analytics = await system.getGeneratorAnalytics('meta-generator');
    if (analytics) {
      console.log('\n📊 Usage Analytics:');
      console.log(`   🎯 Total Executions: ${analytics.usage.totalExecutions}`);
      console.log(`   👥 Unique Users: ${analytics.usage.uniqueUsers}`);
      console.log(`   ⚡ Avg Execution Time: ${Math.round(analytics.performance.averageExecutionTime)}ms`);
      console.log(`   🔴 Error Rate: ${analytics.errors.errorRate.toFixed(2)}%`);
    }

  } finally {
    await system.dispose();
  }
}

/**
 * Example 6: Utility Functions
 * Demonstrate meta-generator utility functions
 */
async function example6_UtilityFunctions() {
  console.log('🛠️ Example 6: Utility Functions');

  // Create a basic template using utilities
  const componentTemplate = MetaGeneratorUtils.createComponentTemplate('Button');
  console.log('📝 Created component template:', componentTemplate.name);

  // Create a service template
  const serviceTemplate = MetaGeneratorUtils.createServiceTemplate('PaymentService');
  console.log('📝 Created service template:', serviceTemplate.name);

  // Validate generator metadata
  const metadata = {
    id: 'test-generator',
    name: 'TestGenerator',
    version: '1.0.0',
    description: 'A test generator',
    category: 'component'
  };

  const validation = MetaGeneratorUtils.validateGeneratorMetadata(metadata);
  console.log(`✅ Metadata validation: ${validation.valid ? 'PASSED' : 'FAILED'}`);
  
  if (!validation.valid) {
    console.log('❌ Validation errors:', validation.errors.join(', '));
  }

  // Generate unique ID
  const uniqueId = MetaGeneratorUtils.generateGeneratorId('MyGenerator', 'company');
  console.log('🆔 Generated unique ID:', uniqueId);

  // Create a composition
  const composition = MetaGeneratorUtils.createComposition([
    { id: 'generator-1', order: 1 },
    { id: 'generator-2', order: 2, options: { advanced: true } }
  ]);
  console.log('🎼 Created composition with', composition.generators.length, 'generators');
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🎯 Meta-Generator System Examples\n');

  try {
    await example1_QuickGeneration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example2_AdvancedGeneration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example3_TemplateInheritance();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example4_GeneratorComposition();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example5_MarketplaceIntegration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await example6_UtilityFunctions();
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('🎉 All examples completed successfully!');
    
  } catch (error) {
    console.error('💥 Example execution failed:', error);
    process.exit(1);
  }
}

// Export examples for individual use
export {
  example1_QuickGeneration,
  example2_AdvancedGeneration,
  example3_TemplateInheritance,
  example4_GeneratorComposition,
  example5_MarketplaceIntegration,
  example6_UtilityFunctions,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}