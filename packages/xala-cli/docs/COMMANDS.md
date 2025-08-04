# Xala CLI Commands Reference

Complete reference for all Xala CLI commands with examples and best practices.

## Quick Reference

| Command | Description | Example |
|---------|-------------|---------|
| `init` | Initialize new project | `xala init my-app --platform react` |
| `create` | Create components/pages | `xala create component UserCard` |
| `themes` | Theme management | `xala themes create healthcare` |
| `tokens` | Design token operations | `xala tokens generate --output ./tokens` |
| `components` | Component operations | `xala components scaffold Button` |
| `ai` | AI-powered generation | `xala ai generate "user dashboard"` |
| `build` | Multi-platform builds | `xala build react --optimize` |
| `dev` | Development server | `xala dev --port 3001` |
| `analyze` | Project analysis | `xala analyze --performance` |
| `deploy` | Deployment operations | `xala deploy vercel` |
| `sync` | Platform synchronization | `xala sync --platforms react,vue` |
| `preview` | Component preview | `xala preview Button` |
| `docs` | Interactive documentation | `xala docs accessibility` |

## Core Commands

### init - Project Initialization

Initialize a new project with the Xala design system.

```bash
xala init [project-name] [options]
```

**Arguments:**
- `project-name` - Name of the project (optional, defaults to current directory)

**Options:**
- `--platform <platform>` - Target platform (react|vue|angular|flutter)
- `--template <template>` - Project template (saas|healthcare|finance|ecommerce)
- `--industry <industry>` - Industry type for compliance rules
- `--theme <theme>` - Initial theme configuration
- `--typescript` - Enable TypeScript (default: true)
- `--accessibility <level>` - Accessibility level (AA|AAA, default: AAA)

**Examples:**

```bash
# Basic React project
xala init my-app --platform react

# Healthcare application with compliance
xala init medical-dashboard \
  --platform react \
  --template healthcare \
  --industry healthcare \
  --accessibility AAA

# Multi-platform SaaS application
xala init saas-platform \
  --platform react \
  --template saas \
  --theme enterprise-light
```

**Generated Structure:**
```
my-app/
├── src/
│   ├── components/          # Component library
│   ├── tokens/             # Design tokens
│   ├── themes/             # Theme configurations
│   └── locales/            # i18n translations
├── xala.config.js          # Configuration file
└── package.json
```

### create - Component Creation

Create new components, pages, layouts, or other project assets.

```bash
xala create <type> <name> [options]
```

**Types:**
- `component` - UI component
- `page` - Application page
- `layout` - Layout component
- `template` - Custom template
- `theme` - Theme variant

**Options:**
- `--platform <platform>` - Target platform
- `--template <template>` - Base template to use
- `--props <props>` - Component props (format: name:type,...)
- `--directory <path>` - Output directory
- `--story` - Generate Storybook story
- `--test` - Generate test file

**Examples:**

```bash
# Create a basic component
xala create component UserCard

# Create component with props
xala create component ProductCard \
  --props "title:string,price:number,image:string" \
  --story --test

# Create a page with layout
xala create page Dashboard \
  --template dashboard \
  --directory ./src/pages

# Create responsive layout
xala create layout MainLayout \
  --props "sidebar:boolean,header:boolean"
```

## Design System Commands

### themes - Theme Management

Comprehensive theme management with industry-specific presets.

```bash
xala themes <subcommand> [options]
```

**Subcommands:**

#### create - Create New Theme
```bash
xala themes create <theme-name> [options]
```

