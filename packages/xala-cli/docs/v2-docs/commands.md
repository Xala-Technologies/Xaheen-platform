# Xala CLI - Commands Reference

## 📋 Complete Command Reference

The Xala CLI provides comprehensive tools for multi-platform development with the Universal Design System v5.0. All commands support Norwegian compliance, accessibility standards, and enterprise patterns.

## 🚀 Quick Reference

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

## 🏗️ Core Commands

### init - Project Initialization

Initialize a new project with the Xala Universal Design System.

```bash
xala init [project-name] [options]
```

**Arguments:**
- `project-name` - Name of the project (optional, defaults to current directory)

**Options:**
- `--platform <platform>` - Target platform (react|vue|angular|flutter|react-native|svelte)
- `--template <template>` - Project template (saas|healthcare|finance|ecommerce|government)
- `--industry <industry>` - Industry type for compliance rules
- `--theme <theme>` - Initial theme configuration
- `--typescript` - Enable TypeScript (default: true)
- `--accessibility <level>` - Accessibility level (WCAG_2_1_AA|WCAG_2_2_AAA, default: WCAG_2_2_AAA)
- `--norwegian-compliance` - Enable Norwegian compliance (NSM, GDPR)
- `--ai-integration` - Enable AI-powered development features

**Examples:**

```bash
# Basic React project with Norwegian compliance
xala init my-app \
  --platform react \
  --norwegian-compliance \
  --accessibility WCAG_2_2_AAA

# Healthcare application with full compliance
xala init medical-dashboard \
  --platform react \
  --template healthcare \
  --industry healthcare \
  --norwegian-compliance \
  --accessibility WCAG_2_2_AAA

# Multi-platform SaaS application
xala init saas-platform \
  --platform react \
  --template saas \
  --theme enterprise-light \
  --ai-integration

# Flutter mobile app with Material 3
xala init my_mobile_app \
  --platform flutter \
  --template mobile \
  --theme material3-light
```

**Generated Structure:**
```
my-app/
├── src/
│   ├── components/          # Component library
│   │   ├── ui/             # UI primitives
│   │   ├── layout/         # Layout components
│   │   └── navigation/     # Navigation components
│   ├── tokens/             # Design tokens
│   │   ├── semantic/       # Semantic tokens
│   │   └── themes/         # Theme definitions
│   ├── locales/            # i18n translations
│   │   ├── nb-NO.json      # Norwegian Bokmål
│   │   ├── en-US.json      # English
│   │   └── fr-FR.json      # French
│   ├── providers/          # React contexts
│   └── utils/              # Utility functions
├── xala.config.js          # Configuration file
├── package.json
└── README.md
```

### create - Component Creation

Create new components, pages, layouts, or other project assets with AI assistance.

```bash
xala create <type> <name> [options]
```

**Types:**
- `component` - UI component with variants
- `page` - Application page with layout
- `layout` - Layout component
- `template` - Custom template
- `theme` - Theme variant
- `provider` - React context provider
- `hook` - Custom React hook

**Options:**
- `--platform <platform>` - Target platform
- `--template <template>` - Base template to use
- `--props <props>` - Component props (format: name:type,name:type,...)
- `--variants <variants>` - Style variants (format: variant1,variant2,...)
- `--directory <path>` - Output directory
- `--story` - Generate Storybook story
- `--test` - Generate test file
- `--accessibility` - Include accessibility features
- `--norwegian-compliance` - Include Norwegian compliance features
- `--interactive` - Interactive creation mode

**Examples:**

```bash
# Create a basic component
xala create component Button \
  --props "variant:string,size:string,disabled:boolean" \
  --variants "primary,secondary,outline,ghost,destructive" \
  --story --test --accessibility

# Create component with Norwegian compliance
xala create component PatientCard \
  --props "patient:Patient,classification:NSMLevel" \
  --variants "standard,emergency,confidential" \
  --norwegian-compliance \
  --accessibility

# Create a complex data component
xala create component DataTable \
  --props "data:Array,columns:Array,sortable:boolean,filterable:boolean" \
  --variants "default,compact,striped" \
  --story --test

# Create a dashboard page
xala create page Dashboard \
  --template dashboard \
  --props "user:User,metrics:Metrics[]" \
  --directory ./src/pages

# Create responsive layout
xala create layout AdminLayout \
  --props "sidebar:boolean,header:boolean,footer:boolean" \
  --variants "desktop,tablet,mobile"

# Interactive component creation
xala create component --interactive
```

