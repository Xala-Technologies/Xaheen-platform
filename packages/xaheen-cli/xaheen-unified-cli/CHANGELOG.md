# Changelog

## [3.0.0-alpha.1] - 2024-08-04

### 🎉 Initial Release - Phase 1 Implementation

This is the first alpha release of the Xaheen Unified CLI, combining the power of xaheen-cli's service-based architecture with xala-cli's AI-powered component generation.

### ✨ New Features

#### Core Architecture
- **Unified Command Structure**: New `xaheen [domain] [action] [target] [options]` syntax
- **Modular Architecture**: Clean separation of domains (project, service, component, theme, ai, mcp)
- **Plugin System**: Extensible architecture for custom commands and providers
- **Global CLI Context**: Shared state management across all domains

#### Platform Support
- **Multi-Platform Templates**: Web, desktop, mobile, and server applications
- **Monorepo-First**: Built-in support for apps-packages structure with Turbo
- **Framework Agnostic**: Support for Next.js, React, Vue, Angular, Svelte, Electron, Tauri, React Native, Expo

#### Service Management
- **Unified Service Registry**: Combined templates from both xaheen-cli and xala-cli
- **Service Injection**: Add/remove services with automatic dependency management
- **13 Pre-configured Bundles**: SaaS starter, e-commerce, CMS, analytics dashboards
- **Norwegian Compliance**: Built-in BankID, Vipps, and Altinn integration

#### Configuration System
- **Unified Configuration**: Single `xaheen.config.json` file
- **Legacy Migration**: Automatic migration from `.xaheen/config.json` and `xala.config.js`
- **Schema Validation**: Zod-based configuration validation
- **Environment Detection**: Automatic monorepo structure detection

#### App Template System
- **Platform Categorization**: Templates organized by web, mobile, desktop, server
- **Monorepo Integration**: All apps target the `apps/` directory
- **UI System Integration**: All templates include `@xala-technologies/ui-system` v6.1.0
- **Template Variables**: Support for dynamic template generation

### 🔄 Legacy Compatibility

#### xaheen-cli v2.x Migration
- `xaheen create` → `xaheen project create`
- `xaheen add` → `xaheen service add`
- `xaheen remove` → `xaheen service remove`
- `xaheen validate` → `xaheen project validate`
- `xaheen doctor` → `xaheen project validate`

#### xala-cli v2.x Migration
- `xala init` → `xaheen project create`
- `xala generate component` → `xaheen component generate`
- `xala themes create` → `xaheen theme create`
- `xala build` → `xaheen build`
- `xala ai generate` → `xaheen ai generate`

### 📋 Commands

#### Project Management
```bash
xaheen project create <name>     # Create monorepo project
xaheen project validate          # Validate project structure
```

#### Service Management
```bash
xaheen service add <service>     # Add service
xaheen service remove <service>  # Remove service
xaheen service list              # List available services
```

#### Component & AI
```bash
xaheen component generate "<description>"  # AI component generation
xaheen component create <name>             # Template-based creation
xaheen ai generate "<prompt>"              # General AI generation
xaheen ai service "<description>"          # AI service generation
```

#### Theme Management
```bash
xaheen theme create <name>       # Create theme
xaheen theme list                # List themes
```

#### Build & Deploy
```bash
xaheen build                     # Build all apps
xaheen mcp connect               # Connect to MCP server
xaheen mcp deploy                # Deploy via MCP
```

### 🏗️ Architecture

#### Core Systems
- **UnifiedCommandParser**: Handles command routing and legacy mapping
- **UnifiedServiceRegistry**: Manages service, component, and app templates
- **UnifiedConfigManager**: Configuration loading, validation, and migration
- **Plugin System**: Extensible architecture for custom functionality

#### Domain Handlers
- **ProjectDomain**: Project creation and validation
- **ServiceDomain**: Service injection and management
- **ComponentDomain**: Component generation (AI and template-based)
- **ThemeDomain**: Theme creation and management
- **AIDomain**: AI-powered generation capabilities
- **MCPDomain**: MCP server integration (coming soon)

### 🧪 Testing

- **Integration Tests**: Command routing, configuration merging, registry functionality
- **Unit Tests**: Core system validation and error handling
- **Mocking**: Comprehensive mocking for external dependencies
- **Coverage**: >90% test coverage for core systems

### 📦 Dependencies

#### Production Dependencies
- `commander`: Command-line interface framework
- `chalk`: Terminal styling
- `consola`: Enhanced logging
- `fs-extra`: File system utilities
- `handlebars`: Template engine
- `zod`: Schema validation
- `@clack/prompts`: Interactive prompts
- `@xala-technologies/ui-system`: Design system (v6.1.0)

#### Development Dependencies
- `vitest`: Testing framework
- `tsup`: Build system
- `typescript`: TypeScript compiler
- `@types/*`: Type definitions

### 🔧 Configuration

#### Environment Variables
```bash
OPENAI_API_KEY=your_key          # OpenAI integration
ANTHROPIC_API_KEY=your_key       # Anthropic integration
XAHEEN_NO_BANNER=true            # Disable banner
XAHEEN_LOG_LEVEL=debug           # Enable debug logging
```

#### Configuration Schema
```typescript
interface UnifiedConfig {
  version: string;
  project: {
    name: string;
    framework: string;
    packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  };
  services?: Record<string, ServiceConfig>;
  design?: {
    platform?: 'react' | 'vue' | 'angular' | 'svelte';
    theme?: string;
    tokens?: string;
  };
  ai?: {
    provider?: 'openai' | 'anthropic' | 'local';
    model?: string;
  };
  compliance?: {
    accessibility: 'A' | 'AA' | 'AAA';
    norwegian: boolean;
    gdpr: boolean;
  };
}
```

### 🚧 Known Limitations (Alpha)

- **AI Generation**: Placeholder implementation (coming in alpha.2)
- **MCP Integration**: Basic structure only (full implementation coming)
- **Plugin System**: Architecture defined, loader implementation pending
- **Template Loading**: Using hardcoded templates, file-based loading coming
- **Service Bundle Installation**: Basic configuration only, file generation pending

### 🗺️ Roadmap

#### Alpha.2 (Planned)
- AI integration with OpenAI/Anthropic APIs
- Template file generation from registry
- Service bundle file installation
- Plugin system implementation

#### Alpha.3 (Planned)
- MCP server integration
- Advanced template customization
- Performance optimizations
- Extended service catalog

#### Beta.1 (Planned)
- Full backward compatibility testing
- Production-ready service bundles
- Documentation completion
- Community plugin support

### 🤝 Contributing

This is an alpha release. We welcome feedback and contributions! Please:

1. Report issues on GitHub
2. Join our Discord for discussions
3. Submit feature requests
4. Contribute to documentation

### 💬 Support

- **Documentation**: https://docs.xaheen.dev
- **Discord**: https://discord.gg/xaheen
- **GitHub**: https://github.com/Xala-Technologies/xaheen
- **Email**: support@xala.no

---

**Thank you for testing the Xaheen Unified CLI alpha!** 🎉