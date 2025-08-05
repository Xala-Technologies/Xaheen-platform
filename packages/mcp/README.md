# Xala MCP Server v6.5.0

Multi-platform MCP server with **Enhanced Prompts Integration** for generating enterprise-grade UI components across React, Next.js, Vue, Angular, Svelte, Electron, and React Native using the Xala UI System v5.0 semantic architecture.

**🏗️ MAJOR in v6.5.0: Architecture Compliance Overhaul** - Complete rewrite of `init_project` tool to follow documented architecture, full integration with UI Compliance Engine and Service Registry, three operational modes (analyze/dry-run/enhance), and comprehensive validation of architectural compliance.

**🚀 Enhanced in v6.4.1: Project Analysis** - Fully functional project analysis capabilities for `init_project` tool, optimized response size, comprehensive testing suite, and improved error handling.

**🏗️ MAJOR in v6.4.0: Streamlined MCP Architecture** - Major refactoring from monolithic 77KB index.ts to modular SOLID architecture with 6 core tools, improved `init_project` tool using official CLI tools, and enhanced maintainability.

**100% CLI Template Alignment** - This MCP server uses the exact same templates as the Xala UI System CLI, ensuring complete consistency across all generation methods.

## Features

### 🏗️ Architecture Compliance Overhaul (v6.5.0)
- **🏗️ Documented Architecture** - Complete rewrite to follow documented UI Compliance Engine and Service Registry patterns
- **🔧 UI Compliance Integration** - Automatic scanning and fixing of UI compliance violations (Xala UI System v5 rules)
- **⚙️ Service Registry Integration** - Uses existing service bundles (saas-starter, minimal) and BundleResolver architecture
- **🎛️ Three Operational Modes** - Analysis mode, dry-run mode, and full enhancement mode
- **✅ Zero Custom Workarounds** - Removed all custom generators in favor of documented architecture integration
- **🧪 Comprehensive Validation** - Fully tested integration with xala-ui-mcp server and all 10 tools

### 🔍 Enhanced Project Analysis (v6.4.1)
- **🔄 Dual Mode** - Single `init_project` tool supports both project creation and analysis
- **📊 Framework Detection** - Automatic detection of frameworks like Next.js, React, Vue
- **📦 Package Analysis** - Identifies package manager and installed dependencies
- **🧰 Feature Detection** - Detects key features like Tailwind CSS, i18n, UI libraries
- **💡 Smart Recommendations** - Contextual next steps based on project state
- **🎯 Optimized Response Size** - Well within MCP token limits (< 2KB per call)
- **⚠️ Robust Error Handling** - Clear error messages for invalid paths or parameters

### ✨ Streamlined MCP Architecture (v6.4.0)
- **🧠 Intelligent Guidance** - AI-powered prompts provide structured, step-by-step implementation guidance
- **🎯 Context-Aware Recommendations** - Platform-specific optimizations and best practices
- **📋 Comprehensive Instructions** - Detailed implementation steps with examples and testing suggestions
- **🔧 Tool-Integrated Prompts** - Enhanced prompts directly integrated into all 10 practical MCP tools
- **🌍 Multi-Platform Support** - Specialized guidance for React, Svelte, Vue, Angular, Next.js
- **♿ Accessibility First** - WCAG 2.1 AA compliance recommendations built-in
- **🇳🇴 Norwegian Compliance** - Regulatory compliance validation and guidance

### 🚀 Enhanced Developer Experience (v6.1+ Updates)
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

## 🧠 Enhanced Prompts Integration

### What Are Enhanced Prompts?

Enhanced Prompts are AI-powered guidance systems that provide structured, context-aware instructions for better development results. They're directly integrated into all MCP tools to deliver:

- **Structured Implementation Guidance** - Step-by-step instructions with clear requirements
- **Context-Aware Recommendations** - Platform-specific optimizations and best practices
- **Comprehensive Examples** - Usage patterns, testing suggestions, and performance tips
- **Accessibility Integration** - WCAG 2.1 AA compliance recommendations
- **Norwegian Compliance** - Regulatory validation and guidance

### 🎯 Enhanced Prompt Templates

#### 1. `get-components-enhanced`
**Purpose**: Intelligent component retrieval with contextual recommendations

```typescript
// Example usage in tool handler
const enhancedPrompt = promptTemplate.handler({
  componentName: 'Button',
  platform: 'react',
  category: 'form',
  useCase: 'form submission',
  designStyle: 'modern'
});
```

