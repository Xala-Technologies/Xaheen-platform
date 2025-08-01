# AI Integration Guide for MCP Servers and Autonomous Agents

This guide provides comprehensive information for AI tools, MCP (Model Context Protocol) servers, and autonomous development agents working with the Xala UI System.

## Overview for AI Systems

The Xala UI System is designed with AI-first principles, providing machine-readable schemas, predictable patterns, and comprehensive metadata for autonomous development tools.

### Key AI-Friendly Features

1. **Structured Component Schemas**: All components have JSON schemas for validation
2. **Predictable Naming Conventions**: Consistent naming across all APIs
3. **Machine-Readable Metadata**: Component capabilities and constraints
4. **Type-Safe APIs**: Complete TypeScript definitions for code generation
5. **Validation Rules**: Built-in validation for Norwegian compliance

## Component Schema System

### Base Component Schema

```typescript
interface ComponentSchema {
  // Identification
  name: string;
  category:
    | 'action-feedback'
    | 'form'
    | 'layout'
    | 'data-display'
    | 'navigation'
    | 'platform'
    | 'ui';
  description: string;
  version: string;

  // Properties
  props: Record<string, PropertySchema>;
  requiredProps: string[];

  // Capabilities
  accessibility: AccessibilityCapabilities;
  norwegian: NorwegianCapabilities;

  // Constraints
  constraints: ComponentConstraints;

  // Usage patterns
  patterns: UsagePattern[];

  // Testing metadata
  testing: TestingMetadata;
}
```

### Property Schema

```typescript
interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'ReactNode';
  description: string;
  required: boolean;
  default?: unknown;
  constraints?: PropertyConstraints;
  examples: unknown[];
  deprecated?: boolean;
  since?: string;
}
```

## Code Generation Patterns

### 1. Basic Component Generation

```typescript
// Pattern for generating Button components
function generateButtonComponent(config: ButtonConfig): string {
  const template = `
import { Button } from '@xala-technologies/ui-system';

export function ${config.name}() {
  return (
    <Button
      variant="${config.variant}"
      size="${config.size}"
      ${config.norwegian ? `norwegian={{ classification: '${config.norwegian.classification}' }}` : ''}
      ${config.accessibility ? `ariaLabel="${config.accessibility.label}"` : ''}
    >
      ${config.children}
    </Button>
  );
}`;

  return template;
}
```

### 2. Form Generation with Norwegian Validation

```typescript
function generateNorwegianForm(fields: FormField[]): string {
  const formTemplate = `
import { Form, PersonalNumberInput, OrganizationNumberInput, Input, Button } from '@xala-technologies/ui-system';

export function GeneratedForm() {
  return (
    <Form onSubmit={handleSubmit}>
      ${fields.map(field => generateFormField(field)).join('\n      ')}
      
      <div className="form-actions">
        <Button type="submit" variant="primary">
          Submit
        </Button>
        <Button type="button" variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </Form>
  );
}`;

  return formTemplate;
}

function generateFormField(field: FormField): string {
  switch (field.type) {
    case 'personalNumber':
      return `<PersonalNumberInput
        labelKey="${field.labelKey}"
        required={${field.required}}
        validation={{ personalNumber: true }}
      />`;

    case 'organizationNumber':
      return `<OrganizationNumberInput
        labelKey="${field.labelKey}"
        required={${field.required}}
        enableBRREGCheck
      />`;

    default:
      return `<Input
        labelKey="${field.labelKey}"
        type="${field.type}"
        required={${field.required}}
        ${field.validation ? `validation={${JSON.stringify(field.validation)}}` : ''}
      />`;
  }
}
```

### 3. Layout Generation

```typescript
function generatePageLayout(config: PageLayoutConfig): string {
  return `
import { PageLayout, Container, Section } from '@xala-technologies/ui-system';

export function ${config.name}() {
  return (
    <PageLayout
      variant="${config.variant}"
      ${config.norwegian ? `norwegian={{ municipality: '${config.norwegian.municipality}' }}` : ''}
    >
      <Container size="${config.containerSize}">
        ${config.sections
          .map(
            section => `
        <Section spacing="${section.spacing}">
          {/* ${section.description} */}
          ${section.content}
        </Section>`
          )
          .join('')}
      </Container>
    </PageLayout>
  );
}`;
}
```

## Component Discovery API

### Getting Component Metadata

