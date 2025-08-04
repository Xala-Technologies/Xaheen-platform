# Hybrid Scaffolding Architecture

## Overview

The Hybrid Scaffolding Architecture is a comprehensive three-tier generator system that combines the best of different code generation approaches:

- **Tier 1**: Global Project Scaffolding (Yeoman)
- **Tier 2**: TypeScript Code Manipulation (Nx DevKit)
- **Tier 3**: Project-Local Generators (Hygen)

This architecture provides maximum flexibility for different use cases, from initial project setup to ongoing development workflows.

## Architecture Components

### Core Files

```
src/scaffolding/
├── types.ts                      # Core type definitions
├── virtual-fs.ts                 # Virtual filesystem for safe staging
├── tier1-yeoman-integration.ts   # Tier 1: Yeoman integration
├── tier2-ast-transformations.ts  # Tier 2: AST manipulation
├── tier3-hygen-integration.ts    # Tier 3: Hygen integration
├── hybrid-orchestrator.ts        # Main orchestration system
├── service-integration.ts        # Service registry and injection
└── index.ts                      # Main exports
```

### Command Interface

```
src/commands/scaffold.ts          # CLI command interface
```

## Tier 1: Global Project Scaffolding (Yeoman)

### Purpose
- Complex project initialization
- Multi-framework project setup
- Full-stack application scaffolding
- Enterprise-grade project templates

### Features
- **Built-in Generators**: React, Vue, Angular, Svelte project generators
- **Full-Stack Support**: Backend, database, and authentication integration
- **Custom Templates**: Support for custom Yeoman generators
- **Interactive Prompts**: User-friendly project configuration

### Usage
```bash
# Generate a new React project
xala scaffold project my-app --framework react --backend node --database postgresql

# Interactive project generation
xala scaffold project --interactive
```

### Implementation Highlights
```typescript
// Built-in generator registration
await this.registerProjectGenerators();
await this.registerFrameworkGenerators();
await this.registerFeatureGenerators();

// Full-stack project generation
const result = await this.generateFullStackProject(context, {
  backend: 'node',
  database: 'postgresql',
  auth: 'clerk'
});
```

## Tier 2: TypeScript Code Manipulation (Nx DevKit)

### Purpose
- Safe AST transformations
- Automatic import management
- Interface generation
- Code refactoring operations

### Features
- **AST Transformations**: Type-safe code modifications
- **Import Optimization**: Automatic import sorting and deduplication
- **Interface Generation**: TypeScript interface creation from schemas
- **Route Registration**: Automatic route configuration updates
- **Virtual Staging**: Safe preview and rollback capabilities

### Usage
```bash
# Add imports to files
xala scaffold transform --add-imports '[{"moduleSpecifier": "react", "namedImports": ["useState"]}]'

# Generate TypeScript interfaces
xala scaffold transform --add-interfaces '[{"name": "User", "properties": [...]}]'
```

### Implementation Highlights
```typescript
// AST transformation with type safety
const transformer = (context: ts.TransformationContext) => {
  return (rootNode: ts.Node) => {
    const visitNode = (node: ts.Node): ts.Node => {
      // Safe AST modifications
      return ts.visitEachChild(node, visitNode, context);
    };
    return visitNode(rootNode);
  };
};

// Virtual filesystem staging
await this.virtualFs.writeFile(filePath, transformedContent);
await this.virtualFs.commit(); // or rollback()
```

## Tier 3: Project-Local Generators (Hygen)

### Purpose
- Rapid component generation
- Team-specific patterns
- Local development workflows
- Lightweight template system

### Features
- **Local Generators**: Project-specific generator templates
- **Team Patterns**: Shared team conventions and patterns
- **Template Discovery**: Automatic local generator discovery
- **Quick Generation**: Fast component and feature creation

### Usage
```bash
# Generate a component with local generators
xala scaffold component Button --type functional --props --storybook

# Initialize local generators in project
xala scaffold component --init
```

