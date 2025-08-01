# JSON Schema Transformer

The JSON Schema Transformer generates comprehensive JSON Schema definitions from design tokens, enabling validation, documentation, IDE support, and automated tooling. It supports multiple schema draft versions and provides flexible schema generation options.

## Overview

The JSON Schema transformer converts your design tokens into:
- JSON Schema definitions for validation
- Separate schemas for each token category
- Comprehensive examples and descriptions
- Pattern matching for token values
- IDE integration for IntelliSense
- Validation functions for runtime checking

## Basic Usage

```typescript
import { JSONSchemaTransformer } from '@xala-technologies/ui-system/tokens/transformers';

const transformer = new JSONSchemaTransformer();
const result = transformer.transform(tokens, {
  draft: '2020-12',
  includeExamples: true,
  includeDescriptions: true,
  splitSchemas: true
});

// Access generated content
console.log(result.schema);       // Main schema
console.log(result.schemas);      // Category schemas
console.log(result.definitions);  // Shared definitions
console.log(result.full);         // Complete schema document
```

## Configuration Options

### JSONSchemaOptions

```typescript
interface JSONSchemaOptions {
  // JSON Schema draft version
  draft?: '07' | '2019-09' | '2020-12';
  
  // Include example values
  includeExamples?: boolean;
  
  // Include descriptions
  includeDescriptions?: boolean;
  
  // Make all properties required
  strictRequired?: boolean;
  
  // Schema ID/URI
  schemaId?: string;
  
  // Generate separate schemas for categories
  splitSchemas?: boolean;
  
  // Custom definitions
  definitions?: Record<string, any>;
  
  // Additional properties allowed
  additionalProperties?: boolean;
  
  // Pattern properties configuration
  patternProperties?: Record<string, any>;
  
  // Meta schema reference
  metaSchema?: string;
  
  // Validation rules
  validationRules?: {
    minProperties?: number;
    maxProperties?: number;
    dependencies?: Record<string, string[]>;
  };
}
```

## Generated Output Examples

