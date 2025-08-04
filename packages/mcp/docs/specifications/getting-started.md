# Getting Started with Xala UI Component Specifications

This guide will help you get up and running with the Xala UI Component Specification System, from installation to creating your first component specification.

## Prerequisites

- **Node.js**: Version 18.0 or higher
- **TypeScript**: Version 5.0 or higher
- **Package Manager**: npm, yarn, or pnpm

## Installation

### Option 1: NPM Package

```bash
# Install the specification system
npm install @xala-technologies/ui-system-mcp

# Or with yarn
yarn add @xala-technologies/ui-system-mcp

# Or with pnpm
pnpm add @xala-technologies/ui-system-mcp
```

### Option 2: CLI Tool

```bash
# Install globally for CLI access
npm install -g @xala-technologies/ui-system-mcp

# Verify installation
xala-ui --version
```

### Option 3: MCP Server Integration

```bash
# For AI development environments
npm install @xala-technologies/ui-system-mcp
npx xala-ui setup-mcp
```

## Project Setup

### 1. Initialize Configuration

```bash
# Create a new specification project
npx xala-ui init

# Or add to existing project
npx xala-ui init --existing
```

This creates the following structure:

```
your-project/
├── xala-ui.config.js          # Configuration file
├── specs/                     # Component specifications
│   └── examples/              # Example specifications
├── generated/                 # Generated components
│   ├── react/
│   ├── vue/
│   └── angular/
└── docs/                      # Generated documentation
    └── components/
```

### 2. Configuration File

Edit `xala-ui.config.js`:

```javascript
module.exports = {
  // Schema version
  schemaVersion: "v5.0.0",
  
  // Norwegian compliance settings
  compliance: {
    norwegian: {
      enabled: true,
      nsmClassification: "OPEN", // OPEN, RESTRICTED, CONFIDENTIAL, SECRET
      gdprCompliant: true,
      auditTrail: true
    },
    wcag: {
      level: "AAA", // A, AA, AAA
      testing: true
    }
  },
  
  // Supported platforms
  platforms: {
    primary: "react",
    supported: ["react", "vue", "angular"],
    generate: ["react", "vue"] // Only generate these
  },
  
  // AI optimization
  ai: {
    enabled: true,
    optimization: "high", // low, medium, high
    tokenLimit: 4000
  },
  
  // Output directories
  output: {
    specifications: "./specs",
    components: "./generated",
    documentation: "./docs/components",
    templates: "./templates"
  },
  
  // Validation settings
  validation: {
    strict: true,
    coverage: 95, // Minimum test coverage
    performance: {
      bundleSize: "50kb",
      renderTime: "16ms"
    }
  }
};
```

## Your First Component Specification

### 1. Create a Button Specification

Create `specs/Button.json`:

```json
{
  "metadata": {
    "name": "Button",
    "version": "1.0.0",
    "semanticVersion": "v5.0",
    "category": "basic",
    "description": "A versatile button component with multiple variants and Norwegian compliance",
    "keywords": ["button", "action", "interactive", "form"],
    "stability": "stable",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  
  "compliance": {
    "i18n": {
      "supported": true,
      "defaultLocale": "nb-NO",
      "supportedLocales": ["nb-NO", "en-US", "fr-FR", "ar-SA"],
      "textDirection": ["ltr", "rtl"]
    },
    "semantic": {
      "htmlElements": ["button"],
      "ariaRoles": ["button"],
      "landmarks": false,
      "headingStructure": false
    },
    "wcag": {
      "level": "AAA",
      "tested": true,
      "guidelines": ["1.3.1", "1.4.3", "2.1.1", "2.4.7", "4.1.2"],
      "colorContrast": {
        "normal": 7.0,
        "large": 4.5,
        "enhanced": 7.0
      }
    },
    "ssr": {
      "supported": true,
      "hydrationSafe": true,
      "staticGeneration": true
    },
    "norwegian": {
      "nsmClassification": "OPEN",
      "gdprCompliant": true,
      "designSystem": {
        "altinnCompliant": true,
        "governmentApproved": true
      },
      "auditTrail": false
    }
  },
  
  "props": {
    "schema": {
      "variant": {
        "type": "string",
        "enum": ["primary", "secondary", "outline", "ghost", "destructive"],
        "default": "primary",
        "description": "Visual variant of the button",
        "required": false
      },
      "size": {
        "type": "string",
        "enum": ["sm", "md", "lg"],
        "default": "md",
        "description": "Size of the button",
        "required": false
      },
      "disabled": {
        "type": "boolean",
        "default": false,
        "description": "Whether the button is disabled",
        "required": false
      },
      "loading": {
        "type": "boolean",
        "default": false,
        "description": "Whether the button is in loading state",
        "required": false
      },
      "children": {
        "type": "ReactNode",
        "description": "Button content",
        "required": true
      },
      "onClick": {
        "type": "function",
        "signature": "(event: MouseEvent) => void",
        "description": "Click event handler",
        "required": false
      }
    },
    "groups": {
      "required": ["children"],
      "optional": ["variant", "size", "disabled", "loading", "onClick"],
      "deprecated": []
    }
  },
  
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
        },
        {
          "key": "Space",
          "action": "activate", 
          "context": "Activates the button"
        }
      ],
      "focusManagement": {
        "trapFocus": false,
        "restoreFocus": false,
        "skipLinks": false
      }
    },
    "screenReader": {
      "announcements": [
        {
          "trigger": "loading",
          "message": "Button is loading",
          "priority": "polite"
        }
      ],
      "labels": {
        "required": ["aria-label or text content"],
        "descriptions": {
          "loading": "Announce loading state changes"
        }
      }
    }
  },
  
  "platforms": {
    "supported": ["react", "vue", "angular"],
    "primary": "react",
    "implementations": {
      "react": {
        "templatePath": "./templates/react/Button.tsx.hbs",
        "dependencies": ["react", "@types/react"],
        "imports": [
          {
            "module": "react",
            "imports": ["forwardRef", "ButtonHTMLAttributes"]
          }
        ]
      },
      "vue": {
        "templatePath": "./templates/vue/Button.vue.hbs",
        "dependencies": ["vue"],
        "imports": []
      }
    }
  },
  
  "examples": [
    {
      "name": "Basic Usage",
      "description": "Simple button with default props",
      "category": "basic",
      "code": {
        "react": "<Button>Click me</Button>",
        "vue": "<Button>Click me</Button>"
      },
      "props": {},
      "notes": "Most common usage pattern"
    },
    {
      "name": "Variants",
      "description": "All button variants",
      "category": "advanced",
      "code": {
        "react": `<div className="space-y-4">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Delete</Button>
</div>`,
        "vue": `<div class="space-y-4">
  <Button variant="primary">Primary</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Delete</Button>
</div>`
      }
    }
  ],
  
  "ai": {
    "optimization": {
      "hints": [
        "Use semantic HTML button element",
        "Implement proper focus management",
        "Support both controlled and uncontrolled usage"
      ],
      "patterns": [
        {
          "pattern": "forwardRef for React implementation",
          "context": "Allows parent components to access button DOM node",
          "recommendation": "Always use forwardRef for interactive components"
        }
      ]
    },
    "generation": {
      "priority": "high",
      "complexity": "simple",
      "estimatedTokens": 800
    }
  }
}
```

### 2. Validate the Specification

```bash
# Validate single specification
npx xala-ui validate --spec ./specs/Button.json

# Validate all specifications
npx xala-ui validate --all

# Validate with Norwegian compliance
npx xala-ui validate --compliance norwegian
```

### 3. Generate Components

```bash
# Generate React component
npx xala-ui generate --spec ./specs/Button.json --platform react

# Generate for multiple platforms
npx xala-ui generate --spec ./specs/Button.json --platform react,vue

# Generate all specifications
npx xala-ui generate --all --platform react
```

This creates:

```
generated/
├── react/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   └── index.ts
└── vue/
    ├── Button/
    │   ├── Button.vue
    │   ├── Button.test.ts
    │   └── index.ts
    └── index.ts
```

### 4. Generate Documentation

```bash
# Generate component documentation
npx xala-ui docs generate --spec ./specs/Button.json

# Generate all documentation
npx xala-ui docs generate --all

# Generate with examples
npx xala-ui docs generate --with-examples
```

## Common Workflows

### Creating New Components

1. **Start with existing template**:
   ```bash
   npx xala-ui create --template basic --name MyComponent
   ```

