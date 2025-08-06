# Database Generators

## Overview

The Database Generators module provides specialized code generators for creating database migrations, seeds, schemas, and other database-related components. These generators implement best practices, support multiple database systems, and accelerate the development of data persistence layers.

## Architecture

The database generators follow the modular architecture of the Xaheen CLI generator system:

1. Each generator extends the `BaseGenerator` abstract class
2. Generators implement the `generate` method to produce database artifacts
3. All generators are registered via the Database Registrar
4. Generators maintain consistent naming conventions and output formatting

## Key Generators

### Migration Generator

Creates database migration scripts with:
- Schema modifications
- Table creation/deletion
- Column modifications
- Index management
- Foreign key relationships
- Rollback capabilities
- TypeScript typing (for TypeORM, Prisma, etc.)

### Seed Generator

Creates data seeding scripts with:
- Test data generation
- Reference data population
- Environment-specific data
- Dependency management between seeds
- TypeScript support
- Transaction handling

### Schema Generator

Creates database schema definitions with:
- Entity models
- Relationships
- Indices
- Constraints
- TypeScript interfaces
- ORM configurations

### Repository Generator

Creates data access repositories with:
- CRUD operations
- Query methods
- Transaction support
- TypeScript typing
- Error handling
- Unit tests

## Integration with Main CLI

The Database Generators integrate with the Xaheen CLI through:

1. **Command Registration**: Each generator type is exposed as a CLI command
2. **Project Analysis**: Generators analyze the project structure to determine appropriate file locations
3. **ORM Detection**: Generators adapt output based on detected ORM (Prisma, TypeORM, Sequelize, etc.)
4. **Database Support**: Generators support multiple database systems (PostgreSQL, MySQL, MongoDB, etc.)
5. **Template System**: Generators use a template system that can be customized

## Usage Examples

### Via CLI

```bash
# Generate a new migration
xaheen generate migration CreateUserTable --fields=id:uuid,name:string,email:string:unique,createdAt:timestamp

# Generate a seed
xaheen generate seed UserSeed --count=50 --template=realistic

# Generate a schema
xaheen generate schema Product --fields=id:uuid,name:string,price:decimal,description:text,categoryId:uuid:foreign
```

### Programmatically

```typescript
import { generateCode } from '@xaheen-ai/cli/generators';

// Generate a migration
const result = await generateCode({
  type: 'migration',
  name: 'AddUserRolesTable',
  fields: [
    { name: 'id', type: 'uuid', primary: true },
    { name: 'name', type: 'string', length: 100 },
    { name: 'description', type: 'text', nullable: true }
  ],
  timestamp: true
});
```

## Best Practices Implemented

The database generators implement best practices including:

- Database normalization principles
- Index optimization
- Transaction management
- Data integrity constraints
- Migration versioning
- Schema validation
- Type safety with TypeScript
- Security best practices
- Performance considerations
- Idempotent operations
