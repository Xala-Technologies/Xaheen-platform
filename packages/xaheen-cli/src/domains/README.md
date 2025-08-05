# Domains Module

## Purpose

The domains module implements a **Domain-Driven Design (DDD)** architecture for organizing CLI functionality into distinct business domains. Each domain encapsulates specific business logic, commands, and operations related to its area of responsibility.

## Architecture

The domains follow a modular, domain-centric architecture that provides:

- **Domain Isolation**: Each domain is self-contained with its own logic
- **Clear Boundaries**: Well-defined interfaces between domains
- **Scalability**: Easy to add new domains without affecting existing ones
- **Maintainability**: Each domain can be developed and tested independently

```
domains/
├── ai/           # AI and machine learning operations
├── app/          # Application-level operations
├── component/    # Component generation and management
├── help/         # Help system and documentation
├── make/         # Code generation and scaffolding
├── mcp/          # MCP (Model Context Protocol) integration
├── model/        # Data model operations
├── package/      # Package management
├── page/         # Page generation and routing
├── project/      # Project-level operations
├── service/      # Service layer operations
├── template/     # Template management
└── theme/        # Theme and styling operations
```

## Key Components

### Domain Structure
Each domain typically contains:
- **index.ts**: Domain entry point and exports
- **Commands**: Domain-specific CLI commands
- **Services**: Business logic implementation
- **Types**: Domain-specific type definitions
- **Validators**: Input validation and business rules

### Core Domains

#### AI Domain (`ai/`)
- **Purpose**: AI-powered code generation and optimization
- **Features**: Code suggestions, pattern recognition, automated refactoring
- **Integration**: OpenAI, Claude, and other AI providers

#### Component Domain (`component/`)
- **Purpose**: React/Vue/Angular component generation
- **Features**: Component scaffolding, prop validation, accessibility compliance
- **Norwegian Compliance**: Built-in WCAG AAA and NSM standards

#### Project Domain (`project/`)
- **Purpose**: Project-level operations and management
- **Features**: Project initialization, configuration, dependency management
- **Architecture**: Clean Architecture and DDD patterns

#### MCP Domain (`mcp/`)
- **Purpose**: Model Context Protocol integration
- **Features**: AI model communication, context management, tool integration
- **Standards**: OpenAI function calling, Claude tool use

## Dependencies

### Internal Dependencies
- `../core/`: Core CLI infrastructure
- `../services/`: Shared service layer
- `../types/`: Common type definitions
- `../utils/`: Utility functions

### External Dependencies
- `commander`: CLI command parsing
- `inquirer`: Interactive prompts
- `chalk`: Console output styling
- `zod`: Runtime type validation

## Usage Examples

### Registering a New Domain

```typescript
// domains/example/index.ts
import { Domain } from '../core/interfaces';
import { ExampleCommand } from './commands/ExampleCommand';

export class ExampleDomain implements Domain {
  name = 'example';
  description = 'Example domain for demonstration';

  commands = [
    new ExampleCommand()
  ];

  async initialize(): Promise<void> {
    // Domain initialization logic
  }
}
```

### Using Domain Services

```typescript
import { ComponentDomain } from '../domains/component';
import { ProjectDomain } from '../domains/project';

// Cross-domain collaboration
const projectDomain = new ProjectDomain();
const componentDomain = new ComponentDomain();

// Generate component within project context
await componentDomain.generateComponent({
  name: 'UserCard',
  project: await projectDomain.getProjectConfig()
});
```

### Command Registration

```typescript
// In main CLI entry point
import { DomainRegistry } from './core/registry/DomainRegistry';
import * as domains from './domains';

const registry = new DomainRegistry();

// Register all domains
Object.values(domains).forEach(domain => {
  registry.register(domain);
});
```

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)
- Each domain handles only its specific business area
- Commands within domains have single, focused responsibilities
- Services are specialized for specific operations

