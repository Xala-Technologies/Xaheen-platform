# Xaheen CLI - Production-Ready Full-Stack Development Toolkit

The **Xaheen CLI** is an AI-native, production-ready command-line interface designed to accelerate full-stack TypeScript development with enterprise-grade quality, security, and compliance.

## 🚀 Quick Start

Get up and running with Xaheen in under 3 commands:

```bash
# Install globally
npm install -g @xala-technologies/xaheen-cli

# Create your first project
xaheen new my-app --preset fullstack

# Start developing
cd my-app && npm run dev
```

## ⚡ Key Features

- **🤖 AI-Native Development** - Integrated AI assistance for code generation, refactoring, and optimization
- **🏗️ Full-Stack Templates** - Pre-configured templates for React, Next.js, Vue, Node.js, and more
- **🔒 Security-First** - Built-in security scanning, input validation, and compliance checking
- **🇳🇴 Norwegian Compliance** - GDPR, accessibility, and Norwegian digital standards compliance
- **⚡ Performance Optimized** - Cold start times < 500ms, built for developer productivity
- **🧪 Testing Ready** - Comprehensive test suites, coverage reporting, and quality gates
- **📦 Modern Tooling** - TypeScript-first, ESM support, and cutting-edge build tools

## 📋 Table of Contents

