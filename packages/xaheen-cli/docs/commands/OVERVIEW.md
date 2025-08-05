# Xaheen CLI Commands Overview

The Xaheen CLI provides a comprehensive set of commands organized into logical categories. This document provides a complete reference for all available commands, their options, and usage examples.

## 📋 Command Categories

### Core Commands
- **[Make Commands](./MAKE.md)** - Laravel Artisan-inspired generators
- **[Project Commands](./PROJECT.md)** - Project creation and management
- **[Service Commands](./SERVICE.md)** - Service integration and management
- **[AI Commands](./AI.md)** - AI-powered development features
- **[Utility Commands](./UTILITY.md)** - Validation, testing, and deployment

### Quick Reference

```bash
# Project Management
xaheen new <name>              # Create new project
xaheen project create <name>   # Create with options
xaheen project validate        # Validate project

# Code Generation
xaheen make:model <name>       # Create model
xaheen make:controller <name>  # Create controller
xaheen make:component <name>   # Create component
xaheen generate <type> <name>  # General generation

# AI Features
xaheen ai code <prompt>        # Generate with AI
xaheen ai refactor <file>      # AI refactoring
xaheen ai fix-types           # Fix TypeScript

# Services
xaheen service add <service>   # Add service
xaheen service remove <name>   # Remove service
xaheen service list           # List services

# Utilities
xaheen build                  # Build project
xaheen test                   # Run tests
xaheen deploy                 # Deploy project
xaheen validate               # Validate all
```

## 🎯 Command Structure

All Xaheen commands follow a consistent structure:

```bash
xaheen <command> [subcommand] [arguments] [options]
```

### Global Options

These options work with all commands:

```bash
--help, -h          # Show help for command
--version, -v       # Show CLI version
--verbose           # Verbose output
--quiet             # Minimal output
--debug             # Debug mode
--dry-run           # Preview without changes
--config <file>     # Use custom config
--no-color          # Disable colored output
--json              # JSON output format
```

## 🚀 Core Command Groups

### 1. Make Commands (Laravel-Inspired)

The `make:` commands follow Laravel's Artisan pattern:

```bash
# Models & Database
xaheen make:model User --migration --factory --seeder
xaheen make:migration create_users_table
xaheen make:seeder UserSeeder
xaheen make:factory UserFactory

# Controllers & API
xaheen make:controller UserController --api --resource
xaheen make:request CreateUserRequest
xaheen make:resource UserResource
xaheen make:middleware AuthMiddleware

# Frontend Components
xaheen make:component Button --typescript
xaheen make:page Dashboard --layout admin
xaheen make:layout AdminLayout
xaheen make:hook useAuth

# Services & Jobs
xaheen make:service UserService
xaheen make:job SendWelcomeEmail
xaheen make:command ImportUsers
xaheen make:observer UserObserver
```

### 2. Project Commands

Manage entire projects and applications:

```bash
# Create Projects
xaheen new my-app                          # Interactive
xaheen project create my-app --preset saas # With preset
xaheen project init                        # Initialize existing

# Project Management
xaheen project info                        # Show project info
xaheen project validate                    # Validate structure
xaheen project update                      # Update dependencies
xaheen project clean                       # Clean build artifacts

# Monorepo Management
xaheen app add web --framework nextjs      # Add app
xaheen app remove mobile                   # Remove app
xaheen app list                           # List apps
xaheen package add shared                  # Add package
```

### 3. Service Commands

Integrate and manage external services:

```bash
# Add Services
xaheen service add auth --provider clerk
xaheen service add database --provider postgresql --orm prisma
xaheen service add payments --provider stripe
xaheen service add email --provider sendgrid
xaheen service add storage --provider s3

# Norwegian Services
xaheen service add bankid --environment test
xaheen service add vipps --merchant-id YOUR_ID
xaheen service add altinn --org-number 123456789

# Service Management
xaheen service list                        # List all services
xaheen service info auth                   # Service details
xaheen service update payments             # Update service
xaheen service remove email                # Remove service
xaheen service validate                    # Validate all
```

### 4. AI Commands

Leverage AI for code generation and assistance:

```bash
# Code Generation
xaheen ai code "create user authentication system"
xaheen ai component "responsive navigation with mobile menu"
xaheen ai api "RESTful API for blog posts with CRUD"

# Code Enhancement
xaheen ai refactor src/components/Header.tsx
xaheen ai optimize src/utils/calculations.ts
xaheen ai document src/services/UserService.ts

# Fixes and Compliance
xaheen ai fix-types                        # Fix TypeScript errors
xaheen ai fix-lint                         # Fix linting issues
xaheen ai fix-security                     # Fix security issues
xaheen ai norwegian-check                  # Norwegian compliance

# Interactive AI
xaheen ai chat                             # Interactive AI session
xaheen ai explain src/complex-logic.ts     # Explain code
xaheen ai suggest                          # Get suggestions
```

### 5. Build & Deploy Commands

Build and deploy your applications:

```bash
# Build Commands
xaheen build                               # Build all
xaheen build --production                  # Production build
xaheen build --platform web                # Specific platform
xaheen build --analyze                     # Bundle analysis
xaheen build --watch                       # Watch mode

# Deployment
xaheen deploy                              # Interactive deploy
xaheen deploy --platform vercel            # Deploy to Vercel
xaheen deploy --platform aws --region eu-north-1
xaheen deploy --env production             # Specific environment
xaheen deploy --preview                    # Preview deployment
```

## 📊 Advanced Command Usage

### Command Composition

Commands can be chained and composed:

```bash
# Create and setup in one go
xaheen new my-app && cd my-app && xaheen service add auth database payments

# Generate multiple related files
xaheen make:model Post --all  # Creates model, migration, controller, etc.

# Validate before deploy
xaheen validate && xaheen test && xaheen deploy --production
```

### Interactive Mode

Most commands support interactive mode when run without arguments:

```bash
xaheen new          # Interactive project creation
xaheen generate     # Interactive code generation
xaheen service add  # Interactive service addition
xaheen ai          # Interactive AI session
xaheen deploy      # Interactive deployment
```

### Configuration Override

Override configuration for specific commands:

```bash
# Use different port
xaheen dev --port 4000

# Use different config file
xaheen build --config production.config.js

# Override environment
xaheen test --env test

# Custom output directory
xaheen build --output dist-production
```

## 🛠️ Utility Commands

### Validation Commands

```bash
xaheen validate                    # Full validation
xaheen validate --types           # TypeScript validation
xaheen validate --lint            # Linting validation
xaheen validate --security        # Security validation
xaheen validate --performance     # Performance validation
xaheen validate --accessibility   # A11y validation
xaheen validate --norwegian       # Norwegian compliance
```

### Testing Commands

```bash
xaheen test                       # Run all tests
xaheen test --unit               # Unit tests only
xaheen test --integration        # Integration tests
xaheen test --e2e               # End-to-end tests
xaheen test --coverage          # With coverage
xaheen test --watch             # Watch mode
xaheen test --parallel          # Parallel execution
```

### Maintenance Commands

```bash
xaheen doctor                    # System diagnostics
xaheen doctor --fix             # Auto-fix issues
xaheen update                   # Update CLI
xaheen update --check           # Check for updates
xaheen cache clear              # Clear all caches
xaheen clean                    # Clean artifacts
```

## 🔧 Command Options Reference

### Common Patterns

```bash
# Boolean flags
--force, -f         # Force operation
--yes, -y          # Auto-confirm
--no-install       # Skip installation
--skip-git         # Skip git init

# Value options
--output <dir>     # Output directory
--template <name>  # Template name
--preset <preset>  # Use preset
--env <env>        # Environment

# Multiple values
--features auth,db,cache
--exclude tests,docs
--only web,api
```

### Environment Variables

Commands respect these environment variables:

```bash
XAHEEN_HOME         # CLI home directory
XAHEEN_CONFIG       # Config file path
XAHEEN_DEBUG        # Enable debug mode
XAHEEN_NO_BANNER    # Disable banner
XAHEEN_LOG_LEVEL    # Log level
XAHEEN_TELEMETRY    # Enable telemetry
```

## 📝 Command Aliases

Common command aliases for convenience:

```bash
# Short aliases
xaheen g  → xaheen generate
xaheen n  → xaheen new
xaheen s  → xaheen service
xaheen t  → xaheen test
xaheen b  → xaheen build
xaheen d  → xaheen deploy

# Make command aliases
xaheen m:m → xaheen make:model
xaheen m:c → xaheen make:controller
xaheen m:co → xaheen make:component
```

## 🎯 Best Practices

### 1. Use Interactive Mode When Learning

```bash
# Better for beginners
xaheen new
xaheen generate
xaheen service add

# Instead of
xaheen new my-app --preset fullstack --framework nextjs
```

### 2. Always Validate Before Deploy

```bash
# Good practice
xaheen validate && xaheen test && xaheen deploy

# Risky
xaheen deploy --force
```

### 3. Use Dry Run for Safety

```bash
# Preview changes
xaheen generate component Button --dry-run
xaheen service add database --dry-run
xaheen deploy --dry-run
```

### 4. Leverage AI for Complex Tasks

```bash
# Let AI help with complex generation
xaheen ai code "create a complete user management system with roles and permissions"

# Instead of multiple manual commands
xaheen make:model User
xaheen make:model Role
xaheen make:controller UserController
# ... many more commands
```

## 🚨 Troubleshooting Commands

### Debug Mode

```bash
# Enable debug logging
export XAHEEN_DEBUG=true
xaheen new my-app

# Or per command
xaheen new my-app --debug
```

### Getting Help

```bash
# General help
xaheen --help
xaheen help

# Command-specific help
xaheen new --help
xaheen make:model --help
xaheen ai code --help

# Interactive help
xaheen help interactive
```

---

**Next Steps:**
- Learn [Make Commands](./MAKE.md) in detail
- Explore [AI Commands](./AI.md) capabilities
- Master [Service Commands](./SERVICE.md)