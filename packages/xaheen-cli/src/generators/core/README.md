# Generator Core Module

## Overview

The Generator Core module serves as the foundation of the Xaheen CLI's code generation system. It provides a set of base classes, interfaces, and utilities that enable a modular, extensible, and type-safe approach to code generation across various domains.

## Architecture

The Core module follows SOLID principles and implements a combination of design patterns:

- **Abstract Factory**: The `GeneratorFactory` creates concrete generator instances
- **Registry Pattern**: The `GeneratorRegistry` manages generator registrations
- **Template Method**: The `BaseGenerator` defines the algorithm skeleton with common operations
- **Strategy Pattern**: Different generator implementations can be interchanged at runtime

## Key Components

### Interfaces

Located in `core/interfaces/`, these define the contracts for the generator system:

- **IGenerator**: Base interface for all generators
- **IGeneratorRegistry**: Interface for the registry system
- **IGeneratorFactory**: Interface for the generator factory

### Base Classes

Located in `core/base/`, these provide foundational implementations:

- **BaseGenerator**: Abstract class with common generator functionality
  - Validation methods
  - Result formatting
  - Naming conventions
  - Error handling

### Registry

Located in `core/registry/`, handles registration and retrieval of generators:

- Maintains a map of domains to generator types
- Provides methods to register and retrieve generators
- Supports listing available generators

### Factory

Located in `core/factory/`, responsible for instantiating generators:

- Creates generator instances from registered classes
- Handles errors during instantiation
- Provides convenient registration methods

### Types

Located in `core/types/`, defines common types and enums:

- **GeneratorDomain**: Enum of generator domains
- **GeneratorTypeMap**: Interface mapping domains to their supported types
- **GeneratorRegistration**: Interface for generator metadata
- **GeneratorOptions**: Base interface for generator options
- **GeneratorResult**: Interface for generator results

## Usage

The Core module is used by the generator system to:

1. Register generator implementations by domain and type
2. Create generator instances at runtime
3. Provide common functionality for all generators
4. Maintain type safety throughout the generator system

## Integration

The Core module integrates with:

1. **Domain-specific registrars**: Each domain has a registrar that registers generators with the registry
2. **Main generator index**: The core module is imported and used by the main generator system
3. **CLI commands**: The CLI uses the core module to create and execute generators

## Extending the Core

To extend the Core module:

1. Add new interfaces in `core/interfaces/`
2. Add new base classes in `core/base/`
3. Add new types and enums in `core/types/`
4. Update the exports in `core/index.ts`
