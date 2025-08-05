# Templates Module - Advanced Template System

## Overview

The Templates module is the comprehensive template management system of the Xaheen CLI. It provides a sophisticated, extensible template engine that supports multi-platform code generation, Norwegian compliance, accessibility validation, and intelligent template composition. The system manages 20+ template categories with specialized templates for different frameworks, patterns, and compliance requirements.

## Architecture

The templates module follows a hierarchical, domain-driven architecture:

- **Template Engine**: Handlebars-based processing with custom helpers
- **Template Registry**: Dynamic template discovery and management
- **Template Loader**: Efficient loading and caching system
- **Validation Layer**: Template syntax and compliance validation
- **Composition System**: Complex template composition and inheritance
- **Modernization Engine**: Automatic template updates and migrations

## Directory Structure

```
templates/
├── ai/                     # AI Integration Services
│   ├── files/             # TypeScript implementation files
│   ├── components/        # React/UI components
│   └── configs/           # Configuration files
├── ai-chatbot/            # AI Chatbot Services
│   ├── files/             # Client libraries and utilities
│   ├── components/        # Chat UI components
│   └── configs/           # Chatbot configurations
├── vector-database/       # Vector Database Services
│   ├── files/             # Database client implementations
│   └── configs/           # Database configurations
├── ai-observability/      # AI Observability Services
│   ├── files/             # Monitoring and logging clients
│   └── configs/           # Observability configurations
├── frontend/              # Frontend Framework Services
│   ├── components/        # UI components and providers
│   ├── files/             # Utility functions and hooks
│   └── configs/           # Framework configurations
├── backend/               # Backend Framework Services
│   ├── files/             # Server implementations
│   └── configs/           # Server configurations
├── database/              # Database Services
│   ├── files/             # Database clients and schemas
│   └── configs/           # Database configurations
├── auth/                  # Authentication Services
│   ├── files/             # Auth implementations
│   ├── components/        # Auth UI components
│   └── configs/           # Auth configurations
├── api/                   # API Services (tRPC, GraphQL, REST)
│   ├── files/             # API implementations
│   ├── components/        # API client components
│   └── configs/           # API configurations
├── testing/               # Testing Framework Services
│   ├── files/             # Test utilities and setup
│   └── configs/           # Testing configurations
├── deployment/            # Deployment Services
│   ├── files/             # Deployment scripts
│   └── configs/           # Deployment configurations
├── monitoring/            # Monitoring Services
│   ├── files/             # Monitoring implementations
│   └── configs/           # Monitoring configurations
├── analytics/             # Analytics Services
│   ├── files/             # Analytics implementations
│   ├── components/        # Analytics UI components
│   └── configs/           # Analytics configurations
└── shared/                # Shared Templates
    ├── utils/             # Common utility functions
    ├── types/             # Shared TypeScript types
    ├── hooks/             # Reusable React hooks
    └── constants/         # Shared constants
```

## Template File Types

### Files (`files/`)
- TypeScript implementation files
- Client libraries and SDKs
- Utility functions and helpers
- Database schemas and migrations
- API route handlers

### Components (`components/`)
- React components
- UI widgets and providers
- Form components
- Layout components

### Configs (`configs/`)
- Configuration files (JSON, YAML, etc.)
- Environment setups
- Build configurations
- Service configurations

## Template Syntax

Templates use Handlebars syntax with custom helpers for enhanced functionality:

### Basic Variables
```handlebars
{{variableName}}
{{config.setting}}
{{service.provider}}
```

### Conditionals
```handlebars
{{#if condition}}
  Content when true
{{else}}
  Content when false
{{/if}}

{{#unless condition}}
  Content when false
{{/unless}}
```

### Loops
```handlebars
{{#each items}}
  Item: {{this}}
  Index: {{@index}}
{{/each}}
```

### Custom Helpers

#### String Helpers
```handlebars
{{capitalize "hello world"}}     → "Hello world"
{{uppercase "hello"}}            → "HELLO"
{{lowercase "HELLO"}}            → "hello"
{{camelCase "hello-world"}}      → "helloWorld"
{{kebabCase "HelloWorld"}}       → "hello-world"
{{snakeCase "HelloWorld"}}       → "hello_world"
```

