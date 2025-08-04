# Xala CLI Documentation

## 🛠️ Multi-Platform Scaffolding CLI

The Xala CLI is a powerful code generation and scaffolding tool that leverages the Universal Design System v5.0 to create professional applications across multiple platforms and frameworks.

## 🚀 Key Features

- **Multi-Platform Support**: React, Vue, Angular, Flutter, React Native, Svelte, and more
- **AI-Enhanced Generation**: Intelligent component and layout generation
- **Enterprise Patterns**: Pre-built enterprise-grade templates and patterns
- **Norwegian Compliance**: Built-in NSM, GDPR, and WCAG 2.2 AAA compliance
- **Theme System**: Advanced theming and white-label capabilities
- **SSR-First**: Server-side rendering optimized templates
- **TypeScript-First**: Strict TypeScript with enterprise standards

## 📋 Quick Reference

### Core Commands
- `xala init` - Initialize new project
- `xala create` - Generate components/pages
- `xala build` - Build for production
- `xala dev` - Development server
- `xala themes` - Theme management
- `xala ai` - AI-powered generation

### Template Categories
- **Components**: UI components with variants
- **Layouts**: Page layouts and shells
- **Patterns**: Common design patterns
- **Providers**: Context and state management
- **Tools**: Development and performance tools

## 📚 Documentation Structure

### [Installation & Setup](./installation.md)
Complete installation guide, system requirements, and initial configuration.

### [Commands Reference](./commands.md)
Detailed documentation for all CLI commands with examples and options.

### [Templates & Generators](./templates.md)
Available templates, customization options, and creating custom templates.

### [Platform Support](./platforms.md)
Platform-specific guides for React, Vue, Angular, Flutter, and more.

### [Configuration](./configuration.md)
Advanced configuration, environment setup, and customization options.

### [AI Integration](./ai-integration.md)
AI-powered code generation, pattern recognition, and optimization.

### [Enterprise Features](./enterprise.md)
Norwegian compliance, security features, and enterprise patterns.

## 🎯 Quick Start

### 1. Installation
```bash
npm install -g @xala-technologies/cli
# or
yarn global add @xala-technologies/cli
# or
pnpm add -g @xala-technologies/cli
```

### 2. Initialize Project
```bash
# Create new React project
xala init my-app --platform react --template enterprise

# Create Vue project with Norwegian compliance
xala init my-vue-app --platform vue --template saas --norwegian-compliance

# Create Flutter app
xala init my_flutter_app --platform flutter --template mobile
```

### 3. Generate Components
```bash
# Generate Button component
xala create component Button --variants primary,secondary,outline

# Generate complete dashboard layout
xala create layout Dashboard --responsive --components Card,DataTable,Button

# AI-powered form generation
xala ai create form ContactForm --fields name,email,message --validation
```

### 4. Development
```bash
# Start development server
xala dev

# Build for production
xala build --optimize --analyze

# Run tests
xala test --coverage
```

## 🏗️ Architecture Overview

```
Xala CLI Architecture
├── 🎯 Command Layer
│   ├── Command parsing and validation
│   ├── User interaction and prompts
│   └── Error handling and logging
├── 🔧 Generation Engine
│   ├── Template processing (Handlebars)
│   ├── AI-enhanced code generation
│   ├── Multi-platform adaptation
│   └── Quality validation
├── 📦 Template System
│   ├── Platform-specific templates
│   ├── Component generators
│   ├── Layout patterns
│   └── Enterprise patterns
└── 🌐 Integration Layer
    ├── MCP server integration
    ├── Design system connection
    ├── Theme system integration
    └── External tool compatibility
```

## 🎨 Supported Platforms

| Platform | Status | Templates | Features |
|----------|--------|-----------|----------|
| **React** | ✅ Full | 40+ templates | SSR, TypeScript, Hooks |
| **Next.js** | ✅ Full | 35+ templates | App Router, API Routes |
| **Vue 3** | ✅ Full | 30+ templates | Composition API, Vite |
| **Angular** | ✅ Full | 25+ templates | Standalone, Signals |
| **Flutter** | ✅ Full | 20+ templates | Material 3, Cupertino |
| **React Native** | ✅ Full | 18+ templates | Expo, Navigation |
| **Svelte** | ✅ Beta | 15+ templates | SvelteKit, Stores |
| **Electron** | 🚧 Beta | 10+ templates | Main/Renderer processes |

## 📊 Template Categories

