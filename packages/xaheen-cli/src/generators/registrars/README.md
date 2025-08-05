# Generator Registrars

## Overview

The Generator Registrars module contains domain-specific registrars responsible for registering generators with the central registry system. Each registrar acts as an initialization point for a specific domain of generators (frontend, backend, database, etc.), ensuring that generators are properly registered and discoverable.

## Architecture

The registrars follow a consistent pattern:

1. Import the `IGeneratorRegistry` interface and `GeneratorDomain` enum from the core module
2. Import generator classes from their respective locations
3. Export a registration function that registers all domain generators with the registry

## Key Registrars

### Frontend Registrar

Registers UI and client-side generators:
- Page generators
- Layout generators
- Component generators
- Hook generators
- Context generators

### Backend Registrar

Registers server-side generators:
- API generators
- Controller generators
- Service generators
- Model generators
- Middleware generators

### Database Registrar

Registers database-related generators:
- Migration generators
- Seed generators
- Schema generators
- Repository generators

### Full-Stack Registrar

Registers end-to-end generators:
- Scaffold generators
- CRUD generators
- Auth generators
- Feature generators

### Infrastructure Registrar

Registers infrastructure and DevOps generators:
- Docker generators
- Kubernetes generators
- CI/CD generators
- Deployment generators
- Terraform generators

### Testing Registrar

Registers testing-related generators:
- Unit test generators
- E2E test generators
- Mock generators

### Patterns Registrar

Registers architectural pattern generators:
- DDD generators
- Clean Architecture generators
- CQRS generators
- Event Sourcing generators
- Dependency Injection generators

## Usage

The registrars are used during the initialization of the generator system:

```typescript
// In the main generator index file
import { registerFrontendGenerators } from './registrars/frontend.registrar.js';
import { registerBackendGenerators } from './registrars/backend.registrar.js';
// ... other imports

// Initialize the registry with all available generators
function initializeGeneratorRegistry(): void {
  registerFrontendGenerators(generatorRegistry);
  registerBackendGenerators(generatorRegistry);
  // ... register other domains
}
```

## Integration with CLI

The registrars play a crucial role in the CLI startup process:

1. When the CLI starts, the generator system is initialized
2. The initialization process calls each registrar to register its generators
3. The CLI commands can then access the registered generators through the registry

## Extending with New Domains

To add a new generator domain:

1. Create a new registrar file in this directory (e.g., `newdomain.registrar.ts`)
2. Implement the registration function following the established pattern
3. Import and call the new registrar in the main generator initialization function
