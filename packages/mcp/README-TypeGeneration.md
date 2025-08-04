# TypeScript Type Generation System

A comprehensive TypeScript type generation system for Xala UI components that creates strict type definitions from JSON component specifications with Norwegian compliance and multi-platform support.

## Features

- **Strict TypeScript**: Zero tolerance for `any` types - generates precise type definitions
- **Norwegian Compliance**: Built-in NSM classification and GDPR compliance types
- **Multi-Platform Support**: React, Vue, Angular, Svelte platform-specific types
- **Runtime Validation**: Zod schemas for component prop validation
- **Accessibility First**: WCAG AAA compliance with screen reader support
- **Auto-Documentation**: JSDoc comments generated from specifications
- **Type Guards**: Runtime type checking with branded types
- **Performance Monitoring**: Bundle size and render time tracking

## Quick Start

### 1. Install Dependencies

```bash
npm install zod glob @types/node typescript
```

### 2. Generate Types

```bash
# Generate from default specifications
node scripts/generate-types.js

# Generate from custom directory
node scripts/generate-types.js --input ./my-specs --output ./my-types

# Generate with specific platforms
node scripts/generate-types.js --platforms react,vue --nsm RESTRICTED
```

### 3. Use Generated Types

```typescript
import { ButtonProps, isButtonProps, ButtonValidators } from './generated/button.types.js';

// Type-safe component props
const MyButton = (props: ButtonProps) => {
  // Runtime validation
  if (!isButtonProps(props)) {
    throw new Error('Invalid button props');
  }
  
  // Norwegian compliance check
  const nsmLevel = extractNSMClassification(props);
  if (nsmLevel && nsmLevel !== 'OPEN') {
    // Handle classified data
  }
  
  return <button {...props} />;
};
```

## Architecture

### Type Generation Pipeline

```
JSON Specifications → TypeScript Interfaces → Runtime Validation → Documentation
        ↓                      ↓                     ↓                  ↓
  Schema Validation    Type Definitions      Zod Schemas        JSDoc Comments
```

### Component Specification Structure

```json
{
  "metadata": {
    "name": "Button",
    "version": "1.0.0",
    "category": "basic",
    "description": "..."
  },
  "compliance": {
    "norwegian": {
      "nsmClassification": "OPEN",
      "gdprCompliant": true
    },
    "wcag": { "level": "AAA" }
  },
  "props": {
    "schema": {
      "variant": {
        "type": { "custom": "variant", "values": ["primary", "secondary"] },
        "description": "Button style variant",
        "defaultValue": "primary"
      }
    }
  }
}
```

### Generated Type Structure

```typescript
// Main Props Interface
export interface ButtonProps {
  readonly variant?: 'primary' | 'secondary';
  // ... other props
}

// Platform-Specific Types
export interface ButtonReactProps extends ButtonProps {
  readonly ref?: RefObject<HTMLElement>;
}

// Validation
export const isButtonProps = (props: unknown): props is ButtonProps => {
  // Runtime type checking
};

// Norwegian Compliance
export interface ButtonComplianceMetadata {
  readonly nsmClassification: 'OPEN';
  readonly gdprCompliant: true;
}
```

## Norwegian Compliance

### NSM Classification Levels

```typescript
type NSMClassification = 
  | 'OPEN'          // Public information
  | 'RESTRICTED'    // Limited distribution  
  | 'CONFIDENTIAL' // Sensitive information
  | 'SECRET';       // Highly classified
```

### Secure Props Pattern

```typescript
// Components with classified data
type SecureProps<T, Level extends NSMClassification> = T & {
  readonly _compliance: NorwegianComplianceMetadata<Level>;
  readonly _auditTrail?: readonly AuditEntry[];
};

// Usage
const classifiedButton: SecureProps<ButtonProps, 'RESTRICTED'> = {
  variant: 'primary',
  _compliance: {
    nsmClassification: 'RESTRICTED',
    gdprCompliant: true,
    auditRequired: true
  }
};
```

