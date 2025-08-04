# Xala CLI - The Most Intelligent Component Generation System

The revolutionary AI-powered CLI for enterprise-grade, multi-platform component generation. Works seamlessly with LLMs of all sizes (7B to GPT-4) and generates production-ready code with built-in compliance, performance optimization, and intelligent suggestions.

[![npm version](https://badge.fury.io/js/@xala-technologies/xala-cli.svg)](https://badge.fury.io/js/@xala-technologies/xala-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![LLM Compatible](https://img.shields.io/badge/LLM-7B%20to%20GPT4-blue)](https://xala.no)
[![WCAG AAA](https://img.shields.io/badge/WCAG-AAA%20Compliant-green)](https://www.w3.org/WAI/WCAG2AAA-Conformance)

> **Production Ready** - v5.0 Architecture with Pure CVA Components, Multi-Platform Support, and AI-Powered Generation

## Installation

### Global Installation (Recommended)

```bash
bun add -g @xala-technologies/xala-cli
```

### Alternative Installation Methods

```bash
# Using npm
npm install -g @xala-technologies/xala-cli

# Using npx (no global installation)
npx @xala-technologies/xala-cli init my-project

# Using Yarn
yarn global add @xala-technologies/xala-cli

# Using pnpm
pnpm add -g @xala-technologies/xala-cli
```

### System Requirements

- **Node.js**: ≥18.0.0
- **bun**: ≥1.0.0 (recommended)
- **npm**: ≥8.0.0 (alternative)
- **Operating System**: macOS, Linux, Windows
- **Memory**: ≥4GB RAM (recommended for AI features)

## Quick Start

### 1. Initialize Project

```bash
# Basic React project
xala init my-app --platform react --template saas

# Healthcare application with compliance
xala init medical-dashboard \
  --platform react \
  --template healthcare \
  --industry healthcare \
  --accessibility AAA

# Multi-platform enterprise application
xala init enterprise-app \
  --platform react \
  --template enterprise \
  --compliance nsm
```

### 2. AI-Powered Generation

```bash
# Generate complete feature from description
xala ai generate "user management dashboard with data table, search, filters, and CRUD operations" \
  --platform react \
  --complexity advanced

# Generate healthcare-specific component
xala ai generate "patient appointment card with medical data and status indicators" \
  --industry healthcare \
  --compliance healthcare

# Interactive AI generation
xala ai generate "responsive dashboard" --interactive
```

### 3. Theme Management

```bash
# Create industry-specific theme
xala themes create medical-pro \
  --brand "Healthcare Solutions Inc." \
  --colors primary=#0891b2,secondary=#065f46 \
  --industry healthcare \
  --accessibility AAA

# Apply existing theme
xala themes apply medical-pro

# Preview theme before creation
xala themes create fintech-secure --preview
```

### 4. Development Workflow

```bash
# Start development server with hot-reload
xala dev --port 3001 --https --open

# Build for production with optimization
xala build react --optimize --analyze

# Comprehensive project analysis
xala analyze --performance --accessibility --compliance --output ./reports
```

## Commands

### Project Management
- `xala init [name]` - Initialize design system in new project
- `xala create [type] [name]` - Create components, pages, layouts

### Design System Management
- `xala tokens generate|validate|sync` - Manage design tokens
- `xala themes create|apply|customize` - Theme management
- `xala components scaffold|update|validate` - Component management

### AI-Powered Generation
- `xala ai generate [description]` - Generate from natural language
- `xala ai suggest [context]` - Get AI suggestions
- `xala ai validate [file]` - Validate code compliance
- `xala ai explain [concept]` - Explain design concepts

### Multi-Platform Build
- `xala build [platform]` - Build for target platform
- `xala deploy [target]` - Deploy to environment
- `xala sync [platform]` - Sync between platforms

### Developer Tools
- `xala dev` - Development server with hot-reload
- `xala preview [component]` - Component preview
- `xala analyze` - Performance and compliance analysis

### Documentation & Help
- `xala docs [topic]` - Interactive documentation
- `xala examples [pattern]` - Code examples
- `xala help [command]` - Detailed help

## Features

### 🎨 **Universal Design System**
- Multi-platform support (React, Vue, Angular, Flutter, iOS, Android)
- Consistent design tokens across all platforms
- Industry-specific themes and templates
- Norwegian design standards compliance

### 🤖 **AI-Powered Development**
- Generate components from natural language descriptions
- Intelligent code suggestions and patterns
- Automated compliance validation
- Context-aware recommendations

### 🏢 **Enterprise Ready**
- WCAG 2.2 AAA accessibility compliance
- Norwegian government standards (NSM)
- GDPR compliance and data protection
- Multi-language support (EN, NO, FR, AR)

### 🛠️ **Developer Experience**
- Interactive project scaffolding
- Real-time development server
- Hot-reload and live preview
- Comprehensive analysis tools

### 📊 **Quality Assurance**
- Performance monitoring and optimization
- Accessibility testing and validation
- Code quality and compliance checks
- Bundle analysis and optimization

## Supported Platforms

### Web Platforms
- **React** - Next.js, Create React App, Vite
- **Vue** - Nuxt.js, Vue CLI, Vite
- **Angular** - Angular CLI, Standalone

### Mobile Platforms
- **Flutter** - Cross-platform mobile
- **React Native** - iOS and Android
- **iOS** - Native Swift/SwiftUI
- **Android** - Native Kotlin/Compose

### Desktop Platforms
- **Electron** - Cross-platform desktop
- **Tauri** - Rust-based desktop
- **PWA** - Progressive Web Apps

## Templates

### Industry-Specific Templates
- **Healthcare** - Medical applications with specialized compliance
- **Finance** - Banking and financial services
- **Education** - Learning management systems
- **E-commerce** - Online retail and marketplaces
- **Government** - Public sector applications
- **Enterprise** - Business and productivity tools

### Application Types
- **SaaS Dashboard** - Multi-tenant business applications
- **Mobile App** - Native mobile experiences
- **Website** - Marketing and content sites
- **Admin Panel** - Management interfaces
- **E-learning** - Educational platforms
- **Portfolio** - Personal and professional portfolios

## Configuration

Create a `xala.config.js` file in your project root:

```javascript
module.exports = {
  name: 'my-app',
  platform: 'react',
  industry: 'healthcare',
  theme: {
    default: 'healthcare-light',
    darkMode: true
  },
  i18n: {
    defaultLocale: 'en-US',
    locales: ['en-US', 'nb-NO', 'fr-FR', 'ar-SA']
  },
  accessibility: {
    level: 'AAA',
    enforceContrastRatios: true
  },
  enterprise: {
    nsmCompliance: true,
    auditTrail: true
  }
};
```

## Norwegian Compliance & Enterprise Standards

All generated code follows mandatory compliance rules for Norwegian standards (NSM, GDPR, WCAG AAA):

### ❌ Forbidden Patterns
```typescript
// ❌ Raw HTML elements
<div className="user-card">
<button onClick={handleClick}>

// ❌ Hardcoded styling
style={{ padding: '16px', color: '#ff0000' }}

// ❌ Hardcoded text
<span>Welcome User</span>

// ❌ TypeScript 'any' types
const userData: any = props;

// ❌ Non-semantic elements
<div role="button" onClick={handleClick}>
```

### ✅ Required Patterns
```typescript
// ✅ Semantic components from design system
<Container>
  <Text>{t('user.welcome')}</Text>
  <Button onClick={handleClick} aria-label={t('actions.submit')}>
    {t('buttons.submit')}
  </Button>
</Container>

// ✅ Design tokens for all styling
const tokens = useTokens();
<Container 
  style={{
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.primary
  }}
>

// ✅ Proper TypeScript interfaces
interface UserCardProps {
  readonly name: string;
  readonly email: string;
  readonly onEdit?: () => void;
}

export const UserCard = ({ name, email, onEdit }: UserCardProps): JSX.Element => {
  const { t } = useLocalization();
  // Component implementation
};
```

### Code Quality Standards
- **Maximum file size**: 200 lines
- **Maximum function size**: 20 lines
- **Test coverage**: ≥95% (branches, functions, lines, statements)
- **Accessibility**: WCAG 2.2 AAA compliance
- **Grid system**: 8pt grid (8px increments)
- **Memory usage**: <50MB per module
- **Initialization time**: <100ms per module

## API Integration

### OpenAI Integration
```bash
export OPENAI_API_KEY="your-api-key"
xala ai generate "responsive dashboard with charts"
```

### Anthropic Integration
```bash
export ANTHROPIC_API_KEY="your-api-key"
xala ai generate --provider anthropic "user profile form"
```

## Examples

### Generate a Complete Feature
```bash
xala ai generate "user management system with CRUD operations, data table, search, and filters"
```

### Create Industry Theme
```bash
xala themes create finance \
  --brand "Bank Corp" \
  --colors primary=#003d7a,secondary=#005eb8 \
  --industry finance \
  --accessibility AAA
```

### Multi-Platform Build
```bash
# Build for all platforms
xala build all --optimize

# Platform-specific builds
xala build react --analyze
xala build flutter --env production
xala build ios --output ./dist/ios
```

### Development Workflow
```bash
# Start development server
xala dev --port 3001 --theme healthcare-dark

# Generate component while developing
xala ai generate "patient appointment card with status indicators"

# Analyze project health
xala analyze --performance --accessibility --compliance
```

## Documentation

Comprehensive documentation is available in the `/docs` directory:

### Core Documentation
- **[COMMANDS.md](./docs/COMMANDS.md)** - Complete command reference with examples
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture and design patterns
- **[API.md](./docs/API.md)** - API reference for services and utilities
- **[TEMPLATES.md](./docs/TEMPLATES.md)** - Template system and platform-specific generation
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Quick Access
```bash
# Interactive documentation
xala docs --interactive

# Command-specific help
xala init --help
xala ai generate --help
xala themes create --help

# Show examples
xala examples component
xala examples theme
xala examples ai-generation
```

### Key Features Documentation

#### AI-Powered Development
- Natural language component generation
- Context-aware code suggestions
- Compliance validation
- Multi-provider support (OpenAI, Anthropic)

#### Multi-Platform Support
- **Web**: React, Vue, Angular
- **Mobile**: Flutter, React Native, iOS, Android
- **Desktop**: Electron, Tauri, PWA
- Consistent design tokens across all platforms

#### Enterprise Compliance
- **Norwegian Standards**: NSM classification, GDPR compliance
- **Accessibility**: WCAG 2.2 AAA validation
- **Security**: Object injection prevention, audit trails
- **Quality**: 95%+ test coverage, type safety

#### Theme System
- Industry-specific presets (Healthcare, Finance, Government)
- Accessibility-first design
- Multi-language support (EN, NO, FR, AR)
- Dark mode and high contrast variants

## Diagnostic Commands

```bash
# Check system compatibility
xala doctor

# Validate project configuration
xala config validate

# Run comprehensive analysis
xala analyze --all --output ./reports

# Debug mode for troubleshooting
DEBUG=true xala [command]
```

## Environment Configuration

### Required Environment Variables

```bash
# AI Integration (choose one)
export OPENAI_API_KEY="your-openai-key"        # For OpenAI GPT models
export ANTHROPIC_API_KEY="your-anthropic-key"  # For Claude models

# Optional Configuration
export XALA_LOG_LEVEL="debug"                  # Logging level
export XALA_NO_TELEMETRY="true"               # Disable telemetry
export NODE_OPTIONS="--max-old-space-size=4096" # Increase memory for large projects
```

### Shell Configuration

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
# Xala CLI configuration
export OPENAI_API_KEY="your-api-key-here"
export XALA_LOG_LEVEL="info"

# Optional: Add completion support
eval "$(xala completion bash)"  # For Bash
eval "$(xala completion zsh)"   # For Zsh
```

## Performance Optimization

### Build Performance
```bash
# Enable build caching
xala build --cache

# Use incremental builds
xala build --incremental --watch

# Parallel platform builds
xala build all --parallel --max-workers 4
```

### Development Performance
```bash
# Start with performance monitoring
xala dev --performance-monitor

# Enable memory profiling
xala dev --memory-profile

# Optimize for large projects
xala dev --fast-refresh --lazy-compilation
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/xala-technologies/xala-cli.git
cd xala-cli

# Install dependencies
bun install

# Build the CLI
bun run build

# Link for local development
bun link

# Run tests
bun test

# Validate code quality
bun run validate
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

### Community Resources
- **📖 Documentation**: [https://xala.dev/docs](https://xala.dev/docs)
- **💬 Discord Community**: [https://discord.gg/xala](https://discord.gg/xala)
- **🐛 Issue Tracker**: [GitHub Issues](https://github.com/xala-technologies/xala-cli/issues)
- **📧 Email Support**: [support@xala.dev](mailto:support@xala.dev)

### Professional Support
- **🏢 Enterprise Support**: Custom training, priority support, SLA guarantees
- **🎓 Training Programs**: Team workshops, certification programs
- **📞 Consulting**: Architecture review, implementation guidance

### Getting Help
```bash
# Built-in help system
xala --help
xala [command] --help

# System diagnostics
xala doctor --verbose

# Community examples
xala examples --category healthcare
xala examples --platform react
```

---

**Built with ❤️ by the Xala Technologies team for the global development community.**

*Empowering developers to create accessible, compliant, and beautiful applications across all platforms.*