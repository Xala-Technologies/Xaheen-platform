# Xala UI System MCP Server v6.1.1

Multi-platform MCP server for generating enterprise-grade UI components across React, Next.js, Vue, Angular, Svelte, Electron, and React Native using the Xala UI System v5.0 semantic architecture.

**100% CLI Template Alignment** - This MCP server uses the exact same templates as the Xala UI System CLI, ensuring complete consistency across all generation methods.

## Features

### 🚀 Enhanced Developer Experience (v6.1 Updates)
- **Quick Generate Tools** - Streamlined component generation with smart presets
- **Component Retrieval** - Browse, search, and inspect template library like shadcn/ui
- **Intelligent Caching** - Template caching system for improved performance
- **Enhanced Validation** - Detailed error messages with helpful suggestions
- **Simplified Interface** - Reduced complexity with focused tool sets

### 🎯 Complete CLI Template Alignment
- **131+ Production Templates** directly from CLI
- **7 Platform Support** with platform-specific optimizations
- **Exact Template Parity** - Same Handlebars templates as CLI
- **Real-time Template Sync** - Always uses latest CLI templates

### 🏗️ v5.0 Semantic Architecture
- **Zero Raw HTML** - Only semantic UI components
- **Mandatory Localization** - All text must use i18n
- **Design Token System** - Consistent theming across platforms
- **WCAG AAA Compliance** - Enterprise accessibility standards

### 🚀 Platform Support Matrix

| Platform | Components | Data | Theme | Layouts | Providers | Patterns | Tools | Total |
|----------|------------|------|-------|---------|-----------|----------|-------|--------|
| **React** | ✅ 15 | ✅ 4 | ✅ 2 | ✅ 2 | ✅ 6 | ✅ 3 | ✅ 2 | **34** |
| **Next.js** | ✅ 15 | ✅ 4 | ✅ 2 | ✅ 4 | ✅ 6 | ✅ 3 | ✅ 2 | **36** |
| **Vue** | ✅ 15 | ✅ 4 | ✅ 2 | ✅ 2 | ✅ 2 | ❌ | ❌ | **25** |
| **Angular** | ✅ 15 | ✅ 4 | ✅ 2 | ✅ 2 | ✅ 1 | ❌ | ❌ | **24** |
| **Svelte** | ✅ 15 | ✅ 4 | ✅ 2 | ✅ 2 | ✅ 1 | ❌ | ❌ | **24** |
| **Electron** | ✅ 15 | ✅ 4 | ✅ 2 | ✅ 2 | ✅ 2 | ❌ | ✅ 2 | **27** |
| **React Native** | ✅ 15 | ✅ 2 | ❌ | ✅ 2 | ✅ 2 | ❌ | ❌ | **21** |

**Total: 191 Platform-Specific Templates** (131+ unique templates across platforms)

## Installation

### From GitHub Packages

```bash
# Configure GitHub Packages registry
echo "@xala-technologies:registry=https://npm.pkg.github.com/" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install the package
npm install @xala-technologies/xala-mcp@6.1.1
# or with bun
bun add @xala-technologies/xala-mcp@6.1.1
```

**Note**: You'll need a GitHub Personal Access Token with `read:packages` scope. [Create one here](https://github.com/settings/tokens/new?scopes=read:packages).

## Why Choose Xala UI System MCP?

### 🎯 **Best of Both Worlds**
Combines **comprehensive component generation** (131+ templates) with **shadcn/ui's focused developer experience**

### 🚀 **Multi-Platform Excellence**
- **7 Platforms**: React, Next.js, Vue, Angular, Svelte, Electron, React Native
- **Enterprise Ready**: WCAG AAA accessibility, localization, design tokens
- **Production Templates**: Battle-tested components used in enterprise applications

### ⚡ **Developer Experience**
- **Quick Generate**: One-command component creation with smart presets
- **Component Library**: Browse, search, and inspect 191+ templates like shadcn/ui
- **Intelligent Caching**: Fast template loading with automatic invalidation
- **Enhanced Validation**: Detailed error messages with actionable suggestions

### 🎨 **Enterprise Features**
- **Norwegian Compliance**: BankID, Altinn, Vipps, and municipal integrations
- **Industry Themes**: Finance, healthcare, education, e-commerce
- **Accessibility**: WCAG AAA compliance out of the box
- **Localization**: Built-in support for English, Norwegian, French, Arabic

## MCP Tools Available

### 🚀 Quick Generate Tools (New!)

