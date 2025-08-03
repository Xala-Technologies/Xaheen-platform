# Xaheen CLI v2

Next-generation CLI for the Xaheen platform with service-based architecture.

## Features

- **Service Management**: Complete CRUD operations for services (create, add, validate, remove)
- **Project Analysis**: Intelligent project detection and analysis
- **Service Registry**: Built-in templates for common services (auth, database, payments, email, analytics, monitoring, cache)
- **Validation Engine**: Comprehensive project health checks with auto-fix capabilities
- **Backup System**: Automatic backups before destructive operations
- **Dependency Analysis**: Smart dependency checking to prevent breaking changes
- **Multi-Framework Support**: Works with Next.js, Nuxt, SvelteKit, React, and more

## Installation

```bash
# Global installation
npm install -g @xaheen/cli-v2
# or
yarn global add @xaheen/cli-v2
# or
pnpm add -g @xaheen/cli-v2
# or
bun add -g @xaheen/cli-v2
```

## Quick Start

```bash
# Create a new SaaS project
xaheen create my-saas --bundle saas-starter

# Add authentication to existing project
cd my-project
xaheen add auth --provider clerk

# Validate project health
xaheen validate --fix
```

## Commands

### `xaheen create <name>`
Create a new project with optional service bundles.

```bash
# Basic usage
xaheen create my-app

# With specific framework
xaheen create my-app --framework nextjs

# With service bundle
xaheen create my-app --bundle saas-starter

# With specific services
xaheen create my-app --services auth,database,payments
```

Options:
- `--framework <framework>` - Framework to use (nextjs, nuxt, sveltekit, react, vue, angular)
- `--database <database>` - Database to configure (postgresql, mysql, mongodb, sqlite)
- `--bundle <bundle>` - Service bundle to apply (saas-starter, e-commerce, api-platform, blog-cms)
- `--services <services>` - Comma-separated list of services to add
- `--package-manager <pm>` - Package manager to use (npm, yarn, pnpm, bun)

### `xaheen add [services...]`
Add services to existing project.

```bash
# Add single service
xaheen add auth

# Add multiple services
xaheen add auth database payments

# With specific providers
xaheen add auth --provider clerk
xaheen add database --provider postgresql --orm prisma

# Preview changes
xaheen add email --dry-run
```

Options:
- `--provider <provider>` - Specific provider to use
- `--orm <orm>` - ORM to use with database (prisma, drizzle, mongoose)
- `--dry-run` - Preview changes without applying
- `--force` - Add even if conflicts exist

### `xaheen validate`
Validate project configuration and health.

```bash
# Basic validation
xaheen validate

# Auto-fix issues
xaheen validate --fix

# Specific validations
xaheen validate --services --deps --env
```

Options:
- `--fix` - Automatically fix issues where possible
- `--services` - Validate service configurations
- `--deps` - Validate dependencies
- `--env` - Validate environment variables
- `--lint` - Run linting checks
- `--types` - Run TypeScript validation

### `xaheen remove [services...]`
Remove services from existing project.

```bash
# Remove single service
xaheen remove auth

# Remove multiple services
xaheen remove auth payments

# Preview removal
xaheen remove database --dry-run

# Force removal
xaheen remove cache --force
```

Options:
- `--force` - Force removal even if dependencies exist
- `--cleanup` - Remove orphaned files and dependencies
- `--dry-run` - Preview changes without applying
- `--keep-config` - Keep configuration files

## Service Bundles

Pre-configured combinations of services for common use cases:

### SaaS Starter
Perfect for SaaS applications with authentication, payments, and analytics.

**Included Services:**
- Authentication (Clerk)
- Database (PostgreSQL + Prisma)
- Payments (Stripe)
- Email (Resend)
- Analytics (PostHog)

```bash
xaheen create my-saas --bundle saas-starter
```

### E-commerce
Complete e-commerce setup with inventory, payments, and media handling.

**Included Services:**
- Authentication (Auth.js)
- Database (PostgreSQL + Drizzle)
- Payments (Stripe)
- Email (SendGrid)
- Storage (Cloudinary)

```bash
xaheen create my-shop --bundle e-commerce
```

### API Platform
Backend API with authentication, monitoring, and background jobs.

**Included Services:**
- Authentication (Auth.js)
- Database (PostgreSQL + Prisma)
- Email (Resend)
- Monitoring (Sentry)
- Queue (BullMQ)

```bash
xaheen create my-api --bundle api-platform
```

### Blog/CMS
Content management with authentication, media, and analytics.

**Included Services:**
- Authentication (Clerk)
- Database (PostgreSQL + Prisma)
- Storage (Cloudinary)
- Analytics (Vercel Analytics)

```bash
xaheen create my-blog --bundle blog-cms
```

## Test Suite

