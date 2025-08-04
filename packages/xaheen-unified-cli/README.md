# Xaheen Unified CLI v3.0.0-alpha.1

The next-generation CLI that combines **service-based architecture** with **AI-powered component generation** for the ultimate full-stack development experience.

## 🚀 Features

### Core Capabilities
- **Unified Command Structure**: `xaheen [domain] [action] [target] [options]`
- **Monorepo-First**: Built for apps-packages structure with Turbo
- **Multi-Platform Support**: Web, desktop, mobile, and server applications
- **AI-Powered Generation**: Natural language component and service creation
- **Legacy Compatibility**: Full backward compatibility with xaheen-cli and xala-cli

### Platform Support
- **Web**: Next.js, React, Vue, Angular, Svelte
- **Desktop**: Electron, Tauri
- **Mobile**: React Native, Expo
- **Server**: NestJS, Fastify, Express

### Service Integration
- **13 Pre-configured Bundles**: SaaS starter, e-commerce, CMS, analytics
- **Service Injection**: Add/remove services with dependency management
- **Norwegian Compliance**: BankID, Vipps, Altinn integration
- **WCAG AAA Accessibility**: Built-in compliance validation

## 📦 Installation

```bash
npm install -g @xala-technologies/xaheen-unified-cli
# or
yarn global add @xala-technologies/xaheen-unified-cli
# or
pnpm add -g @xala-technologies/xaheen-unified-cli
# or
bun add -g @xala-technologies/xaheen-unified-cli
```

## 🎯 Quick Start

### Create a New Monorepo Project

```bash
# Interactive setup
xaheen project create my-app

# With specific options
xaheen project create my-app --framework nextjs --bundle saas-starter --norwegian
```

### Add Applications to Existing Monorepo

```bash
# Add a new web application
xaheen add app admin-panel --platform web --framework nextjs

# Add a desktop application
xaheen add app desktop-client --platform desktop --framework electron

# Add a mobile application
xaheen add app mobile-app --platform mobile --framework react-native
```

### Service Management

```bash
# Add individual services
xaheen service add auth --provider clerk
xaheen service add database --provider postgresql --orm prisma
xaheen service add payments --provider stripe

# List available services
xaheen service list

# Remove services
xaheen service remove auth
```

### AI-Powered Generation

```bash
# Generate components with AI
xaheen component generate "user dashboard with charts and metrics"
xaheen component generate "responsive navigation with mobile menu"

# Generate complete services
xaheen ai service "create authentication with Norwegian BankID and session management"
```

### Theme and Design System

```bash
# Create and manage themes
xaheen theme create healthcare --industry medical
xaheen theme list

# Update design configuration
xaheen design update --platform react --theme healthcare
```

## 📋 Command Reference

### Project Commands

```bash
xaheen project create <name>     # Create new monorepo project
xaheen project validate          # Validate project structure and config
```

**Options:**
- `--framework <framework>` - nextjs, react, vue, angular, svelte
- `--bundle <bundle>` - saas-starter, e-commerce, cms, dashboard
- `--norwegian` - Enable Norwegian compliance features
- `--gdpr` - Enable GDPR compliance features

### Service Commands

```bash
xaheen service add <service>     # Add service to project
xaheen service remove <service>  # Remove service from project
xaheen service list              # List available services
```

### Component Commands

```bash
xaheen component generate "<description>"  # AI-powered component generation
xaheen component create <name>             # Create component from template
```

### Theme Commands

```bash
xaheen theme create <name>       # Create new theme
xaheen theme list                # List available themes
```

### AI Commands

```bash
xaheen ai generate "<prompt>"           # General AI generation
xaheen ai service "<description>"       # AI-enhanced service generation
```

### Build Commands

```bash
xaheen build                     # Build all applications
xaheen build --platform web      # Build specific platform
```

### Validation Commands

```bash
xaheen validate                  # Validate entire project
xaheen validate --config         # Validate configuration only
```

## 🏗️ Project Structure

The unified CLI creates monorepo projects with the following structure:

```
my-app/
├── apps/                        # Applications
│   ├── web/                     # Next.js web app
│   ├── desktop/                 # Electron app (optional)
│   └── mobile/                  # React Native app (optional)
├── packages/                    # Shared packages
│   ├── ui-system/              # Design system
│   ├── shared/                 # Shared utilities
│   └── config/                 # Shared configurations
├── xaheen.config.json          # Unified CLI configuration
├── turbo.json                  # Turbo configuration
├── package.json                # Root package.json
└── README.md
```

## ⚙️ Configuration

### Unified Configuration File (`xaheen.config.json`)

```json
{
  "version": "3.0.0",
  "project": {
    "name": "my-app",
    "framework": "nextjs",
    "packageManager": "bun"
  },
  "services": {
    "auth": { "provider": "clerk", "version": "5.0.0" },
    "database": { "provider": "postgresql", "orm": "prisma" }
  },
  "design": {
    "platform": "react",
    "theme": "healthcare-light",
    "tokens": "./design-tokens.json"
  },
  "ai": {
    "provider": "openai",
    "model": "gpt-4"
  },
  "compliance": {
    "accessibility": "AAA",
    "norwegian": true,
    "gdpr": true
  }
}
```

