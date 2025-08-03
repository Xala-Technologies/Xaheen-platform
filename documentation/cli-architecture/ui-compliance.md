# UI Compliance Engine Documentation

## Overview

The UI Compliance Engine ensures all generated code strictly adheres to the Xala UI System v5 rules, WCAG 2.2 AAA standards, and project-specific compliance requirements. It provides validation, auto-fixing, and reporting capabilities.

## Core Principles

### Xala UI System v5 Rules

1. **❌ NO raw HTML elements** (div, span, p, h1-h6, button, input, etc.)
2. **✅ ONLY semantic components** from @xala-technologies/ui-system
3. **❌ NO hardcoded styling** (no style prop, no arbitrary Tailwind values)
4. **✅ MANDATORY design token usage** for all styling
5. **✅ Enhanced 8pt Grid System** - all spacing in 8px increments
6. **✅ WCAG 2.2 AAA compliance** for accessibility
7. **❌ NO hardcoded user-facing text** - ALL text must use t() function
8. **✅ MANDATORY localization**: English, Norwegian Bokmål, French, Arabic
9. **✅ Explicit TypeScript return types** (no 'any' types)
10. **✅ Maximum 200 lines per file**, 20 lines per function

## Validation System

### Component Validation

```typescript
const validator = new XalaValidator();

// Validate a component
const result = validator.validateComponent(componentCode, 'Button.tsx');

// Result structure
{
  isValid: boolean;
  violations: Violation[];
  warnings: Warning[];
  suggestions: Suggestion[];
  metrics: {
    linesOfCode: number;
    functionComplexity: number;
    accessibilityScore: number;
    tokenCoverage: number;
  };
}
```

### Violation Types

```typescript
interface Violation {
  rule: ComplianceRule;
  severity: 'error' | 'warning';
  line: number;
  column: number;
  message: string;
  code: string;
  fix?: {
    range: [number, number];
    replacement: string;
  };
}
```

## Compliance Rules

### 1. Design Token Rules

```typescript
// ❌ FORBIDDEN
<div className="p-4 mb-6 text-blue-600 bg-gray-100">
<button style={{ padding: '16px' }}>
<span className="text-[18px] bg-[#f0f0f0]">

// ✅ REQUIRED
<Stack spacing="4">
<Button variant="primary" size="lg">
<Text color="primary.600" size="lg">
```

**Validation Logic:**
- Scans for hardcoded Tailwind classes
- Checks for inline styles
- Validates design token usage
- Ensures 8pt grid compliance

### 2. Component Rules

```typescript
// ❌ FORBIDDEN
<div>
  <h1>Title</h1>
  <p>Description</p>
  <button onClick={handleClick}>Submit</button>
</div>

// ✅ REQUIRED
<Stack spacing="4">
  <Heading level={1}>{t('page.title')}</Heading>
  <Text variant="body">{t('page.description')}</Text>
  <Button variant="primary" onClick={handleClick}>
    {t('button.submit')}
  </Button>
</Stack>
```

**Validation Logic:**
- AST parsing to detect HTML elements
- Component import verification
- Semantic structure validation

### 3. Accessibility Rules

```typescript
// ❌ FORBIDDEN
<Button onClick={handleClick}>X</Button>
<img src="logo.png" />
<div onClick={handleClick}>Clickable</div>

// ✅ REQUIRED
<Button onClick={handleClick} aria-label={t('button.close')}>
  <Icon name="close" />
</Button>
<Image src="logo.png" alt={t('company.logo')} />
<Button variant="ghost" onClick={handleClick}>
  {t('action.click')}
</Button>
```

**Validation Checks:**
- ARIA labels on interactive elements
- Alt text on images
- Keyboard navigation support
- Focus management
- Color contrast ratios

### 4. Localization Rules

```typescript
// ❌ FORBIDDEN
<Text>Welcome to our app</Text>
<Button>Submit Form</Button>
const errorMessage = "Invalid input";

// ✅ REQUIRED
<Text>{t('welcome.message')}</Text>
<Button>{t('form.submit')}</Button>
const errorMessage = t('error.invalid_input');
```

**Validation Logic:**
- String literal detection
- Translation function usage
- RTL support verification
- Locale file existence

## Auto-Fix Capabilities

### Design Token Auto-Fix

```typescript
const autoFixer = new ComplianceAutoFixer();

// Auto-fix violations
const fixedCode = autoFixer.fix(code, violations);

// Examples of auto-fixes:
// p-4 → spacing="4"
// text-blue-600 → color="primary.600"
// bg-gray-100 → bg="neutral.100"
// h-12 → height="12"
```

### Component Migration

```typescript
// Automatic HTML to Xala component migration
const migrator = new ComponentMigrator();

const migrated = migrator.migrate(`
  <div className="p-4">
    <h1>Title</h1>
    <button onClick={click}>Submit</button>
  </div>
`);

// Result:
<Stack spacing="4">
  <Heading level={1}>Title</Heading>
  <Button onClick={click}>Submit</Button>
</Stack>
```

## Compliance Profiles

### Standard Profiles

```typescript
enum ComplianceProfile {
  MINIMAL = 'minimal',        // Basic Xala rules
  STANDARD = 'standard',      // Xala + WCAG AA
  STRICT = 'strict',          // Xala + WCAG AAA
  ENTERPRISE = 'enterprise',  // All rules + custom
  NORWEGIAN = 'norwegian'     // Norwegian compliance
}

// Apply profile
validator.setProfile(ComplianceProfile.STRICT);
```