```typescript
interface ComponentDiscoveryAPI {
  // Get all available components
  getAllComponents(): ComponentSchema[];

  // Get component by name
  getComponent(name: string): ComponentSchema | null;

  // Get components by category
  getComponentsByCategory(category: ComponentCategory): ComponentSchema[];

  // Search components by capability
  searchComponents(query: ComponentQuery): ComponentSchema[];

  // Validate component usage
  validateComponent(name: string, props: Record<string, unknown>): ValidationResult;
}

// Usage example for AI systems
const api = new ComponentDiscoveryAPI();

// Get all button-like components
const actionComponents = api.getComponentsByCategory('action-feedback');

// Find components with Norwegian compliance
const norwegianComponents = api.searchComponents({
  capabilities: ['norwegian-compliance'],
});

// Validate component configuration
const validation = api.validateComponent('Button', {
  variant: 'primary',
  size: 'md',
  norwegian: { classification: 'ÅPEN' },
});
```

### Component Capability Detection

```typescript
interface ComponentCapabilities {
  // Core capabilities
  accessibility: {
    wcagLevel: 'AA' | 'AAA';
    screenReaderSupport: boolean;
    keyboardNavigation: boolean;
    colorContrastCompliant: boolean;
  };

  // Norwegian compliance
  norwegian: {
    nsmClassification: boolean;
    personalNumberValidation: boolean;
    organizationNumberValidation: boolean;
    municipalBranding: boolean;
    auditLogging: boolean;
  };

  // Form capabilities
  form: {
    validation: boolean;
    realTimeValidation: boolean;
    internationalValidation: boolean;
    customValidation: boolean;
  };

  // Layout capabilities
  layout: {
    responsive: boolean;
    platformSpecific: boolean;
    containerQueries: boolean;
    gridSupport: boolean;
  };
}
```

## Validation System for AI Tools

### Norwegian Compliance Validation

```typescript
interface NorwegianValidationRules {
  personalNumber: {
    format: RegExp;
    mod11Check: boolean;
    minimumAge?: number;
    maximumAge?: number;
  };

  organizationNumber: {
    format: RegExp;
    mod11Check: boolean;
    brregValidation?: boolean;
  };

  classification: {
    allowed: SecurityClassification[];
    requiresAudit: boolean;
    accessControl: boolean;
  };

  municipality: {
    validCodes: string[];
    brregIntegration: boolean;
  };
}

// Validation function for AI systems
function validateNorwegianCompliance(
  component: string,
  props: Record<string, unknown>
): NorwegianValidationResult {
  const rules = getNorwegianRules(component);
  const errors: ValidationError[] = [];

  // Validate personal number format
  if (props.personalNumber) {
    if (!rules.personalNumber.format.test(props.personalNumber as string)) {
      errors.push({
        field: 'personalNumber',
        code: 'INVALID_FORMAT',
        message: 'Personal number must be 11 digits',
      });
    }
  }

  // Validate classification level
  if (props.norwegian?.classification) {
    const classification = props.norwegian.classification as SecurityClassification;
    if (!rules.classification.allowed.includes(classification)) {
      errors.push({
        field: 'classification',
        code: 'INVALID_CLASSIFICATION',
        message: `Classification ${classification} not allowed for this component`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: generateWarnings(component, props),
  };
}
```

### Accessibility Validation

```typescript
interface AccessibilityValidationRules {
  colorContrast: {
    minimum: number;
    enhanced: number;
  };

  touchTargets: {
    minimumSize: number;
    spacing: number;
  };

  keyboardNavigation: {
    required: boolean;
    tabOrder: boolean;
    focusIndicators: boolean;
  };

  screenReader: {
    labels: boolean;
    descriptions: boolean;
    landmarks: boolean;
  };
}

function validateAccessibility(
  component: string,
  props: Record<string, unknown>
): AccessibilityValidationResult {
  // Implementation for accessibility validation
}
```

## Pattern Recognition for AI

### Common Component Patterns

```typescript
interface ComponentPattern {
  name: string;
  description: string;
  components: string[];
  structure: PatternStructure;
  examples: string[];
  contraindications: string[];
}

const COMMON_PATTERNS: ComponentPattern[] = [
  {
    name: 'Government Form',
    description: 'Form for collecting personal information with Norwegian compliance',
    components: ['Form', 'PersonalNumberInput', 'OrganizationNumberInput', 'Input', 'Button'],
    structure: {
      container: 'Form',
      inputs: ['PersonalNumberInput', 'OrganizationNumberInput', 'Input'],
      actions: ['Button'],
      validation: 'norwegian-compliance',
    },
    examples: ['Citizen registration form', 'Business license application', 'Tax filing form'],
    contraindications: ['Public information forms', 'Non-personal data collection'],
  },

  {
    name: 'Data Dashboard',
    description: 'Layout for displaying data with tables and charts',
    components: ['PageLayout', 'Container', 'Section', 'DataTable', 'Card'],
    structure: {
      container: 'PageLayout',
      layout: ['Container', 'Section'],
      content: ['DataTable', 'Card'],
      navigation: 'optional',
    },
    examples: [
      'Municipal statistics dashboard',
      'Financial reporting interface',
      'User management console',
    ],
    contraindications: ['Simple forms', 'Landing pages'],
  },
];
```