### 1. Complete Token Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://xala-technologies.com/schemas/design-tokens/v1.0.0",
  "title": "Design Token System",
  "description": "Comprehensive design token schema for the Xala UI System",
  "type": "object",
  "properties": {
    "metadata": {
      "$ref": "#/$defs/metadata"
    },
    "colors": {
      "$ref": "#/$defs/colors"
    },
    "typography": {
      "$ref": "#/$defs/typography"
    },
    "spacing": {
      "$ref": "#/$defs/spacing"
    },
    "borderRadius": {
      "$ref": "#/$defs/borderRadius"
    },
    "borderWidth": {
      "$ref": "#/$defs/borderWidth"
    },
    "boxShadow": {
      "$ref": "#/$defs/boxShadow"
    },
    "opacity": {
      "$ref": "#/$defs/opacity"
    },
    "zIndex": {
      "$ref": "#/$defs/zIndex"
    },
    "animation": {
      "$ref": "#/$defs/animation"
    },
    "breakpoints": {
      "$ref": "#/$defs/breakpoints"
    }
  },
  "required": ["metadata", "colors", "typography", "spacing"],
  "additionalProperties": false,
  "$defs": {
    "metadata": {
      "type": "object",
      "title": "Token Metadata",
      "description": "Metadata about the token set",
      "properties": {
        "id": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$",
          "description": "Unique identifier for the token set",
          "examples": ["light-theme", "dark-theme", "brand-theme"]
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100,
          "description": "Human-readable name",
          "examples": ["Light Theme", "Dark Theme", "Brand Theme"]
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*)?$",
          "description": "Semantic version",
          "examples": ["1.0.0", "2.1.0-beta.1", "3.0.0-rc.2"]
        },
        "mode": {
          "type": "string",
          "enum": ["LIGHT", "DARK", "AUTO"],
          "description": "Theme mode",
          "default": "LIGHT"
        },
        "category": {
          "type": "string",
          "description": "Theme category",
          "examples": ["brand", "seasonal", "accessibility"]
        },
        "created": {
          "type": "string",
          "format": "date-time",
          "description": "Creation timestamp"
        },
        "updated": {
          "type": "string",
          "format": "date-time",
          "description": "Last update timestamp"
        },
        "author": {
          "type": "string",
          "description": "Theme author",
          "examples": ["Design System Team", "John Doe"]
        }
      },
      "required": ["id", "name", "version", "mode"],
      "additionalProperties": false
    },
    "colors": {
      "type": "object",
      "title": "Color Tokens",
      "description": "Color palette definitions",
      "properties": {
        "primary": {
          "$ref": "#/$defs/colorScale"
        },
        "secondary": {
          "$ref": "#/$defs/colorScale"
        },
        "neutral": {
          "$ref": "#/$defs/colorScale"
        },
        "success": {
          "$ref": "#/$defs/colorScale"
        },
        "warning": {
          "$ref": "#/$defs/colorScale"
        },
        "danger": {
          "$ref": "#/$defs/colorScale"
        },
        "info": {
          "$ref": "#/$defs/colorScale"
        },
        "white": {
          "$ref": "#/$defs/colorValue"
        },
        "black": {
          "$ref": "#/$defs/colorValue"
        },
        "transparent": {
          "type": "string",
          "const": "transparent"
        },
        "current": {
          "type": "string",
          "const": "currentColor"
        }
      },
      "required": ["primary", "neutral"],
      "additionalProperties": {
        "$ref": "#/$defs/colorScale"
      }
    },
    "colorScale": {
      "type": "object",
      "title": "Color Scale",
      "description": "Color scale with shade variations",
      "properties": {
        "50": { "$ref": "#/$defs/colorValue" },
        "100": { "$ref": "#/$defs/colorValue" },
        "200": { "$ref": "#/$defs/colorValue" },
        "300": { "$ref": "#/$defs/colorValue" },
        "400": { "$ref": "#/$defs/colorValue" },
        "500": { "$ref": "#/$defs/colorValue" },
        "600": { "$ref": "#/$defs/colorValue" },
        "700": { "$ref": "#/$defs/colorValue" },
        "800": { "$ref": "#/$defs/colorValue" },
        "900": { "$ref": "#/$defs/colorValue" },
        "950": { "$ref": "#/$defs/colorValue" }
      },
      "patternProperties": {
        "^\\d{2,3}$": { "$ref": "#/$defs/colorValue" }
      },
      "additionalProperties": false,
      "examples": [
        {
          "50": "#f0f9ff",
          "500": "#3b82f6",
          "900": "#1e3a8a"
        }
      ]
    },
    "colorValue": {
      "oneOf": [
        {
          "type": "string",
          "pattern": "^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?$",
          "description": "Hex color value",
          "examples": ["#fff", "#ffffff", "#ffffff80"]
        },
        {
          "type": "string",
          "pattern": "^rgb\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*\\)$",
          "description": "RGB color value",
          "examples": ["rgb(255, 255, 255)", "rgb(0, 0, 0)"]
        },
        {
          "type": "string",
          "pattern": "^rgba\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*(0|1|0?\\.\\d+)\\s*\\)$",
          "description": "RGBA color value",
          "examples": ["rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0, 0.8)"]
        },
        {
          "type": "string",
          "pattern": "^hsl\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}%\\s*,\\s*\\d{1,3}%\\s*\\)$",
          "description": "HSL color value",
          "examples": ["hsl(0, 0%, 100%)", "hsl(220, 90%, 50%)"]
        },
        {
          "$ref": "#/$defs/tokenReference"
        }
      ]
    },
    "typography": {
      "type": "object",
      "title": "Typography Tokens",
      "description": "Typography-related design tokens",
      "properties": {
        "fontFamily": {
          "type": "object",
          "properties": {
            "sans": {
              "oneOf": [
                { "type": "string" },
                {
                  "type": "array",
                  "items": { "type": "string" }
                }
              ],
              "examples": [
                "Inter",
                ["Inter", "system-ui", "sans-serif"]
              ]
            },
            "serif": {
              "oneOf": [
                { "type": "string" },
                {
                  "type": "array",
                  "items": { "type": "string" }
                }
              ]
            },
            "mono": {
              "oneOf": [
                { "type": "string" },
                {
                  "type": "array",
                  "items": { "type": "string" }
                }
              ]
            }
          },
          "additionalProperties": {
            "oneOf": [
              { "type": "string" },
              {
                "type": "array",
                "items": { "type": "string" }
              }
            ]
          }
        },
        "fontSize": {
          "type": "object",
          "properties": {
            "xs": { "$ref": "#/$defs/sizeValue" },
            "sm": { "$ref": "#/$defs/sizeValue" },
            "base": { "$ref": "#/$defs/sizeValue" },
            "lg": { "$ref": "#/$defs/sizeValue" },
            "xl": { "$ref": "#/$defs/sizeValue" },
            "2xl": { "$ref": "#/$defs/sizeValue" },
            "3xl": { "$ref": "#/$defs/sizeValue" },
            "4xl": { "$ref": "#/$defs/sizeValue" },
            "5xl": { "$ref": "#/$defs/sizeValue" },
            "6xl": { "$ref": "#/$defs/sizeValue" },
            "7xl": { "$ref": "#/$defs/sizeValue" },
            "8xl": { "$ref": "#/$defs/sizeValue" },
            "9xl": { "$ref": "#/$defs/sizeValue" }
          },
          "patternProperties": {
            "^\\d+xl$": { "$ref": "#/$defs/sizeValue" }
          }
        },
        "fontWeight": {
          "type": "object",
          "patternProperties": {
            "^(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\\d{3})$": {
              "oneOf": [
                { "type": "number", "minimum": 100, "maximum": 900 },
                { "type": "string", "pattern": "^\\d{3}$" }
              ]
            }
          }
        },
        "lineHeight": {
          "type": "object",
          "patternProperties": {
            ".*": {
              "oneOf": [
                { "type": "number", "minimum": 0 },
                { "type": "string" }
              ]
            }
          }
        },
        "letterSpacing": {
          "type": "object",
          "patternProperties": {
            ".*": { "$ref": "#/$defs/sizeValue" }
          }
        }
      }
    },
    "spacing": {
      "type": "object",
      "title": "Spacing Tokens",
      "description": "Spacing scale for margins, padding, gaps",
      "patternProperties": {
        "^(0|px|0\\.5|\\d+(\\.5)?)$": {
          "$ref": "#/$defs/sizeValue"
        }
      },
      "additionalProperties": false,
      "examples": [
        {
          "0": "0px",
          "1": "0.25rem",
          "2": "0.5rem",
          "4": "1rem"
        }
      ]
    },
    "sizeValue": {
      "oneOf": [
        {
          "type": "string",
          "pattern": "^\\d*\\.?\\d+(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pc|pt)$",
          "examples": ["16px", "1rem", "100%", "50vw"]
        },
        {
          "type": "number",
          "description": "Numeric value (unitless)"
        },
        {
          "$ref": "#/$defs/tokenReference"
        }
      ]
    },
    "borderRadius": {
      "type": "object",
      "title": "Border Radius Tokens",
      "patternProperties": {
        ".*": { "$ref": "#/$defs/sizeValue" }
      },
      "properties": {
        "none": { "const": "0px" },
        "sm": { "$ref": "#/$defs/sizeValue" },
        "DEFAULT": { "$ref": "#/$defs/sizeValue" },
        "md": { "$ref": "#/$defs/sizeValue" },
        "lg": { "$ref": "#/$defs/sizeValue" },
        "xl": { "$ref": "#/$defs/sizeValue" },
        "2xl": { "$ref": "#/$defs/sizeValue" },
        "3xl": { "$ref": "#/$defs/sizeValue" },
        "full": { "const": "9999px" }
      }
    },
    "boxShadow": {
      "type": "object",
      "title": "Box Shadow Tokens",
      "patternProperties": {
        ".*": {
          "oneOf": [
            {
              "type": "string",
              "description": "CSS box-shadow value"
            },
            {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "x": { "$ref": "#/$defs/sizeValue" },
                  "y": { "$ref": "#/$defs/sizeValue" },
                  "blur": { "$ref": "#/$defs/sizeValue" },
                  "spread": { "$ref": "#/$defs/sizeValue" },
                  "color": { "$ref": "#/$defs/colorValue" },
                  "inset": { "type": "boolean" }
                }
              }
            },
            {
              "$ref": "#/$defs/tokenReference"
            }
          ]
        }
      }
    },
    "tokenReference": {
      "type": "object",
      "title": "Token Reference",
      "description": "Reference to another token",
      "properties": {
        "token": {
          "type": "string",
          "pattern": "^[a-zA-Z0-9.]+$",
          "description": "Token path",
          "examples": ["colors.primary.500", "spacing.4"]
        },
        "fallback": {
          "description": "Fallback value if token not found"
        }
      },
      "required": ["token"],
      "additionalProperties": false
    }
  }
}
```

### 2. Category-Specific Schemas

```json
// colors.schema.json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://xala-technologies.com/schemas/design-tokens/colors/v1.0.0",
  "title": "Color Token Schema",
  "type": "object",
  "properties": {
    "primary": { "$ref": "#/$defs/colorScale" },
    "secondary": { "$ref": "#/$defs/colorScale" },
    "neutral": { "$ref": "#/$defs/colorScale" },
    // ... other color properties
  },
  "$defs": {
    "colorScale": {
      // Color scale definition
    },
    "colorValue": {
      // Color value definition
    }
  }
}