### Custom Profiles

```typescript
// Create custom compliance profile
const customProfile: ComplianceProfile = {
  name: 'fintech-compliance',
  rules: [
    ...standardRules,
    'no-console-logs',
    'secure-data-handling',
    'audit-trail-required'
  ],
  severity: {
    'no-raw-html': 'error',
    'design-tokens': 'error',
    'localization': 'warning'
  }
};

validator.registerProfile(customProfile);
```

## Integration with CLI

### Component Generation

```typescript
// During component generation
const componentCode = generateComponent(config);
const validation = validator.validateComponent(componentCode);

if (!validation.isValid) {
  // Attempt auto-fix
  const fixed = autoFixer.fix(componentCode, validation.violations);
  
  // Re-validate
  const revalidation = validator.validateComponent(fixed);
  
  if (!revalidation.isValid) {
    throw new ComplianceError(revalidation.violations);
  }
}
```

### Pre-commit Hooks

```typescript
// Git pre-commit validation
export async function validateChangedFiles(files: string[]) {
  const validator = new XalaValidator();
  const results = [];
  
  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      const content = await readFile(file);
      const result = validator.validateComponent(content, file);
      results.push(result);
    }
  }
  
  return results;
}
```

## Reporting

### Compliance Report Generation

```typescript
const reporter = new ComplianceReporter();

// Generate markdown report
const mdReport = reporter.generateMarkdownReport(validationResults);

// Generate HTML report
const htmlReport = reporter.generateHTMLReport(validationResults, {
  includeMetrics: true,
  includeCodeSnippets: true,
  theme: 'professional'
});

// Generate CI/CD report
const ciReport = reporter.generateCIReport(validationResults, {
  format: 'junit',
  failOnWarnings: false
});
```

### Report Structure

```markdown
# UI Compliance Report

Generated: 2024-01-03T10:30:00Z
Profile: STRICT (Xala v5 + WCAG AAA)

## Summary
- Files Scanned: 45
- Violations: 12
- Warnings: 8
- Auto-Fixed: 10

## Violations by Rule
1. **No Raw HTML** (5 violations)
   - components/Card.tsx:15 - Using <div> instead of Stack
   - pages/Home.tsx:42 - Using <h1> instead of Heading

2. **Design Tokens** (4 violations)
   - components/Button.tsx:8 - Hardcoded color "blue-600"
   - layouts/Main.tsx:23 - Arbitrary spacing "p-[18px]"

## Recommendations
- Enable auto-fix in CI pipeline
- Add pre-commit hooks
- Review component library usage
```

## Best Practices

### 1. Development Workflow

```typescript
// 1. Generate component with validation
xaheen add component Button --validate

// 2. Auto-fix violations
xaheen fix components/Button.tsx

// 3. Generate compliance report
xaheen validate --report
```

### 2. CI/CD Integration

```yaml
# GitHub Actions example
- name: UI Compliance Check
  run: |
    xaheen validate src/**/*.tsx --profile strict
    xaheen report --format junit > compliance-report.xml
```

### 3. IDE Integration

```json
// VSCode settings
{
  "xaheen.validateOnSave": true,
  "xaheen.autoFixOnSave": true,
  "xaheen.complianceProfile": "strict"
}
```

## Troubleshooting

### Common Issues

1. **False Positives**
   ```typescript
   // Ignore specific rules
   // xaheen-disable-next-line no-raw-html
   <div dangerouslySetInnerHTML={sanitizedHTML} />
   ```

2. **Performance Issues**
   ```typescript
   // Use incremental validation
   validator.validateIncremental(changedFiles);
   ```

3. **Custom Components**
   ```typescript
   // Register custom components
   validator.registerCustomComponent('MyCard', {
     extends: 'Card',
     props: CardProps
   });
   ```

## API Reference

### XalaValidator

```typescript
class XalaValidator {
  constructor(options?: ValidatorOptions);
  
  // Validation methods
  validateComponent(code: string, filename: string): ValidationResult;
  validateFile(filepath: string): Promise<ValidationResult>;
  validateProject(projectPath: string): Promise<ProjectValidation>;
  
  // Configuration
  setProfile(profile: ComplianceProfile): void;
  addRule(rule: ComplianceRule): void;
  removeRule(ruleName: string): void;
  
  // Auto-fix
  canAutoFix(violation: Violation): boolean;
  autoFix(code: string, violations: Violation[]): string;
}
```

### ComplianceReporter

```typescript
class ComplianceReporter {
  constructor(options?: ReporterOptions);
  
  // Report generation
  generateMarkdownReport(results: ValidationResult[]): string;
  generateHTMLReport(results: ValidationResult[], options?: HTMLOptions): string;
  generateCIReport(results: ValidationResult[], options?: CIOptions): string;
  generateDashboard(results: ValidationResult[]): Dashboard;
  
  // Analytics
  getMetrics(results: ValidationResult[]): ComplianceMetrics;
  getTrends(history: ValidationResult[][]): TrendAnalysis;
}
```

## Future Enhancements

1. **AI-Powered Suggestions**: ML-based component recommendations
2. **Visual Regression Testing**: Screenshot comparison for UI changes
3. **Performance Validation**: Runtime performance checks
4. **Custom Rule Builder**: Visual rule creation interface
5. **Real-time Validation**: IDE plugin with instant feedback