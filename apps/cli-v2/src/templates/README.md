# CLI v2 Template System

This directory contains the external template files for the Xaheen CLI v2 service injection system. Templates are organized by service category and type for better maintainability and reusability.

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

## Contributing

When adding new templates:

1. Follow the established directory structure
2. Use consistent naming conventions
3. Add comprehensive documentation
4. Test with multiple configurations
5. Update the template registry
6. Add examples and usage instructions