### Component Templates
- **Basic Components**: Button, Input, Card, etc.
- **Complex Components**: DataTable, Form, Modal, etc. 
- **Layout Components**: Container, Stack, Grid, etc.
- **Navigation**: Navbar, Sidebar, Breadcrumb, etc.

### Page Templates
- **Dashboard**: Admin dashboard with KPIs and charts
- **Landing Page**: Marketing pages with hero sections
- **Auth Pages**: Login, register, forgot password
- **E-commerce**: Product listing, cart, checkout
- **Profile**: User profile and settings pages

### Pattern Templates
- **HOC Collection**: Higher-order component patterns
- **Render Props**: Flexible component composition
- **Provider Patterns**: Context and state management
- **Error Boundaries**: Error handling patterns

### Enterprise Templates
- **Compliance**: Norwegian NSM and GDPR patterns
- **Accessibility**: WCAG 2.2 AAA compliant templates
- **Performance**: Optimized for large applications
- **Security**: Secure coding patterns and validation

## 🌍 Norwegian Compliance

### NSM Classification Support
```bash
# Generate classified component
xala create component SecureDataTable \
  --nsm-classification KONFIDENSIELT \
  --audit-trail \
  --data-retention 7-years
```

### GDPR Compliance
```bash
# Generate GDPR-compliant form
xala create form UserRegistration \
  --gdpr-compliant \
  --consent-management \
  --data-subject-rights
```

### WCAG 2.2 AAA Accessibility
```bash
# Generate accessible navigation
xala create navigation MainNav \
  --wcag-level AAA \
  --screen-reader-support \
  --keyboard-navigation
```

## 🤖 AI Integration

### AI-Powered Generation
```bash
# Generate dashboard from description
xala ai create "Create an analytics dashboard with user metrics, charts, and filters"

# Generate form from requirements
xala ai form "Contact form with name, email, subject, message, and file upload"

# Generate layout from wireframe
xala ai layout --from-image wireframe.png --platform react
```

### Pattern Recognition
```bash
# Analyze existing code patterns
xala ai analyze --directory ./src/components

# Suggest improvements
xala ai optimize --component Button.tsx

# Generate tests from component
xala ai test --component Dashboard.tsx --coverage 95
```

## 📈 Performance & Quality

### Built-in Quality Assurance
- **TypeScript**: Strict mode with explicit return types
- **ESLint**: Zero-tolerance for warnings (max 0 warnings)
- **Accessibility**: WCAG 2.2 AAA validation
- **Performance**: Bundle size optimization
- **Security**: OWASP compliance patterns

### Quality Metrics
- **Code Quality**: 95+ quality score
- **Test Coverage**: 95%+ required
- **Bundle Size**: Optimized for performance
- **Accessibility**: WCAG 2.2 AAA compliant
- **Security**: OWASP Top 10 protection

## 🔗 Integration Ecosystem

### MCP Server Integration
The CLI seamlessly integrates with the MCP server for enhanced AI capabilities:

```bash
# Use MCP server for intelligent generation
xala ai create --use-mcp-server --pattern dashboard

# Validate with MCP quality checks
xala validate --mcp-server --accessibility --performance
```

### External Tool Compatibility
- **Figma**: Import designs and generate components
- **Storybook**: Auto-generate stories for components
- **Jest**: Generate comprehensive test suites
- **Playwright**: End-to-end test generation
- **Docker**: Containerization templates

## 🚨 Troubleshooting

### Common Issues
- **Command not found**: Verify global installation
- **Template errors**: Check platform compatibility
- **Build failures**: Validate TypeScript configuration
- **Performance issues**: Enable production optimizations

### Debug Mode
```bash
# Enable debug logging
DEBUG=xala:* xala create component Button

# Verbose output
xala create component Button --verbose

# Dry run (preview without creating)
xala create component Button --dry-run
```

## 📚 Next Steps

1. **[Installation Guide](./installation.md)** - Get started with installation
2. **[Commands Reference](./commands.md)** - Master all CLI commands
3. **[Template System](./templates.md)** - Understand and customize templates
4. **[Platform Guides](./platforms.md)** - Platform-specific documentation

## 🤝 Support & Community

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/xala-technologies/ui-system/issues)
- **Discussions**: [Community Q&A](https://github.com/xala-technologies/ui-system/discussions)
- **Discord**: [Real-time support](https://discord.gg/xala-ui)

---

*Xala CLI Documentation v2.0 - Multi-platform scaffolding excellence*