// typography.schema.json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://xala-technologies.com/schemas/design-tokens/typography/v1.0.0",
  "title": "Typography Token Schema",
  "type": "object",
  "properties": {
    "fontFamily": {
      // Font family definitions
    },
    "fontSize": {
      // Font size definitions
    }
    // ... other typography properties
  }
}
```

### 3. Validation Examples

```json
// Valid token example
{
  "metadata": {
    "id": "light-theme",
    "name": "Light Theme",
    "version": "1.0.0",
    "mode": "LIGHT"
  },
  "colors": {
    "primary": {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "500": "#3b82f6",
      "900": "#1e3a8a"
    },
    "neutral": {
      "50": "#f9fafb",
      "500": "#6b7280",
      "900": "#111827"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "system-ui", "sans-serif"]
    },
    "fontSize": {
      "base": "1rem",
      "lg": "1.125rem"
    }
  },
  "spacing": {
    "0": "0px",
    "1": "0.25rem",
    "2": "0.5rem",
    "4": "1rem"
  }
}

// Invalid token example (will fail validation)
{
  "metadata": {
    "id": "Invalid Theme!", // Invalid pattern
    "name": "Theme",
    // Missing required 'version' and 'mode'
  },
  "colors": {
    "primary": {
      "500": "blue" // Invalid color format
    }
    // Missing required 'neutral'
  }
  // Missing required 'typography' and 'spacing'
}
```

### 4. Complex Schema Features

```json
{
  // Conditional schemas
  "if": {
    "properties": {
      "metadata": {
        "properties": {
          "mode": { "const": "DARK" }
        }
      }
    }
  },
  "then": {
    "properties": {
      "colors": {
        "properties": {
          "background": {
            "default": "#000000"
          }
        }
      }
    }
  },
  
  // Dependencies
  "dependencies": {
    "animation": ["transition"],
    "borderWidth": ["borderStyle"]
  },
  
  // Pattern properties with constraints
  "patternProperties": {
    "^color-.*": {
      "$ref": "#/$defs/colorValue"
    },
    "^spacing-.*": {
      "$ref": "#/$defs/sizeValue",
      "minimum": 0,
      "maximum": 100
    }
  },
  
  // All-of composition
  "allOf": [
    { "$ref": "#/$defs/baseTokens" },
    { "$ref": "#/$defs/extendedTokens" }
  ],
  
  // One-of constraints
  "oneOf": [
    {
      "properties": {
        "type": { "const": "light" },
        "colors": { "$ref": "#/$defs/lightColors" }
      }
    },
    {
      "properties": {
        "type": { "const": "dark" },
        "colors": { "$ref": "#/$defs/darkColors" }
      }
    }
  ]
}
```

## Advanced Features

### 1. Custom Validation Rules

```typescript
const result = transformer.transform(tokens, {
  definitions: {
    norwegianColor: {
      type: 'string',
      pattern: '^#(0062ba|e63900|ffffff)$',
      description: 'Norwegian flag colors only'
    }
  },
  validationRules: {
    minProperties: 4,
    maxProperties: 20,
    dependencies: {
      'colors.primary': ['colors.secondary'],
      'animation': ['transition', 'duration']
    }
  }
});
```

### 2. Schema Composition

```typescript
// Base schema
const baseSchema = transformer.transformBase(baseTokens);

