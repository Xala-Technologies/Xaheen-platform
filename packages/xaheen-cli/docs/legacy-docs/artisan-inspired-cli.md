# Xaheen Artisan-Inspired CLI Architecture

## Vision
Create a Laravel Artisan-inspired CLI that combines the elegance and developer experience of Artisan with MCP-powered intelligence for smarter code generation and project management.

## Core Philosophy
- **Convention over Configuration** - Smart defaults with override capability
- **Developer Experience First** - Intuitive commands that developers already know
- **AI-Enhanced Generation** - MCP integration for intelligent code generation
- **Full-Stack Automation** - Generate entire features, not just files

## Command Structure

### Laravel Artisan Pattern
```bash
php artisan make:controller UserController
php artisan migrate
php artisan db:seed
```

### Xaheen Enhanced Pattern
```bash
xaheen make:controller UserController --resource --api
xaheen make:model User --migration --factory --seeder
xaheen make:feature Authentication --full-stack
xaheen ai:generate "user management system with roles"
```

## Command Categories

### 1. Make Commands (Creation)
Generate various application components with intelligent templates.

```bash
# Models & Database
xaheen make:model User --all                    # Model + Migration + Factory + Seeder + Controller
xaheen make:migration create_users_table
xaheen make:seeder UserSeeder
xaheen make:factory UserFactory

# Controllers & Routes
xaheen make:controller UserController --resource
xaheen make:controller API/UserController --api
xaheen make:request StoreUserRequest
xaheen make:resource UserResource

# Frontend Components
xaheen make:component UserCard --typescript
xaheen make:page users/index --crud
xaheen make:layout DashboardLayout

# Services & Jobs
xaheen make:service UserService
xaheen make:job ProcessUserData
xaheen make:event UserRegistered
xaheen make:listener SendWelcomeEmail

# Testing
xaheen make:test UserTest --unit
xaheen make:test UserFeatureTest --feature

# Full Features (AI-Enhanced)
xaheen make:feature Blog --full-stack
xaheen make:module Ecommerce --with-admin
xaheen make:crud Product --api --frontend
```

### 2. Database Commands
Manage database schemas and data.

```bash
# Migrations
xaheen migrate                          # Run pending migrations
xaheen migrate:rollback                  # Rollback last batch
xaheen migrate:reset                     # Rollback all
xaheen migrate:refresh --seed            # Refresh and seed
xaheen migrate:status                    # Show migration status

# Schema Management
xaheen schema:dump                       # Dump database schema
xaheen schema:restore                    # Restore from dump

# Seeding
xaheen db:seed                          # Run all seeders
xaheen db:seed --class=UserSeeder       # Run specific seeder
xaheen db:wipe                          # Drop all tables

# Database Inspection (AI-Enhanced)
xaheen db:show users                    # Show table structure
xaheen db:monitor                       # Real-time query monitoring
xaheen db:optimize                      # AI-powered query optimization suggestions
```

### 3. Route Commands
Manage and inspect application routes.

```bash
xaheen route:list                       # List all routes
xaheen route:list --method=GET          # Filter by method
xaheen route:cache                      # Cache routes
xaheen route:clear                      # Clear route cache
xaheen route:generate api/users          # Generate RESTful routes
```

### 4. Queue Commands
Manage background jobs and queues.

```bash
xaheen queue:work                       # Process queue jobs
xaheen queue:listen                     # Listen for new jobs
xaheen queue:failed                     # List failed jobs
xaheen queue:retry all                  # Retry failed jobs
xaheen queue:monitor                    # Real-time queue dashboard
```

### 5. Cache Commands
Manage application caching.

```bash
xaheen cache:clear                      # Clear application cache
xaheen cache:forget key                 # Remove specific key
xaheen cache:table                      # Create cache database table
xaheen cache:analyze                    # AI-powered cache optimization
```

### 6. Optimization Commands
Optimize application performance.

```bash
xaheen optimize                         # Cache everything
xaheen optimize:clear                   # Clear all caches
xaheen optimize:analyze                 # AI performance analysis
xaheen optimize:suggest                 # Get optimization suggestions
```

### 7. Tinker (REPL)
Interactive shell for testing code.

```bash
xaheen tinker                           # Start REPL
xaheen tinker --mcp                     # REPL with MCP context
```

### 8. Serve Commands
Development server management.

```bash
xaheen serve                            # Start dev server
xaheen serve --port=8080                # Custom port
xaheen serve --host=0.0.0.0             # Custom host
xaheen serve --watch                    # With hot reload
```

### 9. AI-Enhanced Commands (MCP Integration)
Intelligent code generation and analysis.

```bash
# Smart Generation
xaheen ai:generate "user authentication with OAuth"
xaheen ai:scaffold "blog with comments and tags"
xaheen ai:refactor path/to/file.ts --optimize

# Code Analysis
xaheen ai:review                        # Review entire codebase
xaheen ai:security                      # Security audit
xaheen ai:performance                   # Performance analysis

# Documentation
xaheen ai:document                      # Generate documentation
xaheen ai:changelog                     # Generate changelog from commits

# Testing
xaheen ai:test path/to/component        # Generate tests
xaheen ai:coverage --suggest            # Coverage improvement suggestions
```

### 10. Project Management
High-level project operations.