**Options:**
- `--brand <name>` - Brand name for the theme
- `--colors <colors>` - Color overrides (primary=#0891b2,secondary=#0f766e)
- `--industry <industry>` - Industry type (saas|fintech|healthcare|ecommerce)
- `--accessibility <level>` - Accessibility level (AA|AAA)
- `--output <path>` - Output directory (default: ./src/themes)
- `--preview` - Preview theme before creating

**Examples:**
```bash
# Healthcare theme with custom colors
xala themes create medical-pro \
  --brand "MedCorp Healthcare" \
  --colors primary=#0891b2,secondary=#065f46 \
  --industry healthcare \
  --accessibility AAA

# Financial services theme
xala themes create fintech-secure \
  --brand "SecureBank" \
  --colors primary=#1e40af,accent=#dc2626 \
  --industry fintech
```

#### apply - Apply Existing Theme
```bash
xala themes apply <theme-name>
```

#### customize - Customize Theme
```bash
xala themes customize <theme-name> [options]
```

#### list - List Available Themes
```bash
xala themes list
```

#### preview - Preview Theme
```bash
xala themes preview <theme-name>
```

### tokens - Design Token Management

Manage design tokens across platforms with validation and synchronization.

```bash
xala tokens <subcommand> [options]
```

**Subcommands:**

#### generate - Generate Token Files
```bash
xala tokens generate [options]
```

**Options:**
- `--platform <platform>` - Target platform format
- `--output <path>` - Output directory
- `--format <format>` - Output format (json|css|scss|ts|swift|kotlin)
- `--theme <theme>` - Include theme-specific tokens

**Examples:**
```bash
# Generate tokens for React platform
xala tokens generate \
  --platform react \
  --format css \
  --output ./src/tokens

# Generate multi-platform tokens
xala tokens generate \
  --platform all \
  --format json,css,swift \
  --theme healthcare-light
```

#### validate - Validate Token Consistency
```bash
xala tokens validate [options]
```

#### sync - Synchronize Tokens
```bash
xala tokens sync --platforms <platforms>
```

### components - Component Management

Manage component library with scaffolding, updates, and validation.

```bash
xala components <subcommand> [options]
```

**Subcommands:**

#### scaffold - Generate Component Scaffold
```bash
xala components scaffold <component-name> [options]
```

**Options:**
- `--type <type>` - Component type (basic|composite|layout)
- `--props <props>` - Component properties
- `--variants <variants>` - Style variants
- `--accessibility` - Add accessibility features

**Examples:**
```bash
# Basic button component
xala components scaffold Button \
  --type basic \
  --props "variant:string,size:string,disabled:boolean" \
  --variants "primary,secondary,danger" \
  --accessibility

# Complex data table
xala components scaffold DataTable \
  --type composite \
  --props "data:Array,columns:Array,sortable:boolean"
```

#### update - Update Existing Components
```bash
xala components update [component-name]
```

#### validate - Validate Component Compliance
```bash
xala components validate [options]
```

## AI-Powered Commands

### ai - AI Code Generation

Leverage AI for intelligent code generation and suggestions.

```bash
xala ai <subcommand> [options]
```

**Subcommands:**

#### generate - Generate from Description
```bash
xala ai generate <description> [options]
```

**Options:**
- `--platform <platform>` - Target platform
- `--provider <provider>` - AI provider (openai|anthropic)
- `--complexity <level>` - Complexity level (basic|intermediate|advanced)
- `--output <path>` - Output directory
- `--interactive` - Interactive generation mode

**Examples:**
```bash
# Generate user management dashboard
xala ai generate "user management dashboard with data table, search, filters, and CRUD operations" \
  --platform react \
  --complexity advanced \
  --interactive

# Generate healthcare patient card
xala ai generate "patient information card with medical data, appointment history, and status indicators" \
  --platform react \
  --provider anthropic
```

#### suggest - Get AI Suggestions
```bash
xala ai suggest <context> [options]
```

#### validate - AI-Powered Validation
```bash
xala ai validate <file> [options]
```

#### explain - Explain Design Concepts
```bash
xala ai explain <concept>
```

## Build & Deployment Commands

### build - Multi-Platform Build

Build applications for multiple platforms with optimization.

```bash
xala build <platform> [options]
```

**Platforms:**
- `react` - React applications
- `vue` - Vue.js applications  
- `angular` - Angular applications
- `flutter` - Flutter mobile apps
- `ios` - Native iOS apps
- `android` - Native Android apps
- `all` - All configured platforms

**Options:**
- `--optimize` - Enable optimization
- `--analyze` - Generate bundle analysis
- `--env <environment>` - Target environment
- `--output <path>` - Output directory
- `--watch` - Watch mode for development

**Examples:**
```bash
# Build optimized React app
xala build react --optimize --analyze

# Build for all platforms
xala build all --env production --output ./dist

# Development build with watch
xala build react --watch --env development
```

### dev - Development Server

Start development server with hot-reload and live preview.

```bash
xala dev [options]
```

**Options:**
- `--port <port>` - Server port (default: 3000)
- `--host <host>` - Server host (default: localhost)
- `--platform <platform>` - Platform mode
- `--theme <theme>` - Active theme
- `--open` - Open browser automatically
- `--https` - Enable HTTPS
- `--proxy <proxy>` - Proxy configuration

**Examples:**
```bash
# Basic development server
xala dev --port 3001 --open

# HTTPS server with custom theme
xala dev --https --theme healthcare-dark --port 8443

# Development with proxy
xala dev --proxy "api:http://localhost:4000"
```

**Server Features:**
- Hot module replacement (HMR)
- Component live preview
- Theme switching
- Accessibility validation
- Performance monitoring

### analyze - Project Analysis

Comprehensive project analysis for performance, accessibility, and compliance.

```bash
xala analyze [options]
```

**Options:**
- `--performance` - Performance analysis
- `--accessibility` - Accessibility validation
- `--compliance` - Compliance checking
- `--bundle` - Bundle analysis
- `--security` - Security audit
- `--output <format>` - Output format (json|html|csv)

**Examples:**
```bash
# Complete analysis
xala analyze --performance --accessibility --compliance

# Bundle analysis with report
xala analyze --bundle --output html

# Security audit
xala analyze --security --output json
```

**Analysis Reports:**
- Performance metrics and recommendations
- Accessibility violations and fixes
- Compliance validation results
- Bundle size and optimization opportunities
- Security vulnerabilities and patches

## Additional Commands

### deploy - Deployment Operations

Deploy applications to various platforms and environments.

```bash
xala deploy <target> [options]
```

**Targets:**
- `vercel` - Vercel deployment
- `netlify` - Netlify deployment
- `aws` - AWS deployment
- `azure` - Azure deployment
- `gcp` - Google Cloud deployment

### sync - Platform Synchronization

Synchronize design system across multiple platforms.

```bash
xala sync [options]
```

**Options:**
- `--platforms <platforms>` - Target platforms
- `--tokens` - Sync design tokens
- `--components` - Sync components
- `--themes` - Sync themes

### preview - Component Preview

Launch interactive component preview and documentation.

```bash
xala preview [component] [options]
```

### docs - Interactive Documentation

Access interactive documentation and examples.

```bash
xala docs [topic] [options]
```

**Topics:**
- `accessibility` - Accessibility guidelines
- `tokens` - Design tokens reference
- `components` - Component documentation
- `themes` - Theme system guide
- `compliance` - Compliance requirements

## Configuration

All commands respect the `xala.config.js` configuration file:

```javascript
module.exports = {
  name: 'my-app',
  platform: 'react',
  industry: 'healthcare',
  theme: {
    default: 'healthcare-light',
    darkMode: true
  },
  ai: {
    provider: 'openai',
    model: 'gpt-4'
  },
  build: {
    outputDir: './dist',
    optimize: true
  },
  dev: {
    port: 3000,
    https: false
  }
};
```

## Global Options

Available for all commands:

- `--config <path>` - Configuration file path
- `--verbose` - Verbose logging
- `--quiet` - Minimal output
- `--no-banner` - Disable banner display
- `--help` - Show command help
- `--version` - Show version

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Configuration error
- `4` - Build failure
- `5` - Validation failure

## Environment Variables

- `XALA_API_KEY` - Xala API key for premium features
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude
- `XALA_LOG_LEVEL` - Logging level (debug|info|warn|error)
- `XALA_NO_TELEMETRY` - Disable telemetry collection