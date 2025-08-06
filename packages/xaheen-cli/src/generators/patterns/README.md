# Architectural Patterns Generators

## Overview

The Architectural Patterns Generators module provides specialized code generators for implementing established software design patterns and architectural styles. These generators help developers quickly scaffold applications following industry-standard architectural principles, ensuring maintainable, scalable, and testable codebases.

## Architecture

The patterns generators follow the modular architecture of the Xaheen CLI generator system:

1. Each generator extends the `BaseGenerator` abstract class
2. Generators implement the `generate` method to produce pattern-specific code artifacts
3. All generators are registered via the Patterns Registrar
4. Generators focus on creating coherent structures of multiple files that work together

## Key Generators

### Domain-Driven Design (DDD) Generator

Generates a complete DDD architecture with:
- Domain entities and value objects
- Aggregates and repositories
- Domain services
- Application services
- Infrastructure services
- Bounded context definitions
- Ubiquitous language dictionary

### Clean Architecture Generator

Creates a layered application following Clean Architecture principles with:
- Core domain entities
- Use cases / interactors
- Interface adapters
- Frameworks & drivers layer
- Dependency rules enforcement
- Testing structure for each layer

### CQRS & Event Sourcing Generator

Generates a CQRS and Event Sourcing implementation with:
- Command handlers
- Event handlers
- Query handlers
- Event store integration
- Read models and projections
- Command and event definitions
- Aggregate roots

### Dependency Injection Generator

Creates a dependency injection structure with:
- Service container setup
- Interface definitions
- Implementation registrations
- Scope management (singleton, transient, etc.)
- Factory methods

## Integration with Main CLI

The Patterns Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each pattern is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to determine how to apply patterns
3. **Framework Integration**: Generators support various frameworks and adapt patterns accordingly
4. **Language Support**: Generators work with TypeScript, adapting patterns to leverage language features
5. **Visualization**: Some generators can produce architecture diagrams to visualize the implemented patterns

## Usage Examples

### Via CLI

```bash
# Generate a DDD structure
xaheen generate pattern ddd --domain=Ecommerce --entities=Product,Order,Customer

# Generate Clean Architecture
xaheen generate pattern clean-architecture --name=TaskManagement --layers=4

# Generate CQRS & Event Sourcing
xaheen generate pattern cqrs --domain=Payments --aggregates=Invoice,Payment,Refund
```

### Programmatically

```typescript
import { generateCode } from '@xaheen-ai/cli/generators';

// Generate a Clean Architecture structure
const result = await generateCode({
  type: 'pattern',
  pattern: 'clean-architecture',
  name: 'UserManagement',
  layers: ['domain', 'application', 'infrastructure', 'presentation'],
  entities: ['User', 'Role', 'Permission']
});
```

## Benefits

Using the Architectural Patterns Generators provides several benefits:

1. **Consistency**: Ensures consistent implementation of complex patterns
2. **Learning**: Helps developers understand patterns through practical examples
3. **Productivity**: Saves time in setting up boilerplate for architectural patterns
4. **Best Practices**: Enforces established best practices for each pattern
5. **Maintainability**: Creates codebases that are easier to maintain and extend
6. **Scalability**: Provides architectures designed for scale from the start