// Theme-specific extensions
const lightSchema = transformer.transformExtension(lightTokens, {
  extends: baseSchema,
  additionalProperties: false
});

const darkSchema = transformer.transformExtension(darkTokens, {
  extends: baseSchema,
  additionalProperties: false
});

// Combine schemas
const combinedSchema = {
  oneOf: [lightSchema, darkSchema],
  discriminator: {
    propertyName: 'metadata.mode'
  }
};
```

### 3. Runtime Validation

```typescript
import { validateTokensAgainstSchema } from '@xala-technologies/ui-system/tokens/transformers';

// Basic validation
const validation = validateTokensAgainstSchema(tokens, schema);
if (!validation.valid) {
  console.error('Token validation failed:', validation.errors);
  validation.errors.forEach(error => {
    console.error(`- ${error.path}: ${error.message}`);
  });
}

// With AJV for advanced validation
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ 
  allErrors: true,
  verbose: true,
  strict: false
});
addFormats(ajv);

const validate = ajv.compile(schema);
const valid = validate(tokens);

if (!valid) {
  console.error('Validation errors:', validate.errors);
}
```

### 4. IDE Integration

```json
// .vscode/settings.json
{
  "json.schemas": [
    {
      "fileMatch": ["**/tokens/*.json", "**/themes/*.json"],
      "url": "./schemas/token.schema.json"
    },
    {
      "fileMatch": ["**/tokens/colors.json"],
      "url": "./schemas/colors.schema.json"
    },
    {
      "fileMatch": ["**/tokens/typography.json"],
      "url": "./schemas/typography.schema.json"
    }
  ]
}