### Pattern Detection Algorithm

```typescript
function detectPattern(components: string[]): PatternMatch[] {
  const matches: PatternMatch[] = [];

  for (const pattern of COMMON_PATTERNS) {
    const score = calculatePatternScore(components, pattern);

    if (score > 0.7) {
      matches.push({
        pattern: pattern.name,
        confidence: score,
        missingComponents: findMissingComponents(components, pattern),
        suggestions: generatePatternSuggestions(components, pattern),
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}
```

## Error Handling for AI Systems

### Structured Error Messages

```typescript
interface AIFriendlyError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  component?: string;
  property?: string;
  suggestedFix?: string;
  relatedDocumentation?: string;
  examples?: string[];
}

const ERROR_CODES = {
  // Component errors
  COMPONENT_NOT_FOUND: 'The specified component does not exist',
  INVALID_PROP_TYPE: 'Property type does not match expected type',
  MISSING_REQUIRED_PROP: 'Required property is missing',

  // Norwegian compliance errors
  INVALID_PERSONAL_NUMBER: 'Personal number format is invalid',
  INVALID_ORGANIZATION_NUMBER: 'Organization number format is invalid',
  INVALID_CLASSIFICATION: 'Security classification is not valid',
  MISSING_NORWEGIAN_CONFIG: 'Norwegian compliance configuration required',

  // Accessibility errors
  INSUFFICIENT_COLOR_CONTRAST: 'Color contrast does not meet WCAG requirements',
  MISSING_ARIA_LABEL: 'Interactive element missing accessibility label',
  INVALID_TAB_ORDER: 'Tab order is not logical',

  // Layout errors
  INVALID_NESTING: 'Component nesting is not valid',
  RESPONSIVE_BREAKPOINT_CONFLICT: 'Responsive breakpoints conflict',
} as const;
```

### Error Recovery Suggestions

```typescript
function generateErrorRecovery(error: AIFriendlyError): ErrorRecovery {
  switch (error.code) {
    case 'MISSING_REQUIRED_PROP':
      return {
        action: 'add_property',
        property: error.property,
        suggestedValue: getDefaultValue(error.component, error.property),
        example: `${error.property}="${getDefaultValue(error.component, error.property)}"`,
      };

    case 'INVALID_PERSONAL_NUMBER':
      return {
        action: 'fix_validation',
        component: 'PersonalNumberInput',
        fix: 'Use PersonalNumberInput component with built-in validation',
        example: '<PersonalNumberInput validation={{ personalNumber: true }} />',
      };

    case 'INSUFFICIENT_COLOR_CONTRAST':
      return {
        action: 'use_design_tokens',
        fix: 'Use design token colors that meet WCAG requirements',
        example: 'Use variant="primary" instead of custom colors',
      };

    default:
      return {
        action: 'check_documentation',
        documentation: `docs/components/${getComponentCategory(error.component)}.md`,
      };
  }
}
```

## Testing Integration for AI

### Automated Test Generation

```typescript
interface TestGenerationConfig {
  component: string;
  props: Record<string, unknown>;
  interactions: InteractionTest[];
  accessibility: boolean;
  norwegianCompliance: boolean;
}

function generateComponentTest(config: TestGenerationConfig): string {
  const testTemplate = `
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from '@testing-library/jest-axe';
import { ${config.component} } from '@xala-technologies/ui-system';

describe('${config.component} Component', () => {
  ${
    config.accessibility
      ? `
  it('should meet WCAG 2.2 AAA accessibility standards', async () => {
    const { container } = render(
      <${config.component} ${formatProps(config.props)}>
        Test Content
      </${config.component}>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  `
      : ''
  }
  
  ${
    config.norwegianCompliance
      ? `
  it('should handle Norwegian compliance features', () => {
    render(
      <${config.component} 
        ${formatProps(config.props)}
        norwegian={{ classification: 'ÅPEN' }}
      >
        Test Content
      </${config.component}>
    );
    
    // Add Norwegian compliance specific tests
  });
  `
      : ''
  }
  
  ${config.interactions.map(interaction => generateInteractionTest(interaction)).join('\n  ')}
});`;

  return testTemplate;
}
```