#### 1. `quick_generate`
Quickly generate components using smart presets and platform optimizations.

```json
{
  "name": "UserProfile",
  "type": "basic-form",
  "platform": "react",
  "customizations": {
    "theme": "enterprise",
    "features": {
      "validation": true,
      "animated": true
    }
  }
}
```

#### 2. `quick_generate_set`  
Generate multiple components with consistent theming.

```json
{
  "components": [
    { "name": "LoginForm", "type": "basic-form" },
    { "name": "UserTable", "type": "data-table" },
    { "name": "MainNav", "type": "navigation-menu" }
  ],
  "platform": "nextjs",
  "theme": "enterprise"
}
```

#### 3. `get_quick_presets`
Get available component presets with descriptions.

#### 4. `get_platform_recommendations`
Get platform-specific recommendations and best practices.

### 🔍 Component Retrieval Tools (New!)

#### 5. `get_component_source`
Retrieve component source code from template library.

```json
{
  "name": "navbar",
  "platform": "react",
  "variant": "default"
}
```

#### 6. `get_component_demo`
Get component demo/example code with usage patterns.

```json
{
  "name": "modal",
  "platform": "nextjs",
  "demoType": "advanced"
}
```

#### 7. `browse_component_library`
Browse the component library with filtering and search.

```json
{
  "platform": "vue",
  "category": "components",
  "search": "form",
  "limit": 20
}
```

#### 8. `get_component_metadata`
Get detailed component metadata including dependencies.

```json
{
  "name": "data-table",
  "platform": "angular"
}
```

### 🛠️ Advanced Generation Tools

#### 9. `generate_multi_platform_component`
Generate a component for a specific platform using CLI templates.

#### 10. `generate_all_platforms`
Generate the same component for all supported platforms simultaneously.

#### 11. `validate_component_config`
Validate component configuration with detailed error messages and suggestions.

## Component Categories

### 📦 Components (UI Components)
Core UI building blocks available across all platforms:
- `navbar` - Navigation bar with responsive design
- `modal` - Accessible modal dialogs
- `sidebar` - Collapsible sidebar navigation
- `header` - Page headers with actions
- `form` - Form containers with validation
- `card` - Content cards with variants
- `dashboard` - Dashboard layouts

### 📊 Data Components
Advanced data visualization and manipulation:
- `data-table` - Sortable, filterable data tables
- `virtual-list` - Performant virtual scrolling
- `command-palette` - Command/search palette (Cmd+K)
- `global-search` - Global search with filters

### 🎨 Theme Components
Theme and styling management:
- `theme-switcher` - Light/dark mode toggle
- `theme-selector` - Multi-theme selector

### 📐 Layout Components
Page and application layouts:
- `app-shell` - Application shell with navigation
- `layout` - Flexible layout system

### 🔌 Provider Components
Context and state providers (React/Next.js):
- `auth-provider` - Authentication context
- `theme-provider` - Theme context
- `error-boundary` - Error handling
- `notification-provider` - Toast notifications
- `token-provider` - Design token provider
- `feature-flags` - Feature flag management

### 🎯 Pattern Components
Advanced React patterns (React/Next.js only):
- `render-props` - Render prop pattern
- `hoc-collection` - Higher-order components
- `component-factory` - Dynamic component creation

### 🛠️ Tool Components
Development and monitoring tools:
- `performance-monitor` - Performance tracking
- `code-generator` - Code generation utilities

## CLI Template Structure

The MCP server directly uses the CLI template structure:

```
cli/templates/
├── react/
│   ├── components/       # UI components
│   ├── layouts/          # Layout templates
│   ├── providers/        # Context providers
│   ├── patterns/         # Advanced patterns
│   └── tools/            # Dev tools
├── nextjs/
│   ├── app-router/       # App Router specific
│   ├── pages-router/     # Pages Router specific
│   └── [same as react]
├── vue/
│   ├── components/
│   ├── composables/      # Vue 3 composables
│   └── plugins/
├── angular/
│   ├── components/
│   ├── services/
│   └── modules/
├── svelte/
│   ├── components/
│   └── stores/
├── electron/
│   ├── main/             # Main process
│   ├── renderer/         # Renderer process
│   └── preload/
└── react-native/
    ├── components/
    ├── screens/
    └── navigation/
```

## AI Agent Integration

The Xala UI System MCP Server works with multiple AI coding assistants. Choose your preferred setup:

### 🤖 Claude Desktop

Add to your Claude Desktop configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "npx",
      "args": [
        "@xala-technologies/xala-mcp@6.1.1"
      ],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