## Multi-Platform Support

### Platform-Specific Types

```typescript
// React
export interface ButtonReactProps extends ButtonProps {
  readonly ref?: RefObject<HTMLElement>;
  readonly key?: string | number;
}

// Vue
export interface ButtonVueProps extends ButtonProps {
  readonly ref?: string;
  readonly slots?: Record<string, VNode>;
}

// Angular
export interface ButtonAngularProps extends ButtonProps {
  readonly templateRef?: TemplateRef<any>;
}
```

### Platform Adapter

```typescript
const adapter = createComponentFactory<ButtonSpecification>({
  specification: buttonSpec,
  platform: 'react',
  compliance: { nsmClassification: 'OPEN' }
});

const result = adapter({
  variant: 'primary',
  onClick: handleClick
});
```

## Runtime Validation

### Zod Schemas

```typescript
import { z } from 'zod';

// Generated validation schemas
export const ButtonPropsSchema = z.object({
  variant: z.enum(['primary', 'secondary']).default('primary'),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).default('md'),
  disabled: z.boolean().default(false)
});

// Validation function
export const validateButtonProps = (props: unknown) => {
  return ButtonPropsSchema.safeParse(props);
};
```

### Norwegian Compliance Validation

```typescript
// Validate NSM classification
export const validateNorwegianCompliance = <T>(
  data: T,
  requiredLevel: NSMClassification = 'OPEN'
): ValidationResult<T> => {
  // Implementation checks classification hierarchy
};
```

## Accessibility Features

### WCAG AAA Compliance

```typescript
export interface WCAGCompliantProps {
  readonly wcagLevel: 'A' | 'AA' | 'AAA';
  readonly colorContrast: {
    readonly normal: number; // >= 7.0 for AAA
    readonly large: number;  // >= 4.5 for AAA
  };
  readonly keyboardAccessible: boolean;
  readonly screenReaderCompatible: boolean;
}
```

### Screen Reader Support

```typescript
export interface AccessibilityProps {
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
  readonly 'aria-expanded'?: boolean;
  readonly role?: string;
  readonly tabIndex?: number;
}
```

## Performance Optimization

### Bundle Size Tracking

```typescript
export interface PerformanceMetrics {
  readonly bundleSize: {
    readonly max: '2KB';
    readonly gzipped: '800B';
  };
  readonly renderTime: {
    readonly initial: '<16ms';
    readonly update: '<8ms';
  };
}
```

### Type-Safe Variants

```typescript
// Compound variants with type safety
export const createVariants = <T extends Record<string, any>>(
  config: VariantConfig<T>
) => {
  return (props?: Partial<T>): string => {
    // Generate CSS classes with type checking
  };
};
```

## CLI Usage

### Command Line Options

```bash
# Basic generation
generate-types

# Custom input/output
generate-types --input ./specs --output ./types

# Platform-specific
generate-types --platforms react,vue,angular

# Norwegian compliance level
generate-types --nsm RESTRICTED

# Validation only
generate-types --no-validation --no-docs

# Watch mode
generate-types --watch
```

### Configuration File

```typescript
// generate-types.config.ts
export default {
  inputDir: './specifications',
  outputDir: './generated-types',
  platforms: ['react', 'vue'],
  nsmClassification: 'OPEN',
  includeValidation: true,
  includeDocumentation: true,
  strictMode: true
};
```

## Examples

### Basic Button Component

```json
{
  "metadata": {
    "name": "Button",
    "category": "basic",
    "description": "Interactive button component"
  },
  "props": {
    "schema": {
      "variant": {
        "type": { "custom": "variant", "values": ["primary", "secondary"] },
        "defaultValue": "primary"
      },
      "onClick": {
        "type": { "complex": "function" },
        "signature": {
          "parameters": [{ "name": "event", "type": "MouseEvent" }],
          "returnType": "void"
        }
      }
    }
  }
}
```

### Generated Types