#### Comparison Helpers
```handlebars
{{#if (eq framework "react")}}
  React-specific content
{{/if}}

{{#if (gt version 2)}}
  Version is greater than 2
{{/if}}
```

#### Framework Helpers
```handlebars
{{#if (isFramework framework "next")}}
  Next.js specific content
{{/if}}

{{#if (hasFeature features "typescript")}}
  TypeScript configuration
{{/if}}
```

#### JSON Helpers
```handlebars
{{json object spaces=2}}
{{jsonPretty configuration}}
```

## Template Context

Templates receive a context object with the following structure:

```typescript
interface TemplateContext {
  // Project information
  projectName: string;
  projectPath: string;
  framework: string;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  
  // Service configuration
  service: {
    name: string;
    type: string;
    provider: string;
    version: string;
  };
  
  // Service-specific configuration
  config: {
    // Dynamic configuration based on service
    [key: string]: any;
  };
  
  // Features and capabilities
  features: string[];
  capabilities: string[];
  
  // Environment
  environment: 'development' | 'production' | 'test';
  nodeVersion: string;
}
```

## Creating New Templates

### 1. Create Template File
```bash
# Create directory structure
mkdir -p src/templates/your-service/files

# Create template file
touch src/templates/your-service/files/your-template.hbs
```

### 2. Write Template Content
```handlebars
// your-template.hbs
import { {{capitalize serviceName}} } from '{{package}}';

export const {{camelCase serviceName}}Client = new {{capitalize serviceName}}({
  {{#if config.apiKey}}
  apiKey: process.env.{{uppercase serviceName}}_API_KEY,
  {{/if}}
  {{#if config.baseUrl}}
  baseUrl: '{{config.baseUrl}}',
  {{/if}}
});

{{#if includeHelpers}}
export async function {{camelCase serviceName}}Helper() {
  // Helper implementation
}
{{/if}}
```

### 3. Register in Template Registry
```typescript
// template-registry.ts
{
  serviceType: 'your-service',
  provider: 'your-provider',
  templates: {
    'client': 'your-service/files/your-template.hbs'
  }
}
```

### 4. Update Service Definition
```typescript
// service-registry.ts
{
  name: 'your-service',
  type: 'your-service',
  provider: 'your-provider',
  injectionPoints: [
    {
      type: 'file-create',
      target: 'src/lib/your-service.ts',
      template: 'your-service/files/your-template.hbs',
      priority: 80
    }
  ]
}
```

## Template Loading

The `TemplateLoader` class handles loading and caching of templates:

```typescript
import { templateLoader } from '../services/templates/template-loader.js';

// Load a template
const template = await templateLoader.loadTemplate('ai/files/openai.hbs');

// Render with context
const rendered = await templateLoader.renderTemplate(
  'ai/files/openai.hbs',
  { service, config, projectName: 'my-app' }
);

// Validate template syntax
const validation = await templateLoader.validateTemplate('ai/files/openai.hbs');
```

## Best Practices

### Template Organization
- Group related templates by service category
- Use descriptive file names
- Keep templates focused and single-purpose
- Extract common patterns to shared templates

### Template Content
- Use semantic variable names
- Add comments explaining complex logic
- Provide fallbacks for optional features
- Keep generated code clean and well-formatted

### Error Handling
- Use conditionals to handle missing variables
- Provide meaningful error messages
- Test templates with various configurations
- Validate template syntax before deployment

### Performance
- Templates are cached after first load
- Use pre-loading for commonly used templates
- Keep template complexity reasonable
- Avoid deeply nested conditionals

## Migration from Inline Templates

To migrate from inline templates to external files:

1. **Extract Template Content**
   ```typescript
   // Before (inline)
   template: `import { Service } from 'service';...`
   
   // After (external)
   template: 'service/files/service-client.hbs'
   ```

2. **Create Template File**
   ```bash
   echo "template content" > src/templates/service/files/service-client.hbs
   ```

3. **Update Service Registry**
   ```typescript
   // Replace template string with file path
   template: 'service/files/service-client.hbs'
   ```

4. **Test Migration**
   ```bash
   # Generate project and verify output
   npm run cli create test-project --service your-service
   ```

## Debugging Templates