**Provides**:
- Component analysis and variant recommendations
- Platform-specific implementation guidance
- Design system integration tips
- Accessibility and performance considerations

#### 2. `generate-component-enhanced`
**Purpose**: Sophisticated component generation with design system principles

```typescript
const enhancedPrompt = promptTemplate.handler({
  componentName: 'DataTable',
  platform: 'react',
  description: 'Advanced data table with sorting and filtering',
  baseComponents: 'Table,Button,Input',
  features: 'sorting,filtering,pagination',
  designStyle: 'enterprise',
  accessibility: 'WCAG 2.1 AA'
});
```

**Provides**:
- Component architecture planning
- TypeScript integration guidance
- Testing and documentation suggestions
- Performance optimization patterns

#### 3. `generate-page-enhanced`
**Purpose**: Complete page creation with architectural considerations

```typescript
const enhancedPrompt = promptTemplate.handler({
  pageName: 'UserDashboard',
  pageType: 'dashboard',
  platform: 'nextjs',
  layout: 'sidebar',
  features: 'analytics,charts,notifications',
  dataRequirements: 'user analytics data'
});
```

**Provides**:
- Page architecture planning
- Layout and navigation patterns
- Data management strategies
- SEO and performance optimization

#### 4. `compliance-validation-enhanced`
**Purpose**: Comprehensive compliance validation with detailed recommendations

```typescript
const enhancedPrompt = promptTemplate.handler({
  code: 'const UserForm = ({ onSubmit }) => { /* form */ }',
  complianceType: 'norwegian',
  platform: 'react',
  strictMode: true,
  context: 'user data collection'
});
```

**Provides**:
- Norwegian regulatory compliance (NSM, GDPR)
- Accessibility standards validation
- Security best practices assessment
- Remediation recommendations

#### 5. `code-analysis-enhanced`
**Purpose**: Deep code analysis with performance, security, and maintainability insights

```typescript
const enhancedPrompt = promptTemplate.handler({
  code: 'const Component = () => { /* code */ }',
  platform: 'react',
  analysisType: 'performance',
  context: 'production application'
});
```

**Provides**:
- Multi-dimensional code analysis
- Platform-specific optimization recommendations
- Security vulnerability assessment
- Maintainability scoring and suggestions

#### 6. `project-initialization-enhanced`
**Purpose**: Enterprise-grade project setup with best practices

```typescript
const enhancedPrompt = promptTemplate.handler({
  projectName: 'enterprise-dashboard',
  projectType: 'web-app',
  platform: 'nextjs',
  features: 'typescript,testing,linting,ci-cd',
  architecture: 'microservices'
});
```

**Provides**:
- Project architecture planning
- Development environment setup
- CI/CD pipeline configuration
- Quality assurance integration

### 🔗 How Enhanced Prompts Connect to Tools

Every MCP tool handler integrates enhanced prompts:

```typescript
// Example from CoreToolHandlers.ts
async handleGetComponents(args: GetComponentsArgs): Promise<MCPToolResult> {
  // 1. Generate enhanced prompt
  const promptTemplate = practicalToolPrompts['get-components-enhanced'];
  const enhancedPrompt = promptTemplate.handler({
    componentName: args.name,
    platform: args.platform,
    category: args.category,
    useCase: 'component-retrieval',
    designStyle: 'modern'
  });
  
  // 2. Use prompt context for enhanced retrieval
  const components = await this.retrieveComponentsEnhanced(
    args.name, args.platform, args.category, args.variant, enhancedPrompt
  );

  // 3. Return enhanced results with guidance
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        components,
        guidance: enhancedPrompt.messages[0]?.content?.text,
        recommendations: this.generateComponentRecommendations(components, args)
      }, null, 2)
    }]
  };
}
```

### 🎯 Benefits of Enhanced Prompts

#### For Developers
- **Clear Implementation Steps** - No more guessing how to implement features
- **Best Practices Built-in** - Industry standards and platform-specific optimizations
- **Comprehensive Guidance** - From planning to testing and deployment
- **Accessibility First** - WCAG 2.1 AA compliance recommendations

#### For Teams
- **Consistent Quality** - Standardized guidance across all tools
- **Knowledge Sharing** - Best practices embedded in tool responses
- **Faster Onboarding** - New team members get expert-level guidance
- **Compliance Assurance** - Norwegian regulatory requirements built-in

