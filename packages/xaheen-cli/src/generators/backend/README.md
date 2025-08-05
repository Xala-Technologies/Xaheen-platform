# Backend Generators

## Overview

The Backend Generators module provides specialized code generators for creating API endpoints, controllers, services, models, and other server-side components. These generators implement best practices, enforce consistent architecture, and accelerate the development of robust backend systems.

## Architecture

The backend generators follow the modular architecture of the Xaheen CLI generator system:

1. Each generator extends the `BaseGenerator` abstract class
2. Generators implement the `generate` method to produce code artifacts
3. All generators are registered via the Backend Registrar
4. Generators maintain consistent naming conventions and output formatting

## Key Generators

### API Generator

Creates complete REST API endpoints with:
- Route definitions
- Controller methods
- Service integration
- Input validation
- Error handling
- Authentication/authorization
- Documentation (OpenAPI/Swagger)
- TypeScript typing

### Controller Generator

Creates controller classes with:
- Route handlers
- Request validation
- Response formatting
- Service injection
- Error handling
- TypeScript interfaces
- Documentation comments
- Unit test files

### Service Generator

Creates service classes with:
- Business logic implementation
- Repository pattern integration
- Transaction handling
- Error handling
- Logging
- TypeScript interfaces
- Unit tests

### Model Generator

Creates data models with:
- Entity definitions
- Property validation
- Type definitions
- Documentation
- Repository methods

### Middleware Generator

Creates middleware components with:
- Request/response processing
- Authentication checks
- Logging
- Performance monitoring
- Error handling
- TypeScript typing

## Integration with Main CLI

The Backend Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each generator type is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to determine appropriate file locations
3. **Framework Detection**: Generators adapt output based on detected backend framework (Express, NestJS, etc.)
4. **Database Integration**: Generators support multiple database systems and ORMs
5. **Template System**: Generators use a template system that can be customized

## Usage Examples

### Via CLI

```bash
# Generate a new controller
xaheen generate controller User --methods=getAll,getById,create,update,delete

# Generate a service
xaheen generate service Authentication --methods=login,register,validateToken

# Generate a model
xaheen generate model Product --fields=name:string,price:number,description:string,category:string
```

### Programmatically

```typescript
import { generateCode } from '@xaheen/cli/generators';

// Generate a controller
const result = await generateCode({
  type: 'controller',
  name: 'Order',
  methods: ['create', 'getById', 'getAll', 'update', 'delete'],
  withTests: true,
  withValidation: true
});
```

## Best Practices Implemented

The backend generators implement best practices including:

- Separation of concerns
- Dependency injection
- Repository pattern
- SOLID principles
- Error handling strategies
- Input validation
- Type safety with TypeScript
- Security best practices
- Performance considerations
- Test-driven development
