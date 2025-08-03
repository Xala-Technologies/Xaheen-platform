# Xaheen CLI v2 Technical Documentation

Complete technical documentation for Xaheen CLI v2 - Enterprise-grade development platform with service-based architecture.

## Overview

**Version:** 2.0.2  
**Package:** `@xala-technologies/xaheen-cli`  
**Release Date:** January 2025  
**Architecture:** Service-based with SOLID principles  
**Bundle Size:** 328KB (35% reduction from v1)  
**Test Coverage:** 100+ test cases ensuring reliability

## Quick Start

```bash
# Install globally
npm install -g @xala-technologies/xaheen-cli --registry=https://npm.pkg.github.com

# Create project with preset bundle
npx --registry=https://npm.pkg.github.com @xala-technologies/xaheen-cli create my-app --preset saas-starter

# Interactive project creation
npx --registry=https://npm.pkg.github.com @xala-technologies/xaheen-cli create my-app
```

## Key Features

### Service-Based Architecture
- **Template Factory Pattern** for dynamic code generation
- **Service Registry** with SOLID principles implementation
- **Bundle Resolver** with intelligent dependency management
- **Service Injector** with parallel processing capabilities
- **Project Analyzer** for intelligent configuration detection

### 13 Intelligent Service Bundles
1. **SaaS Starter** - Essential SaaS features for MVPs
2. **SaaS Professional** - Full-featured platform for growing businesses
3. **SaaS Complete** - Enterprise-grade with AI and multi-tenancy
4. **Marketing Site** - Landing pages with CMS integration
5. **Portfolio Site** - Creative portfolios with animations
6. **Dashboard App** - Admin dashboards with analytics
7. **Full-Stack App** - Complete web applications
8. **Mobile App** - React Native applications with backend
9. **REST API** - Backend APIs with documentation
10. **Enterprise App** - Microsoft stack applications
11. **Norwegian Government** - BankID, Vipps, Altinn compliance
12. **Municipality Portal** - Citizen services with localization
13. **Healthcare Management** - GDPR compliant medical systems

### Norwegian Market Focus
- **BankID Integration** - National digital identity verification
- **Vipps Payments** - Mobile payment platform integration
- **Altinn Services** - Government services API integration
- **Norwegian Localization** - Complete nb-NO support with formatting
- **GDPR Compliance** - Privacy templates and data handling
- **Security Standards** - NSM (National Security Authority) guidelines

### Enterprise Capabilities
- **Multi-framework Support** - React, Vue, Svelte, Angular, Blazor
- **Auto-fix Validation** - Health diagnostics with automatic problem resolution
- **Dependency Management** - Intelligent conflict resolution
- **Template Migration** - Upgrade existing projects to new architectures
- **Performance Optimization** - 60% faster scaffolding with parallel processing

## Documentation Structure

### Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Service-based architecture details
- **[COMMANDS.md](./COMMANDS.md)** - Complete command reference
- **[BUNDLES.md](./BUNDLES.md)** - All 13 service bundles with examples
- **[SERVICES.md](./SERVICES.md)** - Available services and providers
- **[MIGRATION.md](./MIGRATION.md)** - Detailed v1 to v2 migration guide

### Specialized Documentation
- **[NORWEGIAN-COMPLIANCE.md](./NORWEGIAN-COMPLIANCE.md)** - BankID, Vipps, Altinn features
- **[TESTING.md](./TESTING.md)** - Test suite and quality assurance
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to add new services/bundles
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## System Requirements

### Development Environment
- **Node.js** 18.0.0 or higher
- **Package Manager** npm, pnpm, bun, or yarn
- **Git** for version control
- **TypeScript** 5.0+ for type safety

### Optional Dependencies
- **Docker** for database services and containerization
- **Azure CLI** for Norwegian government deployments
- **GitHub CLI** for repository management

## Architecture Overview

### Core Components

```
Xaheen CLI v2 Architecture
├── Service Registry
│   ├── Template Factory
│   ├── Template Repository
│   └── Service Validation
├── Bundle Resolver
│   ├── Dependency Management
│   ├── Compatibility Checking
│   └── Bundle Configuration
├── Service Injector
│   ├── Parallel Processing
│   ├── File Generation
│   └── Dependency Installation
├── Project Analyzer
│   ├── Configuration Detection
│   ├── Health Checking
│   └── Migration Planning
└── Validation Engine
    ├── Auto-fix Capabilities
    ├── Compliance Checking
    └── Performance Optimization
```