2. **Edit the specification** in `specs/MyComponent.json`

3. **Validate specification**:
   ```bash
   npx xala-ui validate --spec ./specs/MyComponent.json
   ```

4. **Generate and test**:
   ```bash
   npx xala-ui generate --spec ./specs/MyComponent.json --platform react
   npm test generated/react/MyComponent
   ```

### Updating Existing Components

1. **Modify specification** in `specs/ComponentName.json`

2. **Validate changes**:
   ```bash
   npx xala-ui validate --spec ./specs/ComponentName.json --strict
   ```

3. **Regenerate components**:
   ```bash
   npx xala-ui generate --spec ./specs/ComponentName.json --force
   ```

4. **Update documentation**:
   ```bash
   npx xala-ui docs generate --spec ./specs/ComponentName.json
   ```

### AI-Assisted Development

1. **Enable AI optimization** in config:
   ```javascript
   ai: {
     enabled: true,
     optimization: "high",
     provider: "openai" // or "anthropic"
   }
   ```

2. **Generate with AI hints**:
   ```bash
   npx xala-ui generate --spec ./specs/Button.json --ai-optimize
   ```

3. **AI documentation generation**:
   ```bash
   npx xala-ui docs generate --ai-enhance --spec ./specs/Button.json
   ```

## Development Tools

### VS Code Extension

Install the Xala UI extension for VS Code:

```bash
code --install-extension xala-technologies.ui-system-specs
```

Features:
- JSON schema validation
- Auto-completion for specifications
- Live preview of generated components
- Norwegian compliance checking

### CLI Commands Reference

```bash
# Initialization
xala-ui init [--existing]                    # Initialize project
xala-ui setup-mcp                           # Setup MCP server

# Component Management
xala-ui create --template <type> --name <name>  # Create new specification
xala-ui list [--category <cat>]             # List specifications
xala-ui info --spec <path>                  # Show specification info

# Generation
xala-ui generate --spec <path> --platform <platforms>  # Generate components
xala-ui generate --all --platform <platforms>          # Generate all
xala-ui generate --template --name <name>              # Generate template

# Validation
xala-ui validate --spec <path>              # Validate specification
xala-ui validate --all                      # Validate all
xala-ui validate --compliance <type>        # Compliance validation

# Documentation
xala-ui docs generate --spec <path>         # Generate docs
xala-ui docs generate --all                 # Generate all docs
xala-ui docs serve --port 3000             # Serve docs locally

# Utilities
xala-ui lint --fix                          # Lint and fix specifications
xala-ui migrate --from <version> --to <version>  # Migrate specifications
xala-ui stats                               # Show project statistics
```

## Next Steps

1. **[Read the Schema Reference](./schema-reference.md)** - Complete specification format
2. **[Explore Component Examples](./components/)** - Browse existing components
3. **[Learn AI Integration](./guides/ai-usage.md)** - AI-powered development
4. **[Understand Norwegian Compliance](./guides/norwegian-compliance.md)** - NSM and GDPR requirements
5. **[Platform Support Guide](./guides/platform-support.md)** - Multi-framework development

## Troubleshooting

### Common Issues

**Validation Errors**:
```bash
# Check schema version
npx xala-ui validate --spec ./specs/Button.json --verbose

# Update schema version
npx xala-ui migrate --spec ./specs/Button.json --to v5.0
```

**Generation Failures**:
```bash
# Clean and regenerate
npx xala-ui clean
npx xala-ui generate --spec ./specs/Button.json --force

# Check template paths
npx xala-ui info --spec ./specs/Button.json
```

**Norwegian Compliance Issues**:
```bash
# Validate compliance specifically
npx xala-ui validate --compliance norwegian --verbose

# Check NSM classification
npx xala-ui lint --compliance-check
```

### Getting Help

- **Documentation**: [Full Documentation](./README.md)
- **GitHub Issues**: [Report Issues](https://github.com/xala-technologies/ui-system/issues)
- **Discord Community**: [Join Discord](https://discord.gg/xala-ui)
- **Email Support**: [support@xala-technologies.com](mailto:support@xala-technologies.com)

---

*Ready to build enterprise-grade UI components with Norwegian compliance and AI optimization!*