- [Installation](#installation)
- [Commands Reference](#commands-reference)
- [Project Types](#project-types)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)
- [Contributing](#contributing)

## 📦 Installation

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (or equivalent with yarn/pnpm)
- **Git**: For project versioning and templates

### Global Installation

```bash
npm install -g @xala-technologies/xaheen-cli
```

### Verify Installation

```bash
xaheen --version
xaheen --help
```

### Development Installation

For contributing or local development:

```bash
git clone https://github.com/xala-technologies/xaheen-cli.git
cd xaheen-cli
npm install
npm run build
npm link
```

## 🎯 Commands Reference

### Core Commands

#### `xaheen new <project-name>`

Create a new project with intelligent defaults and modern tooling.

```bash
# Interactive mode (recommended)
xaheen new my-app

# With preset
xaheen new my-app --preset fullstack

# With specific technologies
xaheen new my-app --framework nextjs --database postgresql --auth nextauth
```

**Options:**
- `--preset <preset>` - Use predefined stack (fullstack, frontend, backend, mobile)
- `--framework <framework>` - Choose framework (nextjs, react, vue, angular, svelte)
- `--database <database>` - Database type (postgresql, mysql, mongodb, sqlite)
- `--auth <auth>` - Authentication provider (nextauth, auth0, firebase, supabase)
- `--deployment <platform>` - Deployment target (vercel, netlify, aws, azure)
- `--features <features>` - Additional features (tailwind, prisma, stripe, i18n)
- `--skip-install` - Don't install dependencies
- `--skip-git` - Don't initialize git repository

#### `xaheen generate <type> <name>`

Generate components, pages, and other code structures.

```bash
# Generate a React component
xaheen generate component UserProfile

# Generate a Next.js page
xaheen generate page dashboard

# Generate API route
xaheen generate api users

# Generate database model
xaheen generate model User
```

**Supported Types:**
- `component` - React/Vue/Angular components
- `page` - Framework-specific pages
- `api` - API routes and endpoints
- `model` - Database models and schemas
- `service` - Business logic services
- `hook` - Custom React hooks
- `layout` - Layout components
- `middleware` - Framework middleware

#### `xaheen ai <command>`

AI-powered development assistance and code generation.

```bash
# Interactive AI assistance
xaheen ai

# Generate code with AI
xaheen ai code "Create a user authentication system"

# Refactor existing code
xaheen ai refactor src/components/Header.tsx

# Fix TypeScript errors
xaheen ai fix-types

# Norwegian compliance check
xaheen ai norwegian-check
```

**AI Commands:**
- `code <prompt>` - Generate code from natural language
- `refactor <file>` - AI-powered refactoring
- `fix-types` - Automatically fix TypeScript errors
- `optimize` - Performance optimization suggestions
- `security-scan` - Security vulnerability analysis
- `norwegian-check` - Norwegian compliance validation

#### `xaheen build`

Build your project with optimized settings and validation.

```bash
# Standard build
xaheen build

# Production build with optimizations
xaheen build --production

# Build with analysis
xaheen build --analyze

# Build specific target
xaheen build --target web
```

#### `xaheen test`

Run comprehensive test suites with coverage reporting.

```bash
# Run all tests
xaheen test

# Run specific test types
xaheen test --unit
xaheen test --integration
xaheen test --e2e

# Run with coverage
xaheen test --coverage

# Watch mode
xaheen test --watch
```

#### `xaheen deploy`

Deploy your application to various platforms.

```bash
# Interactive deployment
xaheen deploy

# Deploy to specific platform
xaheen deploy --platform vercel
xaheen deploy --platform aws

# Deploy with environment
xaheen deploy --env production
```

### Utility Commands

#### `xaheen validate`

Validate your project structure, dependencies, and compliance.

```bash
# Full validation
xaheen validate

# Specific validations
xaheen validate --security
xaheen validate --performance
xaheen validate --compliance
xaheen validate --dependencies
```

#### `xaheen update`

Update dependencies and Xaheen CLI tools.

```bash
# Update CLI
xaheen update

# Update project dependencies
xaheen update --deps

# Update templates
xaheen update --templates
```

#### `xaheen doctor`

Diagnose and fix common issues.

```bash
# Run full diagnostic
xaheen doctor

# Check specific areas
xaheen doctor --system
xaheen doctor --project
xaheen doctor --dependencies
```

## 🏗️ Project Types

### Full-Stack Application

Complete web application with frontend, backend, and database.

```bash
xaheen new my-fullstack-app --preset fullstack
```

**Includes:**
- Next.js with App Router
- TypeScript configuration
- Tailwind CSS styling
- PostgreSQL database with Prisma
- NextAuth.js authentication
- Comprehensive testing setup
- CI/CD configuration

### Frontend Application

Modern frontend application with state management and routing.

```bash
xaheen new my-frontend-app --preset frontend --framework react
```

**Includes:**
- React with TypeScript
- Vite build tool
- React Router
- Zustand state management
- Testing with Vitest and React Testing Library

### Backend API

RESTful or GraphQL API with authentication and database integration.

```bash
xaheen new my-api --preset backend --framework express
```

**Includes:**
- Express.js with TypeScript
- Database integration (Prisma/TypeORM)
- JWT authentication
- Input validation with Zod
- OpenAPI documentation
- Rate limiting and security middleware

### Mobile Application

Cross-platform mobile application using React Native or Expo.

```bash
xaheen new my-mobile-app --preset mobile --framework react-native
```

**Includes:**
- React Native with TypeScript
- Expo development tools
- Navigation setup
- State management
- Native module integration

## ⚙️ Configuration

### Project Configuration

Xaheen projects use a `xaheen.config.js` file for configuration:

```javascript
// xaheen.config.js
export default {
  // Project metadata
  name: "my-project",
  version: "1.0.0",
  
  // Framework configuration
  framework: "nextjs",
  
  // Build configuration
  build: {
    target: "web",
    outputDir: "dist",
    sourcemap: true,
  },
  
  // Development configuration
  dev: {
    port: 3000,
    hot: true,
  },
  
  // Testing configuration
  test: {
    coverage: {
      threshold: 90,
    },
  },
  
  // AI configuration
  ai: {
    provider: "openai",
    model: "gpt-4",
  },
  
  // Compliance configuration
  compliance: {
    norwegian: true,
    gdpr: true,
    accessibility: "WCAG-AA",
  },
};
```

### Environment Variables

Common environment variables used by Xaheen:

```bash
# Development
NODE_ENV=development
XAHEEN_LOG_LEVEL=info

# AI Configuration
OPENAI_API_KEY=your_openai_key
CODEBUFF_API_KEY=your_codebuff_key

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
XAHEEN_ENABLE_AI=true
XAHEEN_ENABLE_TELEMETRY=false
```

### CLI Configuration

Global CLI configuration in `~/.xaheen/config.json`:

```json
{
  "defaultTemplate": "nextjs",
  "ai": {
    "enabled": true,
    "provider": "openai"
  },
  "telemetry": false,
  "updates": {
    "checkFrequency": "weekly"
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Installation Issues

**Problem**: `npm install -g` fails with permission errors

**Solution**:
```bash
# Use npm with different prefix
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use Node Version Manager
nvm install node
```

**Problem**: Command not found after installation

**Solution**:
```bash
# Check PATH
echo $PATH

# Reinstall globally
npm uninstall -g @xala-technologies/xaheen-cli
npm install -g @xala-technologies/xaheen-cli
```

#### Project Creation Issues

**Problem**: Project creation fails or hangs

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Use verbose logging
xaheen new my-app --verbose

# Skip dependency installation and install manually
xaheen new my-app --skip-install
cd my-app && npm install
```

#### Build Issues

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Run type checking
xaheen validate --types

# Fix common TypeScript issues
xaheen ai fix-types

# Check TypeScript configuration
cat tsconfig.json
```

#### Performance Issues

**Problem**: Slow command execution

**Solution**:
```bash
# Run performance diagnostic
xaheen doctor --performance

# Clear template cache
xaheen update --templates

# Check system resources
xaheen doctor --system
```

### Getting Help

1. **Check Documentation**: Visit our [documentation site](https://docs.xaheen.com)
2. **Run Diagnostics**: Use `xaheen doctor` to identify issues
3. **Community Support**: Join our [Discord community](https://discord.gg/xaheen)
4. **Report Issues**: Create an issue on [GitHub](https://github.com/xala-technologies/xaheen-cli/issues)

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export XAHEEN_DEBUG=true

# Or use debug flag
xaheen new my-app --debug
```

## 🚀 Advanced Usage

### Custom Templates

Create custom project templates:

```bash
# Create template directory
mkdir ~/.xaheen/templates/my-template

# Add template files
# Use Handlebars syntax for templating
```

### Plugins

Extend Xaheen with custom plugins:

```javascript
// xaheen-plugin-example.js
export default {
  name: 'example-plugin',
  commands: {
    'my-command': async (args) => {
      // Plugin implementation
    }
  }
};
```

### CI/CD Integration

#### GitHub Actions

```yaml
# .github/workflows/xaheen.yml
name: Xaheen CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Xaheen CLI
        run: npm install -g @xala-technologies/xaheen-cli
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run validation
        run: xaheen validate
      
      - name: Run tests
        run: xaheen test --coverage
      
      - name: Build project
        run: xaheen build --production
      
      - name: Deploy
        run: xaheen deploy --platform vercel
        if: github.ref == 'refs/heads/main'
```

### Performance Monitoring

Monitor CLI performance in production:

```bash
# Enable performance tracking
export XAHEEN_PERF_TRACKING=true

# Generate performance report
xaheen doctor --performance --report
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/xala-technologies/xaheen-cli.git
cd xaheen-cli

# Install dependencies
npm install

# Build project
npm run build

# Link for development
npm link

# Run tests
npm test
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **Testing**: Minimum 90% coverage
- **Linting**: ESLint + Prettier
- **Security**: Regular security audits
- **Documentation**: Comprehensive docs for all features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the Xala Technologies team
- Inspired by the amazing open-source community
- Special thanks to all contributors and users

---

**Happy coding with Xaheen! 🚀**

For more information, visit [xaheen.com](https://xaheen.com) or join our [community Discord](https://discord.gg/xaheen).