### SOLID Principles Implementation

**Single Responsibility Principle**
- Each service handles one specific concern (auth, database, payments)
- Clear separation between registry, resolver, and injector

**Open/Closed Principle**
- Easy to add new services without modifying existing code
- Template-based extension system for custom providers

**Liskov Substitution Principle**
- Service providers are completely interchangeable
- Consistent interfaces across all service types

**Interface Segregation Principle**
- Clean, focused interfaces for each service category
- No unnecessary dependencies between services

**Dependency Inversion Principle**
- Depends on abstractions, not concrete implementations
- Dependency injection throughout the entire system

## Command Categories

### Project Management
- `create` / `new` - Create new projects with intelligent bundling
- `validate` - Project health checks with auto-fix capabilities
- `upgrade` - Upgrade dependencies and services to latest versions
- `doctor` - System and project diagnostics for troubleshooting

### Service Management
- `add` - Add services to existing projects with dependency resolution
- `remove` - Remove services with dependency checking and cleanup
- `bundle` - Bundle management operations and custom bundle creation

### Service Types

| Category | Services | Providers |
|----------|----------|-----------|
| **Authentication** | auth | clerk, auth0, better-auth, bankid, identity-server |
| **Database** | database | postgresql, mysql, mongodb, sqlite, sqlserver, redis |
| **Payments** | payments | stripe, vipps, paypal, paddle, square |
| **Email** | email | resend, sendgrid, mailgun, postmark, nodemailer |
| **Storage** | storage | uploadthing, aws-s3, cloudinary, dropbox |
| **Analytics** | analytics | posthog, mixpanel, amplitude, google, vercel |
| **Monitoring** | monitoring | sentry, datadog, newrelic, grafana, prometheus |
| **Search** | search | algolia, elasticsearch, meilisearch, typesense |
| **AI** | ai | openai, anthropic, cohere, huggingface |
| **CMS** | cms | contentful, strapi, sanity, payload, ghost |

## Performance Benchmarks

### Bundle Size Comparison
- **CLI v1:** 512KB
- **CLI v2:** 328KB (35% reduction)

### Generation Speed Improvements
- **Simple projects:** 60% faster generation
- **Complex bundles:** 40% faster with parallel processing
- **Service injection:** 60% faster with optimized templates
- **Dependency resolution:** 50% faster with intelligent caching

### Memory Usage Optimization
- **Peak memory usage:** 45% reduction during generation
- **Startup time:** 50% faster CLI initialization
- **Template loading:** 70% faster with lazy evaluation
- **Concurrent operations:** 3x more efficient with streaming

## Quality Assurance

### Test Coverage
- **Unit Tests:** 85+ tests covering core functionality
- **Integration Tests:** 20+ tests for service combinations
- **E2E Tests:** 15+ tests for complete project generation
- **Performance Tests:** 10+ tests for large-scale projects

### Validation Systems
- **Template Validation:** All service templates validated before use
- **Dependency Resolution:** Comprehensive conflict detection and resolution
- **Norwegian Compliance:** Automated compliance checking for government projects
- **Cross-Platform Testing:** Windows, macOS, and Linux compatibility

### Security Features
- **Input Sanitization:** All user inputs validated and sanitized
- **Template Security:** Templates scanned for security vulnerabilities
- **Dependency Scanning:** Automatic security vulnerability detection
- **Environment Protection:** Sensitive data handled securely

## Norwegian Compliance Features

### Government Integration
- **BankID Authentication** - National digital identity with test/production modes
- **Vipps Payment Processing** - FSA regulated mobile payment integration
- **Altinn Government Services** - Complete API integration for public sector
- **Data Residency** - Norway-based hosting and data processing options

### Compliance Standards
- **GDPR Compliance** - Complete privacy templates and data handling procedures
- **Norwegian Privacy Law** - Specific privacy requirements for Norway
- **WCAG 2.2 AA** - Accessibility compliance for government applications
- **NSM Security Guidelines** - National Security Authority compliance

### Localization Support
- **Norwegian Language (nb-NO)** - Complete translation and localization
- **Currency Formatting** - NOK (Norwegian Krone) formatting and calculations
- **Date/Time Formatting** - Norwegian date and time format standards
- **Address Formatting** - Norwegian postal address format compliance

## Environment Configuration

### Registry Setup
```bash
# Configure GitHub Packages registry
echo "@xala-technologies:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Or set per-session
export NPM_CONFIG_@xala-technologies:registry=https://npm.pkg.github.com
```