## 🎨 Design System Commands

### themes - Theme Management

Comprehensive theme management with industry-specific presets and Norwegian design compliance.

```bash
xala themes <subcommand> [options]
```

#### create - Create New Theme
```bash
xala themes create <theme-name> [options]
```

**Options:**
- `--brand <name>` - Brand name for the theme
- `--colors <colors>` - Color overrides (primary=#0891b2,secondary=#0f766e)
- `--industry <industry>` - Industry type (saas|fintech|healthcare|ecommerce|government)
- `--accessibility <level>` - Accessibility level (WCAG_2_1_AA|WCAG_2_2_AAA)
- `--norwegian-design` - Apply Norwegian government design standards
- `--output <path>` - Output directory (default: ./src/themes)
- `--preview` - Preview theme before creating
- `--dark-mode` - Include dark mode variant

**Examples:**
```bash
# Healthcare theme with Norwegian compliance
xala themes create medical-pro \
  --brand "Helse Norge" \
  --colors primary=#0891b2,secondary=#065f46,accent=#dc2626 \
  --industry healthcare \
  --accessibility WCAG_2_2_AAA \
  --norwegian-design \
  --dark-mode

# Financial services theme
xala themes create fintech-secure \
  --brand "Norsk Bank" \
  --colors primary=#1e40af,secondary=#059669,accent=#dc2626 \
  --industry fintech \
  --accessibility WCAG_2_2_AAA

# Government theme with official Norwegian colors
xala themes create gov-official \
  --brand "Regjeringen" \
  --norwegian-design \
  --accessibility WCAG_2_2_AAA \
  --industry government
```

#### apply - Apply Existing Theme
```bash
xala themes apply <theme-name> [options]
```

**Options:**
- `--variant <variant>` - Theme variant (light|dark|high-contrast)
- `--preview` - Preview before applying

#### customize - Customize Theme
```bash
xala themes customize <theme-name> [options]
```

**Options:**
- `--colors <colors>` - Override colors
- `--typography <typography>` - Override typography
- `--spacing <spacing>` - Override spacing system
- `--interactive` - Interactive customization mode

#### list - List Available Themes
```bash
xala themes list [options]
```

**Options:**
- `--industry <industry>` - Filter by industry
- `--accessibility <level>` - Filter by accessibility level

#### preview - Preview Theme
```bash
xala themes preview <theme-name> [options]
```

**Options:**
- `--variant <variant>` - Preview specific variant
- `--components <components>` - Preview specific components
- `--open` - Open in browser

### tokens - Design Token Management

Manage design tokens across platforms with validation and synchronization.

```bash
xala tokens <subcommand> [options]
```

#### generate - Generate Token Files
```bash
xala tokens generate [options]
```

**Options:**
- `--platform <platform>` - Target platform format
- `--output <path>` - Output directory
- `--format <format>` - Output format (json|css|scss|ts|swift|kotlin|dart)
- `--theme <theme>` - Include theme-specific tokens
- `--norwegian-compliance` - Include Norwegian compliance tokens
- `--accessibility <level>` - Include accessibility tokens

**Examples:**
```bash
# Generate tokens for React platform
xala tokens generate \
  --platform react \
  --format css,ts \
  --output ./src/tokens \
  --accessibility WCAG_2_2_AAA

# Generate multi-platform tokens
xala tokens generate \
  --platform all \
  --format json,css,swift,kotlin \
  --theme healthcare-light \
  --norwegian-compliance

# Generate tokens for Flutter
xala tokens generate \
  --platform flutter \
  --format dart \
  --output ./lib/tokens
```

#### validate - Validate Token Consistency
```bash
xala tokens validate [options]
```

**Options:**
- `--accessibility` - Validate accessibility compliance
- `--contrast` - Check color contrast ratios
- `--norwegian-compliance` - Validate Norwegian standards

#### sync - Synchronize Tokens
```bash
xala tokens sync --platforms <platforms> [options]
```

**Options:**
- `--platforms <platforms>` - Target platforms (react,vue,flutter,ios,android)
- `--force` - Force synchronization

### components - Component Management

Manage component library with scaffolding, updates, and validation.

```bash
xala components <subcommand> [options]
```

#### scaffold - Generate Component Scaffold
```bash
xala components scaffold <component-name> [options]
```

**Options:**
- `--type <type>` - Component type (basic|composite|layout|specialized)
- `--props <props>` - Component properties
- `--variants <variants>` - Style variants
- `--accessibility` - Add accessibility features
- `--norwegian-compliance` - Add compliance features
- `--platform <platform>` - Target platform

**Examples:**
```bash
# Basic button component with Norwegian compliance
xala components scaffold Button \
  --type basic \
  --props "variant:string,size:string,disabled:boolean,loading:boolean" \
  --variants "primary,secondary,outline,ghost,destructive,success,warning" \
  --accessibility \
  --norwegian-compliance

# Complex data table for healthcare
xala components scaffold PatientDataTable \
  --type composite \
  --props "patients:Patient[],classification:NSMLevel,auditTrail:boolean" \
  --variants "default,compact,print" \
  --norwegian-compliance

# Navigation component
xala components scaffold WebNavbar \
  --type layout \
  --props "brand:ReactNode,items:NavItem[],user:User" \
  --variants "horizontal,vertical,mobile" \
  --accessibility
```

#### update - Update Existing Components
```bash
xala components update [component-name] [options]
```

**Options:**
- `--version <version>` - Target design system version
- `--accessibility` - Update accessibility features
- `--norwegian-compliance` - Update compliance features

#### validate - Validate Component Compliance
```bash
xala components validate [options]
```

**Options:**
- `--accessibility` - Validate WCAG compliance
- `--norwegian-compliance` - Validate Norwegian standards
- `--performance` - Check performance metrics

## 🤖 AI-Powered Commands

### ai - AI Code Generation

Leverage AI for intelligent code generation and suggestions with Norwegian compliance.

```bash
xala ai <subcommand> [options]
```

#### generate - Generate from Description
```bash
xala ai generate <description> [options]
```

**Options:**
- `--platform <platform>` - Target platform
- `--provider <provider>` - AI provider (openai|anthropic|azure)
- `--complexity <level>` - Complexity level (basic|intermediate|advanced)
- `--output <path>` - Output directory
- `--interactive` - Interactive generation mode
- `--norwegian-compliance` - Include Norwegian compliance
- `--accessibility <level>` - Accessibility level
- `--industry <industry>` - Industry context

**Examples:**
```bash
# Generate healthcare dashboard with Norwegian compliance
xala ai generate "patient management dashboard with medical records, appointment scheduling, and compliance indicators" \
  --platform react \
  --complexity advanced \
  --norwegian-compliance \
  --accessibility WCAG_2_2_AAA \
  --industry healthcare \
  --interactive

# Generate e-commerce product catalog
xala ai generate "product catalog with search, filters, shopping cart, and checkout flow" \
  --platform react \
  --complexity intermediate \
  --provider anthropic \
  --industry ecommerce

# Generate financial dashboard
xala ai generate "financial analytics dashboard with charts, KPIs, transaction history, and security features" \
  --platform vue \
  --complexity advanced \
  --norwegian-compliance \
  --industry fintech
```

#### suggest - Get AI Suggestions
```bash
xala ai suggest <context> [options]
```

**Options:**
- `--type <type>` - Suggestion type (component|layout|pattern|improvement)
- `--accessibility` - Include accessibility suggestions
- `--performance` - Include performance suggestions

#### validate - AI-Powered Validation
```bash
xala ai validate <file> [options]
```

**Options:**
- `--accessibility` - Validate accessibility
- `--norwegian-compliance` - Validate Norwegian compliance
- `--performance` - Validate performance
- `--security` - Validate security practices

#### explain - Explain Design Concepts
```bash
xala ai explain <concept> [options]
```

**Examples:**
```bash
# Explain Norwegian design standards
xala ai explain "Norwegian government design principles"

# Explain WCAG 2.2 AAA requirements
xala ai explain "WCAG 2.2 AAA accessibility requirements"

# Explain NSM classification
xala ai explain "NSM security classification levels"
```

## 🔨 Build & Development Commands

### build - Multi-Platform Build

Build applications for multiple platforms with optimization and compliance validation.

```bash
xala build <platform> [options]
```

**Platforms:**
- `react` - React applications (CRA, Vite, Next.js)
- `vue` - Vue.js applications (Vue CLI, Vite, Nuxt.js)
- `angular` - Angular applications
- `flutter` - Flutter mobile/desktop apps
- `react-native` - React Native mobile apps
- `svelte` - SvelteKit applications
- `ios` - Native iOS apps (SwiftUI)
- `android` - Native Android apps (Compose)
- `all` - All configured platforms

**Options:**
- `--optimize` - Enable optimization
- `--analyze` - Generate bundle analysis
- `--env <environment>` - Target environment (development|staging|production)
- `--output <path>` - Output directory
- `--watch` - Watch mode for development
- `--accessibility` - Validate accessibility during build
- `--norwegian-compliance` - Validate Norwegian compliance
- `--performance` - Performance optimization

**Examples:**
```bash
# Build optimized React app with compliance validation
xala build react \
  --optimize \
  --analyze \
  --accessibility \
  --norwegian-compliance \
  --performance

# Build for all platforms
xala build all \
  --env production \
  --output ./dist \
  --optimize

# Development build with watch
xala build react \
  --watch \
  --env development \
  --accessibility

# Flutter mobile build
xala build flutter \
  --optimize \
  --env production \
  --output ./build/app/outputs/flutter-apk
```

### dev - Development Server

Start development server with hot-reload, live preview, and compliance validation.

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
- `--accessibility` - Enable accessibility validation
- `--norwegian-compliance` - Enable compliance monitoring

**Examples:**
```bash
# Basic development server with compliance
xala dev \
  --port 3001 \
  --open \
  --accessibility \
  --norwegian-compliance

# HTTPS server with custom theme
xala dev \
  --https \
  --theme healthcare-dark \
  --port 8443 \
  --accessibility

# Development with API proxy
xala dev \
  --proxy "api:http://localhost:4000" \
  --theme enterprise-light
```

**Development Server Features:**
- 🔥 Hot module replacement (HMR)
- 🎨 Live theme switching
- ♿ Real-time accessibility validation
- 🇳🇴 Norwegian compliance monitoring
- 📊 Performance metrics
- 🧪 Component playground
- 📱 Responsive preview modes

### analyze - Project Analysis

Comprehensive project analysis for performance, accessibility, and Norwegian compliance.

```bash
xala analyze [options]
```

**Options:**
- `--performance` - Performance analysis
- `--accessibility` - Accessibility validation
- `--norwegian-compliance` - Norwegian compliance checking
- `--security` - Security audit
- `--bundle` - Bundle analysis
- `--tokens` - Design token validation
- `--components` - Component validation
- `--output <format>` - Output format (json|html|csv|pdf)

**Examples:**
```bash
# Complete analysis with Norwegian compliance
xala analyze \
  --performance \
  --accessibility \
  --norwegian-compliance \
  --security \
  --output html

# Bundle analysis with optimization recommendations
xala analyze \
  --bundle \
  --performance \
  --output json

# Accessibility and compliance audit
xala analyze \
  --accessibility \
  --norwegian-compliance \
  --components \
  --output pdf
```

**Analysis Reports Include:**
- 📈 Performance metrics and recommendations
- ♿ WCAG 2.2 AAA compliance violations and fixes
- 🇳🇴 Norwegian regulatory compliance validation
- 🔒 Security vulnerabilities and patches
- 📦 Bundle size analysis and optimization opportunities
- 🎨 Design token consistency validation
- 🧩 Component usage patterns and improvements

## 🚀 Additional Commands

### deploy - Deployment Operations

Deploy applications to various platforms with compliance validation.

```bash
xala deploy <target> [options]
```

**Targets:**
- `vercel` - Vercel deployment
- `netlify` - Netlify deployment
- `aws` - AWS deployment
- `azure` - Azure deployment
- `gcp` - Google Cloud deployment
- `heroku` - Heroku deployment

**Options:**
- `--env <environment>` - Deployment environment
- `--accessibility` - Validate accessibility before deploy
- `--norwegian-compliance` - Validate compliance before deploy
- `--performance` - Run performance checks

### sync - Platform Synchronization

Synchronize design system across multiple platforms and ensure consistency.

```bash
xala sync [options]
```

**Options:**
- `--platforms <platforms>` - Target platforms (react,vue,flutter,ios,android)
- `--tokens` - Sync design tokens
- `--components` - Sync components
- `--themes` - Sync themes
- `--force` - Force synchronization

### preview - Component Preview

Launch interactive component preview and documentation browser.

```bash
xala preview [component] [options]
```

**Options:**
- `--theme <theme>` - Preview theme
- `--accessibility` - Show accessibility features
- `--norwegian-compliance` - Show compliance features
- `--interactive` - Interactive mode

### docs - Interactive Documentation

Access interactive documentation and compliance guides.

```bash
xala docs [topic] [options]
```

**Topics:**
- `accessibility` - WCAG 2.2 AAA guidelines
- `norwegian-compliance` - NSM and GDPR requirements
- `tokens` - Design tokens reference
- `components` - Component library documentation
- `themes` - Theme system guide
- `patterns` - Design patterns and layouts

## ⚙️ Configuration

All commands respect the `xala.config.js` configuration file:

```javascript
module.exports = {
  name: 'my-app',
  platform: 'react',
  industry: 'healthcare',
  
  // Norwegian compliance settings
  compliance: {
    norwegian: true,
    nsmClassification: 'ÅPEN',
    gdpr: true,
    accessibility: 'WCAG_2_2_AAA'
  },
  
  // Theme configuration
  theme: {
    default: 'healthcare-light',
    darkMode: true,
    highContrast: true
  },
  
  // AI integration
  ai: {
    provider: 'openai',
    model: 'gpt-4',
    enableCompliance: true
  },
  
  // Build settings
  build: {
    outputDir: './dist',
    optimize: true,
    analyze: true,
    validateAccessibility: true,
    validateCompliance: true
  },
  
  // Development server
  dev: {
    port: 3000,
    https: false,
    accessibility: true,
    compliance: true
  },
  
  // Localization
  i18n: {
    defaultLocale: 'nb-NO',
    locales: ['nb-NO', 'en-US', 'fr-FR', 'ar-SA']
  }
};
```

## 🌐 Global Options

Available for all commands:

- `--config <path>` - Configuration file path
- `--verbose` - Verbose logging
- `--quiet` - Minimal output
- `--no-banner` - Disable banner display
- `--help` - Show command help
- `--version` - Show CLI version
- `--no-telemetry` - Disable telemetry collection

## 🔢 Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Configuration error
- `4` - Build failure
- `5` - Validation failure
- `6` - Compliance violation
- `7` - Accessibility failure

## 🌍 Environment Variables

### API Keys
- `XALA_API_KEY` - Xala API key for premium features
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `ANTHROPIC_API_KEY` - Anthropic API key for Claude

### Configuration
- `XALA_LOG_LEVEL` - Logging level (debug|info|warn|error)
- `XALA_NO_TELEMETRY` - Disable telemetry collection
- `XALA_CONFIG_PATH` - Custom config file path
- `XALA_CACHE_DIR` - Custom cache directory

### Norwegian Compliance
- `XALA_NSM_CLASSIFICATION` - Default NSM classification level
- `XALA_GDPR_ENABLED` - Enable GDPR compliance features
- `XALA_ACCESSIBILITY_LEVEL` - Default accessibility level

## 🆘 Support & Troubleshooting

### Getting Help
```bash
# General help
xala --help

# Command-specific help
xala create --help
xala ai generate --help

# Interactive troubleshooting
xala doctor
```

### Common Issues
- **Command not found**: Verify global installation
- **Norwegian compliance errors**: Check NSM classification settings
- **Accessibility failures**: Review WCAG 2.2 AAA requirements
- **Build failures**: Validate TypeScript configuration
- **AI generation issues**: Verify API keys and provider settings

### Debug Mode
```bash
# Enable debug logging
XALA_LOG_LEVEL=debug xala create component Button

# Verbose output with timing
xala build react --verbose

# Dry run (preview without executing)
xala deploy vercel --dry-run
```

---

*Xala CLI Commands Reference v2.0 - Multi-platform development with Norwegian compliance*