### Implementation Highlights
```typescript
// Local generator installation
await this.installDefaultGenerators();
await this.createGeneratorConfig();

// Component generation with templates
const result = await this.generateFromTemplates(config, context, dryRun);

// Team pattern synchronization
await this.installTeamPatterns(patternsConfig);
```

## Hybrid Orchestration System

### Coordination Strategies

#### Sequential Strategy (Default)
Executes tiers in order: Tier 1 → Tier 2 → Tier 3
```typescript
const result = await orchestrator.orchestrate(context, {
  orchestration: { strategy: 'sequential' }
});
```

#### Parallel Strategy
Executes all tiers simultaneously for independent operations
```typescript
const result = await orchestrator.orchestrate(context, {
  orchestration: { strategy: 'parallel' }
});
```

#### Dependent Strategy
Executes tiers based on dependency graph
```typescript
const result = await orchestrator.orchestrate(context, {
  orchestration: { 
    strategy: 'dependent',
    dependencies: [
      { from: 1, to: 2 }, // Tier 2 depends on Tier 1
      { from: 2, to: 3 }  // Tier 3 depends on Tier 2
    ]
  }
});
```

### Error Handling and Rollback

The orchestrator provides comprehensive error handling:

```typescript
// Automatic rollback on error
const result = await orchestrator.orchestrate(context, {
  orchestration: {
    rollbackOnError: true,
    continueOnWarning: true
  }
});

// Manual rollback
if (!result.success) {
  await orchestrator.rollbackChanges();
}
```

## Virtual Filesystem

### Safe Staging Environment

The virtual filesystem provides a safe staging environment for all file operations:

```typescript
// Stage changes in memory
virtualFs.writeFile('src/components/Button.tsx', componentContent);
virtualFs.writeFile('src/components/Button.test.tsx', testContent);

// Preview changes
const diff = await virtualFs.getDiff();
console.log(diff); // ['+ src/components/Button.tsx', '+ src/components/Button.test.tsx']

// Commit or rollback
await virtualFs.commit();   // Apply changes to disk
// or
virtualFs.rollback();       // Discard changes
```

### Features
- **Memory-based staging**: All operations staged in memory first
- **Atomic commits**: All-or-nothing file operations
- **Backup system**: Automatic backups before modifications
- **Diff preview**: See exactly what will change
- **Rollback capability**: Safe undo of operations

## Service Integration

### Service Registry and Injection

The architecture includes a comprehensive service system:

```typescript
// Register custom services
const registry = createScaffoldingServiceRegistry();
registry.register({
  name: 'custom-generator',
  service: new CustomGeneratorService(),
  dependencies: ['component-generator']
});

// Inject services with dependency resolution
const injector = new ScaffoldingServiceInjector(registry);
const service = injector.inject('custom-generator');
```

### Built-in Services

#### ComponentGeneratorService
Generates React/Vue/Angular components with:
- TypeScript interfaces
- Test files
- Storybook stories
- Custom styling

#### PageGeneratorService
Generates application pages with:
- Route configuration
- Layout templates
- Navigation integration
- SEO metadata

## Command Line Interface

### Main Commands

```bash
# Full project scaffolding
xala scaffold project <name> [options]

# Component generation
xala scaffold component <name> [options]

# Code transformations
xala scaffold transform [options]

# Preview changes
xala scaffold preview [name] [options]

# Interactive mode
xala scaffold --interactive
```

### Options and Flags

```bash
# Framework selection
--framework <framework>     # react, vue, angular, svelte

# Tier control
--tier1                     # Enable Tier 1 (default: true)
--no-tier1                  # Disable Tier 1
--tier2                     # Enable Tier 2 (default: true)
--no-tier2                  # Disable Tier 2
--tier3                     # Enable Tier 3 (default: true)
--no-tier3                  # Disable Tier 3

# Execution options
--dry-run                   # Preview without applying changes
--verbose                   # Enable detailed logging
--interactive               # Run in interactive mode

# Feature flags
--features <features>       # Comma-separated feature list
--services <services>       # Comma-separated service list
```

## Configuration

### Project Configuration

Each project can have a `.xala/generators.yaml` configuration:

```yaml
version: '1.0.0'
generators:
  component:
    enabled: true
    description: 'Generate components with TypeScript and tests'
  page:
    enabled: true
    description: 'Generate pages with routing configuration'
templates:
  react:
    component: 'react-component.ejs.t'
    test: 'react-test.ejs.t'
  vue:
    component: 'vue-component.ejs.t'
    test: 'vue-test.ejs.t'
```

### Global Configuration

Global scaffolding configuration in `xala.config.js`:

```javascript
export default {
  scaffolding: {
    globalTemplatesPath: './templates',
    localGeneratorsPath: './.xala/generators',
    backupEnabled: true,
    maxConcurrentOperations: 5,
    defaultFramework: 'react',
    tier1: {
      enabled: true,
      yeomanConfig: { /* ... */ }
    },
    tier2: {
      enabled: true,
      astOptions: { preserveComments: true },
      virtualFs: true
    },
    tier3: {
      enabled: true,
      autoDiscovery: true
    }
  }
};
```

## Examples

### Example 1: Full-Stack React Application

```bash
# Generate a complete React application with backend
xala scaffold project my-app \
  --framework react \
  --backend node \
  --database postgresql \
  --auth clerk \
  --features typescript,storybook,tests
```

This creates:
- React frontend with Next.js
- Node.js backend with Express
- PostgreSQL database with Prisma
- Clerk authentication integration
- TypeScript configuration
- Storybook setup
- Test configuration

### Example 2: Component with Custom Features

```bash
# Generate a complex component
xala scaffold component UserCard \
  --type functional \
  --props \
  --state \
  --storybook \
  --features typescript,tests,docs
```

This creates:
- `UserCard.tsx` - Component with props and state
- `UserCard.test.tsx` - Test file
- `UserCard.stories.tsx` - Storybook story
- `UserCard.md` - Documentation

### Example 3: Code Transformation

```bash
# Add multiple imports and interfaces
xala scaffold transform \
  --add-imports '[
    {"moduleSpecifier": "react", "namedImports": ["useState", "useEffect"]},
    {"moduleSpecifier": "./types", "namedImports": ["User"]}
  ]' \
  --add-interfaces '[
    {
      "name": "UserProps",
      "properties": [
        {"name": "id", "type": "string"},
        {"name": "name", "type": "string"},
        {"name": "email", "type": "string", "optional": true}
      ],
      "exported": true
    }
  ]'
```

## Best Practices

### 1. Use Appropriate Tiers

- **Tier 1**: Initial project setup, major architecture changes
- **Tier 2**: Code refactoring, type updates, import management
- **Tier 3**: Daily development, component creation, team patterns

### 2. Preview Changes

Always preview changes before applying:

```bash
xala scaffold preview my-component --framework react --features props,state
```

### 3. Backup Important Files

Enable backups in configuration:

```typescript
const options: HybridScaffoldingOptions = {
  orchestration: {
    rollbackOnError: true,
    continueOnWarning: true
  }
};
```

### 4. Use Service Integration

Leverage the service system for custom generators:

```typescript
class CustomGeneratorService implements ScaffoldingService {
  readonly name = 'custom-generator';
  readonly tier = 3;
  
  async generate(context, options) {
    // Custom generation logic
  }
}

orchestrator.registerService(new CustomGeneratorService());
```

## Advanced Usage

### Custom Yeoman Generators

Create custom Tier 1 generators:

```typescript
const customGenerator: YeomanGeneratorConfig = {
  name: 'Enterprise App',
  namespace: 'xala:enterprise',
  templatePath: './templates/enterprise',
  prompts: [
    {
      type: 'list',
      name: 'architecture',
      message: 'Architecture pattern:',
      choices: ['microservices', 'monolith', 'serverless']
    }
  ],
  dependencies: ['express', 'typescript', '@types/node']
};

await yeomanIntegration.registerGenerator(customGenerator);
```

### Custom AST Transformations

Implement custom Tier 2 transformations:

```typescript
const customTransformation: ASTTransformation = {
  type: 'add-property',
  target: 'UserInterface',
  options: {
    property: {
      name: 'createdAt',
      type: 'Date',
      optional: false
    }
  }
};

await astEngine.transformFiles(context, [customTransformation]);
```