// theme.json with schema reference
{
  "$schema": "../schemas/token.schema.json",
  "metadata": {
    "id": "my-theme",
    "name": "My Theme",
    // VS Code will provide IntelliSense here!
  }
}
```

## Integration Examples

### 1. Build-Time Validation

```javascript
// build-validate.js
const { JSONSchemaTransformer, validateTokensAgainstSchema } = require('@xala-technologies/ui-system/tokens/transformers');
const fs = require('fs');
const path = require('path');

// Generate schema
const transformer = new JSONSchemaTransformer();
const { schema } = transformer.transform(baseTokens);

// Validate all theme files
const themesDir = path.join(__dirname, 'themes');
const themeFiles = fs.readdirSync(themesDir).filter(f => f.endsWith('.json'));

let hasErrors = false;

themeFiles.forEach(file => {
  const theme = JSON.parse(fs.readFileSync(path.join(themesDir, file), 'utf8'));
  const validation = validateTokensAgainstSchema(theme, schema);
  
  if (!validation.valid) {
    console.error(`❌ ${file}: ${validation.errors.length} errors`);
    validation.errors.forEach(error => {
      console.error(`   - ${error.path}: ${error.message}`);
    });
    hasErrors = true;
  } else {
    console.log(`✅ ${file}: Valid`);
  }
});