Comprehensive test coverage with:
- Unit tests for all core services
- Integration tests for complete workflows
- Command tests for CLI interface
- Fixture-based testing with temporary projects

Run tests:
```bash
bun test
bun test --coverage
```

## Architecture

### Core Services

- **ServiceRegistry**: Manages service templates and definitions
- **ProjectAnalyzer**: Detects project configuration and services
- **ProjectValidator**: Validates project health and configuration
- **ServiceRemover**: Handles safe service removal with dependency checking
- **BundleResolver**: Resolves service bundles and compatibility
- **ServiceInjector**: Injects service code into projects

### Built-in Service Templates

#### Authentication
- **Better Auth**: Modern authentication with database integration
- **Clerk**: Full-featured authentication with social providers
- **Auth.js**: Flexible authentication for Next.js
- **Supabase Auth**: Authentication with Supabase

#### Database
- **PostgreSQL**: Enterprise-grade relational database with Prisma ORM
- **MySQL**: Popular relational database with Prisma ORM
- **MongoDB**: Document-based NoSQL database
- **Supabase**: PostgreSQL with real-time capabilities

#### Payments
- **Stripe**: Complete payment processing platform
- **Paddle**: SaaS-focused payment solution

#### Email
- **Resend**: Modern email API for developers
- **SendGrid**: Scalable email delivery service
- **Postmark**: Transactional email service

#### Storage
- **AWS S3**: Amazon S3 object storage
- **Cloudinary**: Media management and transformation

#### Queue
- **BullMQ**: Redis-based queue system for background jobs

#### Realtime
- **Socket.io**: Real-time bidirectional event-based communication
- **Pusher**: Hosted real-time messaging API

#### Analytics
- **PostHog**: Product analytics platform
- **Vercel Analytics**: Web analytics for Vercel deployments
- **Mixpanel**: Advanced user behavior analytics

#### Monitoring
- **Sentry**: Error tracking and performance monitoring

#### Cache
- **Redis**: In-memory data structure store

## Configuration

### Project Configuration

When you create or add services, Xaheen CLI creates a `.xaheen/config.json` file:

```json
{
  "version": "2.0.0",
  "framework": "nextjs",
  "packageManager": "bun",
  "services": {
    "auth": {
      "provider": "clerk",
      "version": "5.0.0",
      "installedAt": "2024-01-20T10:00:00Z"
    },
    "database": {
      "provider": "postgresql",
      "orm": "prisma",
      "version": "5.0.0",
      "installedAt": "2024-01-20T10:00:00Z"
    }
  }
}
```

### Environment Variables

Services automatically add required environment variables to `.env.local`:

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Payments (Stripe)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
```

### Service Dependencies

Some services have dependencies that are automatically managed:

- **BullMQ** requires Redis
- **Better Auth** requires a database
- **Realtime services** may require additional configuration

The CLI will prompt you to install dependencies or configure them automatically.

## Advanced Usage

### Custom Service Templates

Create custom service templates in `.xaheen/templates/`:

```json
{
  "name": "custom-auth",
  "type": "auth",
  "provider": "custom",
  "version": "1.0.0",
  "description": "Custom authentication service",
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "envVariables": [
    {
      "name": "JWT_SECRET",
      "description": "Secret key for JWT tokens",
      "required": true
    }
  ],
  "injectionPoints": [
    {
      "type": "file-create",
      "target": "src/lib/auth.ts",
      "template": "// Custom auth implementation",
      "priority": 100
    }
  ]
}
```

### Service Compatibility

The CLI checks compatibility between services and frameworks:

```bash
# Check compatibility before adding
xaheen add auth --provider better-auth --check-compatibility

# Force add despite warnings
xaheen add auth --provider better-auth --force
```

### Backup and Recovery

Before destructive operations, backups are created:

```bash
# Backups are stored in .xaheen/backups/
.xaheen/backups/
├── 2024-01-20-10-00-00-remove-auth/
│   ├── files/
│   └── config.json
```

Restore from backup:

```bash
xaheen restore .xaheen/backups/2024-01-20-10-00-00-remove-auth
```

## Troubleshooting

### Common Issues

1. **Service not detected**
   - Ensure service files follow naming conventions
   - Run `xaheen validate --services` to check detection

2. **Dependency conflicts**
   - Use `xaheen validate --deps` to identify conflicts
   - Run with `--force` to override (use carefully)

3. **Environment variables missing**
   - Check `.env.local` for required variables
   - Run `xaheen validate --env` to verify

### Debug Mode

Enable debug output for troubleshooting:

```bash
# Debug all operations
DEBUG=xaheen:* xaheen add auth

# Debug specific modules
DEBUG=xaheen:analyzer xaheen validate
DEBUG=xaheen:injector xaheen add database
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test

# Test with coverage
bun test --coverage

# Development with watch
bun dev

# Link for local testing
bun link
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - see [LICENSE](../../LICENSE) for details