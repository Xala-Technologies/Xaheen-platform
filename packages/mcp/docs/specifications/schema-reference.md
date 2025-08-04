# Component Specification Schema Reference

This document provides a comprehensive reference for the Xala UI Component Specification Schema v5.0.0. The schema defines the structure and validation rules for component specifications.

## Table of Contents

- [Schema Overview](#schema-overview)
- [Root Properties](#root-properties)
- [Metadata](#metadata)
- [Compliance](#compliance)
- [Props](#props)
- [Variants](#variants)
- [Accessibility](#accessibility)
- [Platforms](#platforms)
- [Examples](#examples)
- [AI Optimization](#ai-optimization)
- [Testing](#testing)
- [Performance](#performance)
- [Schema Definitions](#schema-definitions)
- [Validation Rules](#validation-rules)

## Schema Overview

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://xala-technologies.com/schemas/ui-component/v5.0.0",
  "title": "Xala UI Component Specification Schema v5.0",
  "version": "5.0.0"
}
```

**Schema URL**: `https://xala-technologies.com/schemas/ui-component/v5.0.0`  
**JSON Schema Version**: Draft 07  
**Current Version**: 5.0.0  

## Root Properties

Every component specification must include these top-level properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `metadata` | object | ✅ | Component identification and versioning |
| `compliance` | object | ✅ | Norwegian and accessibility compliance |
| `props` | object | ✅ | Component properties definition |
| `accessibility` | object | ✅ | Accessibility implementation details |
| `platforms` | object | ✅ | Platform support and implementations |
| `variants` | object | ❌ | Component styling variants |
| `examples` | array | ❌ | Usage examples |
| `ai` | object | ❌ | AI optimization metadata |
| `testing` | object | ❌ | Testing requirements |
| `performance` | object | ❌ | Performance metrics and requirements |

## Metadata

Component identification, versioning, and maintenance information.

### Required Properties

```json
{
  "metadata": {
    "name": "ComponentName",           // PascalCase component name
    "version": "1.0.0",              // Semantic version
    "semanticVersion": "v5.0",       // Xala semantic architecture version
    "category": "basic",             // Component category
    "description": "Component description..."  // 10-500 characters
  }
}
```

### Complete Metadata Schema

| Property | Type | Required | Validation | Description |
|----------|------|----------|------------|-------------|
| `name` | string | ✅ | `^[A-Z][a-zA-Z0-9]*$` | PascalCase component name |
| `version` | string | ✅ | Semantic version pattern | Component version |
| `semanticVersion` | string | ✅ | `v5.0`, `v5.1`, `v5.2` | Xala architecture version |
| `category` | string | ✅ | See [categories](#component-categories) | Component category |
| `subcategory` | string | ❌ | - | Optional subcategory |
| `description` | string | ✅ | 10-500 chars | Component description |
| `keywords` | array | ❌ | Array of strings | Searchable keywords |
| `maintainer` | object | ❌ | See schema | Maintainer information |
| `stability` | string | ❌ | `experimental`, `beta`, `stable`, `deprecated` | Component stability |
| `createdAt` | string | ❌ | ISO 8601 datetime | Creation timestamp |
| `updatedAt` | string | ❌ | ISO 8601 datetime | Last update timestamp |

### Component Categories

| Category | Description | Examples |
|----------|-------------|---------|
| `basic` | Fundamental UI elements | Button, Input, Text, Icon |
| `composite` | Multi-element components | Card, Modal, Dropdown |
| `layout` | Structure and positioning | Grid, Stack, Container |
| `navigation` | User navigation | Navbar, Breadcrumb, Pagination |
| `feedback` | User feedback | Alert, Toast, Progress |
| `overlay` | Layered UI elements | Modal, Tooltip, Popover |
| `form` | Form controls | FormField, Checkbox, Radio |
| `data-display` | Data presentation | Table, List, DataGrid |
| `specialized` | Domain-specific | Chart, Calendar, Editor |

## Compliance

Norwegian compliance requirements including NSM, GDPR, WCAG, and internationalization.

### Required Properties

```json
{
  "compliance": {
    "i18n": {
      "supported": true,
      "defaultLocale": "nb-NO",
      "supportedLocales": ["nb-NO", "en-US", "fr-FR", "ar-SA"]
    },
    "semantic": {
      "htmlElements": ["button"],
      "ariaRoles": ["button"],
      "landmarks": false
    },
    "wcag": {
      "level": "AAA",
      "tested": true,
      "guidelines": ["1.3.1", "1.4.3", "2.1.1"]
    },
    "ssr": {
      "supported": true,
      "hydrationSafe": true
    },
    "norwegian": {
      "nsmClassification": "OPEN",
      "gdprCompliant": true,
      "designSystem": {
        "altinnCompliant": true
      }
    }
  }
}
```

### Internationalization (i18n)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `supported` | boolean | ✅ | Whether component supports i18n |
| `defaultLocale` | string | ✅ | Default locale (Norwegian first) |
| `supportedLocales` | array | ✅ | Supported locale codes (`xx-XX`) |
| `textDirection` | array | ❌ | Supported text directions (`ltr`, `rtl`) |

**Default Supported Locales**: `["nb-NO", "en-US", "fr-FR", "ar-SA"]`

### Semantic HTML

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `htmlElements` | array | ✅ | Primary HTML elements used |
| `ariaRoles` | array | ✅ | ARIA roles implemented |
| `landmarks` | boolean | ✅ | Uses ARIA landmarks |
| `headingStructure` | boolean | ❌ | Maintains proper heading hierarchy |

### WCAG Compliance

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `level` | string | ✅ | `A`, `AA`, `AAA` (default: `AAA`) |
| `tested` | boolean | ✅ | Whether compliance has been tested |
| `guidelines` | array | ✅ | Specific WCAG guidelines met |
| `colorContrast` | object | ❌ | Color contrast ratios |

**Color Contrast Requirements**:
```json
{
  "colorContrast": {
    "normal": 4.5,    // Minimum for normal text
    "large": 3.0,     // Minimum for large text  
    "enhanced": 7.0   // Enhanced contrast (AAA)
  }
}
```

### Server-Side Rendering (SSR)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `supported` | boolean | ✅ | Server-side rendering support |
| `hydrationSafe` | boolean | ✅ | Safe for client-side hydration |
| `staticGeneration` | boolean | ❌ | Compatible with static generation |

### Norwegian Compliance

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `nsmClassification` | string | ✅ | `OPEN`, `RESTRICTED`, `CONFIDENTIAL`, `SECRET` |
| `gdprCompliant` | boolean | ✅ | GDPR compliance status |
| `designSystem` | object | ✅ | Norwegian design system compliance |
| `auditTrail` | boolean | ❌ | Maintains audit trail |

**NSM Security Classifications**:
- `OPEN`: Public information, no special handling required
- `RESTRICTED`: Limited distribution, basic security measures
- `CONFIDENTIAL`: Restricted access, enhanced security
- `SECRET`: Highest classification, maximum security

## Props

Component properties definition with TypeScript-style type information.

### Required Properties

```json
{
  "props": {
    "schema": {
      "propName": {
        "type": "string",
        "description": "Property description",
        "required": false,
        "default": "defaultValue"
      }
    },
    "groups": {
      "required": ["propName"],
      "optional": ["otherProp"],
      "deprecated": []
    }
  }
}
```

### Prop Definition Schema

Each property in the `schema` object follows this structure:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | ✅ | TypeScript type (see [types](#prop-types)) |
| `description` | string | ✅ | Property description |
| `required` | boolean | ❌ | Whether prop is required |
| `default` | any | ❌ | Default value |
| `enum` | array | ❌ | Allowed values |
| `signature` | string | ❌ | Function signature |
| `validation` | object | ❌ | Validation rules |

### Prop Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Text values | `"hello"` |
| `number` | Numeric values | `42` |
| `boolean` | True/false values | `true` |
| `array` | Array of values | `[1, 2, 3]` |
| `object` | Object values | `{ key: "value" }` |
| `function` | Function values | `(event) => void` |
| `ReactNode` | React node content | JSX elements |
| `React.ComponentType` | React component | Component reference |
| `HTMLElement` | DOM element | HTML element reference |

### Prop Groups

| Group | Description |
|-------|-------------|
| `required` | Props that must be provided |
| `optional` | Props that are optional |
| `deprecated` | Props that are deprecated |

**Deprecated Props Format**:
```json
{
  "deprecated": [
    {
      "name": "oldProp",
      "reason": "Replaced by newProp",
      "alternative": "newProp"
    }
  ]
}
```

### Composition Props

For components that accept children or use slots:

```json
{
  "composition": {
    "children": {
      "supported": true,
      "types": ["string", "element", "node"],
      "constraints": {
        "maxChildren": 5,
        "allowedComponents": ["Button", "Icon"]
      }
    },
    "slots": {
      "header": {
        "required": false,
        "types": ["element"],
        "description": "Header slot content"
      }
    }
  }
}
```

## Variants

Component styling variants using CSS classes.

### Simple Variants

```json
{
  "variants": {
    "simple": {
      "size": {
        "values": {
          "sm": "h-8 px-3 text-sm",
          "md": "h-10 px-4 text-base", 
          "lg": "h-12 px-6 text-lg"
        },
        "defaultValue": "md"
      },
      "variant": {
        "values": {
          "primary": "bg-blue-600 text-white",
          "secondary": "bg-gray-200 text-gray-900",
          "outline": "border border-gray-300 bg-transparent"
        },
        "defaultValue": "primary"
      }
    }
  }
}
```

### Compound Variants

```json
{
  "variants": {
    "compound": [
      {
        "conditions": {
          "variant": "primary",
          "size": "lg"
        },
        "className": "shadow-lg font-semibold",
        "description": "Large primary button with enhanced styling"
      }
    ]
  }
}
```

## Accessibility

Comprehensive accessibility implementation details following WCAG AAA standards.

### Required Properties

```json
{
  "accessibility": {
    "role": {
      "primary": "button"
    },
    "keyboardNavigation": {
      "supported": true,
      "patterns": [
        {
          "key": "Enter",
          "action": "activate",
          "context": "Activates the button"
        }
      ]
    },
    "screenReader": {
      "announcements": [],
      "labels": {
        "required": ["aria-label or text content"]
      }
    }
  }
}
```

### ARIA Roles

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `primary` | string | ✅ | Primary ARIA role |
| `additional` | array | ❌ | Additional ARIA roles |

### Keyboard Navigation

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `supported` | boolean | ✅ | Whether keyboard navigation is supported |
| `patterns` | array | ✅ | Keyboard interaction patterns |
| `focusManagement` | object | ❌ | Focus management settings |

**Keyboard Pattern Format**:
```json
{
  "key": "Enter",           // Key name or combination
  "action": "activate",     // Action performed
  "context": "Description"  // Context description
}
```

**Focus Management Options**:
```json
{
  "focusManagement": {
    "trapFocus": false,      // Whether to trap focus within component
    "restoreFocus": false,   // Whether to restore focus on unmount
    "skipLinks": false       // Whether to provide skip links
  }
}
```

### Screen Reader Support

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `announcements` | array | ✅ | Screen reader announcements |
| `labels` | object | ✅ | Required labels and descriptions |

**Announcement Format**:
```json
{
  "trigger": "loading",        // Event that triggers announcement
  "message": "Button is loading", // Message to announce
  "priority": "polite"         // "polite" or "assertive"
}
```

### Accessibility Testing

```json
{
  "testing": {
    "automated": [
      "axe-core",
      "jest-axe",
      "lighthouse"
    ],
    "manual": [
      "keyboard navigation",
      "screen reader testing",
      "color contrast verification"
    ]
  }
}
```

## Platforms

Multi-platform support configuration and implementation details.

### Required Properties

```json
{
  "platforms": {
    "supported": ["react", "vue", "angular"],
    "primary": "react"
  }
}
```

### Platform Support

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `supported` | array | ✅ | List of supported platforms |
| `primary` | string | ❌ | Primary platform for development |
| `implementations` | object | ❌ | Platform-specific implementations |

**Supported Platforms**:
- `react` - React.js
- `vue` - Vue.js
- `angular` - Angular
- `svelte` - Svelte
- `solid` - SolidJS
- `web-components` - Web Components

### Platform Implementations

```json
{
  "implementations": {
    "react": {
      "templatePath": "./templates/react/Button.tsx.hbs",
      "dependencies": ["react", "@types/react"],
      "imports": [
        {
          "module": "react",
          "imports": ["forwardRef", "ButtonHTMLAttributes"]
        }
      ],
      "examples": [
        {
          "code": "<Button>Click me</Button>",
          "language": "tsx"
        }
      ]
    }
  }
}
```

## Examples

Usage examples demonstrating component functionality.

### Example Format

```json
{
  "examples": [
    {
      "name": "Basic Usage",
      "description": "Simple button with default props",
      "category": "basic",
      "code": {
        "react": "<Button>Click me</Button>",
        "vue": "<Button>Click me</Button>"
      },
      "props": {
        "variant": "primary",
        "size": "md"
      },
      "notes": "Most common usage pattern"
    }
  ]
}
```

### Example Categories

| Category | Description |
|----------|-------------|
| `basic` | Simple, common usage |
| `advanced` | Complex functionality |
| `playground` | Interactive examples |
| `real-world` | Production use cases |

## AI Optimization

Metadata for AI-powered code generation and optimization.

### Structure

```json
{
  "ai": {
    "optimization": {
      "hints": [
        "Use semantic HTML button element",
        "Implement proper focus management"
      ],
      "patterns": [
        {
          "pattern": "forwardRef for React implementation",
          "context": "Allows parent components to access DOM node",
          "recommendation": "Always use forwardRef for interactive components"
        }
      ],
      "antiPatterns": [
        {
          "pattern": "Using div with onClick instead of button",
          "reason": "Poor accessibility and semantics",
          "alternative": "Use semantic button element"
        }
      ]
    },
    "generation": {
      "priority": "high",
      "complexity": "simple",
      "estimatedTokens": 800
    },
    "documentation": {
      "autoGenerate": true,
      "templates": ["component-overview", "api-reference", "examples"]
    }
  }
}
```

### Generation Metadata

| Property | Type | Description |
|----------|------|-------------|
| `priority` | string | `high`, `medium`, `low` - Generation priority |
| `complexity` | string | `simple`, `moderate`, `complex` - Implementation complexity |
| `estimatedTokens` | number | Estimated tokens for AI generation |

## Testing

Testing requirements and specifications.

### Structure

```json
{
  "testing": {
    "unit": {
      "required": [
        "renders correctly",
        "handles props",
        "fires events",
        "supports accessibility"
      ],
      "coverage": {
        "minimum": 95
      }
    },
    "integration": {
      "scenarios": [
        "works within forms",
        "integrates with design system"
      ]
    },
    "visual": {
      "regression": true,
      "responsive": true
    }
  }
}
```

### Coverage Requirements

| Metric | Minimum | Description |
|--------|---------|-------------|
| Statements | 95% | Statement coverage |
| Branches | 95% | Branch coverage |
| Functions | 95% | Function coverage |
| Lines | 95% | Line coverage |

## Performance

Performance metrics and optimization requirements.

### Structure

```json
{
  "performance": {
    "metrics": {
      "bundleSize": {
        "max": "50kb",
        "gzipped": "15kb"
      },
      "renderTime": {
        "initial": "16ms",
        "update": "8ms"
      }
    },
    "optimizations": [
      "React.memo for props comparison",
      "useMemo for expensive calculations",
      "Tree-shaking compatible exports"
    ]
  }
}
```

### Performance Targets

| Metric | Target | Description |
|--------|--------|-------------|
| Bundle Size | < 50kb | Maximum bundle size |
| Gzipped Size | < 15kb | Maximum gzipped size |
| Initial Render | < 16ms | First render time |
| Update Render | < 8ms | Re-render time |

## Schema Definitions

Reusable schema definitions referenced throughout the specification.

### Prop Definition

```json
{
  "propDefinition": {
    "type": "object",
    "required": ["type", "description"],
    "properties": {
      "type": {
        "type": "string",
        "description": "TypeScript type"
      },
      "description": {
        "type": "string",
        "description": "Property description"
      },
      "required": {
        "type": "boolean",
        "default": false
      },
      "default": {
        "description": "Default value"
      }
    }
  }
}
```

### Component Example

```json
{
  "componentExample": {
    "type": "object",
    "required": ["name", "description", "code"],
    "properties": {
      "name": { "type": "string" },
      "description": { "type": "string" },
      "category": {
        "type": "string",
        "enum": ["basic", "advanced", "playground", "real-world"]
      },
      "code": {
        "type": "object",
        "patternProperties": {
          "^(react|vue|angular|svelte|solid|web-components)$": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

### Code Example

```json
{
  "codeExample": {
    "type": "object", 
    "required": ["code", "language"],
    "properties": {
      "code": { "type": "string" },
      "language": { "type": "string" },
      "description": { "type": "string" }
    }
  }
}
```

## Validation Rules

### Schema Validation

The specification uses JSON Schema Draft 07 for validation:

1. **Required Properties**: All required properties must be present
2. **Type Validation**: Properties must match their specified types
3. **Format Validation**: Strings must match specified patterns
4. **Enum Validation**: Values must be from allowed enums
5. **Range Validation**: Numbers must be within specified ranges

### Norwegian Compliance Validation

Additional validation rules for Norwegian compliance:

1. **NSM Classification**: Must be valid classification level
2. **GDPR Compliance**: Boolean flag must be set
3. **Locale Support**: Must include `nb-NO` as default
4. **WCAG Level**: Must be `A`, `AA`, or `AAA`

### Custom Validation Rules

- **Component Name**: Must be PascalCase
- **Version**: Must follow semantic versioning
- **Prop Names**: Must be camelCase
- **CSS Classes**: Must be valid Tailwind CSS classes

### Validation Commands

```bash
# Validate single specification
npx xala-ui validate --spec ./specs/Button.json

# Validate with strict mode
npx xala-ui validate --spec ./specs/Button.json --strict

# Validate Norwegian compliance
npx xala-ui validate --spec ./specs/Button.json --compliance norwegian

# Validate all specifications
npx xala-ui validate --all
```

## Migration Guide

### From v4.x to v5.0

Key changes in v5.0:

1. **New Required Properties**:
   - `metadata.semanticVersion`
   - `compliance.norwegian`
   - `accessibility.screenReader`

2. **Renamed Properties**:
   - `meta` → `metadata`
   - `a11y` → `accessibility`

3. **New Categories**:
   - Added `specialized` category
   - Split `input` into `form` category

### Migration Command

```bash
npx xala-ui migrate --from v4.2 --to v5.0 --spec ./specs/Button.json
```

---

*This schema reference is automatically generated from the JSON Schema definition and maintained by the Xala UI System.*