if (hasErrors) {
  process.exit(1);
}
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/validate-tokens.yml
name: Validate Design Tokens

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Generate token schema
        run: npm run generate:schema
        
      - name: Validate tokens
        run: |
          npx ajv validate -s schemas/token.schema.json -d "themes/*.json" --all-errors --verbose
          
      - name: Check token changes
        if: github.event_name == 'pull_request'
        run: |
          npm run tokens:diff -- --base origin/main --head HEAD
```

### 3. API Validation

```typescript
// api/tokens/validate.ts
import { JSONSchemaTransformer } from '@xala-technologies/ui-system/tokens/transformers';
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });
const transformer = new JSONSchemaTransformer();
const { schema } = transformer.transform(baseTokens);
const validate = ajv.compile(schema);

export async function validateTokenEndpoint(req: Request, res: Response) {
  const tokens = req.body;
  
  const valid = validate(tokens);
  
  if (!valid) {
    return res.status(400).json({
      valid: false,
      errors: validate.errors.map(err => ({
        path: err.instancePath,
        message: err.message,
        params: err.params
      }))
    });
  }
  
  return res.json({
    valid: true,
    message: 'Tokens are valid'
  });
}
```

### 4. Design Tool Plugin

```typescript
// figma-plugin/validate-tokens.ts
import { JSONSchemaTransformer } from '@xala-technologies/ui-system/tokens/transformers';

// In Figma plugin
async function validateExportedTokens(tokens: any) {
  const transformer = new JSONSchemaTransformer();
  const { schema } = transformer.transform(baseTokens);
  
  const response = await fetch('https://api.example.com/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schema, tokens })
  });
  
  const result = await response.json();
  
  if (!result.valid) {
    figma.notify('❌ Token validation failed. Check console for details.');
    console.error('Validation errors:', result.errors);
  } else {
    figma.notify('✅ Tokens validated successfully!');
  }
}
```

## Best Practices

### 1. Schema Versioning

```json
{
  "$id": "https://example.com/schemas/tokens/v1.0.0.json",
  "version": "1.0.0",
  "$comment": "Breaking changes will increment major version",
  
  // Use $ref for version-specific schemas
  "properties": {
    "colors": {
      "$ref": "https://example.com/schemas/tokens/colors/v1.0.0.json"
    }
  }
}
```

### 2. Strict Validation

```typescript
const result = transformer.transform(tokens, {
  strictRequired: true,
  additionalProperties: false,
  validationRules: {
    minProperties: 4,
    maxProperties: 50
  }
});
```

### 3. Descriptive Errors

```typescript
// Custom error messages
const schema = {
  properties: {
    colors: {
      properties: {
        primary: {
          $ref: '#/$defs/colorScale',
          errorMessage: 'Primary color must be a valid color scale with at least 50, 500, and 900 shades'
        }
      }
    }
  }
};
```

### 4. Progressive Enhancement

```typescript
// Start with basic schema
const basicSchema = transformer.transform(tokens, {
  draft: '07',
  includeExamples: false
});

// Add advanced features for newer tools
const advancedSchema = transformer.transform(tokens, {
  draft: '2020-12',
  includeExamples: true,
  includeDescriptions: true,
  definitions: customDefinitions
});
```

## Performance Considerations

### 1. Schema Caching

```typescript
// Cache compiled validators
const validatorCache = new Map();