### Template Validation
```typescript
const result = await templateLoader.validateTemplate('path/to/template.hbs');
if (!result.valid) {
  console.error('Template error:', result.error);
}
```

### Context Debugging
```handlebars
<!-- Add to template for debugging -->
<!-- Context: {{json this}} -->
```

### Generated Output
```bash
# Check generated files
cat generated-project/src/lib/service.ts
```

## Advanced Template Features

### Template Inheritance

Templates support inheritance for complex composition:

```handlebars
{{!-- base-component.hbs --}}
{{> base-imports}}

export const {{pascalCase name}} = (props: {{pascalCase name}}Props) => {
  {{#block "component-logic"}}
  // Default logic
  {{/block}}

  return (
    <div className="{{#block "base-classes"}}base-component{{/block}}">
      {{#block "component-content"}}
      <p>Default content</p>
      {{/block}}
    </div>
  );
};
```

```handlebars
{{!-- button-component.hbs --}}
{{#extend "base-component"}}
  {{#content "component-logic"}}
  const handleClick = () => {
    onClick?.(props);
  };
  {{/content}}

  {{#content "base-classes"}}btn btn-primary{{/content}}

  {{#content "component-content"}}
  <button onClick={handleClick}>
    {{children}}
  </button>
  {{/content}}
{{/extend}}
```

### Norwegian Compliance Templates

Templates with built-in Norwegian regulatory compliance:

```handlebars
{{!-- norwegian-form.hbs --}}
{{> norwegian-compliance-header}}

export const {{pascalCase name}}Form = () => {
  {{#norwegianCompliance}}
  const auditLogger = useAuditLogger({
    classification: '{{dataClassification}}',
    purpose: 'user-input-collection'
  });
  {{/norwegianCompliance}}

  return (
    <Form
      {{#if gdprCompliant}}
      gdprCompliant
      consentRequired
      {{/if}}
      {{#if nsmCompliant}}
      dataClassification="{{dataClassification}}"
      auditTrail={auditLogger}
      {{/if}}
    >
      {{> form-fields}}
    </Form>
  );
};
```

### Multi-Platform Templates

Single template generating for multiple platforms:

```handlebars
{{!-- multi-platform-component.hbs --}}
{{#ifPlatform "react"}}
import React from 'react';

export const {{pascalCase name}}: React.FC<Props> = ({ children }) => {
  return <div className="{{kebabCase name}}">{children}</div>;
};
{{/ifPlatform}}

{{#ifPlatform "vue"}}
<template>
  <div class="{{kebabCase name}}">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  // Props definition
}
</script>
{{/ifPlatform}}

{{#ifPlatform "angular"}}
@Component({
  selector: 'app-{{kebabCase name}}',
  template: `<div class="{{kebabCase name}}"><ng-content></ng-content></div>`
})
export class {{pascalCase name}}Component {
  // Component logic
}
{{/ifPlatform}}
```

### AI-Enhanced Templates

Templates that leverage AI for intelligent generation:

```handlebars
{{!-- ai-enhanced-component.hbs --}}
{{> ai-analysis-comment}}

{{#ai-optimize codeContext}}
export const {{pascalCase name}} = memo((props: {{pascalCase name}}Props) => {
  {{#ai-suggest-hooks props}}
  const [state, setState] = useState({{ai-infer-initial-state props}});
  {{/ai-suggest-hooks}}

  {{#ai-performance-optimizations}}
  const memoizedValue = useMemo(() => {
    return computeExpensiveValue(props.data);
  }, [props.data]);
  {{/ai-performance-optimizations}}

  return (
    {{#ai-generate-jsx props}}
    <div className="{{ai-suggest-styles name props}}">
      {/* AI-generated component structure */}
    </div>
    {{/ai-generate-jsx}}
  );
});
{{/ai-optimize}}
```

## Template Composition System

### Composition Engine

```typescript
export class TemplateComposer {
  private compositions = new Map<string, CompositionRule[]>();

  async compose(
    baseTemplate: string,
    compositions: CompositionRule[]
  ): Promise<CompiledTemplate> {
    let template = await this.loadTemplate(baseTemplate);
    
    for (const rule of compositions) {
      template = await this.applyComposition(template, rule);
    }

    return this.compile(template);
  }

  private async applyComposition(
    template: string,
    rule: CompositionRule
  ): Promise<string> {
    switch (rule.type) {
      case 'extend':
        return this.extendTemplate(template, rule);
      case 'include':
        return this.includePartial(template, rule);
      case 'merge':
        return this.mergeTemplates(template, rule);
      default:
        return template;
    }
  }
}
```