#### For Projects
- **Better Architecture** - Structured planning and implementation guidance
- **Performance Optimization** - Platform-specific performance recommendations
- **Security Integration** - Security best practices in every response
- **Future-Ready Code** - Extensible patterns and maintainable structures

### 🧪 Testing Enhanced Prompts

Run the enhanced prompts test suite:

```bash
node test-enhanced-prompts.js
```

This validates:
- ✅ All 6 enhanced prompt templates
- ✅ Context-aware recommendation generation
- ✅ Platform-specific optimizations
- ✅ Integration patterns and error handling

## Installation

### From GitHub Packages

```bash
# Configure GitHub Packages registry
echo "@xala-technologies:registry=https://npm.pkg.github.com/" > .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> .npmrc

# Install the package
npm install @xala-technologies/xala-mcp@6.1.10
# or with bun
bun add @xala-technologies/xala-mcp@6.1.10
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
- **🧠 Enhanced Prompts Integration**: AI-driven guidance with structured implementation instructions
- **Quick Generate**: One-command component creation with smart presets
- **Component Library**: Browse, search, and inspect 191+ templates like shadcn/ui
- **Intelligent Caching**: Fast template loading with automatic invalidation
- **Enhanced Validation**: Detailed error messages with actionable suggestions
- **Context-Aware Recommendations**: Platform-specific optimizations and best practices

### 🎨 **Enterprise Features**
- **Norwegian Compliance**: BankID, Altinn, Vipps, and municipal integrations
- **Industry Themes**: Finance, healthcare, education, e-commerce
- **Accessibility**: WCAG AAA compliance out of the box
- **Localization**: Built-in support for English, Norwegian, French, Arabic

## 🛠️ MCP Tools Available

> **🧠 All tools now include Enhanced Prompts Integration for better AI guidance and results!**

### ✨ Enhanced Practical Tools (v6.4.0)

All 10 practical MCP tools now feature integrated enhanced prompts that provide:
- 📋 **Structured Implementation Guidance** - Step-by-step instructions
- 🎯 **Context-Aware Recommendations** - Platform-specific optimizations
- 🔧 **Best Practices Integration** - Industry standards built-in
- ♿ **Accessibility Compliance** - WCAG 2.1 AA recommendations
- 🇳🇴 **Norwegian Compliance** - Regulatory validation

#### 1. `get_components` (Enhanced)
**Retrieve UI components with intelligent recommendations**

```json
{
  "name": "Button",
  "platform": "react",
  "category": "form",
  "variant": "primary"
}
```

**Enhanced Features**:
- Component analysis and variant recommendations
- Platform-specific implementation guidance
- Design system integration tips
- Accessibility and performance considerations

#### 2. `get_blocks` (Enhanced)
**Retrieve UI blocks and layouts with architectural guidance**

```json
{
  "name": "dashboard-layout",
  "platform": "nextjs",
  "category": "layout"
}
```

**Enhanced Features**:
- Layout pattern recommendations
- Responsive design guidance
- Component composition suggestions

#### 3. `get_rules` (Enhanced)
**Access design system rules with compliance validation**

```json
{
  "category": "accessibility",
  "platform": "react",
  "compliance": "norwegian"
}
```

**Enhanced Features**:
- Regulatory compliance validation
- Best practices enforcement
- Platform-specific rule adaptation

#### 4. `generate_component` (Enhanced)
**Generate sophisticated components with design system principles**

```json
{
  "name": "DataTable",
  "platform": "react",
  "description": "Advanced data table with sorting and filtering",
  "baseComponents": ["Table", "Button", "Input"],
  "features": ["sorting", "filtering", "pagination"]
}
```

**Enhanced Features**:
- Component architecture planning
- TypeScript integration guidance
- Testing and documentation suggestions
- Performance optimization patterns

#### 5. `generate_page` (Enhanced)
**Create complete pages with architectural considerations**

```json
{
  "name": "UserDashboard",
  "platform": "nextjs",
  "description": "User analytics dashboard",
  "layout": "sidebar",
  "components": ["charts", "tables", "notifications"]
}
```

**Enhanced Features**:
- Page architecture planning
- Layout and navigation patterns
- Data management strategies
- SEO and performance optimization

#### 6. `norwegian_compliance` (Enhanced)
**Validate Norwegian regulatory compliance with detailed recommendations**

```json
{
  "code": "const UserForm = ({ onSubmit }) => { /* form */ }",
  "platform": "react",
  "type": "data-collection",
  "strictMode": true
}
```

**Enhanced Features**:
- NSM security classification compliance
- GDPR data protection validation
- Accessibility standards assessment
- Remediation recommendations

#### 7. `gdpr_compliance` (Enhanced)
**GDPR compliance validation with privacy-by-design guidance**

```json
{
  "code": "const DataProcessor = () => { /* component */ }",
  "platform": "react",
  "dataTypes": ["personal", "sensitive"]
}
```

**Enhanced Features**:
- Data minimization validation
- Consent management guidance
- Privacy-by-design recommendations

#### 8. `transform_code` (Enhanced)
**Transform code between platforms with convention enforcement**

```json
{
  "code": "const Component = () => { /* React code */ }",
  "fromPlatform": "react",
  "toPlatform": "svelte",
  "conventions": ["design-tokens", "accessibility"]
}
```

**Enhanced Features**:
- Platform-specific transformation patterns
- Convention enforcement guidance
- Migration best practices

#### 9. `analyse_code` (Enhanced)
**Deep code analysis with performance, security, and maintainability insights**

```json
{
  "code": "const Dashboard = () => { /* complex component */ }",
  "platform": "react",
  "analysisType": "performance",
  "detailLevel": "comprehensive"
}
```

**Enhanced Features**:
- Multi-dimensional analysis (performance, security, accessibility)
- Platform-specific optimization recommendations
- Actionable improvement suggestions
- Maintainability scoring

#### 10. `init_project` (Enhanced)
**Initialize enterprise-grade projects with best practices**

```json
{
  "name": "enterprise-dashboard",
  "platform": "nextjs",
  "type": "web-app",
  "features": ["typescript", "testing", "linting", "ci-cd"],
  "templateStyle": "enterprise"
}
```

**Enhanced Features**:
- Project architecture planning
- Development environment setup
- CI/CD pipeline configuration
- Quality assurance integration

### 🚀 Legacy Quick Generate Tools

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
        "@xala-technologies/xala-mcp@6.1.10"
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
      "args": ["@xala-technologies/xala-mcp@6.1.10"],
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
  "args": ["@xala-technologies/xala-mcp@6.1.10"],
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
      "args": ["@xala-technologies/xala-mcp@6.1.10"],
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
   - **Args**: `@xala-technologies/xala-mcp@6.1.10`
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
import { ComponentGenerator } from '@xala-technologies/xala-mcp';

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

| Feature | Xala MCP v6.1 | shadcn/ui MCP | Advantage |
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

## 🧠 Testing Enhanced Prompts Integration

### Quick Test Script

Run the dedicated test script to validate enhanced prompts functionality:

```bash
# Test all enhanced prompt templates
node test-enhanced-prompts.js
```

**Expected Output:**
```
🚀 Testing Enhanced Prompts Integration...

