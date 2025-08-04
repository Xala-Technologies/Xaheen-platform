# Token Transformation System

The Xala UI System v5 includes a comprehensive token transformation pipeline that converts design tokens into multiple output formats, enabling seamless integration with various development workflows and build systems.

## Overview

The token transformation system provides automated generation of:
- **TypeScript type definitions** for type-safe token usage
- **CSS variables** for runtime theming and dynamic styling
- **Tailwind configurations** for utility-first development
- **JSON schemas** for validation and IDE support

## ✅ Implemented Features

### Core Transformers
- **TypeScript Type Transformer** - Complete with utility types and module declarations
- **CSS Variable Transformer** - Includes utility classes and media queries
- **Tailwind Config Transformer** - Full configuration generation with plugins
- **JSON Schema Transformer** - Comprehensive validation schemas

### Advanced Token Features
- **Variant Token Maps** - Component-specific token variations
- **State-Based Token Mapping** - Interactive state tokens (hover, focus, active, disabled)
- **Responsive Token Adjustments** - Breakpoint-aware token system
- **Platform-Specific Tokens** - Adapt tokens for web, mobile, and desktop

### Token Management
- **Token Serialization** - Multi-format support (JSON, YAML, TOML, Binary)
- **Token Versioning** - Semantic versioning with migration support
- **Token Diffing** - Change detection and impact analysis
- **Theme Switching** - Smooth transitions with animation support
- **White Label Configuration** - Industry templates and custom branding

## Available Transformers

### JSON Schema Transformer

Generates JSON Schema for token validation and documentation, enabling automated validation and IDE support.

#### Features
- Generates JSON Schema (draft 07, 2019-09, or 2020-12)
- Includes examples and descriptions
- Supports split schemas for each token category
- Provides basic validation functionality
- Enables VS Code IntelliSense for theme files

#### Usage

```typescript
import { generateJSONSchema, validateTokensAgainstSchema } from '@xala-technologies/ui-system/tokens/transformers';

const result = generateJSONSchema(theme, {
  draft: '2020-12',              // Schema draft version
  includeExamples: true,         // Include examples
  includeDescriptions: true,     // Include descriptions
  strictRequired: false,         // Make all properties required
  schemaId: 'https://example.com/schema.json',
  splitSchemas: false            // Generate separate schemas
});

// Access generated schema
const { schema, schemas, full } = result;

// Validate tokens against schema
const validation = validateTokensAgainstSchema(tokens, schema);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

#### Example Output

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://xala-technologies.com/schemas/design-tokens.json",
  "title": "Design Token System",
  "type": "object",
  "properties": {
    "metadata": {
      "type": "object",
      "properties": {
        "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "name": { "type": "string" },
        "mode": { "type": "string", "enum": ["LIGHT", "DARK"] },
        "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" }
      },
      "required": ["id", "name", "mode", "version"]
    },
    "colors": {
      "type": "object",
      "patternProperties": {
        "^[a-zA-Z]+$": {
          "type": "object",
          "patternProperties": {
            "^(50|100|200|300|400|500|600|700|800|900|950)$": {
              "type": "string",
              "pattern": "^#[0-9a-fA-F]{6}$"
            }
          }
        }
      }
    }
  },
  "required": ["metadata", "colors", "typography", "spacing"]
}
```

### TypeScript Type Transformer

Generates strongly-typed interfaces and type definitions from design tokens, ensuring type safety throughout your application.

#### Features
- Generates comprehensive TypeScript interfaces
- Includes JSDoc comments for documentation
- Creates literal types for exact values
- Generates utility types for advanced usage
- Supports namespace and module declarations

#### Usage

```typescript
import { generateTypeScriptTypes } from '@xala-technologies/ui-system/tokens/transformers';

const result = generateTypeScriptTypes(theme, {
  includeJSDoc: true,           // Include JSDoc comments
  generateLiterals: true,        // Generate literal types
  generateUtilityTypes: true,    // Generate utility types
  moduleName: 'my-theme',        // Module name for declarations
  namespace: 'MyTheme',          // TypeScript namespace
  exportType: 'named'            // 'named' or 'default'
});

// Access generated content
const { types, utilities, declarations } = result;
```

#### Example Output

