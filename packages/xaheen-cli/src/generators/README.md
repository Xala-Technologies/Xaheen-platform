# Xaheen CLI Code Generator System

## Overview

The Xaheen CLI Generator System is a comprehensive and extensible code generation framework that enables rapid development of various application components across multiple domains. Built with a modular architecture, the system provides a consistent interface for generating code while allowing for domain-specific customization.

## Architecture

The generator system follows a modular architecture with the following key components:

- **Core System**: Foundation of the generator system with base classes, interfaces, registry, and factory
- **Registrars**: Domain-specific modules that register generators with the registry
- **Generators**: Concrete implementations for various code generation tasks
- **Types and Enums**: Common types and enums used throughout the generator system

## Core Components

### BaseGenerator

An abstract base class that provides common functionality for all generators, including:

- Validation of generator options
- Result formatting for success and error cases
- Naming convention utilities (camelCase, PascalCase)

### GeneratorRegistry

A registry system that manages generator classes by domain and type:

- Registers generator classes with their domain and type
- Retrieves generator classes by domain and type
- Lists available generators by domain

### GeneratorFactory

A factory that creates generator instances using the registry:

- Creates instances of registered generators by domain and type
- Ensures proper instantiation of generator classes

## Domain-Specific Registrars

Each domain has its own registrar module that registers domain-specific generators with the registry:

- **Frontend Registrar**: Page, Layout, Component generators
- **Backend Registrar**: API, Controller, Service, Model generators
- **Database Registrar**: Migration, Seed, Schema generators
- **Full-Stack Registrar**: Scaffold, CRUD, Auth, Feature generators
- **Infrastructure Registrar**: Docker, K8s, CI, Deployment generators
- **Testing Registrar**: Unit Test, E2E, Mock generators
- **Patterns Registrar**: DDD, Clean Architecture, CQRS generators

## Usage

The generator system can be used directly through the Xaheen CLI with commands like:

```bash
xaheen generate component MyComponent
xaheen generate page Dashboard
xaheen generate controller UserController
```

Or programmatically:

```typescript
import { generateCode } from '@xaheen/cli/generators';

const result = await generateCode({
  type: 'component',
  name: 'MyComponent',
  // Additional options...
});
```

## Extension

To extend the generator system with new generators:

1. Create a new generator class extending `BaseGenerator`
2. Implement the required `generate` method
3. Register the generator in the appropriate registrar
4. (Optional) Add any domain-specific types or utilities

## Integration with CLI

The generator system is tightly integrated with the Xaheen CLI, providing:

- Command-line interface for all generators
- Option validation and help text
- Interactive prompts for required options
- Output formatting and next steps

## Relationship with Main CLI

The generator module serves as a core subsystem of the Xaheen CLI, enabling:

1. Rapid prototyping and development of application components
2. Consistent code structure and patterns across projects
3. Implementation of best practices and architectural patterns
4. Seamless integration with other CLI subsystems like project management and deployment

The CLI invokes the generator system through the main `generateCode` function, which:
- Determines the appropriate generator for the requested type
- Validates the options and context
- Executes the generator and returns the result
- Provides helpful feedback and next steps to the user