### Team-Specific Patterns

Create team patterns for Tier 3:

```typescript
const teamPatterns = {
  'api-service': {
    name: 'api-service',
    description: 'Generate API service with error handling',
    templates: [
      {
        name: 'service',
        path: 'src/services/{{ name }}.service.ts'
      },
      {
        name: 'types',
        path: 'src/services/{{ name }}.types.ts'
      }
    ]
  }
};

await hygenIntegration.installTeamPatterns(teamPatterns);
```

## Integration with Existing Systems

### Service Registry Integration

The hybrid scaffolding system integrates seamlessly with the existing ServiceRegistry:

```typescript
// Existing service registry
import { ServiceRegistry } from '../services/service-registry';

// Hybrid scaffolding integration
const scaffoldingRegistry = createScaffoldingServiceRegistry();
const hybridOrchestrator = new ServiceIntegratedOrchestrator(
  projectPath,
  scaffoldingRegistry
);

// Use existing services in scaffolding
const existingService = ServiceRegistry.get('project-analyzer');
scaffoldingRegistry.register({
  name: 'project-analyzer',
  service: existingService,
  type: 'singleton'
});
```

## Performance Considerations

### Virtual Filesystem Performance

- **Memory Usage**: Virtual filesystem uses memory for staging
- **Concurrent Operations**: Limited by `maxConcurrentOperations` setting
- **Large Files**: Automatic chunking for large file operations

### AST Transformation Performance

- **Incremental Processing**: Only transform files that need changes
- **Type Checking**: Optional type validation for faster processing
- **Parallel Processing**: AST transformations can run in parallel

### Generator Performance

- **Template Caching**: Templates are cached after first load
- **Lazy Loading**: Generators loaded on-demand
- **Batch Operations**: Multiple file operations batched together

## Troubleshooting

### Common Issues

#### 1. Generator Not Found
```
Error: Generator 'my-generator' not found
```
Solution: Ensure generator is registered or run `xala scaffold component --init`

#### 2. AST Transformation Failed
```
Error: Failed to parse TypeScript file
```
Solution: Check TypeScript syntax and ensure file is valid

#### 3. Virtual Filesystem Commit Failed
```
Error: Failed to commit virtual filesystem changes
```
Solution: Check file permissions and disk space

### Debug Mode

Enable verbose logging for debugging:

```bash
xala scaffold component Button --verbose
```

### Rollback Failed Operations

If operations fail, manually rollback:

```bash
# Check git status
git status

# Restore from backup if available
git checkout -- .
```

## Future Enhancements

### Planned Features

1. **Template Marketplace**: Share and discover community templates
2. **AI-Powered Generation**: LLM integration for intelligent code generation
3. **Visual Generator Builder**: GUI for creating custom generators
4. **Performance Profiling**: Built-in performance analysis
5. **Multi-Language Support**: Support for more programming languages
6. **Integration Testing**: Automated testing of generated code
7. **Cloud Templates**: Remote template repositories
8. **Collaborative Patterns**: Team collaboration features

### Extension Points

The architecture is designed for extensibility:

- **Custom Tiers**: Add new tier types beyond the current three
- **Custom Strategies**: Implement new orchestration strategies
- **Custom Services**: Create domain-specific generator services
- **Custom Transformations**: Add new AST transformation types
- **Custom File Systems**: Implement alternative virtual filesystems

## Conclusion

The Hybrid Scaffolding Architecture provides a comprehensive, flexible, and powerful system for code generation across the entire development lifecycle. By combining the strengths of Yeoman, Nx DevKit, and Hygen, it offers the right tool for every scaffolding need while maintaining safety, performance, and extensibility.

The three-tier approach ensures that developers can:
- Bootstrap projects quickly with Tier 1
- Maintain and refactor code safely with Tier 2  
- Stay productive with rapid generation using Tier 3

The virtual filesystem and service integration provide enterprise-grade reliability and flexibility, making this architecture suitable for individual developers, teams, and large organizations.