```typescript
export interface ButtonProps {
  readonly variant?: 'primary' | 'secondary';
  readonly onClick?: (event: MouseEvent) => void;
}

export const ButtonDefaults = {
  variant: 'primary'
} as const;

export const isButtonProps = (props: unknown): props is ButtonProps => {
  return typeof props === 'object' && props !== null;
};
```

### Advanced DataTable Component

See `examples/specifications/data-table.json` for a complex component with:
- Nested object types
- Array constraints
- Function signatures
- Platform-specific implementations
- Norwegian compliance metadata
- Accessibility configurations

## Development

### Project Structure

```
src/
├── types/
│   ├── specification-types.ts    # Base type definitions
│   └── utility-types.ts          # Helper types and guards
├── validation/
│   └── component-schemas.ts      # Zod validation schemas
scripts/
└── generate-types.ts            # Main generation script
examples/
├── specifications/              # Sample JSON specs
└── generated-types/            # Generated TypeScript types
```

### Building

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run type generation
npm run generate

# Generate examples
npm run generate:examples

# Validate specifications
npm run validate
```

### Testing

```bash
# Run type checking
npm run type-check

# Validate generated types
npm run test:types

# Norwegian compliance tests
npm run test:compliance
```

## Integration

### With Build Tools

```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new GenerateTypesPlugin({
      input: './src/specifications',
      output: './src/generated/types',
      watch: process.env.NODE_ENV === 'development'
    })
  ]
};
```

### With CI/CD

```yaml
# .github/workflows/types.yml
name: Generate Types
on: [push]
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate types
        run: |
          npm install
          npm run generate
          npm run validate
```

### With Norwegian Government Standards

```typescript
// Altinn compliance
const altinnButton = createComponentFactory({
  specification: buttonSpec,
  platform: 'react',
  compliance: {
    nsmClassification: 'RESTRICTED',
    designSystem: {
      altinnCompliant: true,
      governmentApproved: true
    }
  }
});
```

## Best Practices

### Specification Design

1. **Use semantic names**: `isLoading` instead of `loading`
2. **Provide clear descriptions**: Minimum 10 characters with usage context
3. **Set appropriate defaults**: Reduce required props
4. **Include examples**: Help developers understand usage
5. **Consider accessibility**: Always include ARIA attributes

### Type Safety

1. **Avoid `any` types**: Use specific unions or branded types
2. **Use readonly modifiers**: Prevent accidental mutations
3. **Implement type guards**: Runtime validation
4. **Brand primitive types**: `ComponentName` instead of `string`
5. **Validate at boundaries**: API responses, user input

### Norwegian Compliance

1. **Classify data appropriately**: Use correct NSM levels
2. **Implement audit trails**: For RESTRICTED and above
3. **Support Norwegian locale**: `nb-NO` as default
4. **Follow Altinn guidelines**: Government design system
5. **Encrypt sensitive data**: CONFIDENTIAL and SECRET levels

## Troubleshooting

### Common Issues

**Type generation fails with validation errors**
```bash
# Check specification validity
node scripts/generate-types.js --validate-only
```

**Missing platform-specific types**
```bash
# Ensure platform is supported
node scripts/generate-types.js --platforms react,vue
```

**Norwegian compliance errors**
```bash
# Validate NSM classification
node scripts/generate-types.js --nsm RESTRICTED
```

### Performance Issues

**Large specification files**
- Split into smaller components
- Use schema references
- Enable streaming processing

**Slow type generation**
- Use incremental builds
- Cache validated schemas
- Parallel processing

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Validate Norwegian compliance
5. Test accessibility features

## License

MIT License - See LICENSE file for details.

---

**Norwegian Government Compliance**: This tool supports NSM security classifications and GDPR requirements for government and enterprise applications.

**Accessibility**: All generated types include WCAG AAA compliance features and screen reader support.

**Type Safety**: Zero tolerance for `any` types - every generated interface is strictly typed with runtime validation.