```bash
# Initialization
xaheen new blog-app                     # Create new project
xaheen init                             # Initialize in existing directory

# Modules
xaheen module:install auth              # Install pre-built module
xaheen module:remove auth               # Remove module
xaheen module:list                      # List available modules

# Environment
xaheen env:encrypt                      # Encrypt .env file
xaheen env:decrypt                      # Decrypt .env file
xaheen env:validate                     # Validate environment

# Deployment
xaheen deploy:check                     # Pre-deployment checks
xaheen deploy:optimize                  # Optimize for production
```

## Smart Features with MCP

### 1. Context-Aware Generation
The CLI understands your project structure and generates appropriate code:

```bash
# Detects you're using Next.js App Router
xaheen make:page users --crud
# Generates: app/users/page.tsx with Server Components

# Detects you're using Prisma
xaheen make:model User
# Generates: Prisma schema + TypeScript types + validation
```

### 2. Intelligent Suggestions
MCP provides real-time suggestions and corrections:

```bash
xaheen make:migratoin create_users_table
> Did you mean: make:migration? [Y/n]

xaheen make:controller --resorce
> Did you mean: --resource? [Y/n]
```

### 3. Full-Stack Generation
Generate complete features across the stack:

```bash
xaheen make:feature Blog --full-stack
```

Generates:
- Database: migrations, models, seeders
- Backend: controllers, services, validation, API routes
- Frontend: pages, components, forms, tables
- Tests: unit tests, integration tests, E2E tests
- Documentation: API docs, README

### 4. Interactive Mode
Step-by-step guided generation:

```bash
xaheen make:model --interactive

? Model name: Product
? Add migration? Yes
? Add factory? Yes
? Add seeder? Yes
? Add controller? Yes
  > Resource Controller
    API Controller
    Basic Controller
? Add frontend CRUD? Yes
? Add tests? Yes
```

### 5. Code Analysis Integration
Real-time code quality feedback:

```bash
xaheen make:controller UserController
✅ Controller created: app/Http/Controllers/UserController.php
⚠️  Suggestion: Consider adding request validation
💡 Run: xaheen make:request StoreUserRequest
```

## Implementation Phases

### Phase 1: Core Artisan Commands
- [ ] make:model, make:controller, make:migration
- [ ] migrate commands
- [ ] route:list
- [ ] serve command

### Phase 2: Extended Commands
- [ ] make:service, make:job, make:event
- [ ] queue commands
- [ ] cache commands
- [ ] db commands

### Phase 3: AI Integration
- [ ] ai:generate commands
- [ ] ai:review and ai:analyze
- [ ] Context-aware suggestions
- [ ] Interactive mode

### Phase 4: Advanced Features
- [ ] Full-stack generation
- [ ] Module system
- [ ] Deploy commands
- [ ] Performance optimization

## Command Examples

### Creating a Blog Feature
```bash
# Traditional approach (multiple commands)
xaheen make:model Post --migration --factory
xaheen make:controller PostController --resource
xaheen make:request StorePostRequest
xaheen make:request UpdatePostRequest
xaheen make:seeder PostSeeder
xaheen make:test PostTest

# AI-Enhanced approach (single command)
xaheen make:feature Blog --full-stack
# or
xaheen ai:generate "blog with posts, categories, tags, and comments"
```

### Database Operations
```bash
# Create and run migration
xaheen make:migration add_status_to_posts_table
xaheen migrate

# Rollback if needed
xaheen migrate:rollback

# Refresh with seeding
xaheen migrate:refresh --seed
```

### API Development
```bash
# Generate complete API resource
xaheen make:api-resource User --full
# Creates: Model, Migration, Controller, Resource, Request, Test

# Generate from OpenAPI spec
xaheen api:generate swagger.yaml
```

## Configuration

### xaheen.json
```json
{
  "version": "3.0.0",
  "defaults": {
    "make": {
      "model": {
        "migration": true,
        "factory": false,
        "seeder": false
      },
      "controller": {
        "type": "resource",
        "api": false
      }
    },
    "ai": {
      "provider": "mcp",
      "model": "claude-3",
      "context": true
    },
    "database": {
      "driver": "postgresql",
      "migrations": "prisma/migrations"
    }
  }
}
```

## Benefits Over Traditional CLIs

1. **Faster Development**: Generate entire features, not just files
2. **Fewer Mistakes**: AI catches errors before they happen
3. **Better Code Quality**: Built-in best practices and patterns
4. **Learning Tool**: Suggestions teach better practices
5. **Consistency**: Enforces project conventions automatically
6. **Full-Stack**: Handles frontend, backend, and database together

## Integration with MCP

The CLI integrates with MCP servers to provide:
- **Code Analysis**: Real-time code quality checks
- **Smart Suggestions**: Context-aware recommendations
- **Pattern Detection**: Identifies and suggests design patterns
- **Security Scanning**: Automatic vulnerability detection
- **Performance Tips**: Optimization suggestions
- **Documentation**: Auto-generated docs from code

## Conclusion

This Artisan-inspired CLI with MCP intelligence represents the next evolution in developer tools:
- Familiar commands developers already know
- AI-powered enhancements for smarter generation
- Full-stack capabilities for modern applications
- Real-time assistance and learning
- Significant productivity improvements

The goal is to make development not just faster, but smarter and more enjoyable.