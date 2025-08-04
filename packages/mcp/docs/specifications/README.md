# Xala UI Component Specification System

[![Version](https://img.shields.io/badge/version-v5.0.0-blue.svg)](./schema-reference.md)
[![WCAG](https://img.shields.io/badge/WCAG-AAA-green.svg)](./guides/accessibility.md)
[![Norwegian Compliance](https://img.shields.io/badge/NSM-Compliant-red.svg)](./guides/norwegian-compliance.md)

## Overview

The Xala UI Component Specification System is a comprehensive JSON-based architecture for defining, generating, and maintaining UI components across multiple platforms. This system enables:

- **AI-Powered Generation**: Specifications optimized for AI code generation
- **Multi-Platform Support**: React, Vue, Angular, Svelte, Solid, Web Components
- **Norwegian Compliance**: NSM security classifications, GDPR compliance, and WCAG AAA accessibility
- **Enterprise Standards**: Type safety, testing requirements, and performance metrics
- **Version Management**: Semantic versioning with migration paths

## Quick Start

```bash
# Install the specification system
npm install @xala-technologies/ui-system-mcp

# Generate a component from specification
npx xala-ui generate --spec ./specs/Button.json --platform react

# Validate specifications
npx xala-ui validate --schema v5.0

# Generate documentation
npx xala-ui docs generate --output ./docs/components
```

## Architecture

### Component Categories

The system organizes components into 9 categories:

| Category | Description | Examples |
|----------|-------------|----------|
| **basic** | Fundamental UI elements | Button, Input, Text, Icon |
| **composite** | Multi-element components | Card, Modal, Dropdown |
| **layout** | Structure and positioning | Grid, Stack, Container |
| **navigation** | User navigation | Navbar, Breadcrumb, Pagination |
| **feedback** | User feedback | Alert, Toast, Progress |
| **overlay** | Layered UI elements | Modal, Tooltip, Popover |
| **form** | Form controls | FormField, Checkbox, Radio |
| **data-display** | Data presentation | Table, List, DataGrid |
| **specialized** | Domain-specific | Chart, Calendar, Editor |

### Specification Structure

Each component specification includes:

```json
{
  "metadata": {
    "name": "ComponentName",
    "version": "1.0.0",
    "category": "basic",
    "description": "Component description"
  },
  "compliance": {
    "wcag": { "level": "AAA" },
    "norwegian": { "nsmClassification": "OPEN" },
    "i18n": { "supportedLocales": ["nb-NO", "en-US"] }
  },
  "props": {
    "schema": { /* TypeScript-style prop definitions */ },
    "groups": { /* Required/optional prop organization */ }
  },
  "accessibility": {
    "role": { "primary": "button" },
    "keyboardNavigation": { /* ARIA patterns */ },
    "screenReader": { /* Announcements and labels */ }
  },
  "platforms": {
    "supported": ["react", "vue", "angular"],
    "implementations": { /* Platform-specific code */ }
  }
}
```

## Documentation Structure

```
docs/specifications/
├── README.md                  # This overview
├── getting-started.md         # Setup and first steps
├── schema-reference.md        # Complete schema documentation
├── components/                # Component documentation
│   ├── basic/                # Basic components
│   ├── composite/            # Composite components
│   ├── layout/               # Layout components
│   ├── navigation/           # Navigation components
│   ├── feedback/             # Feedback components
│   ├── overlay/              # Overlay components
│   ├── form/                 # Form components
│   ├── data-display/         # Data display components
│   └── specialized/          # Specialized components
├── guides/                   # Implementation guides
│   ├── ai-usage.md          # AI generation guide
│   ├── validation.md        # Specification validation
│   ├── migration.md         # Version migration
│   ├── accessibility.md     # WCAG compliance
│   ├── norwegian-compliance.md # NSM and GDPR
│   └── platform-support.md # Multi-platform development
└── api/                     # API documentation
    └── specification-api.md # Programmatic API reference
```

## Key Features

### 🤖 AI-Optimized

- **Generation Hints**: Patterns and anti-patterns for AI code generation
- **Complexity Scoring**: Token estimation and priority levels
- **Template Integration**: Pre-built templates for common patterns
- **Validation Rules**: Automated quality checks

### 🌍 Multi-Platform

- **Unified Specifications**: Single source of truth for all platforms
- **Platform-Specific Templates**: Optimized code generation per framework
- **Dependency Management**: Automatic dependency resolution
- **Migration Tools**: Cross-platform component migration

### 🇳🇴 Norwegian Compliance

- **NSM Classifications**: OPEN, RESTRICTED, CONFIDENTIAL, SECRET
- **GDPR Compliance**: Privacy-by-design patterns
- **WCAG AAA**: Comprehensive accessibility support
- **Audit Trails**: Compliance tracking and reporting

### 🔒 Enterprise Standards

- **Type Safety**: Zero-tolerance for `any` types
- **Performance Metrics**: Bundle size and render time requirements
- **Testing Requirements**: 95%+ coverage standards
- **Security Patterns**: Object injection prevention

## Getting Started

1. **[Setup Guide](./getting-started.md)** - Installation and configuration
2. **[Schema Reference](./schema-reference.md)** - Complete specification format
3. **[Component Examples](./components/)** - Browse component documentation
4. **[AI Usage Guide](./guides/ai-usage.md)** - AI-powered development
5. **[Migration Guide](./guides/migration.md)** - Version upgrades

## Component Examples

### Basic Button Component

```json
{
  "metadata": {
    "name": "Button",
    "version": "1.0.0",
    "category": "basic",
    "description": "Primary action button with multiple variants"
  },
  "props": {
    "schema": {
      "variant": {
        "type": "string",
        "enum": ["primary", "secondary", "outline", "ghost"],
        "default": "primary"
      },
      "size": {
        "type": "string", 
        "enum": ["sm", "md", "lg"],
        "default": "md"
      },
      "disabled": {
        "type": "boolean",
        "default": false
      }
    }
  },
  "accessibility": {
    "role": { "primary": "button" },
    "keyboardNavigation": {
      "supported": true,
      "patterns": [
        { "key": "Enter", "action": "activate" },
        { "key": "Space", "action": "activate" }
      ]
    }
  }
}
```

### Usage across platforms:

```tsx
// React
<Button variant="primary" size="lg" onClick={handleClick}>
  Submit
</Button>

// Vue
<Button variant="primary" size="lg" @click="handleClick">
  Submit
</Button>

// Angular
<xala-button variant="primary" size="lg" (click)="handleClick()">
  Submit
</xala-button>
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| **v5.0.0** | 2024-01 | Initial comprehensive specification system |
| **v5.1.0** | 2024-03 | Enhanced AI optimization features |
| **v5.2.0** | 2024-06 | Norwegian compliance enhancements |

## Contributing

1. **Specification Changes**: Follow the [schema validation](./guides/validation.md) process
2. **Documentation Updates**: Use the provided [templates](./templates/)
3. **Platform Support**: Add new platform implementations via [platform guide](./guides/platform-support.md)
4. **Compliance**: Ensure all changes meet [Norwegian compliance](./guides/norwegian-compliance.md) requirements

## Resources

- **[Component Gallery](https://xala-ui.dev/components)** - Live component examples
- **[Design System](https://xala-ui.dev/design)** - Norwegian design tokens
- **[API Reference](./api/specification-api.md)** - Programmatic access
- **[GitHub Repository](https://github.com/xala-technologies/ui-system)** - Source code
- **[Support](mailto:support@xala-technologies.com)** - Technical support

---

*This documentation is automatically generated from component specifications and maintained by the Xala UI System.*