### Test Data Generation

```typescript
interface TestDataGenerator {
  // Generate valid Norwegian personal numbers
  generatePersonalNumber(options?: { age?: number; gender?: 'M' | 'F' }): string;

  // Generate valid organization numbers
  generateOrganizationNumber(options?: { municipality?: string }): string;

  // Generate accessibility test data
  generateAccessibilityTestData(component: string): AccessibilityTestData;

  // Generate form test data
  generateFormTestData(fields: FormField[]): Record<string, unknown>;
}

const testDataGenerator: TestDataGenerator = {
  generatePersonalNumber: (options = {}) => {
    // Generate valid Norwegian personal number with MOD11 check
    const birthDate = generateBirthDate(options.age);
    const individualNumber = generateIndividualNumber(options.gender);
    const checkDigits = calculateMod11(birthDate + individualNumber);

    return birthDate + individualNumber + checkDigits;
  },

  generateOrganizationNumber: (options = {}) => {
    // Generate valid Norwegian organization number
    const baseNumber = generateBaseOrgNumber(options.municipality);
    const checkDigit = calculateMod11OrgNumber(baseNumber);

    return baseNumber + checkDigit;
  },

  generateAccessibilityTestData: component => {
    return {
      ariaLabels: generateAriaLabels(component),
      colorCombinations: generateWCAGCompliantColors(),
      focusTargets: generateFocusTargets(component),
      keyboardInteractions: generateKeyboardTests(component),
    };
  },

  generateFormTestData: fields => {
    const data: Record<string, unknown> = {};

    fields.forEach(field => {
      switch (field.type) {
        case 'personalNumber':
          data[field.name] = testDataGenerator.generatePersonalNumber();
          break;
        case 'organizationNumber':
          data[field.name] = testDataGenerator.generateOrganizationNumber();
          break;
        case 'email':
          data[field.name] = generateEmail();
          break;
        default:
          data[field.name] = generateGenericTestData(field.type);
      }
    });

    return data;
  },
};
```

## MCP Server Integration

### Component Information Protocol

```typescript
interface MCPComponentProtocol {
  // Get component schema
  getComponentSchema(name: string): Promise<ComponentSchema>;

  // List all components
  listComponents(filter?: ComponentFilter): Promise<ComponentSchema[]>;

  // Validate component usage
  validateComponent(name: string, props: Record<string, unknown>): Promise<ValidationResult>;

  // Generate component code
  generateComponent(config: ComponentGenerationConfig): Promise<string>;

  // Get usage examples
  getUsageExamples(name: string, context?: string): Promise<UsageExample[]>;
}
```

### Protocol Messages

```typescript
// Request component information
interface GetComponentRequest {
  method: 'component/get';
  params: {
    name: string;
    includeExamples?: boolean;
    includeTests?: boolean;
  };
}

// Response with component information
interface GetComponentResponse {
  result: {
    schema: ComponentSchema;
    examples?: UsageExample[];
    tests?: TestCase[];
    relatedComponents?: string[];
  };
}

// Generate component code
interface GenerateComponentRequest {
  method: 'component/generate';
  params: {
    component: string;
    props: Record<string, unknown>;
    pattern?: string;
    format?: 'tsx' | 'jsx';
  };
}

interface GenerateComponentResponse {
  result: {
    code: string;
    imports: string[];
    dependencies?: string[];
    tests?: string;
  };
}
```

## Autonomous Agent Guidelines

### Decision Making Framework

```typescript
interface ComponentDecisionFramework {
  // Analyze requirements
  analyzeRequirements(requirements: string[]): ComponentRecommendation[];

  // Select best component
  selectComponent(recommendations: ComponentRecommendation[]): ComponentSelection;

  // Configure component
  configureComponent(selection: ComponentSelection, context: Context): ComponentConfiguration;

  // Validate configuration
  validateConfiguration(config: ComponentConfiguration): ValidationResult;
}

interface ComponentRecommendation {
  component: string;
  confidence: number;
  reasoning: string[];
  alternatives: string[];
  constraints: string[];
}
```

### Context-Aware Component Selection