### Template Modernization

Automatic template updates and modernization:

```typescript
export class TemplateModernizer {
  private modernizationRules: ModernizationRule[] = [
    {
      name: 'react-hooks-upgrade',
      pattern: /class\s+(\w+)\s+extends\s+React\.Component/g,
      replacement: 'const $1 = () => {',
      description: 'Convert class components to functional components'
    },
    {
      name: 'typescript-strict',
      pattern: /:\s*any\b/g,
      replacement: ': unknown',
      description: 'Replace any types with unknown'
    }
  ];

  async modernizeTemplate(templatePath: string): Promise<ModernizationResult> {
    const template = await this.loadTemplate(templatePath);
    let modernizedTemplate = template;
    const appliedRules: string[] = [];

    for (const rule of this.modernizationRules) {
      if (rule.pattern.test(modernizedTemplate)) {
        modernizedTemplate = modernizedTemplate.replace(rule.pattern, rule.replacement);
        appliedRules.push(rule.name);
      }
    }

    return {
      original: template,
      modernized: modernizedTemplate,
      appliedRules,
      success: appliedRules.length > 0
    };
  }
}
```

## Performance Optimization

### Template Caching

```typescript
export class TemplateCache {
  private compiledCache = new Map<string, CompiledTemplate>();
  private sourceCache = new Map<string, string>();
  private lastModified = new Map<string, number>();

  async getCompiledTemplate(path: string): Promise<CompiledTemplate> {
    const modTime = await this.getModificationTime(path);
    const cachedTime = this.lastModified.get(path);

    if (cachedTime && modTime <= cachedTime && this.compiledCache.has(path)) {
      return this.compiledCache.get(path)!;
    }

    const source = await this.loadTemplateSource(path);
    const compiled = this.compileTemplate(source);
    
    this.compiledCache.set(path, compiled);
    this.sourceCache.set(path, source);
    this.lastModified.set(path, modTime);

    return compiled;
  }
}
```

### Parallel Template Processing

```typescript
export class ParallelTemplateProcessor {
  private maxConcurrency = 4;

  async processTemplates(
    templates: TemplateProcessingJob[]
  ): Promise<ProcessingResult[]> {
    const chunks = this.chunkTemplates(templates, this.maxConcurrency);
    const results: ProcessingResult[] = [];

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(job => this.processTemplate(job))
      );
      results.push(...chunkResults);
    }

    return results;
  }

  private async processTemplate(job: TemplateProcessingJob): Promise<ProcessingResult> {
    try {
      const template = await this.loadTemplate(job.templatePath);
      const rendered = await this.renderTemplate(template, job.context);
      const validated = await this.validateOutput(rendered);

      return {
        job,
        success: true,
        output: rendered,
        validation: validated
      };
    } catch (error) {
      return {
        job,
        success: false,
        error: error.message
      };
    }
  }
}
```

## Security and Validation

### Template Security

```typescript
export class TemplateSecurityValidator {
  private securityRules: SecurityRule[] = [
    {
      name: 'no-eval',
      pattern: /eval\s*\(/g,
      severity: 'critical',
      message: 'eval() usage is not allowed in templates'
    },
    {
      name: 'no-process-access',
      pattern: /process\.(env|argv|exit)/g,
      severity: 'high',
      message: 'Direct process access is restricted'
    }
  ];

  validateTemplate(template: string): SecurityValidationResult {
    const violations: SecurityViolation[] = [];

    for (const rule of this.securityRules) {
      const matches = Array.from(template.matchAll(rule.pattern));
      
      for (const match of matches) {
        violations.push({
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          line: this.getLineNumber(template, match.index!),
          column: this.getColumnNumber(template, match.index!)
        });
      }
    }

    return {
      secure: violations.length === 0,
      violations,
      criticalCount: violations.filter(v => v.severity === 'critical').length
    };
  }
}
```

### Accessibility Validation