```typescript
// Generated types
export interface ColorTokens {
  /** Primary color scale */
  primary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  /** Secondary color scale */
  secondary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
}

// Utility types
export type ColorKeys = keyof ColorTokens;
export type ColorValue<K extends ColorKeys> = ColorTokens[K];

// Namespace declaration
export namespace MyTheme {
  export interface Colors extends ColorTokens {}
  export interface Typography extends TypographyTokens {}
}
```

### CSS Variable Transformer

Generates CSS custom properties and utility classes from design tokens, enabling dynamic theming and runtime style updates.

#### Features
- Generates CSS custom properties (CSS variables)
- Creates utility classes for common properties
- Generates responsive media queries
- Supports custom prefixes and selectors
- Includes comprehensive comments

#### Usage

```typescript
import { generateCSSVariables } from '@xala-technologies/ui-system/tokens/transformers';

const result = generateCSSVariables(theme, {
  prefix: 'app-',                    // Variable prefix
  selector: ':root',                 // Root selector
  includeComments: true,             // Include comments
  generateUtilityClasses: true,      // Generate utility classes
  generateMediaQueries: true,        // Generate media queries
  colorFormat: 'hex'                 // 'hex', 'rgb', or 'hsl'
});

// Access generated content
const { variables, utilities, mediaQueries, full } = result;
```

#### Example Output

```css
/* CSS Variables */
:root {
  /* Colors */
  --app-color-primary-50: #f0f9ff;
  --app-color-primary-500: #3b82f6;
  --app-color-primary-900: #1e3a8a;
  
  /* Typography */
  --app-font-size-base: 1rem;
  --app-font-size-lg: 1.125rem;
  --app-font-weight-medium: 500;
  
  /* Spacing */
  --app-spacing-4: 1rem;
  --app-spacing-8: 2rem;
}

/* Utility Classes */
.text-primary-500 { color: var(--app-color-primary-500); }
.bg-primary-500 { background-color: var(--app-color-primary-500); }
.p-4 { padding: var(--app-spacing-4); }
```

### Tailwind Config Transformer

Generates Tailwind CSS configuration files from design tokens, enabling seamless integration with Tailwind-based projects.

#### Features
- Generates complete Tailwind configurations
- Supports extend or replace modes
- Includes plugin configurations
- Generates safelist patterns
- Supports custom prefixes and important selectors

#### Usage

```typescript
import { generateTailwindConfig } from '@xala-technologies/ui-system/tokens/transformers';

const result = generateTailwindConfig(theme, {
  mode: 'extend',                    // 'extend' or 'replace'
  includeComments: true,             // Include comments
  generateContent: true,             // Generate content paths
  includePlugins: true,              // Include plugin configs
  prefix: 'tw-',                     // Class prefix
  important: false,                  // Important selector
  generateSafelist: true             // Generate safelist
});

// Access generated content
const { config, types, full } = result;
```

#### Example Output

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      spacing: {
        '0': '0px',
        '1': '0.25rem',
        '2': '0.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
  safelist: [
    {
      pattern: /^(bg|text|border)-(primary|secondary)-(50|500|900)$/,
    },
  ],
};
```

## Multi-Theme Support

All transformers support generating outputs for multiple themes simultaneously:

```typescript
import { 
  generateMultiThemeTypes,
  generateMultiThemeCSS,
  generateMultiThemeTailwindConfig 
} from '@xala-technologies/ui-system/tokens/transformers';

// Generate for multiple themes
const themes = [lightTheme, darkTheme, norwegianGovTheme];

// TypeScript types for all themes
const typeResults = generateMultiThemeTypes(themes, {
  namespace: 'AppThemes'
});

// CSS for all themes with data attributes
const cssResults = generateMultiThemeCSS(themes, {
  prefix: 'app-'
});

// Tailwind configs for all themes
const tailwindResults = generateMultiThemeTailwindConfig(themes, {
  mode: 'extend'
});
```

## Integration Examples

### Next.js Integration

```typescript
// next.config.js
const { generateTailwindConfig } = require('@xala-technologies/ui-system/tokens/transformers');
const lightTheme = require('./themes/light.json');

module.exports = {
  // Generate Tailwind config at build time
  webpack: (config) => {
    const tailwindConfig = generateTailwindConfig(lightTheme);
    // Write to file or use in build process
    return config;
  }
};
```

### Build Script Integration

```json
// package.json
{
  "scripts": {
    "generate-tokens": "node scripts/generate-tokens.js",
    "prebuild": "npm run generate-tokens"
  }
}
```

```javascript
// scripts/generate-tokens.js
const { 
  generateTypeScriptTypes,
  generateCSSVariables,
  generateTailwindConfig 
} = require('@xala-technologies/ui-system/tokens/transformers');