### Environment Variables
```bash
# CLI Configuration
XAHEEN_REGISTRY=https://npm.pkg.github.com
XAHEEN_DEBUG=false
XAHEEN_NO_ANALYTICS=false
XAHEEN_CONFIG_PATH=~/.xaheen
XAHEEN_CACHE_DIR=~/.xaheen/cache

# Norwegian Configuration
XAHEEN_BANKID_MODE=test
XAHEEN_VIPPS_MODE=test
XAHEEN_LOCALE=nb-NO
XAHEEN_COMPLIANCE_LEVEL=government
```

### Configuration File (~/.xaheen/config.json)
```json
{
  "registry": "https://npm.pkg.github.com",
  "defaultPreset": "saas-starter",
  "autoInstall": true,
  "initGit": true,
  "analytics": false,
  "templates": {
    "cacheTimeout": 3600,
    "autoUpdate": true
  },
  "norwegian": {
    "bankidMode": "test",
    "vippsMode": "test",
    "locale": "nb-NO",
    "complianceLevel": "government"
  },
  "enterprise": {
    "orgId": "your-organization",
    "customTemplates": true,
    "privateRegistry": "your-registry.com"
  }
}
```

## Development Workflow

### Creating Projects
```bash
# Quick start with preset
xaheen create my-app --preset saas-starter

# Custom configuration
xaheen create my-app --framework next --backend hono --database postgresql

# Norwegian government app
xaheen create my-gov-app --preset norwegian-gov

# Enterprise application
xaheen create my-enterprise --preset enterprise-app
```

### Managing Services
```bash
# Add authentication
xaheen add auth --provider clerk

# Add Norwegian BankID
xaheen add auth --provider bankid

# Add payments with Vipps
xaheen add payments --provider vipps

# Remove service with cleanup
xaheen remove analytics --provider google --clean
```

### Project Maintenance
```bash
# Validate project health
xaheen validate --fix

# Upgrade all services
xaheen upgrade --all --interactive

# System diagnostics
xaheen doctor --verbose --report
```

## Contributing

### Adding New Services
1. **Create service template** in appropriate category
2. **Implement service provider** with required interfaces
3. **Add configuration schema** and validation rules
4. **Create test cases** for all functionality
5. **Update documentation** with examples and usage

### Adding New Bundles
1. **Define bundle configuration** with service combinations
2. **Test compatibility** across all included services
3. **Create usage examples** and documentation
4. **Add integration tests** for bundle generation
5. **Update bundle registry** with new bundle

### Quality Standards
- **TypeScript strict mode** required for all code
- **100% test coverage** for new functionality
- **Documentation** required for all public APIs  
- **Performance testing** for generation speed
- **Security review** for all templates

## Support and Community

### Documentation Resources
- **Web Documentation:** [xaheen.dev/docs](https://xaheen.dev/docs)
- **API Reference:** Complete TypeScript definitions and examples
- **Video Tutorials:** Step-by-step guide for common workflows
- **Best Practices:** Enterprise development patterns and guidelines

### Community Resources
- **GitHub Repository:** [github.com/Xala-Technologies/xaheen](https://github.com/Xala-Technologies/xaheen)
- **Issue Tracker:** Bug reports and feature requests
- **Discussions:** Community questions and knowledge sharing
- **Release Notes:** Detailed changelog and migration guides

### Professional Support
- **Enterprise Consulting:** Custom bundle development and architecture consulting
- **Migration Services:** Professional assistance for complex v1 to v2 migrations
- **Training Programs:** Team onboarding and best practices workshops
- **Priority Support:** Dedicated support channels for enterprise customers

## Roadmap

### Upcoming Features
- **AI-Powered Recommendations** - Intelligent service suggestions based on project context
- **Visual Bundle Builder** - GUI for creating and managing custom bundles
- **Advanced Norwegian Features** - Enhanced compliance and government integrations
- **Enterprise SSO Integration** - SAML, OIDC, and Active Directory support
- **Custom Template Marketplace** - Community-driven template sharing platform

### Long-term Vision
- **Multi-language Support** - Support for additional programming languages
- **Cloud-native Deployment** - Advanced Kubernetes and serverless deployments
- **Real-time Collaboration** - Team-based project development and sharing
- **Advanced Analytics** - Project performance and usage analytics
- **Plugin Ecosystem** - Third-party extensions and integrations

---

**Last Updated:** January 2025  
**Version:** 2.0.2  
**Maintainer:** Xala Technologies  
**License:** MIT