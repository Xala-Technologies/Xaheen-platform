# Full-Stack Generators

## Overview

The Full-Stack Generators module provides end-to-end code generation solutions that span both frontend and backend components. These generators create complete features, CRUD operations, authentication systems, and scaffolding for entire application modules, enabling rapid development of cohesive functionality across the application stack.

## Architecture

The full-stack generators follow the modular architecture of the Xaheen CLI generator system:

1. Each generator extends the `BaseGenerator` abstract class
2. Generators implement the `generate` method to produce interconnected frontend and backend artifacts
3. All generators are registered via the Full-Stack Registrar
4. Generators coordinate with other domain-specific generators to create comprehensive solutions

## Key Generators

### Scaffold Generator

Creates complete feature scaffolding with:
- Backend API endpoints with controllers, services, and models
- Database migrations and entity definitions
- Frontend components for listing, detail, form, and operations
- Type definitions shared between frontend and backend
- Routing configuration
- Test files for all components
- Documentation templates

### CRUD Generator

Generates full-stack CRUD operations with:
- REST API endpoints for Create, Read, Update, Delete
- Data validation on both client and server
- Database models and migrations
- UI components for each operation
- Form handling with validation
- Error handling and notifications
- TypeScript interfaces shared across stack

### Auth Generator

Creates authentication and authorization system with:
- User registration and login flows
- JWT or session-based authentication
- Role-based access control
- Profile management
- Password reset functionality
- Security best practices
- Frontend auth providers and hooks
- Protected routes

### Feature Generator

Generates complete business features with:
- Domain-specific models and logic
- API endpoints and services
- UI components and pages
- State management
- Form handling
- Navigation integration
- Comprehensive testing

## Integration with Main CLI

The Full-Stack Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each generator type is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to determine appropriate integration points
3. **Framework Support**: Generators support multiple frontend and backend frameworks
4. **Database Integration**: Generators work with various database systems and ORMs
5. **Template System**: Generators use a template system that can be customized

## Usage Examples

### Via CLI

```bash
# Generate a complete scaffold
xaheen generate scaffold Product --fields=name:string,price:number,description:text,category:string

# Generate CRUD operations
xaheen generate crud User --fields=name:string,email:string,role:enum:admin|user|guest

# Generate authentication system
xaheen generate auth --method=jwt --roles=admin,user --features=registration,passwordReset,socialAuth
```

### Programmatically

```typescript
import { generateCode } from '@xaheen/cli/generators';

// Generate a feature
const result = await generateCode({
  type: 'feature',
  name: 'Subscription',
  entities: ['Plan', 'Subscription', 'Payment'],
  includeAPI: true,
  includeUI: true,
  includeTesting: true
});
```

## Key Benefits

The Full-Stack Generators provide several advantages:

1. **Consistency**: Ensures consistent implementation across frontend and backend
2. **Productivity**: Dramatically reduces development time for common features
3. **Best Practices**: Enforces architectural patterns and best practices
4. **Maintainability**: Creates well-structured code that follows established conventions
5. **Integration**: Ensures proper integration between frontend and backend components
6. **Completeness**: Provides end-to-end solutions rather than disconnected parts