const themes = require('./themes');

// Generate all outputs
themes.forEach(theme => {
  const types = generateTypeScriptTypes(theme);
  const css = generateCSSVariables(theme);
  const tailwind = generateTailwindConfig(theme);
  
  // Write to files
  fs.writeFileSync(`./generated/${theme.id}.types.ts`, types.full);
  fs.writeFileSync(`./generated/${theme.id}.css`, css.full);
  fs.writeFileSync(`./generated/tailwind.${theme.id}.js`, tailwind.full);
});
```

## Norwegian Government Compliance

The token transformers include special support for Norwegian government compliance:

```typescript
// Generate Norwegian government compliant theme
const norwegianTheme = {
  id: 'norwegian-gov',
  name: 'Norwegian Government Theme',
  colors: {
    primary: {
      500: '#0062ba', // Norway blue
    },
    secondary: {
      500: '#e63900', // Norwegian red
    }
  },
  accessibility: {
    wcagLevel: 'AAA',
    focusOutlineWidth: '3px',
    focusOutlineColor: '#0062ba',
    minimumTouchTarget: '44px'
  }
};

// Generate with compliance metadata
const result = generateCSSVariables(norwegianTheme, {
  prefix: 'ngov-',
  includeComments: true
});
```

## Best Practices

1. **Generate at Build Time**: Run transformers during build process for optimal performance
2. **Version Control**: Commit generated files for transparency and debugging
3. **Validation**: Always validate tokens before transformation
4. **Documentation**: Include generated type definitions in your documentation
5. **Automation**: Set up CI/CD pipelines to automatically generate outputs

## API Reference

### Common Interfaces

```typescript
interface TokenSystem {
  colors: Record<string, unknown>;
  typography: Record<string, unknown>;
  spacing: Record<string, unknown>;
  borderRadius?: Record<string, unknown>;
  shadows?: Record<string, unknown>;
  zIndex?: Record<string, unknown>;
  animation?: Record<string, unknown>;
  transitions?: Record<string, unknown>;
  components?: Record<string, unknown>;
  forms?: Record<string, unknown>;
  branding: Record<string, unknown>;
  accessibility: Record<string, unknown>;
  responsive: Record<string, unknown>;
  metadata: {
    id: string;
    name: string;
    category: string;
    mode: 'LIGHT' | 'DARK';
    version: string;
  };
}

interface TokenTransformer<T> {
  transform(tokens: TokenSystem, options?: Record<string, unknown>): T;
}
```

## Troubleshooting

### Common Issues

1. **Missing Properties**: Ensure your theme object includes all required properties
2. **Type Errors**: Check that token values match expected types
3. **Build Failures**: Verify transformer imports are from the correct path
4. **Empty Outputs**: Validate theme structure matches TokenSystem interface

### Debug Mode

Enable verbose logging for debugging:

```typescript
const result = generateTypeScriptTypes(theme, {
  debug: true, // Logs transformation steps
  validateInput: true // Validates input before transformation
});
```

## JSON Schema Validation

### Using with AJV

For production validation, use the ajv library:

```bash
npm install ajv ajv-cli
```

```typescript
import Ajv from 'ajv';
import { generateJSONSchema } from '@xala-technologies/ui-system/tokens/transformers';

// Generate schema
const { schema } = generateJSONSchema(baseTheme);

// Create validator
const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

// Validate theme
const valid = validate(customTheme);
if (!valid) {
  console.error('Theme validation failed:', validate.errors);
}
```

### VS Code Integration

Add schema reference to your theme files for IntelliSense:

```json
{
  "$schema": "./path/to/token-schema.json",
  "id": "my-theme",
  "name": "My Custom Theme",
  "colors": {
    // VS Code will provide autocomplete and validation!
  }
}
```

### CI/CD Validation

```yaml
# .github/workflows/validate-themes.yml
name: Validate Themes
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g ajv-cli
      - run: ajv validate -s schemas/token-schema.json -d "themes/*.json"
```

## Future Enhancements

- **Platform-Specific Transformers**: React Native, Flutter support
- **Design Tool Integration**: Figma, Sketch plugin support
- **Real-time Preview**: Live transformation preview in development
- **Schema Evolution**: Automatic migration between schema versions