# Meta-Generator System 🚀

> Advanced generator composition and meta-programming for the Xaheen CLI

The Meta-Generator System provides Rails-style meta-programming capabilities that allow generators to generate other generators, create sophisticated workflows, and build a comprehensive marketplace ecosystem.

## Features

### 🔄 Meta-Generators
- **Generator-to-Generate-Generators**: Create new generators using template-based approaches
- **Rails-style Architecture**: Familiar patterns for Ruby on Rails developers
- **Template Inheritance**: Support for template composition and inheritance
- **Hot Reloading**: Development-friendly template updates

### 🏗️ Generator Composition
- **Complex Workflows**: Chain multiple generators with dependency resolution
- **Parallel Execution**: Run generators concurrently where possible  
- **Error Handling**: Sophisticated rollback and recovery strategies
- **Conditional Logic**: Execute generators based on dynamic conditions

### 🏪 Marketplace Integration
- **Publishing**: Share generators with the community
- **Versioning**: Semantic versioning with compatibility checks
- **Certification**: Quality assurance and security validation
- **Analytics**: Usage tracking and performance monitoring

### 🔍 Validation & Testing
- **Comprehensive Validation**: Syntax, structure, security, and compliance checks
- **Performance Testing**: Benchmark generator execution and memory usage
- **Security Scanning**: Detect vulnerabilities and compliance issues
- **Automated Testing**: Generate test suites for created generators

## Quick Start

### Generate a New Generator

```bash
# Create a basic component generator
xaheen generate meta-generator MyComponentGenerator \
  --category=component \
  --platforms=react,nextjs \
  --framework=xaheen \
  --description="Generate custom React components"

# Create an advanced service generator
xaheen generate meta-generator PaymentServiceGenerator \
  --category=service \
  --template-id=advanced-service \
  --generate-tests \
  --generate-docs \
  --publish-to-marketplace
```

### Create a Generator Template

```bash
# Create a reusable template
xaheen generate generator-template MyTemplate \
  --base-template=component \
  --variables='[{"name":"apiEndpoint","type":"string","required":true}]' \
  --blocks='[{"name":"methods","description":"Custom methods"}]'
```

### Compose Generator Workflows

```bash
# Create a full-stack workflow
xaheen generate generator-composition FullStackWorkflow \
  --generators='[
    {"id":"database-model","order":1},
    {"id":"api-service","order":2,"parallel":false},
    {"id":"frontend-component","order":3,"parallel":true}
  ]' \
  --execution=pipeline \
  --rollback=full
```

## Architecture

### Core Components

```
meta/
├── meta-generator.ts          # Main meta-generator orchestrator
├── generator-registry.ts      # Central registry with dependency management
├── generator-composer.ts      # Workflow orchestration and execution
├── template-engine.ts         # Advanced templating with inheritance
├── generator-validator.ts     # Comprehensive validation system
├── generator-analytics.ts     # Usage tracking and performance monitoring
├── marketplace.ts             # Distribution and discovery platform
└── types.ts                   # TypeScript definitions
```

### Template System

The template engine supports:

- **Handlebars Templates**: Rich templating with custom helpers
- **Template Inheritance**: Parent-child template relationships
- **Block System**: Overridable template sections
- **Variable System**: Type-safe template variables
- **Hot Reloading**: Development-time template updates

### Registry System

Features include:

- **Dependency Resolution**: Automatic dependency management
- **Version Compatibility**: Semantic version resolution
- **Conflict Detection**: Prevent incompatible generators
- **Lazy Loading**: On-demand generator loading
- **Caching**: Performance-optimized template caching

## Usage Examples

### 1. Create a Custom Component Generator

```typescript
import { createMetaGeneratorSystem } from '@xaheen/cli/generators/meta';

const system = await createMetaGeneratorSystem();

// Generate a new generator
const result = await system.metaGenerator.generate({
  name: 'CustomButton',
  templateId: 'react-component',
  targetGenerator: {
    id: 'custom-button-generator',
    name: 'CustomButtonGenerator',
    category: 'component',
    platforms: ['react', 'nextjs'],
    framework: ['xaheen'],
    description: 'Generate custom button components with variants',
    // ... other metadata
  },
  customOptions: {
    generateVariants: true,
    includeAnimations: true,
    supportDarkMode: true
  }
});
```

### 2. Create a Template with Inheritance

```typescript
const template = await system.templateEngine.createTemplate({
  name: 'AdvancedComponent',
  baseTemplate: 'basic-component',
  variables: [
    {
      name: 'variants',
      type: 'array',
      required: false,
      description: 'Component variants to generate'
    }
  ],
  blocks: [
    {
      name: 'variants',
      content: '{{#each variants}}...{{/each}}',
      overridable: true,
      description: 'Variant implementations'
    }
  ]
});
```

### 3. Compose Multiple Generators

```typescript
const composition = {
  generators: [
    {
      id: 'database-schema',
      options: { entity: 'User', fields: ['name', 'email'] },
      order: 1,
      parallel: false
    },
    {
      id: 'api-endpoints',
      options: { entity: 'User', operations: ['CRUD'] },
      order: 2,
      parallel: false
    },
    {
      id: 'frontend-components',
      options: { entity: 'User', views: ['list', 'detail', 'form'] },
      order: 3,
      parallel: true
    }
  ],
  execution: 'pipeline',
  errorHandling: 'rollback'
};

const result = await system.composer.executeComposition(composition);
```

