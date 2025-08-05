# MCP Server - Getting Started

## 🚀 Quick Setup Guide

The Xala UI System MCP Server enables AI agents to understand, generate, and validate code using the Universal Design System v5.0.

## 📦 Installation

### Method 1: NPM Package (Recommended)
```bash
npm install -g @xala-technologies/ui-system-mcp
```

### Method 2: Direct Integration
```bash
npx @xala-technologies/ui-system-mcp
```

### Method 3: Development Setup
```bash
git clone https://github.com/xala-technologies/ui-system
cd ui-system/mcp-servers/xala-ui-system-mcp
npm install
npm run build
npm link
```

## ⚙️ Configuration

### Basic MCP Server Configuration
Add to your `mcp-servers.json` configuration:

```json
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "npx",
      "args": ["@xala-technologies/ui-system-mcp"],
      "env": {
        "DESIGN_SYSTEM_VERSION": "5.0.0",
        "TARGET_PLATFORMS": "react,vue,angular,flutter,ios,android",
        "AI_OPTIMIZATION_LEVEL": "high",
        "NORWEGIAN_COMPLIANCE": "true",
        "ACCESSIBILITY_LEVEL": "WCAG_2_2_AAA"
      }
    }
  }
}
```

### Advanced Configuration Options
```json
{
  "mcpServers": {
    "xala-ui-system": {
      "command": "npx",
      "args": ["@xala-technologies/ui-system-mcp"],
      "env": {
        "DESIGN_SYSTEM_VERSION": "5.0.0",
        "TARGET_PLATFORMS": "react,vue,angular,flutter,ios,android",
        "AI_OPTIMIZATION_LEVEL": "high",
        "NORWEGIAN_COMPLIANCE": "true",
        "ACCESSIBILITY_LEVEL": "WCAG_2_2_AAA",
        "THEME_SUPPORT": "multi-theme",
        "SSR_COMPATIBILITY": "true",
        "PERFORMANCE_MODE": "production",
        "LOCALIZATION": "nb-NO,en-US,fr-FR,ar-SA",
        "ENTERPRISE_FEATURES": "true"
      }
    }
  }
}
```

## 🔧 Environment Variables

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `DESIGN_SYSTEM_VERSION` | Design system version | `5.0.0` | `5.0.0`, `latest` |
| `TARGET_PLATFORMS` | Supported platforms | `react,vue,angular` | comma-separated list |
| `AI_OPTIMIZATION_LEVEL` | AI processing level | `medium` | `low`, `medium`, `high` |
| `NORWEGIAN_COMPLIANCE` | Enable NSM compliance | `false` | `true`, `false` |
| `ACCESSIBILITY_LEVEL` | Accessibility standard | `WCAG_2_1_AA` | `WCAG_2_1_AA`, `WCAG_2_2_AAA` |
| `THEME_SUPPORT` | Theme system | `single-theme` | `single-theme`, `multi-theme` |
| `SSR_COMPATIBILITY` | SSR support | `true` | `true`, `false` |
| `PERFORMANCE_MODE` | Optimization mode | `development` | `development`, `production` |
| `LOCALIZATION` | Language support | `en-US` | comma-separated locale codes |
| `ENTERPRISE_FEATURES` | Advanced features | `false` | `true`, `false` |

## 🎯 First Steps

### 1. Verify Installation
Test your MCP server installation:

```typescript
// Basic connection test
const serverInfo = await mcp.call('get_server_info');
console.log('Server version:', serverInfo.version);
console.log('Available tools:', serverInfo.tools);
```

### 2. Get Component Specification
Retrieve detailed information about any component:

```typescript
const buttonSpec = await mcp.call('get_component_specification', {
  componentName: 'Button',
  includeExamples: true,
  includeAITips: true
});

console.log('Button variants:', buttonSpec.variants);
console.log('Required props:', buttonSpec.requiredProps);
console.log('AI recommendations:', buttonSpec.aiTips);
```

### 3. Generate Your First Component
Create platform-specific code:

```typescript
// Generate React Button
const reactButton = await mcp.call('generate_platform_code', {
  componentName: 'Button',
  platform: 'react',
  props: {
    variant: 'primary',
    size: 'lg',
    children: 'Get Started'
  },
  includeTypes: true
});

console.log('Generated React code:', reactButton.code);
console.log('TypeScript types:', reactButton.types);
console.log('Import statements:', reactButton.imports);
```

### 4. Create Layout Patterns
Generate complete layouts:

```typescript
// Generate dashboard layout
const dashboard = await mcp.call('get_layout_patterns', {
  pattern: 'dashboard',
  platform: 'react',
  responsive: true,
  components: ['Container', 'Stack', 'Card', 'Button']
});

console.log('Dashboard layout:', dashboard.structure);
console.log('Component usage:', dashboard.components);
```

## 🔍 Available MCP Tools Overview

| Tool Name | Purpose | Use Case |
|-----------|---------|----------|
| `get_component_specification` | Get component details | Understanding component APIs |
| `generate_platform_code` | Generate platform code | Creating components |
| `get_layout_patterns` | Retrieve layouts | Building page structures |
| `transform_design_tokens` | Convert tokens | Theming and styling |
| `get_ai_recommendations` | Get AI suggestions | Optimizing component usage |
| `validate_code` | Validate generated code | Quality assurance |
| `migrate_code` | Platform migration | Cross-platform development |
| `get_accessibility_info` | WCAG compliance | Accessibility validation |
| `get_performance_metrics` | Performance data | Optimization insights |

## 🎨 Component Categories

The MCP server provides access to these component categories:

### Layout Components
- `Container` - Responsive layout wrapper
- `Stack` - Flexible layout container
- `Grid` - CSS Grid system
- `Card` - Content container

### Form Components
- `Input` - Text input with validation
- `Select` - Dropdown selection
- `Checkbox` - Boolean input
- `Radio` - Single choice selection
- `Textarea` - Multi-line text input
- `Button` - Action trigger

### Data Display
- `DataTable` - Advanced data grids
- `Badge` - Status indicators
- `Avatar` - User representations
- `Tooltip` - Contextual information

### Navigation
- `WebNavbar` - Website navigation
- `Breadcrumb` - Hierarchical navigation
- `Pagination` - Content pagination
- `Sidebar` - Side navigation

### Feedback
- `Alert` - Status messages
- `Toast` - Temporary notifications
- `Modal` - Dialog overlays
- `Progress` - Loading indicators

## 🌍 Norwegian Compliance Features

When `NORWEGIAN_COMPLIANCE=true`:

### NSM Security Classifications
```typescript
const secureComponent = await mcp.call('generate_platform_code', {
  componentName: 'DataTable',
  platform: 'react',
  compliance: {
    nsmClassification: 'KONFIDENSIELT',
    auditTrail: true,
    dataRetention: '7-years'
  }
});
```

### GDPR Compliance
```typescript
const gdprForm = await mcp.call('generate_platform_code', {
  componentName: 'Form',
  platform: 'react',
  compliance: {
    gdprCompliant: true,
    consentManagement: true,
    dataSubjectRights: true
  }
});
```

### WCAG 2.2 AAA Accessibility
```typescript
const accessibleButton = await mcp.call('generate_platform_code', {
  componentName: 'Button',
  platform: 'react',
  accessibility: {
    level: 'WCAG_2_2_AAA',
    screenReader: true,
    keyboardNavigation: true,
    focusManagement: true
  }
});
```

## 🚨 Troubleshooting

### Common Issues

#### MCP Server Not Found
```bash
# Verify installation
npm list -g @xala-technologies/ui-system-mcp

# Reinstall if necessary
npm uninstall -g @xala-technologies/ui-system-mcp
npm install -g @xala-technologies/ui-system-mcp
```

#### Environment Variables Not Working
```bash
# Check environment variables
echo $DESIGN_SYSTEM_VERSION
echo $TARGET_PLATFORMS

# Set manually if needed
export DESIGN_SYSTEM_VERSION="5.0.0"
export TARGET_PLATFORMS="react,vue,angular"
```

#### Platform Not Supported
```typescript
// Check available platforms
const platforms = await mcp.call('get_supported_platforms');
console.log('Supported platforms:', platforms);
```

#### Component Not Found
```typescript
// List all available components
const components = await mcp.call('get_component_list');
console.log('Available components:', components);
```

### Debug Mode
Enable debug logging:

```json
{
  "env": {
    "DEBUG": "true",
    "LOG_LEVEL": "debug"
  }
}
```

## 📚 Next Steps

1. **[API Reference](./api-reference.md)** - Complete tool documentation
2. **[AI Integration Guide](./ai-integration.md)** - Advanced AI workflows
3. **[Component Specifications](./specifications/)** - Detailed component specs
4. **[Code Generation](./code-generation/)** - Platform-specific guides

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/xala-technologies/ui-system/issues)
- **Discussions**: [GitHub Discussions](https://github.com/xala-technologies/ui-system/discussions)
- **Documentation**: [Full Documentation](../README.md)

---

*MCP Server Getting Started Guide v2.0*