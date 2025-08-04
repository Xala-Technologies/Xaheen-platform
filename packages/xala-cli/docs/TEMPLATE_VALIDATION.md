# Template Validation System

## Overview

The Template Validation System is a comprehensive validation framework for Handlebars templates and React components, ensuring compliance with semantic UI patterns, accessibility standards (WCAG AAA), Norwegian NSM requirements, and TypeScript strict mode.

## Features

### 🔍 **Comprehensive Validation Rules**

#### Semantic Component Rules
- **No Raw HTML**: Prevents usage of raw HTML elements (`div`, `span`, `button`, etc.)
- **Semantic Component Usage**: Ensures templates use components from `@xala-technologies/ui-system`
- **Component Structure**: Validates proper React component structure with CVA pattern

#### Design Token Rules
- **Design Token Usage**: Enforces semantic Tailwind classes over hardcoded values
- **No Hardcoded Values**: Prevents inline styles and arbitrary Tailwind values
- **Token Reference**: Validates consistent token naming patterns

#### Accessibility Rules (WCAG AAA)
- **ARIA Attributes**: Ensures proper ARIA labels and accessibility attributes
- **Semantic HTML**: Validates semantic HTML structure and heading hierarchy
- **Keyboard Navigation**: Checks for keyboard navigation support
- **Color Contrast**: Validates color usage with text alternatives
- **Screen Reader**: Ensures screen reader compatibility

#### Responsive Design Rules
- **Breakpoint Usage**: Validates responsive breakpoint usage
- **Responsive Classes**: Checks responsive class combinations
- **Flexbox Grid**: Validates proper flexbox and grid usage

#### TypeScript Rules
- **TypeScript Strict**: Validates strict TypeScript compliance
- **Interface Definition**: Ensures proper interface definitions for props
- **No Any Type**: Prevents usage of `any` type
- **Explicit Return Types**: Ensures functions have explicit return types

#### Norwegian NSM Compliance Rules
- **Data Classification**: Validates Norwegian NSM data classification compliance
- **Security Labels**: Ensures proper security labeling
- **Localization Norwegian**: Validates Norwegian localization support
- **Compliance Documentation**: Ensures proper compliance documentation

## Usage

### CLI Command

```bash
# Validate single template
xala validate --path src/templates/card.hbs

# Validate directory
xala validate --path src/templates --pattern "**/*.{hbs,tsx}"

# Generate report
xala validate --path src/templates --output report.md --format markdown

# CI mode (exit with error code if violations found)
xala validate --path src/templates --ci

# Watch mode
xala validate --path src/templates --watch

# Auto-fix mode (experimental)
xala validate --path src/templates --fix
```

### Programmatic Usage

```typescript
import { TemplateValidator } from '@xala-technologies/xala-cli';

const validator = new TemplateValidator();

// Validate single template
const result = await validator.validateTemplate('path/to/template.hbs');

// Validate directory
const results = await validator.validateDirectory('src/templates');

// Generate report
const report = validator.generateReport(results);
console.log(report);
```

### Integration with Template Compilation

```typescript
import { TemplateCompiler } from '@xala-technologies/xala-cli';

const compiler = new TemplateCompiler();

const result = await compiler.compileTemplate('template.hbs', context, {
  validateBefore: true,
  validateAfter: true,
  strict: true,
  autofix: true,
});

console.log(`Validation score: ${result.validationResults.after?.score}%`);
```