```typescript
export class AccessibilityValidator {
  private accessibilityRules: A11yRule[] = [
    {
      name: 'alt-text-required',
      pattern: /<img(?![^>]*alt=)/g,
      message: 'Images must have alt text for accessibility'
    },
    {
      name: 'button-accessible-name',
      pattern: /<button(?![^>]*aria-label)(?![^>]*>.*\w.*<\/button>)/g,
      message: 'Buttons must have accessible names'
    }
  ];

  validateAccessibility(template: string): A11yValidationResult {
    const issues: A11yIssue[] = [];

    for (const rule of this.accessibilityRules) {
      const matches = Array.from(template.matchAll(rule.pattern));
      
      for (const match of matches) {
        issues.push({
          rule: rule.name,
          message: rule.message,
          line: this.getLineNumber(template, match.index!),
          severity: 'warning'
        });
      }
    }

    return {
      accessible: issues.length === 0,
      issues,
      score: this.calculateA11yScore(issues)
    };
  }
}
```

## Testing Templates

### Template Testing Framework

```typescript
export class TemplateTestRunner {
  async testTemplate(
    templatePath: string,
    testCases: TemplateTestCase[]
  ): Promise<TemplateTestResult> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
      try {
        const rendered = await this.renderTemplate(templatePath, testCase.context);
        const assertions = await this.runAssertions(rendered, testCase.assertions);
        
        results.push({
          name: testCase.name,
          success: assertions.every(a => a.passed),
          assertions,
          output: rendered
        });
      } catch (error) {
        results.push({
          name: testCase.name,
          success: false,
          error: error.message,
          output: null
        });
      }
    }

    return {
      templatePath,
      totalTests: testCases.length,
      passedTests: results.filter(r => r.success).length,
      results
    };
  }
}
```

### Test Case Examples

```typescript
const templateTests: TemplateTestCase[] = [
  {
    name: 'React component with TypeScript',
    context: {
      name: 'TestComponent',
      platform: 'react',
      typescript: true,
      props: ['title', 'onClick']
    },
    assertions: [
      { type: 'contains', value: 'export const TestComponent' },
      { type: 'contains', value: 'interface TestComponentProps' },
      { type: 'contains', value: 'title: string' },
      { type: 'not-contains', value: 'any' }
    ]
  }
];
```

## Contributing

### Template Development Guidelines

1. **Consistency**: Follow established naming conventions and patterns
2. **Documentation**: Document all template variables and usage
3. **Testing**: Write comprehensive test cases for all scenarios
4. **Security**: Validate templates for security vulnerabilities
5. **Accessibility**: Ensure generated code meets accessibility standards
6. **Performance**: Optimize templates for rendering performance
7. **Maintainability**: Keep templates modular and reusable

### Adding New Template Categories

```typescript
// 1. Create directory structure
mkdir -p src/templates/new-category/{files,components,configs}

// 2. Create base templates
touch src/templates/new-category/files/base.hbs

// 3. Register in template registry
const newCategoryRegistry = {
  category: 'new-category',
  templates: {
    'base': 'new-category/files/base.hbs'
  },
  metadata: {
    description: 'New category templates',
    version: '1.0.0',
    author: 'Your Name'
  }
};

// 4. Add tests
const tests: TemplateTestCase[] = [
  // Test cases
];
```

### Template Validation Pipeline

```typescript
export class TemplateValidationPipeline {
  private validators: TemplateValidator[] = [
    new SyntaxValidator(),
    new SecurityValidator(),
    new AccessibilityValidator(),
    new PerformanceValidator(),
    new ComplianceValidator()
  ];

  async validateTemplate(templatePath: string): Promise<ValidationReport> {
    const results = await Promise.all(
      this.validators.map(validator => validator.validate(templatePath))
    );

    return {
      templatePath,
      overall: results.every(r => r.valid),
      results,
      recommendations: this.generateRecommendations(results)
    };
  }
}
```

## Future Enhancements

- **AI Template Generation**: AI-powered template creation and optimization
- **Real-time Collaboration**: Collaborative template editing
- **Template Marketplace**: Community template sharing platform
- **Version Control**: Template versioning and rollback capabilities
- **Performance Analytics**: Template usage and performance monitoring
- **Custom Validators**: User-defined validation rules and plugins