**Alternative with local installation:**
```json
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "node",
      "args": ["node_modules/@xala-technologies/xala-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

### 🎯 Cursor IDE

1. **Install the MCP extension** in Cursor
2. **Create `.cursor/mcp.json`** in your project root:

```json
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "npx",
      "args": ["@xala-technologies/xala-mcp@6.1.1"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

3. **Restart Cursor IDE** to load the MCP server
4. **Access via Command Palette**: `Ctrl/Cmd + Shift + P` → "MCP: Use Tool"

### 🌊 Windsurf IDE

1. **Open Windsurf Settings** (`Ctrl/Cmd + ,`)
2. **Navigate to Extensions** → MCP Servers
3. **Add new server configuration**:

```json
{
  "name": "Xala UI System",
  "command": "npx",
  "args": ["@xala-technologies/xala-mcp@6.1.1"],
  "env": {
    "GITHUB_TOKEN": "your_github_token_here"
  }
}
```

4. **Enable the server** and restart Windsurf
5. **Use via Windsurf AI Chat** - the tools will be available automatically

### 🔧 Continue (VS Code Extension)

1. **Install Continue extension** in VS Code
2. **Open Continue configuration** (`~/.continue/config.json`):

```json
{
  "models": [...],
  "mcpServers": [
    {
      "name": "xala-ui-system",
      "command": "npx",
      "args": ["@xala-technologies/xala-mcp@6.1.1"],
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  ]
}
```

3. **Reload VS Code** to activate the MCP server
4. **Access via Continue chat** - tools will be available in the sidebar

### 🛠️ Cline (VS Code Extension)

1. **Install Cline extension** in VS Code
2. **Open Cline settings** (extension settings)
3. **Add MCP Server**:
   - **Name**: Xala UI System
   - **Command**: `npx`
   - **Args**: `@xala-technologies/xala-mcp@6.1.1`
   - **Environment**: `GITHUB_TOKEN=your_github_token_here`

4. **Restart Cline** to load the server
5. **Use in Cline chat** - all tools will be available

### 🔑 GitHub Token Setup

For all integrations, you'll need a GitHub Personal Access Token:

1. **Go to**: https://github.com/settings/tokens/new
2. **Select scopes**: `read:packages` (required for GitHub Packages)
3. **Generate token** and copy it
4. **Add to your configuration** in the `env` section as shown above

### ⚡ Quick Start Commands

Once configured with any AI agent, try these commands:

```bash
# Quick generate a form component
"Generate a contact form for React using the quick_generate tool with enterprise theme"

# Browse component library  
"Show me all available form components using browse_component_library"

# Get component source
"Get the source code for the navbar component in Next.js using get_component_source"

# Generate multiple components
"Create a user dashboard with form, data table, and navigation using quick_generate_set"
```

### 🛠️ Troubleshooting

#### Common Issues and Solutions

**❌ "Package not found" or "403 Forbidden"**
```bash
# Solution: Ensure GitHub token has correct permissions
# 1. Check token has 'read:packages' scope
# 2. Verify .npmrc configuration:
echo "@xala-technologies:registry=https://npm.pkg.github.com/" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc
```

**❌ "MCP server failed to start"**
```bash
# Solution: Check Node.js version and installation
node --version  # Should be >= 18.0.0
npm ls @xala-technologies/xala-mcp  # Verify installation
```

**❌ "Tools not showing up in AI agent"**
- **Claude Desktop**: Check `~/.claude/claude_desktop_config.json` syntax
- **Cursor**: Ensure `.cursor/mcp.json` is in project root
- **VS Code Extensions**: Restart VS Code after configuration changes
- **All agents**: Verify the MCP server process is running in logs

**❌ "GITHUB_TOKEN environment variable not set"**
```bash
# For testing locally, export the token:
export GITHUB_TOKEN=your_github_token_here

# For permanent setup, add to your shell profile (.bashrc, .zshrc):
echo 'export GITHUB_TOKEN=your_github_token_here' >> ~/.zshrc
source ~/.zshrc
```

**❌ "Component generation fails"**  
Check that the MCP server has access to CLI templates. Ensure the Xala CLI is properly installed or accessible.

#### Getting Help

- **GitHub Issues**: [Report bugs here](https://github.com/Xala-Technologies/Xaheen-platform/issues)
- **Documentation**: [Full docs](https://docs.xala.tech)
- **MCP Server Logs**: Check AI agent logs for detailed error messages

### Programmatic Usage

```typescript
import { ComponentGenerator } from '@xala-technologies/ui-system-mcp';

const generator = new ComponentGenerator();

// Generate using CLI templates
const result = await generator.generateMultiPlatformComponent({
  name: 'UserProfile',
  category: 'components',
  platform: 'nextjs',
  features: {
    interactive: true,
    animated: true
  },
  accessibility: {
    level: 'AAA',
    screenReader: true,
    keyboardNavigation: true
  }
});

console.log(result.componentCode);
console.log(`Generated ${result.files.length} files`);
```

## Platform-Specific Features

### Next.js
- App Router support with RSC
- Pages Router compatibility
- Server Components
- Middleware integration

### Vue 3
- Composition API
- Script setup syntax
- Pinia store integration
- Auto-imported components

### Angular
- Standalone components
- Signals support
- RxJS integration
- NgRx compatibility

### Svelte
- SvelteKit ready
- Store subscriptions
- Reactive statements
- Compiled optimizations

### Electron
- Main/Renderer separation
- IPC communication
- Native APIs
- Window controls

### React Native
- Expo support
- React Navigation
- Native styling
- Platform-specific code

## Configuration

### Component Configuration Schema

```typescript
interface ComponentConfig {
  name: string;
  category: ComponentCategory;
  platform?: SupportedPlatform;
  features: {
    interactive?: boolean;
    animated?: boolean;
    searchable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    paginated?: boolean;
    // ... more features
  };
  accessibility: {
    level: 'AA' | 'AAA';
    screenReader: boolean;
    keyboardNavigation: boolean;
    // ... more a11y options
  };
  responsive: {
    breakpoints: string[];
    mobileFirst: boolean;
    // ... more responsive options
  };
}
```

## Comparison with shadcn/ui MCP Server

Our MCP server combines the best of both worlds - comprehensive generation capabilities with the focused developer experience of shadcn/ui:

| Feature | Xaheen MCP v6.1 | shadcn/ui MCP | Advantage |
|---------|----------------|---------------|-----------|
| **Component Generation** | ✅ Full generation with 131+ templates | ❌ Retrieval only | Complete workflow |
| **Component Retrieval** | ✅ Browse, search, inspect | ✅ Browse, search, inspect | ✨ **Both approaches** |
| **Multi-Platform** | ✅ 7 platforms | ❌ React/Svelte only | Enterprise flexibility |
| **Quick Generation** | ✅ Smart presets | ❌ No generation | Rapid prototyping |
| **Caching System** | ✅ Template caching | ✅ GitHub API caching | Performance optimization |
| **Error Messages** | ✅ Enhanced validation | ✅ Good error handling | Developer experience |
| **Tool Complexity** | ✅ 11 focused tools | ✅ 4 simple tools | Balanced approach |

## Development

### Building

```bash
bun run build
```

### Testing

```bash
bun test
```

### Linting

```bash
bun run lint
```

## Architecture

### v5.0 Semantic Architecture Rules

1. **Zero Raw HTML** - All markup must use semantic components
2. **Mandatory Localization** - All text must use i18n functions
3. **Token-Based Styling** - All styles must reference design tokens
4. **CVA Integration** - React/Next.js components use Class Variance Authority
5. **Platform Optimization** - Each platform uses its native patterns

### Template Processing Pipeline

1. **Template Discovery** - Locate CLI template for component/platform
2. **Template Compilation** - Compile Handlebars template
3. **Data Preparation** - Prepare platform-specific template data
4. **Template Rendering** - Render with v5.0 compliance rules
5. **File Generation** - Create complete file structure

## CLI Integration

This MCP server is designed to work seamlessly with the Xala UI System CLI:

```bash
# CLI generation
xala-ui generate component UserCard --platform react

# MCP generation (produces identical output)
mcp call generate_multi_platform_component '{
  "config": {
    "name": "UserCard",
    "platform": "react"
  }
}'
```

Both methods use the same templates and produce identical output.

## Contributing

Contributions are welcome! Please ensure:
- Templates match CLI structure
- v5.0 architecture compliance
- Platform-specific optimizations
- Comprehensive test coverage

## License

MIT © Xala Technologies

## Support

For issues and questions:
- GitHub Issues: [xala-ui-system-mcp/issues](https://github.com/xala-technologies/ui-system-mcp)
- Documentation: [docs.xala.tech](https://docs.xala.tech)
- CLI Repository: [xala-ui-system-cli](https://github.com/xala-technologies/ui-system-cli)