## Configuration

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--path` | Path to template file or directory | `process.cwd()` |
| `--pattern` | Glob pattern for template files | `**/*.{hbs,tsx,ts,vue,svelte}` |
| `--output` | Output file for validation report | - |
| `--format` | Output format (console\|json\|markdown\|html) | `console` |
| `--severity` | Filter by severity level (error\|warning\|all) | `all` |
| `--fix` | Attempt to auto-fix violations | `false` |
| `--ci` | CI mode - exit with error code if violations | `false` |
| `--watch` | Watch mode - continuously validate | `false` |

### Compilation Options

```typescript
interface CompilationOptions {
  readonly validateBefore: boolean;    // Validate before compilation
  readonly validateAfter: boolean;     // Validate after compilation
  readonly strict: boolean;            // Strict mode - fail on errors
  readonly autofix: boolean;           // Apply auto-fixes where possible
  readonly outputDir?: string;         // Output directory
  readonly format?: 'tsx' | 'vue' | 'svelte' | 'angular';
}
```

## Validation Results

### Template Validation Result

```typescript
interface TemplateValidationResult {
  readonly isValid: boolean;
  readonly filePath: string;
  readonly violations: ReadonlyArray<ValidationViolation>;
  readonly warnings: ReadonlyArray<ValidationWarning>;
  readonly score: number; // 0-100
  readonly compliance: {
    readonly semantic: boolean;
    readonly accessibility: boolean;
    readonly designTokens: boolean;
    readonly responsive: boolean;
    readonly typeScript: boolean;
    readonly norwegian: boolean;
  };
}
```

### Violation Structure

```typescript
interface ValidationViolation {
  readonly rule: string;
  readonly severity: 'error' | 'warning';
  readonly message: string;
  readonly line?: number;
  readonly column?: number;
  readonly suggestion: string;
}
```

## Examples

### ✅ Valid CVA Component Template

```typescript
/**
 * @fileoverview Card Component - CVA Design System Compliant
 * @description Card component using CVA pattern with semantic tokens
 * @version 5.0.0
 * @compliance WCAG AAA, NSM, CVA Pattern
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@xala-technologies/ui-system/utils';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-md',
  {
    variants: {
      variant: {
        default: 'border-border',
        outlined: 'border-2 border-border bg-transparent',
        elevated: 'border-0 shadow-lg',
      },
      padding: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  readonly children: React.ReactNode;
  readonly 'data-testid'?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, variant, padding, 'data-testid': testId, ...props }, ref) => {
    return (
      <Container
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        data-testid={testId}
        role="article"
        aria-label="Card content"
        {...props}
      >
        {children}
      </Container>
    );
  }
);

Card.displayName = 'Card';
```

### ❌ Invalid Template with Violations

```typescript
// Missing file documentation
export const BadCard = (props: any) => { // ❌ any type usage
  return (
    <div className="p-4 border rounded"> {/* ❌ Raw HTML */}
      <h2>Title</h2> {/* ❌ Raw HTML */}
      <p style={{ color: '#ff0000' }}>Content</p> {/* ❌ Inline styles, hardcoded color */}
      <button onClick={props.onClick}>Click me</button> {/* ❌ Raw HTML, missing ARIA */}
    </div>
  );
};
```

### 🔧 Auto-Fixed Template

```typescript
/**
 * @fileoverview FixedCard Component - CVA Design System Compliant
 * @description Auto-fixed card component
 * @version 5.0.0
 * @compliance WCAG AAA, CVA Pattern
 */

export interface FixedCardProps {
  readonly onClick: () => void;
}

export const FixedCard = ({ onClick }: FixedCardProps): JSX.Element => {
  return (
    <Container className="p-4 border rounded">
      <Typography variant="h2">Title</Typography>
      <Typography className="text-destructive">Content</Typography>
      <Button onClick={onClick} ariaLabel="Click button">Click me</Button>
    </Container>
  );
};
```

## Report Formats

### Console Output

```
📊 Template Validation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total templates: 25
✅ Valid: 20
❌ Invalid: 5
📈 Average score: 87%

🛡️ Compliance Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Semantic: 22/25 (88%)
⚠️ Accessibility: 18/25 (72%)
✅ DesignTokens: 25/25 (100%)
✅ Responsive: 23/25 (92%)
✅ TypeScript: 24/25 (96%)
⚠️ Norwegian: 15/25 (60%)
```

### JSON Report

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "summary": {
    "totalTemplates": 25,
    "validTemplates": 20,
    "invalidTemplates": 5,
    "averageScore": 87
  },
  "results": [
    {
      "filePath": "/src/templates/card.hbs",
      "isValid": true,
      "score": 95,
      "compliance": {
        "semantic": true,
        "accessibility": true,
        "designTokens": true,
        "responsive": true,
        "typeScript": true,
        "norwegian": true
      },
      "violations": [],
      "warnings": []
    }
  ]
}
```