### Environment Variables

```bash
# AI Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# CLI Behavior
XAHEEN_NO_BANNER=true          # Disable startup banner
XAHEEN_LOG_LEVEL=debug         # Enable debug logging
```

## 🔧 Legacy Migration

### From xaheen-cli v2.x

The unified CLI automatically detects and migrates from existing `.xaheen/config.json`:

```bash
cd existing-xaheen-project
xaheen migrate --from xaheen-cli
```

**Legacy Command Mapping:**
- `xaheen create` → `xaheen project create`
- `xaheen add` → `xaheen service add`
- `xaheen remove` → `xaheen service remove`
- `xaheen validate` → `xaheen project validate`

### From xala-cli v2.x

Automatic migration from existing `xala.config.js`:

```bash
cd existing-xala-project
xaheen migrate --from xala-cli
```

**Legacy Command Mapping:**
- `xala init` → `xaheen project create`
- `xala generate component` → `xaheen component generate`
- `xala themes create` → `xaheen theme create`
- `xala build` → `xaheen build`

## 🧪 Development

### Building from Source

```bash
git clone https://github.com/Xala-Technologies/xaheen.git
cd xaheen/packages/xaheen-unified-cli
bun install
bun run build
```

### Running Tests

```bash
bun test                         # Run all tests
bun test --watch                 # Watch mode
bun test --coverage              # With coverage
```

### Local Development

```bash
bun run dev                      # Build with watch mode
bun run build && npm link       # Link globally for testing
```

## 🎨 Service Bundles

### SaaS Starter Bundle
- **Authentication**: Clerk/Auth0/NextAuth
- **Database**: PostgreSQL with Prisma
- **Payments**: Stripe integration
- **Email**: Resend/SendGrid
- **Analytics**: PostHog/Mixpanel

### E-commerce Bundle
- **Products**: Catalog management
- **Cart**: Shopping cart logic
- **Orders**: Order processing
- **Inventory**: Stock management
- **Payments**: Multi-provider support

### CMS Bundle
- **Content**: Rich content management
- **Media**: File upload and processing
- **Admin**: Administrative interface
- **SEO**: Search optimization
- **Localization**: Multi-language support

### Analytics Dashboard Bundle
- **Charts**: Interactive visualizations
- **Metrics**: KPI tracking
- **Reports**: Automated reporting
- **Real-time**: Live data updates
- **Export**: Data export capabilities

## 🌍 Norwegian Compliance

Built-in support for Norwegian regulatory requirements:

### BankID Integration
```bash
xaheen service add bankid --environment test
```

### Vipps Payments
```bash
xaheen service add vipps --merchant-id YOUR_ID
```

### Altinn Integration
```bash
xaheen service add altinn --environment test
```

### GDPR Compliance
```bash
xaheen compliance enable gdpr
xaheen compliance validate gdpr
```

## 🤖 AI Integration

### OpenAI Integration
```bash
# Configure OpenAI
xaheen ai config --provider openai --api-key YOUR_KEY

# Generate components
xaheen component generate "modern login form with validation"
```

### Anthropic Claude Integration
```bash
# Configure Claude
xaheen ai config --provider anthropic --api-key YOUR_KEY

# Generate services
xaheen ai service "user management with roles and permissions"
```

## 🔌 Plugin System

The unified CLI supports a plugin architecture for extensibility:

```typescript
// my-plugin.ts
import { CLIPlugin } from '@xala-technologies/xaheen-unified-cli';

export const myPlugin: CLIPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  commands: [
    {
      name: 'custom-command',
      description: 'My custom command',
      domain: 'custom',
      action: 'run',
      handler: async (args) => {
        console.log('Custom command executed!');
      }
    }
  ],
  providers: [],
  templates: [],
  
  async onInstall() {
    console.log('Plugin installed');
  },
  
  async onActivate() {
    console.log('Plugin activated');
  },
  
  async onCommand(cmd, args) {
    console.log(`Command executed: ${cmd}`);
  }
};
```

## 📊 Performance

- **Command Initialization**: <100ms average
- **Project Creation**: <30s for full monorepo
- **Service Injection**: <5s per service
- **AI Generation**: 5-15s depending on complexity
- **Bundle Size**: <500KB total CLI size

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork
3. Install dependencies: `bun install`
4. Create a feature branch
5. Make your changes
6. Run tests: `bun test`
7. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

### Documentation
- [Full Documentation](https://docs.xaheen.dev)
- [API Reference](https://docs.xaheen.dev/api)
- [Examples](https://github.com/Xala-Technologies/xaheen-examples)

### Community
- [Discord](https://discord.gg/xaheen)
- [GitHub Discussions](https://github.com/Xala-Technologies/xaheen/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/xaheen)

### Enterprise Support
For enterprise support and custom integrations, contact: [enterprise@xala.no](mailto:enterprise@xala.no)

---

**Xaheen Unified CLI v3.0.0** - Built by [Xala Technologies](https://xala.no)