function getValidator(schemaId: string) {
  if (!validatorCache.has(schemaId)) {
    const schema = loadSchema(schemaId);
    const validator = ajv.compile(schema);
    validatorCache.set(schemaId, validator);
  }
  return validatorCache.get(schemaId);
}
```

### 2. Lazy Schema Loading

```typescript
// Load schemas on demand
async function validateWithSchema(tokens: any, schemaPath: string) {
  const schema = await import(schemaPath);
  return validateTokensAgainstSchema(tokens, schema.default);
}
```

### 3. Streaming Validation

```typescript
// For large token files
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { JSONStream } from 'JSONStream';

async function validateLargeTokenFile(filePath: string) {
  const validator = ajv.compile(schema);
  
  await pipeline(
    createReadStream(filePath),
    JSONStream.parse('$*'),
    async function* (source) {
      for await (const token of source) {
        if (!validator(token)) {
          yield { token, errors: validator.errors };
        }
      }
    }
  );
}
```

## Troubleshooting

### Common Issues

1. **Schema resolution errors**
   ```typescript
   // Ensure proper base URI
   const result = transformer.transform(tokens, {
     schemaId: 'https://example.com/schemas/tokens.json',
     metaSchema: 'https://json-schema.org/draft/2020-12/schema'
   });
   ```

2. **Validation too strict**
   ```typescript
   // Allow additional properties for extensibility
   const result = transformer.transform(tokens, {
     additionalProperties: true,
     strictRequired: false
   });
   ```

3. **Pattern matching issues**
   ```typescript
   // Test patterns separately
   const colorPattern = /^#[0-9a-fA-F]{6}$/;
   console.log(colorPattern.test('#ff0000')); // Should be true
   ```

## Migration Guide

### From Manual Validation to Schema

```typescript
// Before: Manual validation
function validateTokens(tokens) {
  if (!tokens.colors?.primary) {
    throw new Error('Missing primary color');
  }
  // ... lots of manual checks
}

// After: Schema-based validation
const { schema } = transformer.transform(baseTokens);
const validation = validateTokensAgainstSchema(tokens, schema);
if (!validation.valid) {
  throw new Error(`Validation failed: ${validation.errors}`);
}
```

### From Custom Schemas to Generated

```typescript
// Before: Hand-written schema
const schema = {
  type: 'object',
  properties: {
    colors: { type: 'object' }
    // ... manually maintained
  }
};

// After: Generated from tokens
const { schema } = transformer.transform(tokens, {
  includeExamples: true,
  includeDescriptions: true
});
```

## API Reference

### JSONSchemaTransformer Class

```typescript
class JSONSchemaTransformer implements TokenTransformer<JSONSchemaResult> {
  transform(tokens: TokenSystem, options?: JSONSchemaOptions): JSONSchemaResult;
  
  // Helper methods
  private generateMainSchema(tokens: TokenSystem, options: JSONSchemaOptions): object;
  private generateCategorySchemas(tokens: TokenSystem, options: JSONSchemaOptions): Record<string, object>;
  private generateDefinitions(tokens: TokenSystem, options: JSONSchemaOptions): Record<string, object>;
  private generateValidation(schema: object): (tokens: any) => ValidationResult;
}
```

### JSONSchemaResult Interface

```typescript
interface JSONSchemaResult {
  schema: object;                    // Main schema
  schemas?: Record<string, object>;  // Category schemas
  definitions?: Record<string, object>; // Shared definitions
  full: string;                      // Complete schema as string
}
```

### ValidationResult Interface

```typescript
interface ValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    keyword: string;
    params: any;
  }>;
}
```

## Next Steps

- [TypeScript Type Transformer](./typescript-transformer.md) - Generate type definitions
- [CSS Variable Transformer](./css-transformer.md) - Generate CSS custom properties
- [Tailwind Config Transformer](./tailwind-transformer.md) - Generate Tailwind configurations