### Markdown Report

```markdown
# Template Validation Report

**Total Templates**: 25
**Valid Templates**: 20
**Invalid Templates**: 5
**Average Score**: 87%

## Compliance Overview

- **Semantic**: ✅ 22/25 (88%)
- **Accessibility**: ⚠️ 18/25 (72%)
- **DesignTokens**: ✅ 25/25 (100%)
- **Responsive**: ✅ 23/25 (92%)
- **TypeScript**: ✅ 24/25 (96%)
- **Norwegian**: ⚠️ 15/25 (60%)

## Detailed Results

### ❌ Templates with Errors

#### /src/templates/bad-card.hbs (Score: 45%)
- ❌ **no-raw-html** (Line 5): Raw HTML element <div> found
  - *Suggestion*: Replace <div> with Container component
- ❌ **aria-attributes** (Line 8): Button missing accessibility label
  - *Suggestion*: Add ariaLabel prop to Button component
```

## Best Practices

### 1. Use Semantic Components

```typescript
// ❌ Avoid
<div className="flex items-center">
  <span>Hello</span>
  <button>Click</button>
</div>

// ✅ Prefer
<Stack direction="row" align="center">
  <Typography>Hello</Typography>
  <Button ariaLabel="Action button">Click</Button>
</Stack>
```

### 2. Use Design Tokens

```typescript
// ❌ Avoid
<div style={{ color: '#ff0000', padding: '16px' }}>
  <span className="text-[#00ff00]">Text</span>
</div>

// ✅ Prefer
<Container className="p-4">
  <Typography className="text-destructive">Text</Typography>
</Container>
```

### 3. Ensure Accessibility

```typescript
// ❌ Avoid
<button onClick={handleSubmit}>
  <img src="icon.svg" />
</button>

// ✅ Prefer
<Button 
  onClick={handleSubmit}
  ariaLabel="Submit form"
  role="button"
>
  <img src="icon.svg" alt="Submit icon" />
</Button>
```

### 4. Responsive Design

```typescript
// ❌ Avoid
<div className="grid grid-cols-4">
  <div className="hidden">Navigation</div>
</div>

// ✅ Prefer
<Container className="grid grid-cols-1 md:grid-cols-4">
  <Container className="hidden md:block">Navigation</Container>
</Container>
```

### 5. TypeScript Strict

```typescript
// ❌ Avoid
export const Component = (props: any) => {
  // @ts-ignore
  return <div>{props.data.value}</div>;
};

// ✅ Prefer
export interface ComponentProps {
  readonly data: {
    readonly value: string;
  };
}

export const Component = ({ data }: ComponentProps): JSX.Element => {
  return <Typography>{data.value}</Typography>;
};
```

## Contributing

To add new validation rules:

1. Create rule class implementing `ValidationRule` interface
2. Add rule to `TemplateValidator` constructor
3. Add tests in `__tests__/template-validator.test.ts`
4. Update documentation

```typescript
export class MyCustomRule implements ValidationRule {
  readonly name = 'my-custom-rule';
  readonly description = 'Description of the rule';
  readonly severity = 'error' as const;
  readonly category = 'semantic' as const;

  validate(content: string, filePath: string): ValidationResult {
    // Implementation
    return {
      passed: true,
      violations: [],
      warnings: [],
      suggestions: [],
    };
  }
}
```

## Integration with CI/CD

### GitHub Actions

```yaml
name: Template Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx xala validate --path src/templates --ci --format json --output validation-report.json
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: validation-report
          path: validation-report.json
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npx xala validate --path src/templates --ci"
    }
  }
}
```

## Support

For questions or issues with the Template Validation System:

1. Check the [GitHub Issues](https://github.com/xala-technologies/xala-cli/issues)
2. Read the [API Documentation](./API.md)
3. Join our [Discord Community](https://discord.gg/xala-technologies)

## License

MIT © Xala Technologies