### Open/Closed Principle (OCP)
- Domains are open for extension through plugin system
- New commands can be added without modifying existing code
- Domain interfaces allow for flexible implementations

### Liskov Substitution Principle (LSP)
- All domains implement common `Domain` interface
- Commands follow `Command` contract consistently
- Services can be substituted through dependency injection

### Interface Segregation Principle (ISP)
- Domain interfaces are focused and minimal
- Commands expose only necessary methods
- Services have specific, targeted interfaces

### Dependency Inversion Principle (DIP)
- Domains depend on abstractions, not concretions
- Service injection allows for flexible implementations
- Configuration is injected rather than hardcoded

## Testing

### Unit Testing
```bash
# Test specific domain
npm test -- --testPathPattern="domains/ai"

# Test all domains
npm test domains/
```

### Integration Testing
```bash
# Test domain interactions
npm run test:integration -- domains
```

### Example Test Structure
```typescript
// domains/component/__tests__/ComponentDomain.test.ts
describe('ComponentDomain', () => {
  let domain: ComponentDomain;

  beforeEach(() => {
    domain = new ComponentDomain();
  });

  it('should generate React component with Norwegian compliance', async () => {
    const result = await domain.generateComponent({
      name: 'TestButton',
      platform: 'react',
      compliance: 'nsm'
    });

    expect(result.code).toContain('aria-label');
    expect(result.localization).toHaveProperty('nb-NO');
  });
});
```

## Extension Points

### Adding New Domains

1. **Create Domain Structure**:
   ```bash
   mkdir src/domains/new-domain
   touch src/domains/new-domain/index.ts
   ```

2. **Implement Domain Interface**:
   ```typescript
   export class NewDomain implements Domain {
     name = 'new-domain';
     // Implementation
   }
   ```

3. **Register Domain**:
   ```typescript
   // Add to domains/index.ts
   export { NewDomain } from './new-domain';
   ```

### Custom Command Development

```typescript
import { Command } from '../../core/interfaces';

export class CustomCommand implements Command {
  name = 'custom';
  description = 'Custom domain command';

  async execute(args: any): Promise<void> {
    // Command implementation
  }
}
```

### Service Integration

```typescript
import { Injectable } from '../../core/container';

@Injectable()
export class DomainService {
  async performOperation(): Promise<Result> {
    // Service logic with dependency injection
  }
}
```

## Performance Considerations

- **Lazy Loading**: Domains are loaded on-demand
- **Caching**: Command results are cached when appropriate
- **Parallel Execution**: Independent operations run concurrently
- **Memory Management**: Resources are properly disposed after use

## Norwegian Enterprise Features

### NSM Security Classification
- Commands automatically classify generated code
- Security levels: OPEN, RESTRICTED, CONFIDENTIAL, SECRET
- Audit trails for all operations

### GDPR Compliance
- Data handling follows GDPR requirements
- User consent management for telemetry
- Right to be forgotten implementation

### Altinn Integration
- Government service scaffolding
- Norwegian ID validation
- BankID authentication support

## Monitoring and Observability

### Metrics Collection
- Command execution times
- Success/failure rates
- Resource utilization

### Logging
- Structured logging with correlation IDs
- Domain-specific log levels
- Security event logging

### Health Checks
```typescript
// Health check endpoint for each domain
export class DomainHealthCheck {
  async check(): Promise<HealthStatus> {
    return {
      status: 'healthy',
      dependencies: await this.checkDependencies()
    };
  }
}
```

## Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/domain-enhancement`
2. Implement changes following SOLID principles
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

### Code Standards
- Follow TypeScript strict mode
- Use dependency injection
- Implement proper error handling
- Add JSDoc comments for public APIs
- Ensure Norwegian compliance where applicable

### Review Checklist
- [ ] Domain follows SOLID principles
- [ ] Tests achieve >90% coverage
- [ ] Norwegian compliance implemented
- [ ] Security considerations addressed
- [ ] Performance impact assessed
- [ ] Documentation updated