### 4. Validate and Publish

```typescript
// Validate generator
const validation = await system.validator.validateGenerator(generatorEntry);

if (validation.valid && validation.score >= 80) {
  // Publish to marketplace
  const publishResult = await system.marketplace.publishGenerator(
    'my-generator',
    {
      tags: ['component', 'react', 'typescript'],
      changelog: 'Initial release with full TypeScript support'
    }
  );
}
```

## Configuration

### Registry Configuration

```typescript
const system = await createMetaGeneratorSystem({
  registryPath: '/path/to/registry',
  marketplaceConfig: {
    endpoint: 'https://marketplace.xaheen.com/api',
    requireCertification: true,
    autoUpdate: true
  },
  validationRules: {
    syntax: { strictTypeScript: true },
    security: { noHardcodedSecrets: true },
    accessibility: { wcagAACompliance: true }
  },
  analyticsConfig: {
    enabled: true,
    anonymizeData: true,
    retentionDays: 90
  }
});
```

### Template Engine Configuration

```typescript
const templateEngine = new TemplateEngine({
  templatesDir: './templates',
  partialsDir: './templates/partials',
  helpersDir: './templates/helpers',
  cacheEnabled: true,
  hotReload: process.env.NODE_ENV === 'development'
});
```

## Best Practices

### 1. Generator Design

- **Single Responsibility**: Each generator should have a clear, focused purpose
- **Composability**: Design generators to work well with others
- **Error Handling**: Implement comprehensive error handling and rollback
- **Documentation**: Provide clear documentation and examples

### 2. Template Development

- **Modularity**: Use partials and blocks for reusable components
- **Type Safety**: Define clear variable types and validation
- **Testing**: Test templates with various input scenarios
- **Performance**: Optimize for template rendering speed

### 3. Marketplace Publishing

- **Quality**: Ensure high code quality scores (80+)
- **Security**: Scan for vulnerabilities before publishing
- **Documentation**: Include comprehensive usage examples
- **Versioning**: Use semantic versioning consistently

### 4. Workflow Composition

- **Dependencies**: Clearly define generator dependencies
- **Idempotency**: Ensure generators can be run multiple times safely
- **Rollback**: Implement proper rollback strategies
- **Monitoring**: Track execution metrics and errors

## API Reference

### MetaGenerator

```typescript
class MetaGenerator {
  async generate(options: MetaGeneratorOptions): Promise<GeneratorResult>
  async generateComposition(composition: GeneratorComposition): Promise<GeneratorResult>
  async executeWorkflow(workflow: GeneratorWorkflow): Promise<GeneratorResult>
  async createGeneratorTemplate(name: string, options?: any): Promise<GeneratorTemplate>
}
```

### GeneratorRegistry

```typescript
class GeneratorRegistry {
  async register(entry: GeneratorRegistryEntry): Promise<void>
  async getGenerator(id: string, version?: string): Promise<GeneratorRegistryEntry | null>
  async searchGenerators(criteria: SearchCriteria): Promise<GeneratorMetadata[]>
  async resolveDependencies(generatorId: string): Promise<GeneratorRegistryEntry[]>
}
```

### GeneratorMarketplace

```typescript
class GeneratorMarketplace {
  async publishGenerator(id: string, options: PublishOptions): Promise<PublishResult>
  async installGenerator(id: string, version?: string): Promise<InstallResult>
  async searchGenerators(options: SearchOptions): Promise<SearchResult>
  async getFeaturedGenerators(): Promise<MarketplaceEntry[]>
}
```

## Contributing

1. **Fork the Repository**: Create your own fork of the Xaheen CLI
2. **Create Templates**: Add new generator templates to the templates directory
3. **Add Generators**: Implement new meta-generators following the existing patterns
4. **Test Thoroughly**: Ensure all generators work correctly and pass validation
5. **Submit Pull Request**: Include comprehensive documentation and examples

## Troubleshooting

### Common Issues

**Generator Not Found**
```bash
# Check if generator is registered
xaheen list generators --category=meta

# Install from marketplace
xaheen install generator my-generator
```

**Template Compilation Errors**
```bash
# Validate template syntax
xaheen validate template my-template.hbs

# Check template variables
xaheen template info my-template
```

**Composition Failures**
```bash
# Run in dry-run mode first
xaheen generate generator-composition MyWorkflow --dry-run

# Check dependency conflicts
xaheen validate composition my-composition.json
```

### Debug Mode

Enable debug logging for detailed information:

```bash
export DEBUG=xaheen:meta-generator
xaheen generate meta-generator MyGenerator --verbose
```

## Examples

See the [examples directory](./examples/) for comprehensive examples of:

- Custom component generators
- Service generator templates  
- Complex workflow compositions
- Marketplace integration
- Testing and validation

## License

MIT License - see [LICENSE](../../../LICENSE) for details.

---

**Built with 💜 by the Xaheen Team**

For more information, visit [xaheen.com](https://xaheen.com) or join our [Discord community](https://discord.gg/xaheen).