✅ get-components-enhanced: Generated comprehensive component retrieval prompt
✅ generate-component-enhanced: Generated sophisticated component generation prompt
✅ generate-page-enhanced: Generated complete page creation prompt
✅ compliance-validation-enhanced: Generated comprehensive compliance validation prompt
✅ code-analysis-enhanced: Generated deep code analysis prompt
✅ project-initialization-enhanced: Generated enterprise-grade project setup prompt

🎉 All enhanced prompts working correctly!
```

### Interactive Testing with AI Agents

#### Test Component Retrieval with Enhanced Prompts
```
"Use the get_components tool to retrieve Button components for React with enhanced guidance"
```

**Expected Enhanced Response:**
- 📋 Structured implementation guidance
- 🎯 Platform-specific React optimizations
- 🔧 Design system integration recommendations
- ♿ Accessibility compliance suggestions
- 🔍 Usage examples and testing patterns

#### Test Component Generation with Enhanced Prompts
```
"Use the generate_component tool to create a DataTable component for Next.js with enhanced guidance"
```

**Expected Enhanced Response:**
- 🏠 Component architecture planning
- 📝 TypeScript integration guidance
- 🧪 Testing and documentation suggestions
- ⚡ Performance optimization patterns
- 🔄 Integration with existing components

#### Test Compliance Validation with Enhanced Prompts
```
"Use the norwegian_compliance tool to validate a form component with enhanced recommendations"
```

**Expected Enhanced Response:**
- 🇳🇴 NSM security classification compliance
- 🔒 GDPR data protection validation
- ♿ Accessibility standards assessment
- 🔧 Detailed remediation recommendations
- 📊 Compliance scoring and next steps

### Validation Checklist

**✅ Enhanced Prompts Features:**
- [ ] All 6 enhanced prompt templates generate successfully
- [ ] Prompts provide structured, step-by-step guidance
- [ ] Platform-specific optimizations are included
- [ ] Accessibility recommendations are present
- [ ] Norwegian compliance guidance is provided
- [ ] Integration patterns and examples are included
- [ ] Error handling recommendations are present

**✅ Tool Integration:**
- [ ] Enhanced prompts integrate with all 10 practical tools
- [ ] Prompt generation works for all supported platforms
- [ ] Context-aware recommendations are generated
- [ ] Usage examples and testing suggestions are provided
- [ ] Tool responses include enhanced guidance

**✅ Developer Experience:**
- [ ] Prompts reduce guesswork and provide clear direction
- [ ] Implementation guidance is actionable and specific
- [ ] Best practices are embedded in prompt responses
- [ ] Platform conventions are properly addressed
- [ ] Compliance requirements are clearly explained

### Troubleshooting Enhanced Prompts

**❌ "Enhanced prompt template not found"**
```bash
# Solution: Verify prompt templates are properly loaded
node -e "console.log(Object.keys(require('./dist/prompts/PracticalToolPrompts.js').practicalToolPrompts))"
```

**❌ "Prompt generation fails"**
```bash
# Solution: Check prompt handler function syntax
node test-enhanced-prompts.js --verbose
```

**❌ "Missing context in prompt responses"**
- Verify PromptIntegration utility is properly imported
- Check that enhanced prompt arguments are correctly passed
- Ensure platform-specific optimizations are enabled

### Performance Validation

**Enhanced Prompts Benchmarks:**
- Prompt generation: < 50ms per template
- Context enhancement: < 100ms per tool call
- Memory usage: < 10MB additional overhead
- Template compilation: < 200ms initial load

**Load Testing:**
```bash
# Test rapid prompt generation
for i in {1..10}; do node test-enhanced-prompts.js; done
```

## 📋 Changelog

### v6.4.0 (2025-08-05)

**🏗️ Major Architecture Refactoring:**
- **Modular SOLID Architecture**: Refactored from monolithic 77KB `index.ts` to modular architecture following SOLID principles
- **Reduced Tool Count**: Streamlined from 51 tools to 6 core tools for better maintainability
- **Enhanced `init_project` Tool**: Replaced oversized `create_project` with efficient `init_project` using official CLI tools (create-next-app, etc.)
- **Response Size Optimization**: Reduced MCP response size from 25,000+ tokens to 200-800 tokens (99% reduction)
- **File Size Reduction**: Reduced main index from 77KB to ~300 bytes entry point

**🔧 Technical Improvements:**
- **SOLID Principles Implementation**: Single Responsibility, Open/Closed, Dependency Injection patterns
- **Modular Structure**: Separated concerns into dedicated modules (`XalaUISystemServer.ts`, `CoreToolHandlers.ts`, `CoreTools.ts`)
- **Enhanced Type Safety**: Improved TypeScript compliance with explicit return types
- **Build Optimization**: Bypassed licensing build issues for stable compilation
- **Project Initializer**: New `ProjectInitializer` utility class for CLI-based project creation

**🚀 Core Tools (6 Total):**
1. `generate` - Unified generation for components, layouts, forms, pages, navigation, tables, projects
2. `get_template` - Template retrieval with filtering capabilities
3. `validate` - Comprehensive validation including Norwegian compliance
4. `recommend` - Platform and technology recommendations
5. `transform` - Code transformation between platforms
6. `get_block` - Pre-built UI blocks (shadcn-style)

**📦 Dependency Updates:**
- Enhanced MCP SDK integration
- Improved CLI tool integration
- Optimized template compilation
- Better error handling and validation

### v6.3.0 (Previous)
- Enhanced Prompts Integration
- Revolutionary prompt-driven AI guidance system
- Structured, context-aware recommendations

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
- GitHub Issues: [xala-mcp/issues](https://github.com/xala-technologies/xala-mcp)
- Documentation: [docs.xala.tech](https://docs.xala.tech)
- CLI Repository: [xala-cli](https://github.com/xala-technologies/xala-cli)