```typescript
function selectComponentForContext(context: DevelopmentContext): ComponentSelection {
  const factors = [
    analyzeUserRequirements(context.requirements),
    analyzeNorwegianCompliance(context.compliance),
    analyzeAccessibilityNeeds(context.accessibility),
    analyzePerformanceConstraints(context.performance),
    analyzeBrandingRequirements(context.branding),
  ];

  const scored = scoreComponents(getAllComponents(), factors);

  return {
    primary: scored[0],
    alternatives: scored.slice(1, 3),
    reasoning: generateSelectionReasoning(scored[0], factors),
  };
}
```

### Code Quality Assurance

```typescript
interface QualityAssuranceRules {
  // Norwegian compliance checks
  norwegianCompliance: {
    personalDataHandling: boolean;
    classificationLevels: boolean;
    auditRequirements: boolean;
    municipalBranding: boolean;
  };

  // Accessibility requirements
  accessibility: {
    wcagCompliance: 'AA' | 'AAA';
    keyboardNavigation: boolean;
    screenReaderSupport: boolean;
    colorContrast: boolean;
  };

  // Code quality standards
  codeQuality: {
    typeScript: boolean;
    noInlineStyles: boolean;
    designTokens: boolean;
    properTesting: boolean;
  };
}

function validateGeneratedCode(code: string, rules: QualityAssuranceRules): QualityReport {
  const issues: QualityIssue[] = [];

  // Check for inline styles
  if (rules.codeQuality.noInlineStyles && hasInlineStyles(code)) {
    issues.push({
      type: 'error',
      code: 'INLINE_STYLES_FORBIDDEN',
      message: 'Use design tokens instead of inline styles',
      fix: 'Replace style={{ }} with className or design token props',
    });
  }

  // Check Norwegian compliance
  if (rules.norwegianCompliance.personalDataHandling && hasPersonalData(code)) {
    if (!hasNorwegianValidation(code)) {
      issues.push({
        type: 'error',
        code: 'MISSING_NORWEGIAN_VALIDATION',
        message: 'Personal data components must use Norwegian validation',
        fix: 'Add validation={{ personalNumber: true }} or use PersonalNumberInput',
      });
    }
  }

  return {
    passed: issues.filter(i => i.type === 'error').length === 0,
    issues,
    score: calculateQualityScore(issues),
  };
}
```

## Documentation AI Integration

### Structured Documentation Format

```typescript
interface DocumentationNode {
  id: string;
  type: 'component' | 'pattern' | 'guide' | 'example';
  title: string;
  description: string;
  content: string;
  metadata: DocumentationMetadata;
  relationships: DocumentationRelationship[];
  searchTerms: string[];
}

interface DocumentationMetadata {
  lastUpdated: Date;
  version: string;
  completeness: number; // 0-1
  examples: number;
  codeBlocks: number;
  accessibility: boolean;
  norwegianCompliance: boolean;
}
```

### AI-Readable Examples

```typescript
interface AIExample {
  id: string;
  title: string;
  description: string;
  code: string;
  language: 'tsx' | 'typescript' | 'css';
  category: 'basic' | 'advanced' | 'norwegian' | 'accessibility';
  dependencies: string[];
  explanation: string;
  relatedExamples: string[];
}

const BUTTON_EXAMPLES: AIExample[] = [
  {
    id: 'button-basic',
    title: 'Basic Button Usage',
    description: 'Simple button with primary variant',
    code: '<Button variant="primary">Save</Button>',
    language: 'tsx',
    category: 'basic',
    dependencies: ['@xala-technologies/ui-system'],
    explanation: 'Creates a primary button with default medium size',
    relatedExamples: ['button-sizes', 'button-variants'],
  },

  {
    id: 'button-norwegian-classified',
    title: 'Norwegian Classified Button',
    description: 'Button with security classification',
    code: `<Button 
  variant="primary"
  norwegian={{ 
    classification: 'KONFIDENSIELT',
    requiresConfirmation: true 
  }}
>
  Delete Classified Data
</Button>`,
    language: 'tsx',
    category: 'norwegian',
    dependencies: ['@xala-technologies/ui-system'],
    explanation: 'Button with KONFIDENSIELT classification requiring user confirmation',
    relatedExamples: ['button-confirmation', 'norwegian-compliance'],
  },
];
```

This comprehensive AI integration guide ensures that MCP servers, autonomous agents, and other AI tools can effectively understand, generate, and work with the Xala UI System components while maintaining Norwegian compliance and accessibility standards.

---

**Next**: Explore [API Reference](./api-